import PDFDocument from 'pdfkit';
import fs from 'fs';
import User from '../user/user.model.js'
import Product from '../products/products.model.js';
import Bill from '../bill/bill.model.js';
import Cart from './cart.model.js'
import mongoose from 'mongoose';

export const addToCart = async (req, res) => {
    try {
        const { product, quantity } = req.body;
        const userId = req.user._id;

        // Buscar o crear el carrito del usuario
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, products: [], total: 0 });
        }

        // Si el carrito ya contiene productos, verificar disponibilidad en stock y actualizar el stock del producto anterior
        if (cart.products.length > 0) {
            for (const item of cart.products) {
                const existingProductData = await Product.findById(item.product);
                if (!existingProductData) {
                    return res.status(404).send({ message: 'Product not found.' });
                }

                if (existingProductData.stock < item.quantity + quantity) {
                    return res.status(400).send({ message: 'Insufficient stock for the new product.' });
                }

                // Actualizar el stock del producto anterior en el inventario
                existingProductData.stock += item.quantity;
                await existingProductData.save();
            }
        }

        // Obtener información del nuevo producto y comprobar disponibilidad en stock
        const productData = await Product.findById(product);
        if (!productData) {
            return res.status(404).send({ message: 'Product not found.' });
        }

        if (productData.stock < quantity) {
            return res.status(400).send({ message: 'Insufficient stock.' });
        }

        // Agregar el nuevo producto al carrito
        cart.products.push({ product, quantity });

        // Calcular total del carrito
        cart.total += productData.price * quantity;

        // Actualizar el stock del nuevo producto en el inventario
        productData.stock -= quantity;
        await productData.save();

        // Guardar el carrito
        await cart.save();

        // Crear instancia de factura
        const bill = new Bill({
            user: userId,
            products: cart.products.map(item => ({
                product: item.product,
                quantity: item.quantity,
                unitPrice: productData.price,
                totalPrice: productData.price * item.quantity
            })),
            amount: cart.total,
            date: new Date()
        });

        // Guardar la factura y eliminar el carrito
        await Promise.all([
            bill.save(),
            Cart.deleteOne({ _id: cart._id })
        ]);

        // Generar el PDF de la factura (si es necesario)
        await generateInvoicePDF(bill);

        return res.status(200).send({ message: 'Product added to cart successfully.', total: cart.total });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error adding product to cart.', error: error });
    }
};

export const generateInvoicePDF = async (bill) => {
    try {
        const doc = new PDFDocument();
        const pdfPath = `FACTURA_${bill._id}.pdf`;

        doc.pipe(fs.createWriteStream(pdfPath));

        // Encabezado
        doc.fontSize(20).text('DATOS', { align: 'center' }).moveDown();
        doc.fontSize(14).text(`Bill ID: ${bill._id}`, { align: 'left' }).moveDown();

        // Obtener información del usuario
        const user = await User.findById(bill.user);
        if (user) {
            doc.fontSize(14).text(`User: ${user.name}`, { align: 'left' }).moveDown(); 
        }

        doc.fontSize(14).text(`Total Amount: ${bill.amount}`, { align: 'left' }).moveDown();

        // Lista de productos
        doc.fontSize(16).text('Items:', { align: 'left' }).moveDown();
        
        if (Array.isArray(bill.products)) { 
            for (const item of bill.products) { 
                const product = await Product.findById(item.product);
                if (product) {
                    doc.fontSize(12).text(`Product: ${product.name}, Quantity: ${item.quantity}, Price: ${item.unitPrice}`, { align: 'left' }).moveDown();
                }
            }
        } else {
            console.error('Error: bill.products is not an array');
        }

        doc.end();

        return pdfPath;
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        throw error;
    }
};


//no jalo :<(

export const updateBillItem = async (req, res) => {
    try {
        const { billId, itemId, quantity } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(billId) || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).send({ message: 'Invalid bill or item ID.' });
        }

        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(404).send({ message: 'Bill not found.' });
        }

        const itemIndex = bill.items.findIndex(item => item._id.equals(itemId));
        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Item not found in the bill.' });
        }

        const item = bill.items[itemIndex];
        const productData = await Product.findById(item.product);
        if (!productData) {
            return res.status(404).send({ message: 'Product not found.' });
        }

        if (quantity > productData.stock) {
            return res.status(400).send({ message: 'Insufficient stock.' });
        }

        const oldQuantity = item.quantity;
        bill.items[itemIndex].quantity = quantity;
        bill.totalAmount += (quantity - oldQuantity) * productData.price;

        const updatedBill = await bill.save();

        return res.status(200).send({ message: 'Bill item updated successfully.', bill: updatedBill });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error updating bill item.', error: error });
    }
};

