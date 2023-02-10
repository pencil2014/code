<template>
  <div class="book-work-cont" :style="{height: `${workAssignHeight}px`}">
    <div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode" :class="{'warning': item.isUpdateBkg}">
      <div class="item-label">
        <span>{{item.jobCname}}</span>
        <el-popover
          popper-class="emplpyeeName-pop"
          placement="left"
          width="240"
          trigger="click">
          <div class="employeeName-list">
            <ul>
              <li v-if="employeeInfo.telephone">座机号：{{employeeInfo.telephone}}</li>
              <li v-else>手机号：{{employeeInfo.mobileNo}}</li>
              <li>邮箱：{{employeeInfo.email}}</li>
              <li>部门：{{employeeInfo.deptCname}}</li>
              <li>公司：{{employeeInfo.companyCname}}</li>
            </ul>
          </div>
          <i slot="reference" class="el-icon-postcard" @click="handleTogglePopOver(item.employeeId)"></i>
        </el-popover>
      </div>
      <div class="item-value">
        <el-select 
          size="mini"
          :filterable='true' 
          :disabled="workDisabled(item) || selectedDisabled"
          v-model="item.employeeName"
          style=""  
          placeholder="请选择"
          @visible-change="(val) => {visibleChange(val, index)}"
          :filter-method="(val) => {filterMehod(val, index)}"
          @change="(val) => {handleChangeEmployee(item, val, index)}">
          <el-option v-for="(o, i) in item.data"
            :key="o.employeeId + '-'+i"
            :label="o.employeeName"
            :value="o.employeeId">
            {{o.cname}}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{o.deptCname}})</em>
          </el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {orderWork} from '@/api/order/list'
import {baseEmployeeList, baseEmployeeListName, employeeInfo, baseDeptParticipants, SystemLineManager} from '@/api/base'
import { truckLoadDelete } from '@/api/railway/shippingTruck';

export default {
  data() {
    return {
      selectedDisabled: false,
      oQuery: this.$route.query,
      employeeOptions: [],
      activeNames: ['0'],
      employeeInfo: {},
      SystemLineManagerList: []
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
    workAssignHeight: {
      type: Number,
      default: 0
    },
    soList: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
    // this.getOrderWork()
    this.sysLineManagerList()
  },
  mounted() {

  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      order: state => state.order,
      userInfo: state => state.user.userInfo,
      userId: state => state.user.userId
    }),
    roles() {
			let roles = this.$route.query.roles ? this.$route.query.roles.split(',') : []
			return roles
		},
    isBkg() {
			return this.roles.includes('bkg')
    },
    isPricing() {
			return this.roles.includes('pricing')
		},
  },
  watch: {
  },
  components: {
    
  },
  methods: {
    // getOrderWork() {
    //   debugger
    //   let {workAssign} = this.createItem
    //   console.log('work:', workAssign);
    //   let workAssignArr = []
      
    //   if (this.$route.query.action === 'add') {
    //     this.orderWorkOptions.forEach(item => {
    //       Object.assign(item, {
    //         show: true
    //       })
    //     })
    //   } else {
    //     // 编辑订单时参与人下拉框反显
    //     this.orderWorkOptions.forEach(item => {
    //       Object.assign(item, {
    //         show: true
    //       })
    //       if (workAssign && workAssign.length) {
    //         workAssign.forEach(o => {
    //           if (item.jobCode === o.jobCode) {
    //             Object.assign(item, {
    //               employeeName: o.employeeName,
    //               employeeId: o.employeeId
    //             })
    //           }
    //         })
    //       }
    //     })
    //   }
    //   // console.log(this.orderWorkOptions)
    // },
    // 航线经理列表
		sysLineManagerList() {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: []
			}
			SystemLineManager(data).then(res => {
				let {data} = res
				// 过滤掉空的系统航线
				this.SystemLineManagerList = data.list.filter(item => item.sysLineCode).map(ele => {
          return {...ele, employeeId: ele.managerId, employeeName: ele.managerName, cname: ele.managerName}
        })
			})
		},
    // 参与人下拉禁用设置，
    workDisabled(item) {
      if (this.isPricing) {
        let {auditEmployeeId, orgAuditEmployeeId} = this.createItem
        // 加柜的不可编辑
        if (this.createItem.containerModifyInfo && Object.keys(this.createItem.containerModifyInfo).length) {
          return true
        }
        // 有协助审核人并且原审核人是登录用户的不可编辑
				if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== orgAuditEmployeeId && orgAuditEmployeeId === this.userId) {
          return true
        }
        // pricing 未审核的、订舱拒绝的可以编辑修改商务人员。
        if (item.jobCode === 'pricing' && ['submit','book_refuse'].includes(this.createItem.bkgStatus)) {
          return false
        }
        // pricing 未审核的、订舱拒绝的可以编辑修改商务人员。
        if (item.jobCode === 'bkg' && ['submit','book_refuse'].includes(this.createItem.bkgStatus)) {
          return false
        }
        return true
      }
      // bkg未订舱并且so为空的可编辑修改订舱人员
      if (this.isBkg) {
        if (item.jobCode === 'bkg' && this.createItem.bkgStatus === 'pass' && this.soList.length === 0) {
          return false
        }
        return true
      }
    },
    filterMehod(val, index) {
      this.getEmployeeName(val, index)
    },

    visibleChange(val, index) {
      if (val) {
        this.getEmployeeName('', index)
      }
    },
    // 切换bkg参与人
    handleChangeEmployee(item, val, index) {
      // console.log('item, val', item, val, index)
      // pricng角色修改订舱人员
      if (this.isPricing && item.jobCode === 'bkg') {
        item.isUpdateBkg = false
        this.$emit('changeBkg', val)
      }
      // bkg角色修改订舱人员
      if (this.isBkg && item.jobCode === 'bkg' && val) {
        /*
          *el-select选择下拉后弹出确认框，当关闭确认框后会自动获取焦点并触发visibleChange事件显示下拉
          *解决办法：在change事件触发后给el-select设置禁用disabled为ture,关闭弹窗后设置为false
        */
        this.selectedDisabled = true
        this.$confirm('是否要修改订舱人员？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectedDisabled = false
          this.$emit('changeBkg', val)
        }).catch(action => {
          this.selectedDisabled = false
          this.$emit('init')
        })
      }
      if (item.jobCode === 'pricing' && val) {
        this.selectedDisabled = true
        this.$confirm('是否要修改商务人员？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectedDisabled = false
          this.$emit('changePricing', val)
        }).catch(action => {
          this.selectedDisabled = false
          this.$emit('init')
        })
      }
    },

    // 获取员工name
    getEmployeeName(val, index) {
      let roleCode = this.orderWorkOptions[index].jobCode
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        deptCode: this.userInfo.deptCode,
        roleCode
      }
      // 商务下拉可选择所有，不用限制结算分公司
      if (roleCode === 'pricing') {
        delete data.deptCode
        // 业务自拿请求航线经理列表
        if (this.createItem.ship.priceType === 'bd') {
          this.$set(this.orderWorkOptions[index], 'data', this.SystemLineManagerList)
          return
        }
      }
      baseDeptParticipants(data).then(res => {
        let list = res.data.map(item => {
          let {deptCname, cname, employeeId} = item
          // item.label = cname + deptCname ? `(${deptCname})` : ''
          // item.value = employeeId
          return {...item, label: cname + deptCname ? `(${deptCname})` : '', employeeName: cname}
        })
        // let list = res.data.map(ele => {
        //   return {...ele, label: ele.cname, value: ele.employeeId}
        // })
        this.$set(this.orderWorkOptions[index], 'data', list)
      })
    },

    handleChange(val) {
      // console.log(val);
    },

    handleTogglePopOver(employeeId) {
      // console.log('employeeId', employeeId)
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
.book-work-cont{
  position: relative;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
  .work-assign-item{
    margin: 0 10px;
    .item-label{
      line-height: 20px;
      display: flex;
      margin-top: 2px;
      .el-icon-postcard{
        font-size: 16px;
        margin-left: 5px;
        cursor: pointer;
        color: #409EFF;
        padding-top: 3px;
      }
    }
    .item-value{
      color: #969696;
      height: 20px;
      line-height: 20px;
      // margin-top: 2px;
      &.invalid{
        pointer-events: none;
        cursor: pointer;
        .el-input__inner{
          background-color: #F5F7FA;
        }
      }
    }
    &.warning {
      .item-value .el-input__inner {
        border: 1px solid #e9851f;
        box-shadow: 0px 0px 0px 2px #fdf2e8;
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
      line-height: 20px;
      .el-icon-postcard{
        font-size: 16px;
        margin-left: 5px;
        cursor: pointer;
        color: #409EFF;
      }
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
