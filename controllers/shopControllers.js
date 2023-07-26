const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ITEMS_PER_PAGE = 2;
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                // limit : chỉ lấy phần tử đủ cho một trang
                .limit(ITEMS_PER_PAGE)
                .then((products) =>
                    res.render("shop/product-list", {
                        prods: products,
                        pageTitle: "All Products",
                        path: "/products",
                        currentPage: page,
                        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                        // csrfToken: req.csrfToken(),
                    })
                );
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProduct = (req, res, next) => {
    const proId = req.params.productId;
    Product.findById(proId)
        .then((product) =>
            res.render("shop/product-detail", {
                product: product,
                pageTitle: product.title,
                path: "/products",
            })
        )
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                // limit : chỉ lấy phần tử đủ cho một trang
                .limit(ITEMS_PER_PAGE)
                .then((products) =>
                    res.render("shop/index", {
                        prods: products,
                        pageTitle: "Shop",
                        path: "/",
                        currentPage: page,
                        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                        // csrfToken: req.csrfToken(),
                    })
                );
        })
        // Phương thức skip này sẽ bỏ qua số người tuỳ vào số trang

        .catch((err) => {
            console.log(error);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            // console.log(user.cart.items);
            const products = user.cart.items;
            res.render("shop/cart", {
                path: "/cart",
                pageTitle: "Your Cart",
                products: products,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect("/cart");
        });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .deleteItemFromCart(prodId)
        .then((result) => {
            res.redirect("/cart");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, productData: { ...i.productId._doc } };
            });
            const order = new Order({
                products: products,
                user: {
                    email: req.user.email,
                    userId: req.user,
                },
            });
            order.save();
        })
        .then((result) => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate("cart.items.productId")
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, productData: { ...i.productId._doc } };
            });
            const order = new Order({
                products: products,
                user: {
                    email: req.user.email,
                    userId: req.user,
                },
            });
            order.save();
        })
        .then((result) => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id })
        .then((orders) => {
            res.render("shop/orders", {
                path: "/orders",
                pageTitle: "Your Orders",
                orders: orders,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCheckout = (req, res, next) => {
    let total = 0,
        products;
    req.user
        // chỗ populate này nó sẽ lấy hết toàn bộ cả thông tin liên quan đến productId (bảng product đấy)
        .populate("cart.items.productId")
        .then((user) => {
            total = 0;
            products = user.cart.items;
            products.forEach((p) => {
                total += p.quantity * p.productId.price;
            });

            return stripe.checkout.sessions
                .create({
                    payment_method_types: ["card"],
                    line_items: products.map((p) => {
                        return {
                            quantity: p.quantity,
                            price_data: {
                                unit_amount: p.productId.price * 100,
                                currency: "usd",
                                product_data: {
                                    name: p.productId.title,
                                    description: p.productId.description,
                                },
                            },
                        };
                    }),
                    mode: "payment",
                    success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
                    cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
                })
                .then((session) => {
                    res.render("shop/checkout", {
                        path: "/checkout",
                        pageTitle: "Checkout",
                        products: products,
                        totalSum: total,
                        sessionId: session.id,
                    });
                });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then((order) => {
            console.log(order);
            if (!order) {
                console.log("hello");
                return next(new Error("No order found."));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                console.log("Hello 1");
                return next(new Error("Unauthorized"));
            }
            console.log("Co order oi");
            const invoiceName = "invoice-" + orderId + ".pdf";
            const invoicePath = path.join("data", "invoices", invoiceName);

            const pdfDoc = new PDFDocument();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text("Invoice", {
                underline: true,
            });
            pdfDoc.text("-----------------------");
            let totalPrice = 0;
            order.products.forEach((prod) => {
                totalPrice += prod.quantity * prod.productData.price;
                pdfDoc
                    .fontSize(14)
                    .text(
                        prod.productData.title +
                            " - " +
                            prod.quantity +
                            " x " +
                            "$" +
                            prod.productData.price
                    );
            });
            pdfDoc.text("---");
            pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
            console.log("End game");
            pdfDoc.end();
            // res.end();
            // fs.readFile(invoicePath, (err, data) => {
            //   if (err) {
            //     return next(err);
            //   }
            //   res.setHeader('Content-Type', 'application/pdf');
            //   res.setHeader(
            //     'Content-Disposition',
            //     'inline; filename="' + invoiceName + '"'
            //   );
            //   res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);

            // file.pipe(res);
        })
        .catch((err) => next(err));
};
