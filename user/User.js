const mongoose = require('mongoose');  
const UserSchema = new mongoose.Schema({  
  email: { type:String, required:true, unique:true},
  password: {type:String, required:true},
  name: {type:String, required:true},
  admin: {type:Boolean, default:false}
});

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');