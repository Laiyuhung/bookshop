import React, { useState, useEffect } from "react";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import { BASE_URL } from "../Constants";
import { Link } from "react-router-dom";

function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            setError("請先登入以查看優惠券");
            setLoading(false);
            return;
        }

        // 從 localStorage 獲取購物車數量
        const cartItems = JSON.parse(localStorage.getItem("items")) || [];
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemsNumber(cartCount);

        // 從後端 API 獲取優惠券
        fetch(`${BASE_URL}/coupons/${userId}`)
            .then((response) => {
                if (response.status === 404) {
                    setCoupons([]);
                    return [];
                }
                if (!response.ok) {
                    throw new Error("無法獲取優惠券資料");
                }
                return response.json();
            })
            .then((data) => {
                setCoupons(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Error fetching coupons:", err);
                setError("無法載入優惠券資料，請稍後再試");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <div className="container mt-5">
                <h2 className="text-center mb-4">我的優惠券</h2>
                {loading ? (
                    <div className="text-center">
                        <p>加載中...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-danger">
                        <p>{error}</p>
                        <Link to="/auth/login" className="btn btn-primary mt-3">
                            登入帳戶
                        </Link>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center">
                        <h5 className="text-secondary">目前無可用的優惠券</h5>
                        <p className="text-muted">請前往購物以獲取優惠券</p>
                        <Link to="/books" className="btn btn-primary mt-3">
                            前往購物
                        </Link>
                    </div>
                ) : (
                    <div className="row">
                        {coupons.map((coupon) => (
                            <div key={coupon.Coupon_ID} className="col-md-4 mb-4">
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title text-primary">
                                            {coupon.Detail}
                                        </h5>
                                        <p className="card-text">
                                            <strong>最低消費：</strong>${coupon.Low_money}
                                        </p>
                                        <p className="card-text">
                                            <strong>有效期限：</strong>
                                            {new Date(coupon.Start_date).toLocaleDateString()} -{" "}
                                            {new Date(coupon.End_date).toLocaleDateString()}
                                        </p>
                                    </div>
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

export default CouponsPage;
