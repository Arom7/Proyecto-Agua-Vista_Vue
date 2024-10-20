<script setup>
import Password from 'primevue/password';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchReseteoPassword } from '@/service/PeticionesApiPost';

const route = useRoute();
const token = ref(route.query.token);
const email = ref(route.query.email);
const password = ref('');
const password_confirmation = ref('');
const isSubmitting = ref(false);

async function modificarContrasenia() {
    console.log('Token: ', token.value);
    console.log('Email: ', email.value);
    console.log('Password   : ', password.value);
    console.log('Password Confirmation: ', password_confirmation.value);
    isSubmitting.value = true;
    try {
        const response = await fetchReseteoPassword({ token: token.value, email: email.value, password: password.value, password_confirmation: password_confirmation.value });
        console.log('Modificando la contraseña...');
        router.replace({ path: '/auth/login' });
    } catch (error) {
        console.error('Se produjo un error:', error.message);
    } finally {
        isSubmitting.value = false;
    }
};

</script>

<template>
    <div class="flex items-center justify-center min-h-screen">
        <Card style="width: 35rem; overflow: hidden">
            <template #title> Registro de una nueva contraseña </template>
            <template #subtitle>Formulario de reseteo de contraseña</template>
            <template #content>
                <div class="py-5 px-7">
                    <div>
                        <label for="password" class="block text-surface-900 dark:text-surface-0 text-lg font-medium my-5">Ingrese su nueva contraseña: </label>
                        <Password v-model="password" toggleMask fluid />
                    </div>
                    <div>
                        <label for="password_confirmacion" class="block text-surface-900 dark:text-surface-0 text-lg font-medium my-5">Confirme su nueva contraseña : </label>
                        <Password v-model="password_confirmation" toggleMask fluid />
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex gap-4 mt-1 place-content-center py-2">
                    <Button :disabled="isSubmitting" label="Modificar la contraseña" severity="info" text raised  class="w-2/5" @click="modificarContrasenia"/>
                </div>
            </template>
        </Card>
    </div>
</template>
