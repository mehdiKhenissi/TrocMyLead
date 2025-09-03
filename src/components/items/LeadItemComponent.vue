<script setup>
const parentDatas = defineProps({
  lead_item_props: Object,
  colorStatusLead:Object
})

//console.log(parentDatas.colorStatusLead)

let color_status_lead = Object.keys(parentDatas.colorStatusLead).filter(function(key) {return parentDatas.colorStatusLead[key]});

//console.log(color_status_lead.join(' '))
</script>

<template>
  <div class="col-md-12 lead-item">
    <div class="row  m-0">
      <div class="col-2 lead-item-domain d-flex align-items-center border-end-0" :class="color_status_lead.join(' ')">
        <slot name="lead-item-picto"></slot>
      </div>
      <div class="col-10 lead-item-min-infos">
        <div class="d-flex align-items-center justify-content-between">
          <slot name="lead-item-heading"></slot>
        </div>
        <div class="d-flex flex-column">
          <slot name="lead-item-content"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.lead-item-domain {
  /*border: 1px solid #707070;
  boder-radius: 15px 0 0 15px;*/
}
.lead-item-min-infos {
  border-left: 1px solid #707070 !important;
  /*border-radius: 0 15px 15px 0;*/
}
</style>
