import React, { useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

function Book({
    id,
    name,
    author,
    price,
    stock,
    image,
    isAdmin,
    cartItemsNumber,
    setCartItemsNumber,
    onViewDetails,
    handleAddToCart,
}) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");

    const handleCartClick = () => {
        if (stock > 0) {
            handleAddToCart(id);
        } else {
            setToastMessage("庫存不足，無法加入購物車！");
            setToastVariant("danger");
            setShowToast(true);
        }
    };

    return (
        <>
            <div className="col-md-4">
                <div className="card mb-4 shadow-sm">
                    <img
                        src={image}
                        className="card-img-top"
                        alt={name}
                        style={{ objectFit: "cover", height: "200px" }}
                    />
                    <div className="card-body">
                        <h5 className="card-title">{name}</h5>
                        <p className="card-text">作者: {author || "未知"}</p>
                        <p className="card-text">價格: ${price.toFixed(2)}</p>
                        <p className="card-text">庫存: {stock > 0 ? stock : "售罄"}</p>
                        <div className="d-flex justify-content-between">
                            {!isAdmin && (
                                <>
                                    <button
                                        className={`btn add-to-cart-btn ${stock > 0 ? "in-stock" : "out-of-stock"}`}
                                        onClick={handleCartClick}
                                        disabled={stock <= 0}
                                    >
                                        {stock > 0 ? "加入購物車" : "售罄"}
                                    </button>
                                    <button
                                        className="btn btn-outline-info"
                                        onClick={() => onViewDetails(name)}
                                    >
                                        看更多
                                    </button>
                                </>
                            )}
                            {isAdmin && (
                                <div className="d-flex justify-content-between w-100">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => console.log("編輯", id)}
                                    >
                                        編輯
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => console.log("刪除", id)}
                                    >
                                        刪除
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer className="p-3" position="top-end">
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

export default Book;
