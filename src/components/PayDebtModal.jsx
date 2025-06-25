import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const PayDebtModal = ({ isOpen, onClose, debt }) => {
    const { payDebt, incomeLocations } = useContext(AppContext);
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('ARS');
    const [source, setSource] = useState(incomeLocations.length > 0 ? incomeLocations[0].name : '');

    if (!isOpen || !debt) return null;

    const handlePay = (e) => {
        e.preventDefault();
        const payAmount = parseFloat(amount);
        if(payAmount > 0) {
            payDebt(debt, payAmount, currency, source);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Pagar Deuda a {debt.name}</h2>
                <form onSubmit={handlePay} className="modal-form-stacked">
                    <div className="form-group-horizontal">
                        <div className="form-field-grow">
                            <label htmlFor="pay-amount" className="form-label">Monto a Pagar</label>
                            <input type="number" id="pay-amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" required />
                        </div>
                        <div className="form-field">
                            <label htmlFor="pay-currency" className="form-label">Moneda</label>
                            <select id="pay-currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-select">
                                <option value="ARS">ARS</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="pay-source" className="form-label">Pagar desde</label>
                        <select id="pay-source" value={source} onChange={(e) => setSource(e.target.value)} className="form-select">
                            {incomeLocations.map(loc => (<option key={loc.id} value={loc.name}>{loc.name}</option>))}
                        </select>
                    </div>
                    <div className="modal-actions">
                         <button type="button" onClick={onClose} className="modal-button-secondary">Cancelar</button>
                        <button type="submit" className="modal-button-primary">Confirmar Pago</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayDebtModal;