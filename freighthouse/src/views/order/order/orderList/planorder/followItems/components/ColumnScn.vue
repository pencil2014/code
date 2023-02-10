<template>
  <div class="column-scn">
    <el-link type="primary" class="fz" size="mini" @click="look">明细</el-link>
    <!-- 查看收发通 -->
    <div v-if="scnPopShow">
       <scnPop @close="scnPopClose" :orderNo="orderNo" />
    </div>
    <!-- 查看 成本 利润 -->
    <div v-if="csPopShow">
       <csPop @close="csPopClose" :orderNo="orderNo" />
    </div>
  </div>
</template>

<script>
import scnPop from './scnPop.vue'
import csPop from './csPop.vue'
export default {
  props: ['param', 'item'],
  data() {
    return {
      orderNo: '',
      scnPopShow: false,
      csPopShow: false
    }
  },
  components: {
    scnPop,
    csPop,
  },
  created() {
     
  },
  methods: {
    look() {
      console.log(this.param, this.item)
      this.orderNo = this.param.orderNo
      if (this.item.key === 'scn') {
         this.scnPopShow = true
      } else if (this.item.key === 'cs') {
         this.csPopShow = true
      }
    },
    scnPopClose() {
      this.scnPopShow = false
    },
    csPopClose(action, value) {
      this.csPopShow = false
    }
  },
}
</script>

<style lang="scss" scoped>
.column-scn {
  .fz {
    font-size: 12px;
  }
}
</style>