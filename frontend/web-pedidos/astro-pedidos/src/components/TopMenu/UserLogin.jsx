import "./userLoginStyle.css"
import { useEffect, useRef, useState } from "react";
import LoginModal from "./LoginModal";
import SidebarMenu from "./SidebarMenu";


export default function UserLogin( {apiAuthUrl} ) {
    const [userLogin, setUserLogin] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);
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
        }
    }

    //cierre por botón
    const closeModal = () => {
        setShowModal(false);
        modalRef.current?.close();
    }

    // alternar el estado del sidebar
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    }

    return(
        <>
            {!userLogin ? (
                <button onClick={handleClick} className="login-button">
                    inicia sesión
                </button>
            ) : (
                <div className="username-container" onClick={toggleSidebar}>
                    <p className="username-text">{userLogin}</p>
                    <img className="arrow-down-svg" src="/keyboard_arrow_down.svg" alt="arrow-down-svg" />
                </div>
            )}

            {showModal && (
                <LoginModal
                    onClose={closeModal}
                    onSubmit={handleLogin}
                    errorMessage={errorMessage}
                    setUsername={setUsername}
                    setPassword={setPassword}
                />
            )}

            {/* Sidebar (menú lateral) */}
            {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}

        </>
    );
}