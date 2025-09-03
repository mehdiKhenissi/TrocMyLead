<script setup>
import { ref, onMounted, onBeforeMount, inject } from 'vue'
import router from '@/router'
import UserInfosComponent from '@/components/account/UserInfosComponent.vue'
import EnterpriseInfosComponent from '@/components/account/EnterpriseInfosComponent.vue'
import ListUsersInfosComponent from '@/components/account/ListUsersInfosComponent.vue'
import ButtonItemComponent from '@/components/items/ButtonItemComponent.vue'

// inject accountService to check status of login
const accountService = inject('accountService')
const userService = inject('userService')
const enterpriseService = inject('enterpriseService')

/** functions from parent */
const emit = defineEmits(['toogle-page-loading', 'is-logged-in'])

// get current user information from local storage
let current_user_infos = JSON.parse(accountService.getSessionUser())

const userFirstName = ref(current_user_infos.firstname)
const userName = ref(current_user_infos.name)
const enterpriseName = ref(
  current_user_infos.enterprise != null ? current_user_infos.enterprise.name : null
)

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

/** bloc enterprise infos inputs */
function toggleEnterpriseInfosComponent() {
  if (isActiveEnterpriseInfosComponent.value) {
    isActiveEnterpriseInfosComponent.value = false
  } else {
    isActiveUserInfosComponent.value = false
    isActiveListUsersInfosComponent.value = false
    isActiveEnterpriseInfosComponent.value = true
  }
}

/** bloc list users infos */
const list_users_infos = ref(null)
async function toggleListUsersInfosComponent() {
  if (isActiveListUsersInfosComponent.value) {
    isActiveListUsersInfosComponent.value = false
  } else {
    await emit('toogle-page-loading', true)
    /** get list users infos */
    await userService
      .getAllUsers(accountService.getToken())
      .then(async (res) => {
        //console.log(res)
        if (typeof res.data != 'undefined' && typeof res.data['hydra:member']) {
          //list_users_infos.value = res.data['hydra:member']
          list_users_infos.value = res.data['hydra:member'].filter(
            (obj) => obj.id != JSON.parse(accountService.getSessionUser()).id
          )

          isActiveUserInfosComponent.value = false
          isActiveEnterpriseInfosComponent.value = false
          isActiveListUsersInfosComponent.value = true
          await emit('toogle-page-loading', false)
        }
      })
      .catch(async (err) => {
        console.log(err)
        alert(
          "Une erreur c'est produite lors de la recuperation de la liste utilisateurs. Veuillez ressayer plus tard ou contacter le support technique"
        )
        await emit('toogle-page-loading', false)
      })
  }
}

// get enterprise infos
const current_user_enterprise_infos = ref(null)

/** refresh user name */
function refreshUserInfos(userInfosRefreshed) {
  console.log(userInfosRefreshed)
  userFirstName.value = userInfosRefreshed.firstname
  userName.value = userInfosRefreshed.name
}

/** refresh enterprise name */
function refreshEnterpriseInfos(enterpriseInfosRefreshed) {
  console.log(enterpriseInfosRefreshed)
  enterpriseName.value = enterpriseInfosRefreshed.name
  current_user_enterprise_infos.value = enterpriseInfosRefreshed
}

/** LOGOUT */
async function logout() {
  if (accountService.logout()) {
    await emit('is-logged-in', false)
    router.push('/connection')
  }
}

router.beforeResolve((to, from, next) => {
  //console.log(from)
  //console.log(to)
  next()
})

onMounted(async () => {
  //check if user looged is admin
  if (accountService.isLogged()) {
    if (current_user_infos.roles.includes('ROLE_ADMIN')) {
      router.push('/admin')
    }
  }

  //
  if (current_user_infos.enterprise != null) {
    await enterpriseService
      .getEnterprise(accountService.getToken(), current_user_infos.enterprise.id)
      .then(async (res) => {
        if (res.data) {
          current_user_enterprise_infos.value = res.data
        } else {
          console.log('erreur')
        }
      })
      .catch((err) => console.log(err))
  }

  //console.log(current_user_infos);

  //hide page loading
  await emit('toogle-page-loading', false)
})
</script>

<template>
  <div class="container">
    <div
      v-if="
        !isActiveUserInfosComponent &&
        !isActiveEnterpriseInfosComponent &&
        !isActiveListUsersInfosComponent
      "
      class="row my-5"
    >
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
            <img src="@/assets/pictos/group.svg" class="w-50" />
          </div>
          <div class="col-lg-9 text-uppercase d-flex align-items-center text-center">
            <h2 class="fw-bold mx-lg-0 mx-auto">Mes Prospects</h2>
          </div>
          <div class="col-lg-1 d-flex align-items-center justify-content-center text-nowrap">
            <RouterLink
              v-if="accountService.isLogged()"
              :to="{ name: 'statusLead' }"
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
            <img src="@/assets/pictos/supervised_user.svg" class="w-50" />
          </div>
          <div class="col-lg-9 text-uppercase d-flex align-items-center text-center">
            <h2 class="fw-bold mx-lg-0 mx-auto">Liste des utilisateurs</h2>
          </div>
          <div class="col-lg-1 d-flex align-items-center justify-content-center text-nowrap">
            <a
              href="#"
              class="fw-bold color-green text-decoration-none cursor-pointer"
              @click="toggleListUsersInfosComponent()"
              >Gérer &nbsp;<i class="pi pi-cog fs-5">&nbsp;</i></a
            >
          </div>
        </div>
      </div>
      <div class="col-lg-8 offset-lg-2 py-3" v-if="current_user_infos.enterprise">
        <div class="row border-tml p-4 m-0">
          <div class="col-lg-2 text-center">
            <img src="@/assets/pictos/office.svg" class="w-50" />
          </div>
          <div class="col-lg-9 text-uppercase d-flex align-items-center text-center">
            <h2 class="fw-bold mx-lg-0 mx-auto text-wrap">
              <!-- {{ current_user_infos.enterprise.name }} -->
              Entreprise: {{ enterpriseName }}
            </h2>
          </div>
          <div class="col-lg-1 d-flex align-items-center justify-content-center text-nowrap">
            <a
              class="fw-bold color-green text-decoration-none"
              :class="{
                'cursor-pointer': current_user_enterprise_infos,
                'cursor-not-allowed': !current_user_enterprise_infos
              }"
              @click="current_user_enterprise_infos ? toggleEnterpriseInfosComponent() : null"
              >Modifier &nbsp;<i class="pi pi-pencil fs-5">&nbsp;</i>
            </a>
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

    <!-- Enterprise infos -->
    <EnterpriseInfosComponent
      v-if="isActiveEnterpriseInfosComponent"
      @toggle-enterprise-infos-component="toggleEnterpriseInfosComponent"
      @refresh-enterprise-infos="refreshEnterpriseInfos"
      :parent-emit-function="emit"
      :enterprise-infos-datas="{
        id: current_user_enterprise_infos.id,
        name: current_user_enterprise_infos.name,
        siren: current_user_enterprise_infos.siren,
        address: current_user_enterprise_infos.address,
        postalCode: current_user_enterprise_infos.postalCode,
        city: current_user_enterprise_infos.city,
        country: current_user_enterprise_infos.country
      }"
    />

    <!-- List users infos -->
    <ListUsersInfosComponent
      v-if="isActiveListUsersInfosComponent"
      @toggle-list-users-infos-component="toggleListUsersInfosComponent"
      :list-users-infos-datas="list_users_infos"
    />
  </div>
</template>

<style scoped></style>
