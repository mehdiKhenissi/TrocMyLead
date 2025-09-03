<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import router from '@/router'
import { simplifiedStr } from '@/assets/js/customFunctions.js'
import LeadItemInfosComponent from '@/components/items/LeadItemInfosComponent.vue'
import ConnectionFormComponent from '@/components/forms/ConnectionFormComponent.vue'
import ResetPasswordFormComponent from '@/components/forms/ResetPasswordFormComponent.vue'

//injections
const tooglePageLoading = inject('tooglePageLoading')

/** variable from parent  */
defineProps({})

/** Function from parent */
const emit = defineEmits([])

const isFormConnectionVisible = ref(true)
const isFormForgetPasswordVisible = ref(false)

/** show form forget password */
function showFormForgetPassword() {
  if (isFormConnectionVisible.value == true && isFormForgetPasswordVisible.value == false) {
    isFormConnectionVisible.value = false
    isFormForgetPasswordVisible.value = true
  } else {
    isFormConnectionVisible.value = true
    isFormForgetPasswordVisible.value = false
  }
}

/** modal state */
const state = reactive({
  connectionModal: null
})

/** open modal state */
function openModal() {
  state.connectionModal.show()
}

onMounted(() => {
  /** open modal on mount compenent */
  state.connectionModal = new bootstrap.Modal('#connectionModal', {focus:true})
  openModal()

  $('#connectionModal').on('hidden.bs.modal', function () {})
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.connectionModal.hide()
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal fade" id="connectionModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!--div class="modal-header">
          <h5 class="modal-title">Modal title</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div-->
        <div class="modal-body">

          <!-- Form connexion/forget password -->
          <div
            class="col-lg-12 d-flex flex-wrap order-lg-last order-first text-center border-tml py-4 mb-lg-0 mb-5"
          >
            <div class="px-5 h-100" v-if="isFormConnectionVisible">
              <ConnectionFormComponent
                @show-form-forget-password="showFormForgetPassword"
                :parent-emit-function="emit"
              />
            </div>

            <div class="px-5 h-100" v-if="isFormForgetPasswordVisible">
              <!-- form mdp oublié -->
              <ResetPasswordFormComponent @show-form-forget-password="showFormForgetPassword" />
            </div>
          </div>

        </div>
        <div class="modal-footer p-1">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onclick="history.back()">
            Annuler l'achat
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
