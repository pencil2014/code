<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="refuseForm" :rules="rules" :model="createdItem" label-position="right" label-width="50px" class="refuse-form">    
      <el-form-item required label="原因" prop="refuseRemark" :show-message="false">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.refuseRemark" maxlength="255" show-word-limit></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
  refuseRemark: ''
}

export default {
  data() {
    return {
      dialogConfig: {
        title: '不同意撤回',
        show: true,
        size: 'medium',
        width: "450px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {}
    }
  },
  props: {
  },
  created() {
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
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        // console.log(this.$refs.refuseForm)
        this.$refs.refuseForm.validate((valid) => {
          if (valid) {
           this.close('Confirm', this.createdItem)
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

<style lang="scss" scoped>
.refuse-form {
  .warning-txt{
    line-height: 20px;
    margin-bottom: 10px;
  }
  /deep/ .el-form-item{
   margin-bottom: 4px;
  }
  /deep/ .el-form-item__label, /deep/ .el-form-item__content{
    line-height: 20px;
  }
}

</style>
