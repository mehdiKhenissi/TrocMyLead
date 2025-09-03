<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { simplifiedStr } from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const litigeService = inject('litigeService')
const tooglePageLoading = inject('tooglePageLoading')

/** variable from parent  */
const parentDatas = defineProps({
  leadItemInfosProps: Object
})

/** Function from parent */
const emit = defineEmits(['displayClaimLeadModal'])

/** modal state */
const state = reactive({
  claim_lead_modal: null
})

/** accept CG for claiming lead */
$(document).on('click', '.checkbox-accept-claim-lead-conditions', function () {
  let $this = $(this)
  if ($this.is(':checked')) {
    $(document).find('.btn-claim-lead').removeClass('disabled')
  } else {
    $(document).find('.btn-claim-lead').addClass('disabled')
  }
})
/** Claim Lead */
const textClaimLead = ref(null)
async function claimLead() {
  tooglePageLoading(true)
  console.log(parentDatas.leadItemInfosProps)
  isAlertShowed.value = false

  if ($(document).find('.checkbox-accept-claim-lead-conditions').is(':checked')) {
    if (textClaimLead.value != null) {
      await litigeService
        .createLitige(accountService.getToken(), {
          commentary: textClaimLead.value,
          status: 'waiting',
          lead: parentDatas.leadItemInfosProps.lead_id
        })
        .then(async (response) => {
          console.log(response)
          if (
            typeof response.data != 'undefined' &&
            typeof response.data.id_litige != 'undefined'
          ) {
            tooglePageLoading(false)
            isAlertShowed.value = true
            alertParams.value.type = 'alert-success text-center'
            alertParams.value.message = 'Reclamation déposé avec succès.'
            $(document).find('body').addClass('disable-actions')
            setTimeout(() => {
              window.location.reload(true)
            }, 3000)
          }
          else if( typeof response.data != 'undefined' && (res.data.message.search("Duplicate entry") !== -1)){
            isAlertShowed.value = true
            alertParams.value.type = 'alert-warning text-center'
            alertParams.value.message =
              'une reclamation est déjà crée pour ce lead, veuillez contacter l\'equipe support pour plus d\'informations'
          }
          else {
            isAlertShowed.value = true
            alertParams.value.type = 'alert-danger text-center'
            alertParams.value.message =
              'Erreur soumission de votre reclamation, veuillez ressayer plus tard ou contacter le support technique'
          }
        })
        .catch(async (error) => {
          console.log(error)
          isAlertShowed.value = true
          alertParams.value.type = 'alert-danger text-center'
          alertParams.value.message =
            'Erreur soumission de votre reclamation, veuillez ressayer plus tard ou contacter le support technique'
        })
    } else {
      $(document)
        .find('.input-text-claim-lead')
        .removeClass('border-tml')
        .addClass('error-invalid-field')

      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      alertParams.value.message = 'Veuillez saisir la raison de litige.'

      await setTimeout(() => {
        $(document)
          .find('.input-text-claim-lead')
          .removeClass('error-invalid-field')
          .addClass('border-tml')
      }, 2600)
    }
  } else {
    $(document)
      .find('.checkbox-accept-claim-lead-conditions')
      .removeClass('border-secondary')
      .addClass('error-invalid-field')

    isAlertShowed.value = true
    alertParams.value.type = 'alert-danger text-center'
    alertParams.value.message =
      'Veuillez accpeter les conditions générales de facturation des frais de service.'

    await setTimeout(() => {
      $(document)
        .find('.checkbox-accept-claim-lead-conditions')
        .removeClass('error-invalid-field')
        .addClass('border-secondary')
    }, 2600)
  }

  await setTimeout(() => {
    tooglePageLoading(false)
  }, 2000)
}

/** open modal state */
function openModal() {
  state.claim_lead_modal.show()
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

onMounted(async () => {
  // make all other modal opened hided by modal-backdrop
  await $(document).find('.modal.show').addClass('zindex-0')

  /** open modal on mount compenent */
  state.claim_lead_modal = new bootstrap.Modal('#claim_lead_modal', {})
  await openModal()

  $('#claim_lead_modal').on('hidden.bs.modal', function () {
    emit('displayClaimLeadModal') // to change show_claim_lead_modal variable to false
  })
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.claim_lead_modal.hide()

  // make all other modal opened showed before modal-backdrop
  $(document).find('.modal.show').removeClass('zindex-0')
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal fade" id="claim_lead_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content border border-secondary border-2">
        <div class="modal-header py-0 ps-0 pe-2">
          <div class="row align-items-center w-100 m-0" style="height: fit-content">
            <div class="col-lg-2 col-3 bg-tml-red activity-picto text-center py-2">
              <img src="@/assets/pictos/report.svg" class="invert" width="50" />
            </div>
            <div class="col-lg-10 col-9">
              <h2 class="fw-bold">Crée un litige</h2>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row border">
            <h4 class="text-bolder" style="font-weight: 900">Informations du lead</h4>
            <div class="col-6">
              <label class="fw-bold">Date de dépot</label>
              <p class="px-1">Déposé le {{ leadItemInfosProps.lead_date_depot }}</p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Date de début</label>
              <p class="px-1">A commencer avant le {{ leadItemInfosProps.lead_date_start }}</p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Email</label>
              <p class="px-1">
                {{ leadItemInfosProps.lead_email }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Téléphone</label>
              <p class="px-1">
                {{ leadItemInfosProps.lead_phone }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Localisation</label>
              <p class="px-1">
                Dans le secteur du code postal {{ leadItemInfosProps.lead_localisation }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Déposant</label>
              <p class="px-1">Déposé par {{ leadItemInfosProps.lead_buyer_enterprise.name }}</p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Adresse</label>
              <p class="px-1">{{ leadItemInfosProps.lead_adress }}</p>
            </div>

            <div class="col-12">
              <label class="fw-bold">Description</label>
              <p class="px-1">{{ leadItemInfosProps.lead_description }}</p>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-12">
              <h5 class="" style="font-weight: 900">Texte litige:</h5>
              <textarea
                class="form-control border-tml input-text-claim-lead"
                rows="3"
                v-model="textClaimLead"
                placeholder="Veuillez saisir votre texte de reclamation"
                required
              ></textarea>
            </div>
            <div class="col-12 mt-4">
              <div class="d-flex flex-row align-items-center">
                <p class="m-0 fw-bold">
                  <input
                    type="checkbox"
                    class="form-check-input mt-0 border-secondary border-2 checkbox-accept-claim-lead-conditions"
                    style="width: 25px; height: 25px"
                  />
                  J'accpete la facturation des frais de service en cas de refus de lead,
                  <a href="#" class="color-tml-green fw-bold">
                    en savoir plus sur les conditions générales.
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-center py-4 border-0">
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

          <button
            type="button"
            class="btn bg-tml-red fs-4 text-white m-0 pt-0 btn-claim-lead disabled"
            @click="claimLead"
          >
            Créer le litige
          </button>
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
