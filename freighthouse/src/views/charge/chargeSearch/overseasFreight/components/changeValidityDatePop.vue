<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custNoUpdataForm" id="changeValidityDatePop" :rules="rules" :model="createItem" label-width="70px" label-position="top">
      <el-form-item label="Validity Date" prop="delayDate" :show-message="true">
        <el-date-picker v-model="createItem.delayDate" size="mini" style="width:100%" type="daterange" range-separator="~" start-placeholder='Start Date' value-format="yyyy-MM-dd" end-placeholder='End date' >
        </el-date-picker>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index-en.vue'
export default {
  data() {
    return {
      dialogConfig: {
        title: 'Extended validity',
        show: true,
        size: 'medium',
        width: '400px'
      },
      createItem: {
        delayDate: ''
      },
      rules: {
        delayDate: [
          {
            required: true,
            message: 'Please select expiration date',
            trigger: 'change'
          }
        ]
      }
    }
  },
  props:{
    currentRow:{
      type:Object,
      default(){
        return {}
      }
    }
  },
  created() {
    if(this.currentRow && this.currentRow.startDateValidity){
      this.createItem.delayDate = [this.currentRow.startDateValidity,this.currentRow.endDateValidity]
    }
  },
  mounted() {},
  computed: {},
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.custNoUpdataForm.validate((valid) => {
          if (valid) {
            this.close('Confirm', this.createItem)
          } else {
            this.$msgErrClose('Please fill in the fields in the red box as required!')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
#changeValidityDatePop {
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
  .el-range-editor--mini .el-range-separator {
    line-height: 12px;
    font-size: 12px;
  }
}
</style>
