const MongoClient = require('mongodb').MongoClient;

var _db = null;

module.exports.getDb = function(){
    return _db;
};

module.exports.init = function(callback){
    const uri = 'mongodb+srv://admin:112233444@cluster0-om2ow.mongodb.net/test?retryWrites=true';
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        if (err){
            return new Error('Unable to connect to DB');
        } else {
            _db = client.db("chatroom");
            console.log('Successfully connected to MongoDB server');
        }
    });
};