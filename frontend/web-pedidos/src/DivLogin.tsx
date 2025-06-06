import React, { useEffect, useState } from "react"
import { toast } from 'react-toastify';
import styles from './Login.module.css';

// Declaración del tipo para import.meta.env
declare global {
    interface ImportMeta {
        env: {
            VITE_URL_SPRING_AUTH: string;
        }
    }
}

const urlAuth = import.meta.env.VITE_URL_SPRING_AUTH;

interface AuthResponse {
  username: string;
  authorities: string[];
  token: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

export default function DivLogin({setIsLoged}: {setIsLoged: (isLoged: boolean) => void}) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Verificar si hay credenciales guardadas al cargar
    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setFormData(prev => ({ ...prev, username: savedUsername }));
            setRememberMe(true);
        }
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        }
        
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar el error del campo cuando el usuario empieza a escribir
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${urlAuth}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data: AuthResponse = await response.json();

            if (!data.authorities.includes('ADMIN')) {
                throw new Error('No tienes permisos para acceder a esta aplicación');
            }

            // Guardar el token en sessionStorage
            sessionStorage.setItem('token', data.token);

            // Si "Recordarme" está activado, guardar el username
            if (rememberMe) {
                localStorage.setItem('username', formData.username);
            } else {
                localStorage.removeItem('username');
            }

            toast.success('¡Bienvenido!');
            setIsLoged(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
            toast.error(errorMessage);
            setErrors({
                username: errorMessage === 'Credenciales inválidas' ? 'Usuario o contraseña incorrectos' : undefined,
                password: errorMessage === 'Credenciales inválidas' ? 'Usuario o contraseña incorrectos' : undefined
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginDialog}>
                <div className={styles.loginHeader}>
                    <h1 className={styles.loginTitle}>Iniciar Sesión</h1>
                    <p className={styles.loginSubtitle}>Accede a tu panel de administración</p>
                </div>

                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.formLabel}>
                            Usuario
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={`${styles.formInput} ${errors.username ? styles.error : ''}`}
                            placeholder="Ingresa tu usuario"
                            disabled={isLoading}
                            autoComplete="username"
                        />
                        {errors.username && (
                            <span className={styles.errorMessage}>{errors.username}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.formLabel}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                            placeholder="Ingresa tu contraseña"
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        {errors.password && (
                            <span className={styles.errorMessage}>{errors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`${styles.loginButton} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}