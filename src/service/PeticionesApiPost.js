const url = 'http://127.0.0.1:8000/api';

/**
 * Petición POST para registrar un nuevo socio.
 * @returns {Promise<Array>}
 */
export async function fetchRegistrarNuevoSocio(data) {
    try {
        const response = await fetch(`${url}/registrar-socios`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            const problema = await response.json();
            throw new Error(`${problema.message}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}

export async function fetchAccesoSocios(data) {
    try {
        const response = await fetch(`${url}/login`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        console.log(response);
        return response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}

export async function fetchRegistrarNuevoRecibo(data) {
    try {
        const response = await fetch(`${url}/recibos`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            const problema = await response.json();
            throw new Error(`${problema.message}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}

export async function fetchRegistrarNuevaPropiedad(data, token) {
    try {
        const response = await fetch(`${url}/registro-propiedades`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            const problema = await response.json();
            throw new Error(`${problema.message}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}

export async function fetchRegistrarNuevoMantenimiento(data, token) {
    try {
        const response = await fetch(`${url}/mantenimientos`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            const problema = await response.json();
            throw new Error(`${problema.message}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}
