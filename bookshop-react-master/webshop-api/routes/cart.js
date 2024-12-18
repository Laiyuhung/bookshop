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



// 獲取所有購物車
router.get("/", (req, res) => {
    const query = `
        SELECT sc.Cart_ID, sc.Member_ID, sc.Total_price, 
               p.Product_ID, p.Product_name, p.Price, sp.Quantity
        FROM SHOPPING_CART sc
        JOIN CART_PRODUCT sp ON sc.Cart_ID = sp.Cart_ID
        JOIN PRODUCT p ON sp.Product_ID = p.Product_ID
    `;
    db.execute(query, (err, results) => {
        if (err) {
            console.error("Error fetching carts:", err);
            return res.status(500).send({ message: "Internal Server Error" });
        }
        res.status(200).json(results);
    });
});

// 獲取單一用戶的購物車
router.get("/:memberId", (req, res) => {
    const { memberId } = req.params;

    if (!memberId || memberId === "undefined") {
        return res.status(400).send({ message: "Invalid memberId. Please provide a valid user ID." });
    }

    const query = `
        SELECT sc.Cart_ID, sc.Member_ID, sc.Total_price, 
               p.Product_ID, p.Product_name, p.Price, sp.Quantity
        FROM SHOPPING_CART sc
        JOIN CART_PRODUCT sp ON sc.Cart_ID = sp.Cart_ID
        JOIN PRODUCT p ON sp.Product_ID = p.Product_ID
        WHERE sc.Member_ID = ?
    `;
    db.execute(query, [memberId], (err, results) => {
        if (err) {
            console.error("Error fetching cart:", err);
            return res.status(500).send({ message: "Internal Server Error" });
        }

        if (!results || results.length === 0) {
            return res.status(404).send({ message: "No cart found for this user." });
        }

        res.status(200).json(results);
    });
});

// 新增或更新購物車商品
router.post("/", (req, res) => {
    const { memberId, productId, quantity } = req.body;

    if (!memberId || !productId || typeof quantity !== "number") {
        return res.status(400).send({ message: "Missing or invalid required fields" });
    }

    const findCartQuery = "SELECT Cart_ID FROM SHOPPING_CART WHERE Member_ID = ?";
    db.execute(findCartQuery, [memberId], (err, cartResults) => {
        if (err) {
            console.error("Error checking cart:", err);
            return res.status(500).send({ message: "Internal Server Error" });
        }

        const cartId = cartResults.length > 0 ? cartResults[0].Cart_ID : null;

        const createCartIfNeeded = new Promise((resolve, reject) => {
            if (!cartId) {
                const createCartQuery = `
                    INSERT INTO SHOPPING_CART (Member_ID, Total_price) VALUES (?, 0)
                `;
                db.execute(createCartQuery, [memberId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
            } else {
                resolve(cartId);
            }
        });

        createCartIfNeeded
            .then((resolvedCartId) => {
                const upsertProductQuery = `
                    INSERT INTO CART_PRODUCT (Cart_ID, Product_ID, Quantity)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE Quantity = GREATEST(Quantity + ?, 0)
                `;
                db.execute(upsertProductQuery, [resolvedCartId, productId, quantity, quantity], (err) => {
                    if (err) {
                        console.error("Error updating cart product:", err);
                        return res.status(500).send({ message: "Internal Server Error" });
                    }

                    const updateTotalPriceQuery = `
                        UPDATE SHOPPING_CART sc
                        JOIN (
                            SELECT sp.Cart_ID, SUM(p.Price * sp.Quantity) AS Total
                            FROM CART_PRODUCT sp
                            JOIN PRODUCT p ON sp.Product_ID = p.Product_ID
                            WHERE sp.Cart_ID = ?
                            GROUP BY sp.Cart_ID
                        ) AS updatedTotal
                        ON sc.Cart_ID = updatedTotal.Cart_ID
                        SET sc.Total_price = updatedTotal.Total
                    `;
                    db.execute(updateTotalPriceQuery, [resolvedCartId], (err) => {
                        if (err) {
                            console.error("Error updating total price:", err);
                            return res.status(500).send({ message: "Internal Server Error" });
                        }
                        res.status(200).send({ message: "Item added or updated successfully" });
                    });
                });
            })
            .catch((err) => {
                console.error("Error creating/updating cart:", err);
                res.status(500).send({ message: "Internal Server Error" });
            });
    });
});

// 刪除購物車中的指定商品
router.delete("/product/:productId", (req, res) => {
    const { productId } = req.params;
    const memberId = req.query.memberId;

    if (!memberId || !productId) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    const deleteProductQuery = `
        DELETE FROM CART_PRODUCT
        WHERE Product_ID = ? AND Cart_ID IN (
            SELECT Cart_ID FROM SHOPPING_CART WHERE Member_ID = ?
        )
    `;

    db.execute(deleteProductQuery, [productId, memberId], (err, result) => {
        if (err) {
            console.error("Error deleting product from cart:", err);
            return res.status(500).send({ message: "Internal Server Error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Product not found in cart" });
        }

        res.status(200).send({ message: "Product removed from cart successfully" });
    });
});

// 刪除購物車及相關條目
router.delete("/:memberId", (req, res) => {
    const { memberId } = req.params;

    console.log("Received memberId:", memberId); // 這會在後端控制台打印
    if (!memberId) {
        return res.status(400).json({ message: "Missing required fields", log: "memberId is missing" });
    }

    const deleteCartQuery = `DELETE FROM SHOPPING_CART WHERE Member_ID = ?`;
    db.execute(deleteCartQuery, [memberId], (err, result) => {
        if (err) {
            console.error("Error deleting cart:", err);
            return res.status(500).json({ message: "Internal Server Error", log: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cart not found for the given member", log: "No rows affected" });
        }

        res.status(200).json({ message: "Cart cleared successfully", log: "Cart cleared" });
    });
});

// 新增或更新購物車
router.post("/:memberId", async (req, res) => {
    const { memberId } = req.params;
    const { productId, quantity } = req.body;

    if (!memberId || !productId || !quantity) {
        return res.status(400).send({ message: "缺少必要參數" });
    }

    try {
        // 檢查該用戶是否已有購物車
        const [cart] = await db.promise().query(
            `SELECT Cart_ID FROM CART WHERE Member_ID = ?`,
            [memberId]
        );

        let cartId;
        if (cart.length === 0) {
            // 若無購物車，新增一個
            const [newCart] = await db.promise().query(
                `INSERT INTO CART (Member_ID, Created_Time) VALUES (?, NOW())`,
                [memberId]
            );
            cartId = newCart.insertId;
        } else {
            cartId = cart[0].Cart_ID;
        }

        // 檢查該商品是否已在購物車中
        const [cartProduct] = await db.promise().query(
            `SELECT Quantity FROM CART_PRODUCT WHERE Cart_ID = ? AND Product_ID = ?`,
            [cartId, productId]
        );

        if (cartProduct.length > 0) {
            // 若商品已存在，更新數量
            await db.promise().query(
                `UPDATE CART_PRODUCT SET Quantity = Quantity + ? WHERE Cart_ID = ? AND Product_ID = ?`,
                [quantity, cartId, productId]
            );
        } else {
            // 若商品不存在，新增商品到購物車
            await db.promise().query(
                `INSERT INTO CART_PRODUCT (Cart_ID, Product_ID, Quantity) VALUES (?, ?, ?)`,
                [cartId, productId, quantity]
            );
        }

        res.status(200).send({ message: "商品已加入購物車" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send({ message: "加入購物車失敗", error: error.message });
    }
});

module.exports = router;
