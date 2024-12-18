import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Toast, ToastContainer } from "react-bootstrap";
import "../../css/Modal.css";
import { BASE_URL } from "../../Constants";

function AddBookModal({ getBooks, ...props }) {
    const [bookToAdd, setBookToAdd] = useState({
        Product_name: "",
        Description: "",
        Author: "",
        Price: "",
        Stock: "",
        Product_image: "",
        Status: "上架", // 預設值
        Seller_ID: "", // 手動輸入賣家 ID
    });

    const [allCategories, setAllCategories] = useState([]); // 所有分類
    const [selectedCategories, setSelectedCategories] = useState([]); // 選中的分類
    const [validated, setValidated] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastVariant, setToastVariant] = useState("success");
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        if (props.show) {
            setBookToAdd({
                Product_name: "",
                Description: "",
                Author: "",
                Price: "",
                Stock: "",
                Product_image: "",
                Status: "上架",
                Seller_ID: "",
            });
            setSelectedCategories([]);
            setValidated(false);

            // 獲取所有分類
            const fetchCategories = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/categories`);
                    if (response.ok) {
                        const data = await response.json();
                        setAllCategories(data);
                    } else {
                        console.error("無法獲取分類");
                    }
                } catch (error) {
                    console.error("獲取分類時發生錯誤：", error);
                }
            };

            fetchCategories();
        }
    }, [props.show]);

    const handleChangeAddBooks = (e) => {
        const { name, value } = e.target;
        setBookToAdd({ ...bookToAdd, [name]: value });
    };

    const handleCategoryChange = (categoryId, checked) => {
        setSelectedCategories((prev) =>
            checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
        );
    };

    const addBook = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...bookToAdd,
                    Categories: selectedCategories,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setToastVariant("success");
                setToastMessage("書籍新增成功！");
                getBooks(); // 刷新書籍列表
                props.onHide(); // 關閉 Modal
            } else {
                setToastVariant("danger");
                setToastMessage(`新增書籍失敗: ${data.message}`);
            }
        } catch (error) {
            console.error("新增書籍時發生錯誤：", error);
            setToastVariant("danger");
            setToastMessage("新增書籍時發生錯誤，請稍後再試！");
        } finally {
            setShowToast(true);
        }
    };

    return (
        <>
            <Modal {...props} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>新增書籍</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addBook} noValidate validated={validated}>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">書籍名稱*</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    name="Product_name"
                                    value={bookToAdd.Product_name}
                                    onChange={handleChangeAddBooks}
                                    placeholder="輸入書籍名稱"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    請輸入書籍名稱
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">描述</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    name="Description"
                                    as="textarea"
                                    rows={3}
                                    value={bookToAdd.Description}
                                    onChange={handleChangeAddBooks}
                                    placeholder="輸入書籍描述"
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">作者</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    name="Author"
                                    value={bookToAdd.Author}
                                    onChange={handleChangeAddBooks}
                                    placeholder="輸入作者名稱"
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">價格*</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    name="Price"
                                    type="number"
                                    min="0"
                                    value={bookToAdd.Price}
                                    onChange={handleChangeAddBooks}
                                    placeholder="輸入價格"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    請輸入有效價格
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">庫存數量*</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    name="Stock"
                                    type="number"
                                    min="0"
                                    value={bookToAdd.Stock}
                                    onChange={handleChangeAddBooks}
                                    placeholder="輸入庫存數量"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    請輸入有效庫存
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">圖片路徑</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    name="Product_image"
                                    value={bookToAdd.Product_image}
                                    onChange={handleChangeAddBooks}
                                    placeholder="輸入圖片 URL"
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">賣家 ID*</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    name="Seller_ID"
                                    type="number"
                                    value={bookToAdd.Seller_ID}
                                    onChange={handleChangeAddBooks}
                                    placeholder="輸入賣家 ID"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    請輸入有效的賣家 ID
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">分類</Form.Label>
                            <Col sm="9">
                                {allCategories.map((category) => (
                                    <Form.Check
                                        key={category.Category_ID}
                                        type="checkbox"
                                        label={category.Category_name}
                                        onChange={(e) =>
                                            handleCategoryChange(category.Category_ID, e.target.checked)
                                        }
                                    />
                                ))}
                            </Col>
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit">新增</Button>
                            <Button variant="secondary" onClick={props.onHide} className="ms-2">取消</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <ToastContainer className="p-3 top-0 end-0">
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default AddBookModal;
