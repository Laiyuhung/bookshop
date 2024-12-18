import React, { useState, useEffect } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { BASE_URL } from "../../Constants";

function BookList({
    filters,
    setFilters,
    cartItemsNumber,
    setCartItemsNumber,
    isAdmin,
    isSeller,
    userId,
    onEditBook,
    handleAddToCart,
    onViewDetails,
}) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBooks = async (currentFilters = filters) => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/books/status/available?categories=${currentFilters.category.join(",")}&search=${currentFilters.search}`);

            if (!response.ok) {
                throw new Error(`伺服器返回錯誤: ${response.statusText}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("後端返回的數據格式無效");
            }

            setBooks(data);
        } catch (error) {
            console.error("Error fetching books:", error);
            setError(error.message || "無法加載書籍，請稍後再試！");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [filters]);

    return (
        <>
            {error && (
                <Alert variant="danger" className="mt-3">
                    {error}
                </Alert>
            )}

            <div className="container mt-3 mb-3">
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">加載中...</span>
                        </Spinner>
                    </div>
                ) : books.length > 0 ? (
                    <div className="row" id="book-row">
                        {books.map((book) => {
                            const canEdit = isAdmin || (isSeller && book.Vendor_ID === Number(userId));

                            return (
                                <div key={book.Product_ID} className="col-md-4">
                                    <div className="card mb-4 shadow-sm">
                                        <img
                                            src={`/images/${book.Product_image || "default-book.jpg"}`}
                                            className="card-img-top"
                                            alt={book.Product_name}
                                            style={{ objectFit: "contain", height: "200px" }}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title">{book.Product_name}</h5>
                                            {/* <p className="card-text">{book.Description}</p> */}
                                            <p className="card-text">作者： {book.Author || "未知作者"}</p>
                                            <p className="card-text">
                                                價格： ${parseFloat(book.Price).toFixed(2)}
                                            </p>
                                            <p className="card-text">
                                                庫存： {book.Stock > 0 ? book.Stock : "售罄"}
                                            </p>

                                            {canEdit && (
                                                <div className="d-grid mb-2">
                                                    <button
                                                        className="btn btn-warning"
                                                        onClick={() => onEditBook(book)}
                                                    >
                                                        編輯
                                                    </button>
                                                </div>
                                            )}

                                            <div className="d-flex justify-content-between">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleAddToCart(book.Product_ID)}
                                                    disabled={!book.Stock}
                                                >
                                                    {book.Stock > 0 ? "加入購物車" : "售罄"}
                                                </button>
                                                <button
                                                    className="btn btn-info text-white"
                                                    onClick={() => onViewDetails(book.Product_name)}
                                                >
                                                    看更多
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !loading && (
                        <div className="text-center">
                            <p>未找到符合條件的書籍。</p>
                        </div>
                    )
                )}
            </div>
        </>
    );
}

export default BookList;
