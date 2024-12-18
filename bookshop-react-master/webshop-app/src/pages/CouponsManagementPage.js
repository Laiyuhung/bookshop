import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Alert, Button, Form, Modal } from "react-bootstrap";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import { BASE_URL } from "../Constants";

function CouponsManagementPage() {
    const [coupons, setCoupons] = useState([]);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        Low_money: 0,
        Start_date: "",
        End_date: "",
        Detail: "",
        Type: "",
        Owner_ID: "",
        Sender_ID: "",
    });

    // 獲取所有優惠券
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/coupons/all`);
                setCoupons(response.data);
            } catch (error) {
                console.error("Failed to fetch coupons:", error);
                setError("無法加載優惠券資料，請稍後再試。");
            }
        };

        fetchCoupons();
    }, []);

    // 新增優惠券
    const handleAddCoupon = async () => {
        const { Low_money, Start_date, End_date, Detail, Type, Sender_ID } = newCoupon;
        if (!Low_money || !Start_date || !End_date || !Detail || !Type || !Sender_ID) {
            setError("所有欄位皆為必填項目。");
            return;
        }

        try {
            await axios.post(`${BASE_URL}/coupons/add`, newCoupon);
            setShowModal(false);
            setNewCoupon({
                Low_money: 0,
                Start_date: "",
                End_date: "",
                Detail: "",
                Type: "",
                Owner_ID: "",
                Sender_ID: "",
            });
            const response = await axios.get(`${BASE_URL}/coupons/all`);
            setCoupons(response.data);
        } catch (error) {
            console.error("Failed to add coupon:", error);
            setError("新增優惠券失敗，請稍後再試。");
        }
    };

    // 更新優惠券使用狀態
    const handleToggleCouponUsage = async (couponId, newUsageStatus) => {
        try {
            await axios.put(`${BASE_URL}/coupons/update/${couponId}`, {
                Coupon_ID: couponId,
                Used: newUsageStatus,
            });
            setCoupons((prevCoupons) =>
                prevCoupons.map((coupon) =>
                    coupon.Coupon_ID === couponId
                        ? { ...coupon, Used: newUsageStatus }
                        : coupon
                )
            );
        } catch (error) {
            console.error("Failed to update coupon usage:", error);
            setError("更新優惠券使用狀態失敗，請稍後再試。");
        }
    };

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <div className="container mt-5">
                <h2 className="mb-4">優惠券管理</h2>
                {error && (
                    <Alert variant="danger" onClose={() => setError("")} dismissible>
                        {error}
                    </Alert>
                )}
                <Button className="mb-3" onClick={() => setShowModal(true)}>
                    新增優惠券
                </Button>
                <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>最低金额</th>
                        <th>開始日期</th>
                        <th>结束日期</th>
                        <th>詳情</th>
                        <th>類型</th>
                        <th>擁有者 ID</th>
                        <th>擁有者名稱</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map((coupon, index) => (
                        <tr key={coupon.Coupon_ID}>
                            <td>{index + 1}</td>
                            <td>{coupon.Low_money}</td>
                            <td>{new Date(coupon.Start_date).toLocaleDateString("zh-TW")}</td>
                            <td>{new Date(coupon.End_date).toLocaleDateString("zh-TW")}</td>
                            <td>{coupon.Detail}</td>
                            <td>{coupon.Type}</td>
                            <td>{coupon.Owner_ID || "未指定"}</td>
                            <td>{coupon.OwnerName || "未指定"}</td>
                            <td>
                                <Button
                                    variant={coupon.Used ? "warning" : "danger"}
                                    size="sm"
                                    onClick={() =>
                                        handleToggleCouponUsage(coupon.Coupon_ID, coupon.Used ? 0 : 1)
                                    }
                                >
                                    {coupon.Used ? "恢復使用" : "取消使用"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            </div>
            <FooterComponent />

            {/* 新增優惠券 Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>新增優惠券</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>最低金額</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="輸入最低金額"
                                value={newCoupon.Low_money}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, Low_money: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>開始日期</Form.Label>
                            <Form.Control
                                type="date"
                                value={newCoupon.Start_date}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, Start_date: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>結束日期</Form.Label>
                            <Form.Control
                                type="date"
                                value={newCoupon.End_date}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, End_date: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>詳情</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="輸入詳情"
                                value={newCoupon.Detail}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, Detail: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>類型</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="輸入類型"
                                value={newCoupon.Type}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, Type: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>擁有者 ID</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="輸入擁有者 ID"
                                value={newCoupon.Owner_ID}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, Owner_ID: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>管理員 ID</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="輸入管理員 ID"
                                value={newCoupon.Sender_ID}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, Sender_ID: e.target.value })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        關閉
                    </Button>
                    <Button variant="primary" onClick={handleAddCoupon}>
                        儲存
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CouponsManagementPage;
