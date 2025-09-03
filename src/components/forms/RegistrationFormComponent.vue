<script setup>
import { ref, reactive, inject, onMounted } from 'vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import AlertComponent from '@/components/various/AlertComponent.vue'

// injections
const accountService = inject('accountService')
const userService = inject('userService')
const enterpriseService = inject('enterpriseService')

const parentDatas = defineProps({
  inputPasswordType: String,
  formPreRegistrationDatas: Object,
  parentEmitFunction: Function
})

const formRegistrationDatas = reactive({
  siren: parentDatas.formPreRegistrationDatas.siren,
  raison_social: '',
  enterprise_name: '',
  adresse: '',
  code_postal: '',
  ville: '',
  pays: 'France',
  firstname: '',
  name: '',
  email: parentDatas.formPreRegistrationDatas.email,
  phone: '',
  password: parentDatas.formPreRegistrationDatas.password,
  kbis_file: '',
  cing_file: ''
})

/** handle file selected */
//kbis
const kbisFileRender = ref(null)
const kbisFileInput = ref(null)
const chooseKbisFileInput = () => {
  kbisFileInput.value.click()
}
const handleKbisFileSelected = () => {
  const selectedFile = kbisFileInput.value.files[0]
  //console.log(selectedFile)
  kbisFileRender.value = URL.createObjectURL(selectedFile)
  //console.log(kbisFileRender.value)
  formRegistrationDatas.kbis_file = selectedFile
  $(document).find('#kbisFile').parent('div').find('div .text-error').hide()
}
const resetKbisFileInput = () => {
  kbisFileInput.value = null
  kbisFileRender.value = null
  formRegistrationDatas.kbis_file = ''
}

//cing
const cingFileRender = ref(null)
const cingFileInput = ref(null)
const chooseCingFileInput = () => {
  cingFileInput.value.click()
}
const handleCingFileSelected = () => {
  const selectedFile = cingFileInput.value.files[0]
  //console.log(selectedFile)
  cingFileRender.value = URL.createObjectURL(selectedFile)
  formRegistrationDatas.cing_file = selectedFile
  $(document).find('#cingFile').parent('div').find('div .text-error').hide()
}
const resetCingFileInput = () => {
  cingFileInput.value = null
  cingFileRender.value = null
  formRegistrationDatas.cing_file = ''
}
/** End handle file selected */

/** form registration ( add enterprise then add user ) */
async function formRegistrationSubmit() {
  let is_form_valid = true

  parentDatas.parentEmitFunction('toogle-page-loading', true) //lancer le loading page

  //check if from is valid
  Object.keys(formRegistrationDatas).forEach((key) => {
    //console.log(key)
    const value = formRegistrationDatas[key]
    //console.log(`Key: ${key}, Value: ${value}`);

    if (value == '') {
      if (key == 'kbis_file') {
        kbisFileInput.value.scrollIntoView({ behavior: 'smooth' })
        $(document).find('#cingFile').parent('div').find('div').addClass('error-invalid-field')
        $(document).find('#cingFile').parent('div').find('div .text-error').show()
        setTimeout(() => {
          $(document).find('#cingFile').parent('div').find('div').removeClass('error-invalid-field')
        }, 3000)
      } else if (key == 'cing_file') {
        cingFileInput.value.scrollIntoView({ behavior: 'smooth' })
        $(document).find('#kbisFile').parent('div').find('div').addClass('error-invalid-field')
        $(document).find('#kbisFile').parent('div').find('div .text-error').show()
        setTimeout(() => {
          $(document).find('#kbisFile').parent('div').find('div').removeClass('error-invalid-field')
        }, 3000)
      }

      is_form_valid = false
    }

    // check if siren is number
    if (key == 'siren') {
      //console.log("siren")
      //console.log(Number.isInteger(Number(value)))
      if (!Number.isInteger(Number(value))) {
        is_form_valid = false
      }
    }
  })
  //console.log(formRegistrationDatas)

  // if form valid submit
  if (is_form_valid == true) {
    let newEnterpriseInfosDatas = {
      name: formRegistrationDatas.enterprise_name,
      address: formRegistrationDatas.adresse,
      postalCode: parseInt(formRegistrationDatas.code_postal),
      city: formRegistrationDatas.ville,
      country: formRegistrationDatas.pays,
      siren: parseInt(formRegistrationDatas.siren)
    }

    await enterpriseService
      .createEnterprise(newEnterpriseInfosDatas)
      .then(async (res) => {
        //console.log(res)
        if (
          res.status == '201' &&
          res.statusText == 'Created' &&
          typeof res.data.id != 'undefined'
        ) {
          const newEnterpriseAdded = res.data.id

          /** upload enterprise files */
          await enterpriseService
            .uploadEnterpriseFiles(
              {
                kbis_file: formRegistrationDatas.kbis_file,
                cni_file: formRegistrationDatas.cing_file
              },
              newEnterpriseAdded
            )
            .then(async (res) => {
              console.log(res)
              if (res.data.code == 200) {
                /** insert user */
                let newUserInfosDatas = {
                  email: formRegistrationDatas.email,
                  roles: ['ROLE_USER'],
                  main: 1,
                  password: formRegistrationDatas.password,
                  firstname: formRegistrationDatas.firstname,
                  name: formRegistrationDatas.name,
                  phone: parseInt(formRegistrationDatas.phone),
                  enterprise: 'api/enterprises/' + newEnterpriseAdded,
                }
                await userService
                  .createUser(newUserInfosDatas)
                  .then(async (resCreateUser) => {
                    console.log(resCreateUser)
                    if (resCreateUser.status == '201' && resCreateUser.statusText == 'Created') {
                      //alert success
                      isAlertShowed.value = true
                      alertParams.value.type = 'alert-success'
                      alertParams.value.message = 'Votre compte a été créé avec succès'
                      alertParams.value.dismissSecs = '5'
                      alertParams.value.dismissMsg = 'Redirection vers page connection'

                      //reinit form
                      formRegistrationDatas.siren = ''
                      formRegistrationDatas.raison_social = ''
                      formRegistrationDatas.enterprise_name = ''
                      formRegistrationDatas.adresse = ''
                      formRegistrationDatas.code_postal = ''
                      formRegistrationDatas.ville = ''
                      formRegistrationDatas.pays = 'France'
                      formRegistrationDatas.email = ''
                      formRegistrationDatas.firstname = ''
                      formRegistrationDatas.name = ''
                      formRegistrationDatas.phone = ''
                      formRegistrationDatas.password = ''
                      kbisFileInput.value = null
                      kbisFileRender.value = null
                      formRegistrationDatas.kbis_file = ''
                      cingFileInput.value = null
                      cingFileRender.value = null
                      formRegistrationDatas.cing_file = ''

                      //redirection après 5sec
                      setTimeout(function () {
                        window.location.reload(true)
                      }, 4000)
                    } else {
                      //delete enterprise
                      enterpriseService.deleteEnterprise(newEnterpriseAdded)
                      //alert danger
                      isAlertShowed.value = true
                      alertParams.value.type = 'alert-danger'
                      alertParams.value.message =
                        'Erreur ajout utilisateur, veuillez ressayer ultérieurement.'
                    }
                  })
                  .catch((err) => {
                    //delete enterprise
                    enterpriseService.deleteEnterprise(newEnterpriseAdded)
                    console.log(err)
                    //alert danger
                    isAlertShowed.value = true
                    alertParams.value.type = 'alert-danger'
                    alertParams.value.message = err.response.data.detail
                  })
              } else {
                //delete enterprise
                enterpriseService.deleteEnterprise(newEnterpriseAdded)
                console.log(err)
                //alert danger
                isAlertShowed.value = true
                alertParams.value.type = 'alert-danger'
                alertParams.value.message = 'Erreur upload documents entreprise'
              }
            })
            .catch((err) => {
              //delete enterprise
              enterpriseService.deleteEnterprise(newEnterpriseAdded)
              console.log(err)
              //alert danger
              isAlertShowed.value = true
              alertParams.value.type = 'alert-danger'
              alertParams.value.message = err.response.data.detail
            })
        } else {
          //alert danger
          isAlertShowed.value = true
          alertParams.value.type = 'alert-danger'
          alertParams.value.message = 'Erreur ajout entreprise, veuillez ressayer ultérieurement.'
        }
      })
      .catch((err) => {
        console.log(err)
        //alert danger
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger'
        alertParams.value.message = err.response.data.detail
      })
  }
  parentDatas.parentEmitFunction('toogle-page-loading', false) //lancer le loading page
}

/** function from parent component */
const emit = defineEmits(['preRegistration', 'inputPasswordToogleType'])
const showFormRegistration = () => {
  emit('showFormRegistration', showFormRegistration)
}
const inputPasswordToogleType = () => {
  emit('inputPasswordToogleType', inputPasswordToogleType)
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10', dismissMsg: '' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

onMounted(async () => {
})

//console.log(formPreRegistrationDatas);
</script>

<template>
  <div>
    <div class="px-5" style="">
      <h2 class="text-center fw-bolder mb-4">Inscription</h2>
      <form @submit.prevent="formRegistrationSubmit">
        <h4 class="text-start border-bottom mb-3 pb-2">Utilisateur</h4>
        <div class="mb-3">
          <div class="row">
            <div class="col-6">
              <input
                type="text"
                class="form-control input-troc-my-lead rounded-pill border-2"
                placeholder="Prénom"
                v-model="formRegistrationDatas.firstname"
                required
              />
            </div>
            <div class="col-6">
              <input
                type="text"
                class="form-control input-troc-my-lead rounded-pill border-2"
                placeholder="Nom"
                v-model="formRegistrationDatas.name"
                required
              />
            </div>
          </div>
        </div>
        <div class="mb-3">
          <input
            type="text"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="E-mail"
            v-model="formRegistrationDatas.email"
            required
          />
        </div>
        <div class="input-group mb-3">
          <span class="input-group-text border-2" id="basic-addon1">+33</span>
          <input
            type="text"
            class="form-control input-troc-my-lead border-2"
            style="border-radius: 0 50rem 50rem 0 !important"
            placeholder="Téléphone"
            v-model="formRegistrationDatas.phone"
            pattern="^[0-9]+$"
            maxlength="9"
             title="Il faut utiliser des chifres."
            required
          />
        </div>
        <div class="mb-5">
          <div class="input-group mb-3">
            <input
              :type="parentDatas.inputPasswordType"
              class="form-control input-troc-my-lead border-2 border-end-0"
              placeholder="Mot de passe"
              v-model="formRegistrationDatas.password"
              style="border-radius: 50rem 0 0 50rem !important"
              required
            />
            <button
              type="button"
              class="input-group-text border-start-0 border-2"
              style="border-radius: 0 50rem 50rem 0 !important"
              @click="inputPasswordToogleType"
            >
              👁️
            </button>
          </div>
        </div>
        <h4 class="text-start border-bottom mb-3 pb-2">Entreprise</h4>
        <div class="mb-3">
          <input
            type="text"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="Siren"
            pattern="^[0-9]+$"
            maxlength="9"
            title="Il faut utiliser des chifres, 11 caractères sur la SIREN"
            v-model="formRegistrationDatas.siren"
            required
          />
        </div>
        <div class="mb-3">
          <input
            type="text"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="Nom de l'entreprise"
            v-model="formRegistrationDatas.enterprise_name"
            required
          />
        </div>
        <div class="mb-3">
          <input
            type="text"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="Raison sociale"
            v-model="formRegistrationDatas.raison_social"
            required
          />
        </div>
        <div class="mb-3">
          <input
            type="text"
            class="form-control input-troc-my-lead rounded-pill border-2"
            placeholder="Adresse"
            v-model="formRegistrationDatas.adresse"
            required
          />
        </div>
        <div class="mb-3">
          <div class="row">
            <div class="col-4">
              <input
                type="text"
                class="form-control input-troc-my-lead rounded-pill border-2"
                placeholder="Code postal"
                v-model="formRegistrationDatas.code_postal"
                required
              />
            </div>
            <div class="col-8">
              <input
                type="text"
                class="form-control input-troc-my-lead rounded-pill border-2"
                placeholder="Ville"
                v-model="formRegistrationDatas.ville"
                required
              />
            </div>
          </div>
        </div>
        <div class="mb-3">
          <input
                type="text"
                class="form-control input-troc-my-lead rounded-pill border-2 bg-secondary text-white"
                placeholder="Pays"
                v-model="formRegistrationDatas.pays"
                readonly
                v-tooltip="'Ce service n\'est dispnible que pour les entreprises en France pour le moment.' "
                required
              />
        </div>
        <div class="mb-5">
          <div class="row">
            <div class="col-md-6" style="cursor: pointer">
              <div
                class="position-relative border border-2 d-flex flex-wrap align-items-center justify-content-center py-2 px-2 h-100"
                style="border-color: #ced4da !important; border-radius: 15px"
                :class="{ 'bg-secondary bg-gradient': kbisFileRender }"
              >
                <button
                  type="button"
                  v-if="kbisFileRender"
                  class="btn btn-danger btn-sm position-absolute p-1"
                  style="top: 0; right: 0"
                  @click="resetKbisFileInput"
                >
                  ❌
                </button>
                <img v-if="kbisFileRender" :src="kbisFileRender" class="w-75" />
                <p v-else class="w-100 m-0" @click="chooseKbisFileInput">➕ KBIS</p>
                <small class="text-danger text-error" style="display: none"
                  >Veuillez selectionnez le fichier KBIS</small
                >
              </div>
              <input
                type="file"
                ref="kbisFileInput"
                class="d-none"
                id="kbisFile"
                @change="handleKbisFileSelected"
                accept="image/*"
              />
            </div>

            <div class="col-md-6" style="cursor: pointer">
              <div
                class="position-relative border border-2 d-flex flex-wrap align-items-center justify-content-center py-2 px-2 h-100"
                style="border-color: #ced4da !important; border-radius: 15px"
                :class="{ 'bg-secondary bg-gradient': cingFileRender }"
              >
                <button
                  type="button"
                  v-if="cingFileRender"
                  class="btn btn-danger btn-sm position-absolute p-1"
                  style="top: 0; right: 0"
                  @click="resetCingFileInput"
                >
                  ❌
                </button>
                <img v-if="cingFileRender" :src="cingFileRender" class="w-75" />
                <p
                  v-if="!cingFileRender"
                  class="m-0"
                  @click="chooseCingFileInput"
                  style="cursor: pointer"
                >
                  ➕
                </p>
                <p
                  v-if="!cingFileRender"
                  class="m-0"
                  @click="chooseCingFileInput"
                  style="cursor: pointer"
                >
                  Carte d'identité du gérant
                </p>
                <small class="text-danger text-error" style="display: none"
                  >Veuillez selectionnez le fichier CING</small
                >
              </div>
              <input
                type="file"
                ref="cingFileInput"
                class="d-none"
                id="cingFile"
                @change="handleCingFileSelected"
                accept="image/*"
              />
            </div>
          </div>
        </div>

        <!-- ALERT -->
        <AlertComponent
          v-if="isAlertShowed"
          :alert-params="{
            additionalClasses: alertParams.type + ' col-12',
            dismissSecs: alertParams.dismissSecs,
            message: alertParams.message,
            dismissMsg: alertParams.dismissMsg
          }"
          @toggle-alert="toggleAlert"
        />

        <button
          type="submit"
          class="btn w-75 mt-3 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
        >
          <img src="@/assets/pictos/user.svg" class="invert me-2" />
          <b>Inscription</b>
        </button>
        
        <div class="mt-4">
          <a @click="showFormRegistration" style="cursor: pointer"
            ><u>Retour à la page connexion</u></a
          >
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
