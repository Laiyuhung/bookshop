const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project'
});

// Get all books
router.get('/', async (req, res) => {
    const { status, search } = req.query;

    try {
        let query = 'SELECT * FROM PRODUCT';
        const params = [];

        if (status) {
            query += ' WHERE Status = ?';
            params.push(status);
        }

        if (search) {
            query += params.length ? ' AND' : ' WHERE';
            query += ' Product_name LIKE ?';
            params.push(`%${search}%`);
        }

        const [rows] = await db.execute(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});
router.get('/one/:id', async (req, res) => {
    const { id } = req.params; // 從 URL 參數獲取 id
    const { status, search } = req.query; // 從 query string 獲取篩選條件

    try {
        let query = 'SELECT * FROM PRODUCT WHERE Seller_ID = ?';
        const params = [id]; // 初始參數包含 Seller_ID

        if (status) {
            query += ' AND Status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND Product_name LIKE ?';
            params.push(`%${search}%`);
        }

        const [rows] = await db.execute(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching seller products:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});


// Get books by status (only available)
router.get('/status/available', async (req, res) => {
    const { categories, search } = req.query;

    try {
        let query = `SELECT * FROM PRODUCT WHERE Status = ?`;
        const params = ['上架'];

        // 處理分類篩選
        if (categories) {
            const decodedCategories = decodeURIComponent(categories); // 解碼中文參數
            const categoriesArray = decodedCategories.split(',');
            const placeholders = categoriesArray.map(() => '?').join(',');
            query += ` AND Product_ID IN (
                SELECT DISTINCT Product_ID 
                FROM PRODUCT_CATEGORY pc
                JOIN BOOK_CATEGORY bc ON pc.Category_ID = bc.Category_ID
                WHERE bc.Category_name IN (${placeholders})
            )`;
            params.push(...categoriesArray);
        }

        // 處理書籍名稱搜尋
        if (search) {
            query += ` AND Product_name LIKE ?`;
            params.push(`%${search}%`);
        }

        const [rows] = await db.execute(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching available books with filters:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});





// Get book details by name
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    try {
        const decodedSlug = decodeURIComponent(slug);
        console.log(`Fetching details for book: ${decodedSlug}`);

        const [book] = await db.execute('SELECT * FROM PRODUCT WHERE Product_name = ?', [decodedSlug]);

        if (!book.length) {
            return res.status(404).send({ message: 'Book not found' });
        }

        res.status(200).send(book[0]);
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Create a new book
router.post('/', async (req, res) => {
    const { Product_name, Description, Author, Price, Stock, Status, Product_image, Seller_ID } = req.body;

    // 檢查必要欄位
    if (!Product_name || !Price || Stock === undefined || !Status) {
        return res.status(400).send({ message: "缺少必要欄位" });
    }

    try {
        // 檢查 Seller_ID 是否存在
        if (Seller_ID) {
            const [vendorCheck] = await db.execute('SELECT 1 FROM VENDOR WHERE Vendor_ID = ?', [Seller_ID]);
            if (vendorCheck.length === 0) {
                return res.status(400).send({ message: "Seller_ID 不存在" });
            }
        }

        // 插入資料，自動生成 Product_ID 和 New_arrival_date
        const [result] = await db.execute(
            `INSERT INTO PRODUCT (Product_name, Description, Author, Price, Stock, Status, Product_image, Seller_ID) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Product_name,
                Description || null,
                Author || null,
                Price,
                Stock,
                Status,
                Product_image || null,
                Seller_ID || null,
            ]
        );

        res.status(201).send({ message: "Product created successfully", productId: result.insertId });
    } catch (error) {
        console.error("Error inserting product:", error);
        res.status(500).send({ message: "Internal Server Error", error });
    }
});

// Get a single book by ID
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params; // 從 URL 取得書籍的 ID

    try {
        // 查詢指定 Product_ID 的書籍
        const query = 'SELECT * FROM PRODUCT WHERE Product_ID = ?';
        const [rows] = await db.execute(query, [id]);

        // 檢查是否找到書籍
        if (rows.length === 0) {
            return res.status(404).send({ message: "書籍不存在" });
        }

        // 回傳找到的書籍資訊
        res.status(200).json(rows[0]); // 回傳第一筆結果
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});





// Update a book by ID
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        user_id, // 來自前端傳遞的用戶 ID
        isAdmin,
        Product_name,
        Description,
        Author,
        Price,
        Stock,
        Status,
        Product_image,
    } = req.body;

    console.log("Received data:", { user_id, isAdmin });

    try {
        // 確認書籍存在
        const [book] = await db.execute("SELECT Seller_ID FROM PRODUCT WHERE Product_ID = ?", [id]);

        if (book.length === 0) {
            return res.status(404).send({ message: "書籍不存在" });
        }

        // 檢查權限
        if (!isAdmin) {
            const sellerId = book[0].Seller_ID;

            // 從 VENDOR 表中確認用戶
            const [vendor] = await db.execute("SELECT Member_ID FROM VENDOR WHERE Vendor_ID = ?", [sellerId]);
            console.log("Vendor info:", vendor);

            if (vendor.length === 0 || vendor[0].Member_ID !== Number(user_id)) {
                return res.status(403).send({ message: "您無權修改此書籍" });
            }
        }

        // 更新書籍
        const [result] = await db.execute(
            `UPDATE PRODUCT 
             SET Product_name = ?, Description = ?, Author = ?, Price = ?, Stock = ?, Status = ?, Product_image = ? 
             WHERE Product_ID = ?`,
            [Product_name, Description, Author, Price, Stock, Status, Product_image, id]
        );

        console.log("Update result:", result);
        if (result.affectedRows > 0) {
            return res.status(200).send({ message: "書籍更新成功" });
        } else {
            return res.status(404).send({ message: "書籍未找到" });
        }
    } catch (error) {
        console.error("Error updating book:", error);
        return res.status(500).send({ message: "伺服器錯誤", error });
    }
});







// Delete a book by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM PRODUCT WHERE Product_ID = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(200).send({ message: "Product deleted successfully" });
        } else {
            res.status(404).send({ message: "Product not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
