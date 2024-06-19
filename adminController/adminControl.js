const userData = require("../models/userModel");
const GoogleUser = require("../models/googleUserModel");
const Product = require("../models/productModel");
const multer = require("multer");
const Category = require("../models/categoryModel");
const sharp = require("sharp");
const uploadMiddleware = require("../utils/multer");
const { resizeAndCropImage } = require("../utils/imageUtils");
const MyOrder = require("../models/OrderSchema");
const Return = require("../models/returnSchema");
const Coupon = require("../models/couponModel");
const UsedCoupon = require("../models/UsedCouponModel");
const SalesReport = require("../models/salesReport");
const Wallet = require("../models/walletModel");
// const fs = require("fs");
const fs = require("fs").promises;
const pdf = require("pdfkit");
const path = require("path");
const ejs = require("ejs");
const { promisify } = require("util");
const puppeteer = require("puppeteer");

exports.dashboardOrdersData = async (req, res) => {
  try {
    const todayOrders = await MyOrder.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });
    const yesterdayOrders = await MyOrder.countDocuments({
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000,
        $lt: new Date().setHours(0, 0, 0, 0),
      },
    });
    const last7DaysOrders = await MyOrder.countDocuments({
      createdAt: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) },
    });
    const last30DaysOrders = await MyOrder.countDocuments({
      createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Send the data back to the client
    res.json([todayOrders, yesterdayOrders, last7DaysOrders, last30DaysOrders]);
  } catch (error) {
    console.error("Error fetching orders data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.orderCounts = async (req, res) => {
  try {
    const currentDate = new Date();

    // Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Yesterday
    const startOfYesterday = new Date();
    startOfYesterday.setDate(currentDate.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // This week (assuming week starts on Sunday)
    const startOfWeek = new Date();
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // This month
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    endOfMonth.setHours(23, 59, 59, 999);

    const [ordersToday, ordersYesterday, ordersThisWeek, ordersThisMonth] =
      await Promise.all([
        MyOrder.countDocuments({
          createdAt: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
        }),
        MyOrder.countDocuments({
          createdAt: {
            $gte: startOfYesterday,
            $lte: endOfYesterday,
          },
        }),
        MyOrder.countDocuments({
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek,
          },
        }),
        MyOrder.countDocuments({
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        }),
      ]);

    res.json({
      today: ordersToday,
      yesterday: ordersYesterday,
      thisWeek: ordersThisWeek,
      thisMonth: ordersThisMonth,
    });
  } catch (err) {
    console.error("Error fetching order counts:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Add this function to get the total count of users
exports.getTotalUsersCount = async () => {
  try {
    // Fetch users from the userData collection
    const regularUsersCount = await userData.countDocuments();

    // Fetch users from the GoogleUser collection and add to the count
    const googleUsersCount = await GoogleUser.countDocuments();

    // Calculate the total count of users
    const totalUsersCount = regularUsersCount + googleUsersCount;

    // Return the total count of users
    return totalUsersCount;
  } catch (err) {
    console.error("Error fetching users count:", err);
    throw new Error("Failed to fetch users count");
  }
};

async function getTotalUsersCount() {
  try {
    // Fetch users from the userData collection
    const regularUsersCount = await userData.countDocuments();

    // Fetch users from the GoogleUser collection and add to the count
    const googleUsersCount = await GoogleUser.countDocuments();

    // Calculate the total count of users
    const totalUsersCount = regularUsersCount + googleUsersCount;

    // Return the total count of users
    return totalUsersCount;
  } catch (err) {
    console.error("Error fetching users count:", err);
    throw new Error("Failed to fetch users count");
  }
}

exports.getTotalProductsCount = async () => {
  try {
    // Implement logic to fetch total number of products from your database
    // For example:
    const totalProductsCount = await Product.countDocuments();

    // Return the total count of products
    return totalProductsCount;
  } catch (err) {
    console.error("Error fetching products count:", err);
    throw new Error("Failed to fetch products count");
  }
};

exports.getTotalOrdersCount = async () => {
  try {
    // Fetch total number of orders from the MyOrder collection
    const totalOrdersCount = await MyOrder.countDocuments();

    // Return the total count of orders
    return totalOrdersCount;
  } catch (err) {
    console.error("Error fetching orders count:", err);
    throw new Error("Failed to fetch orders count");
  }
};

exports.getAllUsers = async () => {
  try {
    // Fetch users from the userData collection
    const regularUsersCount = await userData.countDocuments();

    // Fetch users from the GoogleUser collection and add to the count
    const googleUsersCount = await GoogleUser.countDocuments();

    // Calculate the total count of users
    const totalUsersCount = regularUsersCount + googleUsersCount;

    // Return the total count of users
    return totalUsersCount;
  } catch (err) {
    console.error("Error fetching users count:", err);
    throw new Error("Failed to fetch users count");
  }
};

// Fetch user management data with status
exports.getUserManagementData = async () => {
  try {
    // Fetch users from the userData collection
    const regularUsers = await userData.find(
      {},
      "_id FirstName LastName email phone isBlocked"
    );

    // Fetch users from the GoogleUser collection
    const googleUsers = await GoogleUser.find(
      {},
      "_id FirstName LastName email isBlocked phone" // Correct field names
    );

    // Combine the data from both collections into a single array
    const allUsers = regularUsers.concat(
      googleUsers.map((user) => ({
        _id: user._id,
        FirstName: user.FirstName, // Directly use the fields from the schema
        LastName: user.LastName, // Directly use the fields from the schema
        email: user.email,
        phone: user.phone || "", // Check for phone
        status: user.isBlocked ? "Blocked" : "Active", // Determine status based on isBlocked field
      }))
    );

    return allUsers;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw new Error("Failed to fetch user data");
  }
};

exports.countUsers = async () => {
  try {
    const count = await userData.countDocuments();
    return count;
  } catch (error) {
    console.error("Error counting users:", error);
    throw error;
  }
};

// exports.getUserDetails = async (userId) => {
//   try {
//     // Check if the user exists in the GoogleUser model
//     let userDetails = await GoogleUser.findById(userId);

//     // If the user does not exist in the GoogleUser model, fetch from the UserData model
//     if (!userDetails) {
//       userDetails = await userData.findById(userId);
//     }

//     // Return the user details
//     return userDetails;
//   } catch (err) {
//     console.error("Error fetching user details:", err);
//     throw new Error("Failed to fetch user details");
//   }
// };

exports.getUserDetails = async (userId) => {
  try {
    // throw error;
    let userDetails;

    // Check if the user exists in the GoogleUser model
    userDetails = await GoogleUser.findById(userId);

    // If the user does not exist in the GoogleUser model, fetch from the UserData model
    if (!userDetails) {
      userDetails = await userData.findById(userId);
    }

    // If userDetails is still undefined, the user does not exist
    if (!userDetails) {
      throw new Error("User not found");
    }

    // Extract common user details
    const { _id, FirstName, LastName, email, phone, isBlocked } = userDetails;
    // console.log("testing",isBlocked)
    // Return the user details
    return {
      _id,
      FirstName,
      LastName,
      email,
      phone,
      isBlocked,
    };
  } catch (err) {
    console.error("Error fetching user details:", err);
    throw new Error("Failed to fetch user details");
  }
};

exports.blockUser = async (req, res) => {
  const { userId, action } = req.body;
  // console.log("user id :", req.body);
  try {
    let user;

    // Check if the user exists in UserData
    user = await userData.findById(userId);

    // If not found in UserData, check GoogleUser
    if (!user) {
      user = await GoogleUser.findById(userId);
    }

    // If user not found in either collection, return error
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Toggle the isBlocked field
    user.isBlocked = !user.isBlocked;

    // Save the updated user document
    await user.save();

    // Redirect to a specific URL after blocking/unblocking
    res.redirect("/admin/user/" + userId);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to block/unblock user" });
  }
};

//showing list
exports.getProductManagementPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch product data with pagination, sort by creation date, and populate the category field
    const products = await Product.find(
      {},
      "_id name qty category isListed serialNumber createdAt"
    )
      .populate({
        path: "category",
        select: "name",
      })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .skip(skip)
      .limit(limit);

    // Modify product data to include serial number and extract category name
    const modifiedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      qty: product.qty,
      category: product.category ? product.category.name : "Uncategorized",
      isListed: product.isListed,
      serialNumber: product.serialNumber,
    }));

    const totalProducts = await Product.countDocuments({});
    const totalPages = Math.ceil(totalProducts / limit);

    // Render the productManagement EJS template with the modified product data
    res.render("adminEjs/productManagement", {
      products: modifiedProducts,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Function to fetch and render product details
exports.getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Fetch product details based on productId
    // const product = await Product.findById(productId);
    const product = await Product.findById(productId).populate("category");

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Render the productDetails EJS template with the retrieved product details
    res.render("adminEjs/productDetails", { product });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Internal Server Error");
  }
};

// unList and listing
exports.toggleProductListStatus = async (req, res) => {
  try {
    const productId = req.params.productId;

    const activeOrder = await MyOrder.findOne({
      products: {
        $elemMatch: {
          productId: productId,
          status: { $in: ["Processing", "Shipped", "Delivered"] },
        },
      },
    });

    if (activeOrder) {
      req.flash(
        "error",
        "Product is in an active order and cannot be unlisted."
      );
      return res.redirect("back");
    }
    // Toggle the isListed field based on the action
    if (req.body.action === "list") {
      product.isListed = true;
    } else if (req.body.action === "unlist") {
      product.isListed = false;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    // Save the updated product document
    await product.save();

    // Redirect back to the same page after listing/unlisting
    res.redirect("back");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle product list status",
    });
  }
};

exports.getProductEditPage = async (req, res) => {
  try {
    // Extract the productId from the request parameters
    const productId = req.params.productId;

    // Fetch the product by productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const existingImages = product.images;

    // Fetch all categories from the database
    const categories = await Category.find({}, "_id name");

    // Render the productEdit EJS template with product and categories
    res.render("adminEjs/productEdit", { product, categories, existingImages });
  } catch (error) {
    console.error("Error fetching product or categories:", error);
    res.status(500).send("Internal Server Error");
  }
};

// exports.updateProduct = async (req, res) => {
//   try {
//     const productId = req.params.productId;
//     const {
//       name,
//       description,
//       detailedInformation,
//       category,
//       qty,
//       color,
//       actualPrice,
//       offerPrice,
//       isListed,
//       serialNumber,
//     } = req.body;
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       {
//         name,
//         description,
//         detailedInformation,
//         category,
//         qty,
//         color,
//         actualPrice,
//         offerPrice,
//         isListed,
//         serialNumber,
//       },
//       { new: true }
//     );
//     res.redirect("/productManagement"); // Redirect to product management page after update
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

exports.updateProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const {
      name,
      brandName,
      description,
      detailedInformation,
      category,
      qty,
      color,
      actualPrice,
      offerPrice,
      isListed,
      serialNumber,
    } = req.body;
    // console.log(productId);
    // console.log(req.body);
    // Update the product details
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        brandName,
        description,
        detailedInformation,
        category,
        qty,
        color,
        actualPrice,
        offerPrice,
        isListed,
        serialNumber,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }

    res.redirect("/productManagement"); // Redirect to product management page after update
  } catch (error) {
    console.error("Error updating product details:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateProductImages = async (req, res) => {
  try {
    const productId = req.params.productId;
    const newImages = req.files;
    let existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    if (
      existingImages.length + newImages.length < 3 ||
      existingImages.length + newImages.length > 5
    ) {
      return res.status(400).send("You must have between 3 and 5 images.");
    }

    for (const file of newImages) {
      const imagePath = file.path;
      const croppedImagePath = "uploads/cropped_" + file.filename;

      await sharp(imagePath)
        .resize(500, 500, { fit: "cover", position: "center" })
        .toFile(croppedImagePath);

      existingImages.push(croppedImagePath);
    }

    await Product.findByIdAndUpdate(
      productId,
      { images: existingImages },
      { new: true }
    );

    res.redirect("/productManagement");
  } catch (error) {
    console.error("Error updating product images:", error);
    res.status(500).send("Internal server error");
  }
};

// Multer configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Set the destination folder where images will be uploaded
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Keep the original filename
//   },
// });

// const upload = multer({ storage: storage }).array("images", 5); // 'images' is the name of the file input field

// Handle product creation
// exports.createProduct = (req, res) => {
//   uploadMiddleware(req, res, async function (err) {
//     if (err) {
//       return res.status(500).send(err); // Handle multer errors
//     }

//     try {
//       const {
//         name,
//         description,
//         detailedInformation,
//         category,
//         qty,
//         color,
//         actualPrice,
//         offerPrice,
//       } = req.body;

//       // Store images from req.files
//       const images = req.files.map((file) => file.buffer);

//       // Create new product
//       const product = await Product.create({
//         name,
//         description,
//         detailedInformation,
//         category,
//         qty,
//         color,
//         actualPrice,
//         offerPrice,
//         images,
//       });

//       res.redirect("/addProduct");
//     } catch (error) {
//       console.error("Error creating product:", error);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to create product" }); // Handle other errors
//     }
//   });
// };

exports.createProduct = (req, res) => {
  uploadMiddleware(req, res, async function (err) {
    if (err) {
      return res.status(500).send(err); // Handle multer errors
    }

    try {
      const {
        name,
        brandName,
        description,
        detailedInformation,
        category,
        qty,
        color,
        actualPrice,
        offerPrice,
      } = req.body;

      // Store images from req.files
      const images = [];

      // Process each image using Sharp
      for (const file of req.files) {
        const imagePath = file.path;
        const croppedImagePath = "uploads/cropped_" + file.filename;

        // Define crop width and height
        const cropWidth = 500;
        const cropHeight = 500;

        // Crop and resize the image using Sharp
        await sharp(imagePath)
          .resize(cropWidth, cropHeight, { fit: "cover", position: "center" })
          .toFile(croppedImagePath);

        // Push the path of the cropped image to the images array
        images.push(croppedImagePath);
      }

      // Create new product
      const product = await Product.create({
        name,
        brandName,
        description,
        detailedInformation,
        category,
        qty,
        color,
        actualPrice,
        offerPrice,
        images,
      });

      res.redirect("/addProduct");
    } catch (error) {
      console.error("Error creating product:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to create product" }); // Handle other errors
    }
  });
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Create a new category
    const lowercaseName = name.toLowerCase();
    const category = new Category({ name, lowercaseName });
    await category.save();

    req.flash("success", "Category created successfully");
    res.redirect("/addCategory"); // Redirect to the addCategory page after successfully creating the category
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      // Duplicate key error
      req.flash("error", `Category with name already exists.`);
      return res.redirect("/addCategory");
    }
    console.error("Error creating category:", error);
    req.flash("error", "Internal Server Error");
    res.redirect("/addCategory");
  }
};

exports.renderCategoryManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Aggregate categories with the count of products in each category with pagination
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
              },
            },
            {
              $count: "productCount",
            },
          ],
          as: "products",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          productCount: { $arrayElemAt: ["$products.productCount", 0] },
          isListed: 1, // Include isListed field
          createdAt: 1, // Include createdAt field for sorting
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by creation date in descending order
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalCategories = await Category.countDocuments({});
    const totalPages = Math.ceil(totalCategories / limit);

    res.render("adminEjs/categoryManagement", {
      categories,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.CategoryDetails = async (req, res) => {
  try {
    // throw error;
    const categoryId = req.params.categoryId;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render("adminEjs/categoryDetails", { category });
  } catch (error) {
    console.error("Error fetching category details:", error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
};

exports.listUnlistCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const action = req.body.action;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send("Category not found");
    }

    category.isListed = action === "list";

    await category.save();

    res.redirect("back");
  } catch (error) {
    console.error("Error listing/unlisting category:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.renderEditCategoryForm = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render("adminEjs/categoryEdit", { category });
  } catch (error) {
    console.error("Error rendering edit category form:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { categoryName } = req.body; // Assuming the form field name for category name is categoryName

    // Check if the category name already exists
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      req.flash("error", "Category already exists");
      return res.redirect(`/editCategory/${categoryId}`);
    }

    // Find the category by ID and update its name
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name: categoryName }, // Update the name field
      { new: true } // Return the updated category
    );

    if (!updatedCategory) {
      return res.status(404).send("Category not found");
    }

    res.redirect("/categoryManagement"); // Redirect to category management page after update
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.renderOderManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await MyOrder.find()
      .populate("products.productId")
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .skip(skip)
      .limit(limit);

    // Flatten the orders to separate products, excluding cancelled ones
    const orderItems = [];
    orders.forEach((order) => {
      order.products.forEach((product) => {
        if (!product.cancelled) {
          orderItems.push({
            orderId: order._id,
            productId: product._id, // Use product._id to uniquely identify each product in the order
            productName: product.productId.name,
            address: order.address,
            quantity: product.quantity,
            orderTotal: order.orderTotal,
            oderType: order.oderType,
            status: product.status,
            discountedPrice: product.discountedPrice, // Use product-specific status
          });
        }
      });
    });

    const totalOrders = await MyOrder.countDocuments({});
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("adminEjs/OderManagement", {
      orderItems,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Error rendering order management:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.viewOrderedDetails = async (req, res) => {
  try {
    console.log("viewOrderedDetails is triggering");
    const { orderId, productId } = req.params;
    console.log("view order data:", orderId, productId);

    const orderDetails = await MyOrder.findById(orderId).populate(
      "products.productId"
    );
    if (!orderDetails) {
      return res.status(404).send("Order not found");
    }
    // console.log("data:", orderDetails);
    res.render("adminEjs/orderedDetailsPage", { order: orderDetails });
  } catch (error) {
    console.log(error);
  }
};

exports.cancel_order = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    const order = await MyOrder.findById(orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const product = order.products.id(productId);
    if (!product) {
      return res.status(404).send("Product not found in order");
    }

    product.cancelled = true;
    await order.save();

    res.redirect("/oderManagement");
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateStatusOrder = async (req, res) => {
  try {
    console.log("updateStatusOrder is triggering");
    const { orderId, productId } = req.params;
    const newStatus = req.body.status;

    const formattedDateTime = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const deliveryDateTime = new Date(formattedDateTime);

    const order = await MyOrder.findById(orderId);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const product = order.products.id(productId);

    if (!product) {
      return res.status(404).send("Product not found in order");
    }

    product.status = newStatus;
    product.deliveryDateTime = deliveryDateTime;

    if (newStatus === "Delivered") {
      product.payment = "Paid";
    }

    await order.save();

    res.redirect("/oderManagement");
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.renderInventory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await Product.find().skip(skip).limit(limit);

    // Fetch total count of products for pagination
    const totalProducts = await Product.countDocuments();

    // Iterate through each product and calculate available stock and number of orders
    const productDetails = await Promise.all(
      products.map(async (product) => {
        const orders = await MyOrder.find({
          "products.productId": product._id,
        });
        const totalOrderedQty = orders.reduce(
          (acc, order) =>
            acc +
            order.products.find((p) => p.productId.equals(product._id))
              .quantity,
          0
        );
        const availableStock = product.qty - totalOrderedQty;

        return {
          id: product._id,
          name: product.name,
          qty: product.qty,
          availableStock,
          numberOfOrders: orders.length,
          serialNumber: product.serialNumber,
        };
      })
    );

    const totalPages = Math.ceil(totalProducts / limit);

    res.render("adminEjs/Inventory", {
      products: productDetails,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.ReturnedOrderRendering = async (req, res) => {
  try {
    console.log("the returnOrder is triggering");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch return orders with pagination
    const returnOrders = await Return.find()
      .skip(skip)
      .limit(limit)
      .populate("orderId");

    const returnOrdersWithData = [];

    for (const returnOrder of returnOrders) {
      const orderId = returnOrder.orderId;

      // Populate the product details within the order
      const order = await MyOrder.findById(orderId).populate(
        "products.productId"
      );

      // Check if the order exists
      if (order) {
        order.products.forEach((product) => {
          returnOrdersWithData.push({
            orderId: order._id,
            submittedAt: returnOrder.submittedAt,
            productName: product.productId.name,
            orderType: order.oderType,
            returnReason: returnOrder.returnReason,
            additionalDetails: returnOrder.additionalDetails,
            paymentOption: returnOrder.paymentOption,
            firstName: order.firstName,
            lastName: order.lastName,
            address: order.address,
            street: order.street,
            landmark: order.landmark,
            state: order.state,
            email: order.email,
            postalCode: order.postalCode,
            phone: order.phone,
          });
        });
      } else {
        console.log(`Order with ID ${orderId} not found`);
      }
    }

    // Fetch total count of return orders for pagination
    const totalReturnOrders = await Return.countDocuments();

    const totalPages = Math.ceil(totalReturnOrders / limit);

    res.render("adminEjs/ReturnedOrder", {
      returnOrders: returnOrdersWithData,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    res.status(500).send("Internal Server Error");
  }
};

// exports.ProductsDetailsReturnedOrder = async (req, res, next) => {
//   try {
//     console.log("ProductsDetailsReturnedOrder is triggering");
//     const orderId = req.params.orderId;

//     const order = await MyOrder.findById(orderId).populate("productId");

//     if (!order) {
//       return res.status(404).send("Order not found");
//     }
//     res.render("orderDetails_Return", { order });
//   } catch (error) {
//     console.error("Error fetching order details:", error);
//     next(error);
//   }
// };

exports.updateReturnStatus = async (req, res) => {
  try {
    console.log("updateReturnStatus triggering");
    const { orderId, status, paymentOption } = req.body;

    // Update the return status for the order
    await MyOrder.updateOne({ _id: orderId }, { returnStatus: status });

    if (status === "Accepted") {
      // Remove the return request
      await Return.deleteOne({ orderId: orderId });

      if (paymentOption === "Wallet") {
        const order = await MyOrder.findOne({ _id: orderId });
        if (order) {
          const totalRefundAmount = order.products.reduce((total, product) => {
            return total + product.discountedPrice * product.quantity;
          }, 0);

          console.log("totalRefundAmount:", totalRefundAmount);

          const wallet = await Wallet.findOne({ userId: order.userId });
          if (wallet) {
            wallet.balance += totalRefundAmount;
            wallet.transactions.push({
              type: "deposit",
              amount: totalRefundAmount,
              description: "Refund from returned order",
              status: "success",
              orderId: orderId,
            });
            await wallet.save();
            console.log("Balance updated successfully for user:", order.userId);
          } else {
            console.log("Wallet not found for user:", order.userId);
          }
        } else {
          console.log("Order not found with ID:", orderId);
        }
      }
    }

    res.status(200).send("Status updated successfully");
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.couponManagementRendering = async (req, res) => {
  try {
    const activeCoupons = await Coupon.find();
    res.render("adminEjs/coupon", { activeCoupons });
  } catch (error) {
    console.error("couponManagementRendering:", error);
  }
};

exports.addCouponRendering = async (req, res) => {
  try {
    res.render("adminEjs/addCoupon");
  } catch (error) {
    console.error("addCouponRendering:", error);
  }
};

exports.addCoupon = async (req, res) => {
  try {
    const {
      offerName,
      couponCode,
      discountType,
      discountValue,
      minPurchaseAmount,
      validFrom,
      validTo,
      usageLimit,
      isActive,
    } = req.body;

    // Perform a case-insensitive search for existing coupons
    const existingCoupon = await Coupon.findOne({
      couponCode: { $regex: new RegExp(`^${couponCode}$`, "i") },
    });

    if (existingCoupon) {
      req.flash(
        "error",
        "Coupon with this code already exists. Please choose a different code."
      );
      return res.redirect("/AddCoupon");
    }

    if (discountType === "percentage") {
      if (discountValue >= 100 || discountValue <= 0) {
        req.flash(
          "error",
          "Discount value cannot be more than 100 or less than 0."
        );
        return res.redirect("/AddCoupon");
      }
    }

    if (discountType === "fixed") {
      if (discountValue >= 500 || discountValue <= 0) {
        req.flash(
          "error",
          "Discount value cannot be more than 500 or less than 0."
        );
        return res.redirect("/AddCoupon");
      }
    }

    const newCoupon = new Coupon({
      offerName,
      couponCode,
      discountType,
      discountValue,
      minPurchaseAmount,
      validFrom,
      validTo,
      usageLimit,
      isActive,
    });

    await newCoupon.save();

    res.redirect("/couponManagement");
  } catch (error) {
    console.error("Error adding coupon:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the coupon" });
  }
};

exports.couponDetails = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);

    res.render("adminEjs/CouponDetails", { coupon });
  } catch (error) {
    console.error("Error retrieving coupon details:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.toggleCouponStatus = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const { isActive } = req.body;
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { isActive },
      { new: true }
    );

    res.json(updatedCoupon);
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    await Coupon.findByIdAndDelete(couponId);
    console.log("Coupon deleted successfully");
    await UsedCoupon.findByIdAndDelete(couponId);
    console.log("coupon is deleted from the UsedCoupon");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.renderEditCouponForm = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const coupon = await Coupon.findById(couponId);
    res.render("adminEjs/editCoupon", { coupon });
  } catch (error) {
    console.error("Error rendering edit coupon form:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const {
      offerName,
      couponCode,
      discountType,
      discountValue,
      minPurchaseAmount,
      validFrom,
      validTo,
      usageLimit,
    } = req.body;

    const existingCoupon = await Coupon.findOne({ couponCode });

    if (existingCoupon && existingCoupon._id.toString() !== couponId) {
      req.flash("error", "Coupon code already exists");
      return res.redirect("/admin/editCoupon/" + couponId);
    }

    // If the coupon code is unique, proceed with updating the coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        offerName,
        couponCode,
        discountType,
        discountValue,
        minPurchaseAmount,
        validFrom,
        validTo,
        usageLimit,
      },
      { new: true }
    );
    res.redirect("/admin/couponDetails/" + updatedCoupon._id);
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.renderSalesReport = async (req, res, next) => {
  try {
    // Fetch all orders
    const orders = await MyOrder.find();
    const totalOrder = await MyOrder.countDocuments();

    let totalSales = 0;
    orders.forEach((order) => {
      order.products.forEach((product) => {
        if (!product.cancelled && product.status === "Delivered") {
          totalSales += product.discountedPrice;
        }
      });
    });

    const aov = totalOrder > 0 ? (totalSales / totalOrder).toFixed(2) : 0;

    // Function to get total users count (assuming this is implemented elsewhere)
    const totalUsersCount = await getTotalUsersCount();

    const returnOrders = await Return.find().populate("orderId");

    // Logging to check the fetched return orders
    console.log("Fetched Return Orders:", returnOrders);

    const returnOrderDetails = returnOrders
      .filter((returnOrder) => returnOrder.orderId) // Filter out null orderIds
      .map((returnOrder) => ({
        orderId: returnOrder.orderId._id,
        productName: returnOrder.orderId.productName,
        returnReason: returnOrder.returnReason,
        additionalDetails: returnOrder.additionalDetails,
        submittedAt: returnOrder.submittedAt,
        paymentOption: returnOrder.paymentOption,
      }));

    // Logging to check the processed return order details
    console.log("Processed Return Order Details:", returnOrderDetails);

    // Render the sales report with the calculated values
    res.render("adminEjs/salesReport", {
      totalOrder,
      totalSales,
      aov,
      totalUsersCount,
      returnOrderDetails,
    });
  } catch (error) {
    console.log("Error:", error);
    next(error);
  }
};

exports.renderAllSalesReport = async (req, res) => {
  try {
    console.log("renderAllSalesReport is triggering");
    const orders = await MyOrder.find().populate("products.productId").exec();

    const updatedOrders = [];

    for (const order of orders) {
      for (const product of order.products) {
        const productDetails = product.productId;
        if (productDetails) {
          const couponDiscount = (
            productDetails.offerPrice - product.discountedPrice
          ).toFixed(2);

          const usedCoupon = await UsedCoupon.findOne({
            productId: product.productId,
          });

          const discountType = usedCoupon
            ? (await Coupon.findById(usedCoupon.couponId)).discountType
            : "No discount";

          updatedOrders.push({
            orderId: order._id,
            productId: product.productId._id,
            productName: productDetails.name,
            discountedPrice: product.discountedPrice,
            payment: order.payment,
            deliveryDateTime: product.deliveryDateTime,
            status: product.status,
            quantity: product.quantity,
            discountType: discountType,
            couponDiscount: couponDiscount,
          });
        } else {
          updatedOrders.push({
            orderId: order._id,
            productId: product._id,
            productName: "Product not found",
            discountedPrice: product.discountedPrice,
            payment: order.payment,
            deliveryDateTime: product.deliveryDateTime,
            status: product.status,
            quantity: product.quantity,
            discountType: "Product not found",
            couponDiscount: "0.00",
          });
        }
      }
    }

    res.render("adminEjs/salesList", { orders: updatedOrders });
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Internal Server Error");
  }
};

// exports.filterSalesReport = async (req, res) => {
//   try {
//     console.log("filterSalesReport is triggering");
//     const { startDate, endDate } = req.query; // Change to req.query to match frontend
//     console.log("client side date:", startDate, endDate);
//     let filter = {};

//     if (startDate && endDate) {
//       filter.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate),
//       };
//     }

//     const orders = await MyOrder.find(filter).populate("products.productId");
//     console.log("filtering is completed");
//     res.status(200).json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.filterSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, range } = req.query;

    let filter = {};

    if (range) {
      const now = new Date();
      let start;
      switch (range) {
        case "today":
          start = new Date(now.setHours(0, 0, 0, 0));
          filter.createdAt = { $gte: start };
          break;
        case "yesterday":
          start = new Date(now.setDate(now.getDate() - 1));
          start.setHours(0, 0, 0, 0);
          const endYesterday = new Date(now.setHours(23, 59, 59, 999));
          filter.createdAt = { $gte: start, $lte: endYesterday };
          break;
        case "last7days":
          start = new Date(now.setDate(now.getDate() - 7));
          filter.createdAt = { $gte: start };
          break;
        case "last30days":
          start = new Date(now.setDate(now.getDate() - 30));
          filter.createdAt = { $gte: start };
          break;
        default:
          break;
      }
    } else if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const orders = await MyOrder.find(filter).populate({
      path: "products.productId",
      select: "name offerPrice",
    });

    const transformedOrders = orders
      .map((order) => {
        return order.products.map((product) => ({
          orderId: order._id,
          productId: product.productId._id,
          productName: product.productId.name,
          discountedPrice: product.discountedPrice,
          payment: order.payment,
          deliveryDateTime: product.deliveryDateTime,
          status: product.status,
          quantity: product.quantity,
          discountType: order.discountType || "N/A",
          couponDiscount: (
            product.productId.offerPrice - product.discountedPrice
          ).toFixed(2),
        }));
      })
      .flat();

    res.status(200).json(transformedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.filterOrders = async (req, res) => {
  console.log("filterOrders is triggering");
  const { startDate, endDate, range } = req.body;

  let filter = {};

  if (range) {
    const now = new Date();
    let start;
    switch (range) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        filter.createdAt = { $gte: start };
        break;
      case "yesterday":
        start = new Date(now.setDate(now.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        const endYesterday = new Date(now.setHours(23, 59, 59, 999));
        filter.createdAt = { $gte: start, $lte: endYesterday };
        break;
      case "last7days":
        start = new Date(now.setDate(now.getDate() - 7));
        filter.createdAt = { $gte: start };
        break;
      case "last30days":
        start = new Date(now.setDate(now.getDate() - 30));
        filter.createdAt = { $gte: start };
        break;
    }
  } else if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    };
  }
  try {
    const orders = await MyOrder.find(filter).populate("products.productId");
    res.json(orders);
  } catch (err) {
    console.log("err");
  }
};

exports.downloadSalesReport = async (req, res) => {
  try {
    console.log("downloadSalesReport is triggering");
    const orders = await MyOrder.find().populate("products.productId");

    for (const order of orders) {
      for (const item of order.products) {
        const product = item.productId;

        if (product) {
          item.couponDiscount = (
            product.offerPrice - item.discountedPrice
          ).toFixed(2);

          const usedCoupon = await UsedCoupon.findOne({
            productId: product._id,
          });

          if (usedCoupon) {
            const coupon = await Coupon.findById(usedCoupon.couponId);
            item.discountType = coupon.discountType;
          } else {
            item.discountType = "No discount";
          }
        } else {
          item.couponDiscount = 0;
          item.discountType = "Product not found";
        }
      }
    }

    const templatePath = path.resolve("salesReport.html");
    const salesReportTemplate = await fs.readFile(templatePath, "utf-8");
    const htmlContent = ejs.render(salesReportTemplate, { orders });

    const pdfBuffer = await generatePDF(htmlContent);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.pdf"
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("Error generating sales report");
  }
};

async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();
  return pdfBuffer;
}

exports.viewOrderSales = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    const order = await MyOrder.findById(orderId).populate({
      path: "products.productId",
      select: "name price color brand serialNumber",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product = order.products.find(
      (p) => p.productId._id.toString() === productId
    );

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found in this order" });
    }

    const productDetails = {
      productName: product.productId.name,
      price: product.discountedPrice,
      quantity: product.quantity,
      offerPrice: product.productId.offerPrice,
      color: product.productId.color,
      brand: product.productId.brand,
      serialNumber: product.productId.serialNumber,
    };

    const orderDetails = {
      orderType: order.orderType,
      firstName: order.firstName,
      address: order.address,
      email: order.email,
      phone: order.phone,
    };

    res.render("adminEjs/viewOrder", { productDetails, orderDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.viewOrderSales = async (req, res) => {
//   try {
//     console.log("view order is triggering");
//     const { orderId, productId } = req.params;
//     const order = await MyOrder.findById(orderId).populate(
//       "products.productId"
//     );

//     // Find the specific product within the order
//     const product = order.products.find(
//       (p) => p.productId._id.toString() === productId
//     );

//     if (!product) {
//       return res.status(404).send("Product not found in this order");
//     }

//     res.render("adminEjs/viewOrder", { order, product });
//   } catch (error) {
//     console.log("error", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

exports.offerManagement = async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await Category.find();
    res.render("adminEjs/offerManagement", { products, categories });
  } catch (error) {
    console.log(error);
  }
};

exports.Render_addOfferProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    res.render("adminEjs/addOfferProduct", { productId });
  } catch (error) {
    console.log(error);
  }
};

exports.adminAddOffer_product = async (req, res) => {
  try {
    console.log("adminAddOffer_product is triggering");
    const { discountType, discountValue, validFrom, validTo, productId } =
      req.body;
    console.log("product ID:", productId);
    const product = await Product.findOne({ _id: productId });
    console.log("Original offerPrice:", product.offerPrice);

    if (product.hasOfferApplied) {
      console.log("An offer is already applied to this product");
      req.flash("error", "An offer is already applied to this product");
      return res.redirect(`/addOffer_product/${productId}`);
    }

    if (discountType === "percentage") {
      if (discountValue >= 100 || discountValue <= 0) {
        req.flash("error", "you can not add more than 100. or negative No");
        return res.redirect(`/addOffer_product/${productId}`);
      }
    }

    if (discountType === "fixed") {
      if (discountValue >= 500 || discountValue <= 0) {
        req.flash("error", "you can not add more than 500 or negative No");
        return res.redirect(`/addOffer_product/${productId}`);
      }
    }

    let newOfferPrice;

    if (discountType === "percentage") {
      // Calculate new offer price based on percentage discount
      const percentageDiscount = parseFloat(discountValue) / 100;
      newOfferPrice = product.offerPrice * (1 - percentageDiscount);
    } else if (discountType === "fixed") {
      // Calculate new offer price based on fixed discount
      const fixedDiscount = parseFloat(discountValue);
      newOfferPrice = product.offerPrice - fixedDiscount;
    } else {
      console.log("Invalid discount type");
      return res.status(400).send("Invalid discount type");
    }

    // Check if the current date is within the validity period
    const currentDate = new Date();
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);

    if (currentDate < validFromDate || currentDate > validToDate) {
      console.log("Offer price is not valid for the current date");
      return res
        .status(400)
        .send("Offer price is not valid for the current date");
    }

    // Update the product's offer price in the database
    product.offerPrice = newOfferPrice;
    product.hasOfferApplied = true;
    await product.save();

    console.log("Updated offerPrice:", newOfferPrice);

    // Send response
    res.redirect("/offerManagement");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.addOffer_category = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    res.render("adminEjs/addOffer_category", { categoryId });
  } catch (error) {
    console.log(error);
  }
};

exports.AddOffer_categoryFunction = async (req, res) => {
  try {
    console.log("addoffer_categoryFunction is triggering");
    const { discountType, discountValue, validFrom, validTo, categoryId } =
      req.body;

    const products = await Product.find({ category: categoryId });

    for (const product of products) {
      console.log(
        "Original offerPrice for product",
        product.name,
        ":",
        product.offerPrice
      );

      let newOfferPrice;

      if (discountType === "percentage") {
        // Calculate new offer price based on percentage discount
        const percentageDiscount = parseFloat(discountValue) / 100;
        newOfferPrice = product.offerPrice * (1 - percentageDiscount);
      } else if (discountType === "fixed") {
        // Calculate new offer price based on fixed discount
        const fixedDiscount = parseFloat(discountValue);
        newOfferPrice = product.offerPrice - fixedDiscount;
      } else {
        console.log("Invalid discount type");
        return res.status(400).send("Invalid discount type");
      }

      const currentDate = new Date();
      const validFromDate = new Date(validFrom);
      const validToDate = new Date(validTo);

      if (currentDate < validFromDate || currentDate > validToDate) {
        console.log("Offer price is not valid for the current date");
        return res
          .status(400)
          .send("Offer price is not valid for the current date");
      }

      product.offerPrice = newOfferPrice;
      await product.save();

      console.log(
        "Updated offerPrice for product",
        product.name,
        ":",
        newOfferPrice
      );
    }

    res.redirect("/offerManagement");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
