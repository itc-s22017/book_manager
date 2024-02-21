const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const {config} = require("./utils/auth")
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require("./routes/admin");
const bookRouter = require("./routes/book");
const rentalRouter = require("./routes/rental");


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(session({
    secret: "</2aiG^bd29iC5rj)=G?mKTmnjoj",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000}
}));
app.use(passport.authenticate("session"));
app.use(config(passport))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/admin', adminRouter);
app.use('/book', bookRouter);
app.use('/rental', rentalRouter);


BigInt.prototype.toJSON = function () {
    return this.toString()
}

module.exports = app;
