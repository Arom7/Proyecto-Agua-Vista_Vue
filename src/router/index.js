import AppLayout from '@/layout/AppLayout.vue';
import Landing from '@/views/pages/Landing.vue';
import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

const token = localStorage.getItem('authToken');
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: Landing
        },
        {
            path: '/layout',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true, roles: ['lecturador', 'administrador'] }
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                },
                {
                    path: '/listaSocios',
                    name: 'listaDeSocios',
                    component: () => import('@/views/pages/vistas/ListaSocios.vue'),
                    meta: { requiresAuth: true, roles: ['lecturador', 'administrador'] }
                },
                {
                    path: '/lecturaRecibos',
                    name: 'crudRecibos',
                    component: () => import('@/views/pages/vistas/CrudRecibos.vue'),
                    meta: { requiresAuth: true, roles: ['lecturador', 'administrador'] }
                },
                {
                    path: '/multas',
                    name: 'crudMultas',
                    component: () => import('@/views/pages/vistas/CrudMultas.vue'),
                    meta: { requiresAuth: true, roles: ['administrador'] }
                },
                {
                    path: '/reportes/deudas',
                    name: 'reporteDeudas',
                    component: () => import('@/views/pages/vistas/ReporteDeudas.vue'),
                    meta: { requiresAuth: true, roles: ['administrador'] }
                },
                {
                    path: '/reportes/pagos',
                    name: 'reportePagos',
                    component: () => import('@/views/pages/vistas/ReportePagos.vue'),
                    meta: { requiresAuth: true, roles: ['administrador'] }
                },
                {
                    path: '/BombaDeAgua/PozoAgua',
                    name: 'BombadeAgua',
                    component: () => import('@/views/pages/vistas/mantenimiento/PozoBomba.vue'),
                    meta: { requiresAuth: true, roles: ['administrador'] }
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/reseteo/email',
            name: 'reseteoEmail',
            component: () => import('@/views/pages/vistas/auth/ResetEmail.vue')
        },
        {
            path: '/auth/reseteo/password',
            name: 'reseteoContraseña',
            component: () => import('@/views/pages/vistas/auth/Reset.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/vistas/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const userRoles = JSON.parse(localStorage.getItem('roles')) || [];
    console.log(token);
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (to.name !== 'login' && to.name !== 'landing' && to.name !== 'reseteoEmail' && to.name !== 'reseteoContraseña' && !token) {
            next({ name: 'login' });
        } else {
            const routeRoles = to.meta.roles;
            const hasAccess = routeRoles.some((role) => userRoles.includes(role));
            if (hasAccess) {
                next();
            } else {
                next({ name: 'Dashboard' }); // Redirigir a una página de acceso denegado o dashboard
            }
        }
    } else {
        next();
    }
});

export default router;
