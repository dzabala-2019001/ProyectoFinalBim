import express from 'express'
import { deleteAdmin, deleteUs, loginU, registerA, registerU, testU, updateU } from './user.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate-jwt.js'

const api = express.Router();

//Rutas publicas
api.post('/registerU', registerU)
api.post('/registerA', registerA)
api.post('/loginU', loginU)


//Rutas privadas
api.get('/testU', testU)
api.put('/updateU/:id',[validateJwt], updateU)
api.delete('/deleteUs/:id',[validateJwt], deleteUs)
api.delete('/deleteAdmin/:id',[validateJwt], isAdmin,deleteAdmin)

export default api