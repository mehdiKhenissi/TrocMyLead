<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { simplifiedStr, formatDateToISOString } from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const tooglePageLoading = inject('tooglePageLoading')
const accountService = inject('accountService')
const leadService = inject('leadService')
const userService = inject('userService')

/** variable from parent  */
const parentDatas = defineProps({
  userItemInfosProps: Object
})
console.log(parentDatas.userItemInfosProps)

/** Function from parent */
const emit = defineEmits(['displayUserModal'])

/** Activate enterprise */
async function enableUser() {
  //alert('activateEnterprise '+ formatDateToISOString(new Date()));
  if (confirm('Êtes-vous sûr de vouloir activer cet utilisateur')) {
    await userService
      .updateUser(accountService.getToken(), {
        id: parentDatas.userItemInfosProps.id,
        enabledAt: formatDateToISOString(new Date()),
        disabledAt: null
      })
      .then(async (resEnableEnterprise) => {
        if (
          typeof resEnableEnterprise.data != 'undefined' &&
          typeof resEnableEnterprise.data.id != 'undefined'
        ) {
          window.location.reload(true)
        } else {
          alertParams.value.type = 'alert-danger'
          alertParams.value.message =
            "Une erreur s'est produite, veuillez contacter le service technique ou ressayer ultérieurement"
          isAlertShowed.value = true
        }
        console.log(resEnableEnterprise)
      })
      .catch((errEnabledEnterprise) => {
        console.log(errEnabledEnterprise)
        alertParams.value.type = 'alert-danger'
        alertParams.value.message =
          "Une erreur s'est produite, veuillez contacter le service technique ou ressayer ultérieurement"
        isAlertShowed.value = true
      })
  }
}

/** Desactivate Enterprise */
async function disableUser() {
  //alert('deactivateEnterprise '+ formatDateToISOString(new Date()));
  if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur')) {
    await userService
      .updateUser(accountService.getToken(), {
        id: parentDatas.userItemInfosProps.id,
        disabledAt: formatDateToISOString(new Date())
      })
      .then(async (resDisabledEnterprise) => {
        console.log(resDisabledEnterprise)
        if (
          typeof resDisabledEnterprise.data != 'undefined' &&
          typeof resDisabledEnterprise.data.id != 'undefined'
        ) {
          window.location.reload(true)
        } else {
          alertParams.value.type = 'alert-danger'
          alertParams.value.message =
            "Une erreur s'est produite, veuillez contacter le service technique ou ressayer ultérieurement"
          isAlertShowed.value = true
        }
      })
      .catch((errDisabledEnterprise) => {
        console.log(errDisabledEnterprise)
        alertParams.value.type = 'alert-danger'
        alertParams.value.message =
          "Une erreur s'est produite, veuillez contacter le service technique ou ressayer ultérieurement"
        isAlertShowed.value = true
      })
  }
}

/** modal state */
const state = reactive({
  user_modal: null
})
/** open modal state */
function openModal() {
  state.user_modal.show()
}

/** images doc */
const imageClick = (url) => {
  window.open(url, '_blank')
}
/** end images doc */

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}
/** END ALERT */

onMounted(async () => {
  // get list litige step

  // make all other modal opened hided by modal-backdrop
  await $(document).find('.modal.show').addClass('zindex-0')
  /** open modal on mount compenent */
  state.user_modal = new bootstrap.Modal('#user_modal', {})
  await openModal()

  $('#user_modal').on('hidden.bs.modal', function () {
    emit('displayUserModal') // to change lead_litige_checking_modal variable to false
  })

  //console.log(parentDatas.enterpriseItemInfosProps.created_at)
  //console.log(Date.parse(parentDatas.enterpriseItemInfosProps.created_at))
  //console .log(Date.parse(parentDatas.enterpriseItemInfosProps) < Date.parse(date_2_days_after_lead_selled_at))
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.user_modal.hide()

  // make all other modal opened showed before modal-backdrop
  $(document).find('.modal.show').removeClass('zindex-0')
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal" id="user_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header py-2">
          <h5 class="modal-title fw-bold">
            Informations utilisateur 
          </h5>
          <small class="text-danger fw-bold ms-2" v-if="userItemInfosProps.enabled_at == null"> ( en attente de code de validation utilisateur)</small>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body border border-dark" style="background-color: gainsboro">
          <div class="row py-3">
            <div class="col-12">
              <!-- <hr class="w-25 m-auto my-3" /> -->
            </div>

            <div class="col-6 my-2">
              <label class="fw-bold">Nom & prénom :</label>
              {{ userItemInfosProps.firstname }} {{ userItemInfosProps.name }}
            </div>

            <div class="col-6 my-2">
              <label class="fw-bold">Email:</label>
              {{ userItemInfosProps.email }}
            </div>

            <div class="col-6 my-2">
              <label class="fw-bold">Téléphone:</label>
              +33{{ userItemInfosProps.phone }}
            </div>

            <div class="col-6 my-2">
              <label class="fw-bold">Entreprise:</label>
              {{ userItemInfosProps.enterprise.name }}
            </div>

            <div class="col-6 my-2">
              <label class="fw-bold">Date d'activation:</label>
              Acitver le {{ new Date(userItemInfosProps.enabled_at).toLocaleDateString('fr') }}
            </div>

            <div class="col-6 my-2">
              <label class="fw-bold">Date désactivation:</label>
              <span class="px-1" v-if="userItemInfosProps.disabled_at != null">
                Désactiver le
                {{ new Date(userItemInfosProps.disabled_at).toLocaleDateString('fr') }}
              </span>
              <span v-else> - </span>
            </div>

            <div class="col-6 my-2">
              <label class="fw-bold">Roles:</label>
              <ul>
                <li v-for="role_item in userItemInfosProps.roles" :key="role_item.id">
                  {{ role_item }}
                </li>
              </ul>
            </div>

            <!-- ALERT -->
            <AlertComponent
              v-if="isAlertShowed"
              :alert-params="{
                additionalClasses: alertParams.type + ' col-12 mb-0',
                dismissSecs: alertParams.dismissSecs,
                message: alertParams.message
              }"
              @toggle-alert="toggleAlert"
            />
            <!-- END ALERT -->
          </div>
        </div>
        <div class="modal-footer p-2 justify-content-between">
          <div class="">
            <button
              type="button"
              class="btn btn-success text-white fw-bold bg-gradient"
              :class="{'disabled':  userItemInfosProps.enabled_at == null}"
              @click="enableUser"
              v-if="
                userItemInfosProps.enabled_at == null ||
                userItemInfosProps.disabled_at != null ||
                Date.parse(userItemInfosProps.disabled_at) <
                  Date.parse(userItemInfosProps.enabled_at)
              "
            >
              Activer cet utilisateur
            </button>
            <button
              type="button"
              class="btn bg-tml-red text-white fw-bold bg-gradient"
              @click="disableUser"
              v-else
            >
              Désactiver cet utilisateur
            </button>
          </div>
            <div class="">
            <!-- <label class="fw-bold fs-5" style="vertical-align: -webkit-baseline-middle"
                >Status :
              </label> -->
            <InlineMessage
              class="ms-2"
              severity="error"
              v-if="
                userItemInfosProps.disabled_at == null ||
                userItemInfosProps.disabled_at != null ||
                Date.parse(userItemInfosProps.disabled_at) <
                  Date.parse(userItemInfosProps.enabled_at)
              "
              >&nbsp;Utilisateur inactive</InlineMessage
            >
            <InlineMessage class="ms-2" severity="success" v-else
              >&nbsp;Utilisateur active</InlineMessage
            >
          </div>
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

.commentary-content:hover {
  background-color: rgb(216, 216, 216);
  cursor: pointer;
}

.enterprise-documents {
  cursor: pointer;
}
</style>
