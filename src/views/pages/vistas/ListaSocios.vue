<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { fetchListaSocios } from '@/service/peticionesApi';
import { fetchListaSociosPropiedadesUsuarios, fetchListaPropiedades } from '@/service/peticionesApi';
import { fetchRegistrarNuevoSocio, fetchRegistrarNuevaPropiedad } from '@/service/PeticionesApiPost';
import { fetchRegistrarCambioPropiedad } from '@/service/PeticionesApiPut';
import { useStore } from 'vuex';

const store = useStore();
const socios = ref(null);
const socio = ref(null);
const options = ref(['list', 'grid']);
const modalRegistroNuevoSocio = ref(false);
const modalRegistroNuevaPropiedad = ref(false);
const modalCambioPropiedad = ref(false);
const sociosListaBox = ref([]);
const socioCompra = ref(null);
const socioVenta = ref(null);
const propiedad = ref(null);
const propiedadCambio = ref(null);
const propiedadesValues = ref([]);
const medidor = ref(null);
const submitted = ref(false);
const password = ref('');
const toast = useToast();
const switchValue = ref(false);
const switchValor = ref(false);
const token = localStorage.getItem('authToken');

const loadSocios = async () => {
    const listaSocios = await fetchListaSociosPropiedadesUsuarios(token);
    if (listaSocios) {
        socios.value = listaSocios;
    } else {
        console.error('No se pudo obtener la lista de socios.');
    }
};

onBeforeMount(loadSocios);

watch(socioVenta, (newSocio) => {
    if (newSocio) {
        codigoPropiedad(newSocio.code);
    }
});

/*
    Validacion de datos - Registro Socio
*/
function validarDatosSocio() {
    const errores = [];
    const reglasnombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/;
    const reglasapellido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;
    const reglasci = /^\d+(-\d[A-Z])?$/;
    const reglascontrasenia = /^.{8,}$/;

    if (!socio.value.nombre_socio.trim()) {
        errores.push('El nombre del socio es obligatorio.');
    } else if (!reglasnombre.test(socio.value.nombre_socio)) {
        errores.push('El nombre del socio solo puede contener letras y espacios.');
    }
    if (!socio.value.primer_apellido_socio.trim()) {
        errores.push('El primer apellido del socio es obligatorio.');
    } else if (!reglasapellido.test(socio.value.primer_apellido_socio)) {
        errores.push('El apellido del socio solo puede contener letras y espacios.');
    }
    if (!socio.value.ci_socio) {
        errores.push('El CI del socio es obligatorio.');
    } else if (!reglasci.test(socio.value.ci_socio)) {
        errores.push('El CI del socio no es válido.');
    }
    if (!socio.value.email) {
        errores.push('El email del socio es obligatorio.');
    } else if (!/\S+@\S+\.\S+/.test(socio.value.email)) {
        errores.push('El email no es válido.');
    }
    if (!socio.value.contrasenia) {
        errores.push('La contraseña es obligatoria.');
    } else if (!reglascontrasenia.test(socio.value.email)) {
        errores.push('El email no es válido.');
    }
    if (socio.value.contrasenia !== socio.value.confirmar_contrasenia) {
        errores.push('Las contraseñas no coinciden.');
    }
    return errores;
}

function validarDatosCambiosPropiedad(){
    const errores = [];
    if (!socioCompra.value) {
        errores.push('El socio comprador es obligatorio.');
    }else if(socioCompra.value.code === socioVenta.value.code){
        errores.push('El propietario es el mismo.');
    }
    if (!socioVenta.value) {
        errores.push('El socio vendedor es obligatorio.');
    }
    if (!propiedadCambio.value) {
        errores.push('La propiedad es obligatoria.');
    }

    return errores;
}

/*
    Validacion de datos - Registro Socio
*/
function validarDatosPropiedad() {
    const errores = [];
    const reglasTexto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,\-]+([ ]+[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,\-]+)*$/;
    const reglasCodigoPropiedad = /^[a-zA-Z]+-\d+$/;

    if (!socio.value) {
        errores.push('El socio es requerido.');
    }
    if (!propiedad.value.id.trim()) {
        errores.push('El codigo de propiedad es requerido.');
    } else if (!reglasCodigoPropiedad.test(propiedad.value.id)) {
        errores.push('Valor invalido, ingrese como los siguientes ejemplos : A-1 , B-3 , C-12.');
    }
    if (!propiedad.value.direccion_propiedad.trim()) {
        errores.push('La direccion de la propiedad es requerida.');
    } else if (!reglasTexto.test(propiedad.value.direccion_propiedad)) {
        errores.push('Solo se aceptan los caracteres alfanumericos en la direccion.');
    }
    if (!reglasTexto.test(propiedad.value.descripcion_propiedad)) {
        errores.push('Solo se aceptan los caracteres alfanumericos en la descripcion.');
    }
    if (propiedad.value.total_multas_propiedad < -1) {
        errores.push('El total de multas de la propiedad es requerido.');
    }
    if (!medidor.value.id_medidor) {
        errores.push('El codigo del medidor es requerido.');
    }
    if (switchValue.value && !medidor.value.lectura) {
        errores.push('La lectura del medidor es requerida.');
    }
    return errores;
}

/**
 * Funcion para registrar un nuevo socio
 */
async function registrarNuevoSocio() {
    const errores = validarDatosSocio();
    if (errores.length > 0) {
        toast.add({ severity: 'error', summary: 'Error en la validacion de los datos del socio', detail: errores.join(' '), life: 7000 });
        modalRegistroNuevoSocio.value = false;
        return;
    }
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
        const respuesta = await fetchRegistrarNuevoSocio(data, token);

        if (!respuesta.status) {
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
        const response = await fetchListaSocios(token);
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
async function registrarNuevaPropiedad() {
    const errores = validarDatosPropiedad();
    if (errores.length > 0) {
        toast.add({ severity: 'error', summary: 'Error en la validacion de los datos del socio', detail: errores.join(' '), life: 7000 });
        return;
    }
    try {
        submitted.value = true;
        const data = {
            id: propiedad.value.id,
            socio_id: socio.value.code,
            direccion_propiedad: propiedad.value.direccion_propiedad,
            total_multas_propiedad: propiedad.value.total_multas_propiedad,
            descripcion_propiedad: propiedad.value.descripcion_propiedad,
            id_medidor: medidor.value.id_medidor,
            lectura: medidor.value.lectura
        };
        if (!data.lectura) {
            data.lectura = 0;
        }
        if (!data.total_multas_propiedad) {
            data.total_multas_propiedad = 0;
        }
        console.log(data);
        const response = await fetchRegistrarNuevaPropiedad(data, token);
        if (!response.status) {
            throw new Error('Error al intentar registrar al nuevo socio.');
        }
        cerrarModalRegistroPropiedad();
        await loadSocios();
        toast.add({ severity: 'success', summary: 'La propiedad fue registrada', detail: 'Se registro correctamente.', life: 5000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Ups, sucedio un error a la hora de registrar la propiedad', detail: error.message, life: 3000 });
        console.error('Se produjo un error:', error.message);
    }
}

async function registrarCambioPropiedad() {
    const errores = validarDatosCambiosPropiedad();
    if (errores.length > 0) {
        toast.add({ severity: 'error', summary: 'Error en la validacion, campos requeridos', detail: errores.join(' '), life: 7000 });
        return;
    }
    try{
        const data = {
            socio_compra: socioCompra.value.code,
            socio_venta: socioVenta.value.code,
            propiedad: propiedadCambio.value.codigo_propiedad
        };
        console.log(data);
        const response = await fetchRegistrarCambioPropiedad(data, token);
        if(response.status){
            toast.add({ severity: 'success', summary: 'Cambio de propiedad registrado', detail: 'Se registro correctamente.', life: 5000 });
            cerrarModalCambioPropiedad();
            await loadSocios();
            socioCompra.value = null;
            socioVenta.value = null;
        }else{
            throw new Error('Error al intentar registrar el cambio de propiedad.');
        }
        await loadSocios();
    }catch(error){
        toast.add({ severity: 'error', summary: 'Ups, sucedio un error a la hora de registrar la propiedad', detail: error.message, life: 3000 });
        console.error('Se produjo un error:', error.message);
    }
}

const codigoPropiedad = async (socioId) => {
    try {
        const response = await fetchListaPropiedades(socioId, token);
        if (response && response.length > 0) {
            propiedadesValues.value = response.map((propiedad) => ({
                codigo_propiedad: propiedad.id
            }));
        } else {
            propiedadesValues.value = null;
        }
    } catch (error) {
        console.error('Se produjo un error:', error.message);
    }
};
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
    propiedad.value = {
        id: '',
        socio_id: null,
        descripcion_propiedad: '',
        direccion_propiedad: '',
        total_multas_propiedad: null
    };

    medidor.value = {
        id_medidor: null,
        lectura: null
    };
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
    socio.value = null;
}

function abrirModalCambioPropiedad() {
    obtenerSocios();
    modalCambioPropiedad.value = true;
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

function cerrarModalCambioPropiedad() {
    modalCambioPropiedad.value = false;
    socioCompra.value = null;
    socioVenta.value = null;
    propiedadCambio.value = null;
    submitted.value = false;
}
</script>

<template>
    <div class="flex flex-col">
        <div class="card p-6 rounded-lg shadow-lg">
            <div class="font-semibold text-xl text-emerald-400 m-5">Lista de Socios</div>

            <Toolbar class="mb-1">
                <template #start>
                    <Button label="Registrar un nuevo socio" icon="pi pi-plus" severity="secondary" class="mr-2" @click="abrirNuevoModalRegistroSocio" />
                    <Button label="Agregar una nueva propiedad" icon="pi pi-plus" severity="secondary" class="mx-2" @click="abrirNuevoModalRegistroPropiedad"></Button>
                    <Button label="Cambio de propietario" icon="pi pi-sync" severity="secondary" @click="abrirModalCambioPropiedad"></Button>
                </template>
            </Toolbar>

            <DataTable :value="socios" rowGroupMode="subheader" groupRowsBy="ci_socio" sortMode="single" sortField="nombre_socio" :sortOrder="1" scrollable scrollHeight="590px" tableStyle="min-width: 50rem">
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
                            <div v-if="slotProps.data.propiedades && slotProps.data.propiedades.length > 0" class="">
                                <div v-for="(propiedad, index) in slotProps.data.propiedades" :key="index" class="pt-2 my-2 px-4 mx-12 rounded-lg shadow-sm">
                                    <div class="flex items-center gap-2 mx-5 my-3">
                                        <span>
                                            <Chip icon="pi pi-facebook" class="mr-2 mb-2"> Codigo de propiedad : {{ propiedad.id }} </Chip>
                                            <Chip icon="pi pi-facebook" class="mr-2 mb-2"> Descripcion de la propiedad : {{ propiedad.descripcion_propiedad }} </Chip>
                                            <Chip icon="pi pi-facebook" class="mr-2 mb-2"> Ubicacion : {{ propiedad.direccion_propiedad }} </Chip>
                                        </span>
                                    </div>
                                    <hr />
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

        <Dialog v-model:visible="modalRegistroNuevoSocio" :style="{ width: '500px' }" header="Registrar un nuevo socios." :modal="true">
            <div class="flex flex-col gap-6">
                <div class="flex">
                    <div>
                        <label for="nombre_socio" class="block font-bold mb-3"> Nombre del socio : </label>
                        <InputText id="nombre_socio" placeholder="Ingrese el nombre del socio." v-model.trim="socio.nombre_socio" required="true" autofocus :invalid="submitted && !socio.nombre_socio" fluid />
                        <small v-if="submitted && !socio.nombre_socio" class="text-red-500">El campo es requerido.</small>
                    </div>
                    <div class="mx-2">
                        <label for="primer_apellido_socio" class="block font-bold mb-3"> Primer apellido : </label>
                        <InputText id="primer_apellido_socio" placeholder="Ingrese el primer apellido del socio." v-model.trim="socio.primer_apellido_socio" required="true" autofocus :invalid="submitted && !socio.primer_apellido_socio" fluid />
                        <small v-if="submitted && !socio.primer_apellido_socio" class="text-red-500">Este campo es requerido.</small>
                    </div>
                    <div>
                        <label for="segundo_apellido_socio" class="block font-bold mb-3"> Segundo apellido : </label>
                        <InputText id="segundo_apellido_socio" placeholder="Ingrese el segundo apellido del socio." v-model.trim="socio.segundo_apellido_socio" required="true" autofocus fluid />
                    </div>
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
                        <label for="email">El correo debe contener el formato correo@....com</label>
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

        <Dialog v-model:visible="modalRegistroNuevaPropiedad" :style="{ width: '450px' }" header="Registrar una nueva propiedad" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre del socio: </label>
                    <Select v-model="socio" :options="sociosListaBox" filter optionLabel="name" placeholder="Selecciona el nombre del socio" class="w-full" :invalid="socio === null" fluid>
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <div>{{ slotProps.value.name }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Select>
                </div>
                <div>
                    <label for="direccion_propiedad" class="block font-bold mb-3">Direccion de la propiedad : </label>
                    <InputText v-model="propiedad.direccion_propiedad" type="text" placeholder="Ingrese la direccion de la propiedad." fluid />
                </div>
                <div>
                    <label for="descripcion_propiedad" class="block font-bold mb-3">Descripcion de la propiedad : </label>
                    <Textarea v-model="propiedad.descripcion_propiedad" placeholder="Registra la descripcion de la propiedad. Considere los detalles los detalles y caracteristicas de esta." :autoResize="true" rows="2" cols="30" fluid />
                </div>
                <div class="flex gap-10">
                    <div>
                        <label for="cuadra_propiedad" class="block font blod mb-3">Codigo de propiedad : </label>
                        <InputText v-model="propiedad.id" mode="decimal"></InputText>
                    </div>
                    <div>
                        <label for="id_propiedad" class="block font blod mb-3"> Acumulacion de multas : </label>
                        <InputNumber v-model="propiedad.total_multas_propiedad" placeholder="Ingrese el codigo de propiedad." :min="0" fluid />
                    </div>
                </div>
                <div class="flex gap-12 text-center">
                    <div>
                        <div class="font-semibold mb-4 w-40" v-if="!switchValue">Medidor Nuevo :</div>
                        <div class="font-semibold mb-4 w-40" v-if="switchValue">Medidor Usado :</div>
                        <ToggleSwitch v-model="switchValue" />
                    </div>
                    <div>
                        <label for="id_medidor">Codigo del medidor : </label>
                        <InputNumber v-model="medidor.id_medidor" mode="decimal" placeholder="Ingrese el codigo del medidor."></InputNumber>
                    </div>
                </div>
                <div v-if="switchValue">
                    <div>
                        <label for="medida_inicial" class="m-2">Ingrese la medida recorrida del medidor : </label>
                        <InputNumber v-model="medidor.lectura" mode="decimal" placeholder="Ingrese numero enteros."></InputNumber>
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarModalRegistroPropiedad" />
                <Button label="Guardar" icon="pi pi-check" @click="registrarNuevaPropiedad" />
            </template>
        </Dialog>

        <Dialog v-model:visible="modalCambioPropiedad" :style="{ width: '500px' }" header="Cambio de propietario" :modal="true">
            <div class="flex gap-6 mr-2">
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre del propietario actual: </label>
                    <Select v-model="socioVenta" :options="sociosListaBox" filter optionLabel="name" placeholder="Selecciona el nombre del socio" class="w-full" :invalid="socio === null" fluid>
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <div>{{ slotProps.value.name }}</div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Select>
                </div>
                <div>
                    <label for="codigo_propiedad" class="block font-bold mb-3">Codigo de propiedad: </label>
                    <Select v-model.trim="propiedadCambio" :options="propiedadesValues" optionLabel="codigo_propiedad" placeholder="Select" />
                    <small v-if="submitted && !propiedadCambio" class="text-red-500">El campo es requerido.</small>
                </div>
            </div>
            <div class="mt-5">
                <label for="nombre" class="block font-bold mb-3">Nombre del nuevo propieatario: </label>
                <Select v-model="socioCompra" :options="sociosListaBox" filter optionLabel="name" placeholder="Selecciona el nombre del socio" class="w-full" :invalid="socio === null" fluid>
                    <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex items-center">
                            <div>{{ slotProps.value.name }}</div>
                        </div>
                        <span v-else>
                            {{ slotProps.placeholder }}
                        </span>
                    </template>
                    <template #option="slotProps">
                        <div class="flex items-center">
                            <div>{{ slotProps.option.name }}</div>
                        </div>
                    </template>
                </Select>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="cerrarModalCambioPropiedad" />
                <Button label="Guardar" icon="pi pi-check" @click="registrarCambioPropiedad" />
            </template>
        </Dialog>
    </div>
</template>
