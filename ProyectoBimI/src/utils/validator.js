'use strict'

import { hash, compare } from 'bcrypt'


export const encrypt = (password)=>{
    try{
        return hash(password, 10)
    }catch(err){
        console.error(err)
        return err
    }
}


export const checkPassword = async(password, hash)=>{
    try{
        return await compare(password, hash)
    }catch(err){
        console.error(err);
        return err
    }
}

export const checkUpdateU = (data, userId)=>{
    if(userId){
        if(Object.entries(data).length === 0 ||
                data.password  ||
                data.password == '' ||
                data.role ||
                data.role == ''
            ){
                return false
            }
            return true
    }else{
        return false
    }
}

export const checkUpdateP = (data, productsId)=>{
    if(productsId){
        if(Object.entries(data).length === 0){
            return false
        }
        return true
    }else{
        return false
    }
}

export const checkUpdateCT = (data, categoriesId)=>{
    if(categoriesId){
        if(Object.entries(data).length === 0){
            return false
        }
        return true
    }else{
        return false
    }
}

export const isAdmin = async(req, res, next)=>{
    try{
        let { user } = req
        if(!user || user.role !== 'ADMIN') return res.status(403).send({message: `This user does not have administrator permissions | username: ${user.username}`})
        next()
    }catch(err){
        console.error(err)
        return res.status(403).send({message: 'Unauthorized role'})
    }
}