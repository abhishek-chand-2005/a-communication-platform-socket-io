import mongoose, { Schema } from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    memberCount: {
        type: Number
    }
})

const Group = mongoose.model('Group', groupSchema)

module.exports = Group