import {useRef, useEffect} from "react"

export default function LoginModal({
    onClose,
    onSubmit,
    errorMessage,
    setUsername,
    setPassword
})  {
    const modalRef = useRef(null);
  
    useEffect(() => {
      if (modalRef.current) {
        modalRef.current.showModal();
      }
    }, []);
  
    return (
        <dialog ref={modalRef}>
            <div className="login-container">
                <div className="close-button-container">
                    <button className="close-button" onClick={onClose}>
                        <img src="/close.png" alt="botón cierre" className="close-button-image" />
                    </button>
                </div>
    
                <form onSubmit={onSubmit} className="login-form-container">
                    <p className="login-text">Inicia Sesión</p>
    
                    <label htmlFor="username" className="login-label">usuario</label>
                    <input
                    type="text"
                    name="username"
                    id="username"
                    className="login-input"
                    onChange={(e) => setUsername(e.target.value)}
                    /><br />
    
                    <label htmlFor="password" className="login-label">contraseña</label>
                    <input
                    type="password"
                    name="password"
                    id="password"
                    className="login-input"
                    onChange={(e) => setPassword(e.target.value)}
                    /><br />
        
                    <input type="submit" value="ENVIAR" className="login-submit" />
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
    );
  }