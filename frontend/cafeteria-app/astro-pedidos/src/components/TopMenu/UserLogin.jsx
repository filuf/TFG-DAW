import { useEffect, useRef, useState } from "react";
import styles from './Auth.module.css';

export default function UserLogin({ apiAuthUrl }) {
    const [userLogin, setUserLogin] = useState(null);
    const [showModal, setShowModal] = useState(false);
    /*
    * He creado una variable que me permite controlar si
    * se está mostrando el formulario de login o de registro.
    * Por defecto, se muestra el formulario de login.
    */
    const [isLogin, setIsLogin] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    // Variable que controla si se muestra o no el menú de usuario.
    const [showUserMenu, setShowUserMenu] = useState(false);
    // Variable para almacenar los datos del formulario de login y registro.
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const modalRef = useRef(null);
    const [showSidebar, setShowSidebar] = useState(false);
    // Variable que controla si el usuario está autenticado o no.
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Efecto para manejar el estado del modal
    useEffect(() => {
        // Guardo en "dialog" el elemento del modal.
        const dialog = modalRef.current;
        // Si no existe el elemento del modal, salgo de la función.
        if (!dialog) return;
        // Si el modal está visible, lo muestro.
        if (showModal) {
            if (!dialog.open) {
                console.log('Abriendo modal...');
                dialog.showModal();
            }
        } 
        // Si el modal no está visible, lo cierro.
        else {
            if (dialog.open) {
                console.log('Cerrando modal...');
                dialog.close();
            }
        }
    }, [showModal]);

    // renderiza el username si ya existe junto al token en el session storage
    useEffect(() => {
        const userStored = sessionStorage.getItem("username");
        if (userStored && sessionStorage.getItem("token")) {
            setUserLogin(userStored);
            setIsLoggedIn(true);
        }
    }, []);

    // Verificar el estado de autenticación al cargar el componente
    useEffect(() => {
        // Función que verifica si el usuario está autenticado.
        const checkAuth = async () => {
            // Intento verificar si el usuario está autenticado.
            try {
                // Variable que almacena la respuesta del servidor, ejemplo: { isAuthenticated: true, username: "usuario" }
                const response = await fetch(`${apiAuthUrl}/check`);
                // Variable que almacena los datos de la respuesta del servidor.
                const data = await response.json();
                // Si el usuario está autenticado, actualizo el estado del usuario.
                if (data.isAuthenticated) {
                    setIsLoggedIn(true);
                    setUserLogin(data.username);
                }
            } catch (error) {
                // Este error se produce si el usuario no está autenticado.
                console.error('Error al verificar autenticación:', error);
            }
        };

        checkAuth();
    }, [apiAuthUrl]);

    // fetch al hacer submit en el formulario de login
    const handleLogin = async (e) => {
        e.preventDefault();
        // Reseteo el mensaje de error a nada ("") para que no se muestre.
        setErrorMessage("");

        try {
            // Mensajes de consola para debuggear.
            console.log('Intentando login con:', { username: formData.username });
            // Intento hacer login con el servidor.
            const res = await fetch(`${apiAuthUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ 
                    username: formData.username,
                    password: formData.password 
                })
            });

            console.log('Respuesta del servidor:', res.status);
            const data = await res.json();
            console.log('Datos de respuesta:', data);

            if (res.ok) {
                setUserLogin(data.username);
                setShowModal(false);
                setFormData({ username: '', password: '', confirmPassword: '' });
                setIsLoggedIn(true);

                //almacena el usuario y token en sessionStorage
                sessionStorage.setItem("username", data.username);
                sessionStorage.setItem("token", data.token);
                // Emitir evento personalizado para que el header actualice el carrito
                window.dispatchEvent(new Event('user-login'));
            } else {
                switch (res.status) {
                    case 401:
                        setErrorMessage("Credenciales inválidas");
                        break;
                    case 403:
                        setErrorMessage("No tienes permisos para acceder");
                        break;
                    default:
                        setErrorMessage(data.message || "Error al iniciar sesión");
                }
            }
        } catch (error) {
            console.error("Error en el login:", error);
            setErrorMessage("Error de conexión con el servidor");
        }
    }

    // fetch al hacer submit en el formulario de registro
    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden");
            return;
        }

        if (formData.password.length < 12) {
            setErrorMessage("La contraseña debe tener al menos 12 caracteres");
            return;
        }

        try {
            console.log('Intentando registro con:', { username: formData.username });
            const res = await fetch(`${apiAuthUrl}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ 
                    username: formData.username,
                    email: formData.username, // Usamos el username como email
                    password: formData.password,
                    passwordConf: formData.confirmPassword
                })
            });

            console.log('Respuesta del servidor:', res.status);
            const data = await res.json();
            console.log('Datos de respuesta:', data);

            if (res.ok) {
                setShowModal(false);
                setIsLogin(true);
                setFormData({ username: '', password: '', confirmPassword: '' });
                setErrorMessage("Registro exitoso. Por favor, inicia sesión.");
            } else {
                switch (res.status) {
                    case 400:
                        setErrorMessage(data.message || "Datos de registro inválidos");
                        break;
                    case 409:
                        setErrorMessage("El email ya está registrado");
                        break;
                    default:
                        setErrorMessage(data.message || "Error en el registro");
                }
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            setErrorMessage("Error de conexión con el servidor");
        }
    }

    // Modificar los manejadores de click
    const handleLoginClick = (e) => {
        e.preventDefault();
        console.log('Login button clicked');
        if (!userLogin) {
            console.log('Setting modal to login mode');
            setIsLogin(true);
            setShowModal(true);
            setErrorMessage("");
            setFormData({ username: '', password: '', confirmPassword: '' });
        }
    }

    const handleRegisterClick = (e) => {
        e.preventDefault();
        console.log('Register button clicked');
        if (!userLogin) {
            console.log('Setting modal to register mode');
            setIsLogin(false);
            setShowModal(true);
            setErrorMessage("");
            setFormData({ username: '', password: '', confirmPassword: '' });
        }
    }

    // Modificar el cierre del modal
    const closeModal = () => {
        console.log('closeModal called');
        setShowModal(false);
        setErrorMessage("");
        setFormData({ username: '', password: '', confirmPassword: '' });
    };

    // alternar el estado del sidebar
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    }

    const handleLogout = () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("token");
        setUserLogin(null);
        setIsLoggedIn(false);
        setShowUserMenu(false);
        // Emitir evento personalizado para que el header actualice el carrito
        window.dispatchEvent(new Event('user-logout'));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoggedIn) {
        return (
            <div className={styles.usernameContainer} onClick={() => setShowUserMenu(!showUserMenu)}>
                <span className={styles.usernameText}>{userLogin}</span>
                <img 
                    src="/keyboard_arrow_down.svg" 
                    alt="Menú" 
                    className={styles.arrowDown}
                    style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none' }}
                />
                {showUserMenu && (
                    <div className={styles.userMenu}>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <div className={styles.authButtons}>
                <button
                    type="button"
                    onClick={handleLoginClick}
                    className={styles.loginButton}
                >
                    Iniciar Sesión
                </button>
                <button
                    type="button"
                    onClick={handleRegisterClick}
                    className={styles.registerButton}
                >
                    Registrarse
                </button>
            </div>

            <dialog 
                ref={modalRef}
                className={styles.modal}
                style={{ display: showModal ? 'flex' : 'none' }}
                onClose={() => {
                    console.log('Modal cerrado por evento onClose');
                    setShowModal(false);
                }}
            >
                <div className={styles.modalContainer}>
                    <div className={styles.closeButtonContainer}>
                        <button 
                            type="button"
                            className={styles.closeButton}
                            onClick={(e) => {
                                e.preventDefault();
                                console.log('Cerrando modal desde botón...');
                                closeModal();
                            }}
                            aria-label="Cerrar modal"
                        />
                    </div>

                    <div className={styles.modalLogoContainer}>
                        <img src="/favicon.png" alt="Logo del instituto" className={styles.modalLogo} />
                    </div>

                    <h2 className={styles.modalTitle}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>

                    <form onSubmit={isLogin ? handleLogin : handleRegister} className={styles.formContainer}>
                        <div>
                            <label htmlFor="username" className={styles.formLabel}>
                                {isLogin ? 'Usuario' : 'Usuario (será tu email)'}
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className={styles.formInput}
                                placeholder={isLogin ? "Tu usuario" : "tu@email.com"}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={styles.formLabel}>
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className={styles.formInput}
                                placeholder="••••••••"
                                minLength={12}
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className={styles.formLabel}>
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.formInput}
                                    placeholder="••••••••"
                                    minLength={12}
                                />
                            </div>
                        )}

                        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

                        <button type="submit" className={styles.submitButton}>
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>

                        <div className={styles.switchAuth}>
                            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setErrorMessage('');
                                    setFormData({ username: '', password: '', confirmPassword: '' });
                                }}
                                className={styles.switchAuthButton}
                            >
                                {isLogin ? 'Regístrate' : 'Inicia sesión'}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </>
    );
}