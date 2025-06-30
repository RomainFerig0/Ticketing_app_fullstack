const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    ticket : {type : mongoose.Schema.Types.ObjectId, required : true}, 
    user : {type : mongoose.Schema.Types.ObjectId, required: true}, 
    user_email : {type : String, required:true},
    event: {type:String, required:true},
    details: mongoose.Schema.Types.Mixed
});

module.exports = logSchema