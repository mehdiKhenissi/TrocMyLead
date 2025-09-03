<script setup>
import { ref, reactive, onBeforeMount, onMounted, defineEmits, inject } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import LeadItemComponent from '@/components/items/LeadItemComponent.vue'
import LeadItemInfosComponent from '@/components/items/LeadItemInfosComponent.vue'
import LeadItemInfosModalComponent from '@/components/items/LeadItemInfosModalComponent.vue'
import UpdateLeadModalComponent from '@/components/account/my_leads_modals/UpdateLeadModalComponent.vue'
import { simplifiedStr } from '@/assets/js/customFunctions.js'

const imgs_parent_dir = ((process.env.NODE_ENV)=='development')?'/src/assets':'/assets'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

const route = useRoute()
//get params
const stripe_checkout_session_id = route.query.session_id
const search_lead_domain = route.query.domain
const search_lead_localisation = route.query.localisation
/*console.log(search_lead_domain)
console.log(search_lead_localisation)*/

let lead_item_infos_datas = reactive({})
const lead_item_infos_show = ref(false)

// show lead item infos responsive modal
const show_modal = ref(false)
const childKey = ref(0)
// on click on item lead chnage infos in LeadItemInfosComponent bloc
function displayLeadItemInfos(lead_item_key) {
  let lead_item_selected_infos = list_leads.value[lead_item_key]
  childKey.value = lead_item_key
  /** if mobile */
  if (window.innerWidth < 991) {
    if (show_modal.value) {
      show_modal.value = false
    } else {
      show_modal.value = true
    }
  }

  let leadDateStart = new Date(lead_item_selected_infos.min_date)
  let leadDatedepot = new Date(lead_item_selected_infos.created_at)
  lead_item_infos_datas = {
    lead_picto:
      imgs_parent_dir+'/pictos/activity/' + simplifiedStr(lead_item_selected_infos.activity) + '.svg',
    lead_id: lead_item_selected_infos.id,
    lead_activity_title: lead_item_selected_infos.activity,
    lead_localisation: lead_item_selected_infos.postalCode,
    lead_enterprise: lead_item_selected_infos.enterprise,
    lead_date_start: leadDateStart.toLocaleDateString('fr'),
    lead_date_depot: leadDatedepot.toLocaleDateString('fr'),
    lead_description: lead_item_selected_infos.commentary,
    lead_price: lead_item_selected_infos.pricingToIncrease,
    lead_status: lead_item_selected_infos.status
  }

  //childKey.value++; // to define nex key index in each new componenet
}

// show lead item infos responsive modal
const lead_full_infos = ref(null);
/** LEAD UPDATE MODAL */
const show_update_lead_modal = ref(false)
function displayUpdateLeadModal() {
  lead_full_infos.value = list_leads.value[childKey.value]
  if (show_update_lead_modal.value) {
    show_update_lead_modal.value = false
  } else {
    show_update_lead_modal.value = true
  }
}

/** API */
// List leads
let list_leads = ref([])
const page = ref(1)
const loading_more = ref(false)
const loading_more_spinner_showed = ref(false)

const loadMore = async () => {
  if (!loading_more.value) {
    loading_more.value = true
    loading_more_spinner_showed.value = true //show loading more spinner

    await leadService
      .getAllLeads(page.value)
      .then(async (response) => {
        //emit('toogle-page-loading', false)
        //console.log(response)

        setTimeout(async () => {
          list_leads.value = list_leads.value.concat(
            response.data['hydra:member'].filter((obj) => {
              if (
                obj.status == 'to_sell' &&
                (obj.disabled_at == null || Date.parse(obj.disabled_at) > Date.parse(new Date()))
              ) {

                if (
                  typeof search_lead_domain != 'undefined' &&
                  typeof search_lead_localisation != 'undefined'
                ) {
                  if (
                    search_lead_domain == obj.activity &&
                    (obj.postalCode).includes(search_lead_localisation)
                  ) {
                    return true
                  }
                } else if (
                  typeof search_lead_domain != 'undefined' &&
                  search_lead_domain == obj.activity
                ) {
                  return true
                } else if (
                  typeof search_lead_localisation != 'undefined' &&
                  (obj.postalCode).includes(search_lead_localisation)
                ) {
                  return true
                } else if (
                  typeof search_lead_localisation == 'undefined' &&
                  typeof search_lead_domain == 'undefined'
                ) {
                  return true
                }
              }
            })
          )

          if ((typeof response.data['hydra:view'] != "undefined") && (typeof response.data['hydra:view']['hydra:next'] !== 'undefined')) {
            page.value++
            loading_more.value = false
            if(list_leads.value.length != 20){
              await loadMore()
            }
            else{
              loading_more_spinner_showed.value = false //hide loading more spinner
            }
          }
          else{
            loading_more_spinner_showed.value = false //hide loading more spinner
          }
          

          if (list_leads.value.length && !Object.keys(lead_item_infos_datas).length) { // th second condition is to prevent reinit bloc lead informations to first lead when charging more leads on scrolling
            let leadDateStart = new Date(list_leads.value[0].min_date)
            let leadDatedepot = new Date(list_leads.value[0].created_at)

            lead_item_infos_datas = {
              lead_picto:
                imgs_parent_dir+'/pictos/activity/' +
                simplifiedStr(list_leads.value[0].activity) +
                '.svg',
              lead_id: list_leads.value[0].id,
              lead_activity_title: list_leads.value[0].activity,
              lead_localisation: list_leads.value[0].postalCode,
              lead_enterprise: list_leads.value[0].enterprise,
              lead_date_start: leadDateStart.toLocaleDateString('fr'),
              lead_date_depot: leadDatedepot.toLocaleDateString('fr'),
              lead_description: list_leads.value[0].commentary,
              lead_price: list_leads.value[0].pricingToIncrease,
              lead_status: list_leads.value[0].status
            }

            lead_item_infos_show.value = true
          }
        }, 500)
      })
      .catch((err) => {
        emit('toogle-page-loading', false)
        loading_more_spinner_showed.value = false
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

onMounted(async () => {
  // await axios.get('http://localhost:8000/api/leads')
  //     .then((response) => {
  //       console.log(response.data)
  //       list_leads.value = response.data['hydra:member']
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error)
  //     })

  window.addEventListener('scroll', handleScroll)
  await loadMore()

  //hide page loading
  emit('toogle-page-loading', false)
})
</script>

<template>
  <div class="container py-5">
    <div class="row">
      <h1 class="fs-xxxl pb-4 fw-bold">Liste des prospects</h1>
      <!-- LEADS ITEMS -->
      <div class="col-lg-4 d-flex flex-column bloc-leads-items-list" :class="{'justify-content-center': !list_leads.length}">
        <!-- <LeadItemComponent 
                :lead_item_props='{
                    picto:"ok",
                    text:"kiki"
                }'
                ></LeadItemComponent> -->

        <LeadItemComponent
          v-for="(lead_item, idx_list_lead) in list_leads"
          :key="idx_list_lead"
          @click="displayLeadItemInfos(idx_list_lead)"
          :color-status-lead="{
            'bg-tml-green':
              JSON.parse(accountService.getSessionUser()) != null && typeof (JSON.parse(accountService.getSessionUser()).enterprise) != 'undefined' && 
              lead_item.enterprise.id == JSON.parse(accountService.getSessionUser()).enterprise.id,
            'bg-green': accountService.isAdmin() || 
              JSON.parse(accountService.getSessionUser()) == null ||  ( typeof (JSON.parse(accountService.getSessionUser()).enterprise) != 'undefined' && 
              lead_item.enterprise.id != JSON.parse(accountService.getSessionUser()).enterprise.id )
          }"
          :class="{'lead-item-actif':(lead_item_infos_datas.lead_id == lead_item.id)}"
        >
          <template #lead-item-picto>
            <img
              :src="imgs_parent_dir+'/pictos/activity/' + simplifiedStr(lead_item.activity) + '.svg'"
              class="w-100 invert"
            />
          </template>
          <template #lead-item-heading>
            <p class="fw-bold mb-1">{{ lead_item.activity }}</p>
            <p class="color-green fw-bold fs-4 align-self-end mb-1">
              {{ lead_item.pricingToIncrease }}€
            </p>
          </template>
          <template #lead-item-content>
            <p class="m-0">Localisation {{ lead_item.postal_code }}</p>
            <p class="mb-2">A commencer avant le 20/01/2024</p>
            <p class="mb-2">Déposé par {{ lead_item.enterprise.name }}</p>
          </template>
        </LeadItemComponent>

        <div
          class="text-center"
          v-if="loading_more_spinner_showed"
          :class="{ 'pt-3': loading_more_spinner_showed }"
        >
          Chargement des données... <label class="troc-my-lead-spinner align-middle"></label>
        </div>
        <div class="text-center fw-bold fs-5" v-if="!lead_item_infos_show && !loading_more_spinner_showed">
          Pas de données disponibles
        </div>
      </div>

      <!-- BLOC LEAD ITEM FULL INFOS COMPONENT -->
      <div
        class="col-lg-8 d-lg-inline-block d-none bloc-lead-item-max-infos border-tml position-sticky mt-lg-0 mt-5 p-0"
        style="height: 600px; top: 5.5rem"
        :style="!lead_item_infos_show ? { 'background-color': 'rgba(33, 160, 133, 0.6)' } : {}"
      >
        <LeadItemInfosComponent
          v-if="lead_item_infos_show"
          @display-update-lead-modal="displayUpdateLeadModal"
          :key="childKey"
          :leadItemInfosProps="lead_item_infos_datas"
          :lead-full-infos="false"
          :lead-to-buy="lead_item_infos_datas.lead_status == 'to_sell'"
          :belong-current-user="
            JSON.parse(accountService.getSessionUser()) != null && typeof (JSON.parse(accountService.getSessionUser()).enterprise) != 'undefined' && 
            lead_item_infos_datas.lead_enterprise.id ==
              JSON.parse(accountService.getSessionUser()).enterprise.id
          "
        />
        <div v-if="!lead_item_infos_show" class="col-md-12 h-100 d-flex align-items-center justify-content-center">
          <p class="text-center">
            <img src="@/assets/pictos/comments_disabled.svg" class="" width="100" />
          </p>
        </div>
      </div>

      <!-- MODAL LEAD ITEM FULL INFOS MODAL COMPONENT -->
      <!-- Modal -->
      <LeadItemInfosModalComponent
        v-if="show_modal"
        @display-lead-item-infos="displayLeadItemInfos"
        :leadItemInfosProps="lead_item_infos_datas"
        :lead-full-infos="false"
        :lead-to-buy="lead_item_infos_datas.lead_status == 'to_sell'"
        :belong-current-user=" 
          JSON.parse(accountService.getSessionUser()) != null && typeof (JSON.parse(accountService.getSessionUser()).enterprise) != 'undefined' && 
          lead_item_infos_datas.lead_enterprise.id ==
            JSON.parse(accountService.getSessionUser()).enterprise.id
        "
      />


      <!-- Modal update lead (if user connected) -->
      <UpdateLeadModalComponent
        v-if="show_update_lead_modal"
        @display-update-lead-modal="displayUpdateLeadModal"
        :leadFullInfos="lead_full_infos"
      />


    </div>
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
