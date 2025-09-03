<script setup>
import { ref, reactive, onMounted, onBeforeMount, inject } from 'vue'
import LeadItemComponent from '@/components/items/LeadItemComponent.vue'
import LeadItemInfosModalComponent from '@/components/items/LeadItemInfosModalComponent.vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  stringContains
} from '@/assets/js/customFunctions.js'
import ClaimLeadModalComponent from '@/components/account/my_leads_modals/ClaimLeadModalComponent.vue'
import LeadDeniedModalComponent from '@/components/account/my_leads_modals/LeadDeniedModalComponent.vue'
import LeadCheckingModalComponent from '@/components/account/my_leads_modals/LeadCheckingModalComponent.vue'
import DownloadMultipleLeadsComponent from '@/components/items/DownloadMultipleLeadsComponent.vue'
import LeadItemFactureComponent from '@/components/items/LeadItemFactureComponent.vue'

const imgs_parent_dir = process.env.NODE_ENV == 'development' ? '/src/assets' : '/assets'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const sellService = inject('sellService')
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
  let lead_item_selected_infos = list_leads_factures.value[lead_item_key]
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
    let leadDateValidatedAt = new Date(lead_item_selected_infos.lead.validated_at)
    let leadDateSelledAt =
      lead_item_selected_infos.created_at != null
        ? new Date(lead_item_selected_infos.created_at)
        : null
    lead_item_infos_datas = {
      lead_picto:
        imgs_parent_dir +
        '/pictos/activity/' +
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
      lead_price_increase: lead_item_selected_infos.lead.pricingToIncrease,
      lead_price_tpl: lead_item_selected_infos.lead.pricingToTpl,
      lead_price_seller: lead_item_selected_infos.lead.pricingToSeller,
      lead_status: lead_item_selected_infos.lead.status,
      lead_buyer_enterprise: lead_item_selected_infos.buyer_enterprise,
      lead_litige: lead_item_selected_infos.lead.litige,
      lead_validated_at: leadDateValidatedAt.toLocaleDateString('fr'),
      lead_sell: {
        id: lead_item_selected_infos.id,
        id_charge: lead_item_selected_infos.id_charge,
        id_stripe: lead_item_selected_infos.id_stripe,
        invoice_link: lead_item_selected_infos.invoice_link,
        invoice_id: lead_item_selected_infos.invoice_id,
        invoice_num: lead_item_selected_infos.invoice_num,
        pricing: lead_item_selected_infos.pricing,
        statut: lead_item_selected_infos.statut,
        stripe_payment_id: lead_item_selected_infos.stripe_payment_id,
        created_at:
          leadDateSelledAt != null
            ? leadDateSelledAt.toLocaleDateString('fr') +
              ' ' +
              leadDateSelledAt.toLocaleTimeString('fr')
            : null
      }
    }
  }

  //leadInfosModalKey.value++
}

/** API */
// List leads
let list_leads_factures = ref([])
const page = ref(1)
const loading_more = ref(false)
const loading_more_spinner_showed = ref(false)

const loadMore = async () => {
  if (!loading_more.value) {
    loading_more.value = true
    loading_more_spinner_showed.value = true //show loading more spinner

    await sellService
      .getLeadsBuyedSelled(accountService.getToken(), page.value)
      .then(async (response) => {
        //console.log(response)

        await setTimeout(async () => {
          if (response.data.leads_buyed_selled.length) {
            list_leads_factures.value = list_leads_factures.value.concat(
              response.data.leads_buyed_selled.filter((obj) => {
                if (obj.lead.status == 'valid' || obj.lead.status == 'denied') {
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

            //page.value++
            //loading_more.value = false
            //loading_more_spinner_showed.value = false //hide loading more spinner

            if (
              typeof response.data['hydra:view'] !== 'undefined' &&
              typeof response.data['hydra:view']['hydra:next'] !== 'undefined'
            ) {
              page.value++
              loading_more.value = false
              if (list_leads_factures.value.length != 10) {
                await loadMore()
              } else {
                loading_more_spinner_showed.value = false //hide loading more spinner
              }
            } else {
              loading_more_spinner_showed.value = false //hide loading more spinner
              tooglePageLoading(false)
            }

            //console.log(list_leads_factures.value);

            if (list_leads_factures.value.length && !Object.keys(lead_item_infos_datas).length) {
              let leadDateStart =
                list_leads_factures.value[0].lead.min_date != null
                  ? new Date(list_leads_factures.value[0].lead.min_date)
                  : null
              let leadDatedepot =
                list_leads_factures.value[0].lead.created_at != null
                  ? new Date(list_leads_factures.value[0].lead.created_at)
                  : null
              let leadDateDisabledAt =
                list_leads_factures.value[0].lead.disabled_at != null
                  ? new Date(list_leads_factures.value[0].lead.disabled_at)
                  : null
              let leadDateValidatedAt =
                list_leads_factures.value[0].lead.validated_at != null
                  ? new Date(list_leads_factures.value[0].lead.validated_at)
                  : null
              let leadDateSelledAt =
                list_leads_factures.value[0].created_at != null
                  ? new Date(list_leads_factures.value[0].created_at)
                  : null

              lead_item_infos_datas = {
                lead_picto:
                  imgs_parent_dir +
                  '/pictos/activity/' +
                  simplifiedStr(list_leads_factures.value[0].lead.activity) +
                  '.svg',
                lead_id: list_leads_factures.value[0].lead.id,
                lead_id_api: list_leads_factures.value[0].lead['@id'],
                lead_activity_title: list_leads_factures.value[0].lead.activity,
                lead_localisation: list_leads_factures.value[0].lead.postalCode,
                lead_enterprise: list_leads_factures.value[0].lead.enterprise,
                lead_date_start:
                  leadDateStart != null ? leadDateStart.toLocaleDateString('fr') : null,
                lead_date_depot:
                  leadDatedepot != null ? leadDatedepot.toLocaleDateString('fr') : null,
                lead_date_disabled_at:
                  leadDateDisabledAt != null ? leadDateDisabledAt.toLocaleDateString('fr') : null,
                lead_name:
                  list_leads_factures.value[0].lead.firstname +
                  ' ' +
                  list_leads_factures.value[0].lead.name,
                lead_phone: list_leads_factures.value[0].lead.phone,
                lead_adress: list_leads_factures.value[0].lead.address,
                lead_email: list_leads_factures.value[0].lead.email,
                lead_description: list_leads_factures.value[0].lead.commentary,
                lead_price_increase: list_leads_factures.value[0].lead.pricingToIncrease,
                lead_price_tpl: list_leads_factures.value[0].lead.pricingToTpl,
                lead_price_seller: list_leads_factures.value[0].lead.pricingToSeller,
                lead_status: list_leads_factures.value[0].lead.status,
                lead_buyer_enterprise: list_leads_factures.value[0].buyer_enterprise,
                lead_litige: list_leads_factures.value[0].lead.litige,
                lead_validated_at:
                  leadDateValidatedAt != null
                    ? leadDateValidatedAt.toLocaleDateString('fr') +
                      ' ' +
                      leadDateValidatedAt.toLocaleTimeString('fr')
                    : null,
                lead_sell: {
                  id: list_leads_factures.value[0].id,
                  id_charge: list_leads_factures.value[0].id_charge,
                  id_stripe: list_leads_factures.value[0].id_stripe,
                  invoice_link: list_leads_factures.value[0].invoice_link,
                  invoice_id: list_leads_factures.value[0].invoice_id,
                  invoice_num: list_leads_factures.value[0].invoice_num,
                  pricing: list_leads_factures.value[0].pricing,
                  statut: list_leads_factures.value[0].statut,
                  stripe_payment_id: list_leads_factures.value[0].stripe_payment_id,
                  created_at:
                    leadDateSelledAt != null
                      ? leadDateSelledAt.toLocaleDateString('fr') +
                        ' ' +
                        leadDateSelledAt.toLocaleTimeString('fr')
                      : null
                }
              }

              lead_item_infos_show.value = true
            }

            tooglePageLoading(false)
          } else {
            loading_more.value = true
            loading_more_spinner_showed.value = false //hide loading more spinner
            tooglePageLoading(false)
          }
        }, 500)
      })
      .catch((err) => {
        tooglePageLoading(false)
        console.log(err)
      })
  }

  //console.log(list_leads_factures.value)
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

  //hide page loading
  //tooglePageLoading(false)
})
</script>

<template>
  <!-- Liste des leads -->
  <div class="row mt-5" v-if="list_leads_factures.length">
    <!-- LEADS ITEMS -->
    <div class="col-lg-4 d-flex flex-column bloc-leads-items-list position-relative">
      <LeadItemComponent
        v-for="(lead_facture_item, idx_list_lead_facture) in list_leads_factures"
        :key="idx_list_lead_facture"
        @click="displayLeadItemInfos(idx_list_lead_facture)"
        :color-status-lead="{
          'bg-green': true
        }"
        :class="{'lead-item-actif':(lead_item_infos_datas.lead_id == lead_facture_item.lead.id)}"
      >
        <template #lead-item-picto>
          <img
            :src="
              imgs_parent_dir +
              '/pictos/activity/' +
              simplifiedStr(lead_facture_item.lead.activity) +
              '.svg'
            "
            class="w-100 invert"
          />
        </template>
        <template #lead-item-heading>
          <p class="fw-bold mb-1">
            {{ lead_facture_item.lead.activity }}
          </p>
          <p
            class="fw-bold fs-4 align-self-end mb-1"
            :class="{
              'color-green': true
            }"
          >
            <!-- <b
              v-if="
                lead_facture_item.lead.enterprise.id ==
                JSON.parse(accountService.getSessionUser()).enterprise.id
              "
              >+{{ lead_facture_item.lead.pricingToSeller }}€ </b>
            <b v-else-if="lead_facture_item.lead.status == 'denied'">-{{ lead_facture_item.lead.pricingToTpl }}</b>
            <b v-else>-{{ lead_facture_item.lead.pricingToIncrease }}€ </b> -->
            <b>
              <span
              v-if="lead_facture_item.lead.status == 'denied'"></span
              >
              <span v-else-if="
                  lead_facture_item.lead.enterprise.id ==
                  JSON.parse(accountService.getSessionUser()).enterprise.id
                ">+</span>
              <span v-else>-</span>{{ lead_facture_item.pricing }}€
            </b>
          </p>
        </template>
        <template #lead-item-content>
          <p class="m-0">Localisation {{ lead_facture_item.postal_code }}</p>
          <p class="mb-2">A commencer avant le 20/01/2024</p>
          <p class="mb-2">Déposé par {{ lead_facture_item.lead.enterprise.name }}</p>
          <p class="mb-0" v-if="lead_facture_item.lead.status == 'denied'">
            <b>Statut:</b> Achat refusé <small>(erreur prospect)</small>
          </p>
          <p
            class="mb-0"
            v-else-if="
              lead_facture_item.lead.enterprise.id ==
              JSON.parse(accountService.getSessionUser()).enterprise.id
            "
          >
            <b>Statut:</b> Vendu
          </p>
          <p class="mb-0" v-else><b>Statut:</b> Acheter</p>
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
      class="col-lg-8 d-lg-inline-block d-none bloc-lead-item-max-infos position-sticky mt-lg-0 mt-5 p-0"
      style="top: 5.5rem"
      :style="!lead_item_infos_show ? { 'background-color': 'rgba(33, 160, 133, 0.6)' } : {}"
    >
      <!-- <LeadItemInfosComponent
        v-if="lead_item_infos_show"
        :key="leadInfosModalKey"
        @display-claim-lead-modal="displayClaimLeadModal"
        @display-lead-denied-modal="displayLeadDeniedModal"
        @validate-lead="ValidateLead"
        @display-lead-checking-modal="displayLeadCheckingModal"
        :leadItemInfosProps="lead_item_infos_datas"
        :lead-full-infos="true"
        :leads-buyed-list="true"
      /> -->

      <LeadItemFactureComponent
        :key="leadInfosModalKey"
        :leadItemInfosProps="lead_item_infos_datas"
      />

      <DownloadMultipleLeadsComponent />
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
