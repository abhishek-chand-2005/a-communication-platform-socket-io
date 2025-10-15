import express from 'express'
const router = express.Router()
import { register } from '../controllers/auth.Controller.js'

router.post('/auth',
    register
)

export default router