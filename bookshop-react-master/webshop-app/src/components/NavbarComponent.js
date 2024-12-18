import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import NavDropdown from "react-bootstrap/NavDropdown";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { LinkContainer } from "react-router-bootstrap";
import { BsCartFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import "../css/Navbar.css";
import { BASE_URL } from "../Constants";

function NavbarComponent({ cartItemsNumber = 0 }) {
    const [show, setShow] = useState(false);
    const [name, setName] = useState("訪客");
    const [roles, setRoles] = useState([]);
    const [vendorId, setVendorId] = useState(null); // 新增 Vendor_ID 狀態
    const navigate = useNavigate();

    const memberId = localStorage.getItem("user_id");

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                if (memberId) {
                    // 獲取使用者名稱
                    const userResponse = await fetch(`${BASE_URL}/users/${memberId}`);
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        setName(userData.Name || "使用者");
                    }

                    // 獲取用戶角色（管理員/賣家/買家）
                    const rolesResponse = await fetch(`${BASE_URL}/users/roles/${memberId}`);
                    if (rolesResponse.ok) {
                        const rolesData = await rolesResponse.json();
                        setRoles(rolesData.roles || []);
                    }

                    // 如果是賣家，獲取 Vendor_ID
                    const vendorResponse = await fetch(`${BASE_URL}/vendors/member/${memberId}`);
                    if (vendorResponse.ok) {
                        const vendorData = await vendorResponse.json();
                        if (vendorData.vendor) {
                            setVendorId(vendorData.vendor.Vendor_ID);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching user info, roles, or vendor ID:", error);
            }
        };

        fetchUserInfo();
    }, [memberId]);

    const handleLogout = () => {
        localStorage.clear();
        setRoles([]);
        setVendorId(null);
        setName("訪客");
        setShow(true);
        setTimeout(() => navigate("/"), 3000);
    };

    return (
        <>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <LinkContainer to="/">
                        <Navbar.Brand className="text-danger">
                            <img
                                className="p-1"
                                src="/images/logo.png"
                                width="40"
                                height="40"
                                alt="logo"
                            />
                            墨窩
                        </Navbar.Brand>
                    </LinkContainer>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <LinkContainer to="/">
                                <Button variant="link" className="nav-item">
                                    首頁
                                </Button>
                            </LinkContainer>
                            <LinkContainer to="/books">
                                <Button variant="link" className="nav-item">
                                    書籍瀏覽
                                </Button>
                            </LinkContainer>

                            {/* 管理員和賣家功能 */}
                            {(roles.includes("管理員") || roles.includes("賣家")) && (
                                <LinkContainer to="/manage-books">
                                    <Button variant="link" className="nav-item">
                                        書籍管理
                                    </Button>
                                </LinkContainer>
                            )}
                            {/* 管理員功能 */}
                            {roles.includes("管理員") && (
                                <>
                                    <LinkContainer to="/admin/members">
                                        <Button variant="link" className="nav-item">
                                            會員管理
                                        </Button>
                                    </LinkContainer>
                                    <LinkContainer to="/admin/orders">
                                        <Button variant="link" className="nav-item">
                                            訂單管理
                                        </Button>
                                    </LinkContainer>
                                    <LinkContainer to="/admin/coupons">
                                        <Button variant="link" className="nav-item">
                                            優惠券管理
                                        </Button>
                                    </LinkContainer>
                                    <LinkContainer to="/admin/revenues">
                                        <Button variant="link" className="nav-item">
                                            營收管理
                                        </Button>
                                    </LinkContainer>
                                </>
                            )}


                            {/* 賣家功能 */}
                            {roles.includes("賣家") && (
                                <LinkContainer to="/vendor/revenue">
                                    <Button variant="link" className="nav-item">
                                        個人營收
                                    </Button>
                                </LinkContainer>
                            )}
                        </Nav>
                        <Nav>
                            <LinkContainer to="/cart">
                                <Button variant="link" className="nav-item">
                                    <BsCartFill />
                                    購物車
                                </Button>
                            </LinkContainer>
                            {memberId ? (
                                <NavDropdown
                                    title={
                                        <span>
                                            <FaUser /> {name}
                                            {roles.includes("賣家") && vendorId && (
                                                <span className="text-muted ms-2">
                                                    (賣家ID: {vendorId})
                                                </span>
                                            )}
                                        </span>
                                    }
                                    id="nav-dropdown-dark-example"
                                    menuVariant="dark"
                                >
                                    <LinkContainer to="/profile">
                                        <NavDropdown.Item>個人資料</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/orders">
                                        <NavDropdown.Item>歷史訂單</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/coupons">
                                        <NavDropdown.Item>我的優惠券</NavDropdown.Item>
                                    </LinkContainer>
                                    <NavDropdown.Item onClick={handleLogout}>
                                        登出
                                    </NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <LinkContainer to="/auth/login">
                                    <Button variant="outline-danger">登入</Button>
                                </LinkContainer>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <ToastContainer className="p-3 top-0 end-0">
                <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
                    <Toast.Body>您已登出!</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default NavbarComponent;
