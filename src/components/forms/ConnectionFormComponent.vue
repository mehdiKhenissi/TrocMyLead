<script setup>
import { ref, reactive, inject } from 'vue'
import axios from 'axios'
import router from '@/router'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const accountService = inject('accountService')
const userService = inject('userService')

/** parent datas */
const parentDatas = defineProps({
  parentEmitFunction: Function,
  redirectAfterLogin: Boolean
})

const emit = defineEmits(['showFormForgetPassword', 'inputPasswordToogleType'])
const showFormForgetPassword = () => {
  emit('showFormForgetPassword', showFormForgetPassword) // Emit a custom event with data
}
const inputPasswordToogleType = () => {
  emit('inputPasswordToogleType', inputPasswordToogleType)
}

/** user informations */
const useInformations = async (token) => {
  await userService
    .getMeUser(token)
    .then((res) => {
      console.log(res)
      if (res.data.email) {
        accountService.saveSessionUser(res.data)
      } else {
        console.log('not good infos user')
      }
    })
    .catch((err) => console.log(err))
}

/** Login function */
const formLogin = reactive({
  username: '',
  password: ''
})
const showLoginLoader = ref(false)

async function login() {
  showLoginLoader.value = true
  parentDatas.parentEmitFunction('toogle-page-loading', true) //lancer le loading page
  //console.log(formLogin)

  await accountService
    .login(formLogin)
    .then(async (res) => {
      console.log(res)
      if (typeof res.data.token !== 'undefined') {
        accountService.saveToken(res.data.token)
        //alert('redirect to account now')
        //parentDatas.parentEmitFunction('is-logged-in', true)
        await useInformations(res.data.token)
        if (parentDatas.redirectAfterLogin) {
          router.push('/account')
        } else {
          location.reload()
        }
      } else {
        parentDatas.parentEmitFunction('toogle-page-loading', false)

        //alert('token undefined!')
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger text-center'
        alertParams.value.message =
          typeof res.data.message != 'undefined' ? res.data.message : 'token undefined!'

        //code validation message
        if (typeof res.data.code != 'undefined' && res.data.code == 448) {
          alertParams.value.type = 'alert-warning text-center'
          alertParams.value.message +=
            "<br/>En attente des vérifications et validation des documents et informations envoyées, veuillez patienter ou contacter l'equipe TROC MY LEAD. <br/> Merci pour votre compréhension."
        } else if (typeof res.data.code != 'undefined' && res.data.code == 449) {
          alertParams.value.type = 'alert-warning text-center'
          alertParams.value.message +=
            '<br/><br/><a data-bs-toggle="modal" data-bs-target="#codeValidationModal" class="mt-2 fw-bold cursor-pointer"> Code activation </a>'
        }
      }
    })
    .catch((err) => {
      parentDatas.parentEmitFunction('toogle-page-loading', false)
      console.log(err)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      //alertParams.value.message = err.response.data.message

      if (typeof err.data != 'undefined' && typeof err.data.message != 'undefined') {
        alertParams.value.message = err.data.message
      } else if (
        typeof err.response != 'undefined' &&
        typeof err.response.data.message != 'undefined' &&
        err.response.data.message == 'Invalid credentials.'
      ) {
        alertParams.value.message =
          "Les informations d'authentification (email/mot de passe) sont invalides."
      } else {
        alertParams.value.message =
          'Une erreur est survenue, veuillez contacter le service support.'
      }
    })

  showLoginLoader.value = false
}

// CODE VALIDATION
const codeValidation = ref(null)
const showValidationCodeLoader = ref(false)
const alertActivationCodeShowed = ref(false)
const alertActivationCodeText = ref('')
const alertActivationCodeclass = ref('')

// FORM Code Validation
async function codeValidationForm() {
  showValidationCodeLoader.value = true
  alertActivationCodeShowed.value = false
  alertActivationCodeclass.value = ''
  alertActivationCodeclass.value = ''

  await userService
    .enableUserAccount({
      code_validation: codeValidation.value,
      email: formLogin.username
    })
    .then(async (res) => {
      alertActivationCodeShowed.value = true
      //console.log(res)
      if (typeof res.data != 'undefined' && typeof res.data.code != 'undefined') {
        if (res.data.code == '200') {
          const countDown = ref(3)
          $('body').addClass('disable-actions')
          //success activation compte, should redirect
          alertActivationCodeclass.value = 'alert-success text-center'
          alertActivationCodeText.value = res.data.message + '<br/> Redirection en cours '

          setTimeout(() => {
            //$('#codeValidationModal').modal('hide');
            showValidationCodeLoader.value = false
            alertActivationCodeShowed.value = false
            alertActivationCodeclass.value = ''
            alertActivationCodeclass.value = ''
            login()
          }, '3000')
        } else if (res.data.code == '204') {
          //erreur code activation, send another code maybe
          alertActivationCodeclass.value = 'alert-danger text-center'
          alertActivationCodeText.value = res.data.message
        } else {
          //erreur code activation, send another code maybe
          alertActivationCodeclass.value = 'alert-danger text-center'
          alertActivationCodeText.value = res.data.message
        }
      } else {
        //erreur code activation, send another code maybe
        alertActivationCodeclass.value = 'alert-danger text-center'
        alertActivationCodeText.value =
          'Une erreur serveur est survenue, veuillez contacter le service support.'
      }
    })
    .catch((err) => {
      console.log(err)
      alertActivationCodeShowed.value = true
      alertActivationCodeclass.value = 'alert-danger text-center'
      alertActivationCodeText.value =
        'Une erreur critique est survenue critique, veuillez contacter le service support.'
    })

  showValidationCodeLoader.value = false
}

// GET NEW ACTIVATION CODE
async function sendNewActivationCode() {
  showValidationCodeLoader.value = true
  alertActivationCodeShowed.value = false
  alertActivationCodeclass.value = ''
  alertActivationCodeclass.value = ''

  await userService
    .getNewActivationCode(formLogin.username)
    .then(async (res) => {
      alertActivationCodeShowed.value = true
      console.log(res)
      if (typeof res.data != 'undefined' && typeof res.data.code != 'udnefined') {
        if (res.data.code == 200) {
          alertActivationCodeclass.value = 'alert-success text-center'
          alertActivationCodeText.value = res.data.message
        } else if (res.data.code == 404) {
          alertActivationCodeclass.value = 'alert-danger text-center'
          alertActivationCodeText.value = res.data.message
        } else {
          //erreur code activation, send another code maybe
          alertActivationCodeclass.value = 'alert-danger text-center'
          alertActivationCodeText.value = res.data.message
        }
      } else {
        //erreur code activation, send another code maybe
        alertActivationCodeclass.value = 'alert-danger text-center'
        alertActivationCodeText.value =
          'Une erreur serveur est survenue, veuillez contacter le service support.'
      }
    })
    .catch(async (err) => {
      console.log(err)
      alertActivationCodeShowed.value = true
      alertActivationCodeclass.value = 'alert-danger text-center'
      alertActivationCodeText.value =
        'Une erreur critique est survenue critique, veuillez contacter le service support.'
    })

  showValidationCodeLoader.value = false
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
    <form @submit.prevent="login" class="d-flex flex-wrap h-100">
      <h2 class="text-center fw-bolder w-100 mb-5">Se connecter</h2>

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

      <div class="mb-3 w-100">
        <input
          type="text"
          class="form-control input-troc-my-lead rounded-pill border-2"
          placeholder="E-mail ou téléphone"
          autocomplete="username"
          v-model="formLogin.username"
          required
        />
      </div>
      <div class="mb-3 w-100">
        <div class="input-group mb-3">
          <input
            type="password"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="Mot de passe"
            autocomplete="current-password"
            v-model="formLogin.password"
            required
          />
          <!-- <button
              type="button"
              class="input-group-text border-start-0 border-2"
              style="border-radius: 0 50rem 50rem 0 !important"
              @click="inputPasswordToogleType"
            >
              👁️
          </button> -->
        </div>
      </div>
      <div class="mb-3 w-100 text-center">
        <a @click="showFormForgetPassword" style="cursor: pointer"><u>Mot de passe oublié ? </u></a>
      </div>
      <div class="col-12" v-if="showLoginLoader">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="8"
          fill="var(--surface-ground)"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
        />
      </div>
      <button
        type="submit"
        class="btn w-50 m-auto my-4 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
      >
        <img src="@/assets/pictos/user.svg" class="invert me-2" />
        <b>Connexion</b>
      </button>
    </form>
  </div>

  <!-- Modal Code validation -->
  <div class="modal fade" id="codeValidationModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header py-2">
          <h5 class="modal-title">Validation du compte</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body p-5">
          <form @submit.prevent="codeValidationForm">
            <div class="mb-3">
              <label class="form-label fw-bold">Email: </label>
              <input
                type="text"
                class="form-control input-troc-my-lead rounded-pill border-2 text-center disabled"
                :value="formLogin.username"
                required
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">Code validation</label>
              <input
                type="text"
                class="form-control input-troc-my-lead rounded-pill border-2 text-center"
                v-model="codeValidation"
                placeholder="Veuillez saisir le code de validation ici"
                required
              />
              <div class="form-text">
                C'est le code de validation que vous avez reçu sur votre boite mail que vous avez
                utilisé pour créer votre compte.
                <a
                  class="d-block cursor-pointer btn-send-new-activation-code"
                  v-on:click="sendNewActivationCode"
                  >Obtenir un nouveau code</a
                >
              </div>
            </div>
            <div class="col-12" v-if="alertActivationCodeShowed">
              <div
                class="alert"
                :class="alertActivationCodeclass"
                role="alert"
                v-html="alertActivationCodeText"
              ></div>
            </div>
            <div class="col-12" v-if="showValidationCodeLoader">
              <ProgressSpinner
                style="width: 50px; height: 50px"
                strokeWidth="8"
                fill="var(--surface-ground)"
                animationDuration=".5s"
                aria-label="Custom ProgressSpinner"
              />
            </div>
            <div class="col-12">
              <button
                type="submit"
                class="btn w-50 m-auto my-4 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
              >
                <img src="" class="invert me-2" />
                <b>Envoyer</b>
              </button>

            </div>
          </form>
        </div>
        <div class="modal-footer p-1 d-flex justif-content-between">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
