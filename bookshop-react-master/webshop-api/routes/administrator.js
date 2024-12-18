const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();

// Database connection
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "project",
});

// 獲取所有管理員
router.get("/", async (req, res) => {
    try {
        const query = `
            SELECT m.Member_ID, m.Name, m.Email, m.Phone, m.Birthday
            FROM MEMBER m
            INNER JOIN ADMINISTRATOR a ON m.Member_ID = a.Member_ID
        `;
        const [admins] = await db.query(query);
        res.status(200).json(admins);
    } catch (error) {
        console.error("Error fetching administrators:", error);
        res.status(500).send({ message: "無法獲取管理員列表", error: error.message });
    }
});

// 新增管理員
router.post("/", async (req, res) => {
    const { memberId } = req.body;

    if (!memberId) {
        return res.status(400).send({ message: "請提供會員 ID" });
    }

    try {
        // 檢查會員是否已存在於 ADMINISTRATOR 表
        const [check] = await db.query("SELECT * FROM ADMINISTRATOR WHERE Member_ID = ?", [memberId]);
        if (check.length > 0) {
            return res.status(409).send({ message: "該會員已經是管理員" });
        }

        // 新增到 ADMINISTRATOR 表
        await db.query("INSERT INTO ADMINISTRATOR (Member_ID) VALUES (?)", [memberId]);
        res.status(201).send({ message: `會員 ${memberId} 已成功設為管理員` });
    } catch (error) {
        console.error("Error adding administrator:", error);
        res.status(500).send({ message: "無法新增管理員", error: error.message });
    }
});

// 刪除管理員
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM ADMINISTRATOR WHERE Member_ID = ?", [id]);
        if (result.affectedRows > 0) {
            res.status(200).send({ message: `會員 ${id} 已被移除管理員身份` });
        } else {
            res.status(404).send({ message: `未找到會員 ${id} 的管理員記錄` });
        }
    } catch (error) {
        console.error("Error deleting administrator:", error);
        res.status(500).send({ message: "無法刪除管理員", error: error.message });
    }
});

// 獲取單一會員是否為管理員
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT COUNT(*) AS isAdmin 
            FROM ADMINISTRATOR 
            WHERE Member_ID = ?
        `;
        const [rows] = await db.query(query, [id]);
        res.status(200).json({ isAdmin: rows[0].isAdmin > 0 });
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).send({ message: "無法檢查管理員身份", error: error.message });
    }
});

module.exports = router;
