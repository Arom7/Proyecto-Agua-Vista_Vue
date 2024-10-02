const url = 'http://127.0.0.1:8000/api';

export async function fetchActualizarRecibo(id,data) {
    try{
        const response = await fetch(`${url}/actualizar-recibo/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
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
