const express = require("express");
const router = express.Router();
const path = require("path");
const adminAuth = require("../adminController/adminAuth");
const adminControl = require("../adminController/adminControl");
const Category = require("../models/categoryModel");
const preventBackButtonBeforeLogout = require("../middleware/adminAuthMiddleware");
const MyOrder = require("../models/OrderSchema");
const Products = require("../models/productModel");

const isAdminAuthenticated = (req, res, next) => {
  if (req.session.isAdminAuthenticated || req.path === "/adminLogin") {
    return next();
  } else {
    res.redirect("/adminLogin");
  }
};

router.use(isAdminAuthenticated);

//adminLogin
router.get(
  "/adminLogin",
  preventBackButtonBeforeLogout,
  async (req, res, next) => {
    try {
      res.render(path.join("adminEjs", "adminLogin"));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.post("/adminLogin", adminAuth.adminLogin);

router.get(
  "/adminDash",
  preventBackButtonBeforeLogout,
  async (req, res, next) => {
    try {
      console.log("adminDash is triggering");
      const totalUsersCount = await adminControl.getTotalUsersCount();
      const totalProductsCount = await adminControl.getTotalProductsCount();

      const { page = 1, limit = 10 } = req.query;

      const orders = await MyOrder.find()
        .populate("products.productId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const totalOrdersCount = await MyOrder.countDocuments();

      let totalSales = 0;
      orders.forEach((order) => {
        order.products.forEach((product) => {
          if (!product.cancelled && product.status === "Delivered") {
            totalSales += product.discountedPrice;
          }
        });
      });

      const topSellingProducts = await MyOrder.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: { totalOrders: -1 },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            name: "$product.name",
            totalOrders: 1,
          },
        },
      ]);

      const topSellingCategories = await MyOrder.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            totalOrders: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalOrders: { $sum: "$totalOrders" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $project: {
            categoryName: "$category.name",
            totalOrders: 1,
          },
        },
        {
          $sort: { totalOrders: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      const topSellingBrands = await MyOrder.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            totalOrders: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.brandName",
            totalOrders: { $sum: "$totalOrders" },
          },
        },
        {
          $sort: { totalOrders: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      res.render(path.join("adminEjs", "adminDash"), {
        totalUsersCount,
        totalProductsCount,
        totalOrdersCount,
        orders,
        totalSales,
        topSellingProducts,
        topSellingCategories,
        topSellingBrands,
        totalPages: Math.ceil(totalOrdersCount / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit), // Pass limit to the template
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

// dash board filtering
router.post("/filterOrders", async (req, res) => {
  try {
    const { startDate, endDate, range } = req.body;

    let filter = {};
    let start, end;

    // Handle predefined date ranges
    if (range) {
      const today = new Date();
      if (range === "today") {
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
      } else if (range === "yesterday") {
        start = new Date(today.setDate(today.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(today.setHours(23, 59, 59, 999));
      } else if (range === "last7days") {
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
      } else if (range === "last30days") {
        start = new Date(today.setDate(today.getDate() - 30));
        end = new Date();
      }
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      filter = {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      };
    }

    const orders = await MyOrder.find(filter).populate("products.productId");

    res.json(orders);
  } catch (err) {
    console.error("Error fetching filtered orders:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/orderCountByDate", adminControl.orderCounts);

router.get("/admin/dashboard/ordersData", adminControl.dashboardOrdersData);

//userManagement
// router.get("/userManagement", async (req, res) => {
//   try {
//     const allUsers = await adminControl.getUserManagementData();

//     // Render the userManagement EJS template with users
//     res.render(path.join("adminEjs", "userManagement"), {
//       users: allUsers,
//     });
//   } catch (err) {
//     console.error("Error fetching user management data:", err);
//     res.status(500).send("Internal Server Error");
//   }
// });

router.get(
  "/userManagement",
  preventBackButtonBeforeLogout,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalUsers = await adminControl.countUsers();
      const allUsers = await adminControl.getUserManagementData(skip, limit);

      const totalPages = Math.ceil(totalUsers / limit);

      res.render(path.join("adminEjs", "userManagement"), {
        users: allUsers,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
      });
    } catch (err) {
      console.error("Error fetching user management data:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/admin/user/:userId",
  preventBackButtonBeforeLogout,
  async (req, res) => {
    try {
      // Retrieve the userId from the request parameters
      const userId = req.params.userId;

      // Fetch user details based on userId
      const userDetails = await adminControl.getUserDetails(userId);

      // Render the user details EJS template with the retrieved details
      res.render("adminEjs/user", { user: userDetails });
    } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

//admin blockUser
router.post("/block", adminControl.blockUser);

// admin productManagement
router.get(
  "/productManagement",
  preventBackButtonBeforeLogout,
  adminControl.getProductManagementPage
);
// Route to view product details
router.get(
  "/admin/productDetails/:productId",
  preventBackButtonBeforeLogout,
  adminControl.getProductDetails
);
// Route to list/unlist a product
router.post("/admin/product/:productId", adminControl.toggleProductListStatus);
//product edit
router.get(
  "/admin/productEdit/:productId",
  preventBackButtonBeforeLogout,
  adminControl.getProductEditPage
);
// product edit form submission
const uploadMiddleware = require("../utils/multer");
router.post(
  "/admin/updateProductDetails/:productId",
  adminControl.updateProductDetails
);
router.post(
  "/admin/updateProductImages/:productId",
  uploadMiddleware,
  adminControl.updateProductImages
);

// admin categoryManagement
router.get(
  "/categoryManagement",
  preventBackButtonBeforeLogout,
  adminControl.renderCategoryManagement
);

router.get("/addCategory", preventBackButtonBeforeLogout, (req, res) => {
  res.render(path.join("adminEjs", "addCategory"));
});
//add new category
router.post("/categories", adminControl.createCategory);
// Route to list/unlist a category
router.post("/admin/category/:categoryId", adminControl.listUnlistCategory);
//category details
router.get(
  "/admin/categoryDetails/:categoryId",
  preventBackButtonBeforeLogout,
  adminControl.CategoryDetails
);
// Route to render the edit category form
router.get(
  "/editCategory/:categoryId",
  preventBackButtonBeforeLogout,
  adminControl.renderEditCategoryForm
);
//update category
router.post("/admin/updateCategory/:categoryId", adminControl.updateCategory);

//product
// admin addProduct
router.get("/addProduct", preventBackButtonBeforeLogout, async (req, res) => {
  try {
    const categories = await Category.find({}, "name"); // Assuming you only need category names

    res.render("adminEjs/addProduct", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/product", adminControl.createProduct);

router.get(
  "/oderManagement",
  preventBackButtonBeforeLogout,
  adminControl.renderOderManagement
);

router.get(
  "/viewOrderedDetails/:orderId/:productId",
  preventBackButtonBeforeLogout,
  adminControl.viewOrderedDetails
);

// router.get("/admin/remove_Order/:orderId", adminControl.cancel_order);
router.get(
  "/admin/remove_Order/:orderId/:productId",
  preventBackButtonBeforeLogout,
  adminControl.cancel_order
);

// router.post("/update-statusOrder/:orderId", adminControl.updateStatusOrder);
router.post(
  "/update-statusOrder/:orderId/:productId",
  adminControl.updateStatusOrder
);

router.get(
  "/inventory",
  preventBackButtonBeforeLogout,
  adminControl.renderInventory
);

router.get(
  "/ReturnedOrder",
  preventBackButtonBeforeLogout,
  adminControl.ReturnedOrderRendering
);

// router.get(
//   "/admin/productDetails/:orderId",
//   adminControl.ProductsDetailsReturnedOrder
// );

router.post("/updateReturnStatus", adminControl.updateReturnStatus);

router.get(
  "/couponManagement",
  preventBackButtonBeforeLogout,
  adminControl.couponManagementRendering
);

router.get(
  "/addCoupon",
  preventBackButtonBeforeLogout,
  adminControl.addCouponRendering
);

router.post("/admin/AddCoupon", adminControl.addCoupon);

router.get(
  "/admin/couponDetails/:couponId",
  preventBackButtonBeforeLogout,
  adminControl.couponDetails
);

router.put(
  "/admin/toggleCouponStatus/:couponId",
  adminControl.toggleCouponStatus
);

router.delete("/admin/deleteCoupon/:couponId", adminControl.deleteCoupon);

router.get(
  "/admin/editCoupon/:couponId",
  preventBackButtonBeforeLogout,
  adminControl.renderEditCouponForm
);

router.post("/admin/editCoupon/:couponId", adminControl.updateCoupon);

router.get(
  "/salesReport",
  preventBackButtonBeforeLogout,
  adminControl.renderSalesReport
);

router.get(
  "/AllSalesReport",
  preventBackButtonBeforeLogout,
  adminControl.renderAllSalesReport
);

router.get(
  "/api/filterSalesReport",
  preventBackButtonBeforeLogout,
  adminControl.filterSalesReport
);

router.post("/filterOrders", adminControl.filterOrders);

router.post("/api/downloadSalesReport", adminControl.downloadSalesReport);

router.get(
  "/viewOrderSales/:orderId/:productId",
  preventBackButtonBeforeLogout,
  adminControl.viewOrderSales
);

// router.get("/viewOrder/:orderId", adminControl.viewOrder);

router.get(
  "/offerManagement",
  preventBackButtonBeforeLogout,
  adminControl.offerManagement
);

router.get(
  "/addOffer_product/:productId",
  preventBackButtonBeforeLogout,
  adminControl.Render_addOfferProduct
);

router.post("/admin/AddOffer_product", adminControl.adminAddOffer_product);

router.get(
  "/addOffer_category/:categoryId",
  preventBackButtonBeforeLogout,
  adminControl.addOffer_category
);

router.post("/admin/AddOffer_category", adminControl.AddOffer_categoryFunction);

router.post("/adminLogout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      res.redirect("/adminLogin");
    }
  });
});

module.exports = router;
