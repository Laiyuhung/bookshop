const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// 資料庫連接
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // 替換為你的資料庫密碼
    database: "project", // 資料庫名稱
});

// 1. 獲取所有賣家營收資料 (Admin)
router.get("/all", async (req, res) => {
    try {
        const query = `
            SELECT 
                p.Seller_ID AS Vendor_ID, 
                m.Name AS Seller_Name, 
                SUM(op.Quantity) AS Total_Sales, 
                SUM(op.Quantity * op.Price) AS Total_Revenue
            FROM PRODUCT p
            JOIN ORDER_PRODUCT op ON p.Product_ID = op.Product_ID
            JOIN VENDOR v ON p.Seller_ID = v.Vendor_ID
            JOIN MEMBER m ON v.Member_ID = m.Member_ID
            GROUP BY p.Seller_ID, m.Name
            ORDER BY Total_Revenue DESC;
        `;

        const [results] = await db.execute(query);
        res.status(200).send(results);
    } catch (error) {
        console.error("Error fetching all vendor revenues:", error);
        res.status(500).send({ message: "無法獲取賣家營收數據", error: error.message });
    }
});

// 2. 獲取單一賣家各本書的營收資料 (Vendor)
router.get("/vendor/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        // 查詢各本書的銷售數據與總營收
        const bookQuery = `
            SELECT 
                p.Product_ID,
                p.Product_name,
                SUM(op.Quantity) AS Total_Sales,
                SUM(op.Quantity * op.Price) AS Total_Revenue
            FROM PRODUCT p
            JOIN ORDER_PRODUCT op ON p.Product_ID = op.Product_ID
            JOIN VENDOR v ON p.Seller_ID = v.Vendor_ID
            WHERE v.Member_ID = ?
            GROUP BY p.Product_ID, p.Product_name
            ORDER BY Total_Revenue DESC;
        `;

        // 查詢賣家總營收
        const totalQuery = `
            SELECT 
                SUM(op.Quantity) AS Total_Sales,
                SUM(op.Quantity * op.Price) AS Total_Revenue
            FROM PRODUCT p
            JOIN ORDER_PRODUCT op ON p.Product_ID = op.Product_ID
            JOIN VENDOR v ON p.Seller_ID = v.Vendor_ID
            WHERE v.Member_ID = ?;
        `;

        // 執行查詢
        const [bookResults] = await db.execute(bookQuery, [userId]);
        const [totalResults] = await db.execute(totalQuery, [userId]);

        // 若沒有銷售數據，返回空結果
        if (bookResults.length === 0) {
            return res.status(200).send({
                message: "目前無營收數據",
                Total_Sales: 0,
                Total_Revenue: 0,
                Books: [],
            });
        }

        // 返回各本書的數據與總營收
        res.status(200).send({
            Books: bookResults,
            Total_Sales: totalResults[0]?.Total_Sales || 0,
            Total_Revenue: totalResults[0]?.Total_Revenue || 0,
        });
    } catch (error) {
        console.error("Error fetching vendor revenue:", error);
        res.status(500).send({ message: "無法獲取營收數據", error: error.message });
    }
});


module.exports = router;
