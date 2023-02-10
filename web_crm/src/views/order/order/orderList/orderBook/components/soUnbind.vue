<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="soUnbindForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="soUnbind-form">    
      <el-form-item label="解绑原因" prop="reason" :show-message="false">
        <el-select v-model="createdItem.reason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 100%">
          <el-option v-for="(item, index) in dictMap.orderSoUnbindReason" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="解绑备注" prop="remark">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.remark" maxlength="512" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {bookSoUnbind, bookSoUnbindBatch} from '@/api/order/list'

const defaultCreate = {
  reason: "", // 解绑原因
  remark: '' // 解绑备注
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '解绑SO',
        show: true,
        size: 'medium',
        width: "460px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        reason: [{required: true, message: '请选择解绑原因', trigger: 'change'}],
      }
    }
  },
  props: {
    unbindParam: {
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
        this.$refs.soUnbindForm.validate((valid) => {
          if (valid) {
            this.handleSoUnbind(done)
          } else {
            console.log('error submit!!');
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 解绑
    handleSoUnbind(done) {
      // 批量
      if (this.unbindParam.isBatch) {
        let data = {
          ...this.createdItem, 
          orderNo: this.$route.query.orderNo,
          soList: this.unbindParam.so
        }
        bookSoUnbindBatch(data).then(res => {
          this.$message({
            type: 'success',
            message: '解绑成功',
          })
          this.close('Confirm')
        })
      } else {
        let data = {
          ...this.createdItem, 
          orderNo: this.$route.query.orderNo,
          so: this.unbindParam.so
        }
        bookSoUnbind(data).then(res => {
          this.$message({
            type: 'success',
            message: '解绑成功',
          })
          this.close('Confirm')
        })
      }
    }
  }
};
</script>

<style lang="scss">
.soUnbind-form{
  .el-form-item{
    margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}
</style>
