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

// User login
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM MEMBER WHERE Email = ? AND Password = ?', [email, password]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).send({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// User registration
router.post('/register', async (req, res, next) => {
    const { name, email, password, phone, birthday } = req.body;

    // 將 undefined 值轉換為 null
    const sanitizedData = {
        name: name || null,
        email: email || null,
        password: password || null,
        phone: phone || null,
        birthday: birthday || null,
    };

    try {
        // 檢查郵箱是否已存在
        const [existingUser] = await db.execute('SELECT * FROM MEMBER WHERE Email = ?', [sanitizedData.email]);
        if (existingUser.length > 0) {
            return res.status(400).send({ message: "Email already exists" });
        }

        // 插入新用戶
        const query = `
            INSERT INTO MEMBER (Name, Email, Password, Phone, Birthday, Register_date)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const values = [
            sanitizedData.name,
            sanitizedData.email,
            sanitizedData.password,
            sanitizedData.phone,
            sanitizedData.birthday,
        ];

        const [result] = await db.execute(query, values);

        res.status(201).send({
            message: "User registered successfully",
            userId: result.insertId,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send({
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});





module.exports = router;
