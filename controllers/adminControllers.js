const product = require("../models/product");
const Product = require("../models/product");
const mongodb = require("mongodb");
exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
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
        .catch((err) => console.log(err));
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
            });
        })
        .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const id = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updateDesc = req.body.description;
    Product.findOneAndUpdate(
        { _id: id },
        {
            title: updatedTitle,
            price: updatedPrice,
            description: updateDesc,
            imageUrl: updatedImageUrl,
        },
        { new: true }
    )
        /* Course - way 
    Product.findById(id).then(product) => {
        product.title= updatedTitle,
        product.price = updatedPrice,
        product.description = updateDesc,
        product.price = updatedPrice
        return product.save();
    }
    */
        .then((result) => {
            console.log("Updated product");
            res.redirect("/admin/products");
        })
        .catch((err) => console.log(err));
};
exports.getProducts = (req, res, next) => {
    Product.find()
        // .select("title price -_id")
        // .populate("userId", "name")
        .then((products) => {
            console.log(products);
            res.render("admin/products", {
                prods: products,
                pageTitle: "Admin Products",
                path: "/admin/products",
            });
        })
        .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findOneAndRemove(prodId)

        .then(() => {
            console.log("Destroyed Product");
            res.redirect("/admin/products");
        })
        .catch((err) => console.log(err));
};