import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="modal-button-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="modal-button-danger">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;