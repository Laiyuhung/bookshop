import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { BASE_URL } from "../../Constants";
import "../../css/Modal.css";

function EditBookModal({ show, onHide, book, getBooks, userId, isAdmin }) {
    const [updatedBook, setUpdatedBook] = useState({
        Product_name: "",
        Description: "",
        Author: "",
        Price: "",
        Stock: "",
        Status: "上架",
        Product_image: "",
        Seller_ID: "",
    });

    const [validated, setValidated] = useState(false);
    const [allCategories, setAllCategories] = useState([]); // 可用分類
    const [selectedCategories, setSelectedCategories] = useState([]); // 當前選中的分類

    // 初始化書籍資料及分類
    useEffect(() => {
        const fetchBookDetails = async () => {
            if (show && book?.Product_ID) {
                try {
                    // 獲取書籍詳細資料
                    const bookResponse = await fetch(`${BASE_URL}/books/detail/${book.Product_ID}`);
                    if (bookResponse.ok) {
                        const bookData = await bookResponse.json();
                        setUpdatedBook({
                            Product_name: bookData.Product_name || "",
                            Description: bookData.Description || "",
                            Author: bookData.Author || "",
                            Price: bookData.Price || "",
                            Stock: bookData.Stock || "",
                            Status: bookData.Status || "上架",
                            Product_image: bookData.Product_image || "",
                            Seller_ID: bookData.Seller_ID || "",
                        });
                    }

                    // 獲取所有分類
                    const allCategoriesResponse = await fetch(`${BASE_URL}/categories`);
                    if (allCategoriesResponse.ok) {
                        const categoriesData = await allCategoriesResponse.json();
                        setAllCategories(categoriesData);
                    }

                    // 獲取書籍的當前分類
                    const bookCategoriesResponse = await fetch(
                        `${BASE_URL}/categories/${book.Product_ID}`
                    );
                    if (bookCategoriesResponse.ok) {
                        const bookCategoriesData = await bookCategoriesResponse.json();
                        setSelectedCategories(bookCategoriesData.categories.map((c) => c.Category_ID));
                    }
                } catch (error) {
                    console.error("Error fetching book details or categories:", error);
                }
            }
        };

        fetchBookDetails();
    }, [show, book?.Product_ID]);

    // 處理表單欄位變更
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedBook({ ...updatedBook, [name]: value });
    };

    // 新增或移除分類
    const handleCategoryChange = async (categoryId, checked) => {
        try {
            if (checked) {
                await fetch(`${BASE_URL}/categories/add-category-to-book`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: book.Product_ID, categoryId }),
                });
            } else {
                await fetch(`${BASE_URL}/categories/remove-category-from-book`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: book.Product_ID, categoryId }),
                });
            }

            // 更新分類狀態
            setSelectedCategories((prev) =>
                checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
            );
        } catch (error) {
            console.error("Error updating category:", error);
            alert("分類更新失敗，請稍後再試！");
        }
    };

    // 保存書籍更新
    const handleSave = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        const payload = {
            ...updatedBook,
            user_id: userId,
            isAdmin: Boolean(isAdmin),
        };

        try {
            const response = await fetch(`${BASE_URL}/books/${book.Product_ID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await getBooks(); // 刷新書籍列表
                onHide(); // 關閉 Modal
            } else {
                const errorData = await response.json();
                alert(`更新失敗: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error saving book:", error);
            alert("保存失敗，請稍後再試！");
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>編輯書籍</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleSave}>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">書籍名稱*</Form.Label>
                        <Col sm="9">
                            <Form.Control
                                name="Product_name"
                                value={updatedBook.Product_name}
                                onChange={handleChange}
                                required
                            />
                        </Col>
                    </Form.Group>

                    {/* 其他欄位... */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">描述</Form.Label>
                        <Col sm="9">
                            <Form.Control
                                name="Description"
                                as="textarea"
                                rows={3}
                                value={updatedBook.Description}
                                onChange={handleChange}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">作者</Form.Label>
                        <Col sm="9">
                            <Form.Control
                                name="Author"
                                value={updatedBook.Author}
                                onChange={handleChange}
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
                                value={updatedBook.Price}
                                onChange={handleChange}
                                required
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">庫存*</Form.Label>
                        <Col sm="9">
                            <Form.Control
                                name="Stock"
                                type="number"
                                min="0"
                                value={updatedBook.Stock}
                                onChange={handleChange}
                                required
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">狀態</Form.Label>
                        <Col sm="9">
                            <Form.Select
                                name="Status"
                                value={updatedBook.Status}
                                onChange={handleChange}
                            >
                                <option value="上架">上架</option>
                                <option value="下架">下架</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">圖片路徑</Form.Label>
                        <Col sm="9">
                            <Form.Control
                                name="Product_image"
                                value={updatedBook.Product_image}
                                onChange={handleChange}
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="3">分類管理</Form.Label>
                        <Col sm="9">
                            {allCategories.map((category) => (
                                <Form.Check
                                    key={category.Category_ID}
                                    type="checkbox"
                                    label={category.Category_name}
                                    checked={selectedCategories.includes(category.Category_ID)}
                                    onChange={(e) =>
                                        handleCategoryChange(category.Category_ID, e.target.checked)
                                    }
                                />
                            ))}
                        </Col>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit">保存更改</Button>
                        <Button variant="secondary" onClick={onHide} className="ms-2">取消</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EditBookModal;
