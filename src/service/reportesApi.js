const url = 'http://127.0.0.1:8000/api';

export async function fetchListaSociosDeudas(fechaInicio, fechaFin, evento, token) {
    try {
        const response = await fetch(`${url}/socio/deudas/pagos/${fechaInicio}/${fechaFin}/0/${evento}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        console.log(contentType.includes('application/json'));
        if (contentType.includes('application/json')) {
            const data = await response.json();
            return data.socios;;
        }
        else if (contentType.includes('application/pdf')) {
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `reporte-deudas-${fechaInicio}-${fechaFin}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } else {
            throw new Error('Tipo de contenido no soportado');
        }
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar iniciar sesión. Inténtalo de nuevo.';
        return [];
    }
}

export async function fetchListaSociosPagos(fechaInicio, fechaFin,evento,token) {
    try {
        const response = await fetch(`${url}/socio/deudas/pagos/${fechaInicio}/${fechaFin}/1/${evento}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        console.log(contentType.includes('application/pdf'));
        if (contentType.includes('application/json')) {
            const data = await response.json();
            return data.socios;;
        }
        else if (contentType.includes('application/pdf')) {
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `reporte-pagos-${fechaInicio}-${fechaFin}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } else {
            throw new Error('Tipo de contenido no soportado');
        }
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('roles');
        return await response.json();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar cerrar sesión. Inténtalo de nuevo.';
    }
}
