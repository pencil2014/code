<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="bkgReleaseCancelForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="bkgReleaseCancel-form">    
      <el-form-item label="撤回原因" prop="cancelReason" :show-message="false">
        <el-select v-model="createdItem.cancelReason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 100%">
          <el-option v-for="(item, index) in dictMap.bkgReleaseCancelReason" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="撤回备注" prop="cancelRemark">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.cancelRemark" maxlength="512" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { bkgReleaseCancel } from '@/api/order/book/list'

const defaultCreate = {
  cancelReason: "",
  cancelRemark: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: '撤回放舱',
        show: true,
        size: 'medium',
        width: "360px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        cancelReason: [{required: true, message: '请选择撤回原因', trigger: 'change'}],
      }
    }
  },
  props: {
    param: {
      type: Object
    },
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

    validate() {
      return true
    },

    handleSelectReason(val) {
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        // console.log(this.$refs.bkgReleaseCancelForm)
        this.$refs.bkgReleaseCancelForm.validate((valid) => {
          if (valid) {
            this.handleCancelRequest(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },

    // 发起取消
    handleCancelRequest(done) {
      let data = {...this.createdItem, bkgReqNo: this.$route.query.bkgReqNo}
			bkgReleaseCancel(data).then(res => {
				this.$message({
					type: 'success',
					message: '撤回放舱成功',
        })
        this.close('Confirm')
      })
    }
  }
};
</script>

<style lang="scss">
.bkgReleaseCancel-form {
  .el-form-item{
   margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}

</style>
