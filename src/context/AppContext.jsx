import React, { createContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../hooks/useAuth';
import { useExchangeRate } from '../hooks/useExchangeRate';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { user } = useAuth(); // Obtener el usuario del hook de autenticación
    const userId = user?.uid;

    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [debts, setDebts] = useState([]);
    const [incomeLocations, setIncomeLocations] = useState([]);
    const [firestoreDataLoaded, setFirestoreDataLoaded] = useState(false); // Nuevo estado para controlar la carga de Firestore
    const [dataLoading, setDataLoading] = useState(true); // Estado general de carga

    const { exchangeRate, lastUpdated, fetchExchangeRate, isLoadingRate, errorRate } = useExchangeRate();

    // Cargar datos de Firestore
    useEffect(() => {
        if (!userId || !db) {
            console.log("AppContext: userId o db no disponibles. Saltando carga de datos de Firestore.");
            return;
        }

        console.log("AppContext: Iniciando carga de datos de Firestore para userId:", userId);
        const loadedCollections = { incomes: false, expenses: false, income_locations: false, debts: false };
        
        const checkAllFirestoreLoaded = () => {
            if (Object.values(loadedCollections).every(Boolean)) {
                console.log("AppContext: Todas las colecciones de Firestore cargadas.");
                setFirestoreDataLoaded(true); // Marcar que Firestore está listo
            }
        };
        
        const createUnsubscriber = (collectionName, setData) => {
            const collectionRef = collection(db, 'users', userId, collectionName);
            return onSnapshot(collectionRef, snapshot => {
                const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setData(data);
                console.log(`AppContext: Datos de ${collectionName} recibidos:`, data);
                if (!loadedCollections[collectionName]) {
                    loadedCollections[collectionName] = true;
                    checkAllFirestoreLoaded();
                }
            }, err => {
                console.error(`AppContext: Error al obtener ${collectionName}:`, err);
                setFirestoreDataLoaded(false); // Si hay error, Firestore no está 'cargado con éxito'
                setDataLoading(false); // Quitar loader si hay un error persistente
            });
        };

        const unsubscribers = [
            createUnsubscriber('incomes', setIncomes),
            createUnsubscriber('expenses', setExpenses),
            createUnsubscriber('income_locations', setIncomeLocations),
            createUnsubscriber('debts', setDebts)
        ];

        return () => {
            console.log("AppContext: Limpiando listeners de Firestore.");
            unsubscribers.forEach(unsub => unsub());
        };
    }, [userId, db]);

    // --- Funciones que interactúan con Firebase (sin cambios) ---
    const addIncome = async (income) => {
        if (!userId) { console.warn("addIncome: No hay userId disponible."); return; }
        try {
            await addDoc(collection(db, 'users', userId, 'incomes'), income);
            console.log("Ingreso añadido a Firestore:", income);
        } catch (error) {
            console.error("Error al añadir ingreso:", error);
            alert("Error al añadir ingreso. Por favor, revisa la consola.");
        }
    };
    const addExpense = async (expense) => {
        if (!userId) { console.warn("addExpense: No hay userId disponible."); return; }
        try {
            await addDoc(collection(db, 'users', userId, 'expenses'), expense);
            console.log("Gasto añadido a Firestore:", expense);
        } catch (error) {
            console.error("Error al añadir gasto:", error);
            alert("Error al añadir gasto. Por favor, revisa la consola.");
        }
    };
    const toggleExpensePaid = async (id, currentStatus) => {
        if (!userId) { console.warn("toggleExpensePaid: No hay userId disponible."); return; }
        try {
            const expenseDoc = doc(db, 'users', userId, 'expenses', id);
            await updateDoc(expenseDoc, { isPaid: !currentStatus });
            console.log(`Gasto ${id} actualizado a pagado: ${!currentStatus}`);
        } catch (error) {
            console.error("Error al actualizar gasto:", error);
            alert("Error al actualizar gasto. Por favor, revisa la consola.");
        }
    };
    const addIncomeLocation = async (name) => {
        if (!userId) { console.warn("addIncomeLocation: No hay userId disponible."); return; }
        try {
            await addDoc(collection(db, 'users', userId, 'income_locations'), { name });
            console.log("Ubicación añadida:", name);
        } catch (error) {
            console.error("Error al añadir ubicación:", error);
            alert("Error al añadir ubicación. Por favor, revisa la consola.");
        }
    };
    const deleteIncomeLocation = async (id) => {
        if (!userId) { console.warn("deleteIncomeLocation: No hay userId disponible."); return; }
        try {
            await deleteDoc(doc(db, 'users', userId, 'income_locations', id));
            console.log("Ubicación eliminada:", id);
        } catch (error) {
            console.error("Error al eliminar ubicación:", error);
            alert("Error al eliminar ubicación. Por favor, revisa la consola.");
        }
    };
    const deleteIncome = async (id) => {
        if (!userId) { console.warn("deleteIncome: No hay userId disponible."); return; }
        try {
            await deleteDoc(doc(db, 'users', userId, 'incomes', id));
            console.log("Ingreso eliminado:", id);
        } catch (error) {
            console.error("Error al eliminar ingreso:", error);
            alert("Error al eliminar ingreso. Por favor, revisa la consola.");
        }
    };
    const deleteExpense = async (id) => {
        if (!userId) { console.warn("deleteExpense: No hay userId disponible."); return; }
        try {
            await deleteDoc(doc(db, 'users', userId, 'expenses', id));
            console.log("Gasto eliminado:", id);
        } catch (error) {
            console.error("Error al eliminar gasto:", error);
            alert("Error al eliminar gasto. Por favor, revisa la consola.");
        }
    };
    const deleteDebt = async (id) => {
        if (!userId) { console.warn("deleteDebt: No hay userId disponible."); return; }
        try {
            await deleteDoc(doc(db, 'users', userId, 'debts', id));
            console.log("Deuda eliminada:", id);
        } catch (error) {
            console.error("Error al eliminar deuda:", error);
            alert("Error al eliminar deuda. Por favor, revisa la consola.");
        }
    };
    const updateIncome = async (id, data) => {
        if (!userId) { console.warn("updateIncome: No hay userId disponible."); return; }
        try {
            const incomeDoc = doc(db, 'users', userId, 'incomes', id);
            await updateDoc(incomeDoc, data);
            console.log("Ingreso actualizado:", id, data);
        } catch (error) {
            console.error("Error al actualizar ingreso:", error);
            alert("Error al actualizar ingreso. Por favor, revisa la consola.");
        }
    };
    const updateExpense = async (id, data) => {
        if (!userId) { console.warn("updateExpense: No hay userId disponible."); return; }
        try {
            const expenseDoc = doc(db, 'users', userId, 'expenses', id);
            await updateDoc(expenseDoc, data);
            console.log("Gasto actualizado:", id, data);
        } catch (error) {
            console.error("Error al actualizar gasto:", error);
            alert("Error al actualizar gasto. Por favor, revisa la consola.");
        }
    };
    
    const addOrUpdateDebt = async (debtorName, amount, currency) => {
        if (!userId) { console.warn("addOrUpdateDebt: No hay userId disponible."); return; }
        const debtsRef = collection(db, 'users', userId, 'debts');
        const q = query(debtsRef, where("name", "==", debtorName));
        
        try {
            const querySnapshot = await getDocs(q);
            const updateField = currency === 'ARS' ? 'totalARS' : 'totalUSD';
            
            if (querySnapshot.empty) {
                await addDoc(debtsRef, {
                    name: debtorName,
                    totalARS: currency === 'ARS' ? amount : 0,
                    totalUSD: currency === 'USD' ? amount : 0,
                });
                console.log("Nueva deuda añadida:", debtorName, amount, currency);
            } else {
                const debtDoc = querySnapshot.docs[0];
                const newAmount = (debtDoc.data()[updateField] || 0) + amount;
                await updateDoc(debtDoc.ref, { [updateField]: newAmount });
                console.log("Deuda actualizada:", debtorName, newAmount, currency);
            }
        } catch (error) {
            console.error("Error al añadir/actualizar deuda:", error);
            alert("Error al gestionar la deuda. Por favor, revisa la consola.");
        }
    };

    const payDebt = async (debt, payAmount, payCurrency, source) => {
        if (!userId) { console.warn("payDebt: No hay userId disponible."); return; }
        const debtRef = doc(db, 'users', userId, 'debts', debt.id);
        const expensesRef = collection(db, 'users', userId, 'expenses');
        
        try {
            await runTransaction(db, async (transaction) => {
                const debtDoc = await transaction.get(debtRef);
                if (!debtDoc.exists()) {
                    throw "La deuda no existe!";
                }
                
                const updateField = payCurrency === 'ARS' ? 'totalARS' : 'totalUSD';
                const currentAmount = debtDoc.data()[updateField] || 0;
                let newAmount = currentAmount - payAmount;
                if(newAmount < 0) newAmount = 0; // Evita saldos negativos

                transaction.update(debtRef, { [updateField]: newAmount });
                
                const newExpense = {
                    description: `Pago deuda a ${debt.name}`,
                    amount: payAmount,
                    currency: payCurrency,
                    source: source,
                    isPaid: true,
                    isDebt: true, 
                    date: new Date().toISOString()
                };
                transaction.set(doc(expensesRef), newExpense);
                console.log(`Pago de deuda registrado: ${payAmount} ${payCurrency} a ${debt.name}`);

                const otherField = payCurrency === 'ARS' ? 'totalUSD' : 'totalARS';
                const otherAmount = debtDoc.data()[otherField] || 0;
                if (newAmount <= 0 && otherAmount <= 0) {
                    transaction.delete(debtRef);
                    console.log(`Deuda con ${debt.name} completamente saldada y eliminada.`);
                }
            });
        } catch (e) {
            console.error("Error al pagar la deuda: ", e);
            alert("Error al procesar el pago: " + e);
        }
    };

    // Cálculos de la aplicación
    const calculations = useMemo(() => {
        console.log("Calculations useMemo: Recalculando...");
        console.log("Deps for calculations: incomes.length:", incomes.length, "expenses.length:", expenses.length, "debts.length:", debts.length, "exchangeRate:", exchangeRate, "incomeLocations.length:", incomeLocations.length);

        if (exchangeRate === null) { 
            console.log("Calculations useMemo: exchangeRate es null, devolviendo valores por defecto iniciales.");
            return {
                totalIncome: 0, totalExpenses: 0, remainingBalance: 0, remainingBalanceARS: 0, remainingBalanceUSD: 0,
                unpaidExpenses: [], unpaidExpensesValue: 0, unpaidExpensesInUsd: 0,
                paidExpenses: 0, paidExpensesList: [], debtList: [], balancesByLocation: {},
                recurringIncomes: [], recurringExpenses: []
            };
        }

        const convertToArs = (amount, currency) => currency === 'USD' ? amount * exchangeRate : amount;
        const convertToUsd = (amount, currency) => currency === 'ARS' && exchangeRate > 0 ? amount / exchangeRate : amount;
        
        const totalIncome = incomes.reduce((sum, income) => sum + convertToArs(income.amount, income.currency), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + convertToArs(expense.amount, expense.currency), 0);
        const paidExpensesValue = expenses.filter(e => e.isPaid).reduce((sum, expense) => sum + convertToArs(expense.amount, expense.currency), 0);
        
        const unpaidExpensesList = expenses.filter(e => !e.isPaid && !e.isDebt);
        const unpaidExpensesValue = unpaidExpensesList.reduce((sum, expense) => sum + convertToArs(expense.amount, expense.currency), 0);
        const unpaidExpensesInUsd = exchangeRate > 0 ? unpaidExpensesValue / exchangeRate : 0;
        
        const paidExpensesList = expenses.filter(e => e.isPaid);
        
        // Modificación para balancesByLocation: almacenar ARS y USD por separado
        const balancesByLocation = incomeLocations.reduce((acc, loc) => { 
            acc[loc.name] = { totalARS: 0, totalUSD: 0 }; 
            return acc; 
        }, {});

        incomes.forEach(income => { 
            const location = income.location || 'Sin Ubicación'; 
            if (balancesByLocation[location]) {
                if (income.currency === 'ARS') {
                    balancesByLocation[location].totalARS += income.amount;
                } else if (income.currency === 'USD') {
                    balancesByLocation[location].totalUSD += income.amount;
                }
            }
        });
        expenses.forEach(expense => { 
            if(expense.isPaid && expense.source) { 
                const source = expense.source; 
                if(balancesByLocation[source]) {
                    if (expense.currency === 'ARS') {
                        balancesByLocation[source].totalARS -= expense.amount;
                    } else if (expense.currency === 'USD') {
                        balancesByLocation[source].totalUSD -= expense.amount;
                    }
                } 
            } 
        });
        
        const totalIncomeARS = incomes.filter(i => i.currency === 'ARS').reduce((sum, i) => sum + i.amount, 0);
        const totalIncomeUSD = incomes.filter(i => i.currency === 'USD').reduce((sum, i) => sum + i.amount, 0);
        const paidExpensesARS = expenses.filter(e => e.isPaid && e.currency === 'ARS').reduce((sum, e) => sum + e.amount, 0);
        const paidExpensesUSD = expenses.filter(e => e.isPaid && e.currency === 'USD').reduce((sum, e) => sum + e.amount, 0);
        
        const remainingBalanceARS = totalIncomeARS - paidExpensesARS;
        const remainingBalanceUSD = totalIncomeUSD - paidExpensesUSD;
        
        const recurringIncomes = incomes.filter(i => i.isRecurring);
        const recurringExpenses = expenses.filter(e => e.isRecurring && !e.isDebt);

        const result = { totalIncome, totalExpenses, remainingBalance: totalIncome - paidExpensesValue, remainingBalanceARS, remainingBalanceUSD, unpaidExpenses: unpaidExpensesList, unpaidExpensesValue, unpaidExpensesInUsd, paidExpenses: paidExpensesValue, paidExpensesList, debtList: debts, balancesByLocation, recurringIncomes, recurringExpenses };
        console.log("Calculations useMemo: Resultado:", result);
        return result;
    }, [incomes, expenses, debts, exchangeRate, incomeLocations]); // Dependencias: estos arrays de datos y el tipo de cambio

    // Efecto para controlar el estado general de carga (dataLoading)
    useEffect(() => {
        console.log("AppContext: Comprobando estado de carga general final...");
        console.log(" - firestoreDataLoaded:", firestoreDataLoaded);
        console.log(" - isLoadingRate (ExchangeRate):", isLoadingRate);
        console.log(" - exchangeRate (value):", exchangeRate);
        console.log(" - calculations (totalIncome para verificación):", calculations.totalIncome);

        // setDataLoading a false SOLO si:
        // 1. Los datos de Firestore han terminado de cargar (firestoreDataLoaded es true)
        // 2. El tipo de cambio ha terminado de cargar (isLoadingRate es false)
        // 3. El valor del tipo de cambio NO es null (exchangeRate !== null)
        // 4. El objeto calculations ya fue computado y es válido (p.ej., totalIncome no es undefined)
        if (firestoreDataLoaded && !isLoadingRate && exchangeRate !== null && calculations.totalIncome !== undefined) {
            console.log("AppContext: Todos los datos (Firestore, ExchangeRate y Cálculos) están listos. setDataLoading(false).");
            setDataLoading(false);
        } else {
            console.log("AppContext: Todavía cargando datos o cálculos no listos. Mantenido Loader.");
            setDataLoading(true); // Mantener loader activo
        }
    }, [firestoreDataLoaded, isLoadingRate, exchangeRate, calculations]); // Añadir 'calculations' a las dependencias

    const contextValue = { 
        // Pasamos los estados de datos crudos
        incomes, expenses, debts, incomeLocations,
        // Pasamos las funciones de Firebase
        addIncome, addExpense, toggleExpensePaid, 
        addIncomeLocation, deleteIncomeLocation, 
        addOrUpdateDebt, payDebt, 
        deleteIncome, deleteExpense, deleteDebt, 
        updateIncome, updateExpense, 
        fetchExchangeRate, // Función para refrescar el tipo de cambio
        // Pasamos los estados del tipo de cambio
        isLoadingRate, errorRate, lastUpdated, exchangeRate, // exchangeRate también se pasa individualmente
        // Pasamos los resultados de los cálculos
        calculations, // Pasar el objeto calculations completo
        dataLoading // Estado de carga general
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};