import Container from "react-bootstrap/esm/Container";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import InputGroup from "react-bootstrap/InputGroup";
import FooterComponent from "../components/FooterComponent";
import NavbarComponent from "../components/NavbarComponent";
import { FaUser } from "react-icons/fa";
import { FaUnlock } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";
import { useState } from "react";
import "../css/LoginPage.css";
import { BASE_URL } from "../Constants";
import { useEffect } from "react";

function LoginPage() {
    const [inputs, setInputs] = useState({ email: "", password: "" });
    const [show, setShow] = useState(false);
    const [error, setError] = useState(false);
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    const loggedIn = Boolean(localStorage.getItem("user_id"));
    
    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
            console.log("Current logged-in user ID:", userId);
            alert("您已登入，將跳轉到首頁");
            navigate("/");
        }
    }, [navigate]); // 加入依賴避免重複執行

    function handleChange(e) {
        setInputs({
            ...inputs,
            [e.target.name]: e.target.value,
        });
    }

    function handleSubmit(e) {
        const form = e.currentTarget;
    
        setValidated(true);
        e.preventDefault();
        if (form.checkValidity()) {
            fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: inputs.email,
                    password: inputs.password,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Response from server:", data); // 查看伺服器返回數據
    
                    if (data.Member_ID && data.Name) {
                        setError(false);
    
                        // 儲存到 localStorage
                        localStorage.setItem("user_id", data.Member_ID); // 用戶 ID
                        localStorage.setItem("user_name", data.Name); // 用戶名稱
                        localStorage.setItem("user_email", data.Email); // 用戶 Email
                        localStorage.setItem("user_phone", data.Phone); // 用戶電話
                        localStorage.setItem("user_last_login", data.Last_login); // 最後登入時間
    
                        console.log("LocalStorage updated successfully!");
    
                        setShow(true);
                        setTimeout(() => {
                            navigate("/");
                        }, 3000);
                    } else {
                        setError(true);
                        setInputs({ ...inputs, password: "" });
                        localStorage.clear(); // 清空 localStorage
                        console.error("Incomplete login response:", data);
                        setShow(true);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    }
    

    

    return (
        <>
            <NavbarComponent navStyle="simple" />
            <Container className="container d-flex justify-content-center flex-column align-items-center mt-5 pt-5">
                {loggedIn ? (
                    <>
                        <h3 className="main-title">您已登入</h3>
                        <LinkContainer to="/">
                            <Button variant="outline-danger">回首頁</Button>
                        </LinkContainer>
                    </>
                ) : (
                    <>
                        <h1 className="main-title">登入</h1>
                        <Form
                            className="login-form mt-4"
                            noValidate
                            validated={validated}
                            onSubmit={handleSubmit}
                        >
                            <InputGroup className="mb-3">
                                <InputGroup.Text>
                                    <FaUser />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={inputs.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    aria-label="Email"
                                    aria-describedby="basic-addon1"
                                    pattern="^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    格式錯誤
                                </Form.Control.Feedback>
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>
                                    <FaUnlock />
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={inputs.password}
                                    onChange={handleChange}
                                    placeholder="密碼"
                                    aria-label="密碼"
                                    aria-describedby="basic-addon1"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    請輸入密碼
                                </Form.Control.Feedback>
                            </InputGroup>
                            <div className="text-center">
                                <Button
                                    type="submit"
                                    variant="outline-danger"
                                    className="w-100 mt-3"
                                >
                                    登入
                                </Button>
                                <Form.Text>
                                    尚未註冊?{" "}
                                    <LinkContainer
                                        to="/auth/register"
                                        className="register-link text-danger"
                                    >
                                        <span>註冊</span>
                                    </LinkContainer>
                                </Form.Text>
                            </div>
                        </Form>
                    </>
                )}
            </Container>
            <div className="login-footer">
                <FooterComponent />
            </div>
            <ToastContainer className="p-3 top-0 end-0">
                <Toast
                    onClose={() => setShow(false)}
                    show={show}
                    delay={3000}
                    autohide
                >
                    {error ? (
                        <>
                            <Toast.Header>
                                <strong className="me-auto text-danger">錯誤!</strong>
                            </Toast.Header>
                            <Toast.Body>Email 或 密碼錯誤</Toast.Body>
                        </>
                    ) : (
                        <Toast.Body>登入成功!</Toast.Body>
                    )}
                </Toast>
            </ToastContainer>
        </>
    );
}

export default LoginPage;
