var createError = require("http-errors");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var dotenv = require("dotenv");
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

// mongoose
//   .connect(db)
//   .then(() => {
//     console.log("Connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

app.use((req, res, next) => {
  if (!isConnectedBefore) {
    connectToMongoDB();
  }
  next();
});

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var authRouter = require("./routes/auth");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Vercel: Do not start server, export app for serverless

// const port = 4300;
// app.listen(port, () => {
//   console.log("server running at " + port);
// });

// error handler
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('Server running on port 3000'));
}


app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
