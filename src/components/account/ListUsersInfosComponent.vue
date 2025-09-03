<script setup>
import { ref, reactive, inject, onMounted } from 'vue'
import AlertComponent from '@/components/various/AlertComponent.vue'
import { formatTimestampToDateString, formatDateToISOString } from '@/assets/js/customFunctions.js'
import { FilterMatchMode } from 'primevue/api'

// inject from app.vue
const accountService = inject('accountService')
const userService = inject('userService')
const tooglePageLoading = inject('tooglePageLoading')

/** parent datas */
const parentDatas = defineProps({
  listUsersInfosDatas: Object
})
//console.log(parentDatas.listUsersInfosDatas)

/** parent function */
const emit = defineEmits(['toggleListUsersInfosComponent'])
const toggleListUsersInfosComponent = () => {
  emit('toggleListUsersInfosComponent', null) // Emit a custom event with data
}

/** variables */
let listUsersInfosDatas = parentDatas.listUsersInfosDatas
let imAdmin = JSON.parse(accountService.getSessionUser()).main != null ? true : false
//console.log(listUsersInfosDatas)

/** table */
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
  disabled_at: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS }
})
const statuses = ref(['Activer', 'Désactiver'])
const loading_table_list_user = ref(true)

const getSeverity = (status) => {
  switch (status) {
    case 'Désactiver':
      return 'danger'

    case 'Activer':
      return 'success'

    case 'renewal':
      return null
  }
}

/** end table */

/** modal add new user */
const modal_add_new_user_form = ref({
  enterprise: '/api/enterprises/' + JSON.parse(accountService.getSessionUser()).enterprise.id,
  firstname: null,
  name: null,
  email: null,
  phone: null,
  main: null,
  roles: ['ROLE_USER'],
  codeValidation: 'string01',
  password: null,
  confirmPassword: null,
  disabledAt: null
})

async function submitAddNewUserForm() {
  tooglePageLoading(true)
  if (modal_add_new_user_form.value.password == modal_add_new_user_form.value.confirmPassword) {
    modal_add_new_user_form.value.main = swicthCheckboxAddNewUserIsAdminChecked.value ? 1 : null
    //console.log(modal_add_new_user_form.value);
    // remove error from inputs

    /** API ADD NEW USER */
    await userService
      .createUser(modal_add_new_user_form.value)
      .then(async (response) => {
        //console.log(response)
        if (typeof response.data != 'undefined' && typeof response.data.id != 'undefined') {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-success text-center'
          alertParams.value.message = 'Nouveau utilisateur ajouter avec succès.'
          tooglePageLoading(false)
        }
      })
      .catch(async (error) => {
        console.log(error)
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger text-center'
        alertParams.value.message =
          "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le service technique."
        tooglePageLoading(false)
      })
  } else {
    $(document)
      .find('#modalAddNewUser')
      .find('.error-add-new-user-pwd')
      .removeClass('d-none')
      .html('<mall>Le mot de passe de confirmation ne correspond pas</small>')
    $(document)
      .find('#modalAddNewUser')
      .find('.inputAddNewuserPwd, .inputAddNewuserConfirmPwd')
      .addClass('border-danger')
  }
  tooglePageLoading(false)
}

async function rmErrorAddNewUserInputs() {
  $(document).find('#modalAddNewUser').find('.error-add-new-user-pwd').addClass('d-none').html('')
  $(document).find('#modalAddNewUser').find('input').removeClass('border-danger')
}

/** switch checkbox new user is admin = */
const swicthCheckboxAddNewUserIsAdminChecked = ref(false)
async function switchCheckboxAddNewUserIsAdmin() {
  if (swicthCheckboxAddNewUserIsAdminChecked.value) {
    swicthCheckboxAddNewUserIsAdminChecked.value = false
  } else {
    swicthCheckboxAddNewUserIsAdminChecked.value = true
  }
}

/** end modal add new user */

/** modal user infos datas  */
let modal_user_infos = null
const modal_user_infos_datas = ref({
  id: null,
  firstname: null,
  name: null,
  email: null,
  phone: null,
  main: null,
  enabledAt: null,
  code_validation: null,
  disabledAt: null
})
async function showModalEditUser(datas) {
  tooglePageLoading(true)
  //console.log(key_user_infos_selected);
  //let userInfosDatas = listUsersInfosDatas[key_user_infos_selected]
  let userInfosDatas = datas
  user_disabled.value =
    userInfosDatas.disabled_at == null ||
    (userInfosDatas.disabled_at && Date.parse(userInfosDatas.disabled_at) > Date.parse(new Date()))
      ? false
      : true
  swicthCheckboxAdminIsChecked.value = userInfosDatas.main ? true : false
  console.log(userInfosDatas)
  modal_user_infos_datas.value = {
    id: userInfosDatas.id,
    firstname: userInfosDatas.firstname,
    name: userInfosDatas.name,
    email: userInfosDatas.email,
    phone: userInfosDatas.phone,
    main: swicthCheckboxAdminIsChecked.value,
    enabledAt: userInfosDatas.enabled_at
      ? formatDateToISOString(new Date(userInfosDatas.enabled_at))
      : null,
    code_validation: userInfosDatas.code_validation,
    disabledAt: userInfosDatas.disabled_at
      ? formatDateToISOString(new Date(userInfosDatas.disabled_at))
      : null
  }
  //$('#modalUserInfos').modal('show')
  //console.log(modal_user_infos_datas.value)
  /** show modal */
  modal_user_infos.show()
  tooglePageLoading(false)
}

/** switch checkbox admin = */
const swicthCheckboxAdminIsChecked = ref(false)
async function switchCheckboxAdmin() {
  if (swicthCheckboxAdminIsChecked.value) {
    swicthCheckboxAdminIsChecked.value = false
  } else {
    swicthCheckboxAdminIsChecked.value = true
  }
}

/** submit update user infos */
async function submitEditUserInfosForm() {
  tooglePageLoading(true)
  isAlertShowed.value = false
  modal_user_infos_datas.value.main = modal_user_infos_datas.value.main ? 1 : null
  userService
    .updateUser(accountService.getToken(), modal_user_infos_datas.value)
    .then(async (response) => {
      //console.log(response)
      if (typeof response.data != 'undefined' && typeof response.data.id != 'undefined') {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-success text-center'
        alertParams.value.message =
          'La modification des informations utilisateur a été effectuée avec succès.'
        listUsersInfosDatas[
          listUsersInfosDatas.findIndex((item) => item['id'] === modal_user_infos_datas.value.id)
        ] = {
          enterprise:
            listUsersInfosDatas[
              listUsersInfosDatas.findIndex(
                (item) => item['id'] === modal_user_infos_datas.value.id
              )
            ].enterprise,
          disabled_at: modal_user_infos_datas.value.disabledAt,
          enabled_at: modal_user_infos_datas.value.enabledAt,
          main: modal_user_infos_datas.value.main,
          name: modal_user_infos_datas.value.name,
          firstname: modal_user_infos_datas.value.firstname,
          phone: modal_user_infos_datas.value.phone,
          email: modal_user_infos_datas.value.email,
          code_validation: modal_user_infos_datas.value.code_validation,
          id: modal_user_infos_datas.value.id
        }
        tooglePageLoading(false)
      }
    })
    .catch(async (error) => {
      console.log(error)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      alertParams.value.message =
        "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le service technique."
      tooglePageLoading(false)
    })
}

/** enabling user */
async function enablingUser() {
  tooglePageLoading(true)
  isAlertShowed.value = false
  //console.log(parentDatas.listUsersInfosDatas.findIndex(item => item['id'] === modal_user_infos_datas.value.id))
  userService
    .updateUser(accountService.getToken(), {
      id: modal_user_infos_datas.value.id,
      disabledAt: null
    })
    .then(async (response) => {
      //console.log(response)
      if (typeof response.data != 'undefined' && typeof response.data.id != 'undefined') {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-success text-center'
        alertParams.value.message = "L'utilisateur à été réactiver avec succès."
        user_disabled.value = false
        listUsersInfosDatas[
          listUsersInfosDatas.findIndex((item) => item['id'] === modal_user_infos_datas.value.id)
        ].disabled_at = null
        modal_user_infos_datas.value.disabledAt = null
        tooglePageLoading(false)
        // setTimeout(() => {
        //   location.reload(true);
        //   $(document).find('body').addClass('disable-actions')
        // }, 2000);
      }
    })
    .catch(async (error) => {
      console.log(error)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      alertParams.value.message =
        "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le service technique."
      tooglePageLoading(false)
    })
}

/** disabling user */
const user_disabled = ref(false)
async function disablingUser() {
  tooglePageLoading(true)
  isAlertShowed.value = false
  userService
    .updateUser(accountService.getToken(), {
      id: modal_user_infos_datas.value.id,
      disabledAt: formatDateToISOString(new Date())
    })
    .then(async (response) => {
      //console.log(response)
      if (typeof response.data != 'undefined' && typeof response.data.id != 'undefined') {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-success text-center'
        alertParams.value.message = "L'utilisateur a été désactiver avec succès."
        user_disabled.value = true
        listUsersInfosDatas[
          listUsersInfosDatas.findIndex((item) => item['id'] === modal_user_infos_datas.value.id)
        ].disabled_at = formatDateToISOString(new Date())
        modal_user_infos_datas.value.disabledAt = formatDateToISOString(new Date())
        tooglePageLoading(false)
      }
    })
    .catch(async (error) => {
      console.log(error)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      alertParams.value.message =
        "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le service technique."
      tooglePageLoading(false)
    })
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

/** breadcrumb */
const home = ref({
  label: 'Accueil',
  icon: 'pi pi-home',
  route: '/account'
})
const breadcrumbItems = ref([{ label: 'Liste des utilisateurs'}])
/** end breadcrumb */

onMounted(async () => {
  modal_user_infos = new bootstrap.Modal('#modalUserInfos', {})

  $('#modalUserInfos').on('hidden.bs.modal', function () {
    isAlertShowed.value = false
  })

  $('#modalAddNewUser').on('hidden.bs.modal', function () {
    isAlertShowed.value = false
  })

  loading_table_list_user.value = false
})
</script>

<template>
  <div class="row user-infos-bloc mb-5">
    <div class="row mb-5">
      <div class="col-lg-10 offset-lg-1 position-relative py-3">
        
        <Breadcrumb class="p-0" :home="home" :model="breadcrumbItems">
          <template #item="{ item, props }">
            <a
              v-if="item.route"
              class="text-success cursor-pointer"
              @click="toggleListUsersInfosComponent"
            >
              <span :class="[item.icon, 'text-color']" />
              <span class="text-success font-semibold">{{ item.label }}</span>
            </a>
            <a v-else class="text-success cursor-pointer">
              <span class="text-color">{{ item.label }}</span>
            </a>
          </template>
        </Breadcrumb>

        <button
          type="button"
          class="btn btn-danger btn-close p-2"
          @click="toggleListUsersInfosComponent"
        ></button>

        <h2 class="fw-bold">Liste des utilisateurs</h2>
        <div class="card">
          <DataTable
            v-model:filters="filters"
            :value="listUsersInfosDatas"
            paginator
            :rows="10"
            dataKey="id"
            filterDisplay="row"
            :loading="loading_table_list_user"
            :globalFilterFields="['name', 'email', 'phone', 'disabled_at', 'status']"
            showGridlines
          >
            <template #header>
              <div class="flex justify-content-end">
                <IconField iconPosition="left">
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <InputText
                    v-model="filters['global'].value"
                    placeholder="Recherche par mot clé"
                  />
                  <button
                    class="btn btn-green float-end text-white"
                    data-bs-toggle="modal"
                    data-bs-target="#modalAddNewUser"
                    :disabled="!imAdmin"
                  >
                    Ajouter un utilisateur
                  </button>
                </IconField>
              </div>
            </template>
            <template #empty> Aucun utilisateur trouvé. </template>
            <template #loading> Chargement des données. Veuillez attendre. </template>
            <Column :exportable="false" style="" class="text-center">
              <template #body="slotProps">
                <Button
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  class="mr-2 text-white border"
                  :class="
                    'bg-' +
                    (slotProps.data.disabled_at != null &&
                    Date.parse(slotProps.data.disabled_at) < Date.parse(new Date())
                      ? 'tml-red'
                      : 'green')
                  "
                  @click="showModalEditUser(slotProps.data)"
                />
              </template>
            </Column>
            <Column field="name" header="Nom complet" style="min-width: 12rem">
              <template #body="{ data }"> {{ data.firstname }} {{ data.name }} </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  @input="filterCallback()"
                  class="p-column-filter"
                  placeholder="Filtre par prénom et nom"
                />
              </template>
            </Column>
            <Column header="email" filterField="email" style="min-width: 12rem">
              <template #body="{ data }">
                <div class="flex align-items-center gap-2">
                  <span>{{ data.email }}</span>
                </div>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  @input="filterCallback()"
                  class="p-column-filter"
                  placeholder="Recherche par email"
                />
              </template>
            </Column>
            <Column field="phone" header="Téléphone" style="min-width: 12rem">
              <template #body="{ data }">
                {{ data.phone }}
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  @input="filterCallback()"
                  class="p-column-filter"
                  placeholder="Filtre par téléphone"
                />
              </template>
            </Column>
            <Column field="disabled_at" header="Date désactivation" style="min-width: 12rem">
              <template #body="{ data }">
                <p v-if="data.disabled_at != null">
                  Le {{ new Date(data.disabled_at).toLocaleDateString('fr') }}
                </p>
                <p class="text-center fs-4" v-else>ø</p>
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <InputText
                  v-model="filterModel.value"
                  type="text"
                  @input="filterCallback()"
                  class="p-column-filter"
                  placeholder="Filtre par date"
                />
              </template>
            </Column>
            <Column
              field="status"
              header="Status"
              :showFilterMenu="false"
              :filterMenuStyle="{ width: '14rem' }"
              style="min-width: 12rem"
            >
              <template #body="{ data }">
                <Tag
                  :value="
                    data.disabled_at != null &&
                    Date.parse(data.disabled_at) < Date.parse(new Date())
                      ? 'Désactiver'
                      : 'Activer'
                  "
                  :severity="
                    getSeverity(
                      data.disabled_at != null &&
                        Date.parse(data.disabled_at) < Date.parse(new Date())
                        ? 'Désactiver'
                        : 'Activer'
                    )
                  "
                  class="fs-6"
                />
              </template>
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-model="filterModel.value"
                  @change="filterCallback()"
                  :options="statuses"
                  placeholder="Filtre par status"
                  class="p-column-filter"
                  style="min-width: 12rem"
                  :showClear="true"
                >
                  <template #option="slotProps">
                    <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)"></Tag>
                  </template>
                </Dropdown>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Update user infos Modal -->
    <div class="modal fade" id="modalUserInfos" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header py-2">
            <h5 class="modal-title h3">Informations utilisateur</h5>
            <button
              type="button"
              class="btn btn-danger position-absolute"
              data-bs-dismiss="modal"
              aria-label="Close"
              style="right: 0; top: 0"
            >
              <i class="pi pi-times-circle"></i>
            </button>
          </div>
          <form @submit.prevent="submitEditUserInfosForm">
            <div class="modal-body" v-if="modal_user_infos_datas.email">
              <div class="mb-3">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="ps-1 fw-bold">Prénom</label>
                    <input
                      type="text"
                      class="form-control rounded-pill border-2"
                      :class="{ 'bg-secondary text-white': user_disabled || !imAdmin }"
                      placeholder="Prénom"
                      v-model="modal_user_infos_datas.firstname"
                      :readonly="user_disabled || !imAdmin"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="ps-1 fw-bold">Nom</label>
                    <input
                      type="text"
                      class="form-control rounded-pill border-2"
                      :class="{ 'bg-secondary text-white': user_disabled || !imAdmin }"
                      v-model="modal_user_infos_datas.name"
                      placeholder="Nom"
                      :readonly="user_disabled || !imAdmin"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Téléphone</label>
                    <input
                      type="text"
                      class="form-control rounded-pill border-2"
                      :class="{ 'bg-secondary text-white': user_disabled || !imAdmin }"
                      placeholder="Téléphone"
                      v-model="modal_user_infos_datas.phone"
                      :readonly="user_disabled || !imAdmin"
                      required
                    />
                  </div>
                  <div class="col-md-8 mb-3">
                    <label class="ps-1 fw-bold">Email</label>
                    <input
                      type="text"
                      class="form-control rounded-pill border-2"
                      :class="{ 'bg-secondary text-white': user_disabled || !imAdmin }"
                      placeholder="Email"
                      v-model="modal_user_infos_datas.email"
                      :readonly="user_disabled || !imAdmin"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Date activation</label>
                    <input
                      type="datetime-local"
                      class="form-control rounded-pill border-2 cursor-not-allowed bg-secondary text-white"
                      v-model="modal_user_infos_datas.enabledAt"
                      disabled
                      readonly
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Code validation</label>
                    <input
                      type="text"
                      class="form-control rounded-pill border-2 cursor-not-allowed bg-secondary text-white"
                      placeholder="Code validation"
                      v-model="modal_user_infos_datas.code_validation"
                      required
                      disabled
                      readonly
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Date désactivation</label>
                    <input
                      type="datetime-local"
                      class="form-control rounded-pill border-2"
                      :class="{ 'bg-secondary text-white': user_disabled || !imAdmin }"
                      v-model="modal_user_infos_datas.disabledAt"
                      :readonly="user_disabled || !imAdmin"
                    />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="form-check px-1">
                  <div
                    class="form-check form-switch"
                    v-tooltip.left="
                      'Activer pour que l\'utilisateur aura la possibilité de gérer les autres utilisateurs.'
                    "
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="flexSwitchCheckRoleAdmin"
                      v-model="modal_user_infos_datas.main"
                      :disabled="user_disabled || !imAdmin"
                      checked
                      @change="switchCheckboxAdmin"
                      style="width: 40px; height: 18px"
                    />
                    <label class="form-check-label px-1 fw-bold" for="flexSwitchCheckRoleAdmin">
                      Administrateur <i class="pi pi-info-circle"></i> <br />
                      <small
                        >Activer pour que l'utilisateur aura la possibilité de gérer les autres
                        utilisateurs.</small
                      ></label
                    >
                  </div>
                </div>
              </div>

              <!-- ALERT -->
              <AlertComponent
                v-if="isAlertShowed"
                :alert-params="{
                  additionalClasses: alertParams.type + ' col-12 m-0',
                  dismissSecs: alertParams.dismissSecs,
                  message: alertParams.message
                }"
                @toggle-alert="toggleAlert"
              />
            </div>
            <div class="modal-body m-5" v-else>Erreur chargement des données</div>
            <div class="modal-footer justify-content-between">
              <button
                type="button"
                class="btn bg-tml-red text-white disabled"
                @click="disablingUser"
                v-if="!user_disabled"
                :disabled="!imAdmin"
              >
                Désactiver
              </button>
              <button
                type="button"
                class="btn bg-tml-red text-white m-auto"
                @click="enablingUser"
                :disabled="!imAdmin"
                v-if="user_disabled"
              >
                Réactiver l'utilisateur
              </button>
              <button
                type="submit"
                class="btn bg-green text-white"
                :disabled="!imAdmin"
                v-if="!user_disabled"
              >
                Modifier
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- END Update user infos Modal -->

    <!-- Add user infos Modal -->
    <div class="modal fade" id="modalAddNewUser" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header py-2">
            <h5 class="modal-title h3">Ajouter un nouveau utilisateur</h5>
            <button
              type="button"
              class="btn btn-danger position-absolute"
              data-bs-dismiss="modal"
              aria-label="Close"
              style="right: 0; top: 0"
            >
              <i class="pi pi-times-circle"></i>
            </button>
          </div>
          <form @submit.prevent="submitAddNewUserForm">
            <div class="modal-body">
              <div class="mb-3">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Prénom</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Prénom"
                      v-model="modal_add_new_user_form.firstname"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Nom</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="modal_add_new_user_form.name"
                      placeholder="Nom"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Téléphone</label>
                    <div class="input-group">
                      <span class="input-group-text" id="basic-addon1">+33</span>
                      <input
                        type="number"
                        class="form-control"
                        placeholder="Téléphone"
                        v-model="modal_add_new_user_form.phone"
                        :readonly="user_disabled"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="row">
                  <div class="col-md-8 mb-3">
                    <label class="ps-1 fw-bold">Email</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Email"
                      v-model="modal_add_new_user_form.email"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="ps-1 fw-bold">Date désactivation</label>
                    <input
                      type="datetime-local"
                      class="form-control"
                      v-model="modal_add_new_user_form.disabledAt"
                    />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="ps-1 fw-bold">Mot de passe</label>
                    <input
                      type="password"
                      class="form-control inputAddNewuserPwd"
                      placeholder="mot de passe"
                      @keyup="rmErrorAddNewUserInputs"
                      pattern=".{4,}"
                      title="4 caractéres minimum"
                      v-model="modal_add_new_user_form.password"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="ps-1 fw-bold">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      class="form-control inputAddNewuserConfirmPwd"
                      palcehodler="Confirmer le mot de passe"
                      @keyup="rmErrorAddNewUserInputs"
                      pattern=".{4,}"
                      title="4 caractéres minimum"
                      v-model="modal_add_new_user_form.confirmPassword"
                      required
                    />
                    <div class="col-12 error-add-new-user-pwd d-none"></div>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <div class="form-check px-1">
                  <div
                    class="form-check form-switch"
                    v-tooltip.left="
                      'Activer pour que l\'utilisateur aura la possibilité de gérer les autres utilisateurs.'
                    "
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="flexSwitchCheckRoleAdmin"
                      v-model="modal_add_new_user_form.main"
                      @change="switchCheckboxAddNewUserIsAdmin"
                      style="width: 40px; height: 18px"
                    />
                    <label class="form-check-label px-1 fw-bold" for="flexSwitchCheckRoleAdmin">
                      Administrateur <i class="pi pi-info-circle"></i> <br />
                      <small
                        >Activer pour que l'utilisateur aura la possibilité de gérer les autres
                        utilisateurs.</small
                      ></label
                    >
                  </div>
                </div>
              </div>

              <!-- ALERT -->
              <AlertComponent
                v-if="isAlertShowed"
                :alert-params="{
                  additionalClasses: alertParams.type + ' col-12 m-0',
                  dismissSecs: alertParams.dismissSecs,
                  message: alertParams.message
                }"
                @toggle-alert="toggleAlert"
              />
            </div>
            <div class="modal-footer justify-content-center">
              <button type="submit" class="btn bg-green text-white" v-if="!user_disabled">
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- END Add user infos Modal -->
  </div>
</template>

<style scoped>
.user-infos-bloc .btn-close {
  position: absolute;
  right: 0;
  top: 0;
  border-radius: 0 10px;
  background-color: rgba(220, 53, 69, 1);
}

.form-check-input#flexSwitchCheckRoleAdmin:checked {
  background-color: #21a032;
  border-color: #21a032;
}

.p-icon-field > .p-input-icon {
  top: 25%;
}
</style>
