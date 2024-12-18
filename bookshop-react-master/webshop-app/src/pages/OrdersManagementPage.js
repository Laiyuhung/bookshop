import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Alert, Form, Button, Modal } from "react-bootstrap";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import { BASE_URL } from "../Constants";

function OrdersManagementPage() {
    const [orders, setOrders] = useState([]);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null); // 儲存選中的訂單
    const [showDetails, setShowDetails] = useState(false); // 控制 Modal 開關

    // Fetch orders from the server
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/orders`);
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                setError("無法加載訂單資料，請稍後再試。");
            }
        };

        fetchOrders();

        const cartItems = JSON.parse(localStorage.getItem("items")) || [];
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemsNumber(cartCount);
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "未提供";
        const date = new Date(dateString);
        return date.toLocaleString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Handle order status change
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`${BASE_URL}/orders/updateStatus`, {
                Order_ID: orderId,
                Status: newStatus,
            });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.Order_ID === orderId ? { ...order, Status: newStatus } : order
                )
            );
        } catch (error) {
            console.error("Failed to update order status:", error);
            setError("更新訂單狀態失敗，請稍後再試。");
        }
    };

    // 顯示訂單詳細內容
    const handleShowDetails = async (orderId) => {
        try {
            const response = await axios.get(`${BASE_URL}/orders/details/${orderId}`);
            setSelectedOrder(response.data); // 儲存訂單詳細內容
            setShowDetails(true); // 開啟 Modal
        } catch (error) {
            console.error("Failed to fetch order details:", error);
            setError("無法加載訂單詳細內容，請稍後再試。");
        }
    };

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <div className="container mt-5">
                <h2 className="mb-4">訂單管理</h2>
                {error && (
                    <Alert variant="danger" onClose={() => setError("")} dismissible>
                        {error}
                    </Alert>
                )}
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>訂單編號</th>
                            <th>成立時間</th>
                            <th>包裹方式</th>
                            <th>付款方式</th>
                            <th>地址</th>
                            <th>總金額</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order.Order_ID}>
                                <td>{index + 1}</td>
                                <td>{order.Order_ID}</td>
                                <td>{formatDate(order.Order_time)}</td>
                                <td>{order.Package_method || "未提供"}</td>
                                <td>{order.Payment_method || "未提供"}</td>
                                <td>{order.Address || "未提供"}</td>
                                <td>${order.Total_Price}</td>
                                <td>
                                    <Form.Select
                                        value={order.Status}
                                        onChange={(e) =>
                                            handleStatusChange(order.Order_ID, e.target.value)
                                        }
                                    >
                                        <option value="未處理">未處理</option>
                                        <option value="處理中">處理中</option>
                                        <option value="已出貨">已出貨</option>
                                        <option value="完成">完成</option>
                                        <option value="取消">取消</option>
                                    </Form.Select>
                                </td>
                                <td>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleShowDetails(order.Order_ID)}
                                    >
                                        查看詳細
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <FooterComponent />

            {/* 訂單詳細內容 Modal */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>訂單詳細內容</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder ? (
                        <div>
                            <h5>訂單編號: {selectedOrder.Order_ID}</h5>
                            <p>成立時間: {formatDate(selectedOrder.Order_time)}</p>
                            <p>包裹方式: {selectedOrder.Package_method}</p>
                            <p>付款方式: {selectedOrder.Payment_method}</p>
                            <p>地址: {selectedOrder.Address}</p>
                            <p>備註: {selectedOrder.Notes || "無"}</p>
                            <p>總金額: ${selectedOrder.Total_Price}</p>
                            <h6>商品明細：</h6>
                            <ul>
                                {selectedOrder.products.map((product) => (
                                    <li key={product.Product_ID}>
                                        {product.Product_name} - 數量: {product.Quantity} - 單價: ${product.Price}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>正在加載訂單詳細內容...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetails(false)}>
                        關閉
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default OrdersManagementPage;
