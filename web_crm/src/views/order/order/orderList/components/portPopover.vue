<template>
  <div class="port-item">
    <el-popover placement="top"	width="200"	trigger="hover" class="port-ename" v-if="portItem.ename" popper-class="port-ename-popover">
      <div class="port-popover">
        <span>{{portItem.ename}}</span>
        <em @click="handleCopyPort(portItem.ename, $event)" v-if="isShowCopy">复制</em>
      </div>
      <div slot="reference" class="label">{{portItem.ename}}</div>
    </el-popover>
    <div v-else class="port-ename"><div class="label"></div></div>
    <el-popover placement="top"	width="200"	trigger="hover" class="port-ename" v-if="portItem.countryEname" popper-class="port-ename-popover">
      <div class="port-popover">
        <span>{{portItem.countryEname}}</span>
        <em @click="handleCopyPort(portItem.countryEname, $event)" v-if="isShowCopy">复制</em>
      </div>
      <div slot="reference" class="label">{{portItem.countryEname}}</div>
    </el-popover>
    <div v-else class="port-ename"><div class="label"></div></div>
  </div>
</template>
<script>
import clip from '@/utils/clipboard'
import clipboard from '@/directive/clipboard/index.js'
export default {
  data() {
    return {
    }
  },
  props: {
    portItem: {
      type: Object,
      default: () => ({})
    },
    isShowCopy: {
      type: Boolean,
      default: false
    }
  },
  activated() {
    
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    enameVisible() {
      return this.portItem.ename ? true : false
    },
    countryEnameVisible() {
      return this.portItem.countryEname ? true : false
    }
  },
  components: {
  },
  watch: {
  },
  methods: {
    handleCopyPort(val, e) {
      clip(val, e)
    },
    clipboardSuccess() {
      this.$message({
        message: '复制成功',
        type: 'success',
        duration: 1500
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.port-item{
  width: 68%;
  height: 20px;
  .port-ename{
    display: inline-block;
    width: 50%;
    padding: 0 0 0 5px;
    .label{
      background-color: #F5F7FA;
      border: 1px solid #dfe4ed;
      border-radius: 4px;
      height: 20px;
      font-size: 12px;
      line-height: 20px;
      padding: 0 5px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
.port-popover{
  font-size: 12px;
  span{
    display: inline-block;
  }
	em{
    display: inline-block;
		cursor: pointer;
		font-style: normal;
		color: #3E80F5;
		margin-left: 5px;
	}
}
</style>