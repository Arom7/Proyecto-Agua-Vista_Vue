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
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText} mensaje: ${problema.message}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}
