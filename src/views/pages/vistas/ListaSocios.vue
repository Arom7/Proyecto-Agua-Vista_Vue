<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchListaSocios } from '@/service/peticionesApi';
import { fetchListaSociosPropiedadesUsuarios } from '@/service/peticionesApi';
import { fetchRegistrarNuevoSocio } from '@/service/PeticionesApiPost';

const socios = ref(null);
const socio = ref(null);
const options = ref(['list', 'grid']);
const layout = ref('list');
const modalRegistroNuevoSocio = ref(false);
const modalRegistroNuevaPropiedad = ref(false);
const sociosListaBox = ref([]);
const propiedad = ref(null);
const submitted = ref(false);
const password = ref('');
const toast = useToast();

const loadSocios = async () => {
    const listaSocios = await fetchListaSociosPropiedadesUsuarios();
    if (listaSocios) {
        console.log('Lista de socios:', listaSocios);
        socios.value = listaSocios;
    } else {
        console.error('No se pudo obtener la lista de socios.');
    }
};

onBeforeMount(loadSocios);



/**
 * Funcion para registrar un nuevo socio
 */
async function registrarNuevoSocio() {
    try {
        submitted.value = true;
        const data = {
            nombre_socio: socio.value.nombre_socio,
            primer_apellido_socio: socio.value.primer_apellido_socio,
            segundo_apellido_socio: socio.value.segundo_apellido_socio,
            ci_socio: socio.value.ci_socio,
            email: socio.value.email,
            contrasenia: socio.value.contrasenia,
            confirmar_contrasenia: socio.value.confirmar_contrasenia
        };

        if (data.contrasenia !== data.confirmar_contrasenia) {
            throw new Error('Las contraseñas no coinciden.');
        }

        const respuesta = await fetchRegistrarNuevoSocio(data);

        if (!respuesta.status === 201) {
            throw new Error('Error al intentar registrar al nuevo socio.');
        } else {
            cerrarModalRegistroSocio();
            await loadSocios();
            toast.add({ severity: 'success', summary: 'Socio registrado', detail: 'El socio se registro correctamente.', life: 5000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Ups, sucedio un error a la hora de registrar el socio', detail: 'Error al intentar registrar al nuevo socio.', life: 3000 });
        console.error('Se produjo un error:', error.message, error.errores);
    }
}

async function obtenerSocios() {
    try {
        const response = await fetchListaSocios();
        sociosListaBox.value = response.map((item) => ({
            name: item.nombre_socio + ' ' + item.primer_apellido_socio + ' ' + item.segundo_apellido_socio,
            code: item.id
        }));
    } catch (error) {
        console.error('Se produjo un error:', error.message);
        errorMessage.value = 'Se produjo un error al extraer los datos.';
    }
}

/**
 * Funcion para abrir el modal de registro de una nueva propiedad a nombre de un socio
 */
function registrarNuevaPropiedad() {
    console.log('Registrar una nueva propiedad');
}

function abrirNuevoModalRegistroSocio() {
    modalRegistroNuevoSocio.value = true;
    socio.value = {
        nombre_socio: '',
        primer_apellido_socio: '',
        segundo_apellido_socio: '',
        ci_socio: '',
        username: '',
        email: '',
        contrasenia: '',
        confirmar_contrasenia: ''
    };
}

function abrirNuevoModalRegistroPropiedad() {
    obtenerSocios();
    modalRegistroNuevaPropiedad.value = true;
    console.log('Registrar una nueva propiedad');
}

function cerrarModalRegistroSocio() {
    modalRegistroNuevoSocio.value = false;
    submitted.value = false;
}

function cerrarModalRegistroPropiedad() {
    modalRegistroNuevaPropiedad.value = false;
    submitted.value = false;
    socio.value= null;
}
</script>

<template>
    <div class="flex flex-col">
        <div class="card p-6 rounded-lg shadow-lg">
            <div class="font-semibold text-xl text-emerald-400 m-5">Lista de Socios</div>

            <Toolbar class="mb-1">
                <template #start>
                    <Button label="Registrar un nuevo socio" icon="pi pi-plus" severity="secondary" class="mr-2" @click="abrirNuevoModalRegistroSocio" />
                    <Button label="Agregar una nueva propiedad" icon="pi pi-plus" severity="secondary" class="mr-2" @click="abrirNuevoModalRegistroPropiedad"></Button>
                </template>

                <template #end>
                    <Button label="Imprimir PDF" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable :value="socios" rowGroupMode="subheader" groupRowsBy="nombre_socio" sortMode="single" sortField="nombre_socio" :sortOrder="1" scrollable scrollHeight="590px" tableStyle="min-width: 50rem">
                <!-- Group header for each socio -->
                <template #groupheader="slotProps">
                    <div class="p-2 flex items-center gap-2 mb-1">
                        <i class="pi pi-fw pi-credit-card"></i>
                        <span class="font-medium">{{ slotProps.data.ci_socio }}</span>
                        <i class="pi pi-fw pi-user"></i>
                        <span>{{ slotProps.data.nombre_socio }} {{ slotProps.data.primer_apellido_socio }} {{ slotProps.data.segundo_apellido_socio }}</span>

                        <div v-for="(usuario, index) in slotProps.data.usuarios" :key="index" class="pt-2 px-4 mx-12 rounded-lg shadow-sm">
                            <div class="flex items-center gap-2 mb-1">
                                <span>
                                    <i class="pi pi-fw pi-id-card text-4xl"></i>
                                    <Button :label="'Username: ' + slotProps.data.usuarios[0].username" severity="Success" text />
                                </span>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Data columns -->
                <div class="grid grid-cols-4 gap-4 p-4 rounded-md mb-3">
                    <Column field="propiedades" header="Lista de propiedades" style="min-width: 150px">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.propiedades && slotProps.data.propiedades.length > 0">
                                <div v-for="(propiedad, index) in slotProps.data.propiedades" :key="index" class="pt-2 px-4 mx-12 rounded-lg shadow-sm">
                                    <div class="flex items-center gap-2 mx-5">
                                        <span>
                                            <Chip icon="pi pi-facebook" class="mr-2 mb-2"> Codigo de propiedad : {{ propiedad.id }} </Chip>
                                            <Chip icon="pi pi-facebook" class="mr-2 mb-2"> Descripcion de la propiedad : {{ propiedad.descripcion_propiedad }} </Chip>
                                            <Chip icon="pi pi-facebook" class="mr-2 mb-2"> Ubicacion : {{ propiedad.cuadra_propiedad }} </Chip>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div v-else>
                                <span> <Button label="No tiene propiedades registradas." severity="danger" text /></span>
                            </div>
                        </template>
                    </Column>
                </div>
            </DataTable>
        </div>

        <Dialog v-model:visible="modalRegistroNuevoSocio" :style="{ width: '450px' }" header="Asignar una multa a un propietario" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nombre_socio" class="block font-bold mb-3"> Nombre del socio : </label>
                    <InputText id="nombre_socio" placeholder="Ingrese el nombre del socio." v-model.trim="socio.nombre_socio" required="true" autofocus :invalid="submitted && !socio.nombre_socio" fluid />
                    <small v-if="submitted && !socio.nombre_socio" class="text-red-500">El campo es requerido.</small>
                </div>
                <div>
                    <label for="primer_apellido_socio" class="block font-bold mb-3"> Primer apellido del socio : </label>
                    <InputText id="primer_apellido_socio" placeholder="Ingrese el primer apellido del socio." v-model.trim="socio.primer_apellido_socio" required="true" autofocus :invalid="submitted && !socio.primer_apellido_socio" fluid />
                    <small v-if="submitted && !socio.primer_apellido_socio" class="text-red-500">Este campo es requerido.</small>
                </div>
                <div>
                    <label for="segundo_apellido_socio" class="block font-bold mb-3"> Segundo apellido del socio : </label>
                    <InputText id="segundo_apellido_socio" placeholder="Ingrese el segundo apellido del socio." v-model.trim="socio.segundo_apellido_socio" required="true" autofocus fluid />
                </div>
                <div>
                    <div class="font-semibold text-xl mb-6">Carnet de identidad del socio:</div>
                    <FloatLabel>
                        <InputText id="ci_socio" type="text" v-model="socio.ci_socio" class="w-3/5" />
                        <label for="ci_socio">El carnet puede contener letras</label>
                    </FloatLabel>
                    <small v-if="submitted && !socio.ci_socio" class="text-red-500 mx-2">Este campo es requerido.</small>
                </div>
                <div>
                    <div class="font-semibold text-xl mb-6">Correo o Gmail del usuario :</div>
                    <FloatLabel>
                        <InputText id="email" type="text" v-model="socio.email" class="w-full" />
                        <label for="email">El correo debe contener el formato correo@gmail.com</label>
                    </FloatLabel>
                    <small v-if="submitted && !socio.email" class="text-red-500 mx-2">Este campo es requerido.</small>
                </div>
                <div class="flex gap-4">
                    <div class="w-1/2">
                        <div class="font-semibold text-xl mb-2">Contraseña:</div>
                        <Password id="contrasenia" v-model="socio.contrasenia" placeholder="Password" :toggleMask="true" class="mb-4" fluid feedback :invalid="!socio.contrasenia"></Password>
                        <small v-if="submitted && !socio.contrasenia" class="text-red-500 mx-2">Ingrese una contraseña.</small>
                    </div>
                    <div class="w-1/2">
                        <div class="font-semibold text-xl mb-2">Confirmar contraseña:</div>
                        <Password id="contrasenia" v-model="socio.confirmar_contrasenia" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>
                        <small v-if="socio.contrasenia !== socio.confirmar_contrasenia" class="text-red-500">Las contraseñas no coinciden.</small>
                        <small v-else-if="socio.contrasenia === socio.confirmar_contrasenia && socio.contrasenia && socio.confirmar_contrasenia" class="text-green-500">Las contraseñas coinciden.</small>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarModalRegistroSocio" />
                <Button label="Guardar" icon="pi pi-check" @click="registrarNuevoSocio" />
            </template>
        </Dialog>

        <Dialog v-model:visible="modalRegistroNuevaPropiedad" :style="{ width: '450px' }" header="Asignar una multa a un propietario" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre del socio: </label>
                    <Listbox v-model="socio" :options="sociosListaBox" optionLabel="name" :filter="true" />
                    <Message severity="secondary" v-if="socio">Socio seleccionado: {{ socio.name }}</Message>
                </div>
                <div>
                    <label for="nombre" class="block font-bold mb-3">Cuadra (Reformular tabla, id debe ser ingresado con formato de string): </label>
                    <InputText type="text" placeholder="Default" fluid/>
                </div>
                <div>
                    <label for="descripcion_propiedad" class="block font-bold mb-3">Descripcion de la propiedad : </label>
                    <Textarea placeholder="Registra la descripcion de la propiedad. Considere los detalles de esta." :autoResize="true" rows="2" cols="30" fluid/>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarModalRegistroPropiedad" />
                <Button label="Guardar" icon="pi pi-check" @click="registrarNuevaPropiedad" />
            </template>
        </Dialog>
    </div>
</template>
