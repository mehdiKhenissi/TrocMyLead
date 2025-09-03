<script setup>
import { ref, reactive, inject } from 'vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import AlertComponent from '@/components/various/AlertComponent.vue'

// injections
const accountService = inject('accountService')
const userService = inject('userService')
const enterpriseService = inject('enterpriseService')

const emit = defineEmits(['showFormForgetPassword'])
const showFormForgetPassword = () => {
  emit('showFormForgetPassword', showFormForgetPassword) // Emit a custom event with data
}

const formReinitPwd = reactive({
  email: ''
})

/** reinit password */
async function reinitPassword() {
  /** get user infos */
  await userService
    .reinitUserPassword({ email: formReinitPwd.email })
    .then(async (res) => {
      console.log(res)
      if (typeof res.data.code != 'undefined' && res.data.code == '200') {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-success'
        alertParams.value.message =
          'Mot de passe modifié avec succès, veuillez vérifier votre adresse email.'
      } else {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger'
        alertParams.value.message = res.data.message
      }
    })
    .catch((err) => {
      console.log(err)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger'
      alertParams.value.message =
        'Erreur modification de votre mot de passe, veuillez ressayer ultérieurement.'
    })
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}
</script>

<template>
  <div class="h-100">
    <form @submit.prevent="reinitPassword" class="d-flex flex-wrap h-100">
      <h2 class="text-center fw-bolder w-100 mb-5">Réinitialiser mot de passe</h2>

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

      <div class="mb-4 w-100">
        <input
          type="email"
          class="form-control input-troc-my-lead rounded-pill border-2"
          placeholder="E-mail"
          v-model="formReinitPwd.email"
          required
        />
      </div>
      <div class="mb-4 text-center w-100">
        <a @click="showFormForgetPassword" style="cursor: pointer"><u>Retour à la connexion</u></a>
      </div>

      <button
        type="submit"
        class="btn w-50 m-auto btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
      >
        <img src="@/assets/pictos/user.svg" class="invert me-2" />
        <b>Réinitialiser</b>
      </button>
      
    </form>
  </div>
</template>

<style scoped></style>
