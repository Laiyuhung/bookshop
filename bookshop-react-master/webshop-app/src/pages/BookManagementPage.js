import React, { useState, useEffect } from "react";
import { Button, Table, Alert } from "react-bootstrap";
import AddBookModal from "../components/book/AddBookModal";
import EditBookModal from "../components/book/EditBookModal";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import axios from "axios";
import { BASE_URL } from "../Constants";

function BookManagementPage() {
    const [books, setBooks] = useState([]);
    const [addModalShow, setAddModalShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const userId = localStorage.getItem("user_id");

    // 獲取書籍列表
    const fetchBooks = async () => {
        try {
            let response;
            if (isAdmin) {
                // Admin 獲取所有書籍
                response = await axios.get(`${BASE_URL}/books`);
                setBooks(response.data);
            } else {
                // Seller 只獲取自己的書籍
                const vendorResponse = await axios.get(`${BASE_URL}/vendors/member/${userId}`);
                if (vendorResponse.data.vendor) {
                    const sellerId = vendorResponse.data.vendor.Vendor_ID;
                    // console.log( sellerId );
                    // 使用 Seller_ID 取得該賣家的書籍
                    const booksResponse = await axios.get(`${BASE_URL}/books/one/${sellerId}`);
                    setBooks(booksResponse.data);
                    // console.log( "test" );
                } 
            }
        } catch (err) {
            setError("無法加載書籍列表:" , err);
        }
    };

    // 確認管理員身份
    const checkAdminStatus = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/administrators/${userId}`);
            setIsAdmin(response.data.isAdmin);
        } catch (err) {
            setError("無法確認用戶權限");
        }
    };

    useEffect(() => {
        checkAdminStatus();
    }, [userId]);

    useEffect(() => {
        fetchBooks();
    }, [isAdmin]);

    const handleEditBook = (book) => {
        setSelectedBook(book);
        setEditModalShow(true);
    };

    const renderStatus = (status) => {
        return status === "上架" ? (
            <span className="text-success">上架</span>
        ) : (
            <span className="text-danger">下架</span>
        );
    };

    return (
        <>
            <NavbarComponent />
            <div className="container mt-5">
                <h2 className="mb-4">書籍管理</h2>
                {error && <Alert variant="danger">{error}</Alert>}

                <div className="d-flex justify-content-end mb-3">
                    <Button variant="primary" onClick={() => setAddModalShow(true)}>
                        新增書籍
                    </Button>
                </div>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>書籍名稱</th>
                            <th>作者</th>
                            <th>價格</th>
                            <th>庫存</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book, index) => (
                            <tr key={book.Product_ID}>
                                <td>{index + 1}</td>
                                <td>{book.Product_name}</td>
                                <td>{book.Author || "未知"}</td>
                                <td>${book.Price}</td>
                                <td>{book.Stock}</td>
                                <td>{renderStatus(book.Status)}</td>
                                <td>
                                    {(
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            onClick={() => handleEditBook(book)}
                                        >
                                            編輯
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* 新增書籍 Modal */}
                <AddBookModal
                    show={addModalShow}
                    onHide={() => setAddModalShow(false)}
                    getBooks={fetchBooks}
                />

                {/* 編輯書籍 Modal */}
                {selectedBook && (
                    <EditBookModal
                        show={editModalShow}
                        onHide={() => setEditModalShow(false)}
                        book={selectedBook}
                        getBooks={fetchBooks}
                        userId={userId}
                        isAdmin={isAdmin}
                    />
                )}
            </div>
            <FooterComponent />
        </>
    );
}

export default BookManagementPage;
