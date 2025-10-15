import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    lastLogin: {
      type: Date,
      default: Date.now, 
    },
    groupId:{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }
    
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

export default User;