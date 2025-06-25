import React, { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import { useAuth } from './hooks/useAuth';
import { AppProvider } from './context/AppContext'; // Importar AppProvider directamente

// Componentes de la aplicación
import Loader from './components/Loader';
import AuthScreen from './AuthScreen';
import Dashboard from './components/Dashboard';

// Componente principal de la aplicación
export default function App() {
    const { user, loading: authLoading } = useAuth(); // Usar el hook useAuth
    const [appStatus, setAppStatus] = useState('loading'); // loading, ready, error, auth_required

    useEffect(() => {
        // Se asegura que Firebase auth esté inicializado
        if (!auth) {
            setAppStatus('error');
            return;
        }

        if (!authLoading) { // Una vez que useAuth terminó de cargar
            if (user) {
                setAppStatus('ready');
            } else {
                setAppStatus('auth_required'); // Estado para mostrar la pantalla de autenticación
            }
        }
    }, [user, authLoading]);

    if (appStatus === 'loading') {
        return <Loader text="Verificando sesión..." />;
    }
    
    // Si hay un error crítico de inicialización de Firebase
    if (appStatus === 'error') {
        return (
            <div className="app-error-container">
                <div className="app-error-card">
                    <h1 className="app-error-title">Error Crítico de Configuración</h1>
                    <p className="app-error-message-text">
                       La aplicación no se puede conectar a Firebase. Por favor, asegúrate de que las credenciales en `firebaseConfig` son correctas y que has habilitado el inicio de sesión con Email/Contraseña en la consola de Firebase.
                    </p>
                </div>
            </div>
        );
    }
    
    // Si la autenticación es requerida, muestra la pantalla de Auth
    if (appStatus === 'auth_required') {
        return <AuthScreen />;
    }

    // Si todo está listo y el usuario está logueado, envuelve Dashboard con AppProvider
    return (
        <AppProvider> {/* Envuelve el Dashboard con AppProvider */}
            <Dashboard user={user} />
        </AppProvider>
    );
}