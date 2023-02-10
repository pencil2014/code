<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="50px" class="cancel-form">    
      <el-form-item label="原因" prop="cancelReason" :show-message="false">
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
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {orderCancelRequest, orderCancelRequestOp} from '@/api/order/list'

const defaultCreate = {
  cancelReason: "",
  orderNo: '',
  cancelRemark: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: this.cancelType === 'cancel' ? '取消订单' : this.cancelType === 'break' ? '终止订单' : '发起取消订单',
        show: true,
        size: 'medium',
        width: "360px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        cancelReason: [{required: true, message: '请选择取消原因', trigger: 'change'}],
      }
    }
  },
  props: {
    orderNo: {
      type: String,
      default: ''
    },
    cancelType: {
      type: String,
      default: ''
    },
    isBd: {
      type: Boolean,
      default: false
    },
    isOp: {
      type: Boolean,
      default: false
    },
    isDoc: {
      type: Boolean,
      default: false
    }
  },
  created() {
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      ordDetRole: state => state.order.orderList.ordDetRole,
    })
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
    handleSelectReason(val) {

    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.calcelOrderForm)
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
            if (this.isBd) this.handleCancelRequest(done)
            if (this.isOp) this.handleCancelRequestOp(done)
            // 海外仓的文件可以发起取消操作
            if (this.isDoc) this.handleCancelRequestOp(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // bd发起取消
    handleCancelRequest(done) {
      console.log('发起取消')
      this.createdItem.orderNo = this.orderNo
      orderCancelRequest(this.createdItem).then(res => {
        this.$message({
          type: 'success',
          message: '发起取消成功',
          duration: 1000,
          onClose: () => {
            this.close('Confirm')
          }
        })
      })
    },
    // op发起取消
    handleCancelRequestOp(done) {
      let data = {...this.createdItem, orderNo: this.orderNo, cancelType: this.cancelType}
      orderCancelRequestOp(data).then(res => {
        this.$message({ message: this.cancelType === 'cancel' ? '取消成功' : '终止成功', type: 'success' })
        this.close('Confirm')
      }).catch(err => {
        console.log('err', err)        
      })
    }
  }
};
</script>

<style lang="scss">
.cancel-form {
  .el-form-item{
   margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}

</style>
