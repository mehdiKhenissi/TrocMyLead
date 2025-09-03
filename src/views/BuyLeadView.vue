<script setup>
import { ref, reactive, onMounted, onBeforeMount, inject } from 'vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import AlertComponent from '@/components/various/AlertComponent.vue'
import ModalConnectionComponent from '@/components/items/modalConnectionComponent.vue'

// injections
const accountService = inject('accountService')
const leadService = inject('leadService')
const stripeService = inject('stripeService')
const userService = inject('userService')
const enterpriseService = inject('enterpriseService')

// user connected
const current_user_infos = JSON.parse(accountService.getSessionUser())
//console.log(current_user_infos)

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

const route = useRoute()
//get params
const leadToBuyID = route.params.id
const lead_to_buy_infos = ref(null)

async function buyLead() {
  if (accountService.isLogged()) {
    const current_domain = window.location.href.replaceAll(route.fullPath, '')
    let enterprise_infos = null
    let stripe_custom_id = null
    emit('toogle-page-loading', true)

    /** check if user have already stripe customer id if not create new stripe customer with current user informations */
    await userService
      .getUser(accountService.getToken(), JSON.parse(accountService.getSessionUser()).id)
      .then(async (res) => {
        //console.log(res)
        if (typeof res.data != 'undefined') {
          if (typeof res.data.stripe_customer_id != 'undefined') {
            stripe_custom_id = res.data.stripe_customer_id
          } else {
            /** enterprise informations */
            await enterpriseService
              .getEnterprise(accountService.getToken(), res.data.enterprise.id)
              .then(async (res) => {
                //console.log(res)
                if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
                  enterprise_infos = res.data
                }
              })
              .catch((err) => {
                //console.log(res)
              })

            /** create stripe user */
            await stripeService
              .stripeCreateCustomer(accountService.getToken(), {
                postal_code: enterprise_infos.postalCode,
                address: enterprise_infos.address,
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone,
                country: enterprise_infos.country,
                city: enterprise_infos.city,
                description: "Employee de l'entreprise " + enterprise_infos.name
              })
              .then(async (res) => {
                if (
                  typeof res.data != 'undefined' &&
                  typeof res.data.stripe_customer_id != 'undefined'
                ) {
                  stripe_custom_id = res.data.stripe_customer_id

                  /** insert stripe customer id in table user */
                  await userService
                    .updateUser(accountService.getToken(), {
                      id: JSON.parse(accountService.getSessionUser()).id,
                      stripeCustomerId: stripe_custom_id
                    })
                    .then(async (res) => {
                      //console.log(res)
                    })
                    .catch(async (err) => {
                      //console.log(err)
                    })
                }
              })
              .catch((err) => {})
          }
        }
      })
      .catch(async (err) => {
        //console.log(err)
      })

    /* stripe payment */
    let session_checkout_data = {
      lead_id: leadToBuyID,
      amount: lead_to_buy_infos.value.pricingToIncrease,
      success_url: current_domain + '/success-payment',
      cancel_url: window.location.href,
      customer_id: stripe_custom_id
    }
    //console.log(session_checkout_data)

    await stripeService
      .stripeSessionCheckout(accountService.getToken(), session_checkout_data)
      .then(async (res) => {
        if (res.data.code == 200) {
          //console.log(res.data)
          window.location.href = res.data.checkout_url
        } else {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-danger col-lg-8 offset-lg-2'
          alertParams.value.message =
            'Erreur redirection vers page payement, veuillez ressayer ultérieurement ou contacter le service technique'
        }
      })
      .catch((err) => {
        //console.log(err)
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger col-lg-8 offset-lg-2'
        alertParams.value.message =
          'Erreur redirection vers page payement, veuillez ressayer ultérieurement ou contacter le service technique'
      })

    emit('toogle-page-loading', false)
  } else {
    if (confirm("Vous devriez s'authentifier pour pouvoir poursuivre l'achat.")) {
      location.reload()
    }
  }
}

/** accept CG for payment */
$(document).on('click', '.checkbox-accept-buy-lead-conditions', function () {
  let $this = $(this)
  if ($this.is(':checked')) {
    $(document).find('.btn-buy-lead').removeClass('disabled')
  } else {
    $(document).find('.btn-buy-lead').addClass('disabled')
  }
})

/** ALERT */
const isAlertShowed = ref(false)
const alertParams = ref({ type: '', message: '', dismissSecs: '10' })
function toggleAlert(displayed) {
  isAlertShowed.value = displayed
}
/** END ALERT */

const show_connection_modal = ref(false)
onBeforeMount(async () => {
  /** check if user connected before payment */
  if (!accountService.isLogged()) {
    //alert('not connected')
    show_connection_modal.value = true
  }

  /** lead to buy */
  await leadService
    .getLead(leadToBuyID)
    .then(async (res) => {
      console.log(res)
      if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
        lead_to_buy_infos.value = res.data
        //console.log(lead_to_buy_infos.value)
        isAlertShowed.value = false
        if (res.data.status == 'reserved') {
          isAlertShowed.value = true
          alertParams.value.type = 'alert-warning col-lg-8 offset-lg-2 text-center'
          alertParams.value.message = 'Ce lead est déjà réservé'
        }

        if (
          res.data != null &&
          current_user_infos &&
          res.data.enterprise.id == current_user_infos.enterprise.id
        ) {
          if (confirm('Vous possédez ce prospect. Continuer vers la section "mes leads" ?')) {
            router.push('/account/status-leads#selled')
          } else {
            router.push('/list-leads')
          }
        }

      } else {
        isAlertShowed.value = true
        alertParams.value.type = 'alert-danger col-lg-8 offset-lg-2'
        alertParams.value.message =
          'Erreur récupération informations pour payement, veuillez ressayer ultérieurement ou contacter le service technique'
      }
    })
    .catch((err) => {
      //console.log(err)
      isAlertShowed.value = true
      alertParams.value.type = 'alert-danger col-lg-8 offset-lg-2'
      alertParams.value.message =
        'Erreur récupération informations pour payement, veuillez ressayer ultérieurement ou contacter le service technique'
    })

  //hide page loading
  emit('toogle-page-loading', false)
})

onMounted(async () => {
  //hide page loading
  //emit('toogle-page-loading', false)
  //check if lead is not user possesion

  // if (
  //   lead_to_buy_infos.value != null &&
  //   current_user_infos &&
  //   lead_to_buy_infos.value.enterprise.id == current_user_infos.enterprise.id
  // ) {
  //   if (confirm('Vous possédez ce prospect. Continuer vers la section "mes leads" ?')) {
  //     router.push('/account/status-leads')
  //   } else {
  //     router.push('/list-leads')
  //   }
  // }
})
</script>

<template>
  <div
    class="container py-5"
  >
    <h1 class="fw-bolder fs-xxxl pb-4">Achat du lead</h1>

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

    <div class="col-lg-8 offset-lg-2 buy-lead-bloc border-tml">
      <div class="row w-100 m-0" style="height: fit-content">
        <div
          class="col-lg-2 col-3 bg-green buy-picto d-flex align-items-center justify-content-center py-2 p-0"
        >
          <img src="@/assets/pictos/cart.svg" class="invert" width="50" />
        </div>
        <div class="col-lg-10 col-9">
          <p class="fs-1 fw-bolder m-0" v-if="lead_to_buy_infos.status == 'to_sell'">
            Confirmation d'achat
          </p>
          <p class="fs-1 fw-bolder m-0" v-else>Prospect réservé</p>
        </div>
      </div>

      <div class="row m-0">
        <div class="col-lg-8 offset-lg-2 py-3">
          <h3 class="m-0">Informations primaires</h3>

          <div class="ps-2">
            <p class="fs-4 m-0">Activité</p>
            <p class="fs-5 ps-3 text-secondary">{{ lead_to_buy_infos.activity }}</p>
          </div>

          <div class="ps-2">
            <p class="fs-4 m-0">Localisation</p>
            <p class="fs-5 ps-3 text-secondary">
              Dans le secteur du code postal {{ lead_to_buy_infos.postalCode }}
            </p>
          </div>

          <div class="ps-2">
            <p class="fs-4 m-0">Vendeur</p>
            <p class="fs-5 ps-3 text-secondary">Par {{ lead_to_buy_infos.enterprise.name }}</p>
          </div>

          <div class="d-flex flex-row align-items-center mb-3">
            <p class="fs-4 text-nowrap fw-bold ps-2 w-auto">Montant TTC</p>
            <p class="ponctuation-price w-100 h-100">&nbsp;</p>
            <p class="fs-4 fw-bold w-auto text-nowrap">
              {{ lead_to_buy_infos.pricingToIncrease }}€
            </p>
          </div>

          <div class="d-flex flex-row align-items-center">
            <p class="m-0 fw-bold" v-if="lead_to_buy_infos.status == 'to_sell'">
              <input
                type="checkbox"
                class="form-check-input mt-0 border border-secondary border-2 checkbox-accept-buy-lead-conditions"
                style="width: 25px; height: 25px"
              />
              Je renonce à mon droit de rétractation de 14 jours et que tout lead acheté est
              considéré comme consommé.
            </p>
            <!-- <p class="fs-5 w-100 m-0 ps-2">
              Je renonce à mon droit de rétractation de 14 jours et que tout lead acheté est
              considéré comme consommé.
            </p> -->
          </div>
        </div>
      </div>

      <div class="row align-items-center w-100 align-self-end m-0">
        <div class="d-flex justify-content-end p-0">
          <button
            type="button"
            class="btn btn-default bg-green text-white btn-buy-lead float-end fs-2 fw-bold px-5 disabled"
            @click="buyLead"
            v-if="lead_to_buy_infos.status == 'to_sell'"
          >
            <img src="@/assets/pictos/cart.svg" class="invert" width="40" /> Payer
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- MODAL CONNECTION
       COMPONENT -->
  <!-- Modal -->
  <ModalConnectionComponent v-if="show_connection_modal" />
</template>

<style>
.buy-lead-bloc .buy-picto {
  border-radius: 14px 0;
}

.buy-lead-bloc .ponctuation-price {
  border-bottom: 3px dotted black;
}

@media only screen and (max-width: 991px) {
  .buy-lead-bloc .btn-buy-lead {
    border-radius: 0 0 14px 14px;
    width: 100%;
  }

  .fs-xxxl {
    text-align: center;
  }
}
@media only screen and (min-width: 991px) {
  .buy-lead-bloc .btn-buy-lead {
    border-radius: 14px 0;
  }
  .fs-xxxl {
    text-align: center;
  }
}
</style>
