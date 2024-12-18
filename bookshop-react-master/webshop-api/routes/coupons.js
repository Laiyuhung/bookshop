const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// 資料庫連接
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "project"
});

// 獲取所有優惠券
router.get("/all", async (req, res) => {
    try {
        const query = `
            SELECT 
                c.Coupon_ID, 
                c.Low_money, 
                c.Start_date, 
                c.End_date, 
                c.Detail, 
                c.Type, 
                c.Used, 
                c.Owner_ID, 
                m.Name AS OwnerName, 
                a.Admin_ID AS SenderAdminID
            FROM 
                COUPON c
                LEFT JOIN MEMBER m ON c.Owner_ID = m.Member_ID
                LEFT JOIN ADMINISTRATOR a ON c.Sender_ID = a.Admin_ID
        `;

        const [coupons] = await db.promise().query(query);
        res.status(200).send(coupons);
    } catch (error) {
        console.error("Error fetching all coupons:", error);
        res.status(500).send({ message: "无法获取所有优惠券", error: error.message });
    }
});

// 獲取特定用戶的優惠券
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        console.error("Missing user ID");
        return res.status(400).send({ message: "缺少用戶 ID" });
    }

    try {
        const query = `
            SELECT * 
            FROM COUPON 
            WHERE Owner_ID = ? AND Used = 0 AND Start_date <= CURDATE() AND End_date >= CURDATE()
        `;
        const [coupons] = await db.promise().query(query, [userId]);

        if (coupons.length === 0) {
            console.warn("No valid coupons found for user ID:", userId);
            return res.status(404).send({ message: "未找到可用的優惠券" });
        }

        console.log("Coupons fetched successfully for user ID:", userId);
        res.status(200).send(coupons);
    } catch (error) {
        console.error("Error fetching coupons for user ID:", userId, error);
        res.status(500).send({ message: "無法獲取優惠券", error: error.message });
    }
});

// 新增優惠券
router.post("/add", (req, res) => {
    const { Low_money, Start_date, End_date, Detail, Type, Owner_ID, Sender_ID } = req.body;

    if (!Low_money || !Start_date || !End_date || !Detail || !Type || !Sender_ID) {
        console.error("Missing required fields:", req.body);
        return res.status(400).send({ message: "缺少必要的欄位" });
    }

    const addCouponQuery = `
        INSERT INTO COUPON (Low_money, Start_date, End_date, Detail, Type, Owner_ID, Sender_ID)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.execute(
        addCouponQuery,
        [Low_money, Start_date, End_date, Detail, Type, Owner_ID || null, Sender_ID],
        (err, result) => {
            if (err) {
                console.error("Error adding coupon:", req.body, err);
                return res.status(500).send({ message: "新增優惠券失敗" });
            }
            console.log("Coupon added successfully with ID:", result.insertId);
            res.status(201).send({ message: "新增優惠券成功", couponId: result.insertId });
        }
    );
});

// 刪除優惠券
router.delete("/delete/:couponId", (req, res) => {
    const { couponId } = req.params;

    if (!couponId) {
        console.error("Missing coupon ID for deletion");
        return res.status(400).send({ message: "缺少優惠券 ID" });
    }

    const deleteCouponQuery = `
        DELETE FROM COUPON WHERE Coupon_ID = ?
    `;

    db.execute(deleteCouponQuery, [couponId], (err, result) => {
        if (err) {
            console.error("Error deleting coupon with ID:", couponId, err);
            return res.status(500).send({ message: "刪除優惠券失敗" });
        }

        if (result.affectedRows === 0) {
            console.warn("No coupon found with ID:", couponId);
            return res.status(404).send({ message: "未找到對應的優惠券" });
        }

        console.log("Coupon deleted successfully with ID:", couponId);
        res.status(200).send({ message: "優惠券刪除成功" });
    });
});

// 更新優惠券狀態
router.put("/update/:couponId", (req, res) => {
    const { couponId } = req.params;
    const { Used } = req.body;

    if (!couponId || Used === undefined) {
        console.error("Missing required fields for coupon update:", req.body);
        return res.status(400).send({ message: "缺少必要的欄位" });
    }

    const updateCouponQuery = `
        UPDATE COUPON SET Used = ? WHERE Coupon_ID = ?
    `;

    db.execute(updateCouponQuery, [Used, couponId], (err, result) => {
        if (err) {
            console.error("Error updating coupon with ID:", couponId, err);
            return res.status(500).send({ message: "更新優惠券狀態失敗" });
        }

        if (result.affectedRows === 0) {
            console.warn("No coupon found with ID:", couponId);
            return res.status(404).send({ message: "未找到對應的優惠券" });
        }

        console.log("Coupon updated successfully with ID:", couponId);
        res.status(200).send({ message: "優惠券狀態更新成功" });
    });
});

// 檢查單一優惠券的使用狀態
router.get("/check/:couponId", async (req, res) => {
    const { couponId } = req.params;

    if (!couponId) {
        return res.status(400).send({ message: "缺少優惠券 ID" });
    }

    try {
        const query = `SELECT Used FROM COUPON WHERE Coupon_ID = ?`;
        const [result] = await db.query(query, [couponId]);

        if (result.length === 0) {
            return res.status(404).send({ message: "未找到對應的優惠券" });
        }

        const isUsed = result[0].Used === 1;
        res.status(200).send({ couponId, isUsed });
    } catch (error) {
        console.error("Error checking coupon usage:", error);
        res.status(500).send({ message: "檢查優惠券使用狀態失敗", error: error.message });
    }
});



module.exports = router;
