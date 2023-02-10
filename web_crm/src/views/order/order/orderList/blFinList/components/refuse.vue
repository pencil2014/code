<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="processing" :rules="rules" :model="createdItem" label-position="right" label-width="80px" class="create-form">    
      <el-form-item label="拒绝原因" prop="processingReason">
        <el-select v-model="createdItem.processingReason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 100%">
          <el-option v-for="(item, index) in dictMap.blFinAuditProcessingReason" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="拒绝备注" prop="processingRemark">
        <el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="createdItem.processingRemark"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
  processingReason: "",
  processingRemark: ''
}
export default {
  data() {
    return {
      dialogConfig: {
        title: '审核拒绝',
        show: true,
        size: 'medium'
        // width: "800px"
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        processingReason: [{required: true, message: '请选择拒绝原因', trigger: 'change'}],
      }
    }
  },
  props: {
    param: {
      type: Object
    },
  },
  created() {
    // this.getBusinessType()
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
    close(action, value) {
      this.$emit('close', action, value)
    },
    handleSelectReason(val) {
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.processing.validate((valid) => {
          if (valid) {
            let data = Object.assign({... this.param}, {
              reason: this.createdItem.processingReason,
              remark: this.createdItem.processingRemark
            })
            this.close('Confirm', data)
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
};
</script>

<style lang="scss">

</style>
