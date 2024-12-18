import Container from "react-bootstrap/esm/Container";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import FooterComponent from "../components/FooterComponent";
import NavbarComponent from "../components/NavbarComponent";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";
import { useState } from "react";
import "../css/Register.css";
import { BASE_URL } from "../Constants";

function RegisterPage() {
    const [inputs, setInputs] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        coPassword: ""
    });
    const [showToast, setShowToast] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    const loggedIn = Boolean(localStorage.getItem("user_id"));

    // 處理表單輸入變化
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: value
        }));
    };

    // 提交表單
    const handleSubmit = async (e) => {
        const form = e.currentTarget;
        setValidated(true);
        e.preventDefault();

        if (form.checkValidity()) {
            try {
                const response = await fetch(`${BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: `${inputs.firstName} ${inputs.lastName}`,
                        username: inputs.username,
                        email: inputs.email,
                        password: inputs.password
                    })
                });

                const data = await response.json();
                console.log("Server Response:", data); // 用於除錯
                if (response.ok) {
                    setIsError(false);
                    setShowToast(true);

                    // 成功註冊後跳轉到登入頁面
                    setTimeout(() => {
                        navigate("/auth/login");
                    }, 3000);
                } else {
                    // 錯誤處理
                    setIsError(true);
                    setErrorMessage(data.message || "註冊失敗，請再試一次。");
                    setInputs((prevInputs) => ({
                        ...prevInputs,
                        password: "",
                        coPassword: ""
                    }));
                    setShowToast(true);
                }
            } catch (error) {
                console.error("Error during registration:", error);
                setIsError(true);
                setErrorMessage("無法連接伺服器，請稍後再試。");
                setShowToast(true);
            }
        }
    };

    return (
        <>
            <NavbarComponent navStyle="simple" />
            <Container className="container register-main d-flex justify-content-center flex-column align-items-center my-5 pt-5">
                {loggedIn ? (
                    <>
                        <h3 className="main-title">您已經註冊過了。</h3>
                        <LinkContainer to="/">
                            <Button variant="outline-danger">返回首頁</Button>
                        </LinkContainer>
                    </>
                ) : (
                    <>
                        <h1 className="main-title">註冊新帳戶</h1>
                        <Form
                            className="login-form mt-4"
                            noValidate
                            validated={validated}
                            onSubmit={handleSubmit}
                        >
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="3">
                                    使用者名稱
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="text"
                                        placeholder="使用者名稱"
                                        name="username"
                                        value={inputs.username}
                                        onChange={handleChange}
                                        pattern="^[a-z0-9_-]{3,16}$"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        請輸入有效的使用者名稱。
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="3">
                                    姓名
                                </Form.Label>
                                <Col sm="5">
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        placeholder="名字"
                                        value={inputs.firstName}
                                        onChange={handleChange}
                                        pattern="^[A-Za-z]{2,30}$"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        請輸入有效的名字(英文)。
                                    </Form.Control.Feedback>
                                </Col>
                                <Col sm="4">
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        placeholder="姓氏"
                                        value={inputs.lastName}
                                        onChange={handleChange}
                                        pattern="^[A-Za-z]{2,30}$"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        請輸入有效的姓氏(英文)。
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="3">
                                    電子郵件地址
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="email"
                                        placeholder="電子郵件地址"
                                        name="email"
                                        value={inputs.email}
                                        onChange={handleChange}
                                        pattern="^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        請輸入有效的電子郵件地址。
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="3">
                                    密碼
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="密碼"
                                        value={inputs.password}
                                        onChange={handleChange}
                                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        密碼需包含大小寫字母、數字，長度至少8字元。
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm="3">
                                    確認密碼
                                </Form.Label>
                                <Col sm="9">
                                    <Form.Control
                                        type="password"
                                        name="coPassword"
                                        placeholder="確認密碼"
                                        value={inputs.coPassword}
                                        onChange={handleChange}
                                        pattern={inputs.password}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        密碼不一致。
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <div className="text-center">
                                <Button
                                    type="submit"
                                    variant="outline-danger"
                                    className="w-50 mt-3"
                                >
                                    註冊
                                </Button>
                                <br />
                                <Form.Text className="mt-2 d-block">
                                    已經有帳號了？{" "}
                                    <LinkContainer to="/auth/login" className="login-link text-danger">
                                        <span>登入</span>
                                    </LinkContainer>
                                </Form.Text>
                            </div>
                        </Form>
                    </>
                )}
            </Container>
            <div className="register-footer">
                <FooterComponent />
            </div>
            <ToastContainer className="p-3 top-0 end-0">
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                >
                    {isError ? (
                        <>
                            <Toast.Header>
                                <strong className="me-auto text-danger">錯誤！</strong>
                            </Toast.Header>
                            <Toast.Body>{errorMessage}</Toast.Body>
                        </>
                    ) : (
                        <>
                            <Toast.Header>
                                <strong className="me-auto text-success">成功！</strong>
                            </Toast.Header>
                            <Toast.Body>註冊成功！請登入！</Toast.Body>
                        </>
                    )}
                </Toast>
            </ToastContainer>
        </>
    );
}

export default RegisterPage;
