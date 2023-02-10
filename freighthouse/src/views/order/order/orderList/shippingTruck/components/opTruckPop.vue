<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" class="optruck-dialog">
  <p class="optruck-pop-msg">订单还未设置拖车操作人员，请先设置再提交。</p>
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="90px" class="cancel-form">
      <el-form-item label="拖车操作" prop="employeeId" :show-message="false">
        <el-select v-model="createdItem.employeeId" remote @visible-change="
						val => {
							getEmployeeNameVisible(val)
						}
					" :filter-method="
						val => {
							getEmployeeName(val)
						}
					" filterable size="mini" clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in employeeList" :label="item.cname" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
  employeeId: ''
}
import { baseDeptParticipants } from '@/api/base'
export default {
  data() {
    return {
      employeeList: [],
      dialogConfig: {
        title: '提示',
        show: true,
        size: 'medium',
        width: '500px'
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        employeeId: [
          { required: true, message: '请选择拖车操作', trigger: 'change' }
        ]
      }
    }
  },
  props: {
    bdDeptCode: {
      type: String,
      default: ''
    }
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.order.orderList.ordDetRole,
      orderInfoDataObj: (state) => state.order.orderInfoDataObj
    })
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    getEmployeeNameVisible(){
      this.getEmployeeName('')
    },
    getEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'op_truck',
        deptCode: this.bdDeptCode
      }
      baseDeptParticipants(data).then((res) => {
        this.employeeList = res.data
      })
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.calcelOrderForm)
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
            this.close('Confirm', this.createdItem.employeeId)
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
.cancel-form {
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
}
.optruck-pop-msg{
  color: red;
  padding: 0 20px;
  line-height: 20px;
  font-size: 13px;
  margin-bottom: 10px;
}
.optruck-dialog{
  .el-dialog {
    margin-top: 15vh !important;
  }
}
</style>
