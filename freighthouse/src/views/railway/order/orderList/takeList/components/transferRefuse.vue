<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="cancel-form">
      <el-form-item label="取消原因" prop="cancelRemark" :show-message="false">
        <el-input maxlength="255" :show-word-limit="true" type="textarea" size="mini" placeholder="请输入" v-model="createdItem.cancelRemark" clearable></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
  cancelRemark: '',
}

export default {
  data() {
    return {
      supplierOptions: [],
      companyListOptions: [],
      tcEmployeeList: [],
      rcEmployeeList: [],
      dialogConfig: {
        title: '取消转移',
        show: true,
        size: 'medium',
        width: '500px'
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        cancelRemark: [
          { required: true, message: '请输入取消原因', trigger: 'change' }
        ]
      }
    }
  },
  props: {},
  created() {
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.order.orderList.ordDetRole
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
            this.close('Confirm', this.createdItem)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
.cancel-form {
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-input--mini .el-input__inner {
    height: 20px;
    line-height: 20px;
  }
  .el-input--mini .el-input__icon {
    line-height: 20px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px !important;
  }
}
</style>
