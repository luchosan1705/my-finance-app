import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';

// TransactionForm ahora recibe onCloseModal como una prop
const TransactionForm = ({ onCloseModal }) => {
  // Inicialización defensiva: asegúrate de que recurringExpenses y recurringIncomes sean arreglos vacíos por defecto
  const { 
    isLoadingRate, 
    recurringExpenses = [], // <--- Añadido valor por defecto
    recurringIncomes = [],  // <--- Añadido valor por defecto
    incomeLocations, 
    addIncome, 
    addExpense, 
    addOrUpdateDebt 
  } = useContext(AppContext);

  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [dueDate, setDueDate] = useState('');
  const [isDebt, setIsDebt] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');

  // Sincronizar ubicaciones iniciales o por defecto
  useEffect(() => {
    if (incomeLocations.length > 0) {
      if (!location || !incomeLocations.some(loc => loc.name === location)) setLocation(incomeLocations[0].name);
      if (!source || !incomeLocations.some(loc => loc.name === source)) setSource(incomeLocations[0].name);
    } else {
      setLocation('');
      setSource('');
    }
  }, [incomeLocations, location, source]);
  
  const handleTemplateSelect = (e, templateType) => { 
    const selectedId = e.target.value; 
    const templates = templateType === 'expense' ? recurringExpenses : recurringIncomes; 
    
    // Resetear formulario si se elige la opción manual
    if (!selectedId) {
        setDescription('');
        setAmount('');
        setCurrency('ARS');
        setDueDate('');
        setIsDebt(false);
        setIsRecurring(false);
        return;
    }

    const template = templates.find(t => t.id === selectedId); 
    if (template) { 
        setDescription(template.description); 
        setAmount(template.amount); 
        setCurrency(template.currency); 
        // Asignar los campos adicionales si existen en la plantilla
        setDueDate(template.dueDate || '');
        setIsDebt(template.isDebt || false);
        setIsRecurring(template.isRecurring || false);
        if (template.location) setLocation(template.location);
        if (template.source) setSource(template.source);
    } 
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCurrency('ARS');
    setDueDate('');
    setIsDebt(false);
    setIsRecurring(false);
    if (incomeLocations.length > 0) {
        setLocation(incomeLocations[0].name);
        setSource(incomeLocations[0].name);
    } else {
        setLocation('');
        setSource('');
    }
    // Restablecer los select de plantillas si existen
    if(document.getElementById('income-template-select')) document.getElementById('income-template-select').value = '';
    if(document.getElementById('expense-template-select')) document.getElementById('expense-template-select').value = '';
  };


  const handleSubmit = async (e) => { // Marcamos como async porque haremos llamadas a Firebase
    e.preventDefault(); 
    if (!description || !amount || parseFloat(amount) <= 0) { 
      alert("Por favor, complete todos los campos correctamente."); 
      return; 
    } 

    // Lógica para guardar la transacción directamente (sin el modal de confirmación)
    const transactionData = { 
        type, 
        description, 
        amount: parseFloat(amount), 
        currency, 
        date: new Date().toISOString(), 
        location, 
        source, 
        isDebt, 
        isRecurring, 
        dueDate 
    }; 

    if (type === 'income') {
        await addIncome(transactionData);
    } else {
        if (transactionData.isDebt) {
            await addOrUpdateDebt(transactionData.description, transactionData.amount, transactionData.currency);
        } else {
            await addExpense({ ...transactionData, isPaid: false });
        }
    }
    
    resetForm(); // Resetear el formulario
    if(onCloseModal) onCloseModal(); // Si se pasa la prop para cerrar el modal, la llamamos
  };

  return (
    <div className="transaction-form-container">
      <h3 className="transaction-form-title">Añadir Transacción</h3>
      <form onSubmit={handleSubmit} className="transaction-form">
        <fieldset disabled={isLoadingRate} className="transaction-form-fieldset">
          <div className="form-toggle-group">
            <button type="button" onClick={() => setType('expense')} className={`form-toggle-button ${type === 'expense' ? 'active-expense' : ''}`}>Gasto</button>
            <button type="button" onClick={() => setType('income')} className={`form-toggle-button ${type === 'income' ? 'active-income' : ''}`}>Ingreso</button>
          </div>
          {type === 'expense' && (
            <div className="form-group">
              <label htmlFor="expense-template-select" className="form-label">Cargar Gasto Recurrente</label>
              <select id="expense-template-select" onChange={(e) => handleTemplateSelect(e, 'expense')} className="form-select">
                <option value="">Gasto Manual...</option>
                {recurringExpenses.map(template => (<option key={template.id} value={template.id}>{template.description}</option>))}
              </select>
            </div>
          )}
          {type === 'income' && (
            <div className="form-group">
              <label htmlFor="income-template-select" className="form-label">Cargar Ingreso Recurrente</label>
              <select id="income-template-select" onChange={(e) => handleTemplateSelect(e, 'income')} className="form-select">
                <option value="">Ingreso Manual...</option>
                {recurringIncomes.map(template => (<option key={template.id} value={template.id}>{template.description}</option>))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="description" className="form-label">{isDebt ? 'Deudor' : 'Descripción'}</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" placeholder={isDebt ? 'Ej: Gustavo' : 'Ej: Alquiler, Salario'} required />
          </div>
          <div className="form-group-horizontal">
            <div className="form-field-grow">
              <label htmlFor="amount" className="form-label">Monto</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" placeholder="0.00" required />
            </div>
            <div className="form-field">
              <label htmlFor="currency" className="form-label">Moneda</label>
              <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-select">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          {type === 'income' && (
            <div className="form-group">
              <label htmlFor="location" className="form-label">Ubicación del Dinero</label>
              <select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="form-select">
                {incomeLocations.map(loc => (<option key={loc.id} value={loc.name}>{loc.name}</option>))}
              </select>
            </div>
          )}
          {type === 'expense' && (
            <div className="form-group-stacked">
              <div className="form-group">
                <label htmlFor="source" className="form-label">Pagar desde</label>
                <select id="source" value={source} onChange={(e) => setSource(e.target.value)} className="form-select" disabled={isDebt}>
                  {incomeLocations.map(loc => (<option key={loc.id} value={loc.name}>{loc.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dueDate" className="form-label">Fecha de Vencimiento</label>
                <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" disabled={isDebt} />
              </div>
              <div className="form-group-checkbox">
                <input id="isDebt" type="checkbox" checked={isDebt} onChange={(e) => setIsDebt(e.target.checked)} className="form-checkbox" />
                <label htmlFor="isDebt" className="form-checkbox-label">Marcar como Deuda (Acumulable)</label>
              </div>
            </div>
          )} 
          <div className="form-group-checkbox">
            <input id="isRecurring" type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="form-checkbox" />
            <label htmlFor="isRecurring" className="form-checkbox-label">Marcar como recurrente para el futuro</label>
          </div>
          <button type="submit" className="form-submit-button">Añadir {type === 'expense' ? 'Gasto' : 'Ingreso'}</button>
        </fieldset>
      </form>
    </div>
  );
};

export default TransactionForm;