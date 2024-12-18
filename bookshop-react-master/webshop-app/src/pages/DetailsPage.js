import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import FooterComponent from "../components/FooterComponent";
import NavbarComponent from "../components/NavbarComponent";
import Breadcrumbs from "../components/Breadcrumbs";

import "../css/BookDetails.css";
import { BASE_URL } from "../Constants";

function DetailsPage() {
    const { slug } = useParams();
    const [book, setBook] = useState(null);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastVariant, setToastVariant] = useState("success");
    useEffect(() => {
        const fetchBookDetails = async () => {
            if (!slug) {
                setError("無效的書籍名稱。");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${BASE_URL}/books/${slug}`);
                setBook(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching book details:", error);
                setError("找不到書籍資料。");
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();

        const cartItems = JSON.parse(localStorage.getItem("items")) || [];
        const counter = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemsNumber(counter);
    }, [slug]);

    const handleAddToCart = async (id) => {
        const userId = localStorage.getItem("user_id"); // 從 localStorage 獲取登入者 ID
        if (!userId) {
            alert("請先登入以加入購物車！");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/cart`, {
                memberId: userId,
                productId: id,
                quantity: 1
            });

            if (response.status === 200) {
                const cartItems = JSON.parse(localStorage.getItem("items")) || [];
                const existingItem = cartItems.find((item) => item.id === id);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cartItems.push({ id, name: book.Product_name, price: book.Price, quantity: 1 });
                }

                localStorage.setItem("items", JSON.stringify(cartItems));
                setCartItemsNumber(cartItemsNumber + 1);
                setShow(true);
            }
        } catch (error) {
            console.error("錯誤：無法加入購物車", error.response?.data || error.message);
            alert("加入購物車時發生錯誤，請稍後再試！");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <Breadcrumbs />
            {loading ? (
                <div className="container mt-5">
                    <h3>書籍加載中...</h3>
                </div>
            ) : error ? (
                <div className="container mt-5">
                    <h3 className="text-danger">{error}</h3>
                </div>
            ) : (
                <div className="container container-footer" id="container">
                    <div className="title mt-3">
                        <h4 className="title details-title" id="name">
                            {book.Product_name}
                        </h4>
                        <h5 className="details-author text-danger" id="author">
                            {book.Author || "Unknown Author"}
                        </h5>
                    </div>
                    <div className="container container-details mt-3">
                        <div className="row">
                            <div className="col-sm-6 col-12" id="book-img">
                                <img
                                    className="book-details-img"
                                    src={
                                        book.Product_image
                                            ? `/images/${book.Product_image}`
                                            : "/images/default-book.jpg"
                                    }
                                    alt="Book cover"
                                />
                            </div>
                            <div
                                className="details col-sm-6 col-12 align-self-center"
                                id="book-details"
                            >
                                <h3>
                                    市售價:{" "}
                                    <span id="price">
                                        ${parseFloat(book.Price).toFixed(2)}
                                    </span>{" "}
                                    元
                                </h3>
                                <h5>
                                    出版日:{" "}
                                    <span className="detail-value">
                                        {book.New_arrival_date
                                            ? formatDate(book.New_arrival_date)
                                            : "N/A"}
                                    </span>
                                </h5>
                                <h5>
                                    簡介:
                                    <br />
                                    <span className="detail-value">
                                        {book.Description || "暫無描述"}
                                    </span>
                                </h5>
                                <h5>
                                    剩餘庫存:{" "}
                                    <span className="detail-value">
                                        {book.Stock || "Out of Stock"}
                                    </span>{" "}
                                    
                                </h5>
                                <button
                                    id="add-to-cart"
                                    className="text-center btn btn-outline-danger mt-3"
                                    onClick={() => handleAddToCart(book.Product_ID)}
                                    disabled={!book.Stock}
                                >
                                    {book.Stock > 0 ? "加入購物車" : "售完補貨中"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer className="p-3 top-0 end-0">
                <Toast
                    onClose={() => setShow(false)}
                    show={show}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Body className="text-white">成功加入購物車!</Toast.Body>
                </Toast>
            </ToastContainer>
            <FooterComponent />
        </>
    );
}

export default DetailsPage;
