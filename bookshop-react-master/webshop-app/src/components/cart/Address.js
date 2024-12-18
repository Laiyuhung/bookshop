import { Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";

function Address({ title, handleChangeAddress, address }) {
  return (
    <div id="billing-address">
      <div className="row g-3 address-section">
        <h4>{title}</h4>
        {/* 縣/市 */}
        <Form.Group as={Col} md="4" className="mb-3" controlId="validationCustom01">
          <Form.Label>縣/市</Form.Label>
          <Form.Control
            onChange={handleChangeAddress}
            value={address.street || ""}
            name="street"
            type="text"
            className="form-control"
            aria-describedby="inputGroupPrepend1"
            placeholder="例 : 台北市"
            aria-label="例 : 台北市"
            pattern="^[\u4e00-\u9fa5A-Za-z\s]+$" // 支持中文、英文和空格
            required
          />
          <Form.Control.Feedback type="invalid">請輸入有效的縣/市名稱</Form.Control.Feedback>
        </Form.Group>

        {/* 鄉/鎮/市/區 */}
        <Form.Group as={Col} md="4" className="mb-3" controlId="validationCustom02">
          <Form.Label>鄉/鎮/市/區</Form.Label>
          <Form.Control
            onChange={handleChangeAddress}
            value={address.city || ""}
            name="city"
            type="text"
            className="form-control"
            placeholder="例 : 大安區"
            aria-label="例 : 大安區"
            pattern="^[\u4e00-\u9fa5A-Za-z\s]+$" // 同上
            required
          />
          <Form.Control.Feedback type="invalid">請輸入有效的鄉/鎮/市/區</Form.Control.Feedback>
        </Form.Group>

        {/* 剩餘地址 */}
        <Form.Group as={Col} md="4" className="mb-3" controlId="validationCustom03">
          <Form.Label>剩餘地址</Form.Label>
          <Form.Control
            onChange={handleChangeAddress}
            value={address.suite || ""}
            name="suite"
            type="text"
            className="form-control"
            pattern="^[.0-9\u4e00-\u9fa5A-Za-z\s,-]+$" // 支持数字、中文和符号
            required
          />
          <Form.Control.Feedback type="invalid">請填寫詳細地址</Form.Control.Feedback>
        </Form.Group>
        <Form.Group
          as={Col}
          md="4"
          className="mb-3"
          controlId="validationCustom02"
        >
          <Form.Label>郵遞區號(3碼)</Form.Label>
          <Form.Control
            onChange={handleChangeAddress}
            value={address.zipcode}
            name="zipcode"
            type="text"
            className="form-control"
            aria-describedby="inputGroupPrepend4"
            placeholder="例 : 106"
            aria-label="例 : 106"
            pattern="^[0-9]{3}$"
            required
          />
          <Form.Control.Feedback type="invalid">
            格式錯誤
          </Form.Control.Feedback>
        </Form.Group>
      </div>
    </div>
  );
}

export default Address;
