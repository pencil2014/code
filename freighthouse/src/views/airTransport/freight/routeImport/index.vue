<template>
  <div class="air-routeImport">
    <div class="components-container">
      <component :is="'AirType'"></component>
    </div>
  </div>
</template>

<script>
import AirType from './airType'
export default {
  components: { AirType },
  name: 'AirRouteImport',
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.air-routeImport {
  padding: 10px;
  .components-container {
    padding: 10px;
    background-color: #fff;
    position: relative;
  }
  .el-table thead {
    color: #000000;
  }
}
</style>