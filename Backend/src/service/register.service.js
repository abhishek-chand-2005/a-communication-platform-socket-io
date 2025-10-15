import {createUser, finduserByName} from "../dao/registerUser.dao.js"
import { ConflictError } from "../utils/errorHandler.js";
import { signToken } from "../utils/helper.js";

export const registerUser = async (userName, password) =>{
    const user = await finduserByName(userName)
    if(!user){
        user = await createUser(userName, password)
    }
    const token = signToken({id: user._id})
    return {token,user}
}