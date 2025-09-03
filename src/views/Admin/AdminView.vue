<script setup>
import { ref, onMounted, onBeforeMount, inject } from 'vue'
import router from '@/router'
import UserInfosComponent from '@/components/account/UserInfosComponent.vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'
import Password from 'primevue/password'

// inject accountService to check status of login
const accountService = inject('accountService')
const userService = inject('userService')

/** functions from parent */
const emit = defineEmits(['toogle-page-loading', 'is-logged-in'])

// get current user information from local storage
let current_user_infos = JSON.parse(accountService.getSessionUser())

const userFirstName = ref(current_user_infos.firstname)
const userName = ref(current_user_infos.name)

const isActiveUserInfosComponent = ref(false)
const isActiveEnterpriseInfosComponent = ref(false)
const isActiveListUsersInfosComponent = ref(false)

/** bloc user infos inputs */
function toggleUserInfosComponent() {
  if (isActiveUserInfosComponent.value) {
    isActiveUserInfosComponent.value = false
  } else {
    isActiveEnterpriseInfosComponent.value = false
    isActiveListUsersInfosComponent.value = false
    isActiveUserInfosComponent.value = true
  }
}

/** refresh user name */
function refreshUserInfos(userInfosRefreshed) {
  console.log(userInfosRefreshed)
  userFirstName.value = userInfosRefreshed.firstname
  userName.value = userInfosRefreshed.name
  current_user_infos = JSON.parse(accountService.getSessionUser())
}

/** LOGOUT */
async function logout() {
  if (accountService.logout()) {
    await emit('is-logged-in', false)
    router.push('/connection')
  }
}

onBeforeMount(async () => {})

onMounted(async () => {
  //hide page loading
  await emit('toogle-page-loading', false)
})
</script>

<template>
  <div class="container">
    <!-- <Password v-model="value" /> -->

    <div v-if="!isActiveUserInfosComponent" class="row my-5">
      <div class="col-lg-8 offset-lg-2 py-3">
        <div class="row border-tml p-4 m-0">
          <div class="col-lg-2 text-center">
            <img src="@/assets/pictos/user.svg" class="w-50" />
          </div>
          <div class="col-lg-9 text-uppercase d-flex align-items-center text-center">
            <h2 class="fw-bold mx-lg-0 mx-auto" v-if="current_user_infos">
              {{ userFirstName }} {{ userName }}
            </h2>
          </div>
          <div class="col-lg-1 d-flex align-items-center justify-content-center text-nowrap">
            <a
              class="fw-bold color-green text-decoration-none cursor-pointer"
              @click="toggleUserInfosComponent"
              >Modifier &nbsp;<i class="pi pi-pencil fs-5">&nbsp;</i></a
            >
          </div>
        </div>
      </div>
      <div class="col-lg-8 offset-lg-2 py-3">
        <div class="row border-tml p-4 m-0">
          <div class="col-lg-2 text-center">
            <img src="@/assets/pictos/gavel.svg" class="w-50" />
          </div>
          <div class="col-lg-9 text-uppercase d-flex align-items-center text-center">
            <h2 class="fw-bold mx-lg-0 mx-auto">Liste des litiges</h2>
          </div>
          <div class="col-lg-1 d-flex align-items-center justify-content-center text-nowrap">
            <RouterLink
              v-if="accountService.isLogged()"
              :to="{ name: 'adminLeadsLitiges' }"
              class="text-decoration-none"
            >
              <a href="#" class="fw-bold color-green text-decoration-none cursor-pointer"
                >Consulter &nbsp;<i class="pi pi-eye fs-5">&nbsp;</i></a
              >
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="col-lg-8 offset-lg-2 py-3">
        <div class="row border-tml p-4 m-0">
          <div class="col-lg-2 text-center">
            <img src="@/assets/pictos/corporate.svg" class="w-50" />
          </div>
          <div class="col-lg-9 text-uppercase d-flex align-items-center text-center">
            <h2 class="fw-bold mx-lg-0 mx-auto">Liste des entreprises</h2>
          </div>
          <div class="col-lg-1 d-flex align-items-center justify-content-center text-nowrap">
            <RouterLink
              v-if="accountService.isLogged()"
              :to="{ name: 'adminEnterprises' }"
              class="text-decoration-none"
            >
              <a href="#" class="fw-bold color-green text-decoration-none cursor-pointer"
                >Consulter &nbsp;<i class="pi pi-eye fs-5">&nbsp;</i></a
              >
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="col-lg-8 offset-lg-2 py-3">
        <div class="row border-tml p-4 m-0">
          <div class="col-lg-2 text-center">
            <img src="@/assets/pictos/group.svg" class="w-50" />
          </div>
          <div class="col-lg-9 text-uppercase d-flex align-items-center text-center">
            <h2 class="fw-bold mx-lg-0 mx-auto">Liste des utilisateurs</h2>
          </div>
          <div class="col-lg-1 d-flex align-items-center justify-content-center text-nowrap">
            <RouterLink
              v-if="accountService.isLogged()"
              :to="{ name: 'adminUsers' }"
              class="text-decoration-none"
            >
              <a href="#" class="fw-bold color-green text-decoration-none cursor-pointer"
                >Consulter &nbsp;<i class="pi pi-eye fs-5">&nbsp;</i></a
              >
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="col-lg-4 offset-lg-4 mt-5">
        <button
          type="button"
          class="btn w-100 my-4 ps-0 bg-red btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead"
          @click="logout"
        >
          <img src="@/assets/pictos/logout.svg" class="invert me-2" />
          <b>Déconnexion</b>
        </button>
      </div>
    </div>

    <!-- User Infos -->
    <UserInfosComponent
      v-if="isActiveUserInfosComponent"
      @toggle-user-infos-component="toggleUserInfosComponent"
      @refresh-user-infos="refreshUserInfos"
      :parent-emit-function="emit"
      :user-infos-datas="{
        id: current_user_infos.id,
        firstname: current_user_infos.firstname,
        name: current_user_infos.name,
        email: current_user_infos.email,
        phone: current_user_infos.phone,
        password: ''
      }"
    />
  </div>
</template>

<style scoped></style>
