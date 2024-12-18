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




// 獲取用戶角色
router.get("/roles/:memberId", async (req, res) => {
    const { memberId } = req.params;

    if (!memberId) {
        return res.status(400).send({ message: "缺少必要的參數: memberId" });
    }

    try {
        const roles = [];

        // 檢查是否為管理員
        const [adminResult] = await db.execute(
            "SELECT * FROM ADMINISTRATOR WHERE Member_ID = ?",
            [memberId]
        );
        if (adminResult.length > 0) {
            roles.push("管理員");
        }

        // 檢查是否為賣家 (Vendor)
        const [vendorResult] = await db.execute(
            "SELECT * FROM VENDOR WHERE Member_ID = ? AND Is_active = 1",
            [memberId]
        );
        if (vendorResult.length > 0) {
            // isSeller = true;
            roles.push("賣家");
        }

        // 所有註冊用戶預設為買家
        const [buyerResult] = await db.execute(
            "SELECT * FROM MEMBER WHERE Member_ID = ?",
            [memberId]
        );
        if (buyerResult.length > 0) {
            roles.push("買家");
        }

        // 回傳角色資訊
        return res.status(200).send({ roles });
    } catch (error) {
        console.error("Error fetching user roles:", error);
        return res.status(500).send({
            message: "無法獲取用戶角色",
            error: error.message,
        });
    }
});

// 獲取所有會員 ok
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM MEMBER");
        res.status(200).json(rows); // 返回會員列表
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

// 獲取單一會員
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute("SELECT * FROM MEMBER WHERE Member_ID = ?", [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]); // 返回指定會員
        } else {
            res.status(404).send({ message: `User with ID ${id} not found` });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

// 刪除會員
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute("DELETE FROM MEMBER WHERE Member_ID = ?", [id]);
        if (result.affectedRows > 0) {
            res.status(200).send({ message: `User with ID ${id} deleted successfully` });
        } else {
            res.status(404).send({ message: `User with ID ${id} not found` });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

// 更新會員
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { email, birthday, phone } = req.body;

    try {
        const query = `
            UPDATE MEMBER 
            SET Email = ?, Birthday = ?, Phone = ?
            WHERE MEMBER_ID = ?
        `;
        await db.query(query, [email, birthday, phone, id]); // 使用正確的 `db.query` 方法
        res.status(200).send({ message: "資料已更新" });
    } catch (error) {
        console.error("更新資料時發生錯誤:", error);
        res.status(500).send({ message: "伺服器錯誤" });
    }
});



router.post("/", async (req, res) => {
  const { Member_ID, Name, Email, Password, Phone, Birthday } = req.body;

  // 檢查必要欄位
  if (!Member_ID || !Name || !Email || !Password || !Phone || !Birthday) {
      return res.status(400).send({ message: "Please complete all required fields" });
  }

  try {
      const [result] = await db.execute(
          `INSERT INTO MEMBER (Member_ID, Name, Email, Password, Phone, Birthday) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [Member_ID, Name, Email, Password, Phone, Birthday]
      );

      res.status(201).send({ message: "User created successfully", id: Member_ID });
  } catch (error) {
      console.error("Error creating user:", error);

      if (error.code === "ER_DUP_ENTRY") {
          res.status(409).send({ message: "Email or Member_ID already exists" });
      } else {
          res.status(500).send({ message: "Internal Server Error", error: error.message });
      }
  }
});

// 檢查是否為 Admin
router.get("/isAdmin/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute("SELECT * FROM ADMINISTRATOR WHERE Member_ID = ?", [id]);
        if (rows.length > 0) {
            res.status(200).json({ isAdmin: true });
        } else {
            res.status(200).json({ isAdmin: false });
        }
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
});

// 新增管理員
router.post("/addAdmin/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("INSERT INTO ADMINISTRATOR (Member_ID) VALUES (?)", [id]);
        res.status(200).send({ message: `Member ${id} added as admin successfully` });
    } catch (error) {
        console.error("Error adding admin:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// 移除管理員
router.post("/removeAdmin/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute("DELETE FROM ADMINISTRATOR WHERE Member_ID = ?", [id]);
        res.status(200).send({ message: `Member ${id} removed from admin successfully` });
    } catch (error) {
        console.error("Error removing admin:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
