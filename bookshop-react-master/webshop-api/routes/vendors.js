const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// 資料庫連接
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "project",
});

// 1. 新增 Vendor (POST)
router.post("/", async (req, res) => {
    const { Member_ID } = req.body;

    if (!Member_ID) {
        return res.status(400).send({ message: "缺少必要的欄位: Member_ID" });
    }

    try {
        const [memberCheck] = await db.execute("SELECT * FROM MEMBER WHERE Member_ID = ?", [Member_ID]);
        if (memberCheck.length === 0) {
            return res.status(404).send({ message: "Member_ID 不存在" });
        }

        const [result] = await db.execute("INSERT INTO VENDOR (Member_ID) VALUES (?)", [Member_ID]);
        res.status(201).send({ message: "Vendor 新增成功", Vendor_ID: result.insertId });
    } catch (error) {
        console.error("Error adding vendor:", error);
        res.status(500).send({ message: "新增 Vendor 失敗", error: error.message });
    }
});

// 2. 更新 Vendor (PUT)
router.put("/:id", async (req, res) => {
    const { id } = req.params; // Vendor_ID
    const { Member_ID } = req.body;

    if (!Member_ID) {
        return res.status(400).send({ message: "缺少必要的欄位: Member_ID" });
    }

    try {
        const [memberCheck] = await db.execute("SELECT * FROM MEMBER WHERE Member_ID = ?", [Member_ID]);
        if (memberCheck.length === 0) {
            return res.status(404).send({ message: "Member_ID 不存在" });
        }

        const [vendorCheck] = await db.execute("SELECT * FROM VENDOR WHERE Vendor_ID = ?", [id]);
        if (vendorCheck.length === 0) {
            return res.status(404).send({ message: "Vendor 不存在" });
        }

        const [result] = await db.execute("UPDATE VENDOR SET Member_ID = ? WHERE Vendor_ID = ?", [Member_ID, id]);

        if (result.affectedRows > 0) {
            res.status(200).send({ message: "Vendor 更新成功" });
        } else {
            res.status(400).send({ message: "Vendor 更新失敗" });
        }
    } catch (error) {
        console.error("Error updating vendor:", error);
        res.status(500).send({ message: "更新 Vendor 失敗", error: error.message });
    }
});

// 3. 獲取所有 Vendor (GET)
router.get("/", async (req, res) => {
    try {
        const [vendors] = await db.execute("SELECT * FROM VENDOR");
        res.status(200).send(vendors);
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).send({ message: "獲取 Vendor 失敗", error: error.message });
    }
});

// 4. 根據 Member_ID 獲取 Vendor (GET)
router.get("/member/:memberId", async (req, res) => {
    const { memberId } = req.params;

    try {
        const [vendor] = await db.execute(
            "SELECT Vendor_ID, Member_ID, Is_active FROM VENDOR WHERE Member_ID = ?", 
            [memberId]
        );

        if (vendor.length === 0) {
            return res.status(200).send({ message: "該會員不是 Vendor", vendor: null });
        }

        res.status(200).send({ vendor: vendor[0] });
    } catch (error) {
        console.error("Error fetching vendor by Member_ID:", error);
        res.status(500).send({ message: "獲取 Vendor 失敗", error: error.message });
    }
});

router.get("/vendorId/:memberId", async (req, res) => {
    const { memberId } = req.params;

    try {
        // 只查詢 Vendor_ID 欄位
        const [vendor] = await db.execute(
            "SELECT Vendor_ID FROM VENDOR WHERE Member_ID = ?",
            [memberId]
        );

        if (vendor.length === 0) {
            return res.status(200).send({ message: "該會員不是 Vendor", vendorId: null });
        }

        // 回傳 Vendor_ID
        res.status(200).send({ vendorId: vendor[0].Vendor_ID });
    } catch (error) {
        console.error("Error fetching Vendor_ID:", error);
        res.status(500).send({ message: "獲取 Vendor_ID 失敗", error: error.message });
    }
});

// 5. 刪除 Vendor (DELETE)
router.delete("/:id", async (req, res) => {
    const { id } = req.params; // Vendor_ID

    try {
        // 檢查是否存在該 Vendor
        const [vendorCheck] = await db.execute("SELECT * FROM VENDOR WHERE Vendor_ID = ?", [id]);
        if (vendorCheck.length === 0) {
            return res.status(404).send({ message: "Vendor 不存在" });
        }

        // 刪除 Vendor
        const [result] = await db.execute("DELETE FROM VENDOR WHERE Vendor_ID = ?", [id]);

        if (result.affectedRows > 0) {
            res.status(200).send({ message: "Vendor 刪除成功" });
        } else {
            res.status(400).send({ message: "Vendor 刪除失敗" });
        }
    } catch (error) {
        console.error("Error deleting vendor:", error);
        res.status(500).send({ message: "刪除 Vendor 失敗", error: error.message });
    }
});

// POST: 新增賣家權限或重新啟用已存在的賣家
router.post("/addVendor/:memberId", async (req, res) => {
    const { memberId } = req.params;

    try {
        // 檢查 MEMBER 表中是否存在該會員
        const [memberCheck] = await db.execute("SELECT * FROM MEMBER WHERE Member_ID = ?", [memberId]);
        if (memberCheck.length === 0) {
            return res.status(404).send({ message: "會員不存在" });
        }

        // 檢查 VENDOR 表中是否已有該會員的賣家記錄
        const [vendorCheck] = await db.execute("SELECT * FROM VENDOR WHERE Member_ID = ?", [memberId]);

        if (vendorCheck.length > 0) {
            // 若存在，更新 Is_active 為 1（重新啟用賣家權限）
            await db.execute("UPDATE VENDOR SET Is_active = 1 WHERE Member_ID = ?", [memberId]);
            return res.status(200).send({ message: "賣家權限已重新啟用" });
        } else {
            // 若不存在，新增一筆賣家記錄
            const [result] = await db.execute("INSERT INTO VENDOR (Member_ID, Is_active) VALUES (?, 1)", [memberId]);
            return res.status(201).send({ message: "賣家權限已成功新增", Vendor_ID: result.insertId });
        }
    } catch (error) {
        console.error("Error adding or updating vendor:", error);
        res.status(500).send({ message: "無法處理賣家權限", error: error.message });
    }
});


// DELETE: 移除賣家權限
router.delete("/removeVendor/:memberId", async (req, res) => {
    const { memberId } = req.params;

    console.log("Incoming request to remove vendor with Member_ID:", memberId);

    try {
        const [vendorCheck] = await db.execute("SELECT * FROM VENDOR WHERE Member_ID = ?", [memberId]);
        console.log("Vendor Check Result:", vendorCheck);

        if (vendorCheck.length === 0) {
            console.warn("Vendor not found for Member_ID:", memberId);
            return res.status(404).send({ message: "該會員沒有賣家權限" });
        }

        await db.execute("UPDATE VENDOR SET Is_active = 0 WHERE Member_ID = ?", [memberId]);
        console.log("Vendor successfully deactivated for Member_ID:", memberId);

        res.status(200).send({ message: "賣家權限已成功停用" });
    } catch (error) {
        console.error("Error removing vendor:", error);
        res.status(500).send({ message: "無法停用賣家權限", error: error.message });
    }
});





module.exports = router;
