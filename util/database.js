const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
    MongoClient.connect(
        "mongodb+srv://dangdung:12072003@cluster0.mdrwvlf.mongodb.net/?retryWrites=true&w=majority"
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
