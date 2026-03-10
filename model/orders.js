var mongoose = require('mongoose')
var ordersSchema = mongoose.Schema({
    userId:Number,
    orderId:Number,
    Items:Array,
    totalAmount:Number,
    orderStatus:String
})

var order = mongoose.model('orders',ordersSchema);
module.exports = order;