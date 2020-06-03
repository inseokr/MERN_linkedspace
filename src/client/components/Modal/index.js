import React, { Fragment, PureComponent } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

class Index extends PureComponent {
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
        <div className="modal-overlay" />
        <div className="modal-window-container">
          <div className="modal-container">
            <div ref={node => (this.modal = node)} id="modal">
              {this.props.children}
            </div>
          </div>
        </div>
      </Fragment>,
      document.body
    );
}

Index.propTypes = {
  children: PropTypes.node.isRequired,
  toggleModal: PropTypes.func.isRequired
};

export default Index;
