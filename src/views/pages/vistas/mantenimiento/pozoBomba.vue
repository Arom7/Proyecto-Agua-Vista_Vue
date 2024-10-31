<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { fetchListaMantenimientos , fetchReporteMantenimientos} from '@/service/peticionesApi';
import { fetchRegistrarNuevoMantenimiento } from '@/service/PeticionesApiPost';
import { fetchActualizarMantenimiento } from '@/service/PeticionesApiPut';
import { fetchEliminarMantenimiento } from '@/service/peticionesDelete';
import {useStore} from 'vuex';

const token = localStorage.getItem('authToken');
const store = useStore();
const toast = useToast();
const dt = ref();
const mantenimientos = ref();
const modalRegistroMantenimiento = ref(false);
const mantenimiento = ref({});
const submitted = ref(false);
const tipoEquipo = ref([
    { label: 'Pozo de Agua', value: 'pozo' },
    { label: 'Bomba de agua', value: 'bomba' }
]);
const modalEliminacionMantenimiento = ref(false);
let idMantenimiento = null;

const tipoMantenimiento = ref([
    { label: 'Mantenimiento preventivo', value: 'preventivo' },
    { label: 'Mantenimiento correctivo', value: 'correctivo' }
]);

const minDate = new Date();

const loadMantenimietos = async () => {
    const listaMantenimientos = await fetchListaMantenimientos(token);
    if (listaMantenimientos) {
        mantenimientos.value = listaMantenimientos;
        console.log(mantenimientos.value);
    } else {
        console.error('No se pudo obtener la lista de recibos.');
    }
};

onBeforeMount(loadMantenimietos);

const formatCurrency = (value) => {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'BOB' });
    return;
};
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const openNew = () => {
    mantenimiento.value = {};
    submitted.value = false;
    modalRegistroMantenimiento.value = true;
};

const cancelarRegistro = () => {
    modalRegistroMantenimiento.value = false;
    submitted.value = false;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

function validarValoresMulta() {
    const errores = [];
    const reglasNombre = /^([a-zA-ZáéíóúÁÉÍÓÚñÑ]+\.?\s)*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;
    const reglasTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,\-]+([ ]+[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,\-]+)*$/;

    if (!mantenimiento.value.responsable) {
        errores.push('El nombre del responsable es requerido.');
    }else if (!reglasNombre.test(mantenimiento.value.responsable)) {
        errores.push('Solo se aceptan caracteres alfanumericos en el nombre del responsable');
    }
    if (!reglasTexto.test(mantenimiento.value.descripcion_mantenimiento)) {
        errores.push('La descripcion de la infraccion solo acepta caracteres alfanumericos.');
    }
    if(!mantenimiento.value.fecha_mantenimiento_inicio){
         errores.push('La fecha de inicio de mantenimiento es requerido.');
    }
    if(!mantenimiento.value.fecha_mantenimiento_fin){
         errores.push('La fecha de fin de mantenimiento es requerido.');
    }
    if(!mantenimiento.value.fecha_proximo_mantenimiento){
         errores.push('La fecha de proximo mantenimiento es requerido.');
    }
    if(!mantenimiento.value.precio_total){
         errores.push('El precio total del mantenimiento es requerido.');
    }
    return errores;
}



/**
 * Analisis peticiones API
 */

async function guardarMantenimiento() {
    const errores = validarValoresMulta();
    if (errores.length > 0) {
        toast.add({ severity: 'error', summary: 'Error en la validacion, campos requeridos', detail: errores.join(' '), life: 7000 });
        return;
    }
    submitted.value = true;
    mantenimiento.value.tipo_equipo = mantenimiento.value.tipo_equipo.label;
    mantenimiento.value.fecha_mantenimiento_inicio = new Date(mantenimiento.value.fecha_mantenimiento_inicio).toISOString().slice(0, 10);
    mantenimiento.value.fecha_mantenimiento_fin = new Date(mantenimiento.value.fecha_mantenimiento_fin).toISOString().slice(0, 10);
    mantenimiento.value.fecha_proximo_mantenimiento = new Date(mantenimiento.value.fecha_proximo_mantenimiento).toISOString().slice(0, 10);

    //manejo actualizacion
    if(idMantenimiento){
        const respuesta = await fetchActualizarMantenimiento(idMantenimiento, mantenimiento.value, token);
        if (respuesta.status) {
            toast.add({ severity: 'success', summary: 'Exito', detail: 'Datos del mantenimiento actualizados correctamente.', life: 5000 });
            modalRegistroMantenimiento.value = false;
            await loadMantenimietos();
        } else {
            toast.add({ severity: 'error', summary: 'Falla al registrar el mantenimiento', detail: 'Se registro problemas para almacenar el mantenimiento', life: 5000 });
    }
        idMantenimiento = null;
        return ;
    }

    //manejo de registro
    const response = await fetchRegistrarNuevoMantenimiento(mantenimiento.value, token);
    if (response.status) {
        toast.add({ severity: 'success', summary: 'Exito', detail: 'Datos del mantenimiento guardados correctamente.', life: 5000 });
        modalRegistroMantenimiento.value = false;
        await loadMantenimietos();
    } else {
        toast.add({ severity: 'error', summary: 'Falla al registrar el mantenimiento', detail: 'Se registro problemas para almacenar el mantenimiento', life: 5000 });
    }
}

async function editarMantenimiento(data) {
    console.log(idMantenimiento);
    mantenimiento.value = { ...data };
    console.log(mantenimiento.value);
    idMantenimiento = data.id;
    console.log(idMantenimiento);
    modalRegistroMantenimiento.value = true;
}

function imprimirReportePDF() {
    fetchReporteMantenimientos(token);
}

async function confirmacionEliminacionMantenimiento(data) {
    mantenimiento.value = data;
    modalEliminacionMantenimiento.value = true;
}

async function eliminacionMantenimiento(){
    let id = mantenimiento.value.id;
    const response = await fetchEliminarMantenimiento(id, token);
    if (response.status) {
        toast.add({ severity: 'success', summary: 'Exito', detail: 'Datos del mantenimiento eliminados correctamente.', life: 5000 });
        modalEliminacionMantenimiento.value = false;
        await loadMantenimietos();
    } else {
        toast.add({ severity: 'error', summary: 'Falla al eliminar el mantenimiento', detail: 'Se registro problemas para eliminar el mantenimiento', life: 5000 });
    }
}

</script>
<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar nuevo mantenimiento" icon="pi pi-plus" class="mr-2" @click="openNew" outlined/>
                </template>

                <template #end>
                    <Button label="Descargar PDF" icon="pi pi-upload" severity="secondary" @click="imprimirReportePDF" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="mantenimientos"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Desde {first} hasta {last} de {totalRecords} mantenimientos"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between p-4">
                        <h4 class="m-0">Listado completo de mantenimientos</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>
                <Column field="id" header="# Codigo de Mantenimiento" style="width: 10rem"></Column>
                <Column field="fecha_mantenimiento_inicio" header="Inicio Mantenimiento" style="min-width: 10rem"></Column>
                <Column field="fecha_mantenimiento_fin" header="Mantenimiento Terminado" style="width: 11rem"></Column>
                <Column field="descripcion_mantenimiento" header="Descripcion" style="width: 18rem"></Column>
                <Column field="responsable" header="Responsable" style="width: 10rem"></Column>
                <Column field="tipo_equipo" header="Pozo o Bomba" style="width: 10rem"></Column>
                <Column field="precio_total" header="Precio" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.precio_total) }}
                    </template>
                </Column>
                <Column field="fecha_proximo_mantenimiento" header="Proximo Mantenimiento" style="min-width: 10rem"></Column>

                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editarMantenimiento(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmacionEliminacionMantenimiento(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="modalRegistroMantenimiento" :style="{ width: '450px' }" header="Registro de mantenimiento" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Responsable del mantenimiento.</label>
                    <InputText v-model.trim="mantenimiento.responsable" required="true" autofocus :invalid="submitted && !mantenimiento.responsable" fluid placeholder="Ingrese el nombre del responsable que realizo el trabajo." />
                    <small v-if="submitted && !mantenimiento.responsable" class="text-red-500">Ingrese el nombre del responsable, este campo es requerido.</small>
                </div>

                <div class="flex">
                    <div class="w-1/2">
                        <label for="mantenimiento_inicio" class="block font-bold mb-3">Fecha de inicio del mantenimiento :</label>
                        <DatePicker v-model="mantenimiento.fecha_mantenimiento_inicio" :invalid="mantenimiento.fecha_mantenimiento_inicio === null" :manualInput="false" dateFormat="yy-mm-dd" :minDate="minDate" />

                    </div>
                    <div class="w-1/2">
                        <label for="precio_total" class="block font-bold mb-3">Fecha estimada para terminar el mantenimiento: </label>
                        <DatePicker
                            v-model="mantenimiento.fecha_mantenimiento_fin"
                            :invalid="mantenimiento.fecha_mantenimiento_fin === null"
                            :manualInput="false"
                            dateFormat="yy-mm-dd"
                            :disabled="!mantenimiento.fecha_mantenimiento_inicio"
                            :minDate="minDate"
                        />
                         <small v-if="!mantenimiento.fecha_mantenimiento_inicio" class="text-red-500">Campo inhabilitado.</small>
                    </div>
                </div>

                <div class="flex w-2/3">
                    <div class="w-2/3 mr-3">
                        <label for="tipo_equipo" class="block font-bold mb-3">Tipo de equipo: </label>
                        <Select id="tipo_equipo" v-model="mantenimiento.tipo_equipo" :options="tipoEquipo" optionLabel="label" placeholder="Selecciona tipo de equipo" fluid></Select>
                    </div>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-2">Descripcion : </label>
                    <Textarea id="description" v-model="mantenimiento.descripcion_mantenimiento" required="true" rows="2" cols="15" fluid placeholder="Ingrese algun tipo de observacion." />
                </div>

                <div class="flex">
                    <div class="w-1/2">
                        <label for="inventoryStatus" class="block font-bold mb-3">Proximo mantenimiento :</label>
                        <DatePicker
                            v-model="mantenimiento.fecha_proximo_mantenimiento"
                            :invalid="mantenimiento.fecha_proximo_mantenimiento === null"
                            :manualInput="false"
                            dateFormat="yy-mm-dd"
                            :disabled="!mantenimiento.fecha_mantenimiento_fin"
                            :minDate="minDate"
                        />
                        <small v-if="!mantenimiento.fecha_mantenimiento_fin" class="text-red-500">Campo inhabilitado.</small>
                    </div>
                    <div>
                        <label for="precio_total" class="block font-bold mb-3">Precio Total : </label>
                        <InputNumber id="precio_total" v-model="mantenimiento.precio_total" mode="currency" currency="BOB" fluid placeholder="Coloque el monto en bolivianos" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="cancelarRegistro" />
                <Button label="Save" icon="pi pi-check" @click="guardarMantenimiento" />
            </template>
        </Dialog>

        <Dialog v-model:visible="modalEliminacionMantenimiento" :style="{ width: '450px' }" header="Confirmacion" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="mantenimiento"
                    >Estas seguro de eliminar el mantenimiento con el siguiente nro.  <b>{{ mantenimiento.id }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="modalEliminacionMantenimiento = false" />
                <Button label="Yes" icon="pi pi-check" @click="eliminacionMantenimiento" />
            </template>
        </Dialog>
    </div>
</template>
