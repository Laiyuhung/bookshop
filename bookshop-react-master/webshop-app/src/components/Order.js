import React, { useContext } from "react";
import {
  Accordion,
  Button,
  Card,
  AccordionContext,
  useAccordionButton,
} from "react-bootstrap";

function ContextAwareToggle({ eventKey, callback }) {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey)
  );

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Button 
      onClick={decoratedOnClick} 
      variant="outline-dark" 
      className="btn-collapse collapsed" 
      type="button" data-bs-toggle="collapse" 
      aria-expanded="false" 
      aria-controls="collapseExample"
      >
      {isCurrentEventKey ? (
        <i className="fas fa-chevron-circle-up"></i>
      ) : (
        <i className="fas fa-chevron-circle-down"></i>
      )}
    </Button>
  );
}
export default function Order({
  id,
  order,
  email,
  phone,
  payment,
  date,
  total,
  deliveryAddress,
  billingAddress
}) {
  let count = 1;
  let dateTransformed = new Date(date);
  let dateParsed =
    dateTransformed.getDate() +
    "/" +
    (dateTransformed.getMonth() + 1) +
    "/" +
    dateTransformed.getFullYear() +
    " " +
    dateTransformed.getHours() +
    ":" +
    dateTransformed.getMinutes() +
    ":" +
    dateTransformed.getSeconds();

  return (
    <Accordion defaultActiveKey="1">
      <Card>
        <Card.Header>
          <p className="fw-bold">
            訂單編號 
            <span className="text-success"> {id}</span>
          </p>
          <ContextAwareToggle eventKey="0"></ContextAwareToggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <h6>
              訂單成立時間:
              <span className="fw-light fst-italic"> {dateParsed}</span>
            </h6>
            <h6>
              付款方式: <span className="fw-light fst-italic">{payment}</span>
            </h6>
            <h6>
              配送地址:
              <span className="fw-light fst-italic">
                {" "}
                {/* {deliveryAddress.street} street, {deliveryAddress.suite},{" "}
                {deliveryAddress.zipcode}, {deliveryAddress.city} */}
                {deliveryAddress.zipcode}{" "} {deliveryAddress.street} {deliveryAddress.city}  {deliveryAddress.suite}
                
              </span>
            </h6>
            <h6>
              帳單地址:
              <span className="fw-light fst-italic">
                {" "}
                {/* {billingAddress.street} street, {billingAddress.suite},{" "}
                {billingAddress.zipcode}, {billingAddress.city} */}
                {billingAddress.zipcode}{" "} {billingAddress.street} {billingAddress.city}  {billingAddress.suite}
              </span>
            </h6>
            
            <h6>訂單內容:</h6>
            {order.order.map((order) => (
              <div className="d-flex justify-content-between" key={count++}>
                <div className="order-name">- {order.name}</div>
                <div className="order-name">售價: ${order.price} 元</div>
                <div className="order-name">數量: {order.quantity}</div>
              </div>
            ))}
            <br />
            <h4>總金額: ${total} 元</h4>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
}
