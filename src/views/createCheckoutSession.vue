<script setup>
import { ref, reactive, inject, onMounted } from 'vue'

// injections
const accountService = inject('accountService')
const paymentService = inject('paymentService')

/** functions from parent */
const emit = defineEmits(['toogle-page-loading'])

// async function redirectToExternalUrl() {
//   const externalUrl = 'http://localhost:8000/api/stripe/payment?canceled=true' // Replace with your external URL
//   const headers = {
//     Authorization:
//       'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MDU1NjQ5ODQsImV4cCI6MTcwNjE2OTc4NCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlkIjoyLCJ1c2VybmFtZSI6Im1laGRpLmtoZW5pc3NpQGhvdG1haWwuZnIifQ.o1sjqfytovr87gnW3jUFFjX8bgvkDh77k1YdmRKe9zcQqyyJEypkeyAL6L7ZV_1n9OHlDjMR3xI0EuQjMe_R_5OzXHRHtRyb6seIuBnfljmDhV2bP3HZtn_b0MhTSdok4yDowqDwi5vpM9OTKE_7KG1D7RkCfu0bOyjRHqPzyck6kdMpN-Zw01H4CDqwQzUPSkrP74E5TWcQlf4D4W2GrttYltgZlznhFtZbLXIkBwMbYhV82TiISoDJ_FZTuAVi6PvYUSx5cGeZzn43UR-zUvSqViGq98ZY_wJf3u0lWICyzlKimTobt8stjXCeFYwg5lsumZe_v0_YKjLhE61tPA'
//   }

//   try {
//     const response = await fetch(externalUrl, { headers })

//     console.log(response)

//     // Check if the response indicates a successful request
//     if (response.ok) {
//       // Optionally process the response, then redirect
//       window.location.href = externalUrl
//     } else {
//       console.error('Failed to fetch external URL:', response.status, response.statusText)
//     }
//   } catch (error) {
//     console.error('Error fetching external URL:', error)
//   }
// }

async function stripeCheckout(){
  
  await paymentService
    .stripeSessionCheckout(accountService.getToken(), {amount:10})
    .then(async (res) => {
      
      if(res.data.code == 200 ){
        console.log(res.data);
      }
      else{
        console.log(res.data);
      }

    })
    .catch((err) => {
      console.log(err)
    })

}

onMounted(async () => {
  //hide page loading
  emit('toogle-page-loading', false)
})
</script>
<template>
  <div>
    <button @click="stripeCheckout">checkout stripe</button>
  </div>
</template>
