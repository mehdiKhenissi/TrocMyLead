<script setup>
import { ref, reactive, onBeforeMount, onMounted, defineEmits, inject } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
// export default {
//     computed: {
//         state() {
//             return this.name.length >= 4
//         },
//         invalidFeedback() {
//             if (this.name.length > 0) {
//                 return 'Enter at least 4 characters.'
//             }
//             return 'Please enter something.'
//         }
//     },
//     data() {
//         return {
//             name: ''
//         }
//     }
// }

const route = useRoute()
//get params
const stripe_checkout_session_id = route.query.session_id
const search_lead_domain = route.query.domain
const search_lead_localisation = route.query.localisation

const form_search_leads = reactive({
  lead_domain_searched: '',
  lead_localisation_searched: ''
})

async function searchLeads() {
  let queryParams = {}
  if (form_search_leads.lead_domain_searched != '') {
    queryParams.domain = form_search_leads.lead_domain_searched
  }

  if (form_search_leads.lead_localisation_searched != '') {
    queryParams.localisation = form_search_leads.lead_localisation_searched
  }

  //console.log(router.currentRoute.value.name)
  if (router.currentRoute.value.name == 'listLeads') {
    await router.push({
      name: 'listLeads',
      query: queryParams
    })
    location.reload();
  } else {
    router.push({
      name: 'listLeads',
      query: queryParams
    })
  }
}
</script>

<template>
  <form class="search-leads-form" @submit.prevent="searchLeads">
    <div class="input-group input-group-lg input-group-rounded">
      <!-- <input type="text" class="form-control input-left-rounded" placeholder="Domaine" /> -->
      <select
        class="form-select input-troc-my-lead input-left-rounded border-tml"
        v-model="form_search_leads.lead_domain_searched"
        :required="
          form_search_leads.lead_domain_searched == '' &&
          form_search_leads.lead_localisation_searched == ''
        "
      >
        <option value="" selected>- domaine d'activité -</option>
        <option value="Art">Art</option>
        <option value="Tunnel">Tunnel</option>
        <option value="Réseaux">Réseaux</option>
        <option value="Électricité">Électricité</option>
        <option value="Maritime">Maritime</option>
        <option value="Génie Civil">Génie Civil</option>
        <option value="Démolition">Démolition</option>
        <option value="Terrassement">Terrassement</option>
        <option value="Forage">Forage</option>
        <option value="Plomberie">Plomberie</option>
        <option value="Thermique">Thermique</option>
        <option value="Isolation">Isolation</option>
        <option value="Plâtrerie">Plâtrerie</option>
        <option value="Sol">Sol</option>
        <option value="Menuiserie">Menuiserie</option>
        <option value="Serrurerie">Serrurerie</option>
        <option value="Agencement">Agencement</option>
        <option value="Revêtement">Revêtement</option>
        <option value="Peinture">Peinture</option>
        <option value="Charpente">Charpente</option>
        <option value="Couverture">Couverture</option>
        <option value="Étanchéité">Étanchéité</option>
        <option value="Structure">Structure</option>
        <option value="Maçonnerie">Maçonnerie</option>
        <option value="Automobile">Automobile</option>
        <option value="Elagage">Elagage</option>
        <option value="Paysage">Paysage</option>
      </select>
      <input
        type="number"
        class="form-control border-right-0"
        placeholder="Localisation(code postal)"
        v-model="form_search_leads.lead_localisation_searched"
        :required="
          form_search_leads.lead_domain_searched == '' &&
          form_search_leads.lead_localisation_searched == ''
        "
      />
      <!-- <router-link :to="{ name: 'listLeads', params: { query: 'coucou' } }"> -->
      <!-- <router-link :to="{ name: 'listLeads', query: { domain: 'domain', localisation: 'localisation' } }"> -->
      <button
        type="submit"
        class="btn input-group-text rounded-end-pill text-white input-right-rounded d-flex align-items-center"
        style="background-color: #21a085; border: 1px solid gray"
      >
        <img src="@/assets/pictos/loupe.svg" class="invert" />
      </button>
    </div>
  </form>
</template>
