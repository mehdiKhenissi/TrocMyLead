<script setup>
import { ref, onMounted, inject, reactive } from 'vue'
import axios from 'axios'
import router from '@/router'
import AlertComponent from '@/components/various/AlertComponent.vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import { simplifiedStr } from '@/assets/js/customFunctions.js'

const imgs_parent_dir = process.env.NODE_ENV == 'development' ? '/src/assets' : '/assets'

// injections
const accountService = inject('accountService')
const userService = inject('userService')
const leadService = inject('leadService')
const enterpriseService = inject('enterpriseService')

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

/** create lead form */
const form_create_lead = reactive({
  firstname: '',
  name: '',
  address: '',
  postalCode: '',
  city: '',
  country: 'France',
  phone: '',
  email: '',
  status: 'to_sell',
  commentary: '',
  pricingToSeller: '',
  pricingToTpl: '',
  pricingToIncrease: '',
  minDate: '',
  maxDate: '',
  activity: '',
  enterprise: ''
})
const lead_price_incresead = ref(null)
let lead_price = null // use this to prevent the problem of changing date affect input range change

/** calcule lead price */
async function priceLead() {
  if ($(document).find('.lead-commentary-input').val() != '' && form_create_lead.activity != '') {
    //alert('ok fire now');

    $(document).find('.price-lead-bloc').hide()
    $(document).find('.form-add-lead button[type="submit"]').addClass('disabled')
    $(document).find('.price-lead-loader').show()

    await leadService
      .chatGptPriceLead(accountService.getToken(), {
        activity: form_create_lead.activity,
        commentary: form_create_lead.commentary
      })
      .then(async (res) => {
        console.log(res)
        $(document).find('.form-add-lead button[type="submit"]').removeClass('disabled')
        await $(document).find('.price-lead-loader').hide()

        if (
          typeof res.data.price_informations != 'undefined' &&
          typeof res.data.price_informations.choices[0].message.content != 'undefined'
        ) {
          //console.log(JSON.parse(res.data.choices[0].message.content).max[2])
          //calcul des prix (min, max ...)
          let respleadpricemin1 = JSON.parse(res.data.price_informations.choices[0].message.content)
            .min[0]
          let respleadpricemin2 = JSON.parse(res.data.price_informations.choices[0].message.content)
            .min[1]
          let respleadpricemin3 = JSON.parse(res.data.price_informations.choices[0].message.content)
            .min[2]
          let respleadpricemax1 = JSON.parse(res.data.price_informations.choices[0].message.content)
            .max[0]
          let respleadpricemax2 = JSON.parse(res.data.price_informations.choices[0].message.content)
            .max[1]
          let respleadpricemax3 = JSON.parse(res.data.price_informations.choices[0].message.content)
            .max[2]
          let price_lead_min = ((respleadpricemin1 + respleadpricemax1) / 2) * 0.01
          let price_lead_max = ((respleadpricemin3 + respleadpricemax3) / 2) * 0.01
          let pricemoyenne = (respleadpricemin2 + respleadpricemax2) / 2
          lead_price = pricemoyenne * 0.01

          $(document)
            .find('.price-lead-bloc .input-group-text small')
            .html('&nbsp;(Min:' + price_lead_min + ', Max:' + price_lead_max + ')')
          $(document)
            .find('.price-lead-bloc output')
            .html(
              '<img src="' +
                imgs_parent_dir +
                '/pictos/price.svg" width="20"> ' +
                parseFloat(lead_price.toFixed(2)) +
                ' €'
            )
          $(document).find('.price-lead-bloc input[type="range"]').attr({
            min: price_lead_min,
            max: price_lead_max
          })
          await $(document).find('.price-lead-bloc input[type="range"]').val(lead_price)
          form_create_lead.pricingToSeller = String(lead_price)
          //$(document).find('.price-lead-bloc .price-lead-increased').html( (JSON.parse(res.data.price_informations.choices[0].message.content).min[1]+(JSON.parse(res.data.price_informations.choices[0].message.content).min[1]*0.25))+' €' );
          lead_price_incresead.value =
            parseFloat(lead_price) + parseFloat(lead_price) * 0.25 * 2 + ' €'
          $(document).find('.price-lead-bloc').show()
        }
      })
      .catch(async (err) => {
        await $(document).find('.price-lead-loader').hide()
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger'
        if (typeof err.response != 'undefined') {
          alertParams.value.message =
            err.response.data.error.code + '. ' + err.response.data.error.message
        } else {
          alertParams.value.message =
            'Une erreur est survenue, veuillez ressayer plus tard ou contacter le support technique.'
          console.log(err)
        }

        //alert('nok')
        //console.log(err)
      })
  }
}

function rangePriceLead(event) {
  //console.log(event.target.value);
  lead_price = event.target.value
  lead_price_incresead.value = parseFloat(lead_price) + parseFloat(lead_price) * 0.25 * 2
}

/** submit lead form */
async function submitLead() {
  emit('toogle-page-loading', true) //lancer le loading page
  form_create_lead.pricingToIncrease = String(parseFloat(lead_price_incresead.value))
  form_create_lead.pricingToTpl = String(form_create_lead.pricingToSeller * 0.25)
  //form_create_lead.pricingToSeller = String( parseFloat(lead_price_incresead.value) - (form_create_lead.pricingToSeller * 2))
  form_create_lead.activity = selectedActivity.value.name
  //console.log(form_create_lead)

  //get enterprise infos data
  await enterpriseService
    .getEnterprise(
      accountService.getToken(),
      JSON.parse(accountService.getSessionUser()).enterprise.id
    )
    .then((response) => {
      //console.log(response)
      //console.log(response.data['@id'])
      form_create_lead.enterprise = response.data['@id']
    })
    .catch((err) => {
      console.log(err)
    })

  //send data to api
  await leadService
    .createLead(accountService.getToken(), form_create_lead)
    .then(async (res) => {
      emit('toogle-page-loading', false) //hiding le loading page
      console.log(res)
      if ( (typeof res.data != 'undefined') && (typeof res.data.id != "undefined") ) {
        //alert('ok');
        isAlertShowed.value = true
        alertParams.value.type = 'alert-success text-center'
        alertParams.value.dismissSecs = '4'
        alertParams.value.message = 'Prospect ajouter avec succès'
        alertParams.value.dismissMsg = 'Redirection vers "Mes leads"'

        //reint form
        $(document).find('.price-lead-bloc').hide()
        form_create_lead.firstname = ''
        form_create_lead.name = ''
        form_create_lead.address = ''
        form_create_lead.postalCode = ''
        form_create_lead.city = ''
        form_create_lead.country = 'France'
        form_create_lead.phone = ''
        form_create_lead.email = ''
        form_create_lead.status = ''
        form_create_lead.commentary = ''
        form_create_lead.pricingToSeller = ''
        form_create_lead.pricingToTpl = ''
        form_create_lead.pricingToIncrease = ''
        form_create_lead.minDate = ''
        form_create_lead.maxDate = ''
        form_create_lead.activity = ''
        form_create_lead.enterprise = ''

        //redirection après 5sec
        setTimeout(function () {
          router.push('/account/status-leads#selled')
          //window.location.reload(true)
        }, 4000)
      }
      else if (typeof res.data != 'undefined') {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger text-center'
        alertParams.value.dismissSecs = '4'
        alertParams.value.message = res.data.message
      }
      else{
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger text-center'
        alertParams.value.dismissSecs = '4'
        alertParams.value.message = 'Une erreur est survenue'
      }
    })
    .catch((err) => {
      emit('toogle-page-loading', false) //lancer le loading page
      //alert('nok');
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger'
      if (err.response.data.detail == 'email: phone') {
        alertParams.value.message = 'Information lead existe déjà.'
      } else {
        alertParams.value.message = err.response.data.detail
      }

      console.log(err)
    })

  //console.log(response.data.choices[0].message.content)
}

/** warning changing date change input range */
$(document).on('change', 'input[type="datetime-local"]', function () {
  $(document).find('.price-lead-bloc input[type="range"]').val(lead_price)
})

/** select activity*/
const selectedActivity = ref()
const activityList = ref([
  { name: 'Art', code: 'Art' },
  { name: 'Tunnel', code: 'Tunnel' },
  { name: 'Réseaux', code: 'Réseaux' },
  { name: 'Électricité', code: 'Électricité' },
  { name: 'Maritime', code: 'Maritime' },
  { name: 'Génie Civil', code: 'Génie Civil' },
  { name: 'Démolition', code: 'Démolition' },
  { name: 'Terrassement', code: 'Terrassement' },
  { name: 'Forage', code: 'Forage' },
  { name: 'Plomberie', code: 'Plomberie' },
  { name: 'Thermique', code: 'Thermique' },
  { name: 'Isolation', code: 'Isolation' },
  { name: 'Plâtrerie', code: 'Plâtrerie' },
  { name: 'sol', code: 'sol' },
  { name: 'Menuiserie', code: 'Menuiserie' },
  { name: 'Serrurerie', code: 'Serrurerie' },
  { name: 'Agencement', code: 'Agencement' },
  { name: 'Revêtement', code: 'Revêtement' },
  { name: 'Peinture', code: 'Peinture' },
  { name: 'Charpente', code: 'Charpente' },
  { name: 'Couverture', code: 'Couverture' },
  { name: 'Étanchéité', code: 'Étanchéité' },
  { name: 'Structure', code: 'Structure' },
  { name: 'Maçonnerie', code: 'Maçonnerie' },
  { name: 'Automobile', code: 'Automobile' },
  { name: 'Elagage', code: 'Elagage' },
  { name: 'Paysage', code: 'Paysage' }
])
function selectActivityChange() {
  form_create_lead.activity = selectedActivity.value.name
  priceLead()
}
/** END select activity */

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10', dismissMsg: '' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}

onMounted(async () => {
  emit('toogle-page-loading', false)
})
</script>

<template>
  <div class="container my-5">
    <div class="col-lg-6 offset-lg-3">
      <form @submit.prevent="submitLead" class="d-flex flex-wrap h-100 form-add-lead">
        <h2 class="text-center fw-bolder w-100 mb-4">Ajouter un nouveau prospect</h2>
        <div class="row border-tml p-5">
          <div class="mb-4 col-sm-6 px-1">
            <input
              type="text"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Prénom"
              v-model="form_create_lead.firstname"
              required
            />
          </div>
          <div class="mb-4 col-sm-6 px-1">
            <input
              type="text"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Nom"
              v-model="form_create_lead.name"
              required
            />
          </div>
          <div class="mb-4 col-sm-5 px-1">
            <div class="input-group mb-3">
              <!-- <label class="input-group-text border-tml" style="border-radius: 50rem 0 0 50rem !important">+33</label> -->
              <input
                type="number"
                class="form-control input-troc-my-lead border-tml"
                placeholder="Telephone"
                v-model="form_create_lead.phone"
                required
              />
            </div>
          </div>
          <div class="mb-4 col-sm-7 px-1">
            <input
              type="email"
              class="form-control input-troc-my-lead border-tml"
              placeholder="E-mail"
              v-model="form_create_lead.email"
              required
            />
            <!-- <div class="invalid-feedback">Invalid email address.</div> -->
          </div>
          <div class="mb-4 px-1">
            <input
              type="text"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Adresse"
              v-model="form_create_lead.address"
              required
            />
          </div>
          <div class="mb-4 col-sm-3 px-1">
            <input
              type="text"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Code postal"
              v-model="form_create_lead.postalCode"
              pattern="[0-9]{5}"
              title="Code postal exemple: 75000"
              required
            />
          </div>
          <div class="mb-4 col-sm-5 px-1">
            <input
              type="text"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Ville"
              v-model="form_create_lead.city"
              required
            />
          </div>
          <div class="mb-4 col-sm-4 px-1">
            <input
              type="text"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Country"
              v-model="form_create_lead.country"
              readonly
              required
            />
          </div>
          <div class="mb-4 px-1">
            <label class="form-label fw-bold">Activité</label>
            <Dropdown
              v-model="selectedActivity"
              :options="activityList"
              filter
              optionLabel="name"
              placeholder="Choisir une activité"
              class="w-100 border-tml rounded-2"
              v-on:change="selectActivityChange"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="d-flex flex-row">
                  <!-- <img :src="simplifiedStr(leadItemInfosProps.lead_picto)" class="invert" width="50" /> -->
                  <img
                    :alt="slotProps.value.name"
                    :src="
                      imgs_parent_dir +
                      '/pictos/activity/' +
                      simplifiedStr(slotProps.value.name) +
                      '.svg'
                    "
                    class="me-2"
                    style="width: 18px"
                  />
                  <div>{{ slotProps.value.name }}</div>
                </div>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <div class="d-flex flex-row">
                  <img
                    :alt="slotProps.option.name"
                    :src="
                      imgs_parent_dir +
                      '/pictos/activity/' +
                      simplifiedStr(slotProps.option.name) +
                      '.svg'
                    "
                    class="me-2"
                    style="width: 18px"
                  />
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
          </div>
          <!-- <div class="mb-4 px-1">
            <label class="form-label fw-bold">Activité</label>
            <select
              class="form-select input-troc-my-lead border-tml select-2"
              v-model="form_create_lead.activity"
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
          </div> -->
          <div class="mt-3 mb-4 px-1">
            <textarea
              type="text"
              class="form-control input-troc-my-lead border-tml border-1 lead-commentary-input"
              rows="5"
              style="border-radius: 0.7rem !important"
              placeholder="Description du lead"
              v-model="form_create_lead.commentary"
              v-on:focusout="priceLead"
              required
            ></textarea>
          </div>
          <div class="mb-4 col-sm-6 px-1">
            <label class="form-label fw-bold">Date debut chantier</label>
            <input
              type="datetime-local"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Date debut chantier"
              v-model="form_create_lead.minDate"
              required
            />
          </div>
          <div class="mb-5 col-sm-6 px-1">
            <label class="form-label fw-bold">Max date debut chantier</label>
            <input
              type="datetime-local"
              class="form-control input-troc-my-lead border-tml"
              placeholder="Max date debut chantier"
              v-model="form_create_lead.maxDate"
              required
            />
          </div>
          <div class="price-lead-loader mb-4" style="display: none">
            <div class="loader m-auto"></div>
          </div>
          <div class="mb-4 px-1 price-lead-bloc" style="display: none">
            <div class="input-group mb-3">
              <label class="input-group-text fw-bold">Prix <small></small></label>
              <!-- <input
                type="number"
                class="form-control input-troc-my-lead rounded-pill border-tml"
                placeholder="Prix"
                v-model="form_create_lead.pricingToSeller"
                readonly
              /> -->
              <input
                type="range"
                class="form-range form-control px-1"
                min="0"
                max="5"
                step="0.5"
                v-model="form_create_lead.pricingToSeller"
                @input="rangePriceLead"
                oninput="this.nextElementSibling.value = this.value+' €'"
                style="vertical-align: -webkit-baseline-middle; height: auto"
              />
              <output class="input-group-text text-center d-block" style="width: 10rem"></output>
            </div>
            <small class=""
              >Prix de vente majoré afficher sur l'annonce ( prix lead + frais des services )
              <b class="price-lead-increased"> = {{ lead_price_incresead }} </b></small
            >
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
            class="btn w-50 m-auto btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
          >
            <img src="@/assets/pictos/laisser.svg" class="invert me-2" />
            <b>Ajouter prospect</b>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* .price-lead-bloc .form-range:before{
  content: "0 ";
  vertical-align: sub;
}
.price-lead-bloc .form-range:after{
  content: " 100";
  vertical-align: sub;
} */

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
