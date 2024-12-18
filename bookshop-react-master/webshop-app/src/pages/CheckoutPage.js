import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import Container from "react-bootstrap/esm/Container";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { BASE_URL } from "../Constants";

function CheckoutPage() {
    const [userId] = useState(localStorage.getItem("user_id") || null);
    const [cartItems, setCartItems] = useState([]);
    const [totalCartValue, setTotalCartValue] = useState(0); // 購物金額
    const [shippingFee, setShippingFee] = useState(100); // 運費
    const [discount, setDiscount] = useState(0); // 折扣金額
    const [couponUsedId, setCouponUsedId] = useState(null); // 優惠券ID
    const [availableCoupons, setAvailableCoupons] = useState([]); // 優惠券清單
    const [selectedCoupon, setSelectedCoupon] = useState(null); // 已選優惠券
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("信用卡");
    const [shippingMethod, setShippingMethod] = useState("宅配到府");
    const [notes, setNotes] = useState(""); // 備註
    const [promoMessage, setPromoMessage] = useState(""); // 優惠訊息
    const [show, setShow] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    // 獲取購物車資料
    const fetchCartItems = async () => {
        if (!userId) {
            setErrorMessage("用戶未登入，請登入後再試！");
            setError(true);
            setShow(true);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/cart/${userId}`);
            if (!response.ok) throw new Error("無法獲取購物車數據");

            const data = await response.json();
            setCartItems(data);

            const total = data.reduce(
                (acc, item) => acc + parseFloat(item.Price) * item.Quantity,
                0
            );
            setTotalCartValue(total);
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setErrorMessage("無法獲取購物車數據，請稍後再試！");
            setError(true);
            setShow(true);
        }
    };

    // 獲取用戶可用優惠券
    const fetchAvailableCoupons = async () => {
        if (!userId) {
            setErrorMessage("用戶未登入，請登入後再試！");
            setError(true);
            setShow(true);
            return;
        }
    
        try {
            const response = await fetch(`${BASE_URL}/coupons/${userId}`);
            if (!response.ok) throw new Error("無法獲取優惠券資料");
    
            const data = await response.json();
            setAvailableCoupons(data);
        } catch (error) {
            console.error("Error fetching available coupons:", error);
            setErrorMessage("無法獲取優惠券資料，請稍後再試！");
            setError(true);
            setShow(true);
        }
    };
    

    useEffect(() => {
        fetchCartItems();
        fetchAvailableCoupons();
    }, []);

    // 處理優惠券選擇
    const handleCouponChange = (event) => {
        const selectedCouponId = event.target.value;
        const selectedCoupon = availableCoupons.find((coupon) => coupon.Coupon_ID === parseInt(selectedCouponId));
    
        if (selectedCoupon) {
            // 檢查是否達到低消限制
            if (totalCartValue >= selectedCoupon.Low_money) {
                setCouponUsedId(selectedCoupon.Coupon_ID);
    
                if (selectedCoupon.Type === "no_deliverfee") {
                    // 處理免運費
                    setShippingFee(0);
                    setDiscount(0);
                    setPromoMessage(`已套用優惠券：免運費 (${selectedCoupon.Detail})`);
                } else if (selectedCoupon.Type.startsWith("*")) {
                    // 處理打折
                    const discountRate = parseFloat(selectedCoupon.Type.slice(1)); // 解析折扣率，例如 *0.95
                    if (!isNaN(discountRate)) {
                        const discountValue = Math.round(totalCartValue * (1 - discountRate)); // 四捨五入
                        setDiscount(discountValue);
                        setPromoMessage(`已套用優惠券：${selectedCoupon.Detail}`);
                    } else {
                        setPromoMessage(`無法識別的折扣類型：${selectedCoupon.Type}`);
                        setDiscount(0);
                    }
                } else if (!isNaN(Number(selectedCoupon.Type))) {
                    // 處理固定折扣金額
                    const discountValue = Number(selectedCoupon.Type);
                    setDiscount(discountValue);
                    setPromoMessage(`已套用優惠券：折扣金額 ${discountValue} (${selectedCoupon.Detail})`);
                } else {
                    // 無效的類型
                    setPromoMessage(`無法識別的優惠類型：${selectedCoupon.Type}`);
                    setDiscount(0);
                }
            } else {
                setPromoMessage(`未達到低消限制 ($${selectedCoupon.Low_money})`);
                setCouponUsedId(null);
                setDiscount(0);
                setShippingFee(100); // 還原運費
            }
        } else {
            setCouponUsedId(null);
            setDiscount(0);
            setShippingFee(100); // 還原運費
            setPromoMessage("未選擇優惠券");
        }
    };
    
    
    
    

    // 計算總金額（四捨五入）
    const totalAmount = Math.round(totalCartValue + shippingFee - discount);

    // 提交訂單
    const handlePlaceOrder = async () => {
        if (!address) {
            setErrorMessage("請填寫運送地址！");
            setError(true);
            setShow(true);
            return;
        }
    
        const orderData = {
            buyerId: userId,
            address,
            paymentMethod,
            shippingMethod,
            notes,
            couponUsedId,
            items: cartItems.map((item) => ({
                Product_ID: item.Product_ID,
                Quantity: item.Quantity,
                Price: item.Price,
            })),
            total: totalAmount,
        };
    
        // 打印 orderData 進行檢查
        console.log("Submitting order with data:", orderData);
    
        try {
            const response = await fetch(`${BASE_URL}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });
    
            if (!response.ok) {
                const data = await response.json();
                if (data.message === "庫存不足") {
                    const insufficientStockItems = data.insufficientStock
                        .map((item) => {
                            const cartItem = cartItems.find((ci) => ci.Product_ID === item.Product_ID);
                            return cartItem ? cartItem.Product_name : "未知商品";
                        })
                        .join(", ");
                    setErrorMessage(`以下商品庫存不足: ${insufficientStockItems}`);
                    setError(true);
                    setShow(true);
                    return;
                }
                throw new Error("提交訂單失敗");
            }
    
            const clearCartResponse = await fetch(`${BASE_URL}/cart/${userId}`, {
                method: "DELETE",
            });
    
            if (!clearCartResponse.ok) {
                throw new Error("清空購物車失敗");
            }
    
            setCartItems([]);
            setTotalCartValue(0);
            setDiscount(0);
            setShippingFee(100);
            setPromoMessage("");
            setError(false);
            setShow(true);
            setTimeout(() => navigate("/"), 3000);
        } catch (error) {
            console.error("Error placing order:", error);
            setErrorMessage(`提交訂單失敗: ${error.message}`);
            setError(true);
            setShow(true);
        }
    };
    

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItems.length} />
            <Container className="mt-5 pt-5">
                <h2 className="text-center">結帳頁面</h2>
                {cartItems.length === 0 ? (
                    <h4 className="text-center">您的購物車為空</h4>
                ) : (
                    <div>
                        <h4>購物明細</h4>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>商品名稱</th>
                                    <th>價格</th>
                                    <th>數量</th>
                                    <th>小計</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.Product_ID}>
                                        <td>{item.Product_name}</td>
                                        <td>${parseFloat(item.Price).toFixed(2)}</td>
                                        <td>{item.Quantity}</td>
                                        <td>${(item.Quantity * parseFloat(item.Price)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h4 className="text-end">購物金額: ${totalCartValue.toFixed(2)}</h4>

                        <h4>選擇優惠券</h4>
                        <select
                            className="form-control mb-3"
                            value={couponUsedId || ""}
                            onChange={handleCouponChange}
                        >
                            <option value="">不使用優惠券</option>
                            {availableCoupons.map((coupon) => (
                                <option key={coupon.Coupon_ID} value={coupon.Coupon_ID}>
                                    {coupon.Detail} - 低消: ${coupon.Low_money}
                                </option>
                            ))}
                        </select>
                        <p>{promoMessage}</p>

                        {selectedCoupon && (
                            <div>
                                <h4>優惠券資訊</h4>
                                <p>描述: {selectedCoupon.Detail}</p>
                                <p>
                                    折扣金額: $
                                    {typeof selectedCoupon.Low_money === "number"
                                        ? selectedCoupon.Low_money.toFixed(2)
                                        : "0.00"}
                                </p>
                            </div>
                        )}
                        <h4>折扣金額: ${typeof discount === "number" ? discount.toFixed(2) : "0.00"}</h4>
                        <h4>運費: ${shippingFee.toFixed(2)}</h4>
                        <h4>總金額: ${totalAmount.toFixed(2)}</h4>

                        <h4>運送方式</h4>
                        <div className="form-check">
                            <input
                                type="radio"
                                id="homeDelivery"
                                name="shippingMethod"
                                value="宅配到府"
                                className="form-check-input"
                                checked={shippingMethod === "宅配到府"}
                                onChange={(e) => setShippingMethod(e.target.value)}
                            />
                            <label htmlFor="homeDelivery" className="form-check-label">
                                宅配到府
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="radio"
                                id="storePickup"
                                name="shippingMethod"
                                value="超商取貨"
                                className="form-check-input"
                                checked={shippingMethod === "超商取貨"}
                                onChange={(e) => setShippingMethod(e.target.value)}
                            />
                            <label htmlFor="storePickup" className="form-check-label">
                                超商取貨
                            </label>
                        </div>

                        <h4>運送地址</h4>
                        <textarea
                            className="form-control mb-3"
                            placeholder="請輸入運送地址"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        ></textarea>

                        <h4>備註</h4>
                        <textarea
                            className="form-control mb-3"
                            placeholder="請輸入備註（例如：希望晚上送貨）"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>

                        <h4>付款方式</h4>
                        <div className="form-check">
                            <input
                                type="radio"
                                id="creditCard"
                                name="paymentMethod"
                                value="信用卡"
                                className="form-check-input"
                                checked={paymentMethod === "信用卡"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label htmlFor="creditCard" className="form-check-label">
                                信用卡
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="radio"
                                id="bankTransfer"
                                name="paymentMethod"
                                value="銀行轉帳"
                                className="form-check-input"
                                checked={paymentMethod === "銀行轉帳"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label htmlFor="bankTransfer" className="form-check-label">
                                銀行轉帳
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="radio"
                                id="cashOnDelivery"
                                name="paymentMethod"
                                value="貨到付款"
                                className="form-check-input"
                                checked={paymentMethod === "貨到付款"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label htmlFor="cashOnDelivery" className="form-check-label">
                                貨到付款
                            </label>
                        </div>

                        <div className="d-flex justify-content-center mt-4 gap-3">
                            <Link to="/cart" className="btn btn-secondary">
                                返回購物車
                            </Link>
                            <button className="btn btn-success" onClick={handlePlaceOrder}>
                                提交訂單
                            </button>
                        </div>
                    </div>
                )}
            </Container>
            <FooterComponent />
            <ToastContainer className="p-3 bottom-0 end-0">
                <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
                    {error ? (
                        <Toast.Body className="text-danger">{errorMessage}</Toast.Body>
                    ) : (
                        <Toast.Body className="text-success">訂單提交成功！</Toast.Body>
                    )}
                </Toast>
            </ToastContainer>
        </>
    );
}

export default CheckoutPage;
