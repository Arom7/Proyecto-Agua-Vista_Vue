<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onMounted, ref, watch,computed } from 'vue';
import { fetchListaRecibos, fetchListaSocios, fetchListaPropiedades, fetchBusquedaPropiedadSocio } from '@/service/peticionesApi';
import { fetchRegistrarNuevoRecibo } from '@/service/PeticionesApiPost';
import { fetchActualizarRecibo } from '@/service/PeticionesApiPut';

//variables reactivas

const toast = useToast();
const dt = ref();
const recibos = ref();
const calendarValue = ref(null);
const reciboDialog = ref(false);
const reciboUpdate = ref(false);
const switchValor = ref(false);

const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const recibo = ref({
    id_socio: null,
    observaciones: '',
    codigo_propiedad: '',
    lectura_actual: null
});

const sociosListaBox = ref([]);
const socio = ref(null);
const propiedadesValues = ref([]);
const recibosSeleccionados = ref();
const submitted = ref(false);
const id_medidor = ref(null);
const nombreSocio = ref('');
const propiedadSocio = ref({
    codigo_propiedad: null,
    nombre_socio: ''
});
const busquedaRealizada = ref(false);
let socioOriginal =  null;
let cambio = false;


const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

function deleteProduct() {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

function deleteSelectedProducts() {
    products.value = products.value.filter((val) => !recibosSeleccionados.value.includes(val));
    deleteProductsDialog.value = false;
    recibosSeleccionados.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
}

// Funcion para status recibo (pagado o endeudado)
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

// para generar PDF posteriomente
function exportCSV() {
    dt.value.exportCSV();
}
//Funcion que abre modal registro, el submitted es para validacion de datos
function openNew() {
    obtenerSocios();
    recibo.value = {};
    socio.value = null;
    submitted.value = false;
    reciboDialog.value = true;
}

//Funcion que abre modal de actualizacion
function editarRecibo(datos) {
    recibo.value = { ...datos };
    socio.value = { name: datos.nombre_completo, code: datos.id_socio };
    obtenerSocios();
    reciboUpdate.value = true;
}

// Funcion llamada para ocultar el modal
function hideDialog() {
    reciboDialog.value = false;
    submitted.value = false;
}

function cerrarActualizacion() {
    reciboUpdate.value = false;
}



watch(socio, (newSocio,oldSocio) => {
    if (newSocio) {
        codigoPropiedad(newSocio.code);
    }
    if (oldSocio && !socioOriginal) {
        socioOriginal = oldSocio;
    }
});

const socioHaCambiado = computed(() => socio.value !== socioOriginal);

/**
 * Peticiones a la API
 */

// Peticion Get para obtener la lista de recibos
const loadRecibos = async () => {
    const listaRecibos = await fetchListaRecibos();
    if (listaRecibos) {
        recibos.value = listaRecibos;
    } else {
        console.error('No se pudo obtener la lista de recibos.');
    }
};

onBeforeMount(loadRecibos);

// Peticion Post para guardar recibo
async function guardarRecibo() {
    try {
        submitted.value = true;
        if(!busquedaRealizada.value && !switchValor.value){
            recibo.value.id_socio = socio.value.code;
            recibo.value.codigo_propiedad = recibo.value.codigo_propiedad.codigo_propiedad;
        }
        const response = await fetchRegistrarNuevoRecibo(recibo.value);
        if (response.status === 200) {
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Recibo guardado correctamente.', life: 5000 });
            hideDialog();
            if (busquedaRealizada){
                busquedaRealizada.value = false;
            }
            await loadRecibos();
        } else {
            throw new Error('No se pudo guardar el recibo.');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Falla al registrar el recibo', detail: 'No se almaceno el recibo', life: 5000 });
    }
}

// Peticion Get para obtener la lista de socios
async function obtenerSocios() {
    try {
        const response = await fetchListaSocios();
        sociosListaBox.value = response.map((item) => ({
            name: item.nombre_socio + ' ' + item.primer_apellido_socio + ' ' + item.segundo_apellido_socio,
            code: item.id
        }));
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}

// Peticion Get para obtener la lista de propiedades de un socio
const codigoPropiedad = async (socioId) => {
    try {
        const response = await fetchListaPropiedades(socioId);
        if (response && response.length > 0) {
            propiedadesValues.value = response.map((propiedad) => ({
                codigo_propiedad: propiedad.id
            }));
        } else {
            propiedadesValues.value = null;
        }
    } catch (error) {
        console.error('Se produjo un error:', error.message);
    }
};

// funcion GET para buscar propiedad por medidor
async function busquedaPropiedadSocio() {
    try {
        busquedaRealizada.value = true;
        const response = await fetchBusquedaPropiedadSocio(id_medidor.value);
        if (recibo.value) {
            recibo.value = {
                id_socio: response.socio.id,
                codigo_propiedad: response.id
            };
        }
    } catch (error) {
        console.error('Se produjo un error:', error.message);
    }
}

//funcion PUT para actualizar recibo
async function actualizaRecibo(){
    try {
        cambio = false;
        let fechaFormateada = recibo.value.mes_correspondiente.toISOString().slice(0,10);
        recibo.value.mes_correspondiente = fechaFormateada;
        console.log(recibo.value);
        const response = await fetchActualizarRecibo(recibo.value.id,recibo.value);
        console.log(response);
        if (response.status === 200) {
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Recibo actualizado correctamente.', life: 5000 });
            cerrarActualizacion();
            await loadRecibos();
        } else {
            throw new Error('No se pudo actualizar el recibo.');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Falla al actualizar el recibo', detail: 'No se actualizo el recibo', life: 5000 });
    }
}
</script>
<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar nuevo recibo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Eliminar" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!recibosSeleccionados || !recibosSeleccionados.length" />
                </template>

                <template #end>
                    <Button label="Generar PDF" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="recibosSeleccionados"
                :value="recibos"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h3 class="m-0">Lista de recibos</h3>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="id" header="#Aviso" sortable style="min-width: 6rem"></Column>
                <Column field="codigo_propiedad" header="Codigo de Propiedad" sortable style="min-width: 10rem"></Column>
                <Column field="fecha_lectura" header="Fecha de lectura" sortable style="min-width: 10rem"></Column>
                <Column field="nombre_completo" header="Dueño" sortable style="min-width: 16rem"></Column>
                <Column field="observaciones" header="Observaciones" style="min-width: 10rem"></Column>
                <Column field="lectura_anterior" header="Lectura Anterior" style="min-width: 8rem"></Column>
                <Column field="lectura_actual" header="Lectura Actual" style="min-width: 8rem"></Column>
                <Column field="total" header="Total" style="min-width: 6rem"></Column>
                <Column field="estado_pago" header="Estado" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado_pago == 1 ? 'Pagado' : 'Endeudado'" :severity="getEstadoLabel(slotProps.data.estado_pago)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editarRecibo(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="reciboDialog" :style="{ width: '450px' }" header="Registrar nuevo pre-aviso" :modal="true">
            <div class="my-2 flex items-center">
                <Message severity="success" class="mr-4 mb-4" v-if="!switchValor">Registro por Datos del Socio</Message>
                <Message severity="success" class="mr-4 mb-4" v-if="switchValor">Registro por Numero de Medidor</Message>
                <ToggleSwitch class="ml-2 mb-2" v-model="switchValor" @click="switchValor === !switchValor" />
            </div>
            <div v-if="!switchValor" class="flex flex-col gap-6">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre del socio: </label>
                    <Listbox v-model="socio" :options="sociosListaBox" optionLabel="name" :filter="true" />
                    <Message severity="secondary" v-if="socio">Socio seleccionado: {{ socio.name }}</Message>
                    <small v-if="submitted && !socio" class="text-red-500">El campo es requerido.</small>
                </div>

                <div>
                    <label for="observaciones" class="block font-bold mb-3">Observaciones: </label>
                    <Textarea id="observaciones" v-model.trim="recibo.observaciones" rows="3" cols="20" fluid />
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="lectura_actual" class="block font-bold mb-3">Lectura actual: </label>
                        <InputNumber id="lectura_actual" v-model.trim="recibo.lectura_actual" fluid />
                        <small v-if="submitted && !recibo.lectura_actual" class="text-red-500">El campo es requerido.</small>
                    </div>
                    <div class="col-span-6">
                        <label for="codigo_propiedad" class="block font-bold mb-3">Codigo de la propiedad: </label>
                        <Select v-model.trim="recibo.codigo_propiedad" :options="propiedadesValues" optionLabel="codigo_propiedad" placeholder="Select" />
                        <small v-if="submitted && !recibo.codigo_propiedad" class="text-red-500">El campo es requerido.</small>
                    </div>
                </div>
            </div>

            <div v-if="switchValor" class="flex flex-col gap-6">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="id_medidor" class="block font-bold mb-2 mr-1">Numero de Medidor :</label>
                        <InputNumber id="id_medidor" v-model.trim="id_medidor" class="mr-2" fluid />
                        <small v-if="submitted && !id_medidor" class="text-red-500">El campo es requerido.</small>
                    </div>
                    <div class="mt-8">
                        <Button label="Buscar" icon="pi pi-search" @click="busquedaPropiedadSocio(id_medidor)"/>
                    </div>
                </div>
                <div class="col-span-6">
                    <label for="lectura_actual" class="block font-bold mb-2">Lectura actual: </label>
                    <InputNumber :disabled="!busquedaRealizada" id="lectura_actual" v-model.trim="recibo.lectura_actual" :placeholder="!busquedaRealizada ? 'Necesita hacer la busqueda por medidor para acceder a este campo.' : 'Ingrese este campo.'" fluid />
                    <small v-if="submitted && !recibo.lectura_actual" class="text-red-500">El campo es requerido.</small>
                </div>
                <div>
                    <label for="observaciones" class="block font-bold mb-3">Observaciones: </label>
                    <Textarea :disabled="!busquedaRealizada" id="observaciones" v-model.trim="recibo.observaciones" rows="2" cols="20" :placeholder="!busquedaRealizada ? 'Necesita hacer la busqueda por medidor para acceder a este campo.' : 'Ingrese este campo.'" fluid />
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="guardarRecibo" />
            </template>
        </Dialog>

        <Dialog v-model:visible="reciboUpdate" :style="{ width: '450px' }" header="Actualizar pre-aviso" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre del socio: </label>
                    <Listbox v-model="socio" :options="sociosListaBox" optionLabel="name" :filter="true" />
                    <Message severity="secondary" v-if="socio">Socio seleccionado: {{ socio.name }}</Message>
                </div>
                <div class="flex flex-col">
                    <label for="mes_correspondiente" class="block font-bold mb-3 mr-3">Mes correspondiente: </label>
                    <DatePicker v-model="recibo.mes_correspondiente" :manualInput="false" view="month" dateFormat="mm/yy" />
                    <small v-if="submitted && !recibo.mes_correspondiente" class="text-red-500">El campo es requerido.</small>
                </div>
                <div>
                    <label for="observaciones" class="block font-bold mb-3">Observaciones: </label>
                    <Textarea  id="observaciones" v-model.trim="recibo.observaciones" rows="3" cols="20" fluid />
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="lectura_actual" class="block font-bold mb-3">Lectura actual: </label>
                        <InputNumber id="lectura_actual" v-model.trim="recibo.lectura_actual" fluid />
                    </div>
                    <small v-if="submitted && !recibo.lectura_actual" class="text-red-500 mx-2">El campo es requerido.</small>
                    <div class="col-span-6">
                        <label for="codigo_propiedad" class="block font-bold mb-3">Codigo de propiedad: </label>
                        <Message severity="secondary" v-if="!socioHaCambiado.value">Codigo Seleccionado: {{ recibo.codigo_propiedad }}</Message>
                        <div v-else>
                            <Select v-model="recibo.codigo_propiedad"  :options="propiedadesValues" optionLabel="codigo_propiedad" placeholder="Select" />
                        </div>

                    </div>
                    <br />
                    <small v-if="submitted && !recibo.codigo_propiedad" class="text-red-500">El campo es requerido.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarActualizacion" />
                <Button label="Actualizar" icon="pi pi-check" @click="actualizaRecibo" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirmacion" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product"
                    >Estas seguro de querer eliminar este recibo? <b>{{ product.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>
    </div>
</template>
