<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { fetchListaSociosPropiedades } from '@/service/peticionesApi';

const socios = ref(null);
const options = ref(['list', 'grid']);
const layout = ref('list');

const loadSocios = async () => {
    const listaSocios = await fetchListaSociosPropiedades();
    if (listaSocios) {
        socios.value = listaSocios;
    } else {
        console.error('No se pudo obtener la lista de socios.');
    }
};

onBeforeMount(loadSocios);
</script>

<template>
    <div class="flex flex-col">
        <div class="card p-4 bg-white rounded-lg shadow-lg">
            <div class="font-semibold text-xl mb-6 text-gray-800">Lista de Socios</div>

            <DataTable :value="socios" rowGroupMode="subheader" groupRowsBy="nombre_socio" sortMode="single" sortField="nombre_socio" :sortOrder="1" scrollable scrollHeight="700px" tableStyle="min-width: 50rem">
                <!-- Group header for each socio -->
                <template #groupheader="slotProps">
                    <div class="bg-blue-100 p-4 rounded-md flex items-center gap-2 mb-4">
                        <i class="pi pi-fw pi-credit-card text-blue-600"></i>
                        <span class="font-medium text-gray-700">{{ slotProps.data.ci_socio }}</span>
                        <i class="pi pi-fw pi-user text-blue-600"></i>
                        <span class="text-gray-900">{{ slotProps.data.nombre_socio }} {{ slotProps.data.primer_apellido_socio }} {{ slotProps.data.segundo_apellido_socio }}</span>
                    </div>
                </template>

                <!-- Data columns -->
                <div class="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md mb-4">
                    <Column header="# Propiedad" style="width: 10rem">
                        <template #body="slotProps">
                            <div v-for="(propiedad, index) in slotProps.data.propiedades" :key="index" class="p-2 bg-white shadow-sm rounded-md mb-2">
                                {{ propiedad.id }}
                            </div>
                        </template>
                    </Column>

                    <Column header="Descripcion de la Propiedad" style="width: 35rem">
                        <template #body="slotProps">
                            <div v-for="(propiedad, index) in slotProps.data.propiedades" :key="index" class="p-2 bg-white shadow-sm rounded-md mb-2">
                                {{ propiedad.descripcion_propiedad }}
                            </div>
                        </template>
                    </Column>

                    <Column header="Ubicacion de la Propiedad" style="width: 35rem">
                        <template #body="slotProps">
                            <div v-for="(propiedad, index) in slotProps.data.propiedades" :key="index" class="p-2 bg-white shadow-sm rounded-md mb-2">
                                {{ propiedad.cuadra_propiedad }}
                            </div>
                        </template>
                    </Column>

                    <Column header="Total en Deuda" style="width: 10rem">
                        <template #body="slotProps">
                            <div v-for="(propiedad, index) in slotProps.data.propiedades" :key="index" class="p-2 bg-white shadow-sm rounded-md mb-2">
                                {{ propiedad.total_multas_propiedad }}
                            </div>
                        </template>
                    </Column>
                </div>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
.card {
    background-color: var(--card-background-color);
    color: var(--text-color);
    box-shadow: 0 4px 6px var(--card-shadow-color);
}

body {
    background-color: var(--background-color);
    color: var(--text-color);
}

.grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}

.bg-blue-100 {
    background-color: #ebf8ff;
}

.text-blue-600 {
    color: #3182ce;
}

.text-gray-700 {
    color: #4a5568;
}

.text-gray-900 {
    color: #1a202c;
}

.shadow-lg {
    box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.bg-gray-50 {
    background-color: #f9fafb;
}

.bg-white {
    background-color: #ffffff;
}

.rounded-md {
    border-radius: 0.375rem;
}

.p-4 {
    padding: 1rem;
}

.mb-4 {
    margin-bottom: 1rem;
}

.mb-6 {
    margin-bottom: 1.5rem;
}
</style>
