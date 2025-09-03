<script setup>
import { ref, reactive, onBeforeMount, onMounted, defineEmits, inject } from 'vue'
import AlertComponent from '@/components/various/AlertComponent.vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  stringContains,
  formatDateToISOString
} from '@/assets/js/customFunctions.js'
import ModalUserComponent from '@/components/admin/modals/ModalUserComponent.vue'
import { FilterMatchMode } from 'primevue/api'

/** INJECT */
const accountService = inject('accountService')
const userService = inject('userService')
const tooglePageLoading = inject('tooglePageLoading')

const emit = defineEmits(['toogle-page-loading', 'is-logged-in'])

/** LEAD LITIGE MODAL */
const show_user_modal = ref(false)
function displayUserModal(display_modal = null) {
  if (display_modal == null) {
    if (show_user_modal.value) {
      show_user_modal.value = false
    } else {
      show_user_modal.value = true
    }
  } else {
    show_user_modal.value = display_modal
  }
}

/** LEAD LITIGE ITEM */
let user_item_infos_datas = reactive({})
const enterpriseInfosModalKey = ref(0)
/** Display lead infos and show lead infos modal if mobile */
function displayEnterpriseItemInfos(enterprise_item_infos) {
  user_item_infos_datas = enterprise_item_infos
  //console.log(user_item_infos_datas);
  displayUserModal(true)
}

/** SEARCH LITIGE */
async function searchEnterpriseInTableListEnterprises(event) {
  if (event.target.value != '') {
    $(document)
      .find('.table-liste-litiges tbody tr')
      .each(function () {
        let $this = $(this)
        let text_found = false

        $this.find('td').each(function () {
          console.log($(this).html())
          if ($(this).html().toLowerCase().includes(event.target.value.toLowerCase())) {
            text_found = true
          }
        })

        if (!text_found) {
          $this.addClass('d-none')
        }
      })
  } else {
    $(document).find('.table-liste-litiges tbody tr').removeClass('d-none')
  }
}

/** table */
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  created_at: { value: null, matchMode: FilterMatchMode.IN },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  roles: { value: null, matchMode: FilterMatchMode.EQUALS },
})
const statuses = ref(['ACTIF', 'INACTIF'])
const loading = ref(true)
/** end table */

const getSeverity = (status) => {
  switch (status) {
    case 'ACTIF':
      return 'success'

    case 'INACTIF':
      return 'danger'
  }
}

/** load list enterprises */
const list_users = ref([])
const list_users_page = ref(1)
async function listEnterprisesApi() {
  await userService
    .getAllUsers(accountService.getToken(), list_users_page.value)
    .then(async (response) => {
      console.log(response)

      await setTimeout(async () => {
        list_enterprises.value = list_enterprises.value.concat(
          response.data['hydra:member'].filter((obj) => {
            if( JSON.parse(accountService.getSessionUser()).id != obj.id ){
              return true
            }
          })
        )
        if (
          typeof response.data['hydra:view'] !== 'undefined' &&
          typeof response.data['hydra:view']['hydra:next'] !== 'undefined'
        ) {
          // charger les restes des données
          list_users_page.value++
          listEnterprisesApi()
        }

        tooglePageLoading(false)
        loading.value = false
      }, 500)
    })
    .catch((err) => {
      emit('toogle-page-loading', false)
      console.log(err)
    })
}

/** breadcrumb */
const home = ref({
  label: 'Accueil',
  icon: 'pi pi-home',
  route: '/admin'
})
const items = ref([
  { label: 'Liste des utilisateurs', route: '/admin/users' }
])
/** end breadcrumb */

// List enterprise
let list_enterprises = ref([])
onBeforeMount(async () => {
  tooglePageLoading(true)
})

onMounted(async () => {
  listEnterprisesApi()
  //hide page loading
  tooglePageLoading(false)
})
</script>
<template>
  <div class="row mb-5">
    <div class="col-lg-8 offset-lg-2 position-relative py-3">
      <Breadcrumb class="p-0" :home="home" :model="items">
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <span :class="[item.icon, 'text-color']" />
              <span class="text-primary font-semibold">{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <span class="text-color">{{ item.label }}</span>
          </a>
        </template>
      </Breadcrumb>
      <h2 class="fw-bold">Liste des utilisateurs</h2>
      <div class="card">
        <DataTable
          v-model:filters="filters"
          :value="list_enterprises"
          paginator
          :rows="10"
          dataKey="id"
          filterDisplay="row"
          :loading="loading"
          :globalFilterFields="['name', 'email', 'created_at', 'status', 'roles']"
        >
          <template #header>
            <div class="flex justify-content-end">
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
              </IconField>
            </div>
          </template>
          <template #empty> Aucun litige trouvé. </template>
          <template #loading> Chargement des données. Veuillez patienter. </template>
          <Column :exportable="false" class="text-center" style="background-color: linen">
            <template #body="slotProps">
              <Button
                icon="pi pi-eye"
                outlined
                rounded
                :disabled="slotProps.data.enabled_at == null"
                class="mr-2 border text-white bg-green"
                @click="displayEnterpriseItemInfos(slotProps.data)"
              />
              <!-- <Button
                icon="pi pi-trash"
                outlined
                rounded
                severity="danger"
                @click="confirmDeleteProduct(slotProps.data)"
              /> -->
            </template>
          </Column>
          <Column header="Nom" filterField="name" style="min-width: 12rem">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <span>{{ data.firstname }} {{ data.name }}</span>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                type="text"
                @input="filterCallback()"
                class="p-column-filter"
                placeholder="Filtre par nom"
              />
            </template>
          </Column>
          <Column header="Email" filterField="email" style="min-width: 12rem">
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
                placeholder="Filtre par email"
              />
            </template>
          </Column>
          <Column field="created_at" header="Date création" style="min-width: 12rem">
            <template #body="{ data }">
              Le {{ new Date(data.enabled_at).toLocaleDateString('fr') }}
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
          <Column field="roles" header="Roles" style="min-width: 12rem">
            <template #body="{ data }">
              <ul style="list-style-type:circle">
                <li v-for="role_item in data.roles" :key="role_item.id">{{ role_item }}</li>
              </ul>
              <!-- {{ (JSON.decode(data.roles)).length }} -->
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                type="text"
                @input="filterCallback()"
                class="p-column-filter"
                placeholder="Filtre par role"
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
                  (data.disabled_at == null && data.enabled_at != null) ||
                  (data.disabled_at != null &&
                    data.enabled_at != null &&
                    Date.parse(data.disabled_at) < Date.parse(data.enabled_at))
                    ? 'ACTIF'
                    : ((data.enabled_at == null)?'INACTIF: en attende de code de validation utilisateur':'INACTIF')
                "
                :severity="
                  getSeverity(
                    (data.disabled_at == null && data.enabled_at != null) ||
                      (data.disabled_at != null &&
                        data.enabled_at != null &&
                        Date.parse(data.disabled_at) < Date.parse(data.enabled_at))
                      ? 'ACTIF'
                      : 'INACTIF'
                  )
                "
                class="fs-6"
              >
              </Tag>
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
                  <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)">{{
                    getStatusFr(slotProps.option)
                  }}</Tag>
                </template>
              </Dropdown>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- LEAD LITIGE MODAL -->
    <ModalUserComponent
      v-if="show_user_modal"
      :key="enterpriseInfosModalKey"
      @display-user-modal="displayUserModal"
      :userItemInfosProps="user_item_infos_datas"
    />
  </div>
</template>

<style scoped>
.p-icon-field > .p-input-icon {
  top: 25%;
}
</style>
