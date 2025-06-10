import { useEffect, useRef, useState } from "react";
import "./recoveryForm.css";

export default function RecoveryForm({apiAuthUrl}) { 

    const passwordValue = useRef("")
    const confirmPasswordValue = useRef("")
    const [token, setToken] = useState("")

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    

    useEffect(() => {
        const recoveryToken = new URLSearchParams(window.location.search).get("recoveryToken");
        setToken(recoveryToken); // token no se actualiza hasta salir del useEffect por eso se usa una constante
        if (!recoveryToken) {
            console.error("No recovery token found in the URL.");
            window.location.href = "/";
        }

    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null); // Reset error

        const password = passwordValue.current.value.trim();
        const confirmPassword = confirmPasswordValue.current.value.trim();

        console.log(password, confirmPassword);
        
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        const response = await fetch(apiAuthUrl + "/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                jwtRecoveryToken: token,
                newPassword: password,
                confirmNewPassword: confirmPassword,
            })
        })

        if (!response.ok) {
            setError("Este token de recuperación no es válido o ha expirado. por favor, solicita un nuevo cambio de contraseña.");
            return;
        }

        const data = await response.text();
        setSuccess(data); // la contraseña del usuario $user se ha actualizado correctamente.
        redirectToMainPageIn5Seconds();
    }

    const redirectToMainPageIn5Seconds = () => {
        setTimeout(() => {
            window.location.href = "/";
        }, 5000);
    }

    return (
        <form className="recovery-form" onSubmit={handleSubmit}>
            <div className="recovery-container">
                <label htmlFor="password">Contraseña</label>
                <input
                    ref={passwordValue}
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    minLength="12"
                    required
                />
            </div>

            <div className="recovery-container">
                <label htmlFor="confirm-password">Confirmar Contraseña</label>
                <input
                    ref={confirmPasswordValue}
                    type="password"
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="••••••••"
                    minLength="12"
                    required
                />
            </div>
            <div className="recovery-container">
                <button type="submit" className="recovery-button">
                    ENVIAR
                </button>
            </div>

            {error && 
                <div className="error-message">{error}</div>
            }
            {success && 
                <div className="success-message">
                    <p>{success}</p>
                    <p>Serás redirigido a la página principal en 5 segundos.</p>
                    <p>Si no es así, puedes hacer clic <a href="/">aquí</a>.</p>
                </div>
            }
        </form>
    )
}