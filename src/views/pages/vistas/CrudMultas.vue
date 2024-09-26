<script setup>
import { fetchListaMultas, fetchListaSocios, fetchListaPropiedades, fetchGuardarMulta, fetchRegistrarMulta, fetchActualizacionMulta} from '@/service/peticionesApi';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, watch, ref } from 'vue';

const multas = ref();
const multa = ref({});
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

const toast = useToast();
const dt = ref();
const products = ref();


const deleteProductsDialog = ref(false);
const product = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);


function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

function getStatusLabel(status) {
    switch (status) {
        case 'INSTOCK':
            return 'success';

        case 'LOWSTOCK':
            return 'warn';

        case 'OUTOFSTOCK':
            return 'danger';

        default:
            return null;
    }
}

//Funciones para la carga de datos de multas
const loadMultas = async () => {
    const listaMultas = await fetchListaMultas();
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
    product.value = {};
    submitted.value = false;
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
}

function registrarMultaSocio() {
    asignarSocios();
    asignarMultas();
    modalRegistroMultaSocio.value = true;
}

async function listaPropiedades(id_socio){
    const listaPropiedades = await fetchListaPropiedades(id_socio);
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
    const listaSocios = await fetchListaSocios();
    if (listaSocios) {
        sociosListaBox.value = listaSocios.map((item) => ({
            name: item.nombre_socio + ' ' + item.primer_apellido_socio + ' ' + item.segundo_apellido_socio,
            code: item.id
        }));
    } else {
        console.error('No se pudo obtener la lista de socios.');
    }
}

async function asignarMultas(){
    const listaMultas = await fetchListaMultas();
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
    try {
        submitted.value = true;
        multa.value.id = null;
        if(actualizacionMulta.value){
            await actualizarMulta();
            return;
        }
        const response = await fetchRegistrarMulta(multa.value);
        console.log(response);
        if (response.status != 200) {
            throw new Error(`Error en la solicitud mensaje.`);
        }
        hideDialog();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
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
    try {
        submitted.value = true;
        const response = await fetchActualizacionMulta(idMulta , multa.value);
        if (response.status != 200) {
            throw new Error(`Error en la solicitud, mensaje: ${response.message}`);
        }
        hideDialog();
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
}

/**
 * Funcion para agregar una multa a una propiedad de un socio
 */
async function registrarMultaPropiedadSocio() {
    try{
        const data = {
            id_multa: multa.value.code,
            id_propiedad: propiedad.value.code
        }
        const respuesta = await fetchGuardarMulta(data);
        if(respuesta.status !== 200){
            throw new Error('Error al intentar registrar la multa al propietario');
        }
        cerrarModal();
    }
    catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
        toast.add({ severity: 'error', summary: 'Ups, sucedio un error a la hora de registrar el socio' , detail: error.message , life: 3000 });
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

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
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
                        <Tag :value="slotProps.data.inventoryStatus" :severity="getStatusLabel(slotProps.data.inventoryStatus)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editarMulta(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="eliminarMulta(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="modalRegistroMulta" :style="{ width: '450px' }" header="Registrar multa" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="criterio_infraccion" class="block font-bold mb-3">Infraccion : </label>
                    <InputText id="criterio_infraccion" v-model.trim="multa.criterio_infraccion" required="true" autofocus :invalid="submitted && !multa.criterio_infraccion" fluid />
                    <small v-if="submitted && !multa.criterio_infraccion" class="text-red-500">El tipo de infraccion es requerida.</small>
                </div>
                <div>
                    <label for="description_infraccion" class="block font-bold mb-3">Description de la infraccion : </label>
                    <Textarea id="descripcion_infraccion" v-model.trim="multa.descripcion_infraccion" required="true" rows="3" cols="20" fluid />
                    <small v-if="submitted && !multa.descripcion_infraccion" class="text-red-500">El tipo de infraccion es requerida.</small>
                </div>
                <div class="col-span-6">
                    <label for="monto_infraccion" class="block font-bold mb-3">Monto total de pago : </label>
                    <InputNumber id="monto_infraccion" v-model.trim="multa.monto_infraccion" fluid />
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button
                    label="Guardar"
                    icon="pi pi-check"
                    @click="registrarMulta"
                    :disabled="!multa.criterio_infraccion || !multa.descripcion_infraccion || !multa.monto_infraccion"/>
            </template>
        </Dialog>

        <Dialog v-model:visible="modalRegistroMultaSocio" :style="{ width: '450px' }" header="Asignar una multa a un propietario" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="criterio_infraccion" class="block font-bold mb-3">Lista de socios : </label>
                    <Listbox v-model="socio" :options="sociosListaBox" optionLabel="name" :filter="true" />
                    <small v-if="submitted && !multa.criterio_infraccion" class="text-red-500">El socio es requerido.</small>
                    <Message severity="secondary" v-if="socio">Socio seleccionado: {{ socio.name }}</Message>
                </div>
                <div>
                    <label for="description_infraccion" class="block font-bold mb-3">Lista de infracciones : </label>
                    <Listbox v-model="multa" :options="multasListaBox" optionLabel="criterio_infraccion" :filter="true" />
                    <small v-if="submitted && !multa.descripcion_infraccion" class="text-red-500">La infraccion es requerida.</small>
                    <Message severity="secondary" v-if="multa">Multa seleccionada: {{ multa.criterio_infraccion }}</Message>
                </div>
                <div>
                    <label for="description_infraccion" class="block font-bold mb-3">Codigo de propiedad : </label>
                    <Select v-model="propiedad" :options="propiedadesValues" optionLabel="code" placeholder="Select" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarModal" />
                <Button
                    label="Guardar"
                    icon="pi pi-check"
                    @click="registrarMultaPropiedadSocio"
                    />
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
