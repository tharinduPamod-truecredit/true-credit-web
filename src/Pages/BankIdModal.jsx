import React from "react";

const BankIdModal = ({ isOpen, onClose, status, user }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>BankID Authentication</h3>
        <div className="status-message">{status}</div>

        {user && (
          <div className="user-info">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Personal Number:</strong> {user.personalNumber}
            </p>
            <p>
              <strong>Address:</strong> {user.address}, {user.city}
            </p>
          </div>
        )}

        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default BankIdModal;
