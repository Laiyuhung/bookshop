import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { BASE_URL } from "../Constants";

function EditProfileModal({ user, show, onHide, getProfile }) {
    const [email, setEmail] = useState("");
    const [birthday, setBirthday] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setEmail(user.email || "");
            setBirthday(user.birthday || "");
            setPhone(user.phone || "");
        }
    }, [user]);

    const handleSave = async () => {
        if (!email || !phone) {
            setError("Email 和手機是必填項！");
            return;
        }
        if (!/^\d{10}$/.test(phone)) {
            setError("手機號碼格式錯誤，應為 10 位數字！");
            return;
        }
        setError(null);

        const userId = localStorage.getItem("user_id");
        if (!userId) {
            alert("請先登入後再修改資料！");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    birthday,
                    phone,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update profile");
            }

            alert("資料已成功更新！");
            getProfile();
            onHide();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("更新資料時發生錯誤，請稍後再試！");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>編輯個人資料</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {error && <p className="text-danger">{error}</p>}
                    <Form.Group controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formBirthday" className="mt-3">
                        <Form.Label>生日</Form.Label>
                        <Form.Control
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formPhone" className="mt-3">
                        <Form.Label>手機</Form.Label>
                        <Form.Control
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    取消
                </Button>
                <Button variant="danger" onClick={handleSave}>
                    儲存變更
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditProfileModal;