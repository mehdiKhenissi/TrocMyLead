<script setup>
import { ref, reactive, onBeforeMount, onMounted, defineEmits, inject } from 'vue'
import AlertComponent from '@/components/various/AlertComponent.vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  stringContains,
  formatDateToISOString
} from '@/assets/js/customFunctions.js'
import ModalEnterpriseComponent from '@/components/admin/modals/ModalEnterpriseComponent.vue'
import { FilterMatchMode } from 'primevue/api'

/** INJECT */
const accountService = inject('accountService')
const enterpriseService = inject('enterpriseService')
const tooglePageLoading = inject('tooglePageLoading')

const emit = defineEmits(['toogle-page-loading', 'is-logged-in'])

/** LEAD LITIGE MODAL */
const show_enterprise_modal = ref(false)
function displayEnterpriseModal(display_modal = null) {
  if (display_modal == null) {
    if (show_enterprise_modal.value) {
      show_enterprise_modal.value = false
    } else {
      show_enterprise_modal.value = true
    }
  } else {
    show_enterprise_modal.value = display_modal
  }
}

/** LEAD LITIGE ITEM */
let enterprise_item_infos_datas = reactive({})
const enterpriseInfosModalKey = ref(0)
/** Display lead infos and show lead infos modal if mobile */
function displayEnterpriseItemInfos(enterprise_item_infos) {
  enterprise_item_infos_datas = enterprise_item_infos
  //console.log(enterprise_item_infos_datas);
  displayEnterpriseModal(true)
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
const list_leads_disputed = ref([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  siren: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  adresse: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  created_at: { value: null, matchMode: FilterMatchMode.IN },
  country: { value: null, matchMode: FilterMatchMode.EQUALS },
  codePostal: { value: null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS }
})
const statuses = ref(['Actif', 'Inactif'])
const loading = ref(true)
/** end table */

const getSeverity = (status) => {
  switch (status) {
    case 'Actif':
      return 'success'

    case 'Inactif':
      return 'danger'
  }
}

/** load list enterprises */
const list_enterprises_page = ref(1)
async function listEnterprisesApi() {
  await enterpriseService
    .getAllenterprises(accountService.getToken(), list_enterprises_page.value)
    .then(async (response) => {
      //console.log(response)

      await setTimeout(async () => {
        list_enterprises.value = list_enterprises.value.concat(
          response.data['hydra:member'].filter((obj) => {
            return true
          })
        )
        if (
          typeof response.data['hydra:view'] !== 'undefined' &&
          typeof response.data['hydra:view']['hydra:next'] !== 'undefined'
        ) {
          // charger les restes des données
          list_enterprises_page.value++
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
  { label: 'Liste des entreprises', route: '/admin/enterprises'}
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
            <a class="text-success" :href="href" v-bind="props.action" @click="navigate">
              <span :class="[item.icon, 'text-color']" />
              <span class="text-success font-semibold">{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else :href="item.url" :target="item.target" v-bind="props.action">
            <span class="text-color">{{ item.label }}</span>
          </a>
        </template>
      </Breadcrumb>
      <h2 class="fw-bold">Liste des entreprises</h2>
      <div class="card">
        <DataTable
          v-model:filters="filters"
          :value="list_enterprises"
          paginator
          :rows="10"
          dataKey="id"
          filterDisplay="row"
          :loading="loading"
          :globalFilterFields="[
            'siren',
            'name',
            'adresse',
            'codePostal',
            'country',
            'created_at',
            'status'
          ]"
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
          <Column :exportable="false" style="background-color: linen;" class="text-center">
            <template #body="slotProps">
              <Button
                icon="pi pi-eye"
                outlined
                rounded
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
          <Column field="siren" header="Siren" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.siren }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                type="text"
                @input="filterCallback()"
                class="p-column-filter"
                placeholder="filtre par siren"
              />
            </template>
          </Column>
          <Column header="Nom" filterField="name" style="min-width: 12rem">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <span>{{ data.name }}</span>
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
          <Column field="created_at" header="Date création" style="min-width: 12rem">
            <template #body="{ data }">
              Le {{ new Date(data.created_at).toLocaleDateString('fr') }}
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
                  (data.disabled_at == null && data.enabled_at != null) ||
                  (data.disabled_at != null &&
                    data.enabled_at != null &&
                    Date.parse(data.disabled_at) < Date.parse(data.enabled_at))
                    ? 'Actif'
                    : 'Inactif'
                "
                :severity="
                  getSeverity(
                    (data.disabled_at == null && data.enabled_at != null) ||
                      (data.disabled_at != null &&
                        data.enabled_at != null &&
                        Date.parse(data.disabled_at) < Date.parse(data.enabled_at))
                      ? 'Actif'
                      : 'Inactif'
                  )
                "
                class="fs-6"
              >
                <!-- {{ ( (data.disabled_at == null) || ( ( (data.disabled_at != null) && (Date.parse(data.disabled_at) < Date.parse(data.enabled_at)) ) ) )? 'Inactif' : 'Actif' }}  -->
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
    <ModalEnterpriseComponent
      v-if="show_enterprise_modal"
      :key="enterpriseInfosModalKey"
      @display-enterprise-modal="displayEnterpriseModal"
      :enterpriseItemInfosProps="enterprise_item_infos_datas"
    />
  </div>
</template>

<style scoped>
.p-icon-field > .p-input-icon {
  top: 25%;
}
</style>
