<script setup>
import { ref, reactive, onMounted, onUnmounted, inject } from 'vue'
import { simplifiedStr } from '@/assets/js/customFunctions.js'
// inject from app.vue
const accountService = inject('accountService')

const testing = defineProps({
  leadItemInfosProps: Object,
  leadFullInfos: Boolean,
  leadToBuy: Boolean,
  leadsBuyedList: Boolean,
  belongCurrentUser: Boolean,
  leadsSelledList: Boolean
})
 //console.log(testing.leadItemInfosProps)
// console.log(testing.belongCurrentUser)

/** parent functions */
const emit = defineEmits(['displayClaimLeadModal', 'displayLeadDeniedModal', 'ValidateLead', 'displayLeadCheckingModal', 'enableLead', 'disableLead', 'displayUpdateLeadModal'])
</script>

<template>
  <div class="d-flex flex-wrap h-100">
    <div class="row align-items-center w-100 m-0" style="height: fit-content">
      <div
        class="col-lg-2 col-3 activity-picto text-center py-2"
        :class="{
          'bg-green':
            (leadItemInfosProps.lead_status == 'reserved') ||
            ( (leadItemInfosProps.lead_status == 'to_sell') && (!belongCurrentUser) ) ,
          'bg-tml-yellow': leadItemInfosProps.lead_status == 'checking',
          'bg-tml-green': ( (leadItemInfosProps.lead_status == 'valid') || ( (belongCurrentUser) && (leadItemInfosProps.lead_status == 'to_sell') ) ),
          'bg-tml-red': leadItemInfosProps.lead_status == 'denied',
          'bg-secondary': leadItemInfosProps.lead_status == 'disabled'
        }"
      >
        <img :src="simplifiedStr(leadItemInfosProps.lead_picto)" class="invert" width="50" />
      </div>
      <div class="col-lg-10 col-9">
        <h2 class="fw-bold">{{ leadItemInfosProps.lead_activity_title }}</h2>
      </div>
    </div>

    <div class="row align-items-center w-100 m-0 mt-3">
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">Localisation</p>
        <p>Dans le secteur du code postal <b>{{ leadItemInfosProps.lead_localisation }}</b></p>
      </div>
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">Déposant</p>
        <p>Déposé par <b>{{ leadItemInfosProps.lead_enterprise.name }}</b></p>
      </div>
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">Date début des travaux</p>
        <p>A commencer avant le <b>{{ leadItemInfosProps.lead_date_start }}</b></p>
      </div>
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">Date de dépot</p>
        <p>Déposé le <b>{{ leadItemInfosProps.lead_date_depot }}</b></p>
      </div>
    </div>

    <div v-if="leadFullInfos" class="row align-items-center w-100 m-0">
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">Nom</p>
        <p>{{ leadItemInfosProps.lead_name }}</p>
      </div>
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">Téléphone</p>
        <p>{{ leadItemInfosProps.lead_phone }}</p>
      </div>
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">Adresse</p>
        <p>{{ leadItemInfosProps.lead_adress }}</p>
      </div>
      <div class="col-6 text-break">
        <p class="fw-bold m-0 fs-5">E-mail</p>
        <p>{{ leadItemInfosProps.lead_email }}</p>
      </div>
    </div>

    <div class="row align-items-center w-100 m-0">
      <div class="col-12 text-break">
        <p class="fw-bold mb-1 fs-5">Description</p>
        <p>
          {{ leadItemInfosProps.lead_description }}
        </p>
      </div>
    </div>
    <div class="row align-items-center w-100 align-self-end m-0 btn-lead-item-infos-component mt-5">
      <div class="col-12 p-0">
        <a
          v-if="leadToBuy && belongCurrentUser"
          @click="emit('displayUpdateLeadModal')"
        >
          <button
            type="button"
            class="btn btn-default bg-tml-green text-white btn-buy-lead float-end fs-3 fw-bold"
            title=""
          >
            <img src="@/assets/pictos/user.svg" class="invert" width="40" />
            Modifier le prospect
          </button>
        </a>
        <router-link
          v-if="leadToBuy && !belongCurrentUser && !accountService.isAdmin()"
          :to="{ name: 'buyLead', params: { id: encodeURIComponent(leadItemInfosProps.lead_id) } }"
        >
          <button
            type="button"
            class="btn btn-default bg-green text-white btn-buy-lead float-end fs-3 fw-bold"
            title=""
          >
            <img src="@/assets/pictos/cart.svg" class="invert" width="40" />
            Acheter à
            {{ leadItemInfosProps.lead_price }}€
          </button>
        </router-link>
        <a v-if="!leadToBuy && !leadFullInfos">
          <button
            type="button"
            class="btn btn-default bg-green text-white btn-buy-lead float-end fs-3 fw-bold py-1"
            title=""
          >
            <img src="@/assets/pictos/check.svg" class="invert p-0" width="50" />
            Vendu à
            {{ leadItemInfosProps.lead_price }}€
          </button>
        </a>

        <!-- MY LEADS SECTION BTNS -->
        <div class="col-12 d-flex flex-row justify-content-between" v-if="leadsBuyedList && leadItemInfosProps.lead_status == 'reserved'">
          <button
            type="button"
            class="btn bg-tml-red fs-4 text-white m-0 px-5 float-start cursor-pointer"
            @click="emit('displayClaimLeadModal')"
            v-tooltip="'Prospect invalide'"
          >
            <!-- <label class="cursor-pointer" aria-details="to hide on mobile mode">Prospect invalide</label> -->
            <img src="@/assets/pictos/close.svg" class="invert" width="40" />
          </button>
          <button
            type="button"
            class="btn bg-tml-green fs-4 text-white m-0 px-5 float-end cursor-pointer"
            @click="emit('ValidateLead')"
            v-tooltip="'Valider le prospect'"
          >
            <!-- <label class="cursor-pointer" aria-details="to hide on mobile mode">Valider le prospect</label> -->
            <img src="@/assets/pictos/check.svg" class="invert" width="40" />
          </button>
        </div>
        <div class="col-12 d-flex flex-row justify-content-between" v-if="leadsSelledList && leadItemInfosProps.lead_status == 'to_sell'">
          <button
            type="button"
            class="btn bg-tml-red fs-4 text-white m-0 px-5 float-start cursor-pointer"
            @click="emit('disableLead')"
            v-tooltip="'Désactiver le prospect'"
          >
            <!-- <label class="cursor-pointer" aria-details="to hide on mobile mode">Désactiver &nbsp;</label> -->
            <img src="@/assets/pictos/user_off.svg" class="invert" width="30" />
          </button>
          <button
            type="button"
            class="btn bg-green fs-4 text-white m-0 px-5 float-end cursor-pointer"
            @click="emit('displayUpdateLeadModal')"
            v-tooltip="'Modifier le prospect'"
          >
            <!-- <label class="cursor-pointer" aria-details="to hide on mobile mode">Modifier &nbsp;</label> -->
            <img src="@/assets/pictos/edit.svg" class="invert align-text-top" width="30" />
          </button>
        </div>
        <div class="text-center" v-if="leadsSelledList && leadItemInfosProps.lead_status == 'reserved'">
          <div class="row m-0">
            <div class="col-12 color-green fw-bold">
              Prospect réservé, en attente du validation de l'acheteur.
            </div>
          </div>
        </div>
        <div class="" v-if="leadsSelledList && leadItemInfosProps.lead_status == 'disabled'">
          <button
            type="button"
            class="btn bg-secondary fs-4 text-white m-0 px-3 float-end"
            @click="emit('enableLead')"
            v-tooltip="'Activer le prospect'"
          >
            Activer 
            <img src="@/assets/pictos/user.svg" class="invert" width="30" />
          </button>
        </div>
        <div class="" v-if="(leadsBuyedList || leadsSelledList) && leadItemInfosProps.lead_status == 'checking'">
          <button
            type="button"
            class="btn bg-tml-yellow fs-4 text-white m-0 px-3 float-end"
            @click="emit('displayLeadCheckingModal')"
          >
          Prospect en cours de vérification
            <img src="@/assets/pictos/hourglass.svg" class="invert" width="40" />
          </button>
        </div>
        <div class="" v-if="(leadsBuyedList || leadsSelledList) && leadItemInfosProps.lead_status == 'valid'">
          <button
            type="button"
            class="btn bg-tml-green fs-4 text-white m-0 px-3 float-end"
            title="Prospect validé"
          >
          Prospect validé
            ( {{ leadItemInfosProps.lead_price }}€ )
          </button>
        </div>
        <div class="" v-if="(leadsBuyedList || leadsSelledList) && leadItemInfosProps.lead_status == 'denied'">
          <button
            type="button"
            class="btn bg-tml-red fs-4 text-white m-0 px-3 float-end"
            @click="emit('displayLeadDeniedModal')"
            title="Prospect refusé"
          >
            Prospect refusé <h6 v-if="leadItemInfosProps.lead_denied_price != 0">(Frais de service
            {{ leadItemInfosProps.lead_denied_price }}€)</h6>
          </button>
        </div>
        <!-- END MY LEADS SECTION BTNS -->

        <div></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bloc-lead-item-max-infos .activity-picto {
  border-radius: 14px 0;
}

.bloc-lead-item-max-infos .btn-buy-lead {
  border-radius: 14px 0;
}


@media only screen and (max-width: 991px) {
  .btn-lead-item-infos-component button.float-start label, .btn-lead-item-infos-component button.float-end label {
    display: none;
  }
}
@media only screen and (min-width: 991px) {
  .btn-lead-item-infos-component button.float-start {
    border-radius: 0 13px 0 13px;
  }
  .btn-lead-item-infos-component button.float-end {
    border-radius: 13px 0 13px 0;
  }
}
</style>
