const mongoose = require('mongoose');  
const ProductSchema = new mongoose.Schema({  
    ID: { type:Number, required:true, unique:true},
    product: {type:String, required:true},
    type: {type:String, required:true},
    price: {type:Number, required:true}
  });


mongoose.model('Product', ProductSchema);
module.exports = mongoose.model('Product');

