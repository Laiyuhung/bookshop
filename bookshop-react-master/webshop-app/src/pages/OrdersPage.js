import React, { useState, useEffect } from "react";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import { Link } from "react-router-dom";
import { BASE_URL } from "../Constants";

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noOrders, setNoOrders] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            console.error("用戶未登入");
            setError("請先登入以查看歷史訂單");
            setLoading(false);
            return;
        }

        console.log("開始加載訂單，使用者 ID:", userId);

        fetch(`${BASE_URL}/orders/user/${userId}`)
            .then((response) => {
                console.log("API 回應狀態:", response.status);
                if (response.status === 404) {
                    setNoOrders(true);
                    return [];
                }
                if (!response.ok) {
                    throw new Error("無法取得訂單資料");
                }
                return response.json();
            })
            .then((data) => {
                if (data.length === 0) {
                    setNoOrders(true);
                } else {
                    setOrders(data);
                }
                setError(null);
            })
            .catch((err) => {
                console.error("加載訂單時發生錯誤:", err);
                setError("無法載入訂單資料，請稍後再試");
            })
            .finally(() => {
                console.log("訂單加載完成");
                setLoading(false);
            });
    }, []);

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <div className="container mt-5">
                <h2 className="text-center">歷史訂單</h2>
                {loading ? (
                    <p className="text-center">訂單加載中...</p>
                ) : error ? (
                    <div className="text-center text-danger">
                        <p>{error}</p>
                        <Link to="/" className="btn btn-primary mt-3">
                            回首頁
                        </Link>
                    </div>
                ) : noOrders ? (
                    <div className="text-center">
                        <h5 className="text-secondary">查無訂單</h5>
                        <p className="text-muted">您尚未進行任何購物，快去挑選商品吧！</p>
                        <Link to="/" className="btn btn-primary mt-3">
                            回首頁
                        </Link>
                    </div>
                ) : (
                    <div>
                        {orders.map((order) => (
                            <div key={order.Order_ID} className="card mb-4">
                                <div className="card-header">
                                    <h5>訂單編號: {order.Order_ID}</h5>
                                    <p>訂單時間: {new Date(order.Order_time).toLocaleString()}</p>
                                    <p>狀態: {order.Status}</p>
                                    <p>總金額: ${order.Total_Price}</p>
                                </div>
                                <div className="card-body">
                                    <h6>訂單商品明細：</h6>
                                    {order.products.map((product) => (
                                        <div key={product.Product_ID} className="mb-2">
                                            <p>商品名稱: {product.Product_name}</p>
                                            <p>作者: {product.Author}</p>
                                            <p>數量: {product.Quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="card-footer">
                                    <p>運送方式: {order.Package_method}</p>
                                    <p>付款方式: {order.Payment_method}</p>
                                    <p>地址: {order.Address}</p>
                                    <p>備註: {order.Notes || "無"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <FooterComponent />
        </>
    );
}

export default OrdersPage;
