/**
 * Componente encargado de mostrar el modal de login y registro, así como el menú de usuario.
 * @author: Aitor & Agustín
 * @version: 1.5.0
 * @description: Este componente se encarga no solo de mostrr los modales de inicio de sesión,
 * de recuperar contraseña y de registro, sino también de mostrar el menú de usuario y el carrito
 * en aquellos escenarios donde el usuario ya haya iniciado sesión (esta autenticado).
 */

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
    // Estado unificado para manejar mensajes de error y éxito
    const [message, setMessage] = useState({ text: "", type: "" }); // "error", "success", ""
    // Variable que controla si se muestra o no el menú de usuario.
    const [showUserMenu, setShowUserMenu] = useState(false);
    // Variable para almacenar los datos del formulario de login y registro.
    const [formData, setFormData] = useState({
        username: '',
        mail: '',
        password: '',
        confirmPassword: ''
    });
    const modalRef = useRef(null);
    const [showSidebar, setShowSidebar] = useState(false);
    // Variable que controla si el usuario está autenticado o no.
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    /**
     * Variable que controla el tipo de modal que se está mostrando, tiene dos variables,
     * la primera es "modalType" que controla el tipo de modal que se está mostrando, y la
     * segunda es "showModal" que controla si se muestra o no el modal.
     */
    const [modalType, setModalType] = useState('login');

    // Función helper para limpiar mensajes
    const clearMessage = () => {
        setMessage({ text: "", type: "" });
    };

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

    // fetch al hacer submit en el formulario de login
    const handleLogin = async (e) => {
        e.preventDefault();
        // Reseteo el mensaje a nada ("") para que no se muestre.
        clearMessage();

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


            if (res.ok) {
                const data = await res.json();
                console.log('Datos de respuesta:', data);
                setUserLogin(data.username);
                setShowModal(false);
                setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
                setIsLoggedIn(true);

                //almacena el usuario y token en sessionStorage
                sessionStorage.setItem("username", data.username);
                sessionStorage.setItem("token", data.token);
                // Emitir evento personalizado para que el header actualice el carrito
                window.dispatchEvent(new Event('user-login'));
            } else {
                switch (res.status) {
                    case 400:
                        setMessage({ text: "Solicitud incorrecta. Por favor, revisa los datos ingresados.", type: "error" });
                        break;
                    case 401:
                        setMessage({ text: "No autorizado. Por favor, verifica tus credenciales.", type: "error" });
                        break;
                    case 403:
                        setMessage({ text: "Usuario o contraseña incorrectos", type: "error" });
                        break;
                    case 404:
                        setMessage({ text: "Recurso no encontrado. Por favor, intenta de nuevo.", type: "error" });
                        break;
                    case 500:
                        setMessage({ text: "Error interno del servidor. Por favor, intenta más tarde.", type: "error" });
                        break;
                    default:
                        setMessage({ text: "Error inesperado, contacte con los administradores", type: "error" });
                        break;
                }
            }
        } catch (error) {
            console.error("Error en el login:", error);
            setMessage({ text: "Error de conexión con el servidor", type: "error" });
        }
    }

    // fetch al hacer submit en el formulario de registro
    const handleRegister = async (e) => {
        e.preventDefault();
        clearMessage();

        // Validación del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.mail || !emailRegex.test(formData.mail)) {
            setMessage({ text: "Por favor, introduce un email válido", type: "error" });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ text: "Las contraseñas no coinciden", type: "error" });
            return;
        }

        if (formData.password.length < 12) {
            setMessage({ text: "La contraseña debe tener al menos 12 caracteres", type: "error" });
            return;
        }

        try {
            console.log('Intentando registro con:', { username: formData.username, email: formData.mail });
            const res = await fetch(`${apiAuthUrl}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.mail, // Usamos el campo mail específico
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
                setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
                setMessage({ text: "Registro exitoso. Por favor, inicia sesión.", type: "success" });
            } else {
                switch (res.status) {
                    case 400:
                        setMessage({ text: data.message || "Datos de registro inválidos", type: "error" });
                        break;
                    case 403:
                        setMessage({ text: "No autorizado. Por favor, verifica tus credenciales.", type: "error" });
                        break;
                    case 409:
                        // Verificar el tipo de conflicto basado en el mensaje del servidor
                        if (data.message && data.message.toLowerCase().includes('username')) {
                            setMessage({ text: "El nombre de usuario ya está en uso", type: "error" });
                        } else if (data.message && data.message.toLowerCase().includes('email')) {
                            setMessage({ text: "El email ya está registrado", type: "error" });
                        } else {
                            setMessage({ text: "El usuario o email ya está registrado", type: "error" });
                        }
                        break;
                    case 500:
                        setMessage({ text: "Error interno del servidor. Por favor, intenta más tarde.", type: "error" });
                        break;
                    default:
                        setMessage({ text: data.message || "Error en el registro", type: "error" });
                }
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            setMessage({ text: "Error de conexión con el servidor", type: "error" });
        }
    }

    /**
     * Función encargada de manejar el clic en el botón de login, si el 
     * usuario no está autenticado (no ha iniciado sesión), se procede
     * a mostrar el modal de login.
     * @param {evento} evento 
     */
    const handleLoginClick = (evento) => {
        // Prevenir el comportamiento por defecto del botón.
        evento.preventDefault();
        // Muestro un mensaje en la consola para debuggear.
        console.log('Login button clicked');
        // Si el usuario no está autenticado (no ha iniciado sesión), se muestra el modal de login.
        if (!userLogin) {
            console.log('Setting modal to login mode');
            setModalType("login");
            setShowModal(true);
            clearMessage();
            setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
        }
    }

    /**
     * Maneja el clic en el botón de registro, si el usuario no está autenticado (no ha iniciado sesión),
     * se muestra el modal de registro.
     */
    const handleRegisterClick = (evento) => {
        // Prevenir el comportamiento por defecto del botón.
        evento.preventDefault();
        console.log('Register button clicked');
        // Si el usuario no está autenticado (no ha iniciado sesión), se muestra el modal de registro.
        if (!userLogin) {
            console.log('Setting modal to register mode');
            setModalType("register");
            setShowModal(true);
            clearMessage();
            setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
        }
    }

    // Modificar el cierre del modal
    const closeModal = () => {
        console.log('closeModal called');
        setShowModal(false);
        clearMessage();
        setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
    };

    // alternar el estado del sidebar
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    }

    /**
     * Cierra la sesión del usuario, elimina el usuario y el token de la sesión y
     * emite un evento personalizado para que el header actualice el carrito.
     */
    const handleLogout = () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("token");
        setUserLogin(null);
        setIsLoggedIn(false);
        setShowUserMenu(false);
        // Emitir evento personalizado para que el header actualice el carrito
        window.dispatchEvent(new Event('user-logout'));
    };

    const handleRecoverPassword = async (evento) => {
        // Prevenir el comportamiento por defecto del botón.
        evento.preventDefault();

        // Si el usuario no ha introducido su nombre de usuario, se muestra un mensaje de error.
        if (!formData.username) {
            setMessage({ text: "Por favor, introduce tu nombre de usuario", type: "error" });
            return;
        }
        // Intento enviar el correo de recuperación de contraseña.
        try {
            // Defino el ENDPOINT utilizazado y el tipo de método utilizado.
            const respuesta = await fetch(`${apiAuthUrl}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    username: formData.username
                })
            });

            // Convierto la respuesta a texto para poder acceder a los datos.
            const data = await respuesta.text();

            // Si la respuesta es ok, se muestra un mensaje de éxito.
            if (respuesta.ok) {
                setMessage({ text: "Se ha enviado un correo de recuperación de contraseña", type: "success" });
                // Cierro el modal con un setTimeout para que se muestre el mensaje de éxito.
                setTimeout(() => {
                    setShowModal(false);
                }, 3000);
            } else {
                // Si la respuesta no es ok, se muestra un mensaje de error.
                switch (respuesta.status) {
                    case 400:
                        setMessage({ text: "Solicitud incorrecta. Por favor, revisa los datos ingresados.", type: "error" });
                        break;
                    case 401:
                        setMessage({ text: "No autorizado. Por favor, verifica tus credenciales.", type: "error" });
                        break;
                    case 404:
                        setMessage({ text: "Recurso no encontrado. Por favor, intenta de nuevo.", type: "error" });
                        break;
                    case 500:
                        setMessage({ text: "Error interno del servidor. Por favor, intenta más tarde.", type: "error" });
                        break;
                    default:
                        setMessage({ text: data.message || "Error al enviar el correo de recuperación de contraseña", type: "error" });
                }
            }
        } catch (error) {
            // Error para debuggear que me permite ver en la consola si ocurrio un error.
            console.error("Error al enviar el correo de recuperación de contraseña:", error);
            // Mensaje de error para el usuario mostrado en el modal.
            setMessage({ text: "Error de conexión con el servidor", type: "error" });
        }
    }

    /**
     * Maneja el cambio de valor en los campos del formulario de login y registro,
     * ejemplo: si el usuario escribe en el campo de usuario, se actualiza el
     * estado del formulario con el nuevo valor.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Si el usuario está autenticado (ha iniciado sesión), se muestra el nombre de usuario y un
     * menú con la opción de cerrar sesión.
     */
    if (isLoggedIn) {
        return (
            <div className={styles.usernameContainer} onClick={() => setShowUserMenu(!showUserMenu)}>
                <img
                    src="/keyboard_arrow_down.svg"
                    alt="Menú"
                    className={styles.arrowDown}
                    style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none' }}
                />
                <span className={`${styles.usernameText} ${showUserMenu ? styles.usernameTextActive : ''}`}>{userLogin}</span>
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

    /**
     * Todo el código que se encuentra dentro de este return es el que se encarga de mostrar
     * el modal de login y registro cuando el usuario no está autenticado (no ha iniciado sesión),
     * ocurre cuando el "if" anterior a este bloque de comentarios es false.
     */
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

                    {/**
                     * Titulo del modal que varía dependiendo del modalType (tipo de modal elegido).
                     */}
                    <h2 className={styles.modalTitle}>
                        {modalType === 'login' ? 'Iniciar Sesión' :
                            modalType === 'register' ? 'Registrarse' :
                                'Recuperar contraseña'}
                    </h2>

                    <form onSubmit={
                        /**
                         * Ejecutar la función correspondiente al modalType elegido.	
                         */
                        modalType === 'login' ? handleLogin :
                            modalType === 'register' ? handleRegister :
                                handleRecoverPassword}
                        className={styles.formContainer}>
                        <div>
                            <label htmlFor="username" className={styles.formLabel}>
                                {"Usuario"}
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className={styles.formInput}
                                placeholder={"Tu usuario"}
                            />
                        </div>
                        
                        {modalType === 'register' && (
                            <div>
                                <label htmlFor="mail" className={styles.formLabel}>
                                    {"Correo electrónico"}
                                </label>
                                <input
                                    type="email"
                                    id="mail"
                                    name="mail"
                                    value={formData.mail}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.formInput}
                                    placeholder={"tu@email.com"}
                                />
                            </div>
                        )}
                        
                        {/**
                         * Si el modalType no es "recoverPassword", se muestran los campos de
                         * contraseña y confirmar contraseña.
                         */}
                        {modalType !== 'recover' && (
                            <>
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
                        {modalType === 'register' && (
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
                            </>
                        )}

                        {message.text && (
                            <p className={message.type === "error" ? styles.errorMessage : styles.successMessage}>
                                {message.text}
                            </p>
                        )}

                        <button type="submit" className={styles.submitButton}>
                            {modalType === 'login' ? 'Iniciar Sesión' :
                                modalType === 'register' ? 'Registrarse' :
                                    'Enviar correo de recuperación'}
                        </button>

                        {/**
                         * Si el modalType es "login", se muestran los botones de switchAuth para
                         * cambiar al modal de registro y de recuperación de contraseña.
                         */}
                        {modalType === 'login' && (
                            <>
                                <div className={styles.switchAuth}>
                                    ¿No tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalType('register');
                                            clearMessage();
                                            setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
                                        }}
                                        className={styles.switchAuthButton}
                                    >
                                        Regístrate
                                    </button>
                                </div>
                                <div className={styles.switchAuth}>
                                    ¿Olvidaste tu contraseña?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalType('recover');
                                            clearMessage();
                                            setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
                                        }}
                                        className={styles.switchAuthButton}
                                    >
                                        Recuperar contraseña
                                    </button>
                                </div>
                            </>
                        )}

                        {/**
                         * Si el modalType es "register", se muestran los botones de switchAuth para
                         * cambiar al modal de login.
                         */}
                        {modalType === 'register' && (
                            <div className={styles.switchAuth}>
                                ¿Ya tienes cuenta?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalType('login');
                                        clearMessage();
                                        setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
                                    }}
                                    className={styles.switchAuthButton}
                                >
                                    Inicia sesión
                                </button>
                            </div>
                        )}

                        {/**
                         * Si el modalType es "recover", se muestran los botones de switchAuth para
                         * cambiar al modal de login y de registro.
                         */}
                        {modalType === 'recover' && (
                            <>
                                <div className={styles.switchAuth}>
                                    ¿Ya tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalType('login');
                                            clearMessage();
                                            setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
                                        }}
                                        className={styles.switchAuthButton}
                                    >
                                        Iniciar sesión
                                    </button>
                                </div>
                                <div className={styles.switchAuth}>
                                    ¿No tienes cuenta?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalType('register');
                                            clearMessage();
                                            setFormData({ username: '', mail: '', password: '', confirmPassword: '' });
                                        }}
                                        className={styles.switchAuthButton}
                                    >
                                        Registrarse
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </dialog>
        </>
    );
}