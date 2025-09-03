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

const imgs_parent_dir = ((process.env.NODE_ENV)=='development')?'/src/assets':'/assets'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const sellService = inject('sellService')
const litigeService = inject('litigeService')
const tooglePageLoading = inject('tooglePageLoading')

/** parent datas */
const parentDatas = defineProps({
  searchedLeads: String
})

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
        disabled_at: null
      })
      .then(async (res) => {
        if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
          tooglePageLoading(false)
          // isAlertShowed.value = true
          // alertParams.value.type = 'alert-success text-center'
          // alertParams.value.message = 'Lead validé avec succès.'
          //$(document).find('body').addClass('disable-actions')
          window.location.reload(true)
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
        disabled_at: new Date('2011-04-11').toLocaleDateString('fr')
      })
      .then(async (res) => {
        if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
          tooglePageLoading(false)
          // isAlertShowed.value = true
          // alertParams.value.type = 'alert-success text-center'
          // alertParams.value.message = 'Lead validé avec succès.'
          //$(document).find('body').addClass('disable-actions')
          window.location.reload(true)
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
const show_update_lead_modal = ref(false)
function displayUpdateLeadModal() {
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
  let lead_item_selected_infos = list_leads_disputed.value[lead_item_key]
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
    let leadDateStart = new Date(lead_item_selected_infos.lead.min_date)
    let leadDatedepot = new Date(lead_item_selected_infos.lead.created_at)
    let leadDateDisabledAt = new Date(lead_item_selected_infos.lead.disabled_at)
    lead_item_infos_datas = {
      lead_picto:
        imgs_parent_dir+'/pictos/activity/' +
        simplifiedStr(lead_item_selected_infos.lead.activity) +
        '.svg',
      lead_id: lead_item_selected_infos.lead.id,
      lead_id_api: lead_item_selected_infos.lead['@id'],
      lead_activity_title: lead_item_selected_infos.lead.activity,
      lead_localisation: lead_item_selected_infos.lead.postalCode,
      lead_enterprise: lead_item_selected_infos.lead.enterprise,
      lead_date_start: leadDateStart.toLocaleDateString('fr'),
      lead_date_depot: leadDatedepot.toLocaleDateString('fr'),
      lead_date_disabled_at: leadDateDisabledAt.toLocaleDateString('fr'),
      lead_name: lead_item_selected_infos.lead.firstname + ' ' + lead_item_selected_infos.lead.name,
      lead_phone: lead_item_selected_infos.lead.phone,
      lead_adress: lead_item_selected_infos.lead.address,
      lead_email: lead_item_selected_infos.lead.email,
      lead_description: lead_item_selected_infos.lead.commentary,
      lead_price:
        lead_item_selected_infos.lead.enterprise.id ==
        JSON.parse(accountService.getSessionUser()).enterprise.id
          ? lead_item_selected_infos.lead.pricingToSeller
          : lead_item_selected_infos.lead.pricingToIncrease,
      lead_price_tpl: lead_item_selected_infos.lead.pricingToTpl,
      lead_status: lead_item_selected_infos.lead.status,
      lead_buyer_enterprise:
        typeof lead_item_selected_infos.lead.sell != 'undefined'
          ? lead_item_selected_infos.lead.sell.buyer_enterprise
          : {},
      lead_litige: {
        id: lead_item_selected_infos.id,
        commentary: lead_item_selected_infos.commentary,
        created_at: lead_item_selected_infos.created_at,
        closed_at: lead_item_selected_infos.closed_at,
        status: lead_item_selected_infos.status,
        litigeStep: lead_item_selected_infos.litigeStep
      },
      lead_denied_price: (lead_item_selected_infos.lead.enterprise.id == JSON.parse(accountService.getSessionUser()).enterprise.id) ? 0 :  lead_item_selected_infos.lead.pricingToTpl,
    }
  }
}

/** API */
// List leads disputed
let list_leads_disputed = ref([])
const page = ref(1)
const loading_more = ref(false)
const loading_more_spinner_showed = ref(false)

const loadMore = async () => {
  if (!loading_more.value) {
    loading_more.value = true
    loading_more_spinner_showed.value = true //show loading more spinner

    await litigeService
      .getAllLitiges(accountService.getToken(), page.value)
      .then(async (response) => {
        console.log(response)

        await setTimeout(async () => {
          //console.log( formatTimestampToDateString(new Date(new Date('2024-01-04 10:47:51').toLocaleDateString('fr')).getTime()/1000) > formatTimestampToDateString(new Date('01/02/2024').getTime()/1000) );
          list_leads_disputed.value = list_leads_disputed.value.concat(
            response.data['hydra:member'].filter((obj) => {
              if (parentDatas.searchedLeads != null && parentDatas.searchedLeads != '') {
                if (
                  stringContains(obj.lead.commentary, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.status, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.postalCode, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.firstname, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.name, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.min_date, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.max_date, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.created_at, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.activity, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.pricingToSeller, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.phone, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.city, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.country, parentDatas.searchedLeads) ||
                  stringContains(obj.lead.address, parentDatas.searchedLeads)
                ) {
                  return true
                }
              } else {
                return true
              }
            })
          )
          if (
            typeof response.data['hydra:view'] !== 'undefined' &&
            typeof response.data['hydra:view']['hydra:next'] !== 'undefined'
          ) {
            page.value++
            loading_more.value = false
            if (list_leads_buyed.value.length != 10) {
              await loadMore()
            } else {
              loading_more_spinner_showed.value = false //hide loading more spinner
            }
          } else {
            loading_more_spinner_showed.value = false //hide loading more spinner
            tooglePageLoading(false)
          }

          if (list_leads_disputed.value.length && !Object.keys(lead_item_infos_datas).length) {
            let leadDateStart = new Date(list_leads_disputed.value[0].lead.min_date)
            let leadDatedepot = new Date(list_leads_disputed.value[0].lead.created_at)
            let leadDateDisabledAt = new Date(list_leads_disputed.value[0].lead.disabled_at)
            lead_item_infos_datas = {
              lead_picto:
                imgs_parent_dir+'/pictos/activity/' +
                simplifiedStr(list_leads_disputed.value[0].lead.activity) +
                '.svg',
              lead_id: list_leads_disputed.value[0].lead.id,
              lead_id_api: list_leads_disputed.value[0].lead['@id'],
              lead_activity_title: list_leads_disputed.value[0].lead.activity,
              lead_localisation: list_leads_disputed.value[0].lead.postalCode,
              lead_enterprise: JSON.parse(accountService.getSessionUser()).enterprise,
              lead_date_start: leadDateStart.toLocaleDateString('fr'),
              lead_date_depot: leadDatedepot.toLocaleDateString('fr'),
              lead_date_disabled_at: leadDateDisabledAt.toLocaleDateString('fr'),
              lead_name:
                list_leads_disputed.value[0].lead.firstname +
                ' ' +
                list_leads_disputed.value[0].lead.name,
              lead_phone: list_leads_disputed.value[0].lead.phone,
              lead_adress: list_leads_disputed.value[0].lead.address,
              lead_email: list_leads_disputed.value[0].lead.email,
              lead_description: list_leads_disputed.value[0].lead.commentary,
              lead_price:
                list_leads_disputed.value[0].lead.enterprise.id ==
                JSON.parse(accountService.getSessionUser()).enterprise.id
                  ? list_leads_disputed.value[0].lead.pricingToSeller
                  : list_leads_disputed.value[0].lead.pricingToIncrease,
              lead_price_tpl: list_leads_disputed.value[0].lead.pricingToTpl,
              lead_status: list_leads_disputed.value[0].lead.status,
              lead_buyer_enterprise:
                typeof list_leads_disputed.value[0].sell != 'undefined'
                  ? list_leads_disputed.value[0].sell.buyer_enterprise
                  : {},
              lead_litige: {
                id: list_leads_disputed.value[0].id,
                commentary: list_leads_disputed.value[0].commentary,
                created_at: list_leads_disputed.value[0].created_at,
                closed_at: list_leads_disputed.value[0].closed_at,
                status: list_leads_disputed.value[0].status,
                litigeStep: list_leads_disputed.value[0].litigeStep
              },
              lead_denied_price: (list_leads_disputed.value[0].lead.enterprise.id == JSON.parse(accountService.getSessionUser()).enterprise.id) ? 0 :  list_leads_disputed.value[0].lead.pricingToTpl,
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
  window.addEventListener('scroll', handleScroll)
  await loadMore()
  //tooglePageLoading(false)
})
</script>

<template>
  <!-- Liste des leads -->
  <div class="row mt-5" v-if="list_leads_disputed.length">
    <!-- LEADS ITEMS -->
    <div class="col-lg-4 d-flex flex-column bloc-leads-items-list position-relative">
      <LeadItemComponent
        v-for="(lead_disputed_item, idx_list_lead_disputed) in list_leads_disputed"
        :key="idx_list_lead_disputed"
        @click="displayLeadItemInfos(idx_list_lead_disputed)"
        :color-status-lead="{
          'bg-green':
            lead_disputed_item.lead.status == 'reserved' ||
            lead_disputed_item.lead.status == 'to_sell',
          'bg-tml-yellow': lead_disputed_item.lead.status == 'checking',
          'bg-tml-green': lead_disputed_item.lead.status == 'valid',
          'bg-tml-red': lead_disputed_item.lead.status == 'denied',
          'bg-secondary': lead_disputed_item.lead.status == 'disabled'
        }"
        :class="{'lead-item-actif':(lead_item_infos_datas.lead_id == lead_disputed_item.lead.id)}"
      >
        <template #lead-item-picto>
          <img
            :src="
              imgs_parent_dir+'/pictos/activity/' +
              simplifiedStr(lead_disputed_item.lead.activity) +
              '.svg'
            "
            class="w-100 invert"
          />
        </template>
        <template #lead-item-heading>
          <p class="fw-bold mb-1">
            {{ lead_disputed_item.lead.activity }} {{ lead_disputed_item.lead.id }}
            <small
              v-if="
                lead_disputed_item.lead.enterprise.id !=
                JSON.parse(accountService.getSessionUser()).enterprise.id
              "
              >(Acheter)</small
            >
            <small v-else>(vendu)</small>
          </p>
          <p
            class="fw-bold fs-4 align-self-end mb-1"
            :class="{
              'color-green':
                lead_disputed_item.lead.status == 'reserved' ||
                lead_disputed_item.lead.status == 'to_sell',
              'color-tml-yellow': lead_disputed_item.lead.status == 'checking',
              'color-tml-green': lead_disputed_item.lead.status == 'valid',
              'color-tml-red': lead_disputed_item.lead.status == 'denied',
              'text-secondary': lead_disputed_item.lead.status == 'disabled'
            }"
          >
            <b
              class="color-tml-red fs-3"
              v-if="
                lead_disputed_item.lead.status == 'denied' &&
                lead_disputed_item.lead.enterprise.id ==
                  JSON.parse(accountService.getSessionUser()).enterprise.id
              "
            >
              0€
            </b>
            <b
              class="color-tml-red fs-3"
              v-else-if="
                lead_disputed_item.lead.status == 'denied' &&
                lead_disputed_item.lead.enterprise.id !=
                  JSON.parse(accountService.getSessionUser()).enterprise.id
              "
            >
              -{{ lead_disputed_item.lead.pricingToTpl }}€
            </b>
            <b
              v-else-if="
                lead_disputed_item.lead.status != 'denied' &&
                lead_disputed_item.lead.enterprise.id ==
                  JSON.parse(accountService.getSessionUser()).enterprise.id
              "
              >{{ lead_disputed_item.lead.pricingToSeller }}€ </b>
            <b v-else>{{ lead_disputed_item.lead.pricingToIncrease }}€ </b>
          </p>
        </template>
        <template #lead-item-content>
          <p class="m-0">Localisation {{ lead_disputed_item.lead.postal_code }}</p>
          <p class="mb-2">A commencer avant le 20/01/2024</p>
          <p class="mb-2"></p>
          <p class="mb-0" v-if="lead_disputed_item.lead.status == 'reserved'">
            <b>Statut:</b> En attente de validation de l'acheteur
          </p>
          <p class="mb-0" v-if="lead_disputed_item.lead.status == 'checking'">
            <b>Statut:</b> Vérification litige
          </p>
          <p class="mb-0" v-if="lead_disputed_item.lead.status == 'valid'"><b>Statut:</b> Valide</p>
          <p class="mb-0" v-if="lead_disputed_item.lead.status == 'denied'">
            <b>Statut:</b> Refusée
          </p>
          <p class="mb-0" v-if="lead_disputed_item.lead.status == 'to_sell'">
            <b>Statut:</b> Mis en vente
          </p>
          <p class="mb-0" v-if="lead_disputed_item.lead.status == 'disabled'">
            <b>Statut:</b> Désactiver
          </p>
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
      :leadItemInfosProps="lead_item_infos_datas"
    />
  </div>
  <div class="mt-5 py-5" v-else>
    <h3 class="text-center mt-5 py-5">
      <img src="@/assets/pictos/comments_disabled.svg" width="100" />
      Aucune données disponible
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
