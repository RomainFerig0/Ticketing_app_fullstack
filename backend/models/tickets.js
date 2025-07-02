//backend/models/tickets

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {type :String, required : true},
    email : {type :String, required : true}, 
    motive: {type:String, required:true, enum: ['software', 'hardware', 'other']}, 
    priority: {type:Number, default : 0}, 
    status: {type:String, enum :['open', 'suspended', 'pending', 'closed'], default : 'pending' }, 
    submit_time : { type:Date, default: Date.now }, 
    closing_time : Date, 
    description: String
});

module.exports = ticketSchema 