/** @type {import("mongoose")*/
const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});
module.exports = mongoose.model("Product", productSchema);
// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongoDb.ObjectId(id) : null;
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let dbUp;

//         if (this._id) {
//             dbUp = db.collection("products").updateOne(
//                 {
//                     _id: this._id,
//                 },
//                 { $set: this }
//             );
//         } else {
//             dbUp = db.collection("products").insertOne(this);
//         }
//         return dbUp
//             .then((result) => {
//                 console.log(result);
//             })
//             .catch((err) => console.log(err));
//     }
//     static fetchAll() {
//         const db = getDb();
//         return db
//             .collection("products")
//             .find()
//             .toArray()
//             .then((products) => {
//                 console.log(products);
//                 return products;
//             })
//             .catch((err) => console.log(err));
//     }
//     static findById(proId) {
//         const db = getDb();
//         return db
//             .collection("products")
//             .find({ _id: new mongoDb.ObjectId(proId) })
//             .next()
//             .then((product) => {
//                 console.log(product);
//                 return product;
//             })
//             .catch((err) => console.log(err));
//     }
//     static deleteById(prodId) {
//         const db = getDb();
//         return db
//             .collection("products")
//             .deleteOne({
//                 _id: new mongoDb.ObjectId(prodId),
//             })
//             .then((result) => {
//                 console.log(result);
//             })
//             .catch((err) => console.log(err));
//     }
// }
// module.exports = Product;
