const url = 'http://127.0.0.1:8000/api';

export async function fetchListaSociosDeudas(fechaInicio, fechaFin) {
    try {
        const response = await fetch(`${url}/socio/deudas/pagos/${fechaInicio}/${fechaFin}/0`);
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
        const response = await fetch(`${url}/socio/deudas/pagos/${fechaInicio}/${fechaFin}/1`);
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
