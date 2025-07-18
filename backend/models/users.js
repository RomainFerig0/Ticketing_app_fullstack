const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ 
    name: {type:String, required:[true, 'You need a username.']}, 
    email: { type: String, unique: true }, 
    role : { type : String, required:[true, 'You need a role.'], enum : ['admin', 'user'], default:'user'}, 
    password: {type:String, required:[true, 'You need a password.']},
});

module.exports = userSchema