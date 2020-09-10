import React, { useState } from 'react';
// import { ListingsContext } from '../../../../contexts/ListingsContext';
import Modal from '../../../../components/Modal';

function DateFilter() {
  const [showModal, setShowModal] = useState(false);
  // const {filterListings, places, price, date} = useContext(ListingsContext);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className={`${showModal ? "blur" : undefined} modal-app`}>
      <button className="filter-button" onClick={toggleModal}>
        Date
      </button>
      {showModal && (
        <Modal toggleModal={toggleModal}>
          <h1 className="modal-title">Hello!</h1>
          <p className="modal-subtitle">There are two ways to close this modal</p>
          <ul>
            <li>Click outside of this modal in the grey overlay area.</li>
            <li>Click the close button below.</li>
          </ul>
          <button className="uk-button uk-button-danger uk-button-small" onClick={toggleModal}>
            Close
          </button>
        </Modal>
      )}
    </div>
  );
}

export default DateFilter;
