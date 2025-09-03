<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { simplifiedStr, formatDateToISOString } from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'

// inject from app.vue
const tooglePageLoading = inject('tooglePageLoading')
const accountService = inject('accountService')
const leadService = inject('leadService')
const enterpriseService = inject('enterpriseService')
const userService = inject('userService')
const apiUrl = inject('apiUrl');
//const backUrl = apiUrl.replaceAll('/api', '');


/** variable from parent  */
const parentDatas = defineProps({
  enterpriseItemInfosProps: Object
})
//console.log(parentDatas.enterpriseItemInfosProps)

/** Function from parent */
const emit = defineEmits(['displayEnterpriseModal'])

/** Activate enterprise */
async function enableEnterprise() {
  //alert('activateEnterprise '+ formatDateToISOString(new Date()));
  if (confirm('Êtes-vous sûr de vouloir activer cette entreprise')) {
    await enterpriseService
      .updateEnterprise(accountService.getToken(), {
        id: parentDatas.enterpriseItemInfosProps.id,
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
async function disableEnterprise() {
  //alert('deactivateEnterprise '+ formatDateToISOString(new Date()));
  if (
    confirm(
      'Êtes-vous sûr de vouloir désactiver cette entreprise, tous les utilisateurs liés seront désactivés.'
    )
  ) {
    tooglePageLoading(true)
    await enterpriseService
      .updateEnterprise(accountService.getToken(), {
        id: parentDatas.enterpriseItemInfosProps.id,
        disabledAt: formatDateToISOString(new Date())
      })
      .then(async (resDisabledEnterprise) => {
        console.log(resDisabledEnterprise)
        if (
          typeof resDisabledEnterprise.data != 'undefined' &&
          typeof resDisabledEnterprise.data.id != 'undefined'
        ) {
          // disable all user of enterprise
          await userService
            .getAllUsersByEnterprise(
              accountService.getToken(),
              parentDatas.enterpriseItemInfosProps.id
            )
            .then(async (resGetAllUsersByEnterprise) => {
              if (
                typeof resGetAllUsersByEnterprise.data != 'undefined' &&
                typeof resGetAllUsersByEnterprise.data.list_users != 'undefined'
              ) {
                console.log(resGetAllUsersByEnterprise.data.list_users.length)
                if (resGetAllUsersByEnterprise.data.list_users.length != 0) {
                  for (let iu = 0; iu < resGetAllUsersByEnterprise.data.list_users.length; iu++) {
                    // API disable user
                    await userService
                      .updateUser(accountService.getToken(), {
                        id: resGetAllUsersByEnterprise.data.list_users[iu].id,
                        disabled_at: formatDateToISOString(new Date())
                      })
                      .then(async (respUpdateUser) => {
                        if (
                          typeof respUpdateUser.data != 'undefined' &&
                          typeof respUpdateUser.data.id != 'undefined'
                        ) {
                          window.location.reload(true)
                        }
                      })
                      .catch(async (errorUpdateUser) => {
                        console.log(errorUpdateUser)
                      })
                  }
                }
              }
            })
            .catch(async (errGetAllUsersByEnterprise) => {
              console.log(errGetAllUsersByEnterprise)
            })

          //window.location.reload(true)
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

    tooglePageLoading(false)
  }
}

/** modal state */
const state = reactive({
  enterprise_modal: null
})
/** open modal state */
function openModal() {
  state.enterprise_modal.show()
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
  state.enterprise_modal = new bootstrap.Modal('#enterprise_modal', {})
  await openModal()

  $('#enterprise_modal').on('hidden.bs.modal', function () {
    emit('displayEnterpriseModal') // to change lead_litige_checking_modal variable to false
  })

  //console.log(parentDatas.enterpriseItemInfosProps.created_at)
  //console.log(Date.parse(parentDatas.enterpriseItemInfosProps.created_at))
  //console .log(Date.parse(parentDatas.enterpriseItemInfosProps) < Date.parse(date_2_days_after_lead_selled_at))
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.enterprise_modal.hide()

  // make all other modal opened showed before modal-backdrop
  $(document).find('.modal.show').removeClass('zindex-0')
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal" id="enterprise_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" style="font-weight: 900">Informations entreprise</h4>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="col-12 flex flex-wrap align-items-center mb-3 gap-2 text-center">
            <!-- <label class="fs-5" style="vertical-align: -webkit-baseline-middle; font-weight: 900"
              >Status :
            </label> -->
            <InlineMessage
              class="ms-2 border-2"
              severity="success"
              v-if="
                enterpriseItemInfosProps.enabled_at != null &&
                enterpriseItemInfosProps.disabled_at == null
              "
              >&nbsp;Entreprise activer</InlineMessage
            >
            <InlineMessage
              class="ms-2 border-2"
              severity="error"
              v-tooltip="'En attente de validation des documents'"
              v-if="
                enterpriseItemInfosProps.enabled_at == null ||
                enterpriseItemInfosProps.disabled_at != null ||
                Date.parse(enterpriseItemInfosProps.disabled_at) <
                  Date.parse(enterpriseItemInfosProps.enabled_at)
              "
              >&nbsp;Entreprise désactiver</InlineMessage
            >
          </div>

          <hr class="w-100 m-auto my-3" />

          <div class="row py-3">
            <div class="col-6">
              <label class="fw-bold">Nom de l'entreprise</label>
              <p class="px-1">
                {{ enterpriseItemInfosProps.name }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Siren</label>
              <p class="px-1">
                {{ enterpriseItemInfosProps.siren }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Adresse</label>
              <p class="px-1">
                {{ enterpriseItemInfosProps.address }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Ville</label>
              <p class="px-1">
                {{ enterpriseItemInfosProps.city }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Code postal</label>
              <p class="px-1">
                {{ enterpriseItemInfosProps.postalCode }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Pays</label>
              <p class="px-1">
                {{ enterpriseItemInfosProps.country }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Date de création</label>
              <p class="px-1">
                Créer le
                {{ new Date(enterpriseItemInfosProps.created_at).toLocaleDateString('fr') }}
              </p>
            </div>

            <div class="col-6">
              <label class="fw-bold">Date d'activation</label>
              <p class="px-1">
                Acitver le
                {{ new Date(enterpriseItemInfosProps.enabled_at).toLocaleDateString('fr') }}
              </p>
            </div>

            <div class="col-6" v-if="enterpriseItemInfosProps.disabled_at != null">
              <label class="fw-bold">Date désactivation</label>
              <p class="px-1">
                Désactiver le
                {{ new Date(enterpriseItemInfosProps.disabled_at).toLocaleDateString('fr') }}
              </p>
            </div>

            <hr class="w-100 m-auto my-3" />

            <div class="enterprsie-documents">
              <h5 class="text-bolder" style="font-weight: 900">Documents:</h5>

              <div class="row bg-secondary py-3">
                <div class="col-md-5">
                  <figure
                    class="figure border enterprise-documents h-100 position-relative d-flex align-items-center  bg-white w-100"
                    @click="
                      imageClick(
                        (apiUrl+'/uploads/enterprises/enterprise_' +
                          enterpriseItemInfosProps.id +
                          '/cni_file.webp').replaceAll('api/', '')
                      )
                    "
                  >
                    <img
                      :src="
                        (apiUrl+'/uploads/enterprises/enterprise_' +
                        enterpriseItemInfosProps.id +
                        '/cni_file.webp').replaceAll('api/', '')
                      "
                      style="cursor: pointer; min-height: 10rem"
                      class="w-100"
                    />
                    <figcaption
                      class="figure-caption border text-center bg-white text-dark fw-bold position-absolute w-100 fs-6"
                      style="bottom: 0"
                    >
                      <i class="pi pi-file"></i>
                      CNI entreprise
                    </figcaption>
                  </figure>
                </div>
                <div class="col-md-2"></div>
                <div class="col-md-5">
                  <figure
                    class="figure border enterprise-documents h-100 position-relative d-flex align-items-center bg-white w-100"
                    @click="
                      imageClick(
                        (apiUrl+'/uploads/enterprises/enterprise_' +
                          enterpriseItemInfosProps.id +
                          '/kbis_file.webp').replaceAll('api/', '')
                      )
                    "
                  >
                    <img
                      :src="
                        (apiUrl+'/uploads/enterprises/enterprise_' +
                        enterpriseItemInfosProps.id +
                        '/kbis_file.webp').replaceAll('api/', '')
                      "
                      style="cursor: pointer; min-height: 10rem"
                      class="w-100"
                    />
                    <figcaption
                      class="figure-caption border text-center bg-white text-dark fw-bold position-absolute w-100 fs-6"
                      style="bottom: 0"
                    >
                      <i class="pi pi-file"></i>
                      KBIS entreprise
                    </figcaption>
                  </figure>
                </div>
              </div>
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
        <div class="modal-footer justify-content-center">
          <button
            type="button"
            class="btn bg-tml-red text-white fw-bold"
            @click="disableEnterprise"
            v-if="
              enterpriseItemInfosProps.enabled_at && enterpriseItemInfosProps.disabled_at == null
            "
          >
            Désactiver cette entreprise
          </button>
          <button
            type="button"
            class="btn btn-success text-white fw-bold"
            @click="enableEnterprise"
            v-if="
              enterpriseItemInfosProps.enabled_at == null ||
              enterpriseItemInfosProps.disabled_at != null ||
              Date.parse(enterpriseItemInfosProps.disabled_at) <
                Date.parse(enterpriseItemInfosProps.enabled_at)
            "
          >
            Activer cette entreprise
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

.commentary-content:hover {
  background-color: rgb(216, 216, 216);
  cursor: pointer;
}

.enterprise-documents {
  cursor: pointer;
}

</style>
