const url = 'http://127.0.0.1:8000/api';

/*
 * Petición DELETE para eliminar un socio.
 * @returns {Promise<Array>}
 * */

export async function fetchEliminarMantenimiento(id,token) {
    try {
        const response = await fetch(`${url}/mantenimientos/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-type': 'application/json;',
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
