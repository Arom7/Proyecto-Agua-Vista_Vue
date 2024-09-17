const url = 'http://127.0.0.1:8000/api';

export async function fetchListaSocios() {
    try {
        const response = await fetch(`${url}/propiedades/socios`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.socios;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar iniciar sesión. Inténtalo de nuevo.';
        return [];
    }
}

export async function fetchListaRecibos() {
    try {
        const response = await fetch(`${url}/recibos`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        const data = await response.json();
        return data.recibos;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
    }
}
