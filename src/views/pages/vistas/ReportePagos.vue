<script setup>
import { FilterMatchMode } from '@primevue/core/api';
import { onBeforeMount, watch, ref } from 'vue';
import { fetchListaSociosPagos } from '@/service/reportesApi';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(false);
const sociosRecibos = ref([]);
const now = new Date();
const fechaInicio = ref(new Date(now.getFullYear(), now.getMonth() - 1, 1));
const fechaFin = ref(new Date(now.getFullYear(), now.getMonth(), 0));

// varaible de busqueda
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

async function load() {
    loading.value = true;
    await listaSocioRecibos();
    setTimeout(() => (loading.value = false), 1000);
}

//Funciones para la carga de datos de socios y recibos
async function listaSocioRecibos() {
    const fechaInicioFormatted = fechaInicio.value.toISOString().slice(0, 10);
    const fechaFinFormatted = fechaFin.value.toISOString().slice(0, 10);
    const listaSocios = await fetchListaSociosPagos(fechaInicioFormatted, fechaFinFormatted);
    if (listaSocios) {
        sociosRecibos.value = listaSocios;
    } else {
        toast.add({ severity: 'error', summary: 'Falla al obtener la lista de socios y recibos', detail: 'No se pudo obtener la lista de socios y recibos.', life: 5000 });
        console.error('No se pudo obtener la lista de multas.');
    }
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
</script>

<template>
    <Toolbar>
        <template #start>
            <div className="card">
                <div class="font-semibold text-xl mb-4">Reporte de pagos</div>
                <div class="font-semibold text-xl my-6"><Message severity="success">Selecciones el rango de fechas para la busqueda de reportes de pagos.</Message></div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="font-semibold text-xm my-2">Fecha de inicio:</div>
                    <DatePicker id="fechaInicio" class="w-72 mb-1" v-model="fechaInicio" :showIcon="true" :showButtonBar="true" dateFormat="yy-mm-dd"></DatePicker>

                    <div class="font-semibold text-xm my-2">Fecha final :</div>
                    <DatePicker id="fechaFin" class="w-72 mb-1" v-model="fechaFin" :showIcon="true" :showButtonBar="true" dateFormat="yy-mm-dd"></DatePicker>

                    <Button type="button" class="mr-3 mb-1" label="Search" icon="pi pi-search" iconPos="right" :loading="loading" @click="load()" />
                </div>
            </div>
        </template>
    </Toolbar>

    <div class="card p-7">
        <DataTable
            ref="dt"
            :value="sociosRecibos"
            groupRowsBy="nombre_socio"
            scrollable
            scrollHeight="500px"
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

                    <h4 class="m-0 font-bold"> <i class="pi pi-home"></i> Lista de socios y sus propiedades</h4>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                    </IconField>
                </div>
            </template>

            <Column field="nombre_socio" header="Nombre del socio o representante" style="width: 250px">
                <template #groupheader="slotProps">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-fw pi-credit-card text-blue-700"></i>
                        <span class="font-medium text-gray-700">{{ slotProps.data.ci_socio }}</span>
                        <i class="pi pi-fw pi-user text-blue-700"></i>
                        <span
                            ><Message severity="info">{{ slotProps.data.nombre_socio }}</Message></span
                        >
                    </div>
                </template>
            </Column>
            <Column field="propiedades" header="Lista de deudas organizadas por propiedad" style="min-width: 00px">
                <template #body="slotProps">
                    <div v-if="slotProps.data.propiedades && slotProps.data.propiedades.length > 0">
                        <div v-for="(propiedad, index) in slotProps.data.propiedades" :key="index">
                            <div class="flex items-center gap-2 mb-2">
                                <span
                                    ><Message severity="secondary">{{ propiedad.id }} </Message></span
                                >
                                <span
                                    ><Message severity="secondary">{{ propiedad.descripcion_propiedad }}</Message></span
                                >
                            </div>
                            <div v-if="propiedad.recibos && propiedad.recibos.length">
                                <div class="recibo-header mb-2">
                                    <div># de Recibo</div>
                                    <div>Total de recibo</div>
                                    <div>Estado de pago</div>
                                </div>
                                <div v-for="(recibo, reciboIndex) in propiedad.recibos" :key="reciboIndex" class="recibo-item mb-2">
                                    <div>{{ recibo.id }}</div>
                                    <div>{{ recibo.total }}</div>
                                    <div>
                                        <Tag :value="recibo.estado_pago == 1 ? 'Pagado' : 'Endeudado'" :severity="getEstadoLabel(recibo.estado_pago)" />
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3" v-else>
                                <Button label="No se tiene recibos registrados" severity="danger" text />
                            </div>
                        </div>
                    </div>
                    <div class="mb-3" v-else>
                        <Button label="No se tiene propiedades ni recibos registrados" severity="danger" text />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.recibo-header,
.recibo-item {
    display: flex;
    justify-content: space-between;
}

.recibo-header {
    font-weight: bold;
}
</style>
