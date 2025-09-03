<script setup>
import { ref, onMounted } from 'vue'

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])


onMounted(async () => {
  //hide page loading
  emit('toogle-page-loading')
})
</script>

<template>
    <div class="container d-flex align-items-center justify-content-center text-white border-tml h-100" style="background-color: rgba(33, 160, 133, 1)">   
        <router-view/>
    </div>
</template>

<style scoped></style>