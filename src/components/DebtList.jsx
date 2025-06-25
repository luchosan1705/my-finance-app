import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Trash2 } from '../utils/icons';

const DebtList = ({ debts, openPayDebtModal, openConfirmModal }) => { // Recibe handlers como props
    if (debts.length === 0) return <div className="debt-list-container"><h3 className="debt-list-title">Deudas Pendientes</h3><p className="debt-list-empty">No tienes deudas pendientes.</p></div>;
    return (
        <div className="debt-list-container">
            <h3 className="debt-list-title">Deudas Pendientes</h3>
            <ul className="debt-list-ul">
                {debts.map(debt => (
                    <li key={debt.id} className="debt-list-item">
                        <div>
                            <p className="debt-item-name">{debt.name}</p>
                            <div className="debt-item-amounts">
                                {debt.totalARS > 0 && <span>ARS {debt.totalARS.toLocaleString('es-AR')}</span>}
                                {debt.totalARS > 0 && debt.totalUSD > 0 && ' / '}
                                {debt.totalUSD > 0 && <span>USD {debt.totalUSD.toLocaleString('en-US')}</span>}
                            </div>
                        </div>
                        <div className="debt-item-actions">
                            <button onClick={() => openPayDebtModal(debt)} className="debt-pay-button">Pagar</button>
                            <button onClick={() => openConfirmModal(debt.id, 'debt')} className="debt-delete-button"><Trash2 className="debt-delete-icon"/></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DebtList;