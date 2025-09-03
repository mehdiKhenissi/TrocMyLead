<script setup>
import { ref, reactive, onMounted, onBeforeMount, inject } from 'vue'
import LeadItemComponent from '@/components/items/LeadItemComponent.vue'
import LeadItemInfosComponent from '@/components/items/LeadItemInfosComponent.vue'
import LeadItemInfosModalComponent from '@/components/items/LeadItemInfosModalComponent.vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  stringContains
} from '@/assets/js/customFunctions.js'
import LeadDeniedModalComponent from '@/components/account/my_leads_modals/LeadDeniedModalComponent.vue'
import LeadCheckingModalComponent from '@/components/account/my_leads_modals/LeadCheckingModalComponent.vue'
import UpdateLeadModalComponent from '@/components/account/my_leads_modals/UpdateLeadModalComponent.vue'
import router from '@/router'

const imgs_parent_dir = ((process.env.NODE_ENV)=='development')?'/src/assets':'/assets'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const sellService = inject('sellService')
const tooglePageLoading = inject('tooglePageLoading')

/** parent datas */
const parentDatas = defineProps({
  searchedLeads: String
})
//console.log(parentDatas.searchedLeads)

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

let lead_item_infos_datas = reactive({})
const lead_item_infos_show = ref(false)

/** ENABLE LEAD */
async function enableLead() {
  tooglePageLoading(true)
  if (confirm('Êtes-vou sur de vouloir activer ce lead?')) {
    await leadService
      .updateLead(accountService.getToken(), {
        id: lead_item_infos_datas.lead_id,
        status: 'to_sell',
        disabledAt: null
      })
      .then(async (res) => {
        if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
          tooglePageLoading(false)
          // isAlertShowed.value = true
          // alertParams.value.type = 'alert-success text-center'
          // alertParams.value.message = 'Lead validé avec succès.'
          //$(document).find('body').addClass('disable-actions')
          window.location.reload(true)
          //router.push('/account/status-leads#selled')
        }
      })
      .catch(async (err) => {
        // isAlertShowed.value = true
        // alertParams.value.type = 'alert-danger text-center'
        // alertParams.value.message =
        //   'Erreur soumission de votre reclamation, veuillez ressayer plus tard ou contacter le support technique'
        tooglePageLoading(false)
        alert(
          "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le support technique"
        )
      })
  } else {
    tooglePageLoading(false)
  }
}

/** DISABLE LEAD */
async function disableLead() {
  tooglePageLoading(true)
  if (confirm('Êtes-vou sur de vouloir désactiver ce lead?')) {
    await leadService
      .updateLead(accountService.getToken(), {
        id: lead_item_infos_datas.lead_id,
        status: 'disabled',
        disabledAt: new Date()
      })
      .then(async (res) => {
        if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
          tooglePageLoading(false)
          // isAlertShowed.value = true
          // alertParams.value.type = 'alert-success text-center'
          // alertParams.value.message = 'Lead validé avec succès.'
          //$(document).find('body').addClass('disable-actions')
          //router.push('/account/status-leads#selled')
          window.location.reload(true)
        }
      })
      .catch(async (err) => {
        console.log(err)
        // isAlertShowed.value = true
        // alertParams.value.type = 'alert-danger text-center'
        // alertParams.value.message =
        //   'Erreur soumission de votre reclamation, veuillez ressayer plus tard ou contacter le support technique'
        tooglePageLoading(false)
        alert(
          "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le support technique"
        )
      })
  } else {
    tooglePageLoading(false)
  }
}

/** LEAD DENIED MODAL */
const show_lead_denied_modal = ref(false)
function displayLeadDeniedModal() {
  if (show_lead_denied_modal.value) {
    show_lead_denied_modal.value = false
  } else {
    show_lead_denied_modal.value = true
  }
}

/** LEAD CHECKING MODAL */
const show_lead_checking_modal = ref(false)
function displayLeadCheckingModal() {
  if (show_lead_checking_modal.value) {
    show_lead_checking_modal.value = false
  } else {
    show_lead_checking_modal.value = true
  }
}

/** LEAD UPDATE MODAL */
const lead_full_infos = ref(null)
const show_update_lead_modal = ref(false)
function displayUpdateLeadModal() {
  lead_full_infos.value = list_leads_selled.value[leadInfosModalKey.value]
  console.log(lead_full_infos.value)
  if (show_update_lead_modal.value) {
    show_update_lead_modal.value = false
  } else {
    show_update_lead_modal.value = true
  }
}

/** LEAD ITEM */
let show_lead_infos_modal = ref(false)
const leadInfosModalKey = ref(0)
/** Display lead infos and show lead infos modal if mobile */
function displayLeadItemInfos(lead_item_key) {
  let lead_item_selected_infos = list_leads_selled.value[lead_item_key]
  leadInfosModalKey.value = lead_item_key
  /** if mobile */
  if (window.innerWidth < 991) {
    if (show_lead_infos_modal.value) {
      show_lead_infos_modal.value = false
    } else {
      show_lead_infos_modal.value = true
    }
  }

  if (typeof lead_item_selected_infos != 'undefined') {
    let leadDateStart = new Date(lead_item_selected_infos.min_date)
    let leadDatedepot = new Date(lead_item_selected_infos.created_at)
    let leadDateDisabledAt = new Date(lead_item_selected_infos.disabled_at)
    lead_item_infos_datas = {
      lead_picto:
        imgs_parent_dir+'/pictos/activity/' + simplifiedStr(lead_item_selected_infos.activity) + '.svg',
      lead_id: lead_item_selected_infos.id,
      lead_id_api: lead_item_selected_infos['@id'],
      lead_activity_title: lead_item_selected_infos.activity,
      lead_localisation: lead_item_selected_infos.postalCode,
      lead_enterprise: JSON.parse(accountService.getSessionUser()).enterprise,
      lead_date_start: leadDateStart.toLocaleDateString('fr'),
      lead_date_depot: leadDatedepot.toLocaleDateString('fr'),
      lead_date_disabled_at: leadDateDisabledAt.toLocaleDateString('fr'),
      lead_name: lead_item_selected_infos.firstname + ' ' + lead_item_selected_infos.name,
      lead_phone: lead_item_selected_infos.phone,
      lead_adress: lead_item_selected_infos.address,
      lead_email: lead_item_selected_infos.email,
      lead_description: lead_item_selected_infos.commentary,
      lead_price: lead_item_selected_infos.pricingToSeller,
      lead_price_tpl: lead_item_selected_infos.pricingToTpl,
      lead_status: lead_item_selected_infos.status,
      lead_buyer_enterprise:
        typeof lead_item_selected_infos.sell != 'undefined'
          ? lead_item_selected_infos.sell.buyer_enterprise
          : {},
      lead_litige: lead_item_selected_infos.litige,
      lead_denied_price: 0
    }
  }
}

/** API */
// List leads
let list_leads_selled = ref([])
const page = ref(1)
const loading_more = ref(false)
const loading_more_spinner_showed = ref(false)

const loadMore = async () => {
  if (!loading_more.value) {
    loading_more.value = true
    loading_more_spinner_showed.value = true //show loading more spinner

    await leadService
      .getUserLeads(accountService.getToken(), page.value)
      .then(async (response) => {
        //emit('toogle-page-loading', false)
        //console.log(response)

        await setTimeout(async () => {
          //console.log( formatTimestampToDateString(new Date(new Date('2024-01-04 10:47:51').toLocaleDateString('fr')).getTime()/1000) > formatTimestampToDateString(new Date('01/02/2024').getTime()/1000) );
          list_leads_selled.value = list_leads_selled.value.concat(
            response.data['hydra:member'].filter(
              (obj) => {
                if (parentDatas.searchedLeads != null && parentDatas.searchedLeads != '') {
                  /*console.log("-----------------------------------------------------------------")
                  console.log(obj)
                  console.log(parentDatas.searchedLeads)
                  console.log(obj.activity)
                  console.log( stringContains(obj.activity, parentDatas.searchedLeads) );*/
                  if (
                    stringContains(obj.commentary, parentDatas.searchedLeads) ||
                    stringContains(obj.status, parentDatas.searchedLeads) ||
                    stringContains(obj.postalCode, parentDatas.searchedLeads) ||
                    stringContains(obj.firstname, parentDatas.searchedLeads) ||
                    stringContains(obj.name, parentDatas.searchedLeads) ||
                    stringContains(obj.min_date, parentDatas.searchedLeads) ||
                    stringContains(obj.max_date, parentDatas.searchedLeads) ||
                    stringContains(obj.created_at, parentDatas.searchedLeads) ||
                    stringContains(obj.activity, parentDatas.searchedLeads) ||
                    stringContains(obj.pricingToSeller, parentDatas.searchedLeads) ||
                    stringContains(obj.phone, parentDatas.searchedLeads) ||
                    stringContains(obj.city, parentDatas.searchedLeads) ||
                    stringContains(obj.country, parentDatas.searchedLeads) ||
                    stringContains(obj.address, parentDatas.searchedLeads)
                  ) {
                    return true
                  }
                } else {
                  return true
                }
              }

              //console.log(new Date(new Date(obj.lead.disabled_at).toLocaleDateString('fr')).getTime()/1000)
              // obj.disabled_at == null ||
              // new Date(obj.disabled_at).toLocaleDateString('fr') >
              //   new Date().toLocaleDateString('fr')
            )
          )

          if (
            typeof response.data['hydra:view'] !== 'undefined' &&
            typeof response.data['hydra:view']['hydra:next'] !== 'undefined'
          ) {
            page.value++
            loading_more.value = false
            if (list_leads_selled.value.length != 10) {
              await loadMore()
            } else {
              loading_more_spinner_showed.value = false //hide loading more spinner
            }
          } else {
            loading_more_spinner_showed.value = false //hide loading more spinner
            tooglePageLoading(false)
          }

          if (list_leads_selled.value.length && !Object.keys(lead_item_infos_datas).length) {
            let leadDateStart = new Date(list_leads_selled.value[0].min_date)
            let leadDatedepot = new Date(list_leads_selled.value[0].created_at)
            let leadDateDisabledAt = new Date(list_leads_selled.value[0].disabled_at)
            lead_item_infos_datas = {
              lead_picto:
                imgs_parent_dir+'/pictos/activity/' +
                simplifiedStr(list_leads_selled.value[0].activity) +
                '.svg',
              lead_id: list_leads_selled.value[0].id,
              lead_id_api: list_leads_selled.value[0]['@id'],
              lead_activity_title: list_leads_selled.value[0].activity,
              lead_localisation: list_leads_selled.value[0].postalCode,
              lead_enterprise: JSON.parse(accountService.getSessionUser()).enterprise,
              lead_date_start: leadDateStart.toLocaleDateString('fr'),
              lead_date_depot: leadDatedepot.toLocaleDateString('fr'),
              lead_date_disabled_at: leadDateDisabledAt.toLocaleDateString('fr'),
              lead_name:
                list_leads_selled.value[0].firstname + ' ' + list_leads_selled.value[0].name,
              lead_phone: list_leads_selled.value[0].phone,
              lead_adress: list_leads_selled.value[0].address,
              lead_email: list_leads_selled.value[0].email,
              lead_description: list_leads_selled.value[0].commentary,
              lead_price: list_leads_selled.value[0].pricingToSeller,
              lead_price_tpl: list_leads_selled.value[0].pricingToTpl,
              lead_status: list_leads_selled.value[0].status,
              lead_buyer_enterprise:
                typeof list_leads_selled.value[0].sell != 'undefined'
                  ? list_leads_selled.value[0].sell.buyer_enterprise
                  : {},
              lead_litige: list_leads_selled.value[0].litige,
              lead_denied_price: 0
            }

            lead_item_infos_show.value = true
          }

          if (parentDatas.searchedLeads == null || parentDatas.searchedLeads == '') {
            tooglePageLoading(false)
          }
        }, 500)
      })
      .catch((err) => {
        emit('toogle-page-loading', false)
        console.log(err)
      })
  }
}

const handleScroll = () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
    !loading_more.value
  ) {
    loadMore()
  }
}

onBeforeMount(async () => {
  tooglePageLoading(true)
})

onMounted(async () => {
  //window.location.href = '/account/status-leads#selled'
  window.addEventListener('scroll', handleScroll)
  await loadMore()
  //tooglePageLoading(false)
})
</script>

<template>
  <!-- Liste des leads -->
  <div class="row mt-5" v-if="list_leads_selled.length">
    <!-- LEADS ITEMS -->
    <div class="col-lg-4 d-flex flex-column bloc-leads-items-list position-relative">
      <LeadItemComponent
        v-for="(lead_selled_item, idx_list_lead_selled) in list_leads_selled"
        :key="idx_list_lead_selled"
        @click="displayLeadItemInfos(idx_list_lead_selled)"
        :color-status-lead="{
          'bg-green': lead_selled_item.status == 'reserved',
          'bg-green bg-gradient': lead_selled_item.status == 'to_sell',
          'bg-tml-yellow': lead_selled_item.status == 'checking',
          'bg-tml-green': lead_selled_item.status == 'valid',
          'bg-tml-red': lead_selled_item.status == 'denied',
          'bg-secondary': lead_selled_item.status == 'disabled'
        }"
        :class="{'lead-item-actif':(lead_item_infos_datas.lead_id == lead_selled_item.id)}"
      >
        <template #lead-item-picto>
          <img
            :src="
              imgs_parent_dir+'/pictos/activity/' + simplifiedStr(lead_selled_item.activity) + '.svg'
            "
            class="w-100 invert"
          />
        </template>
        <template #lead-item-heading>
          <p class="fw-bold mb-1">
            {{ lead_selled_item.activity }}
          </p>
          <p
            class="fw-bold fs-4 align-self-end mb-1"
            :class="{
              'color-green':
                lead_selled_item.status == 'reserved' || lead_selled_item.status == 'to_sell',
              'color-tml-yellow': lead_selled_item.status == 'checking',
              'color-tml-green': lead_selled_item.status == 'valid',
              'color-tml-red': lead_selled_item.status == 'denied',
              'text-secondary': lead_selled_item.status == 'disabled'
            }"
          >
            <b class="color-tml-red fs-3" v-if="lead_selled_item.status == 'denied'"
              >0<b>€</b> </b>
            <b v-else>{{ lead_selled_item.pricingToSeller }}€ </b>
          </p>
        </template>
        <template #lead-item-content>
          <p class="m-0">Localisation {{ lead_selled_item.postal_code }}</p>
          <p class="mb-2">A commencer avant le 20/01/2024</p>
          <p class="mb-2"></p>
          <p class="mb-0" v-if="lead_selled_item.status == 'reserved'">
            <b>Statut:</b> En attente de validation de l'acheteur
          </p>
          <p class="mb-0" v-if="lead_selled_item.status == 'checking'">
            <b>Statut:</b> Vérification litige
          </p>
          <p class="mb-0" v-if="lead_selled_item.status == 'valid'"><b>Statut:</b> Valide</p>
          <p class="mb-0" v-if="lead_selled_item.status == 'denied'"><b>Statut:</b> Refusée</p>
          <p class="mb-0" v-if="lead_selled_item.status == 'to_sell'">
            <b>Statut:</b> Mis en vente
          </p>
          <p class="mb-0" v-if="lead_selled_item.status == 'disabled'"><b>Statut:</b> Désactiver</p>
        </template>
      </LeadItemComponent>

      <div
        class="text-center"
        style=""
        v-if="loading_more_spinner_showed"
        :class="{ 'pt-3': loading_more_spinner_showed }"
      >
        Chargement des données... <label class="troc-my-lead-spinner align-middle"></label>
      </div>
    </div>

    <!-- LEAD ITEM FULL INFOS COMPONENET -->
    <div
      class="col-lg-8 d-lg-inline-block d-none bloc-lead-item-max-infos border-tml position-sticky mt-lg-0 mt-5 p-0"
      style="height: 600px; top: 5.5rem"
      :style="!lead_item_infos_show ? { 'background-color': 'rgba(33, 160, 133, 0.6)' } : {}"
    >
      <LeadItemInfosComponent
        v-if="lead_item_infos_show"
        :key="leadInfosModalKey"
        @display-lead-denied-modal="displayLeadDeniedModal"
        @display-lead-checking-modal="displayLeadCheckingModal"
        @enable-lead="enableLead"
        @disable-lead="disableLead"
        @display-update-lead-modal="displayUpdateLeadModal"
        :leadItemInfosProps="lead_item_infos_datas"
        :lead-full-infos="true"
        :leads-selled-list="true"
      />
    </div>

    <!-- LEAD ITEM FULL INFOS MODAL COMPONENET -->
    <!-- Modal -->
    <LeadItemInfosModalComponent
      v-if="show_lead_infos_modal"
      @display-lead-item-infos="displayLeadItemInfos"
      @display-lead-denied-modal="displayLeadDeniedModal"
      @display-lead-checking-modal="displayLeadCheckingModal"
      @display-update-lead-modal="displayUpdateLeadModal"
      @enable-lead="enableLead"
      @disable-lead="disableLead"
      :leadItemInfosProps="lead_item_infos_datas"
      :lead-full-infos="true"
      :leads-selled-list="true"
    />

    <!-- LEAD DENIED MODAL -->
    <LeadDeniedModalComponent
      v-if="show_lead_denied_modal"
      :key="leadInfosModalKey"
      @display-lead-denied-modal="displayLeadDeniedModal"
      :leadItemInfosProps="lead_item_infos_datas"
      :show-charge-service="false"
    />

    <!-- LEAD CHECKING MODAL -->
    <LeadCheckingModalComponent
      v-if="show_lead_checking_modal"
      :key="leadInfosModalKey"
      @display-lead-checking-modal="displayLeadCheckingModal"
      :leadItemInfosProps="lead_item_infos_datas"
    />

    <!-- LEAD UPDATE MODAL -->
    <UpdateLeadModalComponent
      v-if="show_update_lead_modal"
      :key="leadInfosModalKey"
      @display-update-lead-modal="displayUpdateLeadModal"
      :leadFullInfos="lead_full_infos"
    />
  </div>
  <div class="mt-5 py-5" v-else>
    <h3 class="text-center mt-5 py-5">
      <img src="@/assets/pictos/comments_disabled.svg" width="100" />
      Aucune données disponible
      <RouterLink :to="{ name: 'submitLead' }" class="text-decoration-none">
        <button
          type="button"
          class="btn btn-default col-md-4 col-12 my-4 ps-0 d-block m-auto p-4 btn-green text-white rounded-pill btn-troc-my-lead"
        >
          <img src="@/assets/pictos/laisser.svg" class="invert me-2" />
          <b>Déposer des prospects</b>
        </button>
      </RouterLink>
    </h3>
  </div>
</template>

<style scoped>
.bloc-leads-items-list {
  gap: 1rem;
  cursor: pointer;
}

.troc-my-lead-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #21a085 !important;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
