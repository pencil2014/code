<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="create-form">    
      <el-form-item label="拒绝原因" prop="refuseReason">
        <el-select v-model="createdItem.refuseReason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 100%">
          <el-option v-for="(item, index) in refuseReasonOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="拒绝备注" prop="refuseRemark">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.refuseRemark"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {orderJointServiceRefuse} from '@/api/order/list'

const defaultCreate = {
  id: '', // 协同服务项id
  refuseReason: "", // 拒绝原因
  orderNo: '',  // 工作号
  jointNo: '',  // 协同单号
  refuseRemark: ''  // 拒绝备注
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '拒绝',
        show: true,
        size: 'medium'
        // width: "800px"
      },

      createdItem: Object.assign({}, defaultCreate),

      refuseReasonOptions: [{label: '原因1',value: '1'}],
      rules: {
        refuseReason: [{required: true, message: '请选择拒绝原因', trigger: 'change'}],
      }

    }
  },
  props: {
    refuseParam: {
      type: Object,
      default: () => ({})
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
    
    close(action) {
      this.$emit('close', action)
    },

    handleSelectReason(val) {

    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.refuseForm)
        this.$refs.refuseForm.validate((valid) => {
          if (valid) {
            this.handleRefuse(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    // 发起拒绝
    handleRefuse(done) {
      Object.assign(this.createdItem, {
        id: this.refuseParam.id,
        orderNo: this.refuseParam.orderNo,
        jointNo: this.refuseParam.jointNo,
      })
      orderJointServiceRefuse(this.createdItem).then(res => {
        this.$message({
          type: 'success',
          message: '拒绝成功',
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
