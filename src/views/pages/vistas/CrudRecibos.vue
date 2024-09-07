<script setup>
import { ProductService } from '@/service/ProductService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const recibos = ref();
const calendarValue = ref(null);
const reciboDialog = ref(false);
const reciboUpdate = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const recibo = ref({
    id_socio : null, //Integer
    observaciones : '', //String
    cuadra : null, //Integer
    mes_correspondiente : null, //Date
    lectura_actual : null //Integer
});
const sociosListaBox = ref([]);
const socio = ref(null);

const recibosSeleccionados = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const esValidoNombre = ref(true);
const esValidoPrimerApellido = ref(true);
const esValidoSegundoApellido = ref(true);

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}



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

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
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

// Url de respuesta
const url = 'http://127.0.0.1:8000/api';
// Peticion get
async function visualizaRecibos() {
    try{
        const response = await fetch(`${url}/recibos`, {
            method : 'GET',
            headers: {
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        recibos.value = data.recibos;
    }catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}
// funcion para la peticion get
function formatToYYYYMMDD(date) {
    if (!date || !(date instanceof Date)) {
        console.error('Fecha inválida:', date);
        return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = '01';
    return `${year}-${month}-${day}`;
}

// Peticion post
async function guardarRecibo() {
    try{
        // submitted hace que el formulario sea enviado
        submitted.value = true;

        recibo.value.mes_correspondiente = formatToYYYYMMDD(recibo.value.mes_correspondiente);
        recibo.value.id_socio = socio.value.code;

        console.log(recibo.value);
        const response = await fetch(`${url}/recibos`,{
           method : 'POST',
           body: JSON.stringify(recibo.value),
           headers: {
                'Content-type': 'application/json;'
            }
        });
        console.log(response)
        if (!response.ok) {
            const problema = await response.json();
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText} mensaje: ${problema.message}`);
        }
        const data = await response.json();
        hideDialog();

    }catch (error){
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar almacenar los datos.';
    }
};

// Funcion para estados
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
    submitted.value = false;
    reciboDialog.value = true;
}

//Funcion que abre modal de actualizacion
function editProduct(datos) {
    recibo.value = { ...datos };
    console.log(datos);
    console.log(recibo.value);
    getPropiedades();
    reciboUpdate.value = true;
}

// Funcion llamada para ocultar el modal
function hideDialog() {
    reciboDialog.value = false;
    submitted.value = false;
}

function cerrarActualizacion(){
    reciboUpdate.value = false;
}

const dropdownValue = ref(null);
const dropdownValues = ref([]);

async function obtenerSocios(){
    try{
        const response = await fetch(`${url}/socios`, {
            method : 'GET',
            headers: {
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        sociosListaBox.value = data.lista_socios.map(item => ({
            name: item.nombre_socio + " " + item.primer_apellido_socio + " " + item.segundo_apellido_socio,  // Ajusta los campos según la estructura de tu API
            code: item.id  // Ajusta este campo también
        }));
    }catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}

async function getPropiedades() {
    try{
        const response = await fetch(`${url}/recibos`, {
            method : 'GET',
            headers: {
                'Content-type': 'application/json;'
            }
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        sociosListaBox.value = data.recibos.map(item => ({
            name: item.nombre_completo,  // Ajusta los campos según la estructura de tu API
            code: item.id   // Ajusta este campo también
        }));
    }catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}
visualizaRecibos()
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
                        <h4 class="m-0">Lista de recibos</h4>
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
                <Column field="fecha_lectura" header="Fecha de lectura" sortable style="min-width: 10rem"></Column>
                <Column field="nombre_completo" header="Dueño" sortable style="min-width: 16rem"></Column>
                <Column field="observaciones" header="Observaciones" style="min-width: 10rem"></Column>
                <Column field="lectura_anterior" header="Lectura Anterior" sortable style="min-width: 8rem"></Column>
                <Column field="lectura_actual" header="Lectura Actual" sortable style="min-width: 8rem"></Column>
                <Column field="total" header="Total" sortable style="min-width: 6rem"></Column>
                <Column field="estado_pago" header="Estado" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado_pago == 1? 'Pagado' : 'Endeudado'" :severity="getEstadoLabel(slotProps.data.estado_pago)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="reciboDialog" :style="{ width: '450px' }" header="Registrar nuevo pre-aviso" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre del socio: </label>
                    <Listbox v-model="socio" :options="sociosListaBox" optionLabel="name" :filter="true" />
                    <h3 v-if="socio">Socio seleccionado: {{ socio.name }}</h3>
                </div>
                <div>
                    <label for="observaciones" class="block font-bold mb-3">Observaciones: </label>
                    <Textarea id="observaciones" v-model.trim="recibo.observaciones" rows="3" cols="20" fluid />
                </div>

                <div class="field col-12 md:col-4">
                    <div class="font-semibold text-xl">Mes correspondiente de lectura: </div>
                    <DatePicker id="fecha-lectura" :showIcon="true" :showButtonBar="true" v-model="recibo.mes_correspondiente"></DatePicker>
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="lectura_actual" class="block font-bold mb-3">Lectura actual: </label>
                        <InputNumber id="lectura_actual" v-model.trim="recibo.lectura_actual" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="cuadra" class="block font-bold mb-3">Codigo de cuadra: </label>
                        <InputNumber id="cuadra" v-model.trim="recibo.cuadra" integeronly fluid />
                    </div>
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
                    <label for="observaciones" class="block font-bold mb-3">Observaciones: </label>
                    <Textarea id="observaciones" v-model.trim="recibo.observaciones" rows="3" cols="20" fluid />
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="lectura_actual" class="block font-bold mb-3">Lectura actual: </label>
                        <InputNumber id="lectura_actual" v-model.trim="recibo.lectura_actual" fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="cuadra" class="block font-bold mb-3">Codigo de cuadra: </label>
                        <Select v-model="dropdownValue" :options="dropdownValues" optionLabel="name" placeholder="Select" />
                    </div>
                </div>

            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarActualizacion" />
                <Button label="Actualizar" icon="pi pi-check" @click="guardarRecibo" />
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

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirmacion" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Estas seguro de querer eliminar los recibos seleccionados?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>
    </div>
</template>
