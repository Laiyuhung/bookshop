import Container from "react-bootstrap/esm/Container";
import "../css/CartPage.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { BASE_URL } from "../Constants";

function CartPage() {
    const [userId, setUserId] = useState(localStorage.getItem("user_id") || null);
    const [cartItems, setCartItems] = useState([]);
    const [totalCartValue, setTotalCartValue] = useState(0);
    const [cartItemsNumber, setCartItemsNumber] = useState(0);
    const [show, setShow] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 獲取購物車資料
    const fetchCartItems = async () => {
        if (!userId) {
            setErrorMessage("用戶未登入，請登入後再試！");
            setError(true);
            setShow(true);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/cart/${userId}`);
            if (!response.ok) throw new Error("無法獲取購物車數據");

            const data = await response.json();
            setCartItems(data);

            // 計算總價和商品數量
            const total = data.reduce(
                (acc, item) => acc + parseFloat(item.Price) * item.Quantity,
                0
            );
            const count = data.reduce((acc, item) => acc + item.Quantity, 0);

            setTotalCartValue(total);
            setCartItemsNumber(count);
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setErrorMessage("無法獲取購物車數據，請稍後再試！");
            setError(true);
            setShow(true);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCartItems();
        } else {
            setErrorMessage("用戶未登入，請登入後再試！");
            setError(true);
            setShow(true);
        }
    }, [userId]);

    // 修改商品數量
    const updateQuantity = async (productId, type) => {
        const isIncrease = type === "increase";

        // 找到對應的商品
        const item = cartItems.find((item) => item.Product_ID === productId);

        // 如果是減少數量且已經為 1，直接返回
        if (!isIncrease && item.Quantity <= 1) {
            console.log("數量已達到最小值，無法繼續減少。");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    memberId: userId,
                    productId: productId,
                    quantity: isIncrease ? 1 : -1,
                }),
            });

            if (!response.ok) throw new Error("數量更新失敗");

            // 更新本地狀態
            const updatedCart = cartItems.map((item) =>
                item.Product_ID === productId
                    ? {
                          ...item,
                          Quantity: isIncrease
                              ? item.Quantity + 1
                              : Math.max(item.Quantity - 1, 1),
                      }
                    : item
            );
            setCartItems(updatedCart);

            // 更新總價和商品數量
            if (item) {
                const updatedPrice = parseFloat(item.Price);
                const quantityChange = isIncrease ? 1 : -1;
                setTotalCartValue((prev) => prev + updatedPrice * quantityChange);
                setCartItemsNumber((prev) => prev + quantityChange);
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            setErrorMessage("無法更新商品數量，請稍後再試！");
            setError(true);
            setShow(true);
        }
    };

    // 刪除商品
    const deleteCartItem = async (productId) => {
        try {
            const response = await fetch(`${BASE_URL}/cart/product/${productId}?memberId=${userId}`, {
                method: "DELETE",
            });
    
            if (!response.ok) throw new Error("刪除商品失敗");
    
            const updatedCart = cartItems.filter((item) => item.Product_ID !== productId);
            setCartItems(updatedCart);
    
            const deletedItem = cartItems.find((item) => item.Product_ID === productId);
            if (deletedItem) {
                setCartItemsNumber((prev) => prev - deletedItem.Quantity);
                setTotalCartValue(
                    (prev) =>
                        prev - parseFloat(deletedItem.Price) * deletedItem.Quantity
                );
            }
        } catch (error) {
            console.error("Error deleting cart item:", error);
            setErrorMessage("刪除商品失敗，請稍後再試！");
            setError(true);
            setShow(true);
        }
    };
    

    if (cartItems.length === 0 && !userId) {
        return (
            <>
                <NavbarComponent cartItemsNumber={cartItemsNumber} />
                <Container className="mt-5 pt-5 text-center">
                    <h4>您的購物車無商品</h4>
                    <Link to="/books">繼續購物</Link>
                </Container>
                <FooterComponent />
            </>
        );
    }

    return (
        <>
            <NavbarComponent cartItemsNumber={cartItemsNumber} />
            <Container className="mt-5 pt-5 text-center">
                {cartItems.length === 0 ? (
                    <h4>您的購物車無商品</h4>
                ) : (
                    <>
                        <h2>購物車</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>商品名稱</th>
                                    <th>價格</th>
                                    <th>數量</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.Product_ID}>
                                        <td>{item.Product_name}</td>
                                        <td>${parseFloat(item.Price).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() =>
                                                    updateQuantity(item.Product_ID, "decrease")
                                                }
                                            >
                                                -
                                            </button>
                                            <span className="mx-2">{item.Quantity}</span>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() =>
                                                    updateQuantity(item.Product_ID, "increase")
                                                }
                                            >
                                                +
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => deleteCartItem(item.Product_ID)}
                                            >
                                                刪除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h4>總金額: ${totalCartValue.toFixed(2)}</h4>
                        <Link to="/checkout" className="btn btn-primary">
                            前往結帳
                        </Link>
                    </>
                )}
            </Container>
            <FooterComponent />
            <ToastContainer className="p-3 bottom-0 end-0">
                <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
                    {error ? (
                        <Toast.Body className="text-danger">{errorMessage}</Toast.Body>
                    ) : (
                        <Toast.Body className="text-success">操作成功！</Toast.Body>
                    )}
                </Toast>
            </ToastContainer>
        </>
    );
}

export default CartPage;
