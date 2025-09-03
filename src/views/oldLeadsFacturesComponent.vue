<script setup>
import {ref, reactive, inject, onMounted} from 'vue'
import LeadItemComponent from '@/components/items/LeadItemComponent.vue'
import LeadItemFactureComponent from '@/components/items/LeadItemFactureComponent.vue'
import DownloadMultipleLeadsComponent from '@/components/items/DownloadMultipleLeadsComponent.vue'

const imgs_parent_dir = ((process.env.NODE_ENV)=='development')?'/src/assets':'/assets'

const tooglePageLoading = inject('tooglePageLoading')

let lead_item_infos_datas = reactive({
  lead_picto: imgs_parent_dir+'/pictos/house.svg',
  lead_activity_title: 'Infermier',
  lead_localisation: '17220',
  lead_submiter: 'Uluberlu',
  lead_date_start: '20/01/2024',
  lead_date_depot: 'Déposé le 01/12/2023',
  lead_name: 'Mehdi khenissi',
  lead_phone: '0602010305',
  lead_adress: '47 avenue gambetta, Rochefort',
  lead_email: 'Mehdi.khenissi@gmail.com',
  lead_description:
    "Le client, âgé de 60 ans, souhaite souligner qu'il n'est pas familier avec le domaine de la maçonnerie. C'est pour cette raison qu'il se tourne vers vous, espérant que votre expertise puisse le guider. Le client souhaite construire une clôture en parpaing autour de sa propriété. À cet effet, il envisage une longueur d'environ 50 mètres et une hauteur de 2 mètres. Il désire une finition lisse et uniforme, et est ouvert à vos recommandations pour un éventuel revêtement ou une peinture qui pourrait protéger et embellir la clôture. La durabilité étant essentielle pour lui, il aimerait que la fondation soit solide, et suggère l'ajout de poteaux de soutien à intervalles réguliers, si vous jugez cela pertinent.",
  lead_price: '125',
  status: ''
})

const show_modal = ref(false)
const childKey = ref(0)
/** Display lead infos and show modal if mobile */
function displayLeadItemInfos() {
  /** if mobile */
  if (window.innerWidth < 991) {
    if (show_modal.value) {
      show_modal.value = false
    } else {
      show_modal.value = true
    }
  }

  childKey.value++
  lead_item_infos_datas = {
    lead_picto: imgs_parent_dir+'/pictos/user.svg',
    lead_activity_title: 'Maconnerie ' + childKey.value++,
    lead_localisation: '1722' + childKey.value++,
    lead_submiter: 'Uluberlu ' + childKey.value++,
    lead_date_start: '20/01/2024',
    lead_date_depot: '01/12/2023',
    lead_name: 'Mehdi khenissi',
    lead_phone: '0602010305',
    lead_adress: '47 avenue gambetta, Rochefort',
    lead_email: 'Mehdi.khenissi@gmail.com',
    lead_description:
      "Le client, âgé de 60 ans, souhaite souligner qu'il n'est pas familier avec le domaine de la maçonnerie. C'est pour cette raison qu'il se tourne vers vous, espérant que votre expertise puisse le guider. Le client souhaite construire une clôture en parpaing autour de sa propriété. À cet effet, il envisage une longueur d'environ 50 mètres et une hauteur de 2 mètres. Il désire une finition lisse et uniforme, et est ouvert à vos recommandations pour un éventuel revêtement ou une peinture qui pourrait protéger et embellir la clôture. La durabilité étant essentielle pour lui, il aimerait que la fondation soit solide, et suggère l'ajout de poteaux de soutien à intervalles réguliers, si vous jugez cela pertinent.",
    lead_price: '125' + childKey.value++
  }
}

onMounted(async () => {

  //hide page loading
  tooglePageLoading(false)
})

</script>

<template>
    <!-- Liste des leads -->
    <div class="container row mt-5 m-auto">
      <!-- LEADS ITEMS -->
      <div class="col-lg-4 d-flex flex-column bloc-leads-items-list">
        <LeadItemComponent @click="displayLeadItemInfos" color-status-lead="bg-green">
          <template #lead-item-picto>
            <img src="@/assets/pictos/house.svg" class="w-100 invert" />
          </template>
          <template #lead-item-heading>
            <p class="fw-bold mb-1">Facture Maçonnerie</p>
            <p class="color-green fw-bold fs-4 align-self-end mb-1">
              125€
            </p>
          </template>
          <template #lead-item-content>
            <p class="m-0">Localisation 17220</p>
            <p class="mb-2">A commencer avant le 20/01/2024</p>
            <p class="mb-2">Déposé par Uluberlu</p>
          </template>
        </LeadItemComponent>

        <LeadItemComponent @click="displayLeadItemInfos" color-status-lead="bg-green">
          <template #lead-item-picto>
            <img src="@/assets/pictos/house.svg" class="w-100 invert" />
          </template>
          <template #lead-item-heading>
            <p class="fw-bold mb-1">Facture Maçonnerie</p>
            <p class="color-green fw-bold fs-4 align-self-end mb-1">
              125€
            </p>
          </template>
          <template #lead-item-content>
            <p class="m-0">Localisation 17220</p>
            <p class="mb-2">A commencer avant le 20/01/2024</p>
            <p class="mb-2">Déposé par Uluberlu</p>
          </template>
        </LeadItemComponent>

        <LeadItemComponent @click="displayLeadItemInfos" color-status-lead="bg-green">
          <template #lead-item-picto>
            <img src="@/assets/pictos/house.svg" class="w-100 invert" />
          </template>
          <template #lead-item-heading>
            <p class="fw-bold mb-1">Facture Maçonnerie</p>
            <p class="color-green fw-bold fs-4 align-self-end mb-1">
              125€
            </p>
          </template>
          <template #lead-item-content>
            <p class="m-0">Localisation 17220</p>
            <p class="mb-2">A commencer avant le 20/01/2024</p>
            <p class="mb-2">Déposé par Uluberlu</p>
          </template>
        </LeadItemComponent>

        <LeadItemComponent @click="displayLeadItemInfos" color-status-lead="bg-green">
          <template #lead-item-picto>
            <img src="@/assets/pictos/house.svg" class="w-100 invert" />
          </template>
          <template #lead-item-heading>
            <p class="fw-bold mb-1">Facture Maçonnerie</p>
            <p class="color-green fw-bold fs-4 align-self-end mb-1">
              125€
            </p>
          </template>
          <template #lead-item-content>
            <p class="m-0">Localisation 17220</p>
            <p class="mb-2">A commencer avant le 20/01/2024</p>
            <p class="mb-2">Déposé par Uluberlu</p>
          </template>
        </LeadItemComponent>
      </div>


      <!-- LEAD FACTURE COMPONENET -->
      <div class="col-lg-8 d-lg-inline-block d-none mt-lg-0 mt-5 p-0">
        <LeadItemFactureComponent :key="childKey" :leadItemInfosProps="lead_item_infos_datas" />

        <DownloadMultipleLeadsComponent />
      </div>

      <!-- LEAD FACTURE MODAL COMPONENET -->

    </div>
</template>

<style scoped>
.bloc-leads-items-list {
  gap: 1rem;
  cursor: pointer;
}
</style>