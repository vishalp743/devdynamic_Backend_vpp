const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

const readJSONFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file ${filePath}: ${err.message}`);
        return null;
    }
};

const writeJSONFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing file ${filePath}: ${err.message}`);
    }
};

// File paths
const inventoryFile = 'inventory.json';
const cartsFile = 'carts.json';
const customersFile = 'customers.json';
const discountCouponsFile = 'discountCoupons.json';

// Read initial data
let inventory = readJSONFile(inventoryFile) || {};
let carts = readJSONFile(cartsFile) || {};
let customers = readJSONFile(customersFile) || {};
let discountCoupons = readJSONFile(discountCouponsFile) || {};

// API to add item to inventory
app.post('/inventory/add', (req, res) => {
    const { productId, name, price, quantity } = req.body;
    if (!productId || typeof productId !== 'string' || !name || typeof name !== 'string' || !price || typeof price !== 'number' || !quantity || typeof quantity !== 'number') {
        return res.status(400).json({ error: 'Invalid input. Please provide valid data for productId, name, price, and quantity.' });
    }
    if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than zero.' });
    }
    if (inventory[productId]) {
        inventory[productId].quantity += quantity;
    } else {
        inventory[productId] = { name, price, quantity };
    }
    writeJSONFile(inventoryFile, inventory);
    res.json({ message: 'Item added to inventory', inventory });
});

// API to edit item in inventory
app.put('/inventory/edit', (req, res) => {
    const { productId, name, price, quantity } = req.body;
    if (!inventory[productId]) {
        return res.status(400).json({ error: 'Product not found in inventory.' });
    }
    if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be greater than zero.' });
    }
    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required.' });
    }
    inventory[productId] = { name, price, quantity };
    writeJSONFile(inventoryFile, inventory);
    res.json({ message: `Product ${productId} updated`, inventory });
});

// API to remove item from inventory
app.post('/inventory/remove', (req, res) => {
    const { productId } = req.body;
    if (!inventory[productId]) {
        return res.status(400).json({ error: 'Product not found in inventory.' });
    }
    delete inventory[productId];
    writeJSONFile(inventoryFile, inventory);
    res.json({ message: `Product ${productId} removed from inventory`, inventory });
});

// API to create a new discount coupon
app.post('/discount-coupon/create', (req, res) => {
    const { couponId, percentage, maxCap, validAbove } = req.body;
    if (discountCoupons[couponId]) {
        return res.status(400).json({ error: 'Coupon ID already exists.' });
    }
    if (percentage <= 0 || percentage > 100) {
        return res.status(400).json({ error: 'Invalid percentage value.' });
    }
    if (maxCap <= 0) {
        return res.status(400).json({ error: 'Invalid maxCap value.' });
    }
    if (validAbove <= 0) {
        return res.status(400).json({ error: 'Invalid validAbove value.' });
    }

    discountCoupons[couponId] = { percentage, maxCap, validAbove };
    writeJSONFile(discountCouponsFile, discountCoupons);
    res.json({ message: 'Discount coupon created', discountCoupons });
});


app.get('/discount-coupons', (req, res) => {
    res.json({ discountCoupons });
});

// API to view cart for a specific customer
app.get('/cart', (req, res) => {
    const { customerId } = req.body;
    if (!customers[customerId]) {
        return res.status(400).json({ error: 'Customer ID does not exist.' });
    }
    res.json({ cart: carts[customerId] || {} });
});
// API to view all available inventory
app.get('/inventory', (req, res) => {
    res.json({ inventory });
});

// API to add customer
app.post('/customer/add', (req, res) => {
    const { customerId, name } = req.body;
    if (customers[customerId]) {
        return res.status(400).json({ error: 'Customer ID already exists.' });
    }
    customers[customerId] = name;
    writeJSONFile(customersFile, customers);
    res.json({ message: 'Customer added', customers });
});

// API to add item to cart
app.post('/cart/add', (req, res) => {
    const { customerId, productId, quantity } = req.body;
    if (!customers[customerId]) {
        return res.status(400).json({ error: 'Customer ID does not exist.' });
    }
    if (!inventory[productId] || inventory[productId].quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient quantity in inventory.' });
    }
    if (!carts[customerId]) {
        carts[customerId] = {};
    }
    if (carts[customerId][productId]) {
        carts[customerId][productId] += quantity;
    } else {
        carts[customerId][productId] = quantity;
    }
    inventory[productId].quantity -= quantity; // Update the inventory quantity
    writeJSONFile(inventoryFile, inventory);
    writeJSONFile(cartsFile, carts);
    res.json({ message: 'Item added to cart', cart: carts[customerId] });
});

// API to remove item from cart
app.post('/cart/remove', (req, res) => {
    const { customerId, productId, quantity } = req.body;
    if (!customers[customerId]) {
        return res.status(400).json({ error: 'Customer ID does not exist.' });
    }
    if (!carts[customerId] || !carts[customerId][productId]) {
        return res.status(400).json({ error: 'Product not found in cart.' });
    }
    if (quantity <= 0 || quantity > carts[customerId][productId]) {
        return res.status(400).json({ error: 'Invalid quantity to remove.' });
    }

    carts[customerId][productId] -= quantity;
    if (carts[customerId][productId] === 0) {
        delete carts[customerId][productId];
    }

    inventory[productId].quantity += quantity; // Restore the inventory quantity
    writeJSONFile(inventoryFile, inventory);
    writeJSONFile(cartsFile, carts);
    res.json({ message: 'Item removed from cart', cart: carts[customerId] });
});

// API to calculate total price of items in a cart and fetch applicable coupons
app.post('/cart/total-price', (req, res) => {
    const { customerId } = req.body;
    if (!carts[customerId]) {
        return res.status(400).json({ error: 'Cart not found for customer.' });
    }

    let totalPrice = 0;
    const priceBreakdown = [];
    for (const productId in carts[customerId]) {
        const quantity = carts[customerId][productId];
        if (!inventory[productId]) {
            return res.status(400).json({ error: 'Product not found in inventory.' });
        }
        const { name, price } = inventory[productId];
        const itemTotalPrice = quantity * price;
        totalPrice += itemTotalPrice;
        priceBreakdown.push({ productId, name, quantity, price, total: itemTotalPrice });
    }

    carts[customerId].totalPrice = totalPrice; // Store the total price under the cart for the customer

    const applicableCoupons = Object.entries(discountCoupons)
        .filter(([couponId, coupon]) => totalPrice > coupon.validAbove)
        .map(([couponId, coupon]) => ({ couponId, percentage: coupon.percentage, maxCap: coupon.maxCap }));

    res.json({ totalPrice, applicableCoupons, priceBreakdown });
});

// API to apply discount coupon and process order
app.post('/cart/apply-discount', (req, res) => {
    const { customerId, discountId } = req.body;
    if (!customers[customerId]) {
        return res.status(400).json({ error: 'Customer ID does not exist.' });
    }
    if (!carts[customerId]) {
        return res.status(400).json({ error: 'Cart not found for customer.' });
    }

    const cartValue = carts[customerId].totalPrice;
    const discount = discountCoupons[discountId];
    if (!discount) {
        return res.status(400).json({ error: 'Invalid discount coupon.' });
    }

    let discountAmount = (discount.percentage / 100) * cartValue;
    if (discountAmount > discount.maxCap) {
        discountAmount = discount.maxCap;
    }

    const discountedValue = cartValue - discountAmount;

    // Process the order here, e.g., update the database, send confirmation emails, etc.

    // Clear the cart for the customer
    delete carts[customerId];
    writeJSONFile(cartsFile, carts);

    res.json({ message: 'Order placed successfully', originalValue: cartValue, discountAmount, discountedValue });
});


app.get('/', (req, res) => {
    res.render('showPage');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
