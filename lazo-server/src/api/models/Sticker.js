const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stickerSchema = new Schema({
    name: String,
    description: {
        type: String,
        default: '',
    },
    stickers: {
        type: [String],
        default: [],
    },
});

const Sticker = mongoose.model('sticker', stickerSchema);

module.exports = Sticker;