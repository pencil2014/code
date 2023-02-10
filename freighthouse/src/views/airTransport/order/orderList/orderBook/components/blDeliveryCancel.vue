<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="120px" class="create-form">    
      <el-form-item label="撤回原因" prop="cancelReason">
        <el-select size="mini" placeholder="请选择" v-model="createItem.cancelReason" clearable style="width:100%">
          <el-option v-for="(item, index) in dictMap.blCancelReason" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="撤回备注" prop="cancelRemark">
        <el-input type="textarea" size="mini" placeholder="请输入" v-model="createItem.cancelRemark"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {blDeliveryCancel} from '@/api/order/bl'

const defaultCreate = {
  orderNo: '',
  blId: '',
  cancelReason: '',
  cancelRemark: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '提单撤回',
        show: true,
        size: 'medium'
        // width: "800px"
      },
      createItem: Object.assign({}, defaultCreate),
      rules: {
        cancelReason: [{required: true, message: '请选择撤回原因', trigger: 'change'}],
        cancelRemark: [{required: true, message: '请输入撤回备注', trigger: 'blur'}]
      },
    }
  },
  props: {
    cancelBlIds: {
      type: Array,
      default: () => ([])
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
        this.$refs.createForm.validate((valid) => {
          if (valid) {
            this.handleCancel(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 提单撤回
    handleCancel(done) {
      this.createItem.orderNo = this.$route.query.orderNo
      this.createItem.jointNo = this.$route.query.jointNo
      this.createItem.blId = this.cancelBlIds[0]
      blDeliveryCancel(this.createItem).then(res => {
        this.$message({
          type: 'success',
          message: '提单撤回成功',
          duration: 1000,
          onClose: () => {
            this.close('Confirm')
          }
        })
      })
    }
  }
};
</script>

<style lang="scss">

</style>
