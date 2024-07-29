const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage});

const connection = mysql.createConnection({
    host: 'db4free.net',
    user: 'rajeev1',
    password: 'Greenhalo273',
    database: 'clothingapp999'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// enable form processing
app.use(express.urlencoded({
    extended: false
}));

// enable static files
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM products';
    // Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving products');
        }
        // Render HTML page with data
        res.render('index', {products: results});
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/product/:id', (req,res) => {
    // Extract the product ID from the request parameters
    const product_id = req.params.id;
    const sql = 'SELECT * FROM products WHERE product_id = ?';
    // Fetch data from MySQL based on the product ID
    connection.query(sql, [product_id], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving product by ID');
        }
        // Check if any product with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the product data
            res.render('product', {product: results[0]});
        } else{
            // if no product with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Product not found');
        }
    });
});


app.get('/addProduct', (req, res) => {
    res.render('addProduct');
});

app.post('/addProduct', upload.single('image'), (req, res) => {
    // Extract product data from the request body
    const {name, quantity, desc, price} = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; // Save only the filename
    } else {
        image = null;
    }

    const sql = 'INSERT INTO products (productName, Quantity, `Desc`, Price, image) VALUES (?, ?, ?, ?, ?)';
    // Insert the new product into the database
    connection.query(sql, [name, quantity, desc, price, image], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding product", error);
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

app.get('/editProduct/:id', (req, res) => {
    const product_id = req.params.id;
    const sql = 'SELECT * FROM products WHERE product_id = ?';
    // Fetch data from MySQL based on the product ID
    connection.query(sql, [product_id], (error, results) => {
        if (error) {
            console.error("Database query error", error.message);
            return res.status(500).send("Error retrieving product by ID");
        }
        // Check if any product with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the product data
            res.render("editProduct", { product: results[0] });
        } else {
            // If no product with the given ID was found, render a 404 page or handle it accordingly
            res.status('404').send('Product not found');
        }
    });
});

app.post('/editProduct/:id', upload.single('image'), (req, res) => {
    const product_id = req.params.id;
    // Extract product data from the request body
    const {name, quantity, desc, price} = req.body;
    let image = req.body.currentImage; // retrieve current image filename
    if (req.file) { // if new image is uploaded
        image = req.file.filename; // Set image to be new image filename
    } else {
        image = null;
    }

    const sql = 'UPDATE products SET productName = ? , Quantity = ? , `Desc` = ?, Price = ? , image = ? WHERE product_id = ?';

    // Insert the new product into the database
    connection.query(sql, [name, quantity, desc, price, image, product_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating product:", error);
            res.status(500).send('Error updating product');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});



app.get('/deleteProduct/:id', (req, res) => {
    const product_id = req.params.id;
    const sql = 'DELETE FROM products WHERE product_id = ?';
    connection.query( sql, [product_id], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error('Error deleting product:', error);
            res.status(500).send('Error deleting product');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});