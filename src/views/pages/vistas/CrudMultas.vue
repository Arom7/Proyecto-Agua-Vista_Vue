<script setup>
import { fetchListaMultas, fetchListaSocios, fetchListaPropiedades, fetchGuardarMulta, fetchRegistrarMulta, fetchActualizacionMulta, fetchListaMultasActivas } from '@/service/peticionesApi';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, watch, ref } from 'vue';

const token = localStorage.getItem('authToken');
const multas = ref();
const multa = ref({
    criterio_infraccion: '',
    descripcion_infraccion: '',
    monto_infraccion: null
});
const socio = ref({});
const propiedad = ref({});
const modalRegistroMultaSocio = ref(false);
const modalRegistroMulta = ref(false);
const actualizacionMulta = ref(false);
const sociosListaBox = ref([]);
const multasListaBox = ref([]);
const propiedadesValues = ref([]);
const selectedSocio = ref(null);
const selectedMulta = ref(null);
const modalEliminacionMulta = ref(false);
let idMulta;
const loading = ref(false);
const toast = useToast();
const dt = ref();

const deleteProductsDialog = ref(false);
const product = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'BOB' });
    return;
}

function eliminarMulta(datos) {
    console.log(datos);
    multa.value = datos;
    console.log(multa.value);
    modalEliminacionMulta.value = true;
}

function deleteMulta() {
    //Aun falta desarrollar el backend para eliminar una multa
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

function getEstadoLabel(status) {
    switch (status) {
        case 1:
            return 'success';

        case 0:
            return 'danger';

        default:
            return null;
    }
}

//Funciones para la carga de datos de multas
const loadMultas = async () => {
    const listaMultas = await fetchListaMultas(token);
    if (listaMultas) {
        multas.value = listaMultas;
    } else {
        console.error('No se pudo obtener la lista de multas.');
    }
};

onBeforeMount(loadMultas);

watch(socio, (newSocio) => {
    if (newSocio) {
        listaPropiedades(newSocio.code);
    }
});

/**
 * Funciones metodos post (registro de tipos de multas)
 */
//apertura del modal
function registrarNuevaMulta() {
    submitted.value = false;
    multa.value = {};
    actualizacionMulta.value = false;
    modalRegistroMulta.value = true;
}

//cerrado del modal
function hideDialog() {
    modalRegistroMulta.value = false;
    submitted.value = false;
}

function cerrarModal() {
    modalRegistroMultaSocio.value = false;
    submitted.value = false;
    socio.value = null;
    multa.value = null;
}

function registrarMultaSocio() {
    socio.value = null;
    multa.value = null;
    propiedad.value = {};
    asignarSocios();
    asignarMultas();
    modalRegistroMultaSocio.value = true;
}

function validarValoresMulta() {
    const errores = [];
    const reglasTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,\-]+([ ]+[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,\-]+)*$/;
    if (!multa.value.criterio_infraccion) {
        errores.push('La infraccion no puede ser nula.');
    } else if (!reglasTexto.test(multa.value.criterio_infraccion)) {
        errores.push('Solo se aceptan caracteres alfanumericos en el titulo de la infraccion.');
    }
    if (!multa.value.descripcion_infraccion) {
        errores.push('La descripcion de la infraccion es requerido.');
    } else if (!reglasTexto.test(multa.value.descripcion_infraccion)) {
        errores.push('Solo se aceptan caracteres alfanumericos en la descripcion.');
    }
    if (!multa.value.monto_infraccion) {
        errores.push('El monto de la infraccion es obligatorio.');
    }
    return errores;
}

async function listaPropiedades(id_socio) {
    const listaPropiedades = await fetchListaPropiedades(id_socio, token);
    if (listaPropiedades) {
        propiedadesValues.value = listaPropiedades.map((item) => ({
            name: item.descripcion_propiedad,
            code: item.id
        }));
    } else {
        console.error('No se pudo obtener la lista de propiedades.');
    }
}

async function asignarSocios() {
    const listaSocios = await fetchListaSocios(token);
    if (listaSocios) {
        sociosListaBox.value = listaSocios.map((item) => ({
            name: item.nombre_socio + ' ' + item.primer_apellido_socio + ' ' + item.segundo_apellido_socio,
            code: item.id
        }));
    } else {
        console.error('No se pudo obtener la lista de socios.');
    }
}

async function asignarMultas() {
    const listaMultas = await fetchListaMultasActivas(token);
    if (listaMultas) {
        multasListaBox.value = listaMultas.map((item) => ({
            criterio_infraccion: item.criterio_infraccion,
            code: item.id
        }));
    } else {
        console.error('No se pudo obtener la lista de socios.');
    }
}

//Metodo post para registrar la multa
async function registrarMulta() {
    const errores = validarValoresMulta();
    if (errores.length > 0) {
        toast.add({ severity: 'error', summary: 'Error en la validacion, campos requeridos', detail: errores.join(' '), life: 7000 });
        return;
    }
    try {
        submitted.value = true;
        multa.value.id = null;
        if (actualizacionMulta.value) {
            await actualizarMulta();
            return;
        }
        const response = await fetchRegistrarMulta(multa.value, token);
        console.log(response);
        if (response.status != 200) {
            throw new Error(`Error en la solicitud mensaje.`);
        }
        toast.add({ severity: 'success', summary: 'Multa registrada', detail: 'La multa se registro correctamente', life: 3000 });
        hideDialog();
        loadMultas();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Ups, sucedio un error a la hora de registrar la multa', detail: error.message, life: 3000 });
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    } finally {
        submitted.value = false;
        multa.value = null;
    }
}

function actualizarEstadoMulta(data) {
    multa.value = data;
    multa.value.estado_activo = !multa.value.estado_activo;
    idMulta = multa.value.id;
    console.log(multa.value);
    actualizarMulta();
}

/**
 * Funciones metodo put/patch para multas
 */

//Apertura de modal de edicion
function editarMulta(data) {
    multa.value = { ...data };
    idMulta = multa.value.id;
    modalRegistroMulta.value = true;
    actualizacionMulta.value = true;
}

//Metodo put para actualizar una multa
async function actualizarMulta() {
    const errores = validarValoresMulta();
    if (errores.length > 0) {
        toast.add({ severity: 'error', summary: 'Error en la validacion, campos requeridos', detail: errores.join(' '), life: 7000 });
        return;
    }
    try {
        submitted.value = true;
        const response = await fetchActualizacionMulta(idMulta, multa.value, token);
        if (response.status != 200) {
            throw new Error(`Error en la solicitud, mensaje: ${response.message}`);
        }
        console.log(response);
        hideDialog();
        loadMultas();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

/**
 * Funcion para agregar una multa a una propiedad de un socio
 */
async function registrarMultaPropiedadSocio() {
    if (loading.value) return;
    loading.value = true;

    try {
        console.log(socio.value);
        submitted.value = true;
        if (!socio.value || !multa.value || !propiedad.value) {
            throw new Error('Los campos son requeridos.');
        }
        const data = {
            id_multa: multa.value.code,
            id_propiedad: propiedad.value.code
        };
        const respuesta = await fetchGuardarMulta(data, token);
        console.log(respuesta.value);
        if (!respuesta.status || respuesta == null) {
            throw new Error('Error al intentar registrar la multa al propietario');
        }
        toast.add({ severity: 'success', summary: 'Multa registrada', detail: 'La multa fue registrada a la propiedad con exito', life: 3000 });
        cerrarModal();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Ups!, no se pudo realizar el registro.', detail: error.message, life: 5000 });
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    } finally {
        submitted.value = false;
        loading.value = false;
    }
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar nueva multa" icon="pi pi-plus" severity="secondary" class="mr-2" @click="registrarNuevaMulta" />
                    <Button label="Agregar multa a una propiedad" icon="pi pi-plus" severity="secondary" class="mr-2" @click="registrarMultaSocio"></Button>
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="multas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Visualizacion: Rango [{first} - {last}] del total de {totalRecords} multas"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Lista de multas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>
                <Column field="id" header="Id de la multa" sortable style="min-width: 10rem"></Column>
                <Column field="criterio_infraccion" header="Infraccion" sortable style="min-width: 10em"></Column>
                <Column field="descripcion_infraccion" header="Descripcion" sortable style="min-width: 16em"></Column>
                <Column field="monto_infraccion" header="Monto" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.monto_infraccion) }}
                    </template>
                </Column>
                <Column field="inventoryStatus" header="Estado" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado_activo == 1 ? 'Activo' : 'Inactivo'" :severity="getEstadoLabel(slotProps.data.estado_activo)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-power-off" severity="info" outlined rounded @click="actualizarEstadoMulta(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mx-2" @click="editarMulta(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="modalRegistroMulta" :style="{ width: '450px' }" header="Registrar multa" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="criterio_infraccion" class="block font-bold mb-3">Infraccion : </label>
                    <InputText id="criterio_infraccion" v-model.trim="multa.criterio_infraccion" required="true" autofocus fluid placeholder="Se aceptan valores alfanumericos y algunos signos." />
                    <small v-if="submitted && !multa.criterio_infraccion" class="text-red-500">Este campos es requerido.</small>
                </div>
                <div>
                    <label for="description_infraccion" class="block font-bold mb-3">Description de la infraccion : </label>
                    <Textarea id="descripcion_infraccion" v-model.trim="multa.descripcion_infraccion" required="true" rows="2" cols="20" fluid placeholder="Se aceptan valores alfanumericos y algunos signos." />
                    <small v-if="submitted && !multa.descripcion_infraccion" class="text-red-500">La descripcion de la multa es requerida.</small>
                </div>
                <div class="col-span-6">
                    <label for="monto_infraccion" class="block font-bold mb-3">Monto total de pago : </label>
                    <InputNumber id="monto_infraccion" v-model.trim="multa.monto_infraccion" placeholder="Solo se aceptan valores numericos." fluid />
                    <small v-if="submitted && !multa.monto_infraccion" class="text-red-500">El El monto es requerida.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="registrarMulta" :disabled="!multa.criterio_infraccion || !multa.descripcion_infraccion" />
            </template>
        </Dialog>

        <Dialog v-model:visible="modalRegistroMultaSocio" :style="{ width: '450px' }" header="Asignar una multa a un propietario" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="criterio_infraccion" class="block font-bold mb-3">Lista de socios : </label>
                    <Select v-model="socio" :options="sociosListaBox" filter optionLabel="name" placeholder="Selecciona el nombre del socio" class="w-full" :invalid="socio === null" fluid>
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <div>{{ slotProps.value.name }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Select>
                    <small v-if="submitted && !socio.id" class="text-red-500">El socio es requerido.</small>
                </div>
                <div>
                    <label for="description_infraccion" class="block font-bold mb-3">Lista de infracciones : </label>
                    <Select v-model="multa" :options="multasListaBox" filter optionLabel="criterio_infraccion" placeholder="Selecciona la infraccion." class="w-full" :invalid="multa === null" fluid>
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <div>{{ slotProps.value.criterio_infraccion }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.criterio_infraccion }}</div>
                            </div>
                        </template>
                    </Select>
                    <small v-if="submitted && !multa.descripcion_infraccion" class="text-red-500">La infraccion es requerida.</small>
                </div>
                <div>
                    <label for="description_infraccion" class="block font-bold mb-3">Codigo de propiedad : </label>
                    <Select v-model="propiedad" :options="propiedadesValues" optionLabel="code" placeholder="Select" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarModal" />
                <Button label="Guardar" icon="pi pi-check" @click="registrarMultaPropiedadSocio" :disabled="loading" />
            </template>
        </Dialog>

        <Dialog v-model:visible="modalEliminacionMulta" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="multa"
                    >Seguro que quieres eliminar la siguiente multa: <b>{{ multa.criterio_infraccion }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="modalEliminacionMulta = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteMulta" />
            </template>
        </Dialog>
    </div>
</template>
