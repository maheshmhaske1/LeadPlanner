var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mysql = require("mysql");
var db = require("./db");

var indexRouter = require("./routes/index");
var blogRouter = require("./routes/blog.router");
var userRouter = require("./routes/user.router");
var employeeRouter = require("./routes/employee.router");

var app = express();
app.use(cors())

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/blog', express.static(path.join(__dirname, 'public/blog'))) // PROFILE IMAGES

app.use("/", indexRouter);
app.use("/api/admin/blog", blogRouter);
app.use("/api/user", userRouter);
app.use("/api/employee", employeeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
