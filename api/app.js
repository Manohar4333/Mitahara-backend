const createError = require("http-errors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
dotenv.config();
const db = process.env.VITE_DB_URL;

let isConnectedBefore = false;

async function connectToMongoDB() {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnectedBefore = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    setTimeout(connectToMongoDB, 5000); // Retry after 5 seconds
  }
}

const indexRouter = require("../routes/index");
const usersRouter = require("../routes/users");
const authRouter = require("../routes/auth");

const app = express();

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use((req, res, next) => {
  if (!isConnectedBefore) {
    connectToMongoDB();
  }
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = (req, res) => {
  app(req, res);
};
