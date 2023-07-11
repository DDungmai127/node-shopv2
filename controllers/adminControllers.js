const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
const ITEMS_PER_PAGE = 2;
exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    // console.log(image);
    if (!image) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/adit-product",
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description,
            },
            errorMessage: "Attached file is not an image",
            validationErrors: [],
        });
    }
    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/adit-product",
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    const imageUrl = image.path;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user,
    });
    product
        .save()
        .then((result) => {
            console.log("Created product");
            res.redirect("/admin/products");
        })
        .catch((err) =>
            // res.status(422).render("admin/edit-product", {
            //     pageTitle: "Add Product",
            //     path: "/admin/adit-product",
            //     editing: false,
            //     hasError: true,
            //     product: {
            //         title: title,
            //         imageUrl: imageUrl,
            //         price: price,
            //         description: description,
            //     },
            //     errorMessage: "Database operation failed, please try again",
            //     validationErrors: [],
            // })
            // res.redirect("/500")
            {
                const error = new Error(err);
                error.httpStatusCode = 500;
                //Bắn cái này sang cho error middlewar nó xử lý
                return next(error);
            }
        );
};
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const productId = req.params.productId;
    Product.findById(productId)
        .then((product) => {
            if (!product) {
                return res.redirect("/");
            }
            res.render("admin/edit-product", {
                pageTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: [],
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            //Bắn cái này sang cho error middlewar nó xử lý
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
    // Product.findOneAndUpdate(
    //     { _id: id },
    //     {
    //         title: updatedTitle,
    //         price: updatedPrice,
    //         description: updateDesc,
    //         imageUrl: updatedImageUrl,
    //     },
    //     { new: true }
    // )
    console.log(image);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log("In error empty");
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }
    Product.findById(id)
        .then((product) => {
            console.log(product);
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect("/");
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            if (image) {
                console.log("Image existed");
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            console.log(product);

            return product.save().then((result) => {
                console.log("Updated product");
                res.redirect("/admin/products");
            });
        })

        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find({ userId: req.user._id })
        .countDocuments()
        .then((numProducts) => {
            totalItems = numProducts;
            Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                // limit : chỉ lấy phần tử đủ cho một trang
                .limit(ITEMS_PER_PAGE)
                .then((products) =>
                    res.render("admin/products", {
                        prods: products,
                        pageTitle: "Admin Products",
                        path: "/admin/products",
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

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(proId)
        .then((product) => {
            if (!product) {
                return next(new Error("product not found"));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })

        .then(() => {
            console.log("Destroyed Product");
            res.redirect("/admin/products");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
