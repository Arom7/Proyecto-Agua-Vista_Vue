<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Inicio', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Menu',
        items: [
            { label: 'Lista de socios', icon: 'pi pi-fw pi-id-card', to: '/listaSocios' },
            { label: 'Lecturacion de recibos', icon: 'pi pi-fw pi-align-justify', to: '/lecturaRecibos' },
            { label: 'Multas', icon: 'pi pi-fw pi-dollar', to: '/multas' },
            { label: 'Reporte de pagos', icon: 'pi pi-fw pi-file-pdf', to: '/uikit/formlayout' },
            { label: 'Reporte de deudas', icon: 'pi pi-fw pi-file-pdf', to: '/uikit/formlayout' },
            { label: 'Empty', icon: 'pi pi-fw pi-circle-off', to: '/pages/empty'},
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
