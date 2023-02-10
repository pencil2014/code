<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="calcelOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="90px" class="cancel-form">
      <el-form-item v-if="changeType==='1'" label="海外分公司" prop="overseasCompanyCode" :show-message="false">
        <el-select v-model="createdItem.overseasCompanyCode" size="mini" clearable placeholder="请选择" style="width: 100%" @change="changeOverseasCompany">
          <el-option v-for="(item, index) in abroadCompanyList" :label="item.companyName" :value="item.companyCode" :key="index"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="海外客服" prop="ecsEmployeeId" :show-message="false">
        <el-select v-model="createdItem.ecsEmployeeId" remote :disabled="!!(ecs.employeeId && ecs.employeeId!='0')" @visible-change="
						val => {
							getEcsEmployeeNameVisible(val)
						}
					" :filter-method="
						val => {
							getEcsEmployeeName(val)
						}
					" filterable size="mini" clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in ecsEmployeeList" :label="item.cname" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="海外商务" prop="epricingEmployeeId" :show-message="false">
        <el-select v-model="createdItem.epricingEmployeeId" remote :disabled="!!(epricing.employeeId && epricing.employeeId!='0')" filterable size="mini" @visible-change="
						val => {
							getEpricingEmployeeNameVisible(val)
						}
					" :filter-method="
						val => {
							getEpricingEmployeeName(val)
						}
					" clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in epricingEmployeeList" :label="item.cname" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <p v-if="changeType==='1'" class="overseas-service-type-msg">变更海外服务类型为“海外分公司做海外服务”，需要提交给海外客服<span v-if="ecsName">（{{ecsName}}）</span>审核，是否确定提交？</p>
    <p v-if="changeType==='2'" class="overseas-service-type-msg">变更海外服务类型为“海外代理做海外服务”，需要提交给海外客服{{ecsName}}审核，是否确定提交？</p>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
const defaultCreate = {
  overseasCompanyCode: '',
  overseasCompanyName: '',
  ecsEmployeeId: '',
  epricingEmployeeId: ''
}
import { baseDeptParticipants } from '@/api/base'
export default {
  data() {
    return {
      ecsEmployeeList: [],
      epricingEmployeeList: [],
      dialogConfig: {
        title: '变更海外服务类型',
        show: true,
        size: 'medium',
        width: '500px'
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        overseasCompanyCode: [
          { required: true, message: '请选择海外分公司', trigger: 'change' }
        ],
        ecsEmployeeId: [
          { required: true, message: '请选择海外客服', trigger: 'change' }
        ],
        epricingEmployeeId: [
          { required: true, message: '请选择海外商务', trigger: 'change' }
        ]
      }
    }
  },
  props: {
    changeType: {
      type: String,
      default: ''
    },
    overseasCompanyCode: {
      type: String,
      default: ''
    },
    overseasCompanyName: {
      type: String,
      default: ''
    },
    ecsName: {
      type: String,
      default: ''
    },
    abroadCompanyList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  created() {},
  mounted() {
    this.createdItem.overseasCompanyCode = this.overseasCompanyCode
    this.createdItem.overseasCompanyName = this.overseasCompanyName

    if (this.ecs.employeeId && this.ecs.employeeId != '0') {
      this.createdItem.ecsEmployeeId = this.ecs.employeeId
      this.ecsEmployeeList.push({
        cname: this.ecs.employeeName,
        employeeId: this.ecs.employeeId
      })
    }
    if (this.epricing.employeeId && this.epricing.employeeId != '0') {
      this.createdItem.epricingEmployeeId = this.epricing.employeeId
      this.epricingEmployeeList.push({
        cname: this.epricing.employeeName,
        employeeId: this.epricing.employeeId
      })
    }
  },
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.order.orderList.ordDetRole,
      orderInfoDataObj: (state) => state.order.orderInfoDataObj
    }),
    ecs() {
      let { workAssign } = this.orderInfoDataObj
      let asstItem = workAssign && workAssign.find((el) => el.jobCode === 'ecs')
      return asstItem
    },
    epricing() {
      let { workAssign } = this.orderInfoDataObj
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'epricing')
      return asstItem
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    getEcsEmployeeNameVisible(val) {
      if (val) {
        if (this.changeType === '1' && !this.createdItem.overseasCompanyCode) {
          this.$message.error('请先选择海外分公司')
          return
        }
      }
      this.getEcsEmployeeName('')
    },
    getEpricingEmployeeNameVisible(val) {
      if (val) {
        if (this.changeType === '1' && !this.createdItem.overseasCompanyCode) {
          this.$message.error('请先选择海外分公司')
          return
        }
      }
      this.getEpricingEmployeeName('')
    },
    getEcsEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'ecs'
      }
      if (this.createdItem.overseasCompanyCode) {
        data.deptCode = this.createdItem.overseasCompanyCode
      }
      baseDeptParticipants(data,true).then((res) => {
        this.ecsEmployeeList = res.data
      })
    },
    getEpricingEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'epricing'
      }
      if (this.createdItem.overseasCompanyCode) {
        data.deptCode = this.createdItem.overseasCompanyCode
      }
      baseDeptParticipants(data,true).then((res) => {
        this.epricingEmployeeList = res.data
      })
    },
    changeOverseasCompany(val) {
      // dosomething 回选 海外分公司名称
      if (!this.ecs.employeeId && this.ecs.employeeId == '0') {
        this.createdItem.ecsEmployeeId = ''
      }
      if (!this.epricing.employeeId && this.epricing.employeeId == '0') {
        this.createdItem.epricingEmployeeId = ''
      }
      let item = this.abroadCompanyList.find((el) => el.companyCode === val)
      this.createdItem.overseasCompanyName = item.companyName
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        console.log(this.$refs.calcelOrderForm)
        this.$refs.calcelOrderForm.validate((valid) => {
          if (valid) {
            let params={
              ecsEmployeeId: this.createdItem.ecsEmployeeId,
              epricingEmployeeId: this.createdItem.epricingEmployeeId
            }
            if(this.changeType==='1'){
              params.overseasCompanyName=this.createdItem.overseasCompanyName
              params.overseasCompanyCode=this.createdItem.overseasCompanyCode
            }
            this.close('Confirm', params)
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
.overseas-service-type-msg {
  color: green;
  padding: 0 20px;
  margin-top: 20px;
  line-height: 20px;
  font-size: 13px;
}
</style>
