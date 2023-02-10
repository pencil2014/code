<template>
  <div>
    <BaseDialog :config="dialogConfig" :callback="dialogCallback">
      <el-form ref="updateSoForm" :model="createItem" :rules="rules" label-position="right" label-width="60px" class="create-form">    
        <el-form-item label="SO号" prop="so">
          <el-input size="mini" placeholder="请输入" v-model="createItem.so" clearable></el-input>
        </el-form-item>
      </el-form>
    </BaseDialog>
  </div>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import {orderContainerUpdateSo} from '@/api/order/list'
const defaultCreate = {
  so: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '批量修改SO',
        show: true,
        size: 'medium',
        width: "360px"
      },
      canSubmit: true,    // 可提交标识
      rules: {
        so: [{required: true, message: '请填写SO', trigger: 'blur'}],
      },
      createItem: Object.assign({}, defaultCreate),
    }
  },
  props: {
    idList: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
  },
  mounted() {

  },
  computed: { 
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
        this.$refs.updateSoForm.validate(valid => {
          if (valid) {
            this.handleUpdateSo(done)
          } else {
            console.log('error submit')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    handleUpdateSo(done) {
      orderContainerUpdateSo({
        orderNo: this.$route.query.orderNo,
        jointNo: this.$route.query.jointNo,
        idList: this.idList,
        so: this.createItem.so
      }).then(res => {
        this.$message({
          type: 'success',
          message: '批量修改so成功',
          duration: 1000,
          onClose: () => {
            this.close('Confirm')
          }
        })
      })
    },
  }
};
</script>

<style lang="scss">
.info-txt{
  margin-bottom: 20px;
  font-size: 12px;
  line-height: 24px;
}
.mb20{
  margin-bottom: 20px;
}
.create-item-label{
  font-size: 12px;
  margin-right: 10px;
}
</style>
