import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const EditTransactionModal = ({ isOpen, onClose, transaction, type }) => {
    const { updateIncome, updateExpense, incomeLocations } = useContext(AppContext);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        setFormData(transaction);
    }, [transaction]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const { id, type: transType, ...dataToUpdate } = formData;
        if(type === 'income') {
            updateIncome(id, dataToUpdate);
        } else {
            updateExpense(id, dataToUpdate);
        }
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Editar Transacción</h2>
                <form onSubmit={handleSave} className="modal-form-stacked">
                     <div className="form-group">
                        <label htmlFor="edit-description" className="form-label">Descripción</label>
                        <input type="text" id="edit-description" name="description" value={formData.description} onChange={handleChange} className="form-input"/>
                    </div>
                    <div className="form-group-horizontal">
                        <div className="form-field-grow">
                            <label htmlFor="edit-amount" className="form-label">Monto</label>
                            <input type="number" id="edit-amount" name="amount" value={formData.amount} onChange={handleChange} className="form-input"/>
                        </div>
                        <div className="form-field">
                            <label htmlFor="edit-currency" className="form-label">Moneda</label>
                            <select id="edit-currency" name="currency" value={formData.currency} onChange={handleChange} className="form-select">
                                <option value="ARS">ARS</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>
                    {type === 'income' && (
                        <div className="form-group">
                            <label htmlFor="edit-location" className="form-label">Ubicación</label>
                            <select id="edit-location" name="location" value={formData.location} onChange={handleChange} className="form-select">
                                {incomeLocations.map(loc => (<option key={loc.id} value={loc.name}>{loc.name}</option>))}
                            </select>
                        </div>
                    )}
                    {type === 'expense' && !formData.isDebt && (
                        <div className="form-group">
                            <label htmlFor="edit-source" className="form-label">Pagar desde</label>
                            <select id="edit-source" name="source" value={formData.source} onChange={handleChange} className="form-select">
                                {incomeLocations.map(loc => (<option key={loc.id} value={loc.name}>{loc.name}</option>))}
                            </select>
                        </div>
                    )}
                    <div className="form-group-checkbox">
                        <input id="edit-isRecurring" type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} className="form-checkbox" />
                        <label htmlFor="edit-isRecurring" className="form-checkbox-label">Es recurrente</label>
                    </div>
                    <div className="modal-actions">
                         <button type="button" onClick={onClose} className="modal-button-secondary">Cancelar</button>
                        <button type="submit" className="modal-button-primary">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditTransactionModal;