const token = localStorage.getItem('token');
const url = 'http://127.0.0.1:8000/api';

/**
 * Peticion GET para obtener la lista de socios con sus respectivas propiedades.
 * @returns {Promise<Array>}
 */
export async function fetchListaSociosPropiedadesUsuarios(token) {
    try {
        const response = await fetch(`${url}/propiedades/socios`, {
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

/**
 *  Petición GET para obtener lista de socios.
 *  @returns {Promise<Array>}
 */

export async function fetchListaSocios(token) {
    try {
        const response = await fetch(`${url}/socios`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.lista_socios;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}

/**
 * Petición GET para obtener la lista de recibos.
 * @returns {Promise<Array>}
 */

export async function fetchListaRecibos(token) {
    try {
        const response = await fetch(`${url}/recibos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        const data = await response.json();
        return data.recibos;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
    }
}

/**
 * Petición GET para obtener la lista de multas.
 * @returns {Promise<Array>}
 */

export async function fetchListaMultas(token) {
    try {
        const response = await fetch(`${url}/multas`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.multas;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}

/**
 * Petición GET para obtener la lista de propiedades de un socio.
 * @returns {Promise<Array>}
 */
export async function fetchListaPropiedades(socioId ,token) {
    try {
        const response = await fetch(`${url}/propiedades/socio/${socioId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.propiedades;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}

/**
 * Petición POST para almacenar una multa a un socio.
 * @returns {Promise<Array>}
 */

export async function fetchGuardarMulta(datos , token) {
    try {
        const data = {
            propiedad_id: datos.id_propiedad,
            infracion_id: datos.id_multa
        };

        const response = await fetch(`${url}/propietario/multa`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: `Bearer ${token}`,
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

/**
 * Petición POST para registrar una nueva multa.
 * @returns {Promise<Array>}
 */

export async function fetchRegistrarMulta(data , token) {
    try {
        const response = await fetch(`${url}/multas`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: `Bearer ${token}`,
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

/**
 * Petición PUT para actualizar una multa.
 * @returns {Promise<Array>}
 */

export async function fetchActualizacionMulta(idMulta, multa , token) {
    try {
        const response = await fetch(`${url}/multas/${idMulta}`, {
            method: 'PUT',
            body: JSON.stringify(multa),
            headers: {
                Authorization: `Bearer ${token}`,
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
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

export async function fetchBusquedaPropiedadSocio(id_medidor ,token) {
    try {
        const response = await fetch(`${url}/busqueda-medidor/propiedades/${id_medidor}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.medidor.propiedad;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

export async function fetchListaMantenimientos(token) {
    try {
        const response = await fetch(`${url}/lista/mantenimientos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.mantenimientos;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

export async function fetchRecibosEndeudados(id , token) {
    try {
        const response = await fetch(`${url}/endeudados/recibos/${id.codigo_propiedad}`, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.consumos;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

export async function fetchSolicitudCantidadSocios(token) {
    try {
        const response = await fetch(`${url}/cantidad/socios`, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.cantidadSocios;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

export async function fetchSolicitudCantidadPropiedades(token) {
    try {
        const response = await fetch(`${url}/cantidad/propiedades`, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.cantidadPropiedades;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

export async function fetchSolicitudCantidadPreAvisosPagados(token) {
    try {
        const response = await fetch(`${url}/cantidad/recibos/pagados`, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.cantidadRecibosPagados;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

export async function fetchSolicitudCantidadPreAvisosEndeudados(token) {
    try {
        const response = await fetch(`${url}/cantidad/recibos/pendientes`, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.cantidadRecibosPendientes;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}
