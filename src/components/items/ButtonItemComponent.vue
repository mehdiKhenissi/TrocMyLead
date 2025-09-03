<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props_datas = defineProps({
  type_button: {
    type: String as () => "submit" | "button",
    default: 'button'
  },
  picto_button: String,
  text_button: String,
  btn_width: String
})

//let picto = (typeof props_datas.picto_button != "undefined")?(props_datas.picto_button).replaceAll('@', '/src'): ""
onMounted(async () => {
  
})
</script>

<template>
  <button :type="type_button" :class="btn_width" class="btn btn-default btn-green text-white px-4 py-2 rounded-pill btn-troc-my-lead d-flex justify-content-center align-item-center gap-2 px-4">
    <img :src="picto_button" class="invert me-2" />
    <b>{{ text_button }}</b>
  </button>
</template>

<style scoped></style>
