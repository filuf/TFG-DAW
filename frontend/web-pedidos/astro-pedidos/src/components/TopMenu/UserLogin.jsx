import "./userLoginStyle.css"
import { useEffect, useRef, useState } from "react";


export default function UserLogin( {apiAuthUrl} ) {
    const [userLogin, setUserLogin] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const modalRef = useRef(null);

    // renderiza el username si ya existe junto al token en el sesion storage
    useEffect( () => {
        const userStored = sessionStorage.getItem("username");

        if (userStored && sessionStorage.getItem("token")) {
            setUserLogin(userStored);
        }
    }, []);


    // fetch al hacer submit en el formulario de login
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(apiAuthUrl + "/auth/login", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({username, password})
            });

            if (res.ok) {
                const data = await res.json();
                setUserLogin(data.username);
                setShowModal(false);

                //almacena el usuario y token en sessionStorage
                sessionStorage.setItem("username", data.username);
                sessionStorage.setItem("token", data.token);
                
            } else if (res.status == 403) {
                setErrorMessage("No existe un usuario con estas credenciales");
            }
        } catch (error) {
            console.error("Error en el login", error);
            setErrorMessage("Ha ocurrido un error de conexión");
        }
    }

    useEffect(() => {
        if (showModal && modalRef.current) {
          modalRef.current.showModal();
        }
      }, [showModal]);
    
    //apertura en caso de que no exista usuario
    const handleClick = () => {
        if(!userLogin) {
            setShowModal(true);
        } else {
            console.log("usuario ya logado");
        }
    }

    //cierre por botón
    const closeModal = () => {
        setShowModal(false);
        modalRef.current?.close();
    }

    return(
        <>
            {!userLogin ? (
                <button onClick={handleClick} className="login-button">
                    inicia sesión
                </button>
            ) : (
                <div className="username-container">
                    <p className="username-text">{userLogin}</p>
                    <img className="arrow-down-svg" src="/keyboard_arrow_down.svg" alt="arrow-down-svg" />
                </div>
            )}

            {/* Modal de Login*/}
            {showModal && (
                <dialog ref={modalRef}>
                    <div className="login-container">

                        <div className="close-button-container">
                            <button className="close-button" onClick={closeModal}>
                                <img src="/close.png" alt="botón cierre" className="close-button-image" />
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="login-form-container">
                            <p className="login-text">Inicia Sesión</p>

                                <label htmlFor="username" className="login-label">usuario</label>
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    className="login-input"
                                    onChange={ (e) => setUsername(e.target.value)}
                                /><br/>

                                <label htmlFor="password" className="login-label">contraseña</label>
                                <input
                                    type="password"
                                    name="password" 
                                    id="password"
                                    className="login-input"
                                    onChange={ (e) => setPassword(e.target.value)}
                                /><br/>

                                <input type="submit" value="ENVIAR" className="login-submit"/>

                        </form>
                        <a href="/forgotPassword">¿Olvidaste la contraseña?</a>

                        <div className="error-container">
                            <p className="error-message">{errorMessage}</p>
                        </div>
                        <div className="register">
                            <p>¿Todavía no tienes cuenta?</p>
                            <a href="/example">Regístrate</a>
                        </div>

                    </div>

                </dialog>
                )
                
            }
        </>
    );
}