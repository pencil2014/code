<template>
  <div class="work-cont" :style="{height: `${checkPointHeight}px`}">
    <div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode">
      <WorkAssignUserInfo :item="item" />
      <div class="item-value">
        <el-select
          size="mini" 
          :filterable='true' 
          :disabled="isSubmit || workDisabled(item)"
          v-model="item.employeeName"
          style=""  
          placeholder="请选择"
          @visible-change="(val) => {visibleChange(val, index)}"
          :filter-method="(val) => {filterMehod(val, index)}"
          @change="(val) => {handleChangeEmployee(val, index)}">
          <el-option v-for="o in item.data"
            :key="o.employeeId"
            :label="o.cname"
            :value="o.employeeId">
          </el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {orderWork} from '@/api/order/list'
import {baseEmployeeList, baseEmployeeListName, employeeInfo, baseDeptParticipants} from '@/api/base'
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      employeeOptions: [],
      activeNames: ['0'],
      employeeInfo: {},
      isSubmit: false, // 待审核状态
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    orderWorkOptions: {
      type: Array,
      default: () => ([])
    },
    checkPointHeight: {
      type: Number,
      default: 0
    },
    obdDeptCode: {
      type: String,
      default: ''
    }
  },
  activated() {
    this.getOrderWork() 
  },
  created() {
    // this.getOrderWork()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      currRole: state => state.user.currRole,
      order: state => state.order,
      compCode: state => state.user.compCode
    }),
    isAc() {
			return this.currRole === 'ac'
		},
    isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd' || this.currRole === 'asst'
		},
  },
  watch: {
    createItem: {
      handler(newVal, val) {
        this.isSubmit = newVal.orderStatus === 'submit' ? true : false
        console.log('this.isSubmit', this.isSubmit);
      },
      deep: true
    }
  },
  components: {
    WorkAssignUserInfo
  },
  methods: {
    getOrderWork() {
      let {workAssign} = this.createItem
      // console.log('work:', workAssign);
      let workAssignArr = []
      
      if (this.$route.query.action === 'add') {
        this.orderWorkOptions.forEach(item => {
          Object.assign(item, {
            show: true
          })
        })
      } else {
        // 编辑订单时参与人下拉框反显
        this.orderWorkOptions.forEach(item => {
          Object.assign(item, {
            show: true
          })
          if (workAssign && workAssign.length) {
            workAssign.forEach(o => {
              if (item.jobCode === o.jobCode) {
                Object.assign(item, {
                  employeeName: o.employeeName,
                  employeeId: o.employeeId
                })
              }
            })
          }
        })
      }
      console.log(this.orderWorkOptions)
    },

    filterMehod(val, index) {
      this.getEmployeeName(val, index)
    },

    visibleChange(val, index) {
      if (val) {
        this.getEmployeeName('', index)
      }
    },

    // 参与人下拉禁用设置，
    workDisabled(item) {
      // 创建订单默认禁用bd,obd,
      if (item.jobCode === 'bd' || item.jobCode === 'obd' || item.jobCode === 'asst') {
        return true
      } 
      return false
    },

    handleChangeEmployee(val, index) {
      let itemData = this.orderWorkOptions[index].data.find(ele => ele.employeeId === val)
      this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
      this.orderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
      this.orderWorkOptions[index].compCode = itemData ? itemData.companyCode : ''
      // 登录用户所在的分公司与所选商务不是同一个时，参与人订舱的值置为0
      let compCode = this.orderWorkOptions[index].compCode
      let jobCode = this.orderWorkOptions[index].jobCode
      // console.log('pricing', jobCode, this.compCode, compCode)
      if (jobCode === 'pricing' && compCode !== this.compCode) {
        this.orderWorkOptions.forEach(ele => {
          if (ele.jobCode === 'bkg') {
            ele.employeeName = ''
            ele.employeeId = 0
          }
        })
      }
    },

    // 获取员工name
    getEmployeeName(val, index) {
      let roleCode = this.orderWorkOptions[index].jobCode
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        deptCode: this.obdDeptCode,
        roleCode
      }
      if (roleCode === 'pricing') {
        delete data.deptCode
      }
      baseEmployeeListName(data).then(res => {
        this.$set(this.orderWorkOptions[index], 'data', res.data)
      })
    },

    handleChange(val) {
      console.log(val);
    },

    handleTogglePopOver(employeeId) {
      console.log('employeeId', employeeId)
      this.employeeInfo = {
        telephone: '',
        mobileNo: '',
        email: '',
        deptCname: '',
        companyCname: ''
      }
      if (employeeId) {
        employeeInfo({employeeId: employeeId}).then(res => {
          this.employeeInfo = res.data
        })
      }
    }
  }
};
</script>

<style lang="scss">
.work-cont{
  position: relative;
  height: 100%;
  overflow-y: auto;
  .work-assign-item{
    margin: 0 10px;
    .item-label{
      line-height: 24px;
      display: flex;
      .el-icon-postcard{
        font-size: 16px;
        margin-left: 5px;
        cursor: pointer;
        color: #409EFF;
        padding-top: 4px;
      }
    }
    .item-value{
      color: #969696;
      height: 28px;
      line-height: 28px;
      &.invalid{
        pointer-events: none;
        cursor: pointer;
        .el-input__inner{
          background-color: #F5F7FA;
        }
      }
    }
  }
  .joint-work-item{
    background-color: #f9f9f9;
    padding: 0 10px 15px 10px;
    .item-label{
      line-height: 32px;
      font-weight: bold;
    }
  }
  .joint-work .el-collapse-item__header{
    font-size: 12px;
    height: 32px;
    line-height: 32px;
    background-color: #f9f9f9;
  }
  .joint-work .el-collapse-item__content{
    padding-bottom: 10px;
    background-color: #f9f9f9;
  }
  .joint-work .joint-work-row{
    font-size: 12px;
    .label{
      color: #999;
    }
    .val{
      line-height: 16px;
      em{
        color: #999;
        font-style: normal;
      }
    }
  }
}
.emplpyeeName-pop{
  font-size: 12px;
}
</style>
