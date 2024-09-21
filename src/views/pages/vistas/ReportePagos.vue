<script setup>
import { onBeforeMount, watch, ref } from 'vue';

const loading = ref(false);

function load() {
    loading.value = true;
    setTimeout(() => (loading.value = false), 1000);
}
</script>

<template>
    <div className="card">
        <div class="font-semibold text-xl mb-4">Reporte de pagos</div>
        <div class="font-semibold text-xl my-6"><Message severity="success">Selecciones el rango de fechas para la busqueda de reportes de pagos.</Message></div>
        <div class="flex flex-col md:flex-row gap-4">
            <div class="font-semibold text-xm my-2">
                Fecha de inicio:
            </div>
            <DatePicker id="fechaInicio" class="w-72 mb-1" :showIcon="true" :showButtonBar="true"></DatePicker>

            <div class="font-semibold text-xm my-2">
                Fecha final :
            </div>
            <DatePicker id="fechaFin" class="w-72 mb-1" :showIcon="true" :showButtonBar="true"></DatePicker>

            <Button type="button" class="mr-3 mb-1" label="Search" icon="pi pi-search" iconPos="right" :loading="loading" @click="load()" />
        </div>
    </div>
</template>
