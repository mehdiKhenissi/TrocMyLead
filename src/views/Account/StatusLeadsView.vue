<script setup>
import { ref, onMounted } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import LeadsBuyedComponent from '@/components/account/LeadsBuyedComponent.vue'
import LeadsSelledComponent from '@/components/account/LeadsSelledComponent.vue'
import LeadsDisputedComponent from '@/components/account/LeadsDisputedComponent.vue'
import LeadsFacturesComponent from '@/components/account/LeadsFacturesComponent.vue'

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

/** check if in url pointing in sections (achats, ventes, litiges...)  */
const route = useRoute()
//console.log(route.hash)

/** display lead status block  */
const currentStatusTab = ref('Achats')
const showLeadsBuyedComponent = ref(true)
const showLeadsSelledComponent = ref(false)
const showLeadsDisputedComponent = ref(false)
const showLeadsFacturesComponent = ref(false)
function displayLeadStatusBlock(event, current_tab) {
  /** Hide all blocks */
  showLeadsBuyedComponent.value = $(event.target).hasClass('nav-leads-buyed')
  showLeadsSelledComponent.value = $(event.target).hasClass('nav-leads-selled')
  showLeadsDisputedComponent.value = $(event.target).hasClass('nav-leads-disputed')
  showLeadsFacturesComponent.value = $(event.target).hasClass('nav-leads-factures')
  currentStatusTab.value = current_tab
  
  //vider search lead ipnut
  searched_leads.value = null
}
/** End display lead status block  */

/** search on my leads */
const searched_leads = ref(null)
async function searchOnMyLeads() {
  emit('toogle-page-loading', true)
  // disable all tabs
  showLeadsBuyedComponent.value = false
  showLeadsSelledComponent.value = false
  showLeadsDisputedComponent.value = false
  showLeadsFacturesComponent.value = false
  // enable referer tab
  setTimeout(() => {
    if (currentStatusTab.value == 'Achats') {
      showLeadsBuyedComponent.value = true
    } else if (currentStatusTab.value == 'Ventes') {
      showLeadsSelledComponent.value = true
    } else if (currentStatusTab.value == 'Litiges') {
      showLeadsDisputedComponent.value = true
    } else if (currentStatusTab.value == 'Factures') {
      showLeadsFacturesComponent.value = true
    }
  }, '1500')
}
/** End search on my leads */

onMounted(async () => {
  //hide page loading
  //emit('toogle-page-loading', false)

  // check if in URL focus specefic section
  if (typeof route.hash != 'undefined' && route.hash != '') {
    let section_to_goto = route.hash.replaceAll('#', '')

    showLeadsBuyedComponent.value = false
    showLeadsSelledComponent.value = false
    showLeadsDisputedComponent.value = false
    showLeadsFacturesComponent.value = false

    if (section_to_goto == 'selled') {
      showLeadsSelledComponent.value = true
      currentStatusTab.value == 'Ventes'
    } else if (section_to_goto == 'disputed') {
      showLeadsDisputedComponent.value = true
      currentStatusTab.value == 'Litiges'
    } else if (section_to_goto == 'factures') {
      showLeadsFacturesComponent.value = true
      currentStatusTab.value == 'Factures'
    } else {
      showLeadsBuyedComponent.value = true
      currentStatusTab.value == 'Achats'
    }
  }
})
</script>

<template>
  <div class="container mt-4 mb-5">
    <nav class="navbar status-leads-navbar navbar-expand-lg text-white" data-bs-theme="dark">
      <div class="container-fluid">
        <a class="navbar-brand navbar-toggler active fw-bold fs-1 ps-0" href="#">{{
          currentStatusTab
        }}</a>
        <button
          class="navbar-toggler bg-green text-white border-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarColor02"
          aria-controls="navbarColor01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="pi pi-bars fs-4"></span>
        </button>
        <div class="collapse navbar-collapse border-white border-top mt-2" id="navbarColor02">
          <ul class="navbar-nav m-auto">
            <li class="nav-item">
              <a
                class="nav-link fw-bold me-lg-5 nav-leads-buyed"
                :class="{ active: showLeadsBuyedComponent }"
                @click="displayLeadStatusBlock($event, 'Achats')"
                href="#"
                >Achats</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link fw-bold mx-lg-5 nav-leads-selled"
                :class="{ active: showLeadsSelledComponent }"
                @click="displayLeadStatusBlock($event, 'Ventes')"
                href="#"
                >Ventes</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link fw-bold mx-lg-5 nav-leads-disputed"
                :class="{ active: showLeadsDisputedComponent }"
                @click="displayLeadStatusBlock($event, 'Litiges')"
                href="#"
                >Litiges</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link fw-bold ms-lg-5 nav-leads-factures"
                :class="{ active: showLeadsFacturesComponent }"
                @click="displayLeadStatusBlock($event, 'Factures')"
                href="#"
                >Factures</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="row status-leads-nav-searchBar mt-lg-0 mt-4">
      <div class="col-lg-10 offset-lg-1">
        <form @submit.prevent="searchOnMyLeads">
          <div class="input-group input-group-lg input-group-rounded">
            <input
              type="text"
              class="form-control input-left-rounded border-2 border-end-0"
              placeholder="Recherche"
              v-model="searched_leads"
              required
            />
            <button
              class="input-group-text rounded-end-pill text-white input-right-rounded"
              style="background-color: #21a085; border: 1px solid gray"
            >
              <img src="@/assets/pictos/loupe.svg" class="invert" />
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Leads Buyed Component -->
    <LeadsBuyedComponent v-if="showLeadsBuyedComponent" :searchedLeads="searched_leads" />

    <!-- Leads Selled Component -->
    <LeadsSelledComponent v-else-if="showLeadsSelledComponent" :searchedLeads="searched_leads" />

    <!-- Leads Disputed Component -->
    <LeadsDisputedComponent
      v-else-if="showLeadsDisputedComponent"
      :searchedLeads="searched_leads"
    />

    <!-- Leads Factures Component -->
    <LeadsFacturesComponent
      v-else-if="showLeadsFacturesComponent"
      :searchedLeads="searched_leads"
    />
  </div>
</template>

<style scoped>
.status-leads-navbar a {
  opacity: 0.5;
}
.status-leads-navbar a:hover {
  opacity: 1;
}
.status-leads-navbar a.active {
  opacity: 1;
}
@media only screen and (max-width: 991px) {
  .status-leads-navbar {
    background-color: #21a085;
    border-radius: 16px;
  }
  .status-leads-navbar a {
    color: white !important;
    font-size: 2rem !important;
  }
}
@media only screen and (min-width: 991px) {
  .status-leads-navbar a {
    color: #21a085 !important;
    font-size: xxx-large !important;
  }
}
</style>
