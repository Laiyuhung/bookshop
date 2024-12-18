import { Modal, Button } from "react-bootstrap";
function DeleteItemModal({deleteCartItemAndModalClose, ...props}) {
  return (
    <Modal
      {...props}
      size="m"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>您確定要從購物車移除此書籍?</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onHide}>
          取消
        </Button>
        <Button variant="danger" onClick={deleteCartItemAndModalClose}>
          移除
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteItemModal;
