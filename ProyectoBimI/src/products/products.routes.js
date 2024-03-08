import express from 'express'
import { catalogue, deletePr, exhausted, registerP, search, searchCategoy, test, updateP } from './products.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate-jwt.js'


const api = express.Router();

api.get('/test', test)
api.post('/registerP', [validateJwt],isAdmin,registerP)
api.delete('/deletePr/:id', [validateJwt],isAdmin,deletePr)
api.post('/search', search)
api.post('/searchCategoy', searchCategoy)
api.put('/updateP/:id', [validateJwt],isAdmin,updateP)
api.get('/catalogue', catalogue)
api.get('/exhausted', exhausted)

export default api