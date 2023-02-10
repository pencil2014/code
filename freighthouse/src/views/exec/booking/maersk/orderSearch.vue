<template>
  <div class="so-list-class">
    <soList :carrierCode="'MAEU'" />
  </div>
</template>

<script>
import soList from '../components/soList'
export default {
  data() {
    return {
      dataList: []
    }
  },
  components: {
    soList
  },
  created() {
  }
}
</script>

<style lang="scss" scoped>
</style>