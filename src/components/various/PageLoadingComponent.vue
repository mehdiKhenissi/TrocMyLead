<script setup>
import { ref, onUnmounted, onBeforeMount, onMounted } from 'vue'

onMounted(async () => {
  document.body.style.overflow = 'hidden'
  //$(document).find('body').css({"overflow":"hidden"});
})

onUnmounted(() => {
      // Your code to be executed when the component is about to be unmounted
      document.body.style.overflow = 'unset'
    })

</script>

<template>
  <div class="troc-my-lead-spinner-container">
    <!-- <div class="troc-my-lead-spinner"></div> -->
    <img src="@/assets/img/logo.svg" class="troc-my-lead-loading-img" />
  </div>
</template>

<style scoped>
.troc-my-lead-spinner-container {
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: fixed;
  margin: auto;
  right: 0;
  left: 0;
  z-index: 10000;
}

.troc-my-lead-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.troc-my-lead-loading-img {
  /* background: rgba(255, 255, 255, 0.1); */
  animation: sk-rotateplane 2s infinite ease-in-out;
}

@keyframes sk-rotateplane {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
    -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  }

  50% {
    transform: perspective(120px) rotateX(0deg) rotateY(360deg);
    -webkit-transform: perspective(120px) rotateX(0deg) rotateY(360deg);
  }
  
}
</style>
