import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Alert } from "react-bootstrap";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import { BASE_URL } from "../Constants";

function MemberManagementPage() {
    const [members, setMembers] = useState([]);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [error, setError] = useState("");
    const currentMemberId = parseInt(localStorage.getItem("user_id")); // 當前用戶 ID

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/users`);
                const updatedMembers = await Promise.all(
                    response.data.map(async (member) => {
                        const adminCheckResponse = await axios.get(
                            `${BASE_URL}/users/isAdmin/${member.Member_ID}`
                        );

                        // 獲取 Vendor 狀態和 Vendor_ID
                        let vendorInfo = null;
                        try {
                            const vendorResponse = await axios.get(
                                `${BASE_URL}/vendors/member/${member.Member_ID}`
                            );
                            vendorInfo = vendorResponse.data.vendor; // 取得 vendor 物件
                        } catch (error) {
                            console.warn(`No vendor info for Member_ID ${member.Member_ID}`);
                        }

                        return {
                            ...member,
                            IsAdmin: adminCheckResponse.data.isAdmin,
                            IsVendor: vendorInfo && vendorInfo.Is_active === 1,
                            Vendor_ID: vendorInfo ? vendorInfo.Vendor_ID : "-", // 如果沒有，顯示 "-"
                        };
                    })
                );

                setMembers(updatedMembers);
            } catch (error) {
                console.error("Failed to fetch members:", error);
                setError("無法加載會員資料，請稍後再試。");
            }
        };

        fetchMembers();

        const cartItems = JSON.parse(localStorage.getItem("items")) || [];
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemsNumber(cartCount);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "未提供";
        const date = new Date(dateString);
        return date.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const handleToggleAdmin = async (targetMemberId, isAdmin) => {
        try {
            const endpoint = isAdmin
                ? `${BASE_URL}/users/removeAdmin/${targetMemberId}`
                : `${BASE_URL}/users/addAdmin/${targetMemberId}`;

            await axios.post(endpoint);

            setMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member.Member_ID === targetMemberId
                        ? { ...member, IsAdmin: !isAdmin }
                        : member
                )
            );
        } catch (error) {
            console.error("Failed to update admin status:", error);
            setError("切換管理員權限失敗，請稍後再試。");
        }
    };

    const handleToggleVendor = async (targetMemberId, isVendor) => {
        try {
            if (isVendor) {
                // 停用賣家權限
                await axios.delete(`${BASE_URL}/vendors/removeVendor/${targetMemberId}`);
            } else {
                // 啟用或新增賣家權限
                await axios.post(`${BASE_URL}/vendors/addVendor/${targetMemberId}`);
            }

            // 重新獲取 Vendor 狀態
            const vendorResponse = await axios.get(
                `${BASE_URL}/vendors/member/${targetMemberId}`
            );
            const vendorInfo = vendorResponse.data.vendor;

            setMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member.Member_ID === targetMemberId
                        ? {
                              ...member,
                              IsVendor: vendorInfo && vendorInfo.Is_active === 1,
                              Vendor_ID: vendorInfo ? vendorInfo.Vendor_ID : "-",
                          }
                        : member
                )
            );
        } catch (error) {
            console.error("Failed to update vendor status:", error);
            setError("切換賣家權限失敗，請稍後再試。");
        }
    };

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <div className="container mt-5">
                <h2 className="mb-4">會員管理</h2>
                {error && (
                    <Alert variant="danger" onClose={() => setError("")} dismissible>
                        {error}
                    </Alert>
                )}
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>名稱</th>
                            <th>Email</th>
                            <th>電話</th>
                            <th>生日</th>
                            <th>管理員權限</th>
                            <th>賣家權限</th>
                            <th>Vendor ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member, index) => (
                            <tr key={member.Member_ID}>
                                <td>{index + 1}</td>
                                <td>{member.Name}</td>
                                <td>{member.Email}</td>
                                <td>{member.Phone || "未提供"}</td>
                                <td>{formatDate(member.Birthday)}</td>
                                <td>
                                    <Form.Check
                                        type="switch"
                                        id={`admin-switch-${member.Member_ID}`}
                                        label={member.IsAdmin ? "是" : "否"}
                                        checked={member.IsAdmin || false}
                                        onChange={() =>
                                            handleToggleAdmin(member.Member_ID, member.IsAdmin)
                                        }
                                        disabled={member.Member_ID === currentMemberId} // 禁止修改自己
                                    />
                                </td>
                                <td>
                                    <Form.Check
                                        type="switch"
                                        id={`vendor-switch-${member.Member_ID}`}
                                        label={member.IsVendor ? "是" : "否"}
                                        checked={member.IsVendor || false}
                                        onChange={() =>
                                            handleToggleVendor(member.Member_ID, member.IsVendor)
                                        }
                                        disabled={member.Member_ID === currentMemberId} // 禁止修改自己
                                    />
                                </td>
                                <td>{member.Vendor_ID}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <FooterComponent />
        </>
    );
}

export default MemberManagementPage;
