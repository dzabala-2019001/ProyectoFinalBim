'use strict'

import {Router} from 'express'
import { addToCart, generateInvoicePDF } from './cart.controller.js'
import {validateJwt}  from '../../middlewares/validate-jwt.js'

const api = Router()

api.post('/addToCart', [validateJwt],addToCart)
api.get('/generateInvoicePDF', generateInvoicePDF)


export default api