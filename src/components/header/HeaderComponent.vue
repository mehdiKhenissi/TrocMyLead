<script setup>
import { inject } from 'vue'
import HeaderSearchBar from '@/components/header/HeaderSearchBarComponent.vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'

// inject accountService to check status of login
const accountService = inject('accountService')
const user_infos = JSON.parse(accountService.getSessionUser())

//console.log('logged:' + accountService.isLogged())
</script>

<template>
  <header class="w-100">
    <nav class="navbar navbar-expand-xl navbar-light row m-0 justify-content-evenly">
      <a class="navbar-brand col-2 col-sm-2 text-center m-0 p-0" href="/"
        ><img alt="Vue logo" class="logo w-sm-100" src="@/assets/img/logo.svg" width="" height=""
      /></a>
      <div class="col-8 col-sm-8 d-xl-none">
        <HeaderSearchBar />
      </div>
      <button
        class="navbar-toggler bg-white col-2 col-sm-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse col-lg-10" id="navbarSupportedContent">
        <div class="row w-100 text-center m-auto">
          <!-- Deposer lead -->
          <div class="col-lg-2 m-auto">
            <RouterLink v-if="accountService.isLogged()" :to="{ name: 'submitLead' }">
              <button
                type="button"
                class="btn w-100 my-4 btn-default btn-green text-white px-3 py-2 rounded-pill btn-troc-my-lead d-flex justify-content-center align-items-center gap-2"
              >
                <img src="@/assets/pictos/laisser.svg" class="invert me-2" />
                <b>Déposer un prospect</b>
              </button>
            </RouterLink>

            <RouterLink v-else :to="{ name: 'connection' }"
              >
              <button
                type="button"
                class="btn w-100 my-4 btn-default btn-green text-white px-3 py-2 rounded-pill btn-troc-my-lead d-flex justify-content-center align-items-center gap-2"
              >
                <img src="@/assets/pictos/laisser.svg" class="invert me-2" />
                <b class="text-start">Déposer un prospect</b>
              </button>
            </RouterLink>
          </div>

          <!-- Search Bar -->
          <div class="col-lg-6 d-none d-lg-block m-auto">
            <HeaderSearchBar />
          </div>

          <!-- Inscription / Mes leads -->
          <div
            class="col-lg-2 m-auto"
            v-if="
              (accountService.isLogged() && !accountService.isAdmin()) || !accountService.isLogged()
            "
          >
            <RouterLink
              v-if="accountService.isLogged() && !accountService.isAdmin()"
              :to="{ name: 'statusLead' }"
            >
              <!-- <ButtonItemComponent
                picto_button="@/assets/pictos/group.svg"
                text_button="Mes leads"
                class="w-100"
              /> -->
              <button
                type="button"
                class="btn btn-primary w-100 rounded-pill px-4 py-2 bg-white color-green fw-bold border-success border-2"
              >
                <img src="@/assets/pictos/group-green.svg" class="me-2" />
                Mes prospects
              </button>
            </RouterLink>

            <RouterLink v-else-if="!accountService.isLogged()" :to="{ name: 'connection' }"
              >
              <button
                type="button"
                class="btn w-100 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
              >
                <img src="@/assets/pictos/user.svg" class="invert me-2" />
                <b>Inscription</b>
              </button>
            </RouterLink>
          </div>

          <!-- Connection / Profile -->
          <div class="col-lg-2 m-auto">
            <RouterLink v-if="accountService.isLogged()" :to="{ name: 'accountDashboard' }"
              >
              <button
                type="button"
                class="btn w-100 my-4 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
              >
                <img src="@/assets/pictos/user.svg" class="invert me-2" />
                <b>Mon compte</b>
              </button>
            </RouterLink>

            <RouterLink v-else :to="{ name: 'connection' }"
              >
              <button
                type="button"
                class="btn w-100 my-4 btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
              >
                <img src="@/assets/pictos/user.svg" class="invert me-2" />
                <b>Connexion</b>
              </button>
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style></style>
