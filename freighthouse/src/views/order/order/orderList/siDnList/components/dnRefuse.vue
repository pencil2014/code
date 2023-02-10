<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="dnRefuseForm" :rules="rules" :model="createItem" label-position="right" label-width="70px" class="dnRefuse-form">    
      <el-form-item label="拒绝原因" prop="refuseReason" :show-message="false">
        <el-select 
          size="mini" 
          clearable
          v-model="createItem.refuseReason"
          style="width: 100%"  
          placeholder="请选择"
          @change="handleChangeReason">
          <el-option v-for="(o, index) in dictMap.dnPriceRefuseReason"
            :key="index"
            :label="o.label"
            :value="o.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="拒绝备注" prop="refuseRemark" :show-message="false">
        <el-input type="textarea" size="mini" placeholder="请输入" v-model="createItem.refuseRemark"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
  refuseReason: '',
  refuseRemark: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '审核拒绝',
        show: true,
        size: 'medium'
        // width: "800px"
      },
      createItem: Object.assign({}, defaultCreate),
      rules: {
        refuseReason: [{required: true, message: '请选择拒绝原因', trigger: 'change'}],
        refuseRemark: [{required: true, message: '请输入拒绝备注', trigger: 'blur'}],
      },
    }
  }, 
  props: {
    detailData: {
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
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    handleChangeReason(val) {
      
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.dnRefuseForm.validate((valid) => {
          if (valid) {
            let data = {
              refuseReason: this.createItem.refuseReason,
              refuseRemark: this.createItem.refuseRemark
            }
            this.close('Confirm', data)
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

<style lang="scss">
.dnRefuse-form {
  .el-form-item{
    margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}
</style>
