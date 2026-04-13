const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        min: 0,
        max: 200
    },
    img: {
        type: String,
        defaut: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likeCount: {
        type: Number
    },
    commentCount: {
        type: Number
    }
}, {timestamps: true});


const Post = mongoose.model('Post', postSchema);
module.exports = Post;