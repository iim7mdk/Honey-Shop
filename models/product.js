const mongoose = require('mongoose');
const { imagekit } = require('../imageKit');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/tr:', '/tr:w-200/');
});


const ProductSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { toJSON: { virtuals: true } });

module.exports = mongoose.model('Product', ProductSchema);
