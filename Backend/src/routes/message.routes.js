import express from 'express'
const router = express.Router()
import { sendMessage, getMessage, editMessage, deleteMessage, reactionEmoji } from '../controllers/message.controller.js'
import {userMiddleware} from '../middlewares/user.middleware.js'

router.post('/newMessage',
    userMiddleware,
    sendMessage
)

router.get('/getMessage',
    userMiddleware,
    getMessage
)

router.post('/editMessage/:messageId',
    userMiddleware,
    editMessage
)

router.get('/deleteMessage/:messageId',
    userMiddleware,
    deleteMessage
)

router.post('/addReaction/:messageId',
    userMiddleware,
    reactionEmoji
)

export default router