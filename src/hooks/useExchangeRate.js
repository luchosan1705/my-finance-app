// src/hooks/useExchangeRate.js
import { useState, useEffect } from 'react';

export const useExchangeRate = () => {
    const [exchangeRate, setExchangeRate] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLoadingRate, setIsLoadingRate] = useState(true);
    const [errorRate, setErrorRate] = useState(null);

    const fetchExchangeRate = async () => {
        setIsLoadingRate(true);
        setErrorRate(null);
        try {
            const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
            if (!response.ok) throw new Error('La respuesta de la red no fue exitosa');
            const data = await response.json();
            if (data && data.compra) {
                setExchangeRate(data.compra);
                setLastUpdated(new Date(data.fechaActualizacion));
            } else {
                throw new Error('Formato de API no esperado.');
            }
        } catch (error) {
            console.error("Fallo al obtener el tipo de cambio:", error);
            setErrorRate('No se pudo cargar el tipo de cambio. Se usará un valor de respaldo.');
            setExchangeRate(922.50); // Valor de respaldo
            setLastUpdated(new Date());
        } finally {
            setIsLoadingRate(false);
        }
    };

    useEffect(() => {
        fetchExchangeRate();
    }, []);

    return { exchangeRate, lastUpdated, fetchExchangeRate, isLoadingRate, errorRate };
};
