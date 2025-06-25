import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { PaidIcon, UnpaidIcon, CalendarDays, Edit, Trash2 } from '../utils/icons';
import { getToday } from '../utils/dateUtils';

const TransactionList = ({ title, items, listType, openEditModal, openConfirmModal }) => { // Recibe handlers como props
    const { toggleExpensePaid } = useContext(AppContext); 
    
    if (items.length === 0) return <div className="transaction-list-container"><h3 className="transaction-list-title">{title}</h3><p className="transaction-list-empty">No hay transacciones para mostrar.</p></div>; 
    
    return ( 
        <div className="transaction-list-container">
            <h3 className="transaction-list-title">{title}</h3>
            <ul className="transaction-list-ul">
                {items.map(item => { 
                    const dueDate = item.dueDate ? new Date(item.dueDate.replace(/-/g, '\/')) : null; 
                    const today = getToday(); 
                    const tomorrow = new Date(today); 
                    tomorrow.setDate(tomorrow.getDate() + 1); 
                    
                    const isOverdue = listType === 'expense' && !item.isPaid && dueDate && (dueDate < today); 
                    const isDueSoon = listType === 'expense' && !item.isPaid && dueDate && !isOverdue && (dueDate.getTime() === today.getTime() || dueDate.getTime() === tomorrow.getTime()); 
                    
                    let vencimientoLabel = null; 
                    if (isOverdue) vencimientoLabel = 'Vencido'; 
                    else if (isDueSoon && dueDate.getTime() === today.getTime()) vencimientoLabel = 'Vence Hoy'; 
                    else if (isDueSoon) vencimientoLabel = 'Vence Mañana'; 
                    
                    return (
                        <li key={item.id} className={`transaction-list-item ${listType === 'expense' && item.isPaid ? 'transaction-list-item-paid' : ''} ${isOverdue ? 'transaction-list-item-overdue' : ''} ${isDueSoon ? 'transaction-list-item-due-soon' : ''}`}>
                            <div className="transaction-item-details">
                                {listType === 'expense' && !item.isDebt && (
                                    <button onClick={() => toggleExpensePaid(item.id, item.isPaid)} className="transaction-toggle-button" title={item.isPaid ? 'Marcar como Pendiente' : 'Marcar como Pagado'}>
                                        {item.isPaid ? <PaidIcon /> : <UnpaidIcon />}
                                    </button>
                                )}
                                <div>
                                    <p className={`transaction-item-description ${listType === 'expense' && item.isPaid ? 'transaction-item-description-strike' : ''}`}>
                                        {item.description}
                                    </p>
                                    <div className="transaction-item-meta">
                                        {listType === 'income' && item.location && (<span className="transaction-item-location">A: {item.location}</span>)}
                                        {listType === 'expense' && item.source && (<span className="transaction-item-source">De: {item.source}</span>)}
                                        {listType === 'expense' && dueDate && (
                                            <div className="transaction-item-date-container">
                                                <CalendarDays className="transaction-item-calendar-icon" />
                                                <span>Vence: {dueDate.toLocaleDateString('es-AR')}</span>
                                            </div>
                                        )}
                                        {vencimientoLabel && (<span className={`transaction-item-vencimiento ${isOverdue ? 'transaction-item-vencimiento-overdue' : 'transaction-item-vencimiento-due-soon'}`}>({vencimientoLabel})</span>)} 
                                        {item.isRecurring && <span className="transaction-item-recurring">(Recurrente)</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="transaction-item-actions-container">
                                <p className={`transaction-item-amount ${listType === 'expense' ? 'transaction-item-amount-expense' : 'transaction-item-amount-income'}`}>
                                    {item.currency} {item.amount.toLocaleString('es-AR')}
                                </p>
                                <div className="transaction-item-buttons">
                                    <button onClick={() => openEditModal(item, listType)} className="transaction-action-button">
                                        <Edit className="transaction-action-icon"/>
                                    </button>
                                    <button onClick={() => openConfirmModal(item.id, listType)} className="transaction-action-button delete-button">
                                        <Trash2 className="transaction-action-icon"/>
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div> 
    ); 
};

export default TransactionList;