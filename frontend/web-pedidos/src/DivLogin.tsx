import { useEffect, useRef, useState } from "react"

const urlAuth = import.meta.env.VITE_URL_SPRING_AUTH;

interface AuthResponse {
  username: string;
  authorities: string[];
  token: string;
}

export default function DivLogin({setIsLoged}: {setIsLoged: (isLoged: boolean) => void}) {

    const modalRef = useRef<HTMLDialogElement>(null);

    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState("");

    const handleComplete = () => {
        modalRef.current?.close();
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await fetch(`${urlAuth}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
                password: pass,
            })
        })
        .then(response => {
            if (!response.ok) {
                setError('Usuario o contraseña incorrectos');
            } else {
                response.json().then((data: AuthResponse) => {
                    if (!data.authorities.includes('ADMIN')) { // Verifica si el usuario tiene el rol de ADMIN
                        setError('No tienes permisos para acceder a esta aplicación');
                        return;
                    }

                    sessionStorage.setItem('token', data.token);
                    setIsLoged(true);
                    handleComplete();
                })
            }
        })
    };

    useEffect(() => {
        modalRef.current?.showModal();
    }, []);

    return (
        <dialog 
            ref={modalRef} 
            className="confirm-dialog"
            aria-labelledby="dialog-title"
        >
            <form method="dialog" className="dialog-actions" onSubmit={handleLogin}>
                <input
                    type="text"
                    name="user"
                    value={user}
                    onChange={e => setUser(e.target.value)}
                    placeholder="Usuario"
                />
                <input
                    type="password"
                    name="pass"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="Contraseña"
                />
                <button 
                    type="button"
                    className="concluir" 
                    onClick={handleLogin}
                    aria-label="Confirmar conclusión del pedido"
                >
                    Log in
                </button>
            </form>
            { error.length != 0 && 
                <p>{error}</p>
            }
        </dialog>
    )
}