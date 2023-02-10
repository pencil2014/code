<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custNoUpdataForm" id="changeBizDatePop" :rules="rules" :model="createItem" label-width="110px" :show-message="false">
      <el-form-item label="实际起飞时间" prop="etdDate" style="margin-bottom:4px">
        <elDatePickerLimit size="mini" type="date" v-model="createItem.etdDate" clearable style="width: 100%" placeholder="实际起飞时间" value-format="yyyy-MM-dd" />
      </el-form-item>
      <el-form-item label="修改原因" style="margin-bottom:4px">
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="createItem.editRemark">
        </el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
  data() {
    return {
      dialogConfig: {
        title: '修改',
        show: true,
        size: 'medium',
        width: '600px'
      },
      createItem: {
        etdDate: '',
        editRemark: ''
      },
      rules: {
        etdDate: [
          {
            required: true,
            message: '请选择国际1程实际起飞日',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  props: ['etdDate'],
  created() {
    this.createItem.etdDate = this.etdDate
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
#changeBizDatePop {
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
}
</style>
