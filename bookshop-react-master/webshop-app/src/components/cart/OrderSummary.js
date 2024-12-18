import CartItem from "./CartItem";
import DeleteItemModal from "./DeleteItemModal";
import { useState } from "react";
function OrderSummary({
  cartItems,
  totalCartValue,
  changeQuantity,
  deleteCartItem,
  handleDiscountChange,
}) {
  const [modalShow, setModalShow] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

   // 新增狀態來管理折扣碼和折扣值
   const [discountCode, setDiscountCode] = useState("");
   const [discountValue, setDiscountValue] = useState(0);
   const [discounts, setDiscounts] = useState([]);
  

  const showDeleteModal = (id) => {
    setModalShow(true);
    setIdToDelete(id);
  };
  const deleteCartItemAndModalClose = () => {
    deleteCartItem(idToDelete);
    setModalShow(false);
  };

  const applyDiscountCode = () => {
    // 假設這裡用一個簡單的邏輯來應用折扣碼
    if (discountCode === "DISCOUNT10") {
      setDiscountValue(10); // 假設 "DISCOUNT10" 給予 10 元的折扣
      handleDiscountChange(10);
    } else if (discountCode === "DISCOUNT25") {
      setDiscountValue(25); // 假設 "DISCOUNT25" 給予 25 元的折扣
      handleDiscountChange(25);
    } else {
      setDiscountValue(0); // 若折扣碼無效，不給予折扣
      handleDiscountChange(0);
    }
  };

  return (
    <>
      {" "}
      <div className="section-title">
        <span className="section-number">1</span>
        <h3>訂單內容</h3>
      </div>
      <div className="order">
        {cartItems.map((order) => {
          return (
            <CartItem
              key={order.name}
              cartItem={order}
              changeQuantity={changeQuantity}
              showDeleteModal={showDeleteModal}
              handleDiscountChange={discountValue}
            />
          );
        })}
        {/* 新增折扣碼輸入框 */}
        <div className="discount-code-input">
          <input
            type="text"
            placeholder="輸入折扣碼"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="form-control mb-2"
          />
          <button
            onClick={applyDiscountCode}
            className="btn btn-primary mb-3"
          >
            套用折扣碼
          </button>
        </div>

        <div
          className="order-total d-flex justify-content-between p-2"
          id="order-total"
        >
          <h5>折扣</h5>
          <h5>- ${discountValue} 元</h5>
        </div>
        <div
          className="order-total d-flex justify-content-between p-2"
          id="order-total"
        >
          <h4>總金額</h4>
          <h4>${totalCartValue-discountValue} 元</h4>
        </div>
      </div>
      <DeleteItemModal
        deleteCartItemAndModalClose={deleteCartItemAndModalClose}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      <div className="invalid bg-danger mt-5 d-none text-center">
        <p className="text-white p-3">
          請檢察輸入地址是否有誤
        </p>
      </div>
    </>
  );
}

export default OrderSummary;
