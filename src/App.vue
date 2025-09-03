<script setup>
import { RouterLink, RouterView } from 'vue-router'
import {addExternalDependecies} from '@/assets/js/addExternalDependecies.js';
import HeaderComponent from "@/components/header/HeaderComponent.vue";
import FooterComponent from "@/components/footer/FooterComponent.vue";
import PageLoadingComponent from '@/components/various/PageLoadingComponent.vue'
import { ref, onMounted, provide } from 'vue';
import { accountService, userService, leadService, enterpriseService, sellService, stripeService, litigeService, customService, litigeStepService } from '@/_services'

// provide to child component 
// provide([
//   'accountService'=>accountService, 
//   'userService'=> userService, 
//   'leadService'=> leadService,
//   'enterpriseService'=> enterpriseService
// ]);
provide('accountService', accountService);
provide('userService', userService);
provide('leadService', leadService);
provide('enterpriseService', enterpriseService);
provide('sellService', sellService);
provide('stripeService', stripeService);
provide('litigeService', litigeService);
provide('customService', customService);
provide('litigeStepService', litigeStepService);

/** is logged in ( to refresh header to change button values)*/
const logged_in = ref(false);
let logged_in_increment = ref(0);
function isLoggedIn(status=null){
  logged_in.value = status;
  logged_in_increment.value++;
  console.log(logged_in_increment.value);
}

/** loading page showed */
const page_loading_showed = ref(true);
function tooglePageLoading(status=null){
  if(status != null){
    page_loading_showed.value= status;
  }
  else if(page_loading_showed.value){
    page_loading_showed.value= false;
  }
  else{
    page_loading_showed.value= true;
  }
}
provide('tooglePageLoading', tooglePageLoading);

onMounted(() => {
  addExternalDependecies('/node_modules/font-awesome/css/font-awesome.min.css', 'css', 'head');
  addExternalDependecies("https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css", 'css', 'head');
  addExternalDependecies("/src/assets/css/main.css", 'css', 'head'); 
  addExternalDependecies("https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js", 'javascript', 'footer');
  addExternalDependecies("https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js", 'javascript', 'footer');
});
</script>

<template>
  <PageLoadingComponent v-if="page_loading_showed"/>

  <!-- <HelloWorld msg="bonjour" /> -->
  <HeaderComponent :key="logged_in_increment"/>

  <main class="container-fluid">
    <RouterView @toogle-page-loading='tooglePageLoading' @is-logged-in="isLoggedIn"/>
  </main>
  
  <FooterComponent />
</template>

<style scoped>
/* @import '~/font-awesome/css/font-awesome.min.css'; */
/* @import '~font-awesome/css/font-awesome.css'; */
</style>
