<script setup>
import { ProductService } from '@/service/ProductService';
import { onBeforeMount, onMounted, ref } from 'vue';

const socios = ref(null);
const customers3 = ref(null);
const options = ref(['list', 'grid']);
const layout = ref('list');

function getSeverity(product) {
    switch (product.inventoryStatus) {
        case 'INSTOCK':
            return 'success';

        case 'LOWSTOCK':
            return 'warning';

        case 'OUTOFSTOCK':
            return 'danger';

        default:
            return null;
    }
}

const url = 'http://127.0.0.1:8000/api';

async function pedirLista() {
    try {
        const response = await fetch(`${url}/socios`);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        socios.value = data.lista_socios;
        for (const socio of socios.value) {
            socio.propiedades = await codigoPropiedad(socio.id);
        }
        return socios.value;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al intentar iniciar sesión. Inténtalo de nuevo.';
        return [];
    }
}

async function codigoPropiedad(socioId) {
    try {
        const response = await fetch(`${url}/propiedades/socio/${socioId}`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.propiedades;
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        return [];
    }
}

onBeforeMount(async () => {
    const listaSocios = await pedirLista();

    if (listaSocios) {
        customers3.value = listaSocios;
        console.log(customers3.value);
    } else {
        console.error('No se pudo obtener la lista de socios.');
    }
});
</script>

<template>
    <div class="flex flex-col">
        <div class="card p-4 bg-white rounded-lg shadow-lg">
            <div class="font-semibold text-xl mb-6 text-gray-800">Lista de Socios</div>

            <DataTable
                :value="customers3"
                rowGroupMode="subheader"
                groupRowsBy="nombre_socio"
                sortMode="single"
                sortField="nombre_socio"
                :sortOrder="1"
                scrollable
                scrollHeight="700px"
                tableStyle="min-width: 50rem"
            >
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
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
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
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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

