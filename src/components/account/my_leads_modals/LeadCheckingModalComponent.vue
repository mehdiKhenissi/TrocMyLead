<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { simplifiedStr } from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const litigeService = inject('litigeService')
const litigeStepService = inject('litigeStepService')

/** variable from parent  */
const parentDatas = defineProps({
  leadItemInfosProps: Object
})
console.log(parentDatas.leadItemInfosProps);

/** Function from parent */
const emit = defineEmits(['displayLeadCheckingModal'])

/** variables */
const list_lead_litige_steps = ref([]);

/** modal state */
const state = reactive({
  lead_checking_modal: null
})

/** open modal state */
function openModal() {
  state.lead_checking_modal.show()
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
  state.lead_checking_modal = new bootstrap.Modal('#lead_checking_modal', {})
  await openModal()
  $('#lead_checking_modal').on('hidden.bs.modal', function () {
    emit('displayLeadCheckingModal') // to change lead_checking_modal variable to false
  })

  /** Litige Steps */
  await litigeStepService
    .getAllLitigeStepsByLitigeId(accountService.getToken(), parentDatas.leadItemInfosProps.lead_litige.id)
    .then(async (res) => {
      console.log(res)
      if (typeof res.data != 'undefined' && res.data.code == 200) {
        list_lead_litige_steps.value = res.data.litige_steps_datas.concat()
      }
    })
    .catch((err) => {
      console.log(err)
    })

    console.log(list_lead_litige_steps.value)

})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.lead_checking_modal.hide()

  // make all other modal opened showed before modal-backdrop
  $(document).find('.modal.show').removeClass('zindex-0')
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal fade" id="lead_checking_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content border border-secondary border-2">
        <div class="modal-header py-0 ps-0 pe-2">
          <div class="row align-items-center w-100 m-0" style="height: fit-content">
            <div class="col-lg-2 col-3 bg-tml-yellow activity-picto text-center py-2">
              <img :src="leadItemInfosProps.lead_picto" class="invert" width="50" />
            </div>
            <div class="col-lg-10 col-9">
              <h2 class="fw-bold">Lead en cours de vérification</h2>
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
          <div class="row  py-3">
            <h4 class="text-bolder" style="font-weight: 900">Informations du lead</h4>
            <div class="col-6">
              <label class="fw-bold">Status du litige</label>
              <p class="px-1" v-if=" leadItemInfosProps.lead_litige.status != 'waiting'"> En attente de prise en main par les services concernés </p>
              <p class="px-1" v-if=" leadItemInfosProps.lead_litige.status != 'checking'"> En cours de vérification </p>
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

          <hr class="w-100 m-auto my-3" />

          <!-- raison steps -->
          <div class="row py-1">
            <h4 class="text-bolder" style="font-weight: 900">Texte litige:</h4>
            <div class="col-12">
              <p class="p-3 commentary-content border clearfix fw-bold"> {{ leadItemInfosProps.lead_litige.commentary }}</p>
            </div>
          </div>

          <hr class="w-100 m-auto my-3" />

          <!-- Litige steps -->
          <div class="row py-1">
            <h4 class="text-bolder" style="font-weight: 900">Etapes vérifications:</h4>
            <div class="col-12">
              <ul style="list-style: decimal;" v-if="list_lead_litige_steps.length > 0">
                <li v-for="(litige_step_item, key_litige_step_item) in list_lead_litige_steps" :key="key_litige_step_item"> {{ litige_step_item.commentary }} </li>
              </ul>
              <p class="p-3 commentary-content border clearfix fw-bold" v-else>La vérification est en attente de prise en main par notre équipe.</p>
            </div>
          </div>

        </div>
        <div class="modal-footer border-0">
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
