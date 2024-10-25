const url = 'http://127.0.0.1:8000/api';

export async function fetchActualizarRecibo(id,data ,token) {
    try{
        const response = await fetch(`${url}/actualizar-recibo/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;',
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }catch(error){
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}

export async function fetchActualizarMantenimiento(id,data,token) {
    try{
        const response = await fetch(`${url}/mantenimientos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }catch(error){
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}

export async function fetchActualizarEstadoRecibo(id ,token) {
    try{
        const response = await fetch(`${url}/recibo/estado/pago/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }catch(error){
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}

export async function fetchRegistrarCambioPropiedad(data,token){
    try{
        let datos = {
            nuevo_propietario_id : data.socio_compra
        }
        let id_propiedad = data.propiedad;
        console.log(datos);
        console.log(id_propiedad);

        const response = await fetch(`${url}/actualizar/propietario/${id_propiedad}`, {
            method: 'PATCH',
            body: JSON.stringify(datos),
            headers: {
                'Content-type': 'application/json;',
                //Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        console.log(response);
        return await response.json();

    }catch(error){
        console.error('Se produjo un error:', error.message);
        throw error;
    }
}
