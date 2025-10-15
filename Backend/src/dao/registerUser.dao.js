import User from '../models/user.model.js'

export const finduserByName = async (userName)=>{
    return await User.findOne({userName})
}

export const findById = async (id)=>{
    return await User.findById(id)
}
export const createUser = async (userName, password)=>{
    const newUser = new User({userName, password})
    await newUser.save()
    return newUser
}