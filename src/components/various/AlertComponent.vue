<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/** function emit */
const emit = defineEmits(['toggle-alert'])

/** COMPONENT PROPS */
let componentProps = defineProps({
  alertParams: Object
})

/** countdown function */
let timer = ref(
  typeof componentProps.alertParams.dismissSecs != 'undefined'
    ? componentProps.alertParams.dismissSecs
    : 5
)
let interval = setInterval(() => {
  if (timer.value === 0) {
    clearInterval(interval)
  } else {
    timer.value--
    //console.log(timer.value)
  }
}, 1000)

/** SHOW/HIDE ALERT */
const alertShowed = ref(false)
function showAlert() {
  let dismissIn = timer.value
  //alertShowed.value = true
  location.href = '#tml-alert'
  // setTimeout(() => {
  //     alertShowed.value = false;
  //     emit('toggle-alert', false);
  // }, dismissIn+'000');
}

function dissmissAlert() {
  alertShowed.value = false
  emit('toggle-alert', false)
}

onMounted(() => {
  showAlert()
  /*console.log(componentProps.alertParams);
    console.log(componentProps.alertParams.dismissMsg);*/

  /*setTimeout(() => {
    dissmissAlert()
  }, 90000)*/

})

onUnmounted(() => {})
</script>

<template>
  <div id="tml-alert" class="w-100 pb-4">
    <div
      class="alert border-tml position-relative py-4 px-5"
      :class="componentProps.alertParams.additionalClasses"
    >
      <button
        type="button"
        class="btn btn-danger btn-sm position-absolute fs-5"
        @click="dissmissAlert"
        style="right: -1px; top: -1px"
      >
        X
      </button>
      <p class="fw-bold mb-1" v-html="alertParams.message"></p>
      <small v-if="alertParams.dismissMsg">
        {{ alertParams.dismissMsg }} après {{ timer }} seconds...</small
      >
    </div>
    <!-- <button @click="showAlert(5)" variant="info" class="m-1">
      Show alert with count-down timer
    </button> -->
  </div>
</template>

<style scoped></style>
