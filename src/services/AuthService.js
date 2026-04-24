export default class AuthService {
    async login(email, password) {
        const res = await fetch('https://staydesk-apis.duckdns.org/iniciar_sesion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                contrasena: password
            })
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data?.detail || 'Credenciales incorrectas')
        }

        if (data.token) {
            localStorage.setItem('token', data.token)
        }

        return data
    }

    async obtenerUsuarios() {
        const token = localStorage.getItem('token')
        const res = await fetch('https://staydesk-apis.duckdns.org/listar_usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await res.json()

        if (!res.ok) throw new Error('Error obteniendo usuarios')

        return data
    }
}