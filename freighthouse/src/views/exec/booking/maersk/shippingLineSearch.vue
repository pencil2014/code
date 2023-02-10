<template>
  <div class="maersk-class">
    <div class="title">MASKER</div>
    <shippingLine :carrierCode="'MAEU'"/>
  </div>
</template>

<script>
import shippingLine from '../components/shippingLine'
export default {
   components: {
     shippingLine
   }
}
</script>

<style lang="scss" scoped>
.maersk-class {
  background-color: #fff;
  margin: 20px 20px 50px;
  padding: 10px 20px;
  .title {
    color: #000;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 3px;
    padding: 10px;
    border-bottom: 1px solid #cfcfcf;
  }
}
</style>