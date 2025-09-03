<script setup>
import { ref, onMounted, provide, onBeforeMount, inject } from 'vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import { useRoute } from 'vue-router'
import AlertComponent from '@/components/various/AlertComponent.vue'
import axios from 'axios'
import { formatTimestampToDateString, formatDateToISOString } from '@/assets/js/customFunctions.js'
import ModalConnectionComponent from '@/components/items/modalConnectionComponent.vue'

// injections
const accountService = inject('accountService')
const leadService = inject('leadService')
const enterpriseService = inject('enterpriseService')
const stripeService = inject('stripeService')
const sellService = inject('sellService')
const tooglePageLoading = inject('tooglePageLoading')

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

const route = useRoute()
//get params
const stripe_checkout_session_id = route.query.session_id
const lead_buyed_id = route.query.lid

const lead_buyed_informations = ref(null)
const enterprise_buyer_informations = ref(null)
const stripe_session_informations = ref(null)
const stripe_session_created_date = ref(null)
const stripe_invoice_informations = ref(null)
const error_showing_payment_infos = ref(false)

async function downloadInvoice() {
  //alert('ok');
  //console.log(stripe_invoice_informations.value.invoice_pdf);
  window.open(stripe_invoice_informations.value.invoice_pdf, '_blank')
}

// function formatTimestampToDateString(timestamp) {
//   const date = new Date(timestamp * 1000)
//   const options = {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: false // Use 24-hour format
//   }

//   const formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date)
//   return formattedDate.replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6')
// }

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}
/** END ALERT */

/** on before mount */
const show_connection_modal = ref(false)
onBeforeMount(async () => {
  /** check if user connected before payment */
  if (!accountService.isLogged()) {
    //alert('not connected')
    show_connection_modal.value = true
  }

  if (typeof stripe_checkout_session_id != 'undefined' && typeof lead_buyed_id != 'undefined') {
    /** Lead informations */
    await leadService
      .getLead(lead_buyed_id)
      .then(async (res) => {
        /*console.log('---lead infos---')
        console.log(res)*/
        if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
          lead_buyed_informations.value = res.data
        }
      })
      .catch(async (err) => {
        console.log(err)
      })

    /** Enterprise informations */
    await enterpriseService
      .getEnterprise(
        accountService.getToken(),
        JSON.parse(accountService.getSessionUser()).enterprise.id
      )
      .then(async (res) => {
        /*console.log('---enterprise infos---')
        console.log(res)*/
        if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
          enterprise_buyer_informations.value = res.data
        }
      })
      .catch(async (err) => {
        console.log(err)
      })

    /** stripe session informations */
    await stripeService
      .stripeRetieveSession(accountService.getToken(), stripe_checkout_session_id)
      .then(async (res) => {
        /*console.log('---session---')
        console.log(res)*/
        if (typeof res.data != 'undefined' && typeof res.data.session_data.id != 'undefined') {
          stripe_session_informations.value = res.data.session_data
          stripe_session_created_date.value = formatTimestampToDateString(
            stripe_session_informations.value.created
          )

          isAlertShowed.value = true
          alertParams.value.type = 'alert-success text-center fs-6'
          alertParams.value.message = alertParams.value.message = 'L\'achat du prospect a été effectué avec succès, veuillez vérifier ses informations et le valider ou créer une reclamation, sinon ca sera valider automatiquement après 48 heures <br/> <a href="/account/status-leads" class="fw-bold fs-6"> Consulter la liste des leads achetés </a>'
        } else {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-warning'

          alertParams.value.message =
            'Erreur récupération informations de paiement, veuillez ressayer ultérieurement ou contacter le service technique'
        }
      })
      .catch(async (err) => {
        if (err.response.data.message == 'Expired JWT Token') {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-danger text-center mt-5'
          alertParams.value.message =
            'Votre session est expiré, veuillez vous reconnecter à nouveau.'
        } else {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-danger'
          alertParams.value.message =
            'Erreur récupération informations de paiement, veuillez ressayer ultérieurement ou contacter le service technique'
        }

        tooglePageLoading(false)
      })

    /** INSERT NEW SELL ROW and Update Lead Status */
    await sellService
      .createSell(accountService.getToken(), {
        pricing: (stripe_session_informations.value.amount_total / 100).toString(),
        statut: stripe_session_informations.value.payment_status,
        //lead: lead_buyed_informations.value['@id'],
        lead: lead_buyed_informations.value.id,
        idStripe: stripe_session_informations.value.id,
        //buyerEnterprise: enterprise_buyer_informations.value['@id'],
        buyerEnterprise: enterprise_buyer_informations.value.id,
        stripePaymentId: stripe_session_informations.value.payment_intent
      })
      .then(async (res) => {
        //console.log(res)
        //console.log(res.data.message.search("Duplicate entry"))
        if (
          typeof res.data != 'undefined' &&
          (typeof res.data.id_sell != 'undefined' ||
            res.data.message.search('Duplicate entry') !== -1)
        ) {
          /** upodate statut lead */
          await leadService
            .updateStatusLead(accountService.getToken(), {
              id: lead_buyed_informations.value.id,
              status: 'reserved'
            })
            .then(async (res) => {
              //console.log(res)
              if (
                typeof res.data != 'undefined' &&
                typeof res.data.id_lead_updated != 'undefined'
              ) {
                isAlertShowed.value = true
                alertParams.value.type = 'alert-success text-center fs-6'
                alertParams.value.message = 'L\'achat du prospect a été effectué avec succès, veuillez vérifier ses informations et le valider ou créer une reclamation, sinon ca sera valider automatiquement après 48 heures <br/> <a href="/account/status-leads" class="fw-bold fs-6"> Consulter la liste des leads achetés </a>'
              } else {
                // ERREUR MJ DES INFOS LEAD (statut)
                isAlertShowed.value = true
                alertParams.value.type = 'alert-warning text-center'
                alertParams.value.message =
                  'L\'achat du prospect a été effectué avec succès. <br> ⚠️ Erreur modification status lead vendu (' +
                  res.data.message +
                  '), veuillez actualiser la page ou contacter le service technique'
              }
            })
            .catch(async (err) => {
              console.log(err)
              isAlertShowed.value = true
              alertParams.value.type = 'alert-warning text-center'
              alertParams.value.message =
                'L\'achat du prospect a été effectué avec succès. <br> ⚠️ Erreur modification status lead vendu, veuillez actualiser la page ou contacter le service technique'
            })
        } else {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-warning text-center'
          alertParams.value.message =
            'L\'achat du prospect a été effectué avec succès. <br> ⚠️ Erreur sauvegarde des informations de ventes, veuillez actualiser la page ou contacter le service technique'
        }

        //hide page loading
        emit('toogle-page-loading', false)
      })
      .catch(async (err) => {
        //console.log(err)
        if (err.response.data.detail.includes('Duplicate entry')) {
          /** check sell row duplicated with new strip informations */
          await sellService
            .getSellByLeadId(accountService.getToken(), lead_buyed_informations.value.id)
            .then(async (res) => {
              console.log(res)
              if (typeof res.data != 'undefined' && typeof res.data.sell_data != 'undefined') {
                if (
                  res.data.sell_data.buyer_enterprise.id !=
                    enterprise_buyer_informations.value.id &&
                  res.data.sell_data.id_stripe != stripe_session_informations.value.id
                ) {
                  isAlertShowed.value = true
                  alertParams.value.type = 'alert-warning text-center'
                  alertParams.value.message =
                    'L\'achat du prospect a été effectué avec succès. <br> ⚠️ Erreur acquisition du lead, le lead est déjà réservé! veuillez contacter le service technique.'
                }
              }
            })
            .catch(async (err) => {
              console.log(err)
              isAlertShowed.value = true
              alertParams.value.type = 'alert-warning text-center'
              alertParams.value.message =
                'L\'achat du prospect a été effectué avec succès. <br> ⚠️ Erreur sauvegarde des informations de paiement (informations paiment existe déjà), veuillez contacter le service technique pour ce probléme'
            })
        } else {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-warning text-center'
          alertParams.value.message =
            'L\'achat du prospect a été effectué avec succès. <br> ⚠️ Erreur sauvegarde des informations de paiement, veuillez actualiser la page ou contacter le service technique'
        }

        //hide page loading
        emit('toogle-page-loading', false)
      })
  } 
  else {
    isAlertShowed.value = true
    alertParams.value.type = 'alert-danger text-center mt-5 mb-4'
    alertParams.value.message =
      'Impossible de récupérer les informations de paiement, paramétres manquants'
    //hide page loading
    emit('toogle-page-loading', false)
  }

  //hide page loading
  emit('toogle-page-loading', false)
})

/** on mount */
onMounted(() => {
  //hide page loading
  //emit('toogle-page-loading', false)
})
</script>
<template>
  <div class="container py-5">
    <div class="col-lg-8 offset-lg-2 border-tml p-2">
      <!-- <div class="alert alert-success text-center mb-5">
        <p class="fw-bold fs-5">L'achat du prospect a été effectué avec succès</p>
      </div> -->

      <!-- ALERT -->
      <AlertComponent
        v-if="isAlertShowed"
        :alert-params="{
          additionalClasses: alertParams.type + ' col-12',
          dismissSecs: alertParams.dismissSecs,
          message: alertParams.message
        }"
        @toggle-alert="toggleAlert"
      />

      <div class="row bg-light m-0" v-if="stripe_session_informations">
        <div class="col-12 fw-bold">
          <div class="row">
            <div class="col-12 mb-3">
              <b>Date de la transaction: </b> {{ stripe_session_created_date }}
            </div>
            <div class="col-lg-6 mb-3">
              <u><b>Utilisateur: </b></u>
              <ul class="list-group">
                <li class="list-group-item">
                  <b>Nom complet: </b>
                  <label v-if="stripe_session_informations.customer_details.name">{{
                    stripe_session_informations.customer_details.name
                  }}</label
                  ><label v-else>-</label>
                </li>
                <li class="list-group-item">
                  <b>Email: </b> {{ stripe_session_informations.customer_details.email }}
                </li>
                <li class="list-group-item">
                  <b>Adresse: </b> {{ stripe_session_informations.customer_details.address.line1 }}
                  {{ stripe_session_informations.customer_details.address.postal_code }}
                  {{ stripe_session_informations.customer_details.address.city }} France
                </li>
                <li class="list-group-item">
                  <b>Téléphone: </b>
                  <label v-if="stripe_session_informations.customer_details.phone">{{
                    stripe_session_informations.customer_details.phone
                  }}</label
                  ><label v-else>-</label>
                </li>
              </ul>
            </div>
            <div class="col-lg-6 mb-3 fw-bold">
              <u><b>Informations paiement: </b></u>
              <ul class="list-group">
                <li class="list-group-item">
                  <b>Montant payer: </b> {{ stripe_session_informations.amount_total / 100 }}
                  {{ stripe_session_informations.currency }}
                </li>
                <li class="list-group-item">
                  <b>Moyen de paiement: </b>
                  {{ stripe_session_informations.payment_method_types[0] }}
                </li>
                <li class="list-group-item">
                  <b>Référence: </b> {{ stripe_session_informations.payment_intent }}
                </li>
                <li class="list-group-item">
                  <b>Reçu & facture:</b> <br />
                  <a
                    v-if="stripe_invoice_informations"
                    :href="stripe_invoice_informations.hosted_invoice_url"
                    class="text-underline"
                    target="_blank"
                    style="cursor: pointer"
                  >
                    Facture & reçu de paiement <i class="pi pi-eye"></i
                  ></a>
                  <a class="fs-6 text-decoration-none text-dark" v-else>Ce sera générer après validation du prospect</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!--div class="col-12 d-flex align-items-center pt-4">
          <div class="col-12 text-center">
            <ButtonItemComponent
              type_button="button"
              picto_button=""
              text_button="🧾 Télécharger la facture"
              class="m-auto"
              :class="{ disabled: stripe_invoice_informations === null }"
              @click="downloadInvoice"
            />
          </div>
        </div-->
      </div>
    </div>
  </div>

  <!-- MODAL CONNECTION
       COMPONENT -->
  <!-- Modal -->
  <ModalConnectionComponent v-if="show_connection_modal" />
</template>
