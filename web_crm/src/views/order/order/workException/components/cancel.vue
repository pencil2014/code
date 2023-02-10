<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="form" :model="createItem" label-position="right" label-width="70px" class="cancel-excp-form">    
      <el-form-item label="责任人" prop="blameEmployeeId">
        <el-select
          size="mini" 
          filterable
          v-model="blameEmployeeName"
          style="width: 100%"  
          placeholder="请选择"
          @visible-change="(val) => {visibleChange(val)}"
          :filter-method="(val) => {filterMehod(val)}"
          @change="(val) => {handleChangeEmployee(val)}">
          <el-option v-for="ele in employeeOptions"
            :key="ele.employeeId"
            :label="ele.cname"
            :value="ele.employeeId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="责任公司" prop="blameSupplierId">
        <el-select v-model="createItem.blameSupplierId" size="mini" clearable :filterable="true" @visible-change="custVisibleChange"
            :filter-method="custFilterMehod" placeholder="请选择" @change="handleSelectCustid" style="width: 100%">
            <el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
          </el-select>
      </el-form-item>
      <el-form-item label="原因" prop="reason">
        <el-input type="textarea" size="mini" v-model="createItem.reason" placeholder="请输入"></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import {mapState} from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {baseEmployeeListName, baseSupplierList} from '@/api/base'
import {workExceptionUpdateStatus} from '@/api/order/workException'

const defaultCreate = {
  excpId: '',
  blameEmployeeId: "",
  status: 'cancel',
  blameSupplierId: '',
  reason: ''
}
const defaultQuery = {
  currPage: 1,
  pageSize: 30,
  query:[{"column":"supplierName","type":"default","value":""}]
}
export default {
  data() {
    return {
      oQuery: this.$route.query,
      dialogConfig: {
        title: '异常单取消',
        show: true,
        size: 'medium',
        width: '400px'
      },

      createItem: Object.assign({}, defaultCreate),
      blameEmployeeName: '',
      employeeOptions: [],
      custidOptions: [],
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
      dictMap: state => state.dict.dictMap,
      orderNo: state => state.order.orderNo
    }),
  },
  watch: {
  },
  components: {
    BaseDialog
  },
  methods: {
    // 下拉搜索自定义查询
    filterMehod(val) {
      this.getEmployeeName(val)
    },

    // 下拉展开
    visibleChange(val) {
      if (val) {
        this.getEmployeeName()
      }
    },

    // 下拉选中负责人
    handleChangeEmployee(val) {
      let item = this.employeeOptions.find(i => i.employeeId === val)
      this.blameEmployeeName = item.cname
      Object.assign(this.createItem, {
        blameEmployeeId: val
      })
    },

    // 获取姓名
    getEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : ''
      }
      baseEmployeeListName(data).then(res => {  
        this.employeeOptions = res.data.filter(item => item.status === 'on')
      })
    },

    custFilterMehod(val) {
      this.getCustList(val)
    },
    custVisibleChange(val) {
      if (val) {
        this.getCustList()
      }
    },
    handleSelectCustid(val) {
      
    },

    // 获取发货单位
    getCustList(val = '') {
      this.$store.dispatch('dict/queryCustomerList', val).then(data => {
        let list = data.list
        this.custidOptions = list.map(o => {
          return {
            value: o.custid ? Number(o.custid) : '',
            label: this.$language=='en'?o.ename:o.name
          }
        })
      })
    },

    validate() {
      if(!this.createItem.blameEmployeeId && !this.createItem.blameSupplierId) {
        this.$message.warning('请先选择责任人或责任公司')
        return false
      }
      // if(!this.createItem.reason) {
      //   this.$message.warning('请填写取消原因')
      //   return false
      // }
      return true
    },

    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (!this.validate()) return
        this.createItem.excpId = this.oQuery.excpId
        this.close('Confirm', this.createItem)
      } else {
        this.close('Cancel')
      }
    },

    close(action, value) {
      this.$emit('close', action, value)
    }
  }
};
</script>

<style lang="scss">
.cancel-excp-form{
  .el-form-item{
    margin-bottom: 4px;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
}
</style>
