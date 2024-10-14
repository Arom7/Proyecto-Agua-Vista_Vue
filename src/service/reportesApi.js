
const token = localStorage.getItem('token');

const url = 'http://127.0.0.1:8000/api';

export async function fetchListaSociosDeudas(fechaInicio, fechaFin) {
    try {
        const response = await fetch(`${url}/socio/deudas/pagos/${fechaInicio}/${fechaFin}/0`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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

export async function fetchListaSociosPagos(fechaInicio, fechaFin) {
    try {
        const response = await fetch(`${url}/socio/deudas/pagos/${fechaInicio}/${fechaFin}/1`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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
export async function fetchLogout(token) {
    try {
        const response = await fetch(`${url}/logout`, {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${token}`,
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        localStorage.removeItem('token');
        return await response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar cerrar sesión. Inténtalo de nuevo.';
    }
}
