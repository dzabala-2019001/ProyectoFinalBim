import express from 'express'
import { deleteC, obtenerCT, saveC, searchC, testC, updateCT } from './category.controller.js';
import { validateJwt, isAdmin} from '../../middlewares/validate-jwt.js'


const api = express.Router();

api.get('/testC', testC)
api.post('/saveC',[validateJwt], isAdmin, saveC)
api.get('/obtenerCT', [validateJwt],obtenerCT)
api.put('/updateCT/:id', [validateJwt], isAdmin,updateCT)
api.post('/searchC', [validateJwt],searchC)
api.delete('/deleteC/:id', [validateJwt],isAdmin,deleteC)

export default api