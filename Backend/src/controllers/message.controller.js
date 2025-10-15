import wrapAsync from "../utils/tryCatchWrapper.js"
import Message from '../models/message.model.js'
import mongoose from "mongoose";

export const sendMessage = wrapAsync( async (req, res) =>{
    const {message} = req.body;
    const user = req.user._id.toString()

    const newMessage = await Message.create({
        senderId: user,
        content: message
    })

    res.status(200).json({
        message:"message Created",
        newMessage
    })

})

export const getMessage = wrapAsync( async (req, res) =>{
    const user = req.user._id;

    const messages = await Message.find({ senderId: user })
    .sort({ timestamp: -1 })
    .limit(50)

    res.status(200).json({
        message: "Here are your messages",
        data: messages
    });
})

export const editMessage = wrapAsync( async (req, res) =>{
    const { messageId } = req.params;
    const {newContent} = req.body;
    const userId = req.user._id.toString()

    const message = await Message.findById(messageId)
    if(!message){
        throw new NotFoundError('Message not found');
    }

    if(message.senderId.toString() !== userId){
        throw new ForbiddenError('You can only edit your own messages');
    }

    message.content = newContent;

    await message.save()

    res.status(200).json({
        message:"Message update successfully",
        updatedMessage: message

    })
})

export const deleteMessage = wrapAsync( async (req, res) =>{
    const { messageId } = req.params;
    const userId = req.user._id.toString()

    const message = await Message.findById(messageId)
    if(!message){
        throw new NotFoundError('Message not found');
    }

    if(message.senderId.toString() !== userId){
        throw new ForbiddenError('You can only edit your own messages');
    }

    const messageDeleted = await Message.deleteOne({_id: messageId})
    res.status(200).json({
        message:"Message delete successfully",
        deletedMessage: messageDeleted,
        content: message.content
    })
})

export const reactionEmoji = wrapAsync( async (req, res) =>{
    const { messageId } = req.params;
    const userId = req.user._id.toString()
    const {emoji} = req.body

    const message = await Message.findById(messageId)
    if(!message){
        throw new NotFoundError('Message not found');
    }

   await Message.updateOne(
        { _id: messageId,
            "readBy.userId": { $ne: userId }
         },   // filter object!
        {
            $push: {
            reactions: {
                userId: userId,
                emoji: emoji
            }
            }
        }
    );


    res.status(200).json({
        message:'add emoji'
    })
})

export const markAsRead = wrapAsync( async (req, res) =>{
    const { messageId } = req.params;
    const userId = req.user._id.toString()

    const message = await Message.findById(messageId)
    if(!message){
        throw new NotFoundError('Message not found');
    }

    await Message.updateOne(
        {
        _id: messageId,
        "readBy.userId": { $ne: userId } // Avoid duplicates
        },
        {
        $push: {
            readBy: {
            userId: userId,
            readAt: new Date()
            }
        }
        }
    );

    res.status(200).json({
        message:'seen'
    })
})