<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import { addExternalDependecies } from '@/assets/js/addExternalDependecies.js'
import axios from 'axios'

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])
//hide page loading
emit('toogle-page-loading')

const accountService = inject('accountService')
const leadService = inject('leadService')
const customService = inject('customService')

const items = ref([])
const page = ref(1)
const loading = ref(false)

// const loadMore = async () => {
//   if (!loading.value) {
//     loading.value = true
//     console.log('http://localhost:8000/api/leads?page=' + page.value)
//     const response = await axios.get('http://localhost:8000/api/leads?page=' + page.value)
//     setTimeout(() => {
//       items.value = items.value.concat(response.data['hydra:member'])
//       if (typeof response.data['hydra:view']['hydra:next'] !== 'undefined') {
//         page.value++
//         loading.value = false
//       }
//     }, 1000);

//     console.log(loading.value)
//     console.log(response)
//   }
// }

// const handleScroll = () => {
//   if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading.value) {
//     loadMore()
//   }
// }

onMounted(async () => {
  emit('toogle-page-loading', false)

  await leadService
    .updateLead(accountService.getToken(), {
      id: 111,
      pricingToSeller: '3000000',
    })
    .then(async (res) => {
      if (typeof res.data != 'undefined' && typeof res.data.id != 'undefined') {
        alert('ok')
      }
      else{
        alert('erreur')
      }
    })
    .catch(async (err) => {
      alert('erreur')
    })

  /*await customService
    .testApi()
    .then(async (response) => {
      console.log(response)

      

    })
    .catch(async (error) => {
      console.log(error)
      
    })*/

  // window.addEventListener('scroll', handleScroll)
  // loadMore()
  // addExternalDependecies(
  //   '../node_modules/vue-infinite-scroll/vue-infinite-scroll.js',
  //   'javascript',
  //   'head'
  // )
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

console.log(items)
</script>

<!-- InfiniteScroll.vue -->
<template>
  <div class="row mt-5">
    <div class="col-4">
      <ul>
        <li v-for="item in items" :key="item.id" class="py-5">{{ item.name }}</li>
      </ul>
      <div v-if="loading">Loading... <label class="troc-my-lead-spinner"></label></div>
    </div>

    <div class="col-8 border border-5 py-5 position-fixed bg-primary text-white" style="right: 0">
      <br /><br /><br />
      OKKKeyyey<br />
      OKKKeyyey<br />
      OKKKeyyey<br />
      OKKKeyyey<br />
      OKKKeyyey<br />
      OKKKeyyey<br />
      OKKKeyyey<br />
      <br /><br /><br />
    </div>
  </div>
</template>

<style scoped>
/* Add your styles for the focus block and other elements here */

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
</style>
