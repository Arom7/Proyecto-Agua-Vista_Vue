<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { fetchListaMantenimientos } from '@/service/peticionesApi';
import { fetchRegistrarNuevoMantenimiento } from '@/service/PeticionesApiPost';
import { fetchActualizarMantenimiento } from '@/service/PeticionesApiPut';
import {useStore} from 'vuex';

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

let idMantenimiento = null;

const tipoMantenimiento = ref([
    { label: 'Mantenimiento preventivo', value: 'preventivo' },
    { label: 'Mantenimiento correctivo', value: 'correctivo' }
]);

const minDate = new Date();

const loadMantenimietos = async () => {
    const listaMantenimientos = await fetchListaMantenimientos(store.state.token);
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

/**
 * Analisis peticiones API
 */

async function guardarMantenimiento() {
    submitted.value = true;
    if (!mantenimiento.value.responsable || !mantenimiento.value.fecha_mantenimiento_inicio || !mantenimiento.value.fecha_mantenimiento_fin || !mantenimiento.value.precio_total || !mantenimiento.value.fecha_proximo_mantenimiento) {
        toast.add({ severity: 'error', summary: 'Error de validacion', detail: 'Todos los campos son requeridos.', life: 3000 });
        return;
    }
    mantenimiento.value.tipo_equipo = mantenimiento.value.tipo_equipo.label;
    mantenimiento.value.fecha_mantenimiento_inicio = new Date(mantenimiento.value.fecha_mantenimiento_inicio).toISOString().slice(0, 10);
    mantenimiento.value.fecha_mantenimiento_fin = new Date(mantenimiento.value.fecha_mantenimiento_fin).toISOString().slice(0, 10);
    mantenimiento.value.fecha_proximo_mantenimiento = new Date(mantenimiento.value.fecha_proximo_mantenimiento).toISOString().slice(0, 10);

    //manejo actualizacion
    if(idMantenimiento){
        const respuesta = await fetchActualizarMantenimiento(idMantenimiento, mantenimiento.value,store.state.token);
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
    const response = await fetchRegistrarNuevoMantenimiento(mantenimiento.value, store.state.token);
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

</script>
<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Registrar nuevo mantenimiento" icon="pi pi-plus" class="mr-2" @click="openNew" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
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
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
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
    </div>
</template>
