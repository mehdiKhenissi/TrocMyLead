<script setup>
import { ref, reactive, onMounted, onBeforeMount, inject } from 'vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import LeadItemComponent from '@/components/items/LeadItemComponent.vue'
import LeadItemInfosComponent from '@/components/items/LeadItemInfosComponent.vue'
import LeadItemInfosModalComponent from '@/components/items/LeadItemInfosModalComponent.vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  formatDateToISOString,
  stringContains
} from '@/assets/js/customFunctions.js'
import ClaimLeadModalComponent from '@/components/account/my_leads_modals/ClaimLeadModalComponent.vue'
import LeadDeniedModalComponent from '@/components/account/my_leads_modals/LeadDeniedModalComponent.vue'
import LeadCheckingModalComponent from '@/components/account/my_leads_modals/LeadCheckingModalComponent.vue'

const imgs_parent_dir = ((process.env.NODE_ENV)=='development')?'/src/assets':'/assets'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const sellService = inject('sellService')
const stripeService = inject('stripeService')
const tooglePageLoading = inject('tooglePageLoading')

/** parent datas */
const parentDatas = defineProps({
  searchedLeads: String
})

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

let lead_item_infos_datas = reactive({})
const lead_item_infos_show = ref(false)

/** LEAD ITEM */
let show_lead_infos_modal = ref(false)
const leadInfosModalKey = ref(0)
/** Display lead infos and show lead infos modal if mobile */
function displayLeadItemInfos(lead_item_key) {
  let lead_item_selected_infos = list_leads_buyed.value[lead_item_key]
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
    //console.log(lead_item_selected_infos);
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
      lead_price: lead_item_selected_infos.lead.pricingToIncrease,
      lead_price_tpl: lead_item_selected_infos.lead.pricingToTpl,
      lead_status: lead_item_selected_infos.lead.status,
      lead_buyer_enterprise: lead_item_selected_infos.buyer_enterprise,
      lead_litige: lead_item_selected_infos.lead.litige,
      lead_denied_price: lead_item_selected_infos.lead.pricingToTpl,
      lead_sell: {
        id: lead_item_selected_infos.id,
        pricing: lead_item_selected_infos.pricing,
        statut: lead_item_selected_infos.statut,
        stripe_payment_id: lead_item_selected_infos.stripe_payment_id,
        buyer_enterprise: lead_item_selected_infos.buyer_enterprise.id,
        created_at: lead_item_selected_infos.buyer_enterprise.created_at
      }
    }
  }

  //console.log(lead_item_infos_datas)
  //leadInfosModalKey.value++
}

/** VALID LEAD */
async function ValidateLead() {
  tooglePageLoading(true)
  if (
    confirm(
      "Êtes-vou sur de vouloir valider ce lead? Attention c'est impossible de remodifier le status après."
    )
  ) {
    /** CAPTUR PAYMENT */
    await stripeService
      .stripeCapturPayment(
        accountService.getToken(),
        lead_item_infos_datas.lead_sell.stripe_payment_id
      )
      .then(async (resCapturPayment) => {
        console.log(resCapturPayment)
        if (typeof resCapturPayment.data != 'undefined' && resCapturPayment.data.code == '200') {
          /** UPDATE STATUS SELL PAID */
          await sellService
            .updateSell(accountService.getToken(), {
              id: lead_item_infos_datas.lead_sell.id,
              statut: 'paid',
              invoiceId: resCapturPayment.data.infos.invoice.id,
              invoiceNum: resCapturPayment.data.infos.invoice.invoice_num,
              invoiceLink: resCapturPayment.data.infos.invoice.invoice_pdf
            })
            .then(async (resUpdateStatusSell) => {
              if (
                typeof resUpdateStatusSell.data != 'undefined' &&
                typeof resUpdateStatusSell.data.id != 'undefined'
              ) {
                /** UPDATE STATUS LEAD VALID */
                await leadService
                  .updateStatusLead(accountService.getToken(), {
                    id: lead_item_infos_datas.lead_id,
                    status: 'valid'
                  })
                  .then(async (resUpdateStatusLead) => {
                    if (
                      typeof resUpdateStatusLead.data != 'undefined' &&
                      typeof resUpdateStatusLead.data.id_lead_updated != 'undefined'
                    ) {
                      tooglePageLoading(false)
                      // isAlertShowed.value = true
                      // alertParams.value.type = 'alert-success text-center'
                      // alertParams.value.message = 'Lead validé avec succès.'
                      //$(document).find('body').addClass('disable-actions')
                      alert('Prospect valider avec succés')
                      window.location.reload(true)
                    }
                  })
                  .catch(async (errUpdateStatusLead) => {
                    // isAlertShowed.value = true
                    // alertParams.value.type = 'alert-danger text-center'
                    // alertParams.value.message =
                    //   'Erreur soumission de votre reclamation, veuillez ressayer plus tard ou contacter le support technique'
                    tooglePageLoading(false)
                    alert(
                      "Payment valider avec succés, mais une erreur c'est produite veuillez contacter le support technique pour cela s'il vous plait."
                    )
                  })
                /** END UPDATE STATUS LEAD VALID */
              }
            })
            .catch(async (errUpdateStatusSell) => {
              alert(
                "Payment valider avec succés, mais une erreur c'est produite veuillez contacter le support technique pour cela s'il vous plait."
              )
            })
          /** END UPDATE STATUS SELL PAID */
        } else {
          alert(
            "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le support technique"
          )
        }
      })
      .catch(async (errCapturPayment) => {
        tooglePageLoading(false)
        console.log(errCapturPayment)
        alert(
                "Une erreur c'est produite veuillez contacter le support technique pour cela s'il vous plait."
              )
      })
  } else {
    tooglePageLoading(false)
  }
}

/** CLAIM LEAD MODAL */
const show_claim_lead_modal = ref(false)
/** Show claim lead modal and mj lead infos */
function displayClaimLeadModal() {
  if (show_claim_lead_modal.value) {
    show_claim_lead_modal.value = false
  } else {
    show_claim_lead_modal.value = true
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

/** API */
// List leads
let list_leads_buyed = ref([])
const page = ref(1)
const loading_more = ref(false)
const loading_more_spinner_showed = ref(false)

const loadMore = async () => {
  if (!loading_more.value) {
    loading_more.value = true
    loading_more_spinner_showed.value = true //show loading more spinner

    await sellService
      .getAllSells(accountService.getToken(), page.value)
      .then(async (response) => {
        //console.log(response)

        await setTimeout(async () => {
          list_leads_buyed.value = list_leads_buyed.value.concat(
            response.data['hydra:member'].filter((obj) => {
              if (
                obj.lead.status == 'reserved' ||
                obj.lead.status == 'checking' ||
                obj.lead.status == 'valid' ||
                obj.lead.status == 'denied'
              ) {
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

          if (list_leads_buyed.value.length && !Object.keys(lead_item_infos_datas).length) {
            let leadDateStart = new Date(list_leads_buyed.value[0].lead.min_date)
            let leadDatedepot = new Date(list_leads_buyed.value[0].lead.created_at)
            let leadDateDisabledAt = new Date(list_leads_buyed.value[0].lead.disabled_at)
            lead_item_infos_datas = {
              lead_picto:
                imgs_parent_dir+'/pictos/activity/' +
                simplifiedStr(list_leads_buyed.value[0].lead.activity) +
                '.svg',
              lead_id: list_leads_buyed.value[0].lead.id,
              lead_id_api: list_leads_buyed.value[0].lead['@id'],
              lead_activity_title: list_leads_buyed.value[0].lead.activity,
              lead_localisation: list_leads_buyed.value[0].lead.postalCode,
              lead_enterprise: list_leads_buyed.value[0].lead.enterprise,
              lead_date_start: leadDateStart.toLocaleDateString('fr'),
              lead_date_depot: leadDatedepot.toLocaleDateString('fr'),
              lead_date_disabled_at: leadDateDisabledAt.toLocaleDateString('fr'),
              lead_name:
                list_leads_buyed.value[0].lead.firstname +
                ' ' +
                list_leads_buyed.value[0].lead.name,
              lead_phone: list_leads_buyed.value[0].lead.phone,
              lead_adress: list_leads_buyed.value[0].lead.address,
              lead_email: list_leads_buyed.value[0].lead.email,
              lead_description: list_leads_buyed.value[0].lead.commentary,
              lead_price: list_leads_buyed.value[0].lead.pricingToIncrease,
              lead_price_tpl: list_leads_buyed.value[0].lead.pricingToTpl,
              lead_status: list_leads_buyed.value[0].lead.status,
              lead_buyer_enterprise: list_leads_buyed.value[0].buyer_enterprise,
              lead_litige: list_leads_buyed.value[0].lead.litige,
              lead_denied_price: list_leads_buyed.value[0].lead.pricingToTpl,
              lead_sell: {
                id: list_leads_buyed.value[0].id,
                pricing: list_leads_buyed.value[0].pricing,
                statut: list_leads_buyed.value[0].statut,
                stripe_payment_id: list_leads_buyed.value[0].stripe_payment_id,
                buyer_enterprise: list_leads_buyed.value[0].buyer_enterprise.id,
                created_at: list_leads_buyed.value[0].buyer_enterprise.created_at
              }
            }

            lead_item_infos_show.value = true
          }
        }, 500)

        await setTimeout(() => {
          if (parentDatas.searchedLeads == null || parentDatas.searchedLeads == '') {
            tooglePageLoading(false)
          }
        }, 1000)
      })
      .catch((err) => {
        tooglePageLoading(false)
        console.log(err)
      })
  }

  //console.log(list_leads_buyed.value)
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
  await tooglePageLoading(true)
})

const nodata_found = ref(null)
onMounted(async () => {
  // // window.location.href = '/account/status-leads#selled'
  window.addEventListener('scroll', handleScroll)
  await loadMore()

  //hide page loading
  //await tooglePageLoading(true)
})
</script>

<template>
  <!-- Liste des leads -->
  <div class="row mt-5" v-if="list_leads_buyed.length">
    <!-- LEADS ITEMS -->
    <div class="col-lg-4 d-flex flex-column bloc-leads-items-list position-relative">
      <LeadItemComponent
        v-for="(lead_buyed_item, idx_list_lead_buyed) in list_leads_buyed"
        :key="idx_list_lead_buyed"
        @click="displayLeadItemInfos(idx_list_lead_buyed)"
        :color-status-lead="{
          'bg-green': lead_buyed_item.lead.status == 'reserved',
          'bg-tml-yellow': lead_buyed_item.lead.status == 'checking',
          'bg-tml-green': lead_buyed_item.lead.status == 'valid',
          'bg-tml-red': lead_buyed_item.lead.status == 'denied'
        }"
        :class="{'lead-item-actif':(lead_item_infos_datas.lead_id == lead_buyed_item.lead.id)}"
      >
        <template #lead-item-picto>
          <img
            :src="
              imgs_parent_dir+'/pictos/activity/' + simplifiedStr(lead_buyed_item.lead.activity) + '.svg'
            "
            class="w-100 invert"
          />
        </template>
        <template #lead-item-heading>
          <p class="fw-bold mb-1">
            {{ lead_buyed_item.lead.activity }}
          </p>
          <p
            class="fw-bold fs-4 align-self-end mb-1"
            :class="{
              'color-green': lead_buyed_item.lead.status == 'reserved',
              'color-tml-yellow': lead_buyed_item.lead.status == 'checking',
              'color-tml-green': lead_buyed_item.lead.status == 'valid',
              'color-tml-red': lead_buyed_item.lead.status == 'denied'
            }"
          >
            <b v-if="lead_buyed_item.lead.status == 'denied'"
              >{{ lead_buyed_item.lead.pricingToTpl }}€ </b>
            <b v-else>{{ lead_buyed_item.pricing }}€</b>
          </p>
        </template>
        <template #lead-item-content>
          <p class="m-0">Localisation {{ lead_buyed_item.postal_code }}</p>
          <p class="mb-2">A commencer avant le 20/01/2024</p>
          <p class="mb-2">Déposé par {{ lead_buyed_item.lead.enterprise.name }}</p>
          <p class="mb-0" v-if="lead_buyed_item.lead.status == 'reserved'">
            <b>Statut:</b> En attente de validation
          </p>
          <p class="mb-0" v-if="lead_buyed_item.lead.status == 'checking'">
            <b>Statut:</b> Vérification litige
          </p>
          <p class="mb-0" v-if="lead_buyed_item.lead.status == 'valid'"><b>Statut:</b> Valide</p>
          <p class="mb-0" v-if="lead_buyed_item.lead.status == 'denied'"><b>Statut:</b> Refusée</p>
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
        @display-claim-lead-modal="displayClaimLeadModal"
        @display-lead-denied-modal="displayLeadDeniedModal"
        @validate-lead="ValidateLead"
        @display-lead-checking-modal="displayLeadCheckingModal"
        :leadItemInfosProps="lead_item_infos_datas"
        :lead-full-infos="true"
        :leads-buyed-list="true"
      />
    </div>

    <!-- LEAD ITEM FULL INFOS MODAL COMPONENET -->
    <!-- Modal -->
    <LeadItemInfosModalComponent
      v-if="show_lead_infos_modal"
      @display-lead-item-infos="displayLeadItemInfos"
      @display-claim-lead-modal="displayClaimLeadModal"
      @display-lead-denied-modal="displayLeadDeniedModal"
      @validate-lead="ValidateLead"
      @display-lead-checking-modal="displayLeadCheckingModal"
      :leadItemInfosProps="lead_item_infos_datas"
      :lead-full-infos="true"
      :leads-buyed-list="true"
    />

    <!-- CLAIM LEAD MODAL -->
    <ClaimLeadModalComponent
      v-if="show_claim_lead_modal"
      :key="leadInfosModalKey"
      @display-claim-lead-modal="displayClaimLeadModal"
      :leadItemInfosProps="lead_item_infos_datas"
    />

    <!-- LEAD DENIED MODAL -->
    <LeadDeniedModalComponent
      v-if="show_lead_denied_modal"
      :key="leadInfosModalKey"
      @display-lead-denied-modal="displayLeadDeniedModal"
      :leadItemInfosProps="lead_item_infos_datas"
      :show-charge-service="true"
    />

    <!-- LEAD CHECKING MODAL -->
    <LeadCheckingModalComponent
      v-if="show_lead_checking_modal"
      :key="leadInfosModalKey"
      @display-lead-checking-modal="displayLeadCheckingModal"
      :leadItemInfosProps="lead_item_infos_datas"
    />
  </div>
  <div class="mt-5 py-5" v-else>
    <h3 class="text-center mt-5 py-5">
      <img src="@/assets/pictos/comments_disabled.svg" width="100" />
      Aucune données disponible
      <RouterLink :to="{ name: 'listLeads' }" class="text-decoration-none">
        <button
          type="button"
          class="col-md-4 col-12 my-4 ps-0 d-block m-auto p-3 btn btn-default btn-green text-white rounded-pill btn-troc-my-lead"
        >
          <img src="@/assets/pictos/cart.svg" class="invert me-2" />
          <b>Acheter des prospects</b>
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
