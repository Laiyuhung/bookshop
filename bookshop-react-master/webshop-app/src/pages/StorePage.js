import FooterComponent from "../components/FooterComponent";
import NavbarComponent from "../components/NavbarComponent";
import Breadcrumbs from "../components/Breadcrumbs";
import BookList from "../components/book/BookList";
import { Toast, ToastContainer, Button, Alert, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Constants";
import "../css/StorePage.css";
import { useNavigate } from "react-router-dom";

function StorePage() {
    const [books, setBooks] = useState([]);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [filters, setFilters] = useState({ category: [], search: "" }); // 篩選條件，新增搜尋條件
    const [categories, setCategories] = useState([]); // 書籍分類列表
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(""); // 成功訊息狀態

    const userId = localStorage.getItem("user_id");
    const navigate = useNavigate(); // 用於導航到詳細頁面

    // 獲取書籍資料
    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/books/status/available`, { params: filters });
            const updatedBooks = response.data.map((book) => ({
                ...book,
                Product_image: book.Product_image
                    ? `../images/${book.Product_image}`
                    : "../images/default-book.jpg",
            }));
            setBooks(updatedBooks);
        } catch (err) {
            setError("無法加載書籍，請稍後再試！");
        } finally {
            setLoading(false);
        }
    };

    // 獲取書籍分類選項
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/categories`);
            setCategories(response.data);
        } catch (err) {
            setError("無法載入分類資料，請稍後再試！");
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, [filters.category]); // 只有分類變化時請求數據

    // 處理分類勾選
    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        const categoryValue = e.target.value;

        setFilters((prevFilters) => ({
            ...prevFilters,
            category: isChecked
                ? [...prevFilters.category, categoryValue]
                : prevFilters.category.filter((cat) => cat !== categoryValue),
        }));
    };

    // 處理搜尋框變更
    const handleSearchChange = (e) => {
        const searchValue = e.target.value;
        setFilters((prevFilters) => ({
            ...prevFilters,
            search: searchValue,
        }));
        fetchBooks();
    };

    // 重設篩選
    const handleResetFilters = () => {
        setFilters({ category: [], search: "" });
        fetchBooks(); // 重置後請求數據
    };

    // 加入購物車
    const handleAddToCart = async (productId) => {
        if (!userId) {
            setError("請先登入才能加入購物車");
            return;
        }

        try {
            await axios.post(`${BASE_URL}/cart`, {
                memberId: userId,
                productId,
                quantity: 1,
            });

            setCartItemsNumber((prev) => prev + 1);
            setSuccess("書籍已加入購物車");
        } catch (error) {
            setError("加入購物車失敗，請稍後再試！");
        }
    };

    // 處理查看更多按鈕
    const handleViewDetails = (bookName) => {
        navigate(`/books/${encodeURIComponent(bookName)}`);
    };

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />

            <div className="content-wrapper">
                <Breadcrumbs />

                {/* 頂部篩選與搜尋欄位 */}
                <div className="filter-bar container my-3">
                    <h5>篩選書籍</h5>
                    <div className="d-flex align-items-center flex-wrap">
                        <div className="filter-options d-flex flex-wrap me-3">
                            {categories.map((category) => (
                                <div key={category.Category_ID} className="filter-item me-3">
                                    <input
                                        type="checkbox"
                                        value={category.Category_name}
                                        onChange={handleCheckboxChange}
                                        checked={filters.category.includes(category.Category_name)}
                                    />
                                    <label className="ms-2">{category.Category_name}</label>
                                </div>
                            ))}
                        </div>
                        <Form.Control
                            type="text"
                            placeholder="搜尋書籍名稱..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            style={{ width: "300px" }}
                            className="me-2"
                        />
                        <Button variant="secondary" onClick={handleResetFilters}>
                            重設篩選
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center mt-5">
                        <p>Loading books...</p>
                    </div>
                ) : (
                    <BookList
                        cartItemsNumber={cartItemsNumber}
                        setCartItemsNumber={setCartItemsNumber}
                        filters={filters}
                        books={books}
                        setFilters={setFilters}
                        handleAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                    />
                )}

                {error && <Alert variant="danger" className="text-center mt-3">{error}</Alert>}

                <FooterComponent />
            </div>

            <ToastContainer className="p-3 top-0 end-0" position="top-end">
                <Toast onClose={() => setSuccess("")} show={!!success} delay={3000} autohide bg="success">
                    <Toast.Body className="text-white">{success}</Toast.Body>
                </Toast>
                <Toast onClose={() => setError("")} show={!!error} delay={3000} autohide bg="danger">
                    <Toast.Body className="text-white">{error}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default StorePage;
