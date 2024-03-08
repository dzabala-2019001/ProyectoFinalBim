'use strict'

import jwt from 'jsonwebtoken'
import User from '../src/user/user.model.js'


export const validateJwt = async (req, res, next) => {
    try {
        //Obtener la llave de acceso al token
        let secretKey = process.env.SECRET_KEY
        //obtener el token de los headers
        let { authorization } = req.headers
        //Verificar si viene el token
        if (!authorization) return res.status(401).send({ message: 'Unauthorized' })
        //Obtener el uid del usuario que envio el token
        let { uid } = jwt.verify(authorization, secretKey)
        //Validar si aun existe en la base de datos
        let user = await User.findOne({ _id: uid })
        if (!user) return res.status(404).send({ mesage: 'User not found - Unauthorized' })
        req.user = user
        next()

    } catch (err) {
        console.error(err)
        return res.status(401).send({ message: 'Invalid Token' })

    }
}

export const isAdmin =async(req,res,next)=>{
    try {
        let{ user }= req
        if(!user || user.role !== 'ADMIN') return res.status(403).send({message: `This user does not have administrator permissions  | username: ${user.username}`})
        next()
    } catch (err) {
        console.error(err)
        return res.status(403).send({message:'Unauthorized role'})
    }
}