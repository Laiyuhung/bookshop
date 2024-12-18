const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// 資料庫連接
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "project",
});

// 1. 獲取所有書籍類別
router.get("/", async (req, res) => {
    try {
        const query = "SELECT * FROM BOOK_CATEGORY";
        const [categories] = await db.promise().query(query);

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send({ message: "無法獲取書籍類別", error: error.message });
    }
});

// 2. 查找單一本書的所有類別
router.get("/:productId", async (req, res) => {
    const { productId } = req.params;

    try {
        const query = `
            SELECT bc.Category_ID, bc.Category_name
            FROM BOOK_CATEGORY bc
            JOIN PRODUCT_CATEGORY pc ON bc.Category_ID = pc.Category_ID
            WHERE pc.Product_ID = ?
        `;

        const [categories] = await db.promise().query(query, [productId]);

        res.status(200).json({
            productId,
            categories,
        });
    } catch (error) {
        console.error("Error fetching book categories:", error);
        res.status(500).send({ message: "無法獲取書籍的類別", error: error.message });
    }
});

// 3. 查找所有書籍及其對應的類別
router.get("/books-with-categories", async (req, res) => {
    try {
        const query = `
            SELECT 
                p.Product_ID, 
                p.Product_name, 
                GROUP_CONCAT(bc.Category_name) AS Categories
            FROM PRODUCT p
            LEFT JOIN PRODUCT_CATEGORY pc ON p.Product_ID = pc.Product_ID
            LEFT JOIN BOOK_CATEGORY bc ON pc.Category_ID = bc.Category_ID
            GROUP BY p.Product_ID, p.Product_name
        `;

        const [booksWithCategories] = await db.promise().query(query);

        res.status(200).json(booksWithCategories);
    } catch (error) {
        console.error("Error fetching books with categories:", error);
        res.status(500).json({ error: "Failed to fetch books with categories" });
    }
});

// 4. 新增單一書籍的類別
router.post("/add-category-to-book", async (req, res) => {
    const { productId, categoryId } = req.body;

    if (!productId || !categoryId) {
        return res.status(400).send({ message: "Product ID 和 Category ID 是必須的" });
    }

    try {
        const query = `
            INSERT INTO PRODUCT_CATEGORY (Product_ID, Category_ID) 
            VALUES (?, ?)
        `;
        const [result] = await db.promise().query(query, [productId, categoryId]);

        res.status(201).send({
            message: "類別已成功新增到書籍",
            affectedRows: result.affectedRows,
        });
    } catch (error) {
        console.error("Error adding category to book:", error);
        if (error.code === "ER_DUP_ENTRY") {
            res.status(409).send({ message: "該類別已經存在於該書籍中" });
        } else {
            res.status(500).send({ message: "伺服器錯誤", error: error.message });
        }
    }
});

// 5. 移除單一書籍的類別
router.delete("/remove-category-from-book", async (req, res) => {
    const { productId, categoryId } = req.body;

    if (!productId || !categoryId) {
        return res.status(400).send({ message: "Product ID 和 Category ID 是必須的" });
    }

    try {
        const query = `
            DELETE FROM PRODUCT_CATEGORY 
            WHERE Product_ID = ? AND Category_ID = ?
        `;
        const [result] = await db.promise().query(query, [productId, categoryId]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "未找到要移除的書籍類別關聯" });
        }

        res.status(200).send({
            message: "類別已成功從書籍中移除",
            affectedRows: result.affectedRows,
        });
    } catch (error) {
        console.error("Error removing category from book:", error);
        res.status(500).send({ message: "伺服器錯誤", error: error.message });
    }
});

// 6. 根據類別篩選書籍
router.get("/books-by-categories", async (req, res) => {
    const { categories } = req.query;

    try {
        let query = `
            SELECT p.Product_ID, p.Product_name, p.Description, p.Price, p.Stock, p.Product_image
            FROM PRODUCT p
            JOIN PRODUCT_CATEGORY pc ON p.Product_ID = pc.Product_ID
            JOIN BOOK_CATEGORY bc ON pc.Category_ID = bc.Category_ID
        `;
        const queryParams = [];

        // 加入篩選條件
        if (categories) {
            const categoriesArray = categories.split(",");
            const placeholders = categoriesArray.map(() => "?").join(",");
            query += ` WHERE bc.Category_name IN (${placeholders})`;
            queryParams.push(...categoriesArray);
        }

        // 確保書籍狀態為 "上架"
        query += categories ? ` AND p.Status = '上架'` : ` WHERE p.Status = '上架'`;

        query += ` GROUP BY p.Product_ID`;

        const [books] = await db.promise().query(query, queryParams);
        res.status(200).json(books);
    } catch (error) {
        console.error("Error fetching books by categories:", error);
        res.status(500).send({ message: "無法根據類別獲取書籍", error: error.message });
    }
});


module.exports = router;
