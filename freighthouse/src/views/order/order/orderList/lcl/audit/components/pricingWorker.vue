<template>
  <div class="audit-book-work-cont" :style="{height: `${workAssignHeight}px`}">
    <div class="duty-link" @click="goDuty()"><i class="icon-duty"></i>查看值班人员</div>
    <el-collapse v-if="orderIsJoint === 'Y'" v-model="workerActives">
      <el-collapse-item name="1">
        <template slot="title">
          <div class="worker-type-label">协同参与人</div>
        </template>
        <div class="work-assign-item" v-for="(item, index) in jointOrderWorkOptions" :key="item.jobCode" :class="{'warning': item.isUpdate}">
          <WorkAssignUserInfo :item="item"/>
          <div class="item-value">
            <el-select 
              size="mini"
              :filterable='true' 
              clearable
              :disabled="jointWorkDisabled(item) || selectedDisabled"
              v-model="item.employeeName"
              style=""  
              placeholder="请选择"
              @visible-change="(val) => {visibleChange(val, index, 'isJoint')}"
              :filter-method="(val) => {filterMehod(val, index, 'isJoint')}"
              @clear="handleClearJointEmployee(item, index)"
              @change="(val) => {handleChangeJointEmployee(item, val, index)}">
              <el-option v-for="(o, i) in item.data"
                :key="o.employeeId + '-'+i"
                :label="o.employeeName"
                :value="o.employeeId">
                {{o.cname}}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{o.deptCname}})</em>
              </el-option>
            </el-select>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template slot="title">
          <div class="worker-type-label">原单参与人</div>
        </template>
        <div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode">
          <WorkAssignUserInfo :item="item"/>
          <div class="item-value">
            <el-select 
              size="mini"
              :filterable='true' 
              :disabled="origJointWorkDisabled(item) || selectedDisabled"
              v-model="item.employeeName"
              style=""
              class="audit-worker-class"  
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
      </el-collapse-item>
    </el-collapse>
    <div v-else class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode" :class="{'warning': item.isUpdate}">
      <WorkAssignUserInfo :item="item"/>
      <div class="item-value">
        <el-select 
          size="mini"
          :filterable='true' 
          clearable
          :disabled="workDisabled(item) || selectedDisabled"
          v-model="item.employeeName"
          style=""  
          placeholder="请选择"
          @visible-change="(val) => {visibleChange(val, index)}"
          :filter-method="(val) => {filterMehod(val, index)}"
          @clear="handleClearEmployee(item, index)"
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
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'

export default {
  data() {
    return {
      selectedDisabled: false,
      oQuery: this.$route.query,
      employeeOptions: [],
      activeNames: ['0'],
      employeeInfo: {},
      SystemLineManagerList: [],
      workerActives: '1',
      timerTr: null
    }
  },
  props: {
    obdDeptCode: {
      type: String,
      default: ''
    },
    jointOrderWorkOptions: {
      type: Array,
      default: () => []
    },
    orderIsJoint: {
      type: String,
      default: ''
    },
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
      userId: state => state.user.userId,
      roles: state => state.user.roles
    }),
    // roles() {
		// 	let roles = this.$route.query.roles ? this.$route.query.roles.split(',') : []
		// 	return roles
		// },
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
    WorkAssignUserInfo
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
        let {auditEmployeeId, orgAuditEmployeeId} = this.createItem.lcl
        // 有协助审核人并且原审核人是登录用户的不可编辑
				if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== orgAuditEmployeeId && orgAuditEmployeeId === this.userId) {
          return true
        }
        // pricing 未审核的、订舱拒绝的可以编辑修改订舱、操作、航线客服、文件等参与人。
        if (['bkg', 'op', 'line_cs', 'doc'].includes(item.jobCode) && ['submit','book_refuse'].includes(this.createItem.orderStatus)) {
          return false
        }
        return true
      }
      // // bkg未订舱并且so为空的可编辑修改订舱人员
      // if (this.isBkg) {
      //   if (item.jobCode === 'bkg' && this.createItem.bkgStatus === 'pass' && this.soList.length === 0) {
      //     return false
      //   }
      //   return true
      // }
    },
    origJointWorkDisabled(item) {
      if (this.isPricing && item.jobCode === 'pricing') {
        let {auditEmployeeId, orgAuditEmployeeId} = this.createItem
        // 加柜的不可编辑
        if (this.createItem.reqType === 'add') {
          return true
        }
        // 有协助审核人并且原审核人是登录用户的不可编辑
				if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== orgAuditEmployeeId && orgAuditEmployeeId === this.userId) {
          return true
        }
        // pricing 未审核的、订舱拒绝的可以编辑
        if (!['submit','book_refuse'].includes(this.createItem.orderStatus)) {
          return true
        }
        return false
      }
      return true
    },
    // 协同参与人下拉禁用设置
    jointWorkDisabled(item) {
      if (this.isPricing) {
        let {auditEmployeeId, orgAuditEmployeeId} = this.createItem.lcl
        // 加柜的不可编辑
        if (this.createItem.reqType === 'add') {
          return true
        }
        // 有协助审核人并且原审核人是登录用户的不可编辑
				if (auditEmployeeId && orgAuditEmployeeId && auditEmployeeId !== orgAuditEmployeeId && orgAuditEmployeeId === this.userId) {
          return true
        }
        // pricing 未审核的、订舱拒绝的除了商务其他都可以编辑
        if (!['submit','book_refuse'].includes(this.createItem.orderStatus) || item.jobCode === 'pricing') {
          return true
        }
        return false
      }
      // // bkg未订舱并且so为空的可编辑修改订舱人员
      // if (this.isBkg) {
      //   if (item.jobCode === 'bkg' && this.createItem.bkgStatus === 'pass' && this.soList.length === 0) {
      //     return false
      //   }
      //   return true
      // }
    },
    debounceLxz(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
    filterMehod(val, index, type) {
      this.debounceLxz(() => {
         if (type === 'isJoint') {
            this.getJointEmployeeName(val, index)
          } else {
            this.getEmployeeName(val, index)
          }
      })
    },
    visibleChange(val, index, type) {
      if (type === 'isJoint') {
        if (val) {
          this.getJointEmployeeName('', index)
        }
      } else {
        if (val) {
          this.getEmployeeName('', index)
        }
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
      let itemData = (this.orderWorkOptions[index].data ? this.orderWorkOptions[index].data : []).find(ele => ele.employeeId === val)
			this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
      this.orderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
      this.$emit('changeEmployeeId', {
        jobCode: item.jobCode,
        employeeId: this.orderWorkOptions[index].employeeId,
        employeeName: item.employeeName
      })
      // // bkg角色修改订舱人员
      // if (this.isBkg && item.jobCode === 'bkg' && val) {
      //   /*
      //     *el-select选择下拉后弹出确认框，当关闭确认框后会自动获取焦点并触发visibleChange事件显示下拉
      //     *解决办法：在change事件触发后给el-select设置禁用disabled为ture,关闭弹窗后设置为false
      //   */
      //   this.selectedDisabled = true
      //   this.$confirm('是否要修改订舱人员？', '警告', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     this.selectedDisabled = false
      //     this.$emit('changeBkg', val)
      //   }).catch(action => {
      //     this.selectedDisabled = false
      //     this.$emit('init')
      //   })
      // }
      if (item.jobCode === 'pricing' && val) {
        this.selectedDisabled = true
        this.$confirm('是否要修改商务人员？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectedDisabled = false
          this.$emit('changePricing', {jobCode: 'pricing', employeeId: val})
        }).catch(action => {
          this.selectedDisabled = false
          this.$emit('init')
        })
      }
    },
    handleChangeJointEmployee(item, val, index) {
      // pricng角色修改订舱人员
      if (this.isPricing && item.jobCode === 'bkg') {
        this.$emit('changeBkg', val)
      }
      // // bkg角色修改订舱人员
      // if (this.isBkg && item.jobCode === 'bkg' && val) {
      //   /*
      //     *el-select选择下拉后弹出确认框，当关闭确认框后会自动获取焦点并触发visibleChange事件显示下拉
      //     *解决办法：在change事件触发后给el-select设置禁用disabled为ture,关闭弹窗后设置为false
      //   */
      //   this.selectedDisabled = true
      //   this.$confirm('是否要修改订舱人员？', '警告', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     this.selectedDisabled = false
      //     this.$emit('changeBkg', val)
      //   }).catch(action => {
      //     this.selectedDisabled = false
      //     this.$emit('init')
      //   })
      // }
			let itemData = (this.jointOrderWorkOptions[index].data ? this.jointOrderWorkOptions[index].data : []).find(ele => ele.employeeId === val)
			this.jointOrderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
      this.jointOrderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
      this.$emit('changeEmployeeId', {
        jobCode: item.jobCode,
        employeeId: this.jointOrderWorkOptions[index].employeeId,
        employeeName: item.employeeName
      })
			// console.log('pricing', jobCode, this.compCode, compCode)
    },
    handleClearJointEmployee(item, index) {
      this.jointOrderWorkOptions[index].employeeName = ''
			this.jointOrderWorkOptions[index].employeeId = ''
    },
    handleClearEmployee(item, index) {
      this.orderWorkOptions[index].employeeName = ''
			this.orderWorkOptions[index].employeeId = ''
    },
    // 获取员工name
		getJointEmployeeName(val, index) {
			let roleCode = this.jointOrderWorkOptions[index].jobCode
			// console.log('🚀 ~ roleCode', roleCode)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				deptCode: this.userInfo.deptCode,
				roleCode
      }
      if (roleCode === 'ac' || roleCode === 'eac') {
				// 应收财务和海外应收财务不限制公司
				delete data.deptCode
			}
			// if (roleCode === 'pricing' || roleCode === 'eac' || roleCode === 'csc' || roleCode === 'bkg') {
			// 	delete data.deptCode
			// }
			// // 进口操作放开同公司
			// if (roleCode === 'op' && ['ship_import_fcl', 'ship_import_lcl'].includes(this.createItem.businessType)) {
			// 	delete data.deptCode
			// }
			baseDeptParticipants(data).then(res => {
				let result = res.data.map(item => {
					let { deptCname } = item
					item.label = item.cname + deptCname ? `(${deptCname})` : ''
					return { ...item }
				})
				// console.log('result', result)
				this.$set(this.jointOrderWorkOptions[index], 'data', result)
			})
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
      if (roleCode === 'ac' || roleCode === 'eac') {
				// 应收财务和海外应收财务不限制公司
				delete data.deptCode
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
    },
    goDuty() {
			let routeUrl = this.$router.resolve({
				name: 'DutyList'
			})
			window.open(routeUrl.href, '_blank')
		},
  }
};
</script>

<style lang="scss">
.audit-book-work-cont{
  position: relative;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
  .duty-link {
    font-size: 12px;
    color: #3e80f5;
    line-height: 16px;
    display: flex;
    align-items: center;
    padding: 4px 0;
    margin: 0 12px;
    cursor: pointer;
    border-bottom: 1px dashed #d9d9d9;
    .icon-duty {
      height: 12px;
      width: 12px;
      background: url('~@/assets/icon_duty.png') no-repeat;
      background-size: 100% 100%;
      margin-right: 3px;
    }
  }
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
      .audit-worker-class {
        /deep/.el-input--suffix .el-input__inner {
          height: 20px !important;
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
    padding: 0;
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
