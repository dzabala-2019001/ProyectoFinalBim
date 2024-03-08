'use strict'

import Category from './category.model.js'
import Product from '../products/products.model.js'
import { checkUpdateCT } from '../utils/validator.js'

export const testC = (req, res)=>{
    console.log('test is runingsd')
    return res.send({message: 'test is running category'})
}


export const saveC = async (req, res) => {
    try {
        let data = req.body;

        // Mira si lac categoria ya existe
        const existingCategory = await Category.findOne({ name: data.name });
        if (existingCategory) {
            return res.status(400).send({ message: 'Category already exists' });
        }
        let category = new Category(data);
        await category.save();
        return res.send({ message: `Registered successfully, can be logged with name ${category.name}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error registering category', error: err });
    }
}



export const obtenerCT = async(req, res)=>{
    try {
        const category = await Category.find();
        return res.send(category)
    } catch (err) {
        console.error(err);
        return res.status(500).send({message: 'error when recovering the category how sad :('})
    }
}

export const updateCT = async(req, res)=>{
    try {
        let {id} = req.params
        let data = req.body
        let update = checkUpdateCT(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update or missing data'})
        let updateCategory = await Category.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        if (!updateCategory) return res.status(401).send({ message: 'Category not found' })
        return res.send({ message: 'Category', updateCategory })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating' })
        
    }
}

export const searchC = async(req, res) => {
    try {
        let { search } = req.body
        let category = await Category.find({name: search})
        if(!category) return res.status(404).send({message: 'Category not found'})
        return res.send({message: 'category found', category})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error searching Category'})
    }
}

export const deleteC = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Eliminar la categoría
        const deletedCategory = await Category.findOneAndDelete({ _id: id });
        if (!deletedCategory) {
            return res.status(404).send({ message: 'Category not found and not deleted' });
        }
        
        // Encontrar la nueva categoría
        const cambio = await Category.findOne({ _id: { $ne: id } });
        
        // Actualizar los productos con la nueva categoría
        await Product.updateMany(
            { category: id },
            { $set: { category: cambio._id } }
        );

        return res.send({ message: `Category with name ${deletedCategory.name} deleted successfully` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error deleting Category' });
    }
}

export const defaultCategory = async (req, res) => {
    try {
        const categoryExist = await Category.findOne({ name: 'default' })

        if (categoryExist) {
            return console.log('default')
        }
        let data = {
            name: 'default',
            description: 'default'
        }
        let category = new Category(data)
        await category.save()
        console.log(data)
    } catch (err) {
        console.error(err)
    }
}

