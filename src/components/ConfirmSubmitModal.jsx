import React from 'react';

const ConfirmSubmitModal = ({ isOpen, onClose, onConfirm, transaction }) => {
    if (!isOpen || !transaction) return null;

    const { type, description, amount, currency, location, source, isDebt, isRecurring, dueDate } = transaction;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Confirmar Transacción</h2>
                <div className="transaction-summary">
                    <p><strong>Tipo:</strong> <span className={type === 'income' ? 'text-green' : 'text-red'}>{type === 'income' ? 'Ingreso' : 'Gasto'}</span></p>
                    <p><strong>{isDebt ? 'Deudor:' : 'Descripción:'}</strong> {description}</p>
                    <p><strong>Monto:</strong> {amount} {currency}</p>
                    {type === 'income' && location && <p><strong>Ubicación:</strong> {location}</p>}
                    {type === 'expense' && !isDebt && source && <p><strong>Desde:</strong> {source}</p>}
                    {type === 'expense' && !isDebt && dueDate && <p><strong>Vence:</strong> {dueDate}</p>}
                    {isRecurring && <p className="text-blue italic">Esta transacción se marcará como recurrente.</p>}
                    {isDebt && <p className="text-yellow italic">Se añadirá al total de la deuda con este deudor.</p>}
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="modal-button-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="modal-button-primary">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmSubmitModal;