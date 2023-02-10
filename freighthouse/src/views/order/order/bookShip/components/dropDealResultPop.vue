<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="dropDealResultForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="result-form">    
      <el-form-item label="保柜状态" prop="result" :show-message="false">
        <el-select v-model="createdItem.result" size="mini" clearable placeholder="请选择" @change="handleSelectResult" style="width: 100%">
          <el-option v-for="(item, index) in dropDealResultOptions" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="原因" prop="remark" :show-message="false">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.remark" maxlength="512" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {pricingDropDeal} from '@/api/order/book/list'

const defaultCreate = {
  result: "",
  remark: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: '回复结果',
        show: true,
        size: 'medium',
        width: "400px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        result: [{required: true, message: '请选择保柜状态', trigger: 'change'}],
        remark: [{required: true, message: '请选择原因', trigger: 'blur'}],
      },
      dropDealResultOptions: [
        {label: '保柜成功', value: 'Y'},
				{label: '保柜失败', value: 'N'},
				{label: '不确定', value: 'C'}
      ]
    }
  },
  props: {
    bookDetailForm: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.createdItem = {
      result: this.bookDetailForm.dropDealResult,
      remark: this.bookDetailForm.dropDealRemark
    }
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
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    handleSelectResult(val) {

    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.dropDealResultForm)
        this.$refs.dropDealResultForm.validate((valid) => {
          if (valid) {
            this.handleDropDeal(done)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 提交
    handleDropDeal(done) {
      console.log('回复')
      let data = {...this.createdItem, bkgReqNo: this.$route.query.bkgReqNo}
      pricingDropDeal(data).then(res => {
        this.$message({
          type: 'success',
          message: '回复结果成功',
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

<style lang="scss" scoped>
.result-form {
  /deep/ .el-form-item{
   margin-bottom: 4px;
  }
  /deep/ .el-form-item__label, /deep/ .el-form-item__content{
    line-height: 20px;
  }
}

</style>
