<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { simplifiedStr } from '@/assets/js/customFunctions.js'
import LeadItemInfosComponent from '@/components/items/LeadItemInfosComponent.vue'

/** variable from parent  */
defineProps({
  leadItemInfosProps: Object,
  leadFullInfos: Boolean,
  leadToBuy: Boolean,
  leadsBuyedList: Boolean,
  belongCurrentUser: Boolean
})

/** Function from parent */
const emit = defineEmits(['displayLeadItemInfos', 'displayClaimLeadModal', 'displayLeadDeniedModal', 'ValidateLead', 'displayLeadCheckingModal', 'enableLead', 'disableLead', 'displayUpdateLeadModal'])

/** modal state */
const state = reactive({
  lead_item_infos_modal: null
})

/** revock parent functions */
function ValidateLead(){
  emit('ValidateLead');
}
function disableLead(){
  emit('disableLead');
}
function enableLead(){
  emit('enableLead');
}
function displayClaimLeadModal(){
  emit('displayClaimLeadModal');
}
function displayLeadDeniedModal(){
  emit('displayLeadDeniedModal');
}
function displayLeadCheckingModal(){
  emit('displayLeadCheckingModal');
}
function displayUpdateLeadModal(){
  emit('displayUpdateLeadModal');
}
/** revock parent functions */

/** open modal state */
function openModal() {
  state.lead_item_infos_modal.show()
}

onMounted(() => {
  /** open modal on mount compenent */
  state.lead_item_infos_modal = new bootstrap.Modal('#lead_item_infos_modal', {})
  openModal()

  $('#lead_item_infos_modal').on('hidden.bs.modal', function () {
    emit('displayLeadItemInfos')
  })
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.lead_item_infos_modal.hide()
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal fade" id="lead_item_infos_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content border border-secondary border-2">
        <div class="modal-header py-0 ps-0 pe-2">
          <button
            type="button"
            class="btn-close position-absolute" style="right:.7rem;top:.7rem;z-index:1;"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body p-0">
          <LeadItemInfosComponent
            :key="leadInfosModalKey"
            @display-claim-lead-modal="displayClaimLeadModal"
            @display-lead-denied-modal="displayLeadDeniedModal"
            @validate-lead="ValidateLead"
            @disable-lead="disableLead"
            @display-lead-checking-modal="displayLeadCheckingModal"
            @display-update-lead-modal="displayUpdateLeadModal"
            :leadItemInfosProps="leadItemInfosProps"
            :lead-full-infos="true"
            :leads-buyed-list="true"
            :leadToBuy="leadToBuy"
            :belong-current-user="belongCurrentUser"
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
