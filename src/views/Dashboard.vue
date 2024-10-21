<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';
import { fetchSolicitudCantidadSocios , fetchSolicitudCantidadPropiedades, fetchSolicitudCantidadPreAvisosEndeudados, fetchSolicitudCantidadPreAvisosPagados} from '@/service/peticionesApi';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const cantidadSocios = ref(null);
const cantidadPropiedades = ref(null);
const cantidadPreAvisosPagados = ref(null);
const cantidadPreAvisosPendientes = ref(null);
const chartData = ref();
const chartOptions = ref(null);
const token = localStorage.getItem('authToken');

onMounted( async () => {
    await Promise.all([
        consultarCantidadSocios(),
        consultarCantidadPropiedades(),
        consultarCantidadPreAvisosDeudas(),
        consultarCantidadPreAvisosPagados()
    ]);
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

async function consultarCantidadSocios() {
    cantidadSocios.value =  await fetchSolicitudCantidadSocios(token);
}

async function consultarCantidadPropiedades() {
    cantidadPropiedades.value =  await fetchSolicitudCantidadPropiedades(token);
}

async function consultarCantidadPreAvisosPagados() {
    cantidadPreAvisosPagados.value =  await fetchSolicitudCantidadPreAvisosPagados(token);
}

async function consultarCantidadPreAvisosDeudas() {
    cantidadPreAvisosPendientes.value =  await fetchSolicitudCantidadPreAvisosEndeudados(token);
}

const setChartData = () => {
    const documentStyle = getComputedStyle(document.body);
    return {

        labels: ['Total Endeudados', 'Total Pagados'],
        datasets: [
            {
                data: [cantidadPreAvisosPendientes.value, cantidadPreAvisosPagados.value],
                backgroundColor: [ documentStyle.getPropertyValue('--p-red-800') , documentStyle.getPropertyValue('--p-emerald-600')],
                hoverBackgroundColor: [ documentStyle.getPropertyValue('--p-red-500') , documentStyle.getPropertyValue('--p-emerald-400')]
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    cutout: '60%',
                    color: textColor
                }
            }
        }
    };
};

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

const events = ref([
    {
        status: 'Limpieza de aceras y calles',
        descripcion: 'Realizar la respectiva limpieza de las aceras y calles como responsabilidad como socio de la OTB.',
        date: '28/10/2020 07:30 - 10:00',
        icon: 'pi pi-home',
        color: '#00A6A6'
    },
    {
        status: 'Fecha conmemorativa al aniversario de la zona',
        date: '10/11/2024 16:00',
        descripcion: 'Celebrar el aniversario de la zona con una serie de actividades y eventos.',
        icon: 'pi pi-calendar-minus',
        color: '#F49F0A'
    },{
        status: 'Reunion de socios',
        descripcion: 'Reunión de socios para tratar temas de importancia para la OTB.',
        date: '03/12/2024 09:00',
        icon: 'pi pi-calendar-minus',
        color: '#F49F0A'
    },
    {
        status: 'Chocolata por parte de la OTB a todos los niños de la zona',
        date: '25/12/2024 09:00',
        icon: 'pi pi-building',
        color: '#00A6A6'
    }
]);

</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Socios</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ cantidadSocios }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">24 new </span>
                <span class="text-muted-color">since last visit</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Propiedades</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ cantidadPropiedades }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">%52+ </span>
                <span class="text-muted-color">since last week</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pre-Avisos Endeudados</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ cantidadPreAvisosPendientes }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">520 </span>
                <span class="text-muted-color">newly registered</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Pre-Avisos Pagados</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ cantidadPreAvisosPagados }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">85 </span>
                <span class="text-muted-color">responded</span>
            </div>
        </div>

        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Actividades del año :</div>
                <Timeline :value="events" align="alternate" class="customized-timeline">
                    <template #marker="slotProps">
                        <span class="flex w-8 h-8 items-center justify-center text-white rounded-full z-10 shadow-sm" :style="{ backgroundColor: slotProps.item.color }">
                            <i :class="slotProps.item.icon"></i>
                        </span>
                    </template>
                    <template #content="slotProps">
                        <Card class="mt-4">
                            <template #title>
                                {{ slotProps.item.status }}
                            </template>
                            <template #subtitle>
                                {{ slotProps.item.date }}
                            </template>
                            <template #content>
                                <p v-if="slotProps.item.descripcion">{{slotProps.item.descripcion}}</p>
                            </template>
                        </Card>
                    </template>
                </Timeline>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6 h-80">
            <div class="card flex-col items-center">
                <div class="font-semibold text-xl mb-4">Porcentaje de pagos y deudas</div>
                <div class="card flex justify-center">
                    <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full md:w-[30rem] "/>
                </div>
                <div>
                    <Message severity="secondary" class="p-5">Este grafico refleja la cantidad la totalidad de pre-avisos
                         cancelados o pagados en una parte de la grafica, la otra parte de la graficao representa la cantidad de pre-avisos endeudados,
                         este analisis esta realizado de forma general.</Message>
                </div>
            </div>
        </div>
    </div>
</template>
