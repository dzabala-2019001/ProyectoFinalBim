'use strict'

import User from './user.model.js'
import { generarjwt } from '../utils/jwt.js'
import { encrypt, checkPassword, checkUpdateU } from '../utils/validator.js'


export const testU = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

//Client
export const registerU = async(req, res)=>{
    try{
        let data = req.body
        // Verifiva si el usario ya existe
        const existingUser = await User.findOne({ username: data.username });
        if (existingUser) {
            return res.status(400).send({ message: 'Username already exists' });
        }
        data.password = await encrypt(data.password)
        //Role de cliente
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save() 
        return res.send({message: `Registered successfully, can be logged with username ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registering user', err: err})
    }
}

//Admin
export const registerA = async(req, res) =>{
    try {
        let data = req.body
        const existingUser = await User.findOne({username: data.username})
        if(existingUser){
            return res.status(400).send({message: 'The user already exists, please change the user that does not exist.'})
        }
        data.password = await encrypt(data.password)
        //Role de administrador
        data.role = 'ADMIN'
        let user = new User(data)
        await user.save()
        return res.send({message: `Registered successfully, can be logged with username ${user.username}`})
    } catch (erro) {
        console.error(err)
        return res. status(500).send({message: `Registered successfully, can be logged with username ${user.username}`})
    }
}


export const loginU = async (req, res) => {
    try {
        // Captura los datos
        let data = req.body;
        let log = await User.findOne({ $or: [{ username: data.username }, { email: data.email }] });
        // Verifica si se encontró un usuario y si la contraseña coincide
        if (log && (await checkPassword(data.password, log.password))) {
            let loggedUser = {
                uid: log._id,
                username: log.username,
                name: log.name,
                role: log.role
            };
            // Genera un token de autenticación
            let token = await generarjwt(loggedUser);
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token });
        } else {
            // Si no se encuentra un usuario o la contraseña es incorrecta, devuelve un mensaje de error
            return res.status(404).send({ message: 'Incorrect username/email or password' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error logging in user' });
    }
};


export const updateU = async(req, res)=>{
    try { 
        let { id } = req.params
        let data = req.body
        let update = checkUpdateU(data, id)
        if(!update)return res.status(400).send({message: 'Have submitted some data that canot be update'})
        let updatedUser = await User.findOneAndUpdate(
            {_id: id},
            data, 
            {new: true}
        )
        if(!updatedUser) ReadableByteStreamController.status(401).send({message: 'User not found  and not update'})
        return res.send({message: 'Update user', updatedUser})    
    } catch (error) {
        console.error(err)
        if(err.keyValue.username) return res.status(400).send ({message: `Username ${err.keyValue.username} is alredy taken`})
        return res.status(500).send({message: 'Error updating account'})
    }
}


export const deleteUs = async (req, res) => {
    try {
        let data = req.body;
        data._id = req.user._id;
        let user = await User.findOne({ _id: data._id });
        if (!user) return res.status(401).send({ message: 'User not found' });

        let deletedAccount = await User.findOneAndDelete({ _id: data._id });
        if (!deletedAccount) return res.status(404).send({ message: 'Account not found and not deleted' });
        return res.send({ message: `Account ${deletedAccount.username} deleted successfully` });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'FAIL deleting' });
    }
}