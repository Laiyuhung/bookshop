import React, { useState, useEffect } from "react";
import { Table, Alert, Spinner, Row, Col } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import { BASE_URL } from "../Constants";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function RevenueAnalysisPage() {
    const [personalRevenue, setPersonalRevenue] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        const fetchPersonalRevenue = async () => {
            try {
                if (!userId) {
                    setError("用戶未登入，請重新登入");
                    return;
                }

                const response = await axios.get(`${BASE_URL}/revenues/vendor/${userId}`);
                setPersonalRevenue(response.data);
            } catch (err) {
                console.error("Error fetching personal revenue data:", err);
                setError("無法加載個人營收數據，請稍後再試。");
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalRevenue();
    }, [userId]);

    const generateChartData = () => {
        if (!personalRevenue || !personalRevenue.Books) return {};

        const labels = personalRevenue.Books.map((book) => book.Product_name);
        const salesData = personalRevenue.Books.map((book) => book.Total_Sales);
        const revenueData = personalRevenue.Books.map((book) => parseFloat(book.Total_Revenue).toFixed(2));

        const pieData = {
            labels,
            datasets: [
                {
                    label: "銷售佔比",
                    data: salesData,
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                },
            ],
        };

        const salesBarData = {
            labels,
            datasets: [
                {
                    label: "銷售量",
                    data: salesData,
                    backgroundColor: "#36A2EB",
                },
            ],
        };

        const revenueBarData = {
            labels,
            datasets: [
                {
                    label: "營收",
                    data: revenueData,
                    backgroundColor: "#FF6384",
                },
            ],
        };

        return { pieData, salesBarData, revenueBarData };
    };

    const { pieData, salesBarData, revenueBarData } = generateChartData();

    return (
        <>
            <NavbarComponent />
            <div className="container mt-5">
                <h2 className="mb-4">個人營收分析</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p>正在加載數據...</p>
                    </div>
                ) : (
                    <>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>書籍名稱</th>
                                    <th>總銷售量</th>
                                    <th>總營收</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personalRevenue?.Books?.length > 0 ? (
                                    personalRevenue.Books.map((book, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{book.Product_name}</td>
                                            <td>{book.Total_Sales}</td>
                                            <td>${parseFloat(book.Total_Revenue).toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            尚無營收數據
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colSpan="2">總計</th>
                                    <th>{personalRevenue?.Total_Sales || 0}</th>
                                    <th>${parseFloat(personalRevenue?.Total_Revenue || 0).toFixed(2)}</th>
                                </tr>
                            </tfoot>
                        </Table>

                        <Row className="mt-4">
                            <Col md={6}>
                                <h4>銷售量分布</h4>
                                <Bar data={salesBarData} />
                            </Col>
                            <Col md={6}>
                                <h4>營收分布</h4>
                                <Bar data={revenueBarData} />
                            </Col>
                        </Row>

                        <Row className="mt-4" >
                            <Col>
                                <h4 style={{marginTop:"4rem"}}>銷售比例</h4>
                                <div className="sale-pie"  style={{
        maxWidth: "500px",
        maxHeight: "500px",
        margin: "0 auto", // 水平置中
        display: "flex", // 使用 Flexbox
        justifyContent: "center", // 水平置中
        alignItems: "center", // 垂直置中
    }}>
                                <Pie data={pieData} />
                                </div>
                            </Col>
                        </Row>
                    </>
                )}
            </div>
            <FooterComponent />
        </>
    );
}

export default RevenueAnalysisPage;
