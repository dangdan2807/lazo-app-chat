const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const RoleSchema = new Schema(
    {
        _id: { type: Number },
        name: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 255,
        },
    },
    {
        _id: false,
        timestamps: true,
    },
);

RoleSchema.plugin(AutoIncrement, {
    id: 'roleId',
    inc_field: '_id',
});

module.exports = mongoose.model('role', RoleSchema);
