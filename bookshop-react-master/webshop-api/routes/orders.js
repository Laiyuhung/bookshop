const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const uuid = require("uuid");

// 連接到 MySQL 資料庫
const db = mysql.createPool({
    host: "localhost",
    user: "root", // 請替換為你的 MySQL 使用者名稱
    password: "", // 請替換為你的 MySQL 密碼
    database: "project" // 替換為你的資料庫名稱
});

// 將 undefined 轉換為 null
function convertUndefinedToNull(obj) {
    for (let key in obj) {
        if (obj[key] === undefined) {
            obj[key] = null;  // 把 undefined 改為 null
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            convertUndefinedToNull(obj[key]); // 如果是物件，再遞迴處理
        }
    }
    return obj;
}
//取得單一會員所有訂單
router.get("/user/:memberId", async (req, res) => {
    const { memberId } = req.params;

    if (!memberId) {
        return res.status(400).send({ message: "缺少 memberId" });
    }

    try {
        // 查詢主表 ORDER_ 中的所有訂單
        const orderQuery = `
            SELECT 
                o.Order_ID,
                o.Order_time,
                o.Status,
                o.Status_update_time,
                o.Package_method,
                o.Payment_method,
                o.Address,
                o.Notes,
                o.Coupon_used_ID,
                o.Total_Price
            FROM ORDER_ o
            WHERE o.Buyer_ID = ?
            ORDER BY o.Order_time DESC
        `;
        const [orders] = await db.promise().query(orderQuery, [memberId]);

        if (orders.length === 0) {
            return res.status(404).send({ message: "查無訂單" });
        }

        // 查詢每個訂單的商品明細
        const orderIds = orders.map(order => order.Order_ID);
        const productQuery = `
            SELECT 
                op.Order_ID,
                p.Product_ID,
                p.Product_name,
                p.Description,
                p.Author,
                p.Price,
                op.Quantity
            FROM ORDER_PRODUCT op
            JOIN PRODUCT p ON op.Product_ID = p.Product_ID
            WHERE op.Order_ID IN (?)
        `;
        const [products] = await db.promise().query(productQuery, [orderIds]);

        // 整合主表訂單與商品明細
        const ordersWithProducts = orders.map(order => {
            return {
                ...order,
                products: products.filter(product => product.Order_ID === order.Order_ID)
            };
        });

        res.status(200).json(ordersWithProducts);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send({ message: "伺服器內部錯誤", error: error.message });
    }
});

// 取得所有訂單 ok
router.get("/", (req, res) => {
    const query = `
        SELECT 
            Order_ID, 
            Order_time, 
            Package_method, 
            Payment_method, 
            Address, 
            Notes, 
            Total_Price, 
            Status 
        FROM ORDER_
    `;

    db.execute(query, (err, results) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).send({ message: "Internal Server Error" });
        }
        res.status(200).json(results);
    });
});


// 更新訂單狀態並更新時間
router.put("/updateStatus", async (req, res) => {
    const { Order_ID, Status } = req.body;

    console.log("Received Order_ID:", Order_ID);
    console.log("Received Status:", Status); // 查看是否接收到 Status

    if (!Order_ID || !Status) {
        return res.status(400).send({ message: "缺少必要參數" });
    }

    try {
        const statusUpdateTime = new Date();
        console.log("Generated Status_update_time:", statusUpdateTime);

        if (!Status || !Order_ID) {
            return res.status(400).send({ message: "請提供有效的 Status 和 Order_ID" });
        }
        const result = await db.promise().query( //  取得結果物件和欄位資訊
            "UPDATE ORDER_ SET Status = ?, Status_update_time = ? WHERE Order_ID = ?",
            [Status, statusUpdateTime, Order_ID]
        );

        const [rows, fields] = result;
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "訂單未找到" });
        }

        res.status(200).send({ message: "訂單狀態更新成功" });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});






// 取得指定 ID 的訂單 ok
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.execute("SELECT * FROM ORDER_ WHERE Order_ID = ?", [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: "Internal Server Error" });
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).send({ message: "Order not found" });
        }
    });
});

// 新增訂單 ok
router.post("/", async (req, res) => {
    const { buyerId, address, paymentMethod, shippingMethod, notes, couponUsedId, items, total } = req.body;

    if (!buyerId || !items || items.length === 0) {
        return res.status(400).send({ message: "缺少必要的訂單資訊" });
    }

    try {
        // 檢查庫存
        const productIds = items.map((item) => item.Product_ID);
        const quantities = items.reduce((map, item) => {
            map[item.Product_ID] = item.Quantity;
            return map;
        }, {});

        const query = `SELECT Product_ID, Stock FROM PRODUCT WHERE Product_ID IN (?)`;
        const [results] = await db.promise().query(query, [productIds]);

        const insufficientStock = results.filter((product) => product.Stock < quantities[product.Product_ID]);

        if (insufficientStock.length > 0) {
            return res.status(400).send({ 
                message: "庫存不足", 
                insufficientStock 
            });
        }

        // 減少庫存量
        const updateStockPromises = items.map((item) => {
            return db.promise().query(
                `UPDATE PRODUCT SET Stock = Stock - ? WHERE Product_ID = ? AND Stock >= ?`,
                [item.Quantity, item.Product_ID, item.Quantity]
            );
        });

        await Promise.all(updateStockPromises);

        // 新增訂單到資料庫
        const orderQuery = `
            INSERT INTO ORDER_ (Buyer_ID, Address, Payment_Method, Package_Method, Notes, Coupon_used_ID, Total_Price, Order_time, Status_update_time, Status)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), '未處理')
        `;
        const [orderResult] = await db.promise().query(orderQuery, [
            buyerId,
            address,
            paymentMethod,
            shippingMethod,
            notes,
            couponUsedId,
            total
        ]);

        const orderId = orderResult.insertId;

        // 新增訂單商品到訂單明細表
        const orderProductQuery = `
            INSERT INTO ORDER_PRODUCT (Order_ID, Product_ID, Quantity, Price)
            VALUES ?
        `;
        const orderProductValues = items.map((item) => [orderId, item.Product_ID, item.Quantity, item.Price]);
        await db.promise().query(orderProductQuery, [orderProductValues]);

        // 更新優惠券為已使用
        if (couponUsedId) {
            const updateCouponQuery = `UPDATE COUPON SET Used = 1 WHERE Coupon_ID = ?`;
            await db.promise().query(updateCouponQuery, [couponUsedId]);
        }

        res.status(200).send({ message: "訂單提交成功", orderId });
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).send({ message: "訂單提交失敗", error: error.message });
    }
});








// 刪除指定 ID 的訂單 ok
router.delete("/:orderId", (req, res) => {
    const { orderId } = req.params;

    // 開始事務處理
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start failed:", err);
            return res.status(500).send({ message: "Transaction Start Error", error: err.message });
        }

        // 檢查 `order_product` 是否有關聯資料
        db.query("SELECT * FROM order_product WHERE Order_ID = ?", [orderId], (err, orderProducts) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Failed to query order_product:", err);
                    res.status(500).send({ message: "Error querying order_product", error: err.message });
                });
            }

            // 刪除子表數據（如果存在）
            const deleteOrderProducts = new Promise((resolve, reject) => {
                if (orderProducts.length > 0) {
                    db.query("DELETE FROM order_product WHERE Order_ID = ?", [orderId], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                } else {
                    resolve(); // 如果子表沒有數據，直接 resolve
                }
            });

            // 刪除主表數據
            deleteOrderProducts
                .then(() => {
                    return new Promise((resolve, reject) => {
                        db.query("DELETE FROM ORDER_ WHERE Order_ID = ?", [orderId], (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        });
                    });
                })
                .then((result) => {
                    if (result.affectedRows > 0) {
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Commit failed:", err);
                                    res.status(500).send({
                                        message: "Transaction Commit Error",
                                        error: err.message,
                                    });
                                });
                            }

                            // 成功刪除
                            res.status(200).send({
                                message: `Order with ID ${orderId} deleted successfully`,
                            });
                        });
                    } else {
                        // 如果主表中沒有找到對應數據
                        db.rollback(() => {
                            res.status(404).send({
                                message: `Order with ID ${orderId} not found`,
                            });
                        });
                    }
                })
                .catch((err) => {
                    // 捕獲異常並回滾
                    db.rollback(() => {
                        console.error("Error during deletion:", err);
                        res.status(500).send({
                            message: "Internal Server Error",
                            error: err.message,
                        });
                    });
                });
        });
    });
});

// 獲取指定訂單的詳細內容
router.get("/details/:orderId", async (req, res) => {
    const { orderId } = req.params;

    try {
        // 查詢訂單基本資訊以及商品詳細資訊
        const query = `
            SELECT 
                o.Order_ID,
                o.Order_time,
                o.Package_method,
                o.Payment_method,
                o.Address,
                o.Notes,
                o.Total_Price,
                p.Product_name,
                op.Quantity,
                op.Price
            FROM ORDER_ o
            JOIN ORDER_PRODUCT op ON o.Order_ID = op.Order_ID
            JOIN PRODUCT p ON op.Product_ID = p.Product_ID
            WHERE o.Order_ID = ?
        `;

        const [orderDetails] = await db.promise().query(query, [orderId]);

        if (orderDetails.length === 0) {
            return res.status(404).send({ message: "未找到指定的訂單" });
        }

        // 整理回應格式
        const order = {
            Order_ID: orderDetails[0].Order_ID,
            Order_time: orderDetails[0].Order_time,
            Package_method: orderDetails[0].Package_method,
            Payment_method: orderDetails[0].Payment_method,
            Address: orderDetails[0].Address,
            Notes: orderDetails[0].Notes,
            Total_Price: orderDetails[0].Total_Price,
            products: orderDetails.map((item) => ({
                Product_name: item.Product_name,
                Quantity: item.Quantity,
                Price: item.Price,
            })),
        };

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send({ message: "無法獲取訂單詳細內容" });
    }
});



module.exports = router;
