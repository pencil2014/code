<template>
  <div style="width:100%">
    <component :is="currentComponent"></component>
  </div>
</template>

<script>
import GoodExit from './index.vue'
import GoodImport from './import.vue'
import { mapState } from 'vuex'
export default {
  data() {
    return {}
  },
  computed: {
    ...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo
    }),
    currentComponent() {
      if (this.airOrderInfo.businessType === 'air_export') {
        // 空运出口
        return 'GoodExit'
      } else if (this.airOrderInfo.businessType === 'air_import') {
        // 空运进口
        return 'GoodImport'
      }
    }
  },
  methods: {},
  created() {},
  watch: {},
  mounted() {},
  updated() {},
  components: {
    GoodExit,
    GoodImport
  }
}
</script>

<style>
</style>