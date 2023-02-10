<template>
  <div class="si-detail">
    
  </div>
</template>
<script>
import store from '@/store'
import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'

export default {
  data() {
    return {
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    detailData: {
      type: Object,
      default: () => ({})
    },
  },
  created() {
    this.init()
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap
    })
  },
  watch: {

  },
  components: {
  },
  methods: {
    // 初始化
    init() {
      
    },
  }
}
</script>
<style>
</style>