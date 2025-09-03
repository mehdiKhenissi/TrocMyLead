<script setup>
import { ref, onMounted, inject } from 'vue'

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'

// inject accountService to check status of login
const accountService = inject('accountService')

onMounted(async () => {
  emit('toogle-page-loading', false)
})
</script>

<template>
  <div class="px-lg-5 py-5 home-view">
    <div class="col-12 text-center pt-lg-5 pt-3 fw-bold">
      <h1 class="fw-bolder text-green text-nowrap" style="">Votre platforme d'échange</h1>
      <hr class="m-auto bg-dark my-5" style="width: 250px; height: 5px; border: none; opacity: 1" />
    </div>
    <div class="col-12">
      <div class="row m-0">
        <div class="col-lg-6">
          <div class="row h-100 m-0">
            <div class="col-lg-5 text-center">
              <img src="@/assets/img/img_acheter_leads.svg" style="max-width: 100%" />
            </div>
            <div class="col-lg-7 ps-lg-0 pe-lg-5 pt-5 position-relative">
              <h2 class="fw-bold text-green mb-4">Je souhaite acheter un prospect</h2>
              <p class="">
                Vous avez un problème à trouver des clients ?<br />
                TrocMonLead vous offre une plateforme permettant de rechercher un potentiel client
                dans le besoin et auquel vous pouvez répondre. <br />Un solution qui convient
                parfaitement pour les entreprises qui débutent et les baisses d'activités.
              </p>
              <RouterLink to="/list-leads">
                <button
                  type="button"
                  class="btn w-75 fs-5 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
                >
                  <img src="" class="invert me-2" />
                  <b>Lister les prospects</b>
                </button>
              </RouterLink>
            </div>
          </div>
        </div>

        <hr
          class="d-lg-none d-sm-block bg-dark"
          style="width: 250px; height: 5px; border: none; opacity: 1; margin: 7rem auto !important"
        />

        <div class="col-lg-6">
          <div class="row h-100 m-0">
            <div class="col-lg-7 order-lg-1 order-2 ps-lg-5 pe-lg-0 pt-5 position-relative">
              <h2 class="fw-bold text-green mb-4">Je souhaite vendre un prospect</h2>
              <p class="">
                Vous avez un client dont vous ne pouvez pas assumer la prestation ?<br />
                TrocMonLead vous aide en mettant à disposition une plateforme qui vous permettra de
                vendre vos leads que vous ne pouvez satisfaire quelque soit la raison, manque de
                temps, de compétence ou de main-d'œuvre.
              </p>
              <RouterLink v-if="accountService.isLogged()" :to="{ name: 'submitLead' }">
                <button
                  type="button"
                  class="btn w-75 fs-5 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
                >
                  <img src="" class="invert me-2" />
                  <b>Déposer un prospect</b>
                </button>
              </RouterLink>
              <RouterLink v-else :to="{ name: 'connection' }"
                >
                <button
                  type="button"
                  class="btn w-75 fs-5 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
                >
                  <img src="" class="invert me-2" />
                  <b>Déposer un prospect</b>
                </button>
              </RouterLink>
            </div>
            <div class="col-lg-5 order-lg-2 order-1 text-center">
              <img src="@/assets/img/img_vendre_leads.svg" style="max-width: 100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media only screen and (min-width: 768px) {
  .home-view h1 {
    font-size: xxx-large;
  }
}

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (max-width: 992px) {
  .home-view h2 {
    text-align: center;
  }
  .home-view p {
    text-align: center;
    margin-bottom: 4rem !important;
  }
  .btn-troc-my-lead {
    margin: auto;
    right: 0;
    left: 0;
  }
}

.home-view p {
  margin-bottom: 5rem !important;
}

.btn-troc-my-lead {
  position: absolute;
  bottom: 0;
  /*margin: auto;
  right: 0;
  left: 0;*/
}
</style>
