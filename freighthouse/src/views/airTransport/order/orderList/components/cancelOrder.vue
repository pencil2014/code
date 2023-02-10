<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="50px" class="create-form">
      <el-form-item label="原因" prop="cancelReason">
        <el-select v-model="createdItem.cancelReason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 100%">
          <el-option v-for="(item, index) in dictMap.orderCancelReason" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="cancelRemark">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.cancelRemark" maxlength="512" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { orderCancelRequest } from '@/api/airTransport/order'
import { orderCancelRequestImport } from '@/api/airTransport/order-import'

const defaultCreate = {
  cancelReason: '',
  orderNo: '',
  cancelRemark: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: '发起取消订单',
        show: true,
        size: 'medium'
        // width: "800px"
      },

      createdItem: Object.assign({}, defaultCreate),

      cancelReasonOptions: {
        1: '膨胀',
        2: '之前'
      },

      rules: {
        cancelReason: [
          { required: true, message: '请选择取消原因', trigger: 'change' }
        ]
      },
      isSubmit: false
    }
  },
  props: {
    param: {
      type: Object
    },
    orderNo: {
      type: String,
      default: ''
    },
    serviceType: {
      type: String,
      default: 'st05'
    },
    isOrderFeeCount: {
      type: Boolean,
      default: false
    }
  },
  created() {
    // this.getBusinessType()
    if (this.isOrderFeeCount) {
      this.dialogConfig.title = '发起终止订单'
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    getBusinessType() {
      baseBusinessList().then((res) => {
        let { data } = res
        this.businessTypeOptions = data
      })
    },

    close(action, value, type) {
      this.$emit('close', action, value, type)
    },

    validate() {
      return true
    },

    handleSelectReason(val) {},

    handleSelectCustid() {},

    handleSelectCargoSource() {},

    handleSelectServiceType() {},

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.calcelOrderForm)
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
            this.handleCancelRequest(done)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    // 发起取消
    handleCancelRequest(done) {
      // console.log('发起取消')
      this.createdItem.orderNo = this.orderNo
      if (this.isSubmit) {
        return
      }
      this.isSubmit = true
      if (this.serviceType === 'st13' || this.serviceType === 'st14') {
        orderCancelRequestImport(this.createdItem).then((res) => {
          this.$message({
            type: 'success',
            message: this.isOrderFeeCount ? '发起终止成功' : '发起取消成功',
            duration: 1000,
            onClose: () => {
              this.isSubmit = false
              this.close('Confirm')
            }
          })
        }).catch(err => {
          this.isSubmit = false
          console.log('err', err)
        })
      } else {
        orderCancelRequest(this.createdItem).then((res) => {
          this.$message({
            type: 'success',
            message: this.isOrderFeeCount ? '发起终止成功' : '发起取消成功',
            duration: 1000,
            onClose: () => {
              this.isSubmit = false
              this.close('Confirm')
            }
          })
        }).catch(err => {
          this.isSubmit = false
          console.log('err', err)
        })
      }
    }
  }
}
</script>

<style lang="scss">
</style>
