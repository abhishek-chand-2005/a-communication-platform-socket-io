import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required : true
    }
})

const Message = mongoose.model('Message', messageSchema);

export default Message