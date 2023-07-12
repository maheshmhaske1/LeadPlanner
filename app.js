var createError = require("http-errors");
var express = require("express");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mysql = require("mysql");
var db = require("./model/db");
const dotenv = require("dotenv").config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

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

const { host, user, password, database } = process.env;

var app = express();

var corsOptions = {
  // origin: 'http://localhost:3000',
  origin: [
    'http://localhost:3000',
    'http://core.leadplaner.com:3000/',
  ],
  credentials: true,
};
app.use(cors(corsOptions));

var options = {
    host: host,
    user: user,
    port: 3306,
    password: password,
    database: database,
}

var sessionConnection = mysql.createConnection(options);
var sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessiontbl',
        columnNames: {
            session_id: 'sesssion_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, sessionConnection)

app.use(session({
    key: 'keyin',
    secret: 'my secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}))

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/blog', express.static(path.join(__dirname, 'public/blog'))) // PROFILE IMAGES
app.use('/employee/doc', express.static(path.join(__dirname, 'public/employeeDoc'))) // PROFILE IMAGES

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
