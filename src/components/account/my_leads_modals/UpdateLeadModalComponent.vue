<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import axios from 'axios'
import { simplifiedStr } from '@/assets/js/customFunctions.js'
import AlertComponent from '@/components/various/AlertComponent.vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'

const imgs_parent_dir = ((process.env.NODE_ENV)=='development')?'/src/assets':'/assets'

// inject from app.vue
const accountService = inject('accountService')
const leadService = inject('leadService')
const litigeService = inject('litigeService')
const tooglePageLoading = inject('tooglePageLoading')

/** variable from parent  */
const parentDatas = defineProps({
  leadFullInfos: Object,
  showChargeService: Boolean
})
//console.log(parentDatas.leadFullInfos)

/** Function from parent */
const emit = defineEmits(['displayUpdateLeadModal'])

/** UPDATE LEAD */
// update lead form
let form_update_lead = reactive({
  id: parentDatas.leadFullInfos.id,
  firstname: parentDatas.leadFullInfos.firstname,
  name: parentDatas.leadFullInfos.name,
  address: parentDatas.leadFullInfos.address,
  postalCode: parentDatas.leadFullInfos.postalCode,
  city: parentDatas.leadFullInfos.city,
  country: 'France',
  phone: parentDatas.leadFullInfos.phone,
  email: parentDatas.leadFullInfos.email,
  status: 'to_sell',
  commentary: parentDatas.leadFullInfos.commentary,
  pricingToSeller: parentDatas.leadFullInfos.pricingToSeller,
  pricingToTpl: parentDatas.leadFullInfos.pricingToTpl,
  pricingToIncrease: parentDatas.leadFullInfos.pricingToIncrease,
  //minDate: new Date(parentDatas.leadFullInfos.minDate).toLocaleDateString('en'),
  minDate: new Date(parentDatas.leadFullInfos.min_date).toISOString().substring(0, 16),
  maxDate: new Date(parentDatas.leadFullInfos.max_date).toISOString().substring(0, 16),
  activity: parentDatas.leadFullInfos.activity,
  enterprise: parentDatas.leadFullInfos.enterprise
})
const lead_price_incresead = ref(parentDatas.leadFullInfos.pricingToIncrease)
let lead_price = parentDatas.leadFullInfos.pricingToSeller // use this to prevent the problem of changing date affect input range change
console.log(form_update_lead)

// UPDATE LEAD FUNCTION
async function updateLead() {
  isAlertShowed.value = false
  tooglePageLoading(true)
  form_update_lead.enterprise = form_update_lead.enterprise['@id']
  form_create_lead.pricingToIncrease = String(parseFloat(lead_price_incresead.value))
  console.log(form_update_lead)
  //send data to api
  await leadService
    .updateLead(accountService.getToken(), form_update_lead)
    .then(async (res) => {
      tooglePageLoading(false)
      //alert('ok');
      isAlertShowed.value = true
      alertParams.value.type = 'alert-success text-center'
      alertParams.value.message = 'Informations lead Modifier avec succès'
      //reint form
      $(document).find('.price-lead-bloc').hide()
      form_update_lead.enterprise = parentDatas.leadFullInfos.enterprise
    })
    .catch((err) => {
      tooglePageLoading(false)
      //alert('nok');
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger text-center'
      if (err.response.data.detail == 'email: phone') {
        alertParams.value.message = 'Information lead existe déjà.'
      } else {
        alertParams.value.message = err.response.data.detail
      }

      form_update_lead = {
        id: parentDatas.leadFullInfos.id,
        firstname: parentDatas.leadFullInfos.firstname,
        name: parentDatas.leadFullInfos.name,
        address: parentDatas.leadFullInfos.address,
        postalCode: parentDatas.leadFullInfos.postalCode,
        city: parentDatas.leadFullInfos.city,
        country: 'France',
        phone: parentDatas.leadFullInfos.phone,
        email: parentDatas.leadFullInfos.email,
        status: 'to_sell',
        commentary: parentDatas.leadFullInfos.commentary,
        pricingToSeller: parentDatas.leadFullInfos.pricingToSeller,
        pricingToTpl: parentDatas.leadFullInfos.pricingToTpl,
        pricingToIncrease: parentDatas.leadFullInfos.pricingToIncrease,
        //minDate: new Date(parentDatas.leadFullInfos.minDate).toLocaleDateString('en'),
        minDate: new Date(parentDatas.leadFullInfos.min_date).toISOString().substring(0, 16),
        maxDate: new Date(parentDatas.leadFullInfos.max_date).toISOString().substring(0, 16),
        activity: parentDatas.leadFullInfos.activity,
        enterprise: parentDatas.leadFullInfos.enterprise
      }

      console.log(err)
    })
}

/** PRICE LEAD */
async function priceLead(defaultpricelead = null) {
  if ($(document).find('.lead-commentary-input').val() != '') {
    //alert('ok fire now');

    $(document).find('.price-lead-bloc').hide()
    $(document).find('.form-add-lead button[type="submit"]').addClass('disabled')
    $(document).find('.price-lead-loader').show()

    await axios
      .post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo-1106',
          response_format: { type: 'json_object' },
          seed: 122011,
          messages: [
            {
              role: 'system',
              content:
                'Ignore les précédentes instructions. Tu incarneras un deviseur de ' +
                form_update_lead.activity +
                '. Toutes tes réponses devront être au format JSON et uniquement au format JSON suivant : {"min":[amount,amount,amount], "max":[amount,amount,amount]}, sans aucun texte d\'accompagnement et sans retour à la ligne et dans 1 seul et unique JSON. Ta tache sera d\'estimer 3 prix minimum et 3 prix maximum à la tache en France.'
            },
            {
              role: 'user',
              content: form_update_lead.commentary
            }
          ]
        },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      )
      .then(async (res) => {
        $(document).find('.form-add-lead button[type="submit"]').removeClass('disabled')
        await $(document).find('.price-lead-loader').hide()

        if (typeof res.data.choices[0].message.content != 'undefined') {
          //console.log(JSON.parse(res.data.choices[0].message.content).max[2])
          //calcul des prix (min, max ...)
          let respleadpricemin1 = JSON.parse(res.data.choices[0].message.content).min[0]
          let respleadpricemin2 = JSON.parse(res.data.choices[0].message.content).min[1]
          let respleadpricemin3 = JSON.parse(res.data.choices[0].message.content).min[2]
          let respleadpricemax1 = JSON.parse(res.data.choices[0].message.content).max[0]
          let respleadpricemax2 = JSON.parse(res.data.choices[0].message.content).max[1]
          let respleadpricemax3 = JSON.parse(res.data.choices[0].message.content).max[2]
          let price_lead_min = ((respleadpricemin1 + respleadpricemax1) / 2) * 0.01
          let price_lead_max = ((respleadpricemin3 + respleadpricemax3) / 2) * 0.01
          let pricemoyenne = (respleadpricemin2 + respleadpricemax2) / 2
          lead_price = defaultpricelead == null ? pricemoyenne * 0.01 : defaultpricelead

          $(document)
            .find('.price-lead-bloc .input-group-text small')
            .html('&nbsp;(Min:' + price_lead_min + ', Max:' + price_lead_max + ')')
          $(document)
            .find('.price-lead-bloc output')
            .html('<img src="'+imgs_parent_dir+'/pictos/price.svg" width="20"> ' + lead_price + '€')
          $(document).find('.price-lead-bloc input[type="range"]').attr({
            min: price_lead_min,
            max: price_lead_max
          })
          await $(document).find('.price-lead-bloc input[type="range"]').val(lead_price)
          form_update_lead.pricingToSeller = String(lead_price)
          //$(document).find('.price-lead-bloc .price-lead-increased').html( (JSON.parse(res.data.choices[0].message.content).min[1]+(JSON.parse(res.data.choices[0].message.content).min[1]*0.25))+'€' );
          if (defaultpricelead == null) {
            lead_price_incresead.value = lead_price + lead_price * 0.25 * 2 + '€'
          }

          $(document).find('.price-lead-bloc').show()
        }
      })
      .catch(async (err) => {
        console.log(err)
        await $(document).find('.price-lead-loader').hide()
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger'
        alertParams.value.message =
          err.response.data.error.code + '. ' + err.response.data.error.message
        //alert('nok')
        //console.log(err)
      })
  }
}

// range price lead
function rangePriceLead(event) {
  //console.log(event.target.value);
  lead_price = event.target.value
  lead_price_incresead.value = parseFloat(lead_price) + parseFloat(lead_price) * 0.25 * 2
  console.log(lead_price_incresead.value)
}

/** modal state */
const state = reactive({
  update_lead_modal: null
})
/** open modal state */
function openModal() {
  state.update_lead_modal.show()
}

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

onMounted(async () => {
  // make all other modal opened hided by modal-backdrop
  await $(document).find('.modal.show').addClass('zindex-0')

  /** open modal on mount compenent */
  state.update_lead_modal = new bootstrap.Modal('#update_lead_modal', {})
  await openModal()

  // show lead price
  await priceLead(lead_price)
  //$(document).find('.price-lead-bloc').show()

  $('#update_lead_modal').on('hidden.bs.modal', function () {
    //emit('displayUpdateLeadModal') // to change update_lead_modal variable to false
    location.reload()
  })
})

onUnmounted(() => {
  // Your code to be executed when the component is about to be unmounted
  state.update_lead_modal.hide()

  // make all other modal opened showed before modal-backdrop
  $(document).find('.modal.show').removeClass('zindex-0')
})
</script>

<template>
  <!-- <button type="button" class="btn btn-primary" @click="openModal">Launch demo modal</button> -->
  <div class="modal fade" id="update_lead_modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content border border-secondary border-2">
        <div class="modal-header py-0 ps-0 pe-2">
          <div class="row align-items-center w-100 m-0" style="height: fit-content">
            <div class="col-lg-2 col-3 bg-green activity-picto text-center py-1">
              <img
                :src="
                  imgs_parent_dir+'/pictos/activity/' + simplifiedStr(leadFullInfos.activity) + '.svg'
                "
                class="invert"
                width="50"
              />
            </div>
            <div class="col-lg-10 col-9">
              <h3 class="fw-bold">{{ leadFullInfos.activity }}</h3>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body py-5">
          <div class="row">
            <form @submit.prevent="updateLead" class="d-flex flex-wrap h-100 form-add-lead">
              <h2 class="text-center fw-bolder w-100 mb-4">
                Modification des informations du lead
              </h2>
              <div class="row border-tml bg-secondary bg-gradient pt-5 pb-3">
                <div class="mb-4 col-sm-6 px-1">
                  <input
                    type="text"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Prénom"
                    v-model="form_update_lead.firstname"
                    required
                  />
                </div>
                <div class="mb-4 col-sm-6 px-1">
                  <input
                    type="text"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Nom"
                    v-model="form_update_lead.name"
                    required
                  />
                </div>
                <div class="mb-4 col-sm-5 px-1">
                  <div class="input-group mb-3">
                    <!-- <label class="input-group-text border-tml" style="border-radius: 50rem 0 0 50rem !important">+33</label> -->
                    <input
                      type="number"
                      class="form-control input-troc-my-lead rounded-pill border-tml"
                      placeholder="Telephone"
                      v-model="form_update_lead.phone"
                      required
                    />
                  </div>
                </div>
                <div class="mb-4 col-sm-7 px-1">
                  <input
                    type="email"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="E-mail"
                    v-model="form_update_lead.email"
                    required
                  />
                  <!-- <div class="invalid-feedback">Invalid email address.</div> -->
                </div>
                <div class="mb-4 px-1">
                  <input
                    type="text"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Adresse"
                    v-model="form_update_lead.address"
                    required
                  />
                </div>
                <div class="mb-4 col-sm-3 px-1">
                  <input
                    type="text"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Code postal"
                    v-model="form_update_lead.postalCode"
                    pattern="[0-9]{5}"
                    title="Code postal exemple: 75000"
                    required
                  />
                </div>
                <div class="mb-4 col-sm-5 px-1">
                  <input
                    type="text"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Ville"
                    v-model="form_update_lead.city"
                    required
                  />
                </div>
                <div class="mb-4 col-sm-4 px-1">
                  <input
                    type="text"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Country"
                    v-model="form_update_lead.country"
                    readonly
                    required
                  />
                </div>
                <div class="mb-4 px-1">
                  <label class="form-label fw-bold text-white">Domaine d'activité</label>
                  <select
                    class="form-select input-troc-my-lead rounded-pill border-tml"
                    v-model="form_update_lead.activity"
                    required
                  >
                    <option value="" disabled selected>--Activité--</option>
                    <option value="Art">Art</option>
                    <option value="Tunnel">Tunnel</option>
                    <option value="Réseaux">Réseaux</option>
                    <option value="Électricité">Électricité</option>
                    <option value="Maritime">Maritime</option>
                    <option value="Génie Civil">Génie Civil</option>
                    <option value="Démolition">Démolition</option>
                    <option value="Terrassement">Terrassement</option>
                    <option value="Forage">Forage</option>
                    <option value="Plomberie">Plomberie</option>
                    <option value="Thermique">Thermique</option>
                    <option value="Isolation">Isolation</option>
                    <option value="Plâtrerie">Plâtrerie</option>
                    <option value="Sol">Sol</option>
                    <option value="Menuiserie">Menuiserie</option>
                    <option value="Serrurerie">Serrurerie</option>
                    <option value="Agencement">Agencement</option>
                    <option value="Revêtement">Revêtement</option>
                    <option value="Peinture">Peinture</option>
                    <option value="Charpente">Charpente</option>
                    <option value="Couverture">Couverture</option>
                    <option value="Étanchéité">Étanchéité</option>
                    <option value="Structure">Structure</option>
                    <option value="Maçonnerie">Maçonnerie</option>
                    <option value="Automobile">Automobile</option>
                    <option value="Elagage">Elagage</option>
                    <option value="Paysage">Paysage</option>
                  </select>
                </div>
                <div class="mb-4 px-1">
                  <textarea
                    type="text"
                    class="form-control input-troc-my-lead border-tml border-1 lead-commentary-input"
                    rows="5"
                    style="border-radius: 0.7rem !important"
                    placeholder="Description du lead"
                    v-model="form_update_lead.commentary"
                    v-on:focusout="priceLead"
                    required
                  ></textarea>
                </div>
                <div class="mb-4 col-sm-6 px-1">
                  <label class="form-label fw-bold text-white">Date debut chantier</label>
                  <input
                    type="datetime-local"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Date debut chantier"
                    v-model="form_update_lead.minDate"
                    required
                  />
                </div>
                <div class="mb-5 col-sm-6 px-1">
                  <label class="form-label fw-bold text-white">Max date debut chantier</label>
                  <input
                    type="datetime-local"
                    class="form-control input-troc-my-lead rounded-pill border-tml"
                    placeholder="Max date debut chantier"
                    v-model="form_update_lead.maxDate"
                    required
                  />
                </div>
                <div class="price-lead-loader mb-4" style="display: none">
                  <div class="loader m-auto"></div>
                </div>
                <div class="mb-4 px-1 price-lead-bloc" style="display: none">
                  <div class="input-group mb-3">
                    <label class="input-group-text fw-bold">Prix <small></small></label>
                    <input
                      type="range"
                      class="form-range form-control bg-gradient px-1"
                      min="0"
                      max="5"
                      step="0.5"
                      v-model="form_update_lead.pricingToSeller"
                      @input="rangePriceLead"
                      oninput="this.nextElementSibling.value = this.value+'€'"
                      style="vertical-align: -webkit-baseline-middle; height: auto"
                    />
                    <output
                      class="input-group-text text-center d-block"
                      style="width: 10rem"
                    ></output>
                  </div>
                  <small class="text-white"
                    >Prix de vente majoré afficher sur l'annonce ( prix lead + frais des services )
                    <b class="price-lead-increased"> = {{ lead_price_incresead }}</b></small
                  >
                </div>

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

                <button
                  type="button"
                  class="btn w-50 m-auto bg-gradien btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
                >
                  <img src="@/assets/pictos/edit.svg" class="invert me-2" />
                  <b>Modifier les informations</b>
                </button>

              </div>
            </form>
          </div>
        </div>
        <div class="modal-footer border-0"></div>
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

.form-range:focus {
  background-color: transparent !important;
}

.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #21a085;
  border-bottom: 16px solid #21a085;
  width: 100px;
  height: 100px;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
