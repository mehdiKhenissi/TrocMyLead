<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import {
  simplifiedStr,
  formatTimestampToDateString,
  formatDateToISOString
} from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

const accountService = inject('accountService')
const leadService = inject('leadService')
const sellService = inject('sellService')
const customService = inject('customService')
const tooglePageLoading = inject('tooglePageLoading')

const form_download_multiple_invoices = reactive({
  date_from: null,
  date_to: null
})

/** function download factures */
async function oldDownloadMultipleFactures() {
  //alert('ok');
  //console.log(form_download_multiple_invoices.date_from.replace('T', ' '))
  //console.log(form_download_multiple_invoices.date_to)
  //getSellsInvoicesBuyedSelled
  await sellService
    .getSellsInvoicesBuyedSelled(
      accountService.getToken(),
      form_download_multiple_invoices.date_from.replace('T', ' '),
      form_download_multiple_invoices.date_to.replace('T', ' ')
    )
    .then(async (response) => {
      console.log(response)
      if (
        typeof response.data != 'undefined' &&
        typeof response.data.sells_invoices != 'undefined'
      ) {
        let sells_invoices = response.data.sells_invoices
        for (let sii = 0; sii < sells_invoices.length; sii++) {
          //alert('download invoice '+sells_invoices[sii].id)
          console.log(sells_invoices[sii].id)
          console.log(sells_invoices[sii].invoice_link)

          const newWindow = await window.open(sells_invoices[sii].invoice_link, '_blank')
          console.log(newWindow)
          // var checkWindow = setInterval(function () {
          //   if (newWindow.closed) {
          //     clearInterval(checkWindow)
          //     console.log('La fenêtre de téléchargement a été fermée.')
          //     // Effectuer des actions après la fermeture de la fenêtre
          //   }
          // }, 1000)
        }

        //alert('downloading done, please check your download folder')
      } else {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger text-center'
        alertParams.value.message = response.data.message
      }
    })
    .catch(async (error) => {
      console.log(error)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      alertParams.value.message =
        'Une erreur est survenue, veuillez ressayer plus tard ou contacter le support technique.'
    })

  /**  */
  //window.open('https://pay.stripe.com/invoice/acct_1OI6r5DePNMea6Fp/test_YWNjdF8xT0k2cjVEZVBOTWVhNkZwLF9QVm9CM1dEUGd0bjRLUHZ4NGNvNVBUYThFZnVyeTJVLDk3NzU4NzQ30200SZ010fvF/pdf?s=ap', '_parent');
}

async function downloadMultipleFactures() {
  isAlertShowed.value = false
  tooglePageLoading(true)

  await customService
    .downloadMultipleInvoices(
      accountService.getToken(),
      form_download_multiple_invoices.date_from + ' 00:00',
      form_download_multiple_invoices.date_to + ' 23:59'
    )
    .then(async (response) => {
      console.log(response)

      if (typeof response.data != "undefined" && (typeof response.data.size != "udnefined" && response.data.size == "2")) {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-warning text-center'
        alertParams.value.message =
          'Aucune facture trouvée pour ces dates'
      } else {
        // Create a Blob from the response data
        const file = new Blob([response.data], { type: 'application/zip' })

        // Generate a URL for the file
        const fileURL = URL.createObjectURL(file)

        // Create a temporary anchor element for downloading
        const link = document.createElement('a')
        link.href = fileURL
        link.setAttribute('download', 'TML_factures.zip') // Name the file

        // Append the link to the DOM and trigger the download
        document.body.appendChild(link)
        link.click()

        // Clean up by removing the link
        link.parentNode.removeChild(link)

        isAlertShowed.value = true
        alertParams.value.type = 'alert-success text-center'
        alertParams.value.message =
          'Votre téléchargement a etait effectuer avec succès, veuillez vérifier votre dossier de téléchargement sur votre appareil.'
      }
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
  <div class="col-12 border-tml bloc-lead-item-max-infos mt-5">
    <div class="d-flex flex-wrap h-100">
      <div class="row align-items-center w-100 m-0" style="height: fit-content">
        <div class="col-lg-2 col-3 bg-green activity-picto text-center py-2">
          <img src="@/assets/pictos/laisser.svg" class="invert" width="50" />
        </div>
        <div class="col-lg-10 col-9">
          <h2 class="fw-bold">Téléchargement groupé</h2>
        </div>
      </div>

      <form @submit.prevent="downloadMultipleFactures" class="w-100">
        <div class="container">
          <div class="row align-items-center w-100 m-0 my-4">
            <div class="col-lg-6">
              <div class="row mb-3">
                <label class="col-2 col-form-label fw-bold text-end px-0">Du</label>
                <div class="col-10">
                  <input
                    type="date"
                    class="form-control input-troc-my-lead rounded-pill border-2"
                    v-model="form_download_multiple_invoices.date_from"
                    required
                  />
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="row mb-3">
                <label class="col-2 col-form-label fw-bold text-end px-0">Au</label>
                <div class="col-10">
                  <input
                    type="date"
                    class="form-control input-troc-my-lead rounded-pill border-2"
                    v-model="form_download_multiple_invoices.date_to"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ALERT -->
        <AlertComponent
          v-if="isAlertShowed"
          :alert-params="{
            additionalClasses: alertParams.type + ' col-lg-10 offset-lg-1',
            dismissSecs: alertParams.dismissSecs,
            message: alertParams.message
          }"
          @toggle-alert="toggleAlert"
        />

        <div class="row align-items-center w-100 align-self-end m-0">
          <div class="col-12 p-0">
            <button
              type="submit"
              class="btn btn-default bg-green text-white btn-buy-lead float-end fs-3 fw-bold"
            >
              <img src="@/assets/pictos/laisser.svg" class="invert" width="40" /> Télécharger les
              factures
            </button>
          </div>
        </div>
      </form>
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
