<script setup>
import { ref, reactive, onBeforeMount, onMounted, defineEmits, inject } from 'vue'
import AlertComponent from '@/components/various/AlertComponent.vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  stringContains
} from '@/assets/js/customFunctions.js'
import ModalLeadLitigeComponent from '@/components/admin/modals/ModalLeadLitigeComponent.vue'
import { FilterMatchMode } from 'primevue/api'

/** INJECT */
const accountService = inject('accountService')
const litigeService = inject('litigeService')
const tooglePageLoading = inject('tooglePageLoading')

const emit = defineEmits(['toogle-page-loading', 'is-logged-in'])

/** table */
const list_leads_disputed = ref([])
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  commentary: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  created_at: { value: null, matchMode: FilterMatchMode.IN },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
  verified: { value: null, matchMode: FilterMatchMode.EQUALS }
})
const statuses = ref(['waiting', 'checking', 'valid', 'denied'])
const loading = ref(true)
/** end table */

/** LEAD LITIGE MODAL */
const show_lead_litige_modal = ref(false)
function displayLeadLitigeCheckingModal(display_modal = null) {
  if (display_modal == null) {
    if (show_lead_litige_modal.value) {
      show_lead_litige_modal.value = false
    } else {
      show_lead_litige_modal.value = true
    }
  } else {
    show_lead_litige_modal.value = display_modal
  }
}
let lead_litige_item_infos_datas = reactive({})
function displayLeadLitigeItemInfos(data) {
  //console.log(data)
  lead_litige_item_infos_datas = data
  displayLeadLitigeCheckingModal(true)
}

/** load list litiges */
const list_litiges_page = ref(1)
async function listLitigesApi() {
  await litigeService
    .getAllLitiges(accountService.getToken(), list_litiges_page.value)
    .then(async (response) => {
      //console.log(response)

      await setTimeout(async () => {
        list_leads_disputed.value = list_leads_disputed.value.concat(
          response.data['hydra:member'].filter((obj) => {
            return true
          })
        )
        if (
          typeof response.data['hydra:view'] !== 'undefined' &&
          typeof response.data['hydra:view']['hydra:next'] !== 'undefined'
        ) {
          // charger les restes des données
          list_litiges_page.value++
          listLitigesApi()
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

onMounted(async () => {
  listLitigesApi()
})

const getCustomers = (data) => {
  return [...(data || [])].map((d) => {
    d.date = new Date(d.date)

    return d
  })
}
const formatDate = (value) => {
  return value.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
const formatCurrency = (value) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
const getSeverity = (status) => {
  switch (status) {
    case 'denied':
      return 'danger'

    case 'valid':
      return 'success'

    case 'checking':
      return 'warning'

    case 'waiting':
      return 'secondary'

    case 'renewal':
      return null
  }
}

const getStatusFr = (status) => {
  switch (status) {
    case 'denied':
      return 'Refuser'

    case 'valid':
      return 'valider'

    case 'checking':
      return 'En cours de vérification'

    case 'waiting':
      return 'En attente'
  }
}

/** breadcrumb */
const home = ref({
  label: 'Accueil',
  icon: 'pi pi-home',
  route: '/admin'
})
const items = ref([{ label: 'Liste des litiges', route: '/admin/leads/litiges' }])
/** end breadcrumb */
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
      <h2 class="fw-bold">Liste des litiges</h2>
      <div class="card">
        <DataTable
          v-model:filters="filters"
          :value="list_leads_disputed"
          paginator
          :rows="10"
          dataKey="id"
          filterDisplay="row"
          :loading="loading"
          :globalFilterFields="['name', 'commentary', 'representative.name', 'status']"
        >
          <template #header>
            <div class="flex justify-content-end">
              <IconField iconPosition="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Recherche par mot clé" />
              </IconField>
            </div>
          </template>
          <template #empty> Aucun litige trouvé. </template>
          <template #loading> Chargement des données. Veuillez patienter. </template>
          <Column :exportable="false" style="background-color: linen;" class="text-center">
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                outlined
                rounded
                class="mr-2 text-white border"
                :class="
                  'bg-' +
                  getSeverity(
                    slotProps.data.status != 'closed'
                      ? slotProps.data.status
                      : slotProps.data.lead.status
                  )
                "
                @click="displayLeadLitigeItemInfos(slotProps.data)"
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
          <Column field="name" header="Nom complet" style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.lead.firstname }} {{ data.lead.name }}
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
          <Column header="Description" filterField="commentary" style="min-width: 12rem">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <img
                  alt="flag"
                  src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                  style="width: 24px"
                />
                <span class="lead-litige-commentary">{{ data.commentary }}</span>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                type="text"
                @input="filterCallback()"
                class="p-column-filter"
                placeholder="Recherche par description"
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
                :value="data.status != 'closed' ? data.status : data.lead.status"
                :severity="getSeverity(data.status != 'closed' ? data.status : data.lead.status)"
                class="fs-6"
                >{{ getStatusFr(data.status != 'closed' ? data.status : data.lead.status) }}</Tag
              >
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
  </div>

  <!-- LEAD LITIGE MODAL -->
  <ModalLeadLitigeComponent
    v-if="show_lead_litige_modal"
    :key="leadLitigeInfosModalKey"
    @display-lead-litige-checking-modal="displayLeadLitigeCheckingModal"
    :leadLitigeItemInfosProps="lead_litige_item_infos_datas"
  />
</template>

<style scoped>
.p-icon-field > .p-input-icon {
  top: 25%;
}

td .lead-litige-commentary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
