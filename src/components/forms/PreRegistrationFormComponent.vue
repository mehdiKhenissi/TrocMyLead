<script setup>
import { ref, reactive } from 'vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'

// parent datas
let  parentDatas = defineProps({
  inputPasswordType: String,
})

const formPreRegistrationDatas = reactive({
  siren: '',
  email: '',
  password: ''
})

const emit = defineEmits(['preRegistration', 'inputPasswordToogleType'])
const preRegistration = () => { emit('preRegistration', formPreRegistrationDatas) }
const inputPasswordToogleType = () => { emit('inputPasswordToogleType', inputPasswordToogleType)}
</script>

<template>
  <div class="h-100">
    <div class="px-5" style="">
      <form @submit.prevent="preRegistration" class="d-flex flex-wrap h-100">
        <h2 class="text-center fw-bolder w-100 mb-5">Inscription</h2>
        <div class="mb-3 w-100">
          <input
            type="text"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="Siren"
            pattern="^[0-9]+$"
            maxlength="9"
            minlength="9"
            title="Il faut utiliser des nombres, 11 caractères sur la SIREN"
            v-model="formPreRegistrationDatas.siren"
            required
          />
        </div>
        <div class="mb-3 w-100">
          <input
            type="text"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="E-mail"
            v-model="formPreRegistrationDatas.email"
            required
          />
          <div class="invalid-feedback">Invalid email address.</div>
        </div>
        <div class="mb-3 w-100">
          <div class="input-group mb-3">
            <input
              :type="parentDatas.inputPasswordType"
              class="form-control input-troc-my-lead border-2 border-end-0"
              placeholder="Mot de passe"
              v-model="formPreRegistrationDatas.password"
              style="border-radius: 50rem 0 0 50rem !important"
              required
            />
            <button type="button" class="input-group-text border-start-0 border-2" @click="inputPasswordToogleType" style="border-radius:  0 50rem 50rem 0 !important">
              👁️
            </button>
          </div>
        </div>
        <button
          type="submit"
          class="btn w-50 m-auto btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
        >
          <img src="@/assets/pictos/user.svg" class="invert me-2" />
          <b>Inscription</b>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
