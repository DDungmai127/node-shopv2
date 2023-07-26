const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/errorControllers");
const shopController = require("./controllers/shopControllers");

const mongoose = require("mongoose");
const User = require("./models/user");
const session = require("express-session");
const flash = require("connect-flash");
const mongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const app = express();
require("dotenv").config();
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
const isAuth = require("./middleware/is-auth");

const MONGODB_URI = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.mdrwvlf.mongodb.net/shop`;

const store = new mongoDBStore({
    uri: MONGODB_URI,
    collection: "session",
});

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, "12072003" + "-" + file.originalname);
    },
});

const filter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
const csrfProtection = csrf();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: filter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cookieParser("cookie-parser-secret"));
app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }));
//chỉ sử dụng được sau session thôi !
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
// Vì ta có cái dòng này nên bất kì khi nào login vào thì ta đều gọi được req.user
app.use((req, res, next) => {
    // throw new Error("Sync Dummy");
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            // throw new Error("Dummy");
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch((err) => {
            next(new Error(err));
        });
});
app.post("/create-order", isAuth, shopController.postOrder);

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    //     // res.status(errorr.httpStatusCode).render(....)
    //     // avoid infinity loop if using redirect
    res.status(500).render("500", {
        pageTitle: "Error",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn,
    });
});
const port = process.env.PORT || 3000;
mongoose
    .connect(
        `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.mdrwvlf.mongodb.net/shop?retryWrites=true&w=majority`
    )
    .then((result) => {
        app.listen(port);
    })
    .catch((err) => console.log(err));
