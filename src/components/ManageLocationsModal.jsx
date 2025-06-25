import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Trash2 } from '../utils/icons';

const ManageLocationsModal = ({ isOpen, onClose }) => { 
    const { incomeLocations, addIncomeLocation, deleteIncomeLocation } = useContext(AppContext); 
    const [newLocation, setNewLocation] = useState(''); 
    
    const handleAdd = (e) => { 
        e.preventDefault(); 
        if (newLocation.trim()) { 
            addIncomeLocation(newLocation.trim()); 
            setNewLocation(''); 
        } 
    }; 
    
    if (!isOpen) return null; 

    return ( 
        <div className="modal-overlay"> 
            <div className="modal-content"> 
                <h2 className="modal-title">Gestionar Ubicaciones</h2> 
                
                <form onSubmit={handleAdd} className="modal-form"> 
                    <input 
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="modal-input"
                        placeholder="Nombre de la nueva ubicación"
                    /> 
                    <button type="submit" className="modal-button-primary">Añadir</button> 
                </form> 
                <h3 className="modal-subtitle">Ubicaciones Actuales:</h3> 
                <ul className="location-list"> 
                    {incomeLocations.map(loc => ( 
                        <li key={loc.id} className="location-list-item"> 
                            <span className="location-list-text">{loc.name}</span> 
                            <button onClick={() => deleteIncomeLocation(loc.id)} className="location-delete-button"> 
                                <Trash2 className="location-delete-icon" /> 
                            </button> 
                        </li> 
                    ))} 
                </ul> 
                <button onClick={onClose} className="modal-button-secondary">Cerrar</button> 
            </div> 
        </div> 
    ); 
};

export default ManageLocationsModal;