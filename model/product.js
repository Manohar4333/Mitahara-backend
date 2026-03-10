var mongoose = require('mongoose')
var productSchema = mongoose.Schema({
    id:Number,
    productName: String,
    category:String,
    price: Number,
    description: String,
    imageURL: String
})

var product = mongoose.model('products',productSchema);
module.exports = product;
