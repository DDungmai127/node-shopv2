const mongodb = require("mongodb");
require("dotenv").config();
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
    MongoClient.connect(
        `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.mdrwvlf.mongodb.net/shop?retryWrites=true&w=majority`
    )
        .then((client) => {
            _db = client.db();
            callback();
            console.log("Connected");
            _db.c;
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No database found !";
};
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
