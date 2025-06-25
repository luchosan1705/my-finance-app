import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from './firebase/firebase';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await setPersistence(auth, keepLoggedIn ? browserLocalPersistence : browserSessionPersistence);
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error("Auth Error:", err.code);
            if (err.code === 'auth/operation-not-allowed') {
                 setError(
                    "Error de Configuración: El inicio de sesión con Email/Contraseña no está habilitado.\n\n" +
                    "Sigue estos pasos en la Consola de Firebase:\n" +
                    "1. Ve a 'Authentication' > 'Sign-in method'.\n" +
                    "2. Habilita el proveedor 'Email/Password'.\n" +
                    "3. Recarga la página."
                );
            } else {
                setError("Error: " + err.message);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div>
                    <h2 className="auth-title">
                        {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una cuenta nueva'}
                    </h2>
                </div>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <div>
                            <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="auth-input top-rounded" placeholder="Correo electrónico"/>
                        </div>
                        <div>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="auth-input bottom-rounded" placeholder="Contraseña"/>
                        </div>
                    </div>

                    <div className="auth-checkbox-group">
                        <div className="auth-checkbox-item">
                            <input id="keep-logged-in" name="keep-logged-in" type="checkbox" checked={keepLoggedIn} onChange={(e) => setKeepLoggedIn(e.target.checked)} className="auth-checkbox"/>
                            <label htmlFor="keep-logged-in" className="auth-checkbox-label">
                                Mantenerse conectado
                            </label>
                        </div>
                    </div>

                    {error && <p className="auth-error-message">{error}</p>}

                    <div>
                        <button type="submit" className="auth-submit-button">
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    </div>
                </form>
                <div className="auth-toggle-link-container">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="auth-toggle-link">
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;