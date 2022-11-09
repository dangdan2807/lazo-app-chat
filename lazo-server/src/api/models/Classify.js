const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const classifySchema = new Schema({
    name: String,
    conversationIds: [ObjectId],
    colorId: ObjectId,
    userId: ObjectId,
});

const Classify = mongoose.model('classify', classifySchema);

module.exports = Classify;