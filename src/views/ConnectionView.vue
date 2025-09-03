<script setup>
import { ref, onMounted, onBeforeMount, inject } from 'vue'
import router from '@/router'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import PreRegistrationFormComponent from '@/components/forms/PreRegistrationFormComponent.vue'
import RegistrationFormComponent from '@/components/forms/RegistrationFormComponent.vue'
import ConnectionFormComponent from '@/components/forms/ConnectionFormComponent.vue'
import ResetPasswordFormComponent from '@/components/forms/ResetPasswordFormComponent.vue'

// inject accountService to check status of login
const accountService = inject('accountService')

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

const count = ref(0)
const isFormConnectionVisible = ref(true)
const isFormForgetPasswordVisible = ref(false)
const isFormRegistrationVisible = ref(false)
const formPreRegistrationDatas = ref(null)

function increment() {
  alert(count.value++)
}

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

/** show form registration */
function showFormRegistration() {
  // console.log(isFormRegistrationVisible.value);
  if (isFormRegistrationVisible.value == false) {
    isFormRegistrationVisible.value = true
  } else {
    isFormRegistrationVisible.value = false
  }
}

/** check if email valid */
function isValidEmail(email) {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

/** pré registration*/
function preRegistration(formDatas) {
  formPreRegistrationDatas.value = formDatas
  //console.log(formPreRegistrationDatas.value)
  showFormRegistration()
}

/** TOOGLE INPUT PASSWORD TYPE */
const inputPasswordType = ref('password')
function inputPasswordToogleType() {
  if (inputPasswordType.value != 'text') {
    inputPasswordType.value = 'text'
  } else {
    inputPasswordType.value = 'password'
  }
}

onBeforeMount(async () => {
  // check if user not logged, else redirect to account
  if (accountService.isLogged()) {
    // get current user information from local storage
    let current_user_infos = JSON.parse(accountService.getSessionUser())
    if (current_user_infos.roles.includes('ROLE_ADMIN')) {
      router.push('/admin')
    }
    else if (current_user_infos.roles.includes('ROLE_USER')) {
      router.push('/account')
    }
    else{
      accountService.clearSessionUser()
    }
  } else {
    accountService.clearSessionUser()
  }
})

onMounted(async () => {
  // await axios.get('http://localhost:8000/api/leads')
  //     .then((response) => {
  //       console.log(response.data)
  //       list_leads.value = response.data['hydra:member']
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error)
  //     })

  //hide page loading
  emit('toogle-page-loading', false)
})
</script>

<template>
  <div class="container" v-if="!accountService.isLogged()">
    <div class="row justify-content-around pt-5 position-relative">
      <!-- Forms connection/préregistration -->
      <div
        v-if="!isFormRegistrationVisible"
        class="col-lg-5 d-flex flex-wrap order-lg-first order-last text-center border-tml py-4 mb-lg-0 mb-5"
      >
        <PreRegistrationFormComponent
          @pre-registration="preRegistration"
          @input-password-toogle-type="inputPasswordToogleType"
          :input-password-type="inputPasswordType"
        />
      </div>

      <!-- Form connexion/forget password -->
      <div
        v-if="!isFormRegistrationVisible"
        class="col-lg-5 d-flex flex-wrap order-lg-last order-first text-center border-tml py-4 mb-lg-0 mb-5"
      >
        <div class="px-5 h-100" v-if="isFormConnectionVisible">
          <ConnectionFormComponent
            @show-form-forget-password="showFormForgetPassword"
            @input-password-toogle-type="inputPasswordToogleType"
            :parent-emit-function="emit"
            :redirect-after-login="false"
          />
        </div>

        <div class="px-5 h-100" v-if="isFormForgetPasswordVisible">
          <!-- form mdp oublié -->
          <ResetPasswordFormComponent @show-form-forget-password="showFormForgetPassword" />
        </div>
      </div>

      <!-- Form registration -->
      <div
        v-if="isFormRegistrationVisible"
        class="col-lg-6 text-center border-tml py-4 mb-lg-3 mb-5"
      >
        <RegistrationFormComponent
          :parent-emit-function="emit"
          @show-form-registration="showFormRegistration"
          :formPreRegistrationDatas="formPreRegistrationDatas"
          @input-password-toogle-type="inputPasswordToogleType"
          :input-password-type="inputPasswordType"
        />
      </div>
    </div>
  </div>
</template>

<style>
.visible-element {
  display: block;
}
</style>
