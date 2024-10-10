<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const dt = ref();
const modalRegistroMantenimiento = ref(false);
const mantenimiento = ref({});
const submitted = ref(false);
const tipoEquipo = ref([
    { label: 'Pozo de Agua', value: 'pozo' },
    { label: 'Bomba de agua', value: 'bomba' }
]);

const tipoMantenimiento = ref([
    { label: 'Mantenimiento preventivo', value: 'preventivo' },
    { label: 'Mantenimiento correctivo', value: 'correctivo' }
]);
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
        </div>

        <Dialog v-model:visible="modalRegistroMantenimiento" :style="{ width: '500px' }" header="Registro de mantenimiento" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Responsable del mantenimiento.</label>
                    <InputText v-model.trim="mantenimiento.tecnico_nombre" required="true" autofocus :invalid="submitted && !mantenimiento.tecnico_nombre" fluid placeholder="Ingrese el nombre del responsable que realizo el trabajo." />
                    <small v-if="submitted && !mantenimiento.tecnico_nombre" class="text-red-500">El id de la bomba es requerido.</small>
                </div>
                <div class="flex">
                    <div class="mr-4">
                        <label for="tipo_equipo" class="block font-bold mb-3">Tipo de equipo: </label>
                        <Select id="tipo_equipo" v-model="mantenimiento.tipo_equipo" :options="tipoEquipo" optionLabel="label" placeholder="Selecciona el tipo de equipo" fluid></Select>
                    </div>
                    <div>
                        <label for="tipo_mantenimiento" class="block font-bold mb-3">Tipo mantenimiento : </label>
                        <Select id="tipo_mantenimiento" v-model="mantenimiento.tipo_mantenimiento" :options="tipoMantenimiento" optionLabel="label" placeholder="Selecciona el tipo de mantenimiento" fluid></Select>
                    </div>
                </div>

                <div class="flex">
                    <div class="mr-5 w-64">
                        <label for="inventoryStatus" class="block font-bold mb-3">Proximo mantenimiento :</label>
                        <DatePicker v-model="mantenimiento.fechaProximoMantenimiento" :invalid="mantenimiento.fechaProximoMantenimiento === null" :manualInput="false" />
                    </div>
                    <div>
                        <label for="precio_total" class="block font-bold mb-3">Precio Total : </label>
                        <InputNumber id="precio_total" v-model="mantenimiento.precio_total" mode="currency" currency="BOB" fluid />
                    </div>

                </div>

                <div>
                    <label for="description" class="block font-bold mb-2">Notas : </label>
                    <Textarea id="description" v-model="mantenimiento.notas" required="true" rows="2" cols="15" fluid placeholder="Ingrese algun tipo de observacion." />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="cancelarRegistro" />
                <Button label="Save" icon="pi pi-check" @click="guardarMantenimiento" />
            </template>
        </Dialog>
    </div>
</template>
