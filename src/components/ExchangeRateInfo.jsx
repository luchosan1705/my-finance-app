import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { RefreshCw } from '../utils/icons';

const ExchangeRateInfo = () => { 
    const { exchangeRate, lastUpdated, fetchExchangeRate, isLoadingRate, errorRate } = useContext(AppContext); 
    return (
        <div className="exchange-rate-container">
            <div className="exchange-rate-header">
                <h3 className="exchange-rate-title">Tipo de Cambio</h3>
                <button onClick={fetchExchangeRate} disabled={isLoadingRate} className="exchange-rate-refresh-button">
                    <RefreshCw className={`exchange-rate-refresh-icon ${isLoadingRate ? 'spinner' : ''}`} />
                </button>
            </div>
            {isLoadingRate && <p className="exchange-rate-loading">Cargando...</p>}
            {errorRate && <p className="exchange-rate-error">{errorRate}</p>}
            {exchangeRate && !errorRate && (
                <div>
                    <p className="exchange-rate-value">1 USD = {exchangeRate.toLocaleString('es-AR')} ARS</p>
                    <p className="exchange-rate-last-updated">Oficial (Compra) - Actualizado: {lastUpdated ? lastUpdated.toLocaleString('es-AR', { timeZone: "America/Argentina/Buenos_Aires" }) : '...'}</p>
                </div>
            )}
        </div>
    ); 
};

export default ExchangeRateInfo;
