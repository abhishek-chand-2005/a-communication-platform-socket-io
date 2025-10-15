import wrapAsync from "../utils/tryCatchWrapper.js"
import {registerUser} from '../service/register.service.js'

export const register = wrapAsync( async (req, res) =>{
    const {userName, password } = req.body
    const {token,user} = await registerUser(userName, password)
    req.user = user
    res.cookie("accessToken", token)
    res.status(200).json({message : "proced to next"})
})