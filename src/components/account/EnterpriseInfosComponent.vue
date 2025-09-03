<script setup>
import { ref, reactive, inject } from 'vue'
import AlertComponent from '@/components/various/AlertComponent.vue'

// injections
const accountService = inject('accountService')
const userService = inject('userService')
const enterpriseService = inject('enterpriseService')

// parent datas
let parentDatas = defineProps({
  enterpriseInfosDatas: Object,
  parentEmitFunction: Function
})

// parnet function
const emit = defineEmits(['toggleEnterpriseInfosComponent', 'refreshEnterpriseInfos'])
const toggleEnterpriseInfosComponent = () => {
  emit('toggleEnterpriseInfosComponent', null) // Emit a custom event with data
}

const enterprise_infos_datas = reactive(parentDatas.enterpriseInfosDatas)

/** show/hide inputs */
function toggleInputs(event) {
  //console.log(event)

  if ($(event.target).hasClass('btn-cancel-edit')) {
    $(event.target).closest('.info-bloc').find('p').show()
    $(event.target).closest('.input-bloc').hide()
  } else {
    /** reinistialise all blocs inputs */
    $('.enterprise-infos-bloc').find('.info-bloc').find('p').show()
    $('.enterprise-infos-bloc').find('.info-bloc').find('.input-bloc').hide()
    /** reinistialise all blocs inputs */

    $(event.target).closest('.info-bloc').find('p').hide()
    $(event.target).closest('.info-bloc').find('.input-bloc').show()
  }
}

/** SUBMIT INPUTS */
// update enterprise infos
async function updateEnterpriseInfos() {
  parentDatas.parentEmitFunction('toogle-page-loading', true) //lancer le loading page
  console.log(enterprise_infos_datas)
  enterprise_infos_datas.siren = parseInt(enterprise_infos_datas.siren)
  await enterpriseService
    .updateEnterprise(accountService.getToken(), enterprise_infos_datas)
    .then(async (res) => {
      parentDatas.parentEmitFunction('toogle-page-loading', false)
      //console.log(res)
      isAlertShowed.value = true
      if (res.data.id == enterprise_infos_datas.id) {
        /** update enterprise infos in localstorage */
        const parsedItem = JSON.parse(accountService.getSessionUser())
        parsedItem.enterprise.name = enterprise_infos_datas.name
        await localStorage.setItem('itsMeUser', JSON.stringify(parsedItem))

        emit('refreshEnterpriseInfos', enterprise_infos_datas) // refresh enterprise infos in parent component

        alert('Enterprise modifier avec succès')
        // alert
        alertParams.value.type = 'alert-success'
        alertParams.value.message = 'Enterprise modifier avec succès'
      } else {
        alert('Erreur modification, veuillez ressayer ultérieurement')
        alertParams.value.type = 'alert-danger'
        alertParams.value.message = 'Erreur modification, veuillez ressayer ultérieurement'
      }
    })
    .catch((err) => {
      console.log(err)
      alert(err.response.data.detail)
      alertParams.value.type = 'alert-danger'
      alertParams.value.message = err.response.data.detail
    })

  parentDatas.parentEmitFunction('toogle-page-loading', false) //lancer le loading page
}

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
const breadcrumbItems = ref([{ label: 'Les informations de l\'entreprise' }])
/** end breadcrumb */
</script>

<template>
  <div class="row enterprise-infos-bloc mb-5">
    <div class="col-lg-8 offset-lg-2">
      
      <Breadcrumb class="p-0" :home="home" :model="breadcrumbItems">
        <template #item="{ item, props }">
          <a
            v-if="item.route"
            class="text-success cursor-pointer"
            @click="toggleEnterpriseInfosComponent"
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
      <div class="row position-relative py-5">
        <button
          type="button"
          class="btn btn-close btn-danger p-2"
          @click="toggleEnterpriseInfosComponent"
        ></button>
        <div class="col-lg-2 text-center">
          <img src="@/assets/pictos/office.svg" class="w-50" />
        </div>
        <div class="col-lg-10 info-bloc d-flex align-items-center">
          <p class="m-0 fs-3 fw-bold">
            {{ enterprise_infos_datas.name }}
            <i
              class="pi pi-pencil fs-5 color-green cursor-pointer ms-1"
              @click="toggleInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-3" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Nom de l'entreprise</span>
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="enterprise_infos_datas.name"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateEnterpriseInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="toggleInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center mt-3">
          <p class="">
            <b>SIREN :</b> {{ enterprise_infos_datas.siren }}
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="toggleInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-3" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">SIREN</span>
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="enterprise_infos_datas.siren"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateEnterpriseInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="toggleInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center">
          <p class="">
            <b>Adresse:</b> {{ enterprise_infos_datas.address }}
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="toggleInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-3" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Adresse</span>
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="enterprise_infos_datas.address"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateEnterpriseInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="toggleInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center">
          <p class="">
            <b>Code postale:</b> {{ enterprise_infos_datas.postalCode }}
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="toggleInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-3" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Code postale</span>
            <input
              type="number"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="enterprise_infos_datas.postalCode"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateEnterpriseInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="toggleInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center">
          <p class="">
            <b>Ville:</b> {{ enterprise_infos_datas.city }}
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="toggleInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-3" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Ville</span>
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="enterprise_infos_datas.city"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateEnterpriseInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="toggleInputs($event)"
            >
              X
            </button>
          </div>
        </div>
        <div class="col-lg-10 offset-lg-2 info-bloc d-flex align-items-center">
          <p class="">
            <b>Pays:</b> {{ enterprise_infos_datas.country }}
            <i
              class="pi pi-pencil color-green fs-5 cursor-pointer ms-1"
              @click="toggleInputs($event)"
            ></i>
          </p>

          <div class="input-group input-bloc mb-3" style="display: none">
            <span class="input-group-text bg-dark text-white" style="">Pays</span>
            <input
              type="text"
              class="form-control input-troc-my-lead border-2 border-end-0"
              v-model="enterprise_infos_datas.country"
            /><button
              type="button"
              class="btn btn-green border-start-0 border-2 text-white fw-bold px-3"
              @click="updateEnterpriseInfos"
            >
              valider
            </button>
            <button
              type="button"
              class="btn btn-danger btn-cancel-edit border-start-0 border-5 text-white fw-bold px-3"
              style="border-radius: 0px 50rem 50rem 0 !important"
              @click="toggleInputs($event)"
            >
              X
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.enterprise-infos-bloc .btn-close {
  position: absolute;
  right: 0;
  top: 0;
  border-radius: 0 10px;
  background-color: rgba(220, 53, 69, 1);
}
</style>
