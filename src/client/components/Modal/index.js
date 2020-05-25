import React, { Fragment, PureComponent } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

class Modal extends PureComponent {
  componentDidMount() {
    document.addEventListener("click", this.closeModal, false);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.closeModal, false);
  }

  closeModal = ({ target }) => {
    if (this.modal && !this.modal.contains(target)) {
      this.props.toggleModal();
    }
  };

  render = () =>
    createPortal(
      <Fragment>
        <div className="overlay" />
        <div className="window-container">
          <div className="modal-container">
            <div ref={node => (this.modal = node)} className="modal">
              {this.props.children}
            </div>
          </div>
        </div>
      </Fragment>,
      document.body
    );
}

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  toggleModal: PropTypes.func.isRequired
};

export default Modal;
