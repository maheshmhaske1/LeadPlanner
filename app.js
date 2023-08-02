var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var blogRouter = require("./routes/blog");
var userRouter = require("./routes/user");
var employeeRouter = require("./routes/employee");
var leadRouter = require("./routes/lead");
var dealRouter = require("./routes/deal");
var taskRouter = require("./routes/task");
var noteRouter = require("./routes/note");
var leadDocRouter = require("./routes/leaddocument");
var siteRouter = require("./routes/site");
var pipelineRouter = require("./routes/pipeline");
var productRouter = require("./routes/product");
var settingRouter = require('./routes/settings')

var app = express();
var corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://core.leadplaner.com:3000',
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/blog', express.static(path.join(__dirname, 'public/blog'))) // PROFILE IMAGES
app.use('/employee/doc', express.static(path.join(__dirname, 'public/employeeDoc'))) // PROFILE IMAGES
app.use('/images', express.static(path.join(__dirname, 'public/images')))

app.use("/", indexRouter);
app.use("/api/blog", blogRouter);
app.use("/api/user", userRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/lead", leadRouter);
app.use("/api/deal", dealRouter);
app.use("/api/note", noteRouter);
app.use("/api/task", taskRouter);
app.use("/api/lead/doc", leadDocRouter);
app.use("/api/site", siteRouter);
app.use("/api/product", productRouter);
app.use("/api/pipeline", pipelineRouter);
app.use('/api/setting',settingRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
