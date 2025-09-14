import React from 'react';
import ReactDOM from 'react-dom';

const PortalModal = ({ children }) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;  // Safety check

  return ReactDOM.createPortal(
    <>
      {children}
    </>,
    modalRoot
  );
};

export default PortalModal;
