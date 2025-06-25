// src/components/Dashboard.jsx
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Componentes de UI
import Loader from './Loader';
import StatCard from './StatCard';
import BalanceStatCard from './BalanceStatCard'; 
import TransactionList from './TransactionList';
import DebtList from './DebtList';
import ExchangeRateInfo from './ExchangeRateInfo'; 
import ManageLocationsModal from './ManageLocationsModal';
import PayDebtModal from './PayDebtModal';
import EditTransactionModal from './EditTransactionModal';
import ConfirmModal from './ConfirmModal';
import ConfirmSubmitModal from './ConfirmSubmitModal'; 
import TransactionForm from './TransactionForm'; 

// Iconos
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2, Wallet, Settings, LogOut, Landmark, PlusCircle } from '../utils/icons';

const Dashboard = ({ user }) => {
    // Destructurar todo lo necesario del contexto aquí, al principio del componente
    const { 
        dataLoading, 
        incomes, 
        expenses, 
        debts, 
        incomeLocations, 
        // Destructuramos calculations y le asignamos un objeto vacío por defecto
        // Esto asegura que calculations siempre sea un objeto, incluso si el contexto aún no lo provee.
        calculations = { 
            totalIncome: 0, totalExpenses: 0, remainingBalance: 0, remainingBalanceARS: 0, remainingBalanceUSD: 0, 
            unpaidExpenses: [], unpaidExpensesValue: 0, unpaidExpensesInUsd: 0, 
            paidExpenses: 0, paidExpensesList: [], debtList: [], balancesByLocation: {}, 
            recurringIncomes: [], recurringExpenses: [] 
        },
        addIncome, addExpense, toggleExpensePaid, 
        addIncomeLocation, deleteIncomeLocation, 
        addOrUpdateDebt, payDebt, 
        deleteIncome, deleteExpense, deleteDebt, 
        updateIncome, updateExpense, 
        exchangeRate, lastUpdated, fetchExchangeRate, isLoadingRate, errorRate,
        recurringExpenses, recurringIncomes, 
    } = useContext(AppContext);

    // Estados locales para el control de modales y datos de transacción
    const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
    const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
    const [currentDebt, setCurrentDebt] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [transactionToSubmit, setTransactionToSubmit] = useState(null); 
    const [isConfirmSubmitModalOpen, setIsConfirmSubmitModalOpen] = useState(false);

    const [selectedTab, setSelectedTab] = useState('dashboard'); 
    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false); 


    // Handlers para abrir/cerrar modales
    const handleOpenPayDebtModal = (debt) => {
        setCurrentDebt(debt);
        setIsPayDebtModalOpen(true);
    };

    const handleClosePayDebtModal = () => {
        setCurrentDebt(null);
        setIsPayDebtModalOpen(false);
    };

    const handleOpenEditModal = (transaction, type) => {
        setCurrentTransaction({ ...transaction, type });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setCurrentTransaction(null);
        setIsEditModalOpen(false);
    };

    const handleOpenConfirmModal = (id, type) => {
        setItemToDelete({ id, type });
        setIsConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setItemToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        const { id, type } = itemToDelete;
        if (type === 'income') deleteIncome(id);
        else if (type === 'expense') deleteExpense(id);
        else if (type === 'debt') deleteDebt(id);
        handleCloseConfirmModal();
    };

    const handleOpenConfirmSubmitModal = (transactionData, onSubmitted) => {
        setTransactionToSubmit({data: transactionData, callback: onSubmitted});
        setIsConfirmSubmitModalOpen(true);
    };
    
    const handleCloseConfirmSubmitModal = () => {
        setTransactionToSubmit(null);
        setIsConfirmSubmitModalOpen(false);
        setIsAddTransactionModalOpen(false); 
    };

    const handleConfirmSubmit = () => {
        if (!transactionToSubmit) return;
        const { type, ...data } = transactionToSubmit.data;
        if (type === 'income') {
            addIncome(data);
        } else {
            if (data.isDebt) {
                addOrUpdateDebt(data.description, data.amount, data.currency);
            } else {
                addExpense({ ...data, isPaid: false });
            }
        }
        if(transactionToSubmit.callback) transactionToSubmit.callback();
        handleCloseConfirmSubmitModal();
    };

    const handleOpenAddTransactionModal = () => {
        setIsAddTransactionModalOpen(true);
    };

    const handleCloseAddTransactionModal = () => {
        setIsAddTransactionModalOpen(false);
    };


    // Si los datos aún están cargando, mostrar el loader
    if(dataLoading) { 
        console.log("Dashboard: dataLoading es TRUE, mostrando Loader.");
        console.log("dataLoading:", dataLoading, "calculations:", calculations); 
        return <Loader text="Cargando datos..." />; 
    }

    if (!calculations) {
        console.error("Dashboard: calculations es undefined o null después de cargar datos. Esto no debería pasar, pero se muestra un loader.");
        return <Loader text="Error al cargar cálculos..." />;
    }


    const renderMainContent = () => {
        console.log("Dashboard: Rendering main content. Calculations:", calculations); 
        console.log("Dashboard: Incomes:", incomes); 
        console.log("Dashboard: Expenses:", expenses); 
        console.log("Dashboard: Debts:", debts); 

        switch (selectedTab) {
            case 'dashboard':
                return (
                    <>
                        <section className="dashboard-stats-grid">
                            <StatCard title="Ingresos Totales" value={calculations.totalIncome} icon={<ArrowUpCircle className="icon-green" />} />
                            <StatCard title="Gastos Totales" value={calculations.totalExpenses} icon={<ArrowDownCircle className="icon-red" />} />
                            <StatCard title="Gastos Pendientes" value={calculations.unpaidExpensesValue} secondaryValue={calculations.unpaidExpensesInUsd} secondaryCurrency="USD" icon={<ArrowDownCircle className="icon-amber" />} />
                            <StatCard title="Gastos Pagados" value={calculations.paidExpenses} icon={<CheckCircle2 className="icon-blue" />} />
                            <BalanceStatCard title="Dinero Restante" arsValue={calculations.remainingBalanceARS} usdValue={calculations.remainingBalanceUSD} icon={<Wallet className="icon-emerald" />} />
                        </section>
                        {/* Nuevo contenedor para Saldos por Ubicación y Tipo de Cambio */}
                        <div className="dashboard-bottom-grid">
                            <section className="section-container">
                                <div className="section-header">
                                    <h2 className="section-title">Saldos por Ubicación</h2>
                                    <button onClick={()=> setIsLocationsModalOpen(true)} className="manage-button">
                                        <Settings className="manage-button-icon" /><span>Gestionar</span>
                                    </button>
                                </div>
                                <div className="location-balances-grid">
                                    {Object.keys(calculations.balancesByLocation || {}).length > 0 ? Object.entries(calculations.balancesByLocation).map(([location, balance]) => ( 
                                        <div key={location} className="location-balance-card">
                                            <div className="location-balance-header">
                                                <Landmark className="icon-sky" />
                                                <p className="location-name">{location}</p>
                                            </div>
                                            <p className="location-balance-value">ARS {balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div> 
                                    )) : <p className="text-center-full">No hay saldos para mostrar. Agrega y gestiona ubicaciones para empezar.</p> }
                                </div>
                            </section>
                            {/* Sección Tipo de Cambio ahora se renderiza aquí */}
                            <ExchangeRateInfo /> 
                        </div>
                    </>
                );
            case 'pending_expenses':
                return <TransactionList 
                            title="Gastos Pendientes" 
                            items={calculations.unpaidExpenses} 
                            listType="expense" 
                            openEditModal={handleOpenEditModal} 
                            openConfirmModal={handleOpenConfirmModal} 
                        />;
            case 'debts':
                return <DebtList 
                            debts={calculations.debtList} 
                            openPayDebtModal={handleOpenPayDebtModal} 
                            openConfirmModal={handleOpenConfirmModal} 
                        />;
            case 'paid_expenses':
                return <TransactionList 
                            title="Historial de Gastos Pagados" 
                            items={calculations.paidExpensesList} 
                            listType="expense" 
                            openEditModal={handleOpenEditModal} 
                            openConfirmModal={handleOpenConfirmModal} 
                        />;
            case 'incomes':
                return <TransactionList 
                            title="Historial de Ingresos" 
                            items={incomes} 
                            listType="income" 
                            openEditModal={handleOpenEditModal} 
                            openConfirmModal={handleOpenConfirmModal} 
                        />;
            default:
                return null;
        }
    };

    return (
        <div className="app-container">
            <div className="app-max-width-container">
                <header className="app-header">
                    <div className="app-header-left"> 
                        <h1 className="app-title">Panel Financiero</h1>
                    </div>
                    <div className="user-info-and-logout">
                        <p className="username-display">{user?.email || 'Usuario'}</p> 
                        <button onClick={() => signOut(auth)} className="logout-button" title="Cerrar Sesión">
                            <LogOut className="logout-icon" />
                            <span className="sr-only">Cerrar Sesión</span> 
                        </button>
                    </div>
                </header>
                
                {/* Menú de Navegación */}
                <nav className="main-nav">
                    <div className="nav-buttons-left">
                        <button onClick={() => setSelectedTab('dashboard')} className={`nav-button ${selectedTab === 'dashboard' ? 'nav-button-active' : ''}`}>Panel</button>
                        <button onClick={() => setSelectedTab('pending_expenses')} className={`nav-button ${selectedTab === 'pending_expenses' ? 'nav-button-active' : ''}`}>Gastos Pendientes</button>
                        <button onClick={() => setSelectedTab('debts')} className={`nav-button ${selectedTab === 'debts' ? 'nav-button-active' : ''}`}>Deudas</button>
                        <button onClick={() => setSelectedTab('paid_expenses')} className={`nav-button ${selectedTab === 'paid_expenses' ? 'nav-button-active' : ''}`}>Historial de Gastos</button>
                        <button onClick={() => setSelectedTab('incomes')} className={`nav-button ${selectedTab === 'incomes' ? 'nav-button-active' : ''}`}>Historial de Ingresos</button>
                    </div>
                    <button onClick={handleOpenAddTransactionModal} className="add-transaction-nav-button"> 
                        <PlusCircle className="add-transaction-icon" />
                        <span>Nueva Transacción</span>
                    </button>
                </nav>

                <main className="main-grid">
                    <div className="main-col-left"> 
                        {renderMainContent()}
                    </div>
                </main>
                <ManageLocationsModal isOpen={isLocationsModalOpen} onClose={() => setIsLocationsModalOpen(false)} />
                <PayDebtModal isOpen={isPayDebtModalOpen} onClose={handleClosePayDebtModal} debt={currentDebt} />
                <EditTransactionModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} transaction={currentTransaction} type={currentTransaction?.type} />
                <ConfirmModal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal} onConfirm={handleConfirmDelete} title="Confirmar Eliminación" message="¿Estás seguro de que quieres eliminar este item? Esta acción no se puede deshacer." />
                
                {isConfirmSubmitModalOpen && (
                  <ConfirmSubmitModal 
                    isOpen={isConfirmSubmitModalOpen} 
                    onClose={handleCloseConfirmSubmitModal} 
                    onConfirm={handleConfirmSubmit} 
                    transaction={transactionToSubmit?.data} 
                  />
                )}

                {isAddTransactionModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <TransactionForm onCloseModal={handleCloseAddTransactionModal} /> 
                            <button onClick={handleCloseAddTransactionModal} className="modal-button-secondary modal-close-button">Cerrar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;