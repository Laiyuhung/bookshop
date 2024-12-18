import React, { useState, useEffect } from "react";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import EditProfileModal from "../components/EditProfileModal";
import { Button, Spinner, Alert } from "react-bootstrap";
import "../css/ProfilePage.css";
import { BASE_URL } from "../Constants";

function ProfilePage() {
    const [modalShow, setModalShow] = useState(false);
    const [user, setUser] = useState(null);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user_id = localStorage.getItem("user_id");
    const logged_in = Boolean(user_id);

    useEffect(() => {
        if (logged_in) {
            getProfile();
        } else {
            setLoading(false);
        }

        const cartItems = JSON.parse(localStorage.getItem("items")) || [];
        const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemsNumber(cartCount);
    }, [logged_in]);

    const getProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching profile for user ID:", user_id);
            const response = await fetch(`${BASE_URL}/users/${user_id}`);
            if (!response.ok) throw new Error("Failed to fetch profile");

            const data = await response.json();

            setUser({
                name: data.Name || "尚未提供名稱",
                email: data.Email || "尚未提供 Email",
                birthday: data.Birthday || null,
                phone: data.Phone || "尚未提供手機",
            });

            console.log("Profile loaded:", data);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setError("無法加載個人資料，請稍後再試！");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("items");
        window.location.href = "/auth/login";
    };

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <div
                className="container d-flex flex-column align-items-center mt-5 pt-5"
                id="container"
            >
                {loading ? (
                    <Spinner animation="border" role="status" className="mt-5">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                ) : error ? (
                    <Alert variant="danger" className="text-center mt-5">
                        {error}
                    </Alert>
                ) : logged_in && user ? (
                    <>
                        <h3 className="main-title">
                            <u>個人資料</u>
                        </h3>
                        <dl className="profile mt-3">
                            <dt>
                                <strong>名稱: </strong>
                            </dt>
                            <dd>{user.name}</dd>
                            <dt>
                                <strong>Email: </strong>
                            </dt>
                            <dd>{user.email}</dd>
                            <dt>
                                <strong>生日: </strong>
                            </dt>
                            <dd>
                                {user.birthday
                                    ? new Date(user.birthday).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })
                                    : "尚未提供生日"}
                            </dd>
                            <dt>
                                <strong>手機: </strong>
                            </dt>
                            <dd>{user.phone}</dd>
                        </dl>
                        <div className="mt-3 d-flex gap-3">
                            <Button
                                variant="outline-danger"
                                onClick={() => setModalShow(true)}
                            >
                                編輯個人資料
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={handleLogout}
                            >
                                登出
                            </Button>
                        </div>
                        <EditProfileModal
                            user={user}
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                            getProfile={getProfile}
                        />
                    </>
                ) : (
                    <div className="text-center">
                        <h3 className="main-title">您尚未登入</h3>
                        <a href="/auth/login">前往登入頁面</a>
                    </div>
                )}
            </div>
            <FooterComponent />
        </>
    );
}

export default ProfilePage;
