'use strict'

//importaciones >;v
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import userRoutes from '../src/user/user.routes.js'
import productsRoutes from '../src/products/products.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import cartRoutes from '../src/cart/cart.routes.js'


const app = express()
config();
const port = process.env.PORT || 2622

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())
app.use(helmet()) 
app.use(morgan('dev'))

//No olvidar Declaración de rutas xd
app.use('/user',userRoutes)
app.use('/product', productsRoutes)
app.use('/category', categoryRoutes)
app.use('/cart', cartRoutes)




export const initServer = ()=>{
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
}