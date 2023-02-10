<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="60px" class="create-form">    
      <el-form-item label="拿价人" prop="pricingEmployeeId">
        <el-select 
          size="mini" 
          clearable
          filterable
          disabled
          v-model="createItem.pricingEmployeeId"
          style="width: 100%"  
          placeholder="请选择"
          @visible-change="employeeVisibleChange"
          :filter-method="employeeFilterMehod"
          @change="handleChangeEmployee">
          <el-option v-for="(o, index) in employeeOptions"
            :key="index"
            :label="o.label"
            :value="o.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注信息" prop="dnCheckApplyRemark">
        <el-input type="textarea" size="mini" placeholder="请输入" v-model="createItem.dnCheckApplyRemark"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {baseEmployeeListName} from '@/api/base'
import {blDraftConfirm} from '@/api/order/bl'

const defaultCreate = {
  pricingEmployeeId: '',
  pricingEmployeeName: '',
  dnCheckApplyRemark: ''
}

export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '商务签单',
        show: true,
        size: 'medium'
        // width: "800px"
      },
      createItem: Object.assign({}, defaultCreate),
      rules: {
        pricingEmployeeId: [{required: true, message: '请选择拿价人', trigger: 'change'}],
      },
      employeeOptions: []
    }
  }, 
  props: {
    detailData: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    let {workAssign} = this.detailData
    let sItem = workAssign.find(item => item.jobCode === 'pricing')
    if (sItem) {
      this.createItem.pricingEmployeeId = sItem.employeeId
      this.createItem.pricingEmployeeName = sItem.employeeName
      if (this.createItem.pricingEmployeeId === 0) this.createItem.pricingEmployeeId = ''
      this.employeeOptions = [{label: this.createItem.pricingEmployeeName, value: this.createItem.pricingEmployeeId}]
    }
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
    employeeFilterMehod(val) {
      this.getEmployeeName(val)
    },
    employeeVisibleChange(val) {
      val && this.getEmployeeName('')
    },
    handleChangeEmployee(val) {
      // let sItem = this.employeeOptions.find(ele => this.$language === 'en' ? ele.ename === val : ele.cname === val)
      // Object.assign(item, {
      //   employeeId: sItem.employeeId
      // })
    },
    // 获取员工name
    getEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: "sc"  // 角色
      }
      baseEmployeeListName(data).then(res => {
        this.employeeOptions = res.data.filter(item => item.status === 'on').map(item => {
          return Object.assign(item, {
            label: this.$language === 'en' ? item.ename : item.cname,
            value: item.employeeId ? Number(item.employeeId) : ''
          })
        })
      })
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.createForm.validate((valid) => {
          if (valid) {
            let data = {
              dnCheckApplyRemark: this.createItem.dnCheckApplyRemark,
              pricingEmployeeId: this.createItem.pricingEmployeeId
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

</style>
