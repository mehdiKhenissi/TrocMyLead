<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { simplifiedStr, formatTimestampToDateString } from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const litigeService = inject('litigeService')

/** variable from parent  */
const parentDatas = defineProps({
  leadItemInfosProps: Object,
  showChargeService: Boolean
})

console.log(parentDatas.leadItemInfosProps)

/** Function from parent */
const emit = defineEmits(['displayLeadDeniedModal'])

/** modal state */
const state = reactive({
  lead_denied_modal: null
})

/** open modal state */
function openModal() {
  state.lead_denied_modal.show()
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

onMounted(async() => {
  // make all other modal opened hided by modal-backdrop
  await $(document).find('.modal.show').addClass('zindex-0');

  /** open modal on mount compenent */
  state.lead_denied_modal = new bootstrap.Modal('#lead_denied_modal', {})
  await openModal()

  $('#lead_denied_modal').on('hidden.bs.modal', function () {
    emit('displayLeadDeniedModal') // to change lead_denied_modal variable to false
  })
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.lead_denied_modal.hide()

  // make all other modal opened showed before modal-backdrop
  $(document).find('.modal.show').removeClass('zindex-0');
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal fade" id="lead_denied_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content border border-secondary border-2">
        <div class="modal-header py-0 ps-0 pe-2">
          <div class="row align-items-center w-100 m-0" style="height: fit-content">
            <div class="col-lg-2 col-3 bg-tml-red activity-picto text-center py-2">
              <img :src="leadItemInfosProps.lead_picto" class="invert" width="50" />
            </div>
            <div class="col-lg-10 col-9">
              <h2 class="fw-bold">Lead refusé</h2>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body py-4">
          <div class="row">
            <h4 class="text-bolder" style="font-weight: 900">Informations</h4>
            <div class="col-12">
              <p class="px-1 fw-bold">Le lead est invalide, il a été refusé après vérifications.</p>
              <p><b>Texte litige:</b> {{ leadItemInfosProps.lead_litige.commentary }}</p>
              <p v-if="(typeof leadItemInfosProps.lead_litige.litigeStep != 'undefined')"><b>Resultat vérifiaction:</b> {{ leadItemInfosProps.lead_litige.litigeStep.commentary }}</p>
              <p class="fw-bold"> Date refus: <label v-if="leadItemInfosProps.lead_litige.closed_at != 'Invalid Date'">le {{ formatTimestampToDateString(new Date(leadItemInfosProps.lead_litige.closed_at).getTime()/1000) }}</label> <label v-else>-</label> </p>
              <p class="fw-bold" v-if="showChargeService">
                Frais de service facturé: <b>{{ leadItemInfosProps.lead_price_tpl }}€ </b>
                <br>
                <small>Les frais de service sont les frais versés à l'entreprise qui s'est occupée de la vérification du lead comme convenue dans les conditions générales.</small>
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 d-none">
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
