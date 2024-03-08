import PDFDocument from 'pdfkit';
import fs from 'fs';
import User from '../user/user.model.js'
import Product from '../products/products.model.js';
import Bill from '../bill/bill.model.js';
import Cart from './cart.model.js'

export const addToCart = async (req, res) => {
    try {
        const { product, quantity } = req.body;
        const uid = req.user._id;

        let cart = await Cart.findOne({ user: uid });

        if (!cart) {
            const newCart = new Cart({
                user: uid,
                products: [{ product: product, quantity }],
                total: 0
            });

            let total = 0;
            for (const item of newCart.products) {
                const productData = await Product.findById(item.product);
                if (productData) {
                    total += productData.price * item.quantity;
                }
            }
            newCart.total = total;

            await newCart.save();

            // Crear instancia de Bill
            const billI = [];
            for (const item of newCart.products) {
                const productData = await Product.findById(item.product);
                if (productData) {
                    billI.push({
                        product: item.product,
                        quantity: item.quantity,
                        unitPrice: productData.price,
                        totalPrice: productData.price * item.quantity
                    });
                }
            }

            // Calcular el total para el campo amount
            const amount = newCart.total;

            // Crear la instancia de Bill
            const bill = new Bill({
                user: newCart.user,
                products: billI,
                amount: amount,
                date: new Date()
            });
            await bill.save();

            return res.status(200).send({ message: 'Product added to cart successfully.', total });
        } else {
            return res.status(400).send({ message: 'Cart already exists.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error registering', error: error });
    }
};

export const generateInvoicePDF = async (bill) => {
    try {
        const doc = new PDFDocument();
        const pdfPath = `invoice_${bill._id}.pdf`;

        doc.pipe(fs.createWriteStream(pdfPath));

        // Encabezado
        doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();
        doc.fontSize(14).text(`Bill ID: ${bill._id}`, { align: 'left' }).moveDown();

        // Obtener información del usuario
        const user = await User.findById(bill.user);
        if (user) {
            doc.fontSize(14).text(`User: ${user.name}`, { align: 'left' }).moveDown(); 
        }

        doc.fontSize(14).text(`Total Amount: ${bill.amount}`, { align: 'left' }).moveDown();

        // Lista de productos
        doc.fontSize(16).text('Items:', { align: 'left' }).moveDown();
        
        if (Array.isArray(bill.Product)) {
            for (const item of bill.Product) {
                const product = await Product.findById(item.product);
                if (product) {
                    doc.fontSize(12).text(`Product: ${product.name}, Quantity: ${item.quantity}, Price: ${item.unitPrice}`, { align: 'left' }).moveDown();
                }
            }
        } else {
            console.error('Error: bill.Product is not an array');
        }

        doc.end();

        return pdfPath;
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        throw error;
    }
};

