const url = 'http://127.0.0.1:8000/api';

/**
 * Petición POST para registrar un nuevo socio.
 * @returns {Promise<Array>}
 */
export async function fetchRegistrarNuevoSocio(data,token) {
    try {
        console.log(data);
        console.log(token);
        const response = await fetch(`${url}/registro/socio`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-type': 'application/json;',
            }
        });
        console.log(response);
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
        console.log(data);
        const response = await fetch(`${url}/login/socio`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;'
            },
            redirect: 'manual'
        });
        if (response.type === 'opaqueredirect') {
            throw new Error('La solicitud fue redirigida. Verifica la configuración del servidor.');
        }

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

export async function fetchRegistrarNuevoRecibo(data,token) {
    try {
        console.log(data);
        const response = await fetch(`${url}/recibos`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;',
                Authorization: `Bearer ${token}`
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

export async function fetchReseteoEmail(data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${url}/reseteo/email`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;'
            },
            signal: controller.signal,
            redirect: 'manual'
        });

        clearTimeout(timeoutId);

        if (response.type === 'opaqueredirect') {
            throw new Error('La solicitud fue redirigida. Verifica la configuración del servidor.');
        }

        if (!response.ok) {
            const problema = await response.json();
            throw new Error(`${problema.message}`);
        }
        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('La solicitud fue abortada debido a un tiempo de espera.');
        } else {
            console.error('Se produjo un error:', error.message);
        }
        throw error;
    }
}

export async function fetchReseteoPassword(data) {
    try {
        const response = await fetch(`${url}/reseteo`, {
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
