<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="65px" class="cancel-form">    
      <div class="warning-txt">本次撤回申请，需订舱人员{{bkgEmployeeName}}审核，是否确定撤回？</div>
      <el-form-item required label="撤回原因" prop="cancelRemark" :show-message="false">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.cancelRemark" maxlength="255" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
  cancelRemark: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: '撤回',
        show: true,
        size: 'medium',
        width: "450px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {}
    }
  },
  props: {
    bkgEmployeeName: {
      type: String,
      default: ''
    },
  },
  created() {
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    })
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.calcelOrderForm)
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
           this.close('Confirm', this.createdItem)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.cancel-form {
  .warning-txt{
    line-height: 20px;
    margin-bottom: 10px;
  }
  /deep/ .el-form-item{
   margin-bottom: 4px;
  }
  /deep/ .el-form-item__label, /deep/ .el-form-item__content{
    line-height: 20px;
  }
}

</style>
