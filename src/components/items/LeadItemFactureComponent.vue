<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  formatDateToISOString
} from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

const accountService = inject('accountService')
const customService = inject('customService')
const tooglePageLoading = inject('tooglePageLoading')

const parentDatas = defineProps({
  leadItemInfosProps: Object,
  leadFullInfos: Boolean,
  leadToBuy: Boolean,
  leadBuyed: Boolean
})
console.log(parentDatas.leadItemInfosProps)

/** **** */
/** TO CALCULATe PRICE */
/** **** */

/** date selled created at (+ 2days)*/
let date_lead_selled_at = parentDatas.leadItemInfosProps.lead_sell.created_at.replace(
  /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
  '$3-$2-$1T$4:$5:$6'
)
let date_2_days_after_lead_selled_at = new Date(date_lead_selled_at)
date_2_days_after_lead_selled_at.setDate(date_2_days_after_lead_selled_at.getDate() + 2)

/** date validated */
let date_lead_validate_at = (parentDatas.leadItemInfosProps.lead_validated_at == null) ? null : parentDatas.leadItemInfosProps.lead_validated_at.replace(
  /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
  '$3-$2-$1T$4:$5:$6'
)
date_lead_validate_at = new Date(date_lead_validate_at)

/** date litige closed at (+2 days) */
let date_2_days_after_litige_closed_at = null;
if (parentDatas.leadItemInfosProps.lead_litige.closed_at != null) {
  date_2_days_after_litige_closed_at =
    parentDatas.leadItemInfosProps.lead_litige.closed_at.replace(
      /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/,
      '$3-$2-$1T$4:$5:$6'
    )
  date_2_days_after_litige_closed_at = new Date(date_2_days_after_litige_closed_at)
  date_2_days_after_litige_closed_at.setDate(date_2_days_after_litige_closed_at.getDate() + 2)
}

/** check if lead validated manually */
const lead_validited_manually = ref(false)
if(Date.parse(date_lead_validate_at) < Date.parse(date_2_days_after_lead_selled_at)){
   lead_validited_manually.value = true
}
else if( (typeof date_2_days_after_litige_closed_at != "undefined" && date_2_days_after_litige_closed_at != null) && ( Date.parse(date_lead_validate_at) < Date.parse(date_2_days_after_litige_closed_at) ) ){
  lead_validited_manually.value = true
}

//console.log(lead_validited_manually.value)

/** calcule prices */
const price_ttc = ref( parentDatas.leadItemInfosProps.lead_sell.pricing );
const price_ht = ref(price_ttc.value / 1.2);
const tva = ref(price_ttc.value - price_ht.value);
const frais = ref ( (parentDatas.leadItemInfosProps.lead_price_increase == parentDatas.leadItemInfosProps.lead_sell.pricing) ? (parentDatas.leadItemInfosProps.lead_price_tpl *2) : (parentDatas.leadItemInfosProps.lead_price_tpl) );

/** **** */
/** END TO CALCULATE PRICE */
/** **** */

/** download invoice */
async function downloadInvoice(id_sell){
  isAlertShowed.value = false
  tooglePageLoading(true)

  await customService
    .downloadInvoice(
      accountService.getToken(),
      id_sell
    )
    .then(async (response) => {
      console.log(response)

      // Create a Blob from the response data
      const file = new Blob([response.data], { type: 'application/pdf' })

      // Generate a URL for the file
      const fileURL = URL.createObjectURL(file)

      // Create a temporary anchor element for downloading
      const link = document.createElement('a')
      link.href = fileURL
      link.setAttribute('download', parentDatas.leadItemInfosProps.lead_sell.invoice_num+'.pdf') // Name the file

      // Append the link to the DOM and trigger the download
      document.body.appendChild(link)
      link.click()

      // Clean up by removing the link
      link.parentNode.removeChild(link)

      isAlertShowed.value = true
      alertParams.value.type = 'alert-success text-center'
      alertParams.value.message =
        'Votre téléchargement a etait effectuer avec succès, veuillez vérifier votre dossier de téléchargement.'

    })
    .catch(async (error) => {
      console.log(error)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      alertParams.value.message =
        'Une erreur est survenue, veuillez ressayer plus tard ou contacter le support technique.'
    })

    tooglePageLoading(false)
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

</script>

<template>
  <div class="lead-facture d-flex flex-wrap border-tml bloc-lead-item-max-infos">
    <div class="row align-items-center w-100 m-0" style="height: fit-content">
      <div class="col-lg-2 col-3 bg-green activity-picto text-center py-2">
        <img :src="leadItemInfosProps.lead_picto" class="invert" width="50" />
      </div>
      <div class="col-lg-10 col-9">
        <h2 class="fw-bold">{{ leadItemInfosProps.lead_activity_title }}</h2>
      </div>
    </div>
    <div class="container">
      <div class="row align-items-center w-100 m-0 mt-3">
        <div class="col-lg-6">
          <div class="col-12">
            <p class="fw-bold m-0 fs-5">Nom</p>
            <p>{{ leadItemInfosProps.lead_name }}</p>
          </div>
          <div class="col-12">
            <p class="fw-bold m-0 fs-5">Adresse</p>
            <p>Déposé par {{ leadItemInfosProps.lead_adress }}</p>
          </div>
          <div class="col-12">
            <p class="fw-bold m-0 fs-5">Acheté/Vendu le</p>
            <p>{{ leadItemInfosProps.lead_date_depot }}</p>
          </div>
          <div class="col-12">
            <p class="fw-bold m-0 fs-5">Acheteur/Vendeur</p>
            <p>Déposé le {{ leadItemInfosProps.lead_enterprise.name }}</p>
          </div>
        </div>

        <div class="col-lg-6 align-self-start">
          <p class="fw-bold fs-5">Détails</p>
          <div class="d-flex flex-row align-items-center">
            <p class="text-nowrap text-secondary fw-bold ps-2 w-auto m-0">Montant du lead (TTC)</p>
            <p class="ponctuation-price w-100 mx-1">&nbsp;</p>
            <p class="fw-bold text-secondary w-auto text-nowrap m-0">
              {{
                parseFloat(
                  leadItemInfosProps.lead_price_seller
                ).toFixed(2)
              }}€
            </p>
          </div>
          <div class="d-flex flex-row align-items-center" v-if="leadItemInfosProps.lead_status == 'denied'">
            <p class="text-nowrap text-secondary fw-bold ps-2 w-auto m-0">Montant remboursé </p>
            <p class="ponctuation-price w-100 mx-1">&nbsp;</p>
            <p class="fw-bold text-secondary w-auto text-nowrap m-0">
              - {{
                parseFloat(
                  leadItemInfosProps.lead_price_seller
                ).toFixed(2)
              }}€
            </p>
          </div>
          <div class="d-flex flex-row align-items-center">
            <p class="text-nowrap text-secondary fw-bold ps-2 w-auto m-0">Montant des frais (TTC)</p>
            <p class="ponctuation-price w-100 mx-1">&nbsp;</p>
            <p class="fw-bold text-secondary w-auto text-nowrap m-0">
              {{ parseFloat(
                   frais
                ).toFixed(2) }}€
            </p>
          </div>

          <hr class="my-1" />

          <div class="d-flex flex-row align-items-center ps-5">
            <p class="text-nowrap text-secondary text-uppercase fw-bold ps-2 w-auto m-0">
              Total HT
            </p>
            <p class="ponctuation-price w-100 mx-1">&nbsp;</p>
            <p class="fw-bold text-secondary w-auto text-nowrap m-0">
              {{ parseFloat(price_ht).toFixed(2) }}€
            </p>
          </div>
          <div class="d-flex flex-row align-items-center ps-5">
            <p class="text-nowrap text-secondary text-uppercase fw-bold ps-2 w-auto m-0">TVA</p>
            <p class="ponctuation-price w-100 mx-1">&nbsp;</p>
            <p class="fw-bold text-secondary w-auto text-nowrap m-0">
              {{ parseFloat(tva).toFixed(2) }}€
            </p>
          </div>

          <hr class="my-1" />

          <div class="d-flex flex-row align-items-center">
            <p class="text-nowrap text-uppercase fw-bold ps-2 w-auto m-0">Total TTC</p>
            <p class="ponctuation-price w-100 mx-1">&nbsp;</p>
            <p class="fw-bold w-auto text-nowrap m-0">{{ parseFloat(price_ttc).toFixed(2) }}€ </p>
          </div>
        </div>
      </div>
    </div>

    <alert class="col-md-12">

      

    </alert>

    <!-- ALERT -->
    <AlertComponent
          v-if="isAlertShowed"
          :alert-params="{
            additionalClasses: alertParams.type + ' col-lg-10 offset-lg-1 mt-5',
            dismissSecs: alertParams.dismissSecs,
            message: alertParams.message
          }"
          @toggle-alert="toggleAlert"
        />

    <div class="row align-items-center w-100 align-self-end m-0">
      <div class="col-12 p-0">
        <!-- <a :href="leadItemInfosProps.lead_sell.invoice_link" target="_blank"> -->
        <a @click="downloadInvoice(leadItemInfosProps.lead_sell.id)">
          <button
          type="button"
          class="btn btn-default bg-green text-white btn-buy-lead float-end fs-3 fw-bold"
        >
          <img src="@/assets/pictos/laisser.svg" class="invert" width="40" /> Télécharger la facture
        </button>
      </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bloc-lead-item-max-infos .activity-picto {
  border-radius: 14px 0;
}

.bloc-lead-item-max-infos .btn-buy-lead {
  border-radius: 14px 0;
}

.lead-facture .ponctuation-price {
  border-bottom: 2px dotted #6c757d;
}
</style>
