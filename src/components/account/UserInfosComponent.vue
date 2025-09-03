<script setup>
import { ref, reactive, inject } from 'vue'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const accountService = inject('accountService')
const userService = inject('userService')
const tooglePageLoading = inject('tooglePageLoading')

/** parent datas */
const parentDatas = defineProps({
  userInfosDatas: Object,
  parentEmitFunction: Function
})

/** parent function */
const emit = defineEmits(['toggleUserInfosComponent', 'refreshUserInfos'])
const toggleUserInfosComponent = () => {
  emit('toggleUserInfosComponent', null) // Emit a custom event with data
}

/** user infos form */
//const formUserInfos = reactive(parentDatas.userInfosDatas);
const formUserInfos = reactive({
  id: parentDatas.userInfosDatas.id,
  firstname: parentDatas.userInfosDatas.firstname,
  name: parentDatas.userInfosDatas.name,
  email: parentDatas.userInfosDatas.email,
  phone: parentDatas.userInfosDatas.phone,
  old_password: '',
  new_password: '',
  confirm_new_password: ''
})

const dialog_update_pwd_visible = ref(false)

/** show/hide inputs */
function showHideInputs(event) {
  // console.log(event);
  if ($(event.target).hasClass('btn-cancel-edit')) {
    $(event.target).closest('.info-bloc').find('p').show()
    $(event.target).closest('.input-bloc').hide()
  } else {
    /** reinistialise all blocs inputs */
    $('.user-infos-bloc').find('.info-bloc').find('p').show()
    $('.user-infos-bloc').find('.info-bloc').find('.input-bloc').hide()
    /** reinistialise all blocs inputs */

    $(event.target).closest('.info-bloc').find('p').hide()
    $(event.target).closest('.info-bloc').find('.input-bloc').show()
  }
}

function isValidEmail(email) {
  // Regular expression for a simple email validation
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/** SUBMIT INPUTS */
async function updateUserInfos() {
  parentDatas.parentEmitFunction('toogle-page-loading', true) //lancer le loading page
  //console.log(formUserInfos)

  if (isValidEmail(formUserInfos.email)) {
    await userService
      .updateUser(accountService.getToken(), formUserInfos)
      .then(async (res) => {
        parentDatas.parentEmitFunction('toogle-page-loading', false)
        console.log(res)
        isAlertShowed.value = true

        if (res.data.id == formUserInfos.id) {
          /** update enterprise infos in localstorage */
          const parsedItem = JSON.parse(accountService.getSessionUser())
          parsedItem.firstname = formUserInfos.firstname
          parsedItem.name = formUserInfos.name
          parsedItem.email = formUserInfos.email
          parsedItem.phone = formUserInfos.phone
          await localStorage.setItem('itsMeUser', JSON.stringify(parsedItem))

          emit('refreshUserInfos', formUserInfos) // refresh enteprrise name in parent component
          // alert
          alertParams.value.type = 'alert-success'
          alertParams.value.message = 'informations modifier avec succès'
        } else {
          alert('Erreur modification informations utilisateur.')
          alertParams.value.type = 'alert-danger'
          alertParams.value.message = 'Erreur modification, veuillez ressayer ultérieurement'
        }
      })
      .catch((err) => {
        parentDatas.parentEmitFunction('toogle-page-loading', false)
        console.log(err)
        alert(err.response.data.detail)
        alertParams.value.type = 'alert-danger'
        alertParams.value.message = err.response.data.detail
      })
  } else {
    parentDatas.parentEmitFunction('toogle-page-loading', false)
    alert('email non valide')
  }
}

/** Udpate pwd */

async function rmErrorInputUpdatePwdModal() {
  /** reinit inputs */
  $(document).find('#modalUpdatePwd').find('input').removeClass('border-2 border-danger')
  $(document).find('#modalUpdatePwd').find('.error-update-pwd').addClass('d-none').html('')
  /** end reinit inputs */
}

async function updateUserPassword() {
  tooglePageLoading(true)
  /** reinit inputs */
  $(document).find('#modalUpdatePwd').find('input').removeClass('border-2 border-danger')
  $(document).find('#modalUpdatePwd').find('.error-update-pwd').addClass('d-none').html('')
  /** end reinit inputs */

  if (
    formUserInfos.old_password != '' &&
    formUserInfos.new_password != '' &&
    formUserInfos.confirm_new_password != ''
  ) {
    if (formUserInfos.new_password == formUserInfos.confirm_new_password) {
      await userService
        .updateUserPassword(
          accountService.getToken(),
          {
            old_password: formUserInfos.old_password,
            new_password: formUserInfos.new_password
          },
          formUserInfos.id
        )
        .then(async (res) => {
          console.log(res)
          tooglePageLoading(false)
          //isAlertShowed.value = true

          if (res.data.code == 200) {
            alert('Modifier avec succès')
            $(document)
              .find('#modalUpdatePwd')
              .find('.success-update-pwd')
              .removeClass('d-none')
              .html('Mot de passe modifié avec succès.')
          } else {
            $(document)
              .find('#modalUpdatePwd')
              .find('.error-update-pwd')
              .removeClass('d-none')
              .html(res.data.message)
            alert(res.data.message)
          }
        })
        .catch((err) => {
          console.log(err)
          tooglePageLoading(false)
          $(document)
            .find('#modalUpdatePwd')
            .find('.error-update-pwd')
            .removeClass('d-none')
            .html(
              "Une erreur c'est produite, veuillez ressayer plus tard ou contacter le service technique."
            )
        })
    } else {
      $(document)
        .find('#modalUpdatePwd')
        .find('#confirmnouveaumotdepasse')
        .addClass('border-2 border-danger')
      $(document)
        .find('#modalUpdatePwd')
        .find('.error-update-pwd')
        .removeClass('d-none')
        .html('Nouveau mot de passe et confirm nouveau mot de passe doit étre')
    }
  } else {
    $(document).find('#modalUpdatePwd').find('input').addClass('border-2 border-danger')
    $(document)
      .find('#modalUpdatePwd')
      .find('.error-update-pwd')
      .removeClass('d-none')
      .html('Veuillez remplire tous les champs.')
  }
}

/** END Udpate pwd */

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

/** breadcrumb */
const home = ref({
  label: 'Accueil',
  icon: 'pi pi-home',
  route: '/account'
})
const breadcrumbItems = ref([{ label: 'Mes informations' }])
/** end breadcrumb */
</script>

<template>
  <div class="row user-infos-bloc mb-5">
    
    <div class="col-lg-8 offset-lg-2">
      
      <Breadcrumb class="p-0" :home="home" :model="breadcrumbItems">
        <template #item="{ item, props }">
          <a
            v-if="item.route"
            class="text-success cursor-pointer"
            @click="toggleUserInfosComponent"
          >
            <span :class="[item.icon, 'text-color']" />
            <span class="text-success font-semibold">{{ item.label }}</span>
          </a>
          <a v-else class="text-success cursor-pointer">
            <span class="text-color">{{ item.label }}</span>
          </a>
        </template>
      </Breadcrumb>
    </div>

    <AlertComponent
      v-if="isAlertShowed"
      :alert-params="{
        additionalClasses: alertParams.type + ' text-center col-lg-8 offset-lg-2',
        dismissSecs: alertParams.dismissSecs,
        message: alertParams.message
      }"
      @toggle-alert="toggleAlert"
    />

    <div class="col-lg-8 offset-lg-2 border-tml">

      <div class="row py-5 position-relative">
        <button
          type="button"
          class="btn btn-danger btn-close p-2"
          @click="toggleUserInfosComponent"
        ></button>
        <div class="col-lg-2 text-center">
          <img src="@/assets/pictos/user.svg" class="w-50" /><input
            type="hidden"
            v-model="formUserInfos.id"
          />
        </div>

        <div class="col-lg-10 info-bloc d-flex align-items-center">
          <p class="m-0 fs-3 fw-bold">
            {{ formUserInfos.firstname }} {{ formUserInfos.name }}
            <i
              class="pi pi-pencil fs-5 color-green cursor-pointer ms-1"
              @click="showHideInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-4" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Prénom & Nom</span>
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              placeholder="Prénom"
              v-model="formUserInfos.firstname"
            />
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              placeholder="Nom"
              v-model="formUserInfos.name"
            />
            <button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateUserInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="showHideInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center mt-3">
          <p class="mb-4">
            <b>Email :</b> {{ formUserInfos.email }}
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="showHideInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-4" style="display: none">
            <span class="input-group-text bg-dark text-white px-3" style="">Email</span>
            <input
              type="email"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="formUserInfos.email"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateUserInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="showHideInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center">
          <p class="mb-4">
            <b>Téléphone:</b> {{ formUserInfos.phone }}
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="showHideInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-4" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Téléphone</span>
            <input
              type="number"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="formUserInfos.phone"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateUserInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="showHideInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center">
          <p class="mb-4">
            <b>Changer le mot de passe </b>
            <!-- <i
              class="pi pi-pencil color-green fs-3 cursor-pointer ms-1"
              @click="showHideInputs($event)"
            ></i> -->
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="dialog_update_pwd_visible = true"
            ></i>
          </p>

          <!-- Dialog PWD -->
          <Dialog
            v-model:visible="dialog_update_pwd_visible"
            modal
            id="modalUpdatePwd"
            header="Modifier le mot de passe"
            :style="{ width: '40rem' }"
          >
            <form @submit.prevent="updateUserPassword">
              <div class="mb-3">
                <label for="ancienmotdepasse" class="form-label">Mot de passe actuel</label>
                <input
                  type="password"
                  class="form-control"
                  id="ancienmotdepasse"
                  autocomplete="old-password"
                  @keyup="rmErrorInputUpdatePwdModal"
                  v-model="formUserInfos.old_password"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="nouveaumotdepasse" class="form-label">Nouveau mot de passe</label>
                <input
                  type="password"
                  class="form-control"
                  id="nouveaumotdepasse"
                  autocomplete="new-password"
                  @keyup="rmErrorInputUpdatePwdModal"
                  pattern=".{4,}"
                  title="4 caractéres minimum"
                  v-model="formUserInfos.new_password"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="confirmnouveaumotdepasse" class="form-label"
                  >Confirmer le nouveau mot de passe</label
                >
                <input
                  type="password"
                  class="form-control"
                  id="confirmnouveaumotdepasse"
                  autocomplete="confirm-new-password"
                  @keyup="rmErrorInputUpdatePwdModal"
                  pattern=".{4,}"
                  title="4 caractéres minimum"
                  v-model="formUserInfos.confirm_new_password"
                  required
                />
              </div>
              <div class="mb-3">
                <p class="alert alert-danger error-update-pwd text-center d-none"></p>
                <p class="alert alert-success success-update-pwd text-center d-none"></p>
              </div>
              <div class="flex justify-content-center gap-2">
                <Button type="submit" label="Valider" @click=""></Button>
              </div>
            </form>
          </Dialog>
          <!-- ENd Dialog PWD -->

          <!-- <div class="input-group input-bloc mt-3 mb-4" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Mot de passe</span>
            <input
              type="password"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="formUserInfos.old_password"
              placeholder="Mot de passe actuelle"
            />
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              placeholder="Nouveau mot de passe"
              v-model="formUserInfos.new_password"
              required
            />
            <button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateUserPassword"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="showHideInputs($event)"
            >
              X
            </button>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-infos-bloc .btn-close {
  position: absolute;
  right: 0;
  top: 0;
  border-radius: 0 10px;
}
</style>
