'use strict'

import Products from './products.model.js'
import { checkUpdateP } from '../utils/validator.js'
import Cart from '../bill/bill.model.js'

export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const registerP = async(req, res)=>{
    try {
        let data = req.body
        // Mira si exite la categoria 
        const existingProduct = await Products.findOne({ name: data.name });
        if (existingProduct) {
            return res.status(400).send({ message: 'Products already exists' });
        }
        let product = new Products(data)
        await product.save()
        return res.send({message: `Registered succesfully, can be logged with name ${product.name}`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error registering product', err: err})
    }
}


export const updateP = async(req, res)=>{
    try {
        let { id } = req.params
        let data = req.body
        let update = checkUpdateP(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be updated'})
        let updatedProducts = await Products.findOneAndUpdate(
            {_id: id},
            data,
            {new: true}
        )
        if(!updatedProducts) return res.status(404).send({message: 'Product not found and not updated'})
        return res.send({message: 'Product updated', updatedProducts})    
    } catch (err) {
        console.error(err)
        if(err.keyValue && err.keyValue.name) return res.status(400).send ({message: `Product ${err.keyValue.name} is already taken`})
        return res.status(500).send({message: 'Error updating product'})
    }
}

export const deletePr = async(req, res)=>{
    try {
        let { id } = req.params;
        let deletedProduct = await Products.findOneAndDelete({_id: id});
        if(!deletedProduct) return res.status(404).send({message: 'Product not found and not deleted'}); 
        return res.send({message: `Product with name ${deletedProduct.name} deleted successfully`});
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'Error deleting product'});
    }
}

//revisar xq no jala :(
//Ya jalo siuu
export const search = async (req, res) => {
    try {
        let { search } = req.body;
        let products = await Products.find({ name: { $regex: search, $options: 'i' } });
        
        if (products.length === 0) {
            return res.status(404).send({ message: 'Product not found' });
        }
        
        return res.send({ message: 'Product found', products });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching products' });
    }
}

export const catalogue = async (req, res) => {
    try {
        let data = await Products.find().populate('category')
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'the information cannot be brought' })
    }
}

//Buscar por categoria
export const searchCategoy = async (req, res)=>{
    try {
        let {search} = req.body
        let product = await Products.find(
            {category: search}
        ).populate('category')
        if(!product) return res.status(404).send({menssage: 'product not found'})
        return res.send({menssage: 'Product found', product})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Error searching product'})
    }
}

export const exhausted = async (req, res) => {
    try {
        let data = await Products.find({ stock: 0 }).populate('category')
        if (!data) return res.status(444).send({ message: "there are no products out of stock" })
        return res.send({ data })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'the information cannot be brought' })
    }
}

export const obtenerProductosMasVendidos = async (req, res) => {
    try {
        // obtiene los carritos
        const carts = await Cart.find();
        
        // Crear un objeto para almacenar la cantidad de ventas de cada producto
        let productosVendidos = {};
        
        //contar la cantidad de cada producto vendido
        carts.forEach(cart => {
            cart.products.forEach(item => {
                const productId = item.product;
                const quantity = item.quantity;
                
                if (productosVendidos[productId]) {
                    productosVendidos[productId] += quantity;
                } else {
                    productosVendidos[productId] = quantity;
                }
            });
        });
        
        // Ordenar los productos por la cantidad vendida en orden descendente
        const sortedProductos = Object.entries(productosVendidos).sort((a, b) => b[1] - a[1]);
        
        // Obtener los detalles de los productos más vendidos
        let productosMasVendidos = [];
        for (let [productId, quantity] of sortedProductos) {
            const product = await Products.findById(productId);
            if (product) {
                productosMasVendidos.push({ product, quantity });
            }
        }
        
        return res.send({ message: 'Productos más vendidos encontrados', productosMasVendidos });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al obtener los productos más vendidos' });
    }
}
