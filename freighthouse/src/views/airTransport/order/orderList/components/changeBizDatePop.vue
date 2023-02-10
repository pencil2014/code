<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custNoUpdataForm" id="changeBizDatePop" :rules="rules" :model="createItem" label-width="70px">
      <el-form-item label="业务时间" prop="bizDate" :show-message="true">
        <elDatePickerLimit size="mini" type="date" v-model="createItem.bizDate" clearable style="width: 100%" placeholder="业务日期" value-format="yyyy-MM-dd" />
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
        title: '修改业务时间',
        show: true,
        size: 'medium',
        width: '400px'
      },
      createItem: {
        orderNo: '',
        bizDate: ''
      },
      rules: {
        bizDate: [
          {
            required: true,
            message: '请选择业务时间',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  props: ['bizDate'],
  created() {
    this.createItem = {
      bizDate: this.createItem.bizDate,
      orderNo: this.$route.query.orderNo
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
