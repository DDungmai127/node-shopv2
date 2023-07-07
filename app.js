const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/errorControllers");
const mongoose = require("mongoose");
const User = require("./models/user");
const session = require("express-session");
const flash = require("connect-flash");
const mongoDBStore = require("connect-mongodb-session")(session);
const app = express();

// const { doubleCsrf } = require("csrf-csrf");
// phiên bản csrf đã bị ngừng hỗ trợ do vấn đề về bảo mật nên trong khoá học thì dùng thôi ! , còn cái double csrf trên thì được sử dụng nhưng k biết cái thiết lập :))
const csrf = require("csurf");
// const { options } = require("./configs/csrf-csrfOptions");
const cookieParser = require("cookie-parser");
// const { doubleCsrfProtection } = doubleCsrf(options);

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");
const authRoutes = require("./routes/authRoutes");

const MONGODB_URI = "mongodb+srv://dangdung:12072003@cluster0.mdrwvlf.mongodb.net/shop";

const store = new mongoDBStore({
    uri: MONGODB_URI,
    collection: "session",
});
const csrfProtection = csrf();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("cookie-parser-secret"));
app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }));
//chỉ sử dụng được sau session thôi !
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
    .connect(
        "mongodb+srv://dangdung:12072003@cluster0.mdrwvlf.mongodb.net/shop?retryWrites=true&w=majority"
    )
    .then((result) => {
        app.listen(3000);
    })
    .catch((err) => console.log(err));
