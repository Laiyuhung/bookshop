import React, { useState, useEffect } from "react";
import { Table, Alert, Spinner } from "react-bootstrap";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import { BASE_URL } from "../Constants";
import axios from "axios";

function RevenueAnalysisPage() {
    const [revenues, setRevenues] = useState([]); // 管理員的所有營收數據
    const [personalRevenue, setPersonalRevenue] = useState(null); // 個人營收數據
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        const fetchRevenues = async () => {
            try {
                if (!userId) {
                    setError("用戶未登入，請重新登入");
                    return;
                }

                // 檢查是否為管理員
                const adminResponse = await axios.get(`${BASE_URL}/administrators/${userId}`);
                const adminStatus = adminResponse.data.isAdmin;
                setIsAdmin(adminStatus);

                // 根據角色獲取營收數據
                if (adminStatus) {
                    const allRevenuesResponse = await axios.get(`${BASE_URL}/revenues/all`);
                    setRevenues(allRevenuesResponse.data);
                } else {
                    const personalRevenueResponse = await axios.get(
                        `${BASE_URL}/revenues/vendor/${userId}`
                    );
                    setPersonalRevenue(personalRevenueResponse.data);
                }
            } catch (err) {
                console.error("Error fetching revenue data:", err);
                setError("無法加載營收數據，請稍後再試。");
            } finally {
                setLoading(false);
            }
        };

        fetchRevenues();
    }, [userId]);

    return (
        <>
            <NavbarComponent />
            <div className="container mt-5">
                <h2 className="mb-4">{isAdmin ? "所有賣家營收分析" : "個人營收分析"}</h2>

                {/* 錯誤訊息 */}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* 加載中提示 */}
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p>正在加載數據...</p>
                    </div>
                ) : (
                    // 管理員顯示所有賣家營收
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>賣家 ID</th>
                                <th>賣家名稱</th>
                                <th>總銷售量</th>
                                <th>總營收</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenues.length > 0 ? (
                                revenues.map((revenue, index) => (
                                    <tr key={revenue.Vendor_ID}>
                                        <td>{index + 1}</td>
                                        <td>{revenue.Vendor_ID}</td>
                                        <td>{revenue.Seller_Name || "未提供"}</td>
                                        <td>{revenue.Total_Sales}</td>
                                        <td>${parseFloat(revenue.Total_Revenue).toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        尚無營收數據
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                ) }
            </div>
            <FooterComponent />
        </>
    );
}

export default RevenueAnalysisPage;
