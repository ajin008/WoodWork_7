require("dotenv").config();
const express = require("express");
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoute");
const connectToDatabase = require("./utils/connectToDatabase"); //db connection
const passport = require("passport");
const MongoStore = require("connect-mongo");
const errorHandler = require("./middleware/errorHandler");
const port = process.env.PORT;

const app = express();
app.use(express.json());

//view engine and views directory
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Body parser middleware
app.use(express.urlencoded({ extended: true }));

//Static files middleware
app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "assets")));
// app.use(express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 5000000,
    },
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);

app.use(flash());

connectToDatabase();
const GoogleUser = require("./models/googleUserModel");

app.use(userRoutes);
app.use(adminRoutes);

app.use(passport.initialize()); //  Passport middleware
app.use(passport.session());
// Serialization configuration for Google users
passport.serializeUser((user, done) => {
  // Serialize the Google user by using their Google ID
  done(null, user.googleId); // 'googleId' is the unique identifier for Google users
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await GoogleUser.findOne({ googleId: id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log("Server is running on http://localhost:7000/landingPage");
  console.log("server is running http://localhost:7000/adminLogin");
});
