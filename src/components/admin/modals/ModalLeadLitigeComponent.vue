<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { simplifiedStr, formatDateToISOString } from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const tooglePageLoading = inject('tooglePageLoading')
const accountService = inject('accountService')
const leadService = inject('leadService')
const litigeService = inject('litigeService')
const litigeStepService = inject('litigeStepService')
const stripeService = inject('stripeService')
const sellService = inject('sellService')

const imgs_parent_dir = ((process.env.NODE_ENV)=='development')?'/src/assets':'/assets'

/** variable from parent  */
const parentDatas = defineProps({
  leadLitigeItemInfosProps: Object
})
console.log(parentDatas.leadLitigeItemInfosProps)

/** Function from parent */
const emit = defineEmits(['displayLeadLitigeCheckingModal'])

/** variabls */
let reloadPage = false
const showReopenLitige = ref(false)

/** REPONSE CHECKING LITIGE LEAD */
let response_checking_litige_lead = ref(null)
async function enableBtnResponseCheckingLitigeLeadIsDisabled(event) {
  if (event.target.value != '') {
    $(document).find('.btn-response-checking-litige-lead').removeClass('disabled')
  } else {
    $(document).find('.btn-response-checking-litige-lead').addClass('disabled')
  }
}
async function addCommentaryCheckingLitigeLead(event) {
  tooglePageLoading(true)

  /** api create litige step */
  let form_update_lead = {
    step: 0,
    commentary: response_checking_litige_lead.value,
    litige: parentDatas.leadLitigeItemInfosProps['@id']
  }
  await litigeStepService
    .createLitigeStep(accountService.getToken(), form_update_lead)
    .then(async (resCreateLitigeStep) => {
      console.log(resCreateLitigeStep)
      if (
        typeof resCreateLitigeStep.data != 'undefined' &&
        typeof resCreateLitigeStep.data.id != 'undefined'
      ) {
        // update litige ( status en cours )
        litigeService
          .updateLitige(accountService.getToken(), {
            id: parentDatas.leadLitigeItemInfosProps.id,
            status: 'checking'
          })
          .then(async (resUpdateLitige) => {
            if (typeof resUpdateLitige.data != 'undefined') {
              tooglePageLoading(false)
              //alert('ok');
              alert('Commentaire ajouter avec succès.')

              $(document)
                .find('#collapseOne .accordion-body .bloc-to-input-commentary')
                .before(
                  '<div class="col-12 list-commentaire-checking-litige"><p class="p-2 border clearfix commentary-content fw-bold" style="background-color:#c1c1c1"> - ' +
                    response_checking_litige_lead.value +
                    '<button type="button" class="btn btn-danger btn-sm float-end" id="' +
                    resCreateLitigeStep.data.id +
                    '" @click="deleteLitigeStep">X</button></p></div>'
                )

              //reset form
              response_checking_litige_lead.value = null
            }
            console.log(resUpdateLitige)
          })
          .catch(async (errorUpdateLitige) => {
            tooglePageLoading(false)

            $(document)
              .find('#collapseOne .accordion-body .bloc-to-input-commentary')
              .before(
                '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
              )

            console.log(err)
          })
      }

      $(document).find('.btn-response-checking-litige-lead').addClass('disabled')
    })
    .catch((errCreateLitigeStep) => {
      tooglePageLoading(false)

      $(document)
        .find('#collapseOne .accordion-body .bloc-to-input-commentary')
        .before(
          '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
        )

      console.log(err)
    })

  reloadPage = true // to reload page when modal is close
}

/** RESPONSE VALID/BAN LEAD */
let response_valid_ban_litige_lead = ref(null)
async function enableBtnResponseValidBanLeadIsDisabled(event) {
  if (event.target.value != '') {
    $(document).find('.btn-response-valid-ban-lead').removeClass('disabled')
  } else {
    $(document).find('.btn-response-valid-ban-lead').addClass('disabled')
  }
}
async function responseValidBanLitigeLead(event) {
  tooglePageLoading(true)
  let status_lead_after_checking_litige = null
  let mesg_alert_confirmation = null
  if (event.target.id == 'lead-to-valid') {
    status_lead_after_checking_litige = 'valid'
    mesg_alert_confirmation = 'Êtes-vous sûr de vouloir valider le Lead.'
  } else if (event.target.id == 'lead-to-denied') {
    status_lead_after_checking_litige = 'denied'
    mesg_alert_confirmation = 'Êtes-vous sûr de vouloir désaprouver le Lead.'
  }

  if (confirm(mesg_alert_confirmation)) {
    if (status_lead_after_checking_litige == 'valid') {
      /** capture payment */
      await stripeService
        .stripeCapturPayment(
          accountService.getToken(),
          parentDatas.leadLitigeItemInfosProps.lead.sell.stripe_payment_id
        )
        .then(async (resCapturPayment) => {
          console.log(resCapturPayment)
          if (typeof resCapturPayment.data != 'undefined' && resCapturPayment.data.code == '200') {
            // update selle
            afterResponseValidBanLitigeLead(status_lead_after_checking_litige, resCapturPayment)
          } else {
            tooglePageLoading(false)
            $(document)
              .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
              .before(
                '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
              )
          }
        })
        .catch(async (erroCapturPayment) => {
          tooglePageLoading(false)
          $(document)
            .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
            .before(
              '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
            )
        })
    } else {
      /** cancel payment */
      await stripeService
        .stripeRefundPayment(
          accountService.getToken(),
          parentDatas.leadLitigeItemInfosProps.lead.sell.stripe_payment_id
        )
        .then(async (resCapturPayment) => {
          console.log(resCapturPayment)
          if (typeof resCapturPayment.data != 'undefined' && resCapturPayment.data.code == '200') {
            // update selle
            afterResponseValidBanLitigeLead(status_lead_after_checking_litige, resCapturPayment)
          } else {
            tooglePageLoading(false)
            $(document)
              .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
              .before(
                '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
              )
          }
        })
        .catch(async (erroCapturPayment) => {
          tooglePageLoading(false)
          $(document)
            .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
            .before(
              '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
            )
        })
    }
  } else {
    tooglePageLoading(false)
  }

  // reloadPage = true // to reload page when modal is close
}

/** */
async function afterResponseValidBanLitigeLead(
  status_lead_after_checking_litige,
  resCapturPayment
) {
  /** api update sell row */
  await sellService
    .updateSell(accountService.getToken(), {
      id: parentDatas.leadLitigeItemInfosProps.lead.sell.id,
      statut: status_lead_after_checking_litige == 'valid' ? 'paid' : 'refund',
      invoiceId: resCapturPayment.data.infos.invoice.id,
      invoiceNum: resCapturPayment.data.infos.invoice.invoice_num,
      invoiceLink: resCapturPayment.data.infos.invoice.invoice_pdf
    })
    .then(async (resUpdateStatusSell) => {
      if (
        typeof resUpdateStatusSell.data != 'undefined' &&
        typeof resUpdateStatusSell.data.id != 'undefined'
      ) {
        /** api update lead */
        await leadService
          .updateStatusLead(accountService.getToken(), {
            id: parentDatas.leadLitigeItemInfosProps.lead.id,
            status: status_lead_after_checking_litige
          })
          .then(async (resUpdateStatusLead) => {
            console.log(resUpdateStatusLead)
            if (
              typeof resUpdateStatusLead.data != 'undefined' &&
              resUpdateStatusLead.data.code == 200
            ) {
              /** api create litige step */
              await litigeStepService
                .createLitigeStep(accountService.getToken(), {
                  step: 1,
                  commentary: response_valid_ban_litige_lead.value,
                  litige: parentDatas.leadLitigeItemInfosProps['@id']
                })
                .then(async (resCreateLitigeStep) => {
                  console.log(resCreateLitigeStep)
                  if (
                    typeof resCreateLitigeStep.data != 'undefined' &&
                    typeof resCreateLitigeStep.data.id != 'undefined'
                  ) {
                    /** api update litige */
                    await litigeService
                      .updateLitige(accountService.getToken(), {
                        id: parentDatas.leadLitigeItemInfosProps.id,
                        status: 'closed',
                        closedAt: formatDateToISOString(new Date())
                      })
                      .then(async (resUpdateLead) => {
                        console.log(resUpdateLead)
                        tooglePageLoading(false)

                        $(document)
                          .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
                          .before(
                            '<div class="col-12 list-commentaire-checking-litige"><p class="p-2 border clearfix commentary-content fw-bold" style="background-color:#c1c1c1"> - ' +
                              response_valid_ban_litige_lead.value +
                              '</div>'
                          )
                        response_valid_ban_litige_lead.value = null
                        $(document).find('.btn-response-valid-ban-lead').addClass('disabled d-none')
                        $(document)
                          .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
                          .addClass('d-none')

                        alert('Résultat litige enregistrer avec succès')

                        window.location.reload(true)
                        //show modal footer reopen litige
                        showReopenLitige.value = true
                      })
                      .catch((err) => {
                        tooglePageLoading(false)
                        $(document)
                          .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
                          .before(
                            '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
                          )
                      })
                  }
                })
                .catch((err) => {
                  tooglePageLoading(false)
                  $(document)
                    .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
                    .before(
                      '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
                    )
                })
            }
          })
          .catch((err) => {
            tooglePageLoading(false)
            $(document)
              .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
              .before(
                '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
              )
          })
      }
    })
    .catch(async (errUpdateStatusSell) => {
      tooglePageLoading(false)
      $(document)
        .find('#collapseTwo .accordion-body .bloc-to-input-commentary')
        .before(
          '<div class="col-12 commentary-error"><div class="alert alert-danger" role="alert">Une erreur s\'est produite, veuillez contacter le service technique ou ressayer ultérieurement.</div></div>'
        )
    })
}

/** DELETE LITIGE STEP */
async function deleteLitigeStep(event) {
  let litigeSctepID = event.target.id
  if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire.')) {
    tooglePageLoading(true)

    /** DELETE LITIGE LEAD STEP */
    await litigeStepService
      .deleteLitigeStep(accountService.getToken(), litigeSctepID)
      .then(async (res) => {
        console.log(res)
        tooglePageLoading(false)
        event.target.closest('.col-12').remove()
      })
      .catch((err) => {
        tooglePageLoading(false)
        alert(err.response.data.detail)
        //console.log(err)
      })
  }
}

/** Reactive/reopen Litige */
$(document).on('click', '.btn-reopen-litige', function () {
  reopenLitige()
})

async function reopenLitige() {
  tooglePageLoading(true)
  //console.log(list_lead_litige_steps.value)
  //console.log(list_lead_litige_steps.value.find((item) => item.step == '1'))
  let litige_final_step = list_lead_litige_steps.value.find((item) => item.step == '1')
  if (typeof litige_final_step != 'undefined') {
    //lead status (checking)
    leadService
      .updateStatusLead(accountService.getToken(), {
        id: parentDatas.leadLitigeItemInfosProps.lead.id,
        status: 'checking'
      })
      .then(async (respUpdateStatusLead) => {
        console.log(respUpdateStatusLead)
        if (
          typeof respUpdateStatusLead.data != 'undefined' &&
          respUpdateStatusLead.data.code == 200
        ) {
          //delete litige step ( equal 1 )
          await litigeStepService
            .deleteLitigeStep(accountService.getToken(), litige_final_step.id)
            .then(async (res) => {
              //litige status (checking)
              litigeService
                .updateLitige(accountService.getToken(), {
                  id: parentDatas.leadLitigeItemInfosProps.id,
                  status: 'checking'
                })
                .then(async (resUpdateLitige) => {
                  console.log(resUpdateLitige)
                  if (typeof resUpdateLitige.data != 'undefined') {
                    tooglePageLoading(false)
                    alertParams.value.type = 'alert-success text-center'
                    alertParams.value.message = 'Réactivation effectuer avec succes'
                    isAlertShowed.value = true

                    alert('Réactivation effectuer avec succes')
                    window.location.reload(true)
                  }
                })
                .catch(async (errorUpdateLitige) => {
                  tooglePageLoading(false)
                  alertParams.value.type = 'alert-danger'
                  alertParams.value.message =
                    "Une erreur s'est produite, veuillez contacter le service technique ou ressayer ultérieurement"
                  isAlertShowed.value = true
                  console.log(err)
                })
            })
            .catch((err) => {
              tooglePageLoading(false)
              alertParams.value.type = 'alert-danger'
              alertParams.value.message =
                "Une erreur s'est produite, veuillez contacter le service technique ou ressayer ultérieurement"
              isAlertShowed.value = true
              console.log(err)
            })
        }
      })
      .catch(async (errorUpdateStatusLead) => {
        tooglePageLoading(false)
        alertParams.value.type = 'alert-danger'
        alertParams.value.message =
          "Une erreur s'est produite, veuillez contacter le service technique ou ressayer ultérieurement"
        isAlertShowed.value = true
        console.log(err)
      })
  } else {
    tooglePageLoading(false)
  }
}

/** modal state */
const state = reactive({
  lead_litige_checking_modal: null
})
/** open modal state */
function openModal() {
  state.lead_litige_checking_modal.show()
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

/** lead litige steps */
const list_lead_litige_steps = ref([])

onMounted(async () => {
  // get list litige step
  litigeStepService
    .getAllLitigeStepsByLitigeId(accountService.getToken(), parentDatas.leadLitigeItemInfosProps.id)
    .then(async (res) => {
      //console.log(res)
      if (typeof res.data != 'undefined' && res.data.code == 200) {
        list_lead_litige_steps.value = res.data.litige_steps_datas.concat()
      }
    })
    .catch((err) => {
      console.log(err)
    })

  // make all other modal opened hided by modal-backdrop
  await $(document).find('.modal.show').addClass('zindex-0')
  /** open modal on mount compenent */
  state.lead_litige_checking_modal = new bootstrap.Modal('#lead_litige_checking_modal', {})
  await openModal()
  $('#lead_litige_checking_modal').on('hidden.bs.modal', function () {
    emit('displayLeadLitigeCheckingModal') // to change lead_litige_checking_modal variable to false

    if (reloadPage) {
      window.location.reload(true)
    }
  })
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.lead_litige_checking_modal.hide()

  // make all other modal opened showed before modal-backdrop
  $(document).find('.modal.show').removeClass('zindex-0')
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal fade" id="lead_litige_checking_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content border border-secondary border-2">
        <div class="modal-header py-0 ps-0 pe-2">
          <div class="row align-items-center w-100 m-0" style="height: fit-content">
            <div
              class="col-lg-2 col-3 activity-picto text-center py-2"
              :class="{
                'bg-secondary': leadLitigeItemInfosProps.status == 'waiting',
                'bg-tml-yellow': leadLitigeItemInfosProps.status == 'checking',
                'bg-success':
                  leadLitigeItemInfosProps.status == 'closed' &&
                  leadLitigeItemInfosProps.lead.status == 'valid',
                'bg-danger':
                  leadLitigeItemInfosProps.status == 'closed' &&
                  leadLitigeItemInfosProps.lead.status == 'denied'
              }"
            >
              <img
                :src="
                  imgs_parent_dir+'/pictos/activity/' +
                  simplifiedStr(leadLitigeItemInfosProps.lead.activity) +
                  '.svg'
                "
                class="invert"
                width="50"
              />
            </div>
            <div class="col-lg-10 col-9">
              <h2 class="fw-bold">Prospect en cours de vérification</h2>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body pb-5">
          <div class="row py-3">
            <h4 class="text-bolder" style="font-weight: 900">Informations du prospect</h4>
            <div class="col-6">
              <label class="fw-bold">Status du litige</label>
              <p class="px-1" v-if="leadLitigeItemInfosProps.status == 'waiting'">
                En attente de prise en main par les services concernés
              </p>
              <p class="px-1" v-if="leadLitigeItemInfosProps.status == 'checking'">
                En cours de vérification
              </p>
              <p
                class="px-1"
                v-if="
                  leadLitigeItemInfosProps.status == 'closed' &&
                  leadLitigeItemInfosProps.lead.status == 'valid'
                "
              >
                Lead validé
              </p>
              <p
                class="px-1"
                v-if="
                  leadLitigeItemInfosProps.status == 'closed' &&
                  leadLitigeItemInfosProps.lead.status == 'denied'
                "
              >
                Lead refusé
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Date de début</label>
              <p class="px-1">
                A été créer le
                {{ new Date(leadLitigeItemInfosProps.created_at).toLocaleDateString('fr') }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Email</label>
              <p class="px-1">
                {{ leadLitigeItemInfosProps.lead.email }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Téléphone</label>
              <p class="px-1">
                {{ leadLitigeItemInfosProps.lead.phone }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Localisation</label>
              <p class="px-1">
                Dans le secteur du code postal {{ leadLitigeItemInfosProps.lead.postalCode }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Déposant</label>
              <p class="px-1">Déposé par {{ leadLitigeItemInfosProps.lead.enterprise.name }}</p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Adresse</label>
              <p class="px-1">{{ leadLitigeItemInfosProps.lead.address }}</p>
            </div>

            <div class="col-12">
              <label class="fw-bold">Description</label>
              <p class="px-1">{{ leadLitigeItemInfosProps.lead.commentary }}</p>
            </div>
          </div>

          <hr class="w-100 m-auto my-3" />

          <div class="row py-0 bg-gradient text-dark">
            <h4 class="text-bolder" style="font-weight: 900">Description litige:</h4>
            <div class="col-12 px-4">
              <p class="p-3 commentary-content border border-secondary fw-bold">
                {{ leadLitigeItemInfosProps.commentary }}
              </p>
            </div>
          </div>

          <hr class="w-100 m-auto my-3" />

          <div class="row py-3">
            <h4 class="text-bolder" style="font-weight: 900">
              Vérification & validation/désaprouvation du prospect:
            </h4>

            <div class="accordion" id="accordionExample">
              <!-- vérification du prospect -->
              <div class="accordion-item border border-2">
                <h2 class="accordion-header" id="headingOne">
                  <button
                    class="accordion-button collapsed fw-bold"
                    :class="{
                      'bg-secondary bg-gradient text-white': leadLitigeItemInfosProps.status == 'waiting',
                      'bg-tml-yellow': leadLitigeItemInfosProps.status == 'checking',
                      'bg-success bg-gradient text-white':
                        leadLitigeItemInfosProps.status == 'closed' &&
                        leadLitigeItemInfosProps.lead.status == 'valid',
                      'bg-danger bg-gradient text-white':
                        leadLitigeItemInfosProps.status == 'closed' &&
                        leadLitigeItemInfosProps.lead.status == 'denied'
                    }"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="false"
                    aria-controls="collapseOne"
                  >
                    Vérifications du prospect
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  class="accordion-collapse collapse"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div class="accordion-body">
                    <div
                      class="col-12 list-commentaire-checking-litige"
                      v-for="(lead_litige_step, idx_lead_litige_step) in list_lead_litige_steps"
                      :key="idx_lead_litige_step"
                    >
                      <p
                        class="p-2 border clearfix commentary-content fw-bold"
                        v-if="lead_litige_step.step == 0"
                      >
                        - {{ lead_litige_step.commentary }}
                        <button
                          type="button"
                          class="btn btn-danger btn-sm float-end"
                          :id="lead_litige_step.id"
                          @click="deleteLitigeStep"
                          v-if="leadLitigeItemInfosProps.status != 'closed'"
                        >
                          X
                        </button>
                      </p>
                    </div>
                    <div
                      class="col-12 bloc-to-input-commentary"
                      v-if="leadLitigeItemInfosProps.status != 'closed'"
                    >
                      <p class="px-1">
                        <textarea
                          class="form-control"
                          placeholder="Tapez votre commentaire ici"
                          @keyup="enableBtnResponseCheckingLitigeLeadIsDisabled"
                          v-model="response_checking_litige_lead"
                          rows="3"
                        ></textarea>
                      </p>
                    </div>

                    <div class="col-12 d-flex justify-content-center">
                      <button
                        type="button"
                        class="btn bg-tml-green text-white m-0 pt-0 btn-response-checking-litige-lead disabled"
                        id="lead-to-denied"
                        @click="addCommentaryCheckingLitigeLead"
                        v-if="leadLitigeItemInfosProps.status != 'closed'"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- validation/desaprouvation du prospect -->
              <div class="accordion-item border border-2">
                <h2 class="accordion-header" id="headingTwo">
                  <button
                    class="accordion-button collapsed fw-bold"
                    :class="{
                      'bg-secondary bg-gradient text-white': leadLitigeItemInfosProps.status == 'waiting',
                      'bg-tml-yellow': leadLitigeItemInfosProps.status == 'checking',
                      'bg-success bg-gradient text-white':
                        leadLitigeItemInfosProps.status == 'closed' &&
                        leadLitigeItemInfosProps.lead.status == 'valid',
                      'bg-danger bg-gradient text-white':
                        leadLitigeItemInfosProps.status == 'closed' &&
                        leadLitigeItemInfosProps.lead.status == 'denied'
                    }"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    Validation/Désaprouvation du prospect
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  class="accordion-collapse collapse"
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample"
                >
                  <div class="accordion-body">
                    <div
                      class="col-12 list-commentaire-valid-ban-lead"
                      v-for="(lead_litige_step, idx_lead_litige_step) in list_lead_litige_steps"
                      :key="idx_lead_litige_step"
                    >
                      <p
                        class="px-2 py-2 border commentary-content fw-bold"
                        v-if="lead_litige_step.step == 1"
                      >
                        - {{ lead_litige_step.commentary }}
                      </p>
                    </div>
                    <div
                      class="col-12 bloc-to-input-commentary"
                      v-if="leadLitigeItemInfosProps.status != 'closed'"
                    >
                      <p class="p-2">
                        <textarea
                          class="form-control"
                          placeholder="Tapez votre commentaire ici"
                          @keyup="enableBtnResponseValidBanLeadIsDisabled"
                          v-model="response_valid_ban_litige_lead"
                          rows="3"
                        ></textarea>
                      </p>
                    </div>

                    <div
                      class="col-12 d-flex justify-content-between"
                      v-if="leadLitigeItemInfosProps.status != 'closed'"
                    >
                      <button
                        type="button"
                        class="btn bg-danger text-white m-0 btn-response-valid-ban-lead disabled"
                        id="lead-to-denied"
                        @click="responseValidBanLitigeLead"
                      >
                        <img src="@/assets/pictos/close.svg" class="invert" width="25" />
                        Prospect invalide
                      </button>

                      <button
                        type="button"
                        class="btn bg-success text-white m-0 btn-response-valid-ban-lead disabled"
                        id="lead-to-valid"
                        @click="responseValidBanLitigeLead"
                      >
                        <img src="@/assets/pictos/check.svg" class="invert" width="25" />
                        Valider le prospect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="modal-footer pt-1 pb-4 border-0"
          v-if="leadLitigeItemInfosProps.status == 'closed' || showReopenLitige"
        >
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
          <!-- END ALERT -->
          <!--button type="button" class="btn bg-secondary text-white btn-reopen-litige">
            Rouvrir le Litige
            <img src="@/assets/pictos/lock_open_right.svg" class="invert" />
          </button-->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#modal_demo .activity-picto {
  border-radius: 14px 0;
}

#modal_demo .modal-content {
  border-radius: 16px;
}
</style>
