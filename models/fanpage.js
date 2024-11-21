const mongoose = require('mongoose');

const fanPageSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    bio : {
        type : String,
        required : true
    },
    members : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'User'
            }
        ],
        default : []
    },
    posts : {
        type : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Post'
            }
        ],
        default : []
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('FanPage', fanPageSchema);