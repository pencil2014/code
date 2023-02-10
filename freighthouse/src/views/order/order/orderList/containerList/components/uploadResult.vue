<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-row class="result-cont">
      <div class="item">总条数: {{results.total}}</div>
      <div class="item">成功条数: {{results.success}}</div>
      <div class="item">失败条数: {{results.fail}}</div>
    </el-row>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '导入集装箱',
        show: true,
        size: 'medium',
        width: "560px",
        btns: [
          {label: '确定', action: 'Confirm', type: 'primary'}
        ]
      }
    }
  },
  props: {
    results: {
      type: Object
    }
  },
  created() {
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),  
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.close('Confirm')
      } else {
        this.close('Cancel')
      }
    }
  }
};
</script>

<style lang="scss">
.result-cont{
  width: 300px;
  margin: 0 auto;
  .item{
    line-height: 30px;
    height: 30px;
  }
}
</style>
