<template>
  <div class="work-cont">
     <!-- :style="{height: `${checkPointHeight}px`}" -->
    <!-- <div class="duty-link" @click="goDuty()"><i class="icon-duty"></i>查看值班人员</div> -->
    <template v-if="orderIsJoint">
      <el-collapse  v-model="workerActives">
       <el-collapse-item name="1">
        <template slot="title">
          <div class="worker-type-label">协同参与人</div>
        </template>
        <div class="work-assign-item" v-for="(item, index) in jointWorkAssign" :key="item.jobCode" :id="'work-'+item.jobCode" :class="{'warning': item.isUpdatePricing || item.isUpdateBkg}">
          <WorkAssignUserInfo :item="item" v-if="pricingHide(item)" />
          <div class="item-value invalid" v-if="pricingHide(item)">
            <span v-if="!item.show">{{item.employeeName}}</span>
            <el-select v-if="item.show" size="mini" clearable :filterable='true' :disabled="workDisabled(item) || true" v-model="item.employeeName" style="" placeholder="请选择" @visible-change="(val) => {visibleChange(val, index)}" :filter-method="(val) => {filterMehod(val, index)}" @change="(val) => {handleChangeEmployee(item, val, index)}">
              <el-option v-for="o in item.data" :key="o.employeeId" :label="o.cname" :value="o.employeeId">
              </el-option>
            </el-select>
          </div>
        </div>
       </el-collapse-item>
       <el-collapse-item name="2">
        <template slot="title">
          <div class="worker-type-label">原单参与人</div>
        </template>
        <div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode" :id="'work-'+item.jobCode" :class="{'warning': item.isUpdatePricing || item.isUpdateBkg}">
          <WorkAssignUserInfo :item="item" v-if="pricingHide(item)" />
          <div class="item-value" v-if="pricingHide(item)" :class="workDisabled(item) ? 'invalid' : ''">
            <span v-if="!item.show">{{item.employeeName}}</span>
            <el-select v-if="item.show" size="mini" clearable :filterable='true' :disabled="workDisabled(item) || selectedDisabled" v-model="item.employeeName" style="" placeholder="请选择" @visible-change="(val) => {visibleChange(val, index)}" :filter-method="(val) => {filterMehod(val, index)}" @change="(val) => {handleChangeEmployee(item, val, index)}">
              <el-option v-for="o in item.data" :key="o.employeeId" :label="o.cname" :value="o.employeeId">
              </el-option>
            </el-select>
          </div>
        </div>
       </el-collapse-item>
     </el-collapse>
    </template>

     <template v-if="!orderIsJoint" >
       <div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode" :id="'work-'+item.jobCode" :class="{'warning': item.isUpdatePricing || item.isUpdateBkg}">
          <WorkAssignUserInfo :item="item" v-if="pricingHide(item)" />
          <div class="item-value" v-if="pricingHide(item)" :class="workDisabled(item) ? 'invalid' : ''">
            <span v-if="!item.show">{{item.employeeName}}</span>
            <el-select v-if="item.show" size="mini" clearable :filterable='true' :disabled="workDisabled(item) || selectedDisabled" v-model="item.employeeName" style="" placeholder="请选择" @visible-change="(val) => {visibleChange(val, index)}" :filter-method="(val) => {filterMehod(val, index)}" @change="(val) => {handleChangeEmployee(item, val, index)}">
              <el-option v-for="o in item.data" :disabled="docDisabledItem(item, o.employeeId)" :key="o.employeeId" :label="o.label" :value="o.employeeId">
                {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
              </el-option>
            </el-select>
          </div>
        </div>
     </template>
     
    <div class="mt10">
      <div class="joint-work-item" v-if="jointAuditWorkData && Object.keys(jointAuditWorkData).length">
        <div class="item-label">{{jointAuditWorkData.jobCname}}</div>
        <div class="item-value joint-work">
          <span>{{jointAuditWorkData.employeeName}}</span>
        </div>
      </div>
      <div class="joint-work-item" v-if="jointWorkData && jointWorkData.length">
        <div class="item-label">协同岗位分配</div>
        <div class="item-value joint-work">
          <el-collapse v-model="activeNames" @change="handleChange">
            <el-collapse-item :title="item.compName" :name="index" v-for="(item, index) in jointWorkData" :key="index">
              <template slot="title">
                <div class="worker-company-name" :title="item.compName">{{item.compName}}</div>
              </template>
              <div class="joint-work-row">
                <div class="label">协同单号：</div>
                <div class="val">{{item.jointNo}}</div>
              </div>
              <div class="joint-work-row" v-if="item.jobUserList && item.jobUserList.length">
                <div class="label">协同内容：</div>
                <div class="val" v-for="(ele, index) in item.jobUserList" :key="'user' + index">
                  <WorkAssignUserInfo :item="ele" type="jointService" />
                  <div class="">
                    {{ele.employeeName}}
                  </div>
                  <div class="label">服务项：</div>
                  <div class="">{{`${ele.serviceName.toString()}` ? `${ele.serviceName.toString()}` : ''}}</div>
                </div>
              </div>
              <!-- <div v-if="item.serviceName && item.serviceName.length" class="joint-work-row">
                <div class="label">协同项：</div>
                <div class="val">
                  <span>{{item.serviceName.toString()}}</span>
                  <span v-for="(ele, index) in item.serviceName" :key="'serviceName' + index">{{index ? `,${ele}` : `${ele}`}}</span>
                </div>
              </div>
              <div v-if="item.jobUserList && item.jobUserList.length" class="joint-work-row">
                <span class="label">协同人：</span>
                <div class="val" v-for="(ele, index) in item.jobUserList" :key="'user' + index">{{ele.jobCname}}: {{ele.employeeName}}</div>
              </div> -->
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { orderWork, workAssignChange } from '@/api/order/list'
import {
  baseEmployeeList,
  baseEmployeeListName,
  employeeInfo,
  baseDeptParticipants
} from '@/api/base'
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      employeeOptions: [],
      activeNames: ['0'],
      employeeInfo: {},
      workerActives: ['1'],
      jointWorkAssign: [],
      docEditPages: ['BlList'],
      selectedDisabled: false,
      orderWorkOptions: [],
      origDocEmployeeObj: {}
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    orderStatus: {
      type: String,
      default: ''
    },
    serviceList: {
      type: Array,
      default: () => []
    },
    origWorkOptions: {
      type: Array,
      default: () => []
    },
    checkPointHeight: {
      type: Number,
      default: 500
    },
    jointAuditWorkData: {
      type: Object,
      default: () => ({})
    },
    jointWorkData: {
      type: Array,
      default: () => []
    },
    obdDeptCode: {
      type: String,
      default: ''
    }
  },
  activated() {
    // this.getOrderWork()
    this.getJoinOrderWork()
  },
  created() {
    this.orderWorkOptions = JSON.parse(JSON.stringify(this.origWorkOptions))
    if (this.origWorkOptions && this.origWorkOptions.length) {
      this.origDocEmployeeObj = this.origWorkOptions.find(item => item.jobCode === 'doc')
    }
    // console.log('参与人弹框 origDocEmployeeObj ：', this.origDocEmployeeObj)
    // this.getOrderWork()
    this.getJoinOrderWork()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.order.orderList.ordDetRole,
      order: (state) => state.order,
      compCode: (state) => state.user.compCode
    }),
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isDoc() {
      return this.ordDetRole === 'doc'
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isOpTruck() {
      return this.ordDetRole === 'op_truck'
    },
    isBd() {
      return (
        this.ordDetRole === 'bd' ||
        this.ordDetRole === 'obd' ||
        this.ordDetRole === 'asst'
      )
    },
    orderIsJoint() {
      return this.jointWorkAssign && this.jointWorkAssign.length
    }
  },
  watch: {},
  components: {
    WorkAssignUserInfo
  },
  methods: {
    docDisabledItem(item, empId){
			// doc 下拉不能选择的数据
			let result = false
			if(item.jobCode === 'doc' && item.employeeId === empId){
				result = true
			}
			return result
		},
    goDuty(){
      let routeUrl = this.$router.resolve({
				name: 'DutyList',
			})
			window.open(routeUrl.href, '_blank')
    },
    getOrderWork() {
      let { workAssign } = this.createItem
      console.log('work:', workAssign);
      console.log('this.createItem:', this.createItem)
      let workAssignArr = []
      if (this.$route.query.action === 'add') {
        this.orderWorkOptions.forEach((item) => {
          Object.assign(item, {
            show: true
          })
        })
      } else {
        // 编辑订单时参与人下拉框反显
        this.orderWorkOptions.forEach((item) => {
          Object.assign(item, {
            show: true
          })
          if (workAssign && workAssign.length) {
            workAssign.forEach((o) => {
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
      console.log('this.orderWorkOptions', this.orderWorkOptions)
    },
    getJoinOrderWork() {
      this.jointWorkAssign = []
      let { jointWorkAssign } = this.createItem
      if (this.$route.query.action === 'add') {
        this.jointWorkAssign.forEach((item) => {
          Object.assign(item, {
            show: true
          })
        })
      } else {
          jointWorkAssign && jointWorkAssign.forEach((o) => {
            this.jointWorkAssign.push({
              ...o,
              show: true
            })
          })
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

    /*
     * 商务参与人特殊处理
     * 整箱的委托订舱st01的代订舱不显示商务，客户自订不显示商务
     * 拼箱的委托订仓st03的代订仓不显示商务，客户自订不显示商务
     */
    pricingHide(item) {
      if (item.jobCode === 'pricing') {
        if (
          this.serviceList.includes('proxy_book') ||
          this.createItem.serviceType === 'st02'
        ) {
          return false
        }
        if (
          this.serviceList.includes('proxy_whbook') ||
          this.createItem.serviceType === 'st04'
        ) {
          return false
        }
      }
      return true
    },
    // 参与人下拉默认禁用，只展示
    workDisabled(item) {
      // 海运出口整箱，海运出口拼箱的提单页面可以允许修改文件
      if (['ship_export_fcl', 'ship_export_lcl'].includes(this.createItem.businessType) && this.isDoc && this.docEditPages.includes(this.$route.name) && item.jobCode === 'doc' ) {
        return false
      }
      return true
    },
    // 单个参与人修改
    handleChangeEmployee(item, val, index) {
      let itemData = (this.orderWorkOptions[index].data ? this.orderWorkOptions[index].data : []).find(ele => ele.employeeId === val)
			this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
			this.orderWorkOptions[index].employeeId = itemData ? itemData.employeeId : ''
      if (item.jobCode === 'doc' && val) {
        this.selectedDisabled = true
        this.$confirm(`是否确定将文件人员变更为 ${this.orderWorkOptions[index].employeeName}？`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.selectedDisabled = false
          workAssignChange({
            orderNo: this.$route.query.orderNo,
            jobCode: item.jobCode,
            employeeId: val
          }).then(res => {
            this.$message({
              type: 'success', 
              message: '修改文件人员成功',
              duration: 1000,
							onClose: () => {
								window.close()
              }
            })
            // let parent = this.$parent
            // while (!parent.getOrderInfo) {
            //   parent = parent['$parent']
            // }
            // parent.getOrderInfo()
          }).catch(err => {
            this.recoverDocEmployee(index)
          })
        }).catch(() => {
          this.selectedDisabled = false
          this.recoverDocEmployee(index)
          // this.getJoinOrderWork()
        })
      }
    },
    // 取消修改后恢复回原来的文件参与人
    recoverDocEmployee(index) {
      // console.log('恢复文件回原来的doc', this.origDocEmployeeObj)
			this.orderWorkOptions[index].employeeName = this.origDocEmployeeObj ? this.origDocEmployeeObj.employeeName : ''
			this.orderWorkOptions[index].employeeId = this.origDocEmployeeObj ? this.origDocEmployeeObj.employeeId : ''
    },
    // 获取员工name
    getEmployeeName(val, index) {
      let roleCode = this.orderWorkOptions[index].jobCode
      let data = {
        name: val,
        deptCode: this.obdDeptCode,
        roleCode
      }
      if (roleCode === 'pricing' || roleCode === 'eac' || roleCode === 'csc' || roleCode === 'bkg') {
        delete data.deptCode
      }
      baseDeptParticipants(data).then((res) => {
        let result = res.data.map(item => {
					let { deptCname } = item
					item.label = item.cname + deptCname ? `(${deptCname})` : ''
					return { ...item }
				})
        this.$set(this.orderWorkOptions[index], 'data', result)
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
        employeeInfo({ employeeId: employeeId }).then((res) => {
          this.employeeInfo = res.data
        })
      }
    }
  }
}
</script>

<style lang="scss">
.work-cont {
  position: relative;
  height: 100%;
  // overflow-y: auto;
  .work-assign-item {
    margin: 0 10px;
    .item-label {
      line-height: 24px;
      display: flex;
      .el-icon-postcard {
        font-size: 16px;
        margin-left: 5px;
        cursor: pointer;
        color: #409eff;
        padding-top: 4px;
      }
    }
    .item-value {
      color: #969696;
      height: 28px;
      line-height: 28px;
      &.invalid {
        pointer-events: none;
        cursor: pointer;
        .el-input__inner {
          background-color: #f5f7fa;
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
  .joint-work-item {
    background-color: #f9f9f9;
    padding: 0 10px 15px 10px;
    .item-label {
      line-height: 32px;
      font-weight: bold;
    }
  }
  .joint-work .el-collapse-item__header {
    font-size: 12px;
    height: 32px;
    line-height: 32px;
    background-color: #f9f9f9;
  }
  .joint-work .el-collapse-item__content {
    padding-bottom: 10px;
    background-color: #f9f9f9;
  }
  .joint-work .joint-work-row {
    font-size: 12px;
    .label {
      color: #999;
      line-height: 20px;
      .el-icon-postcard {
        font-size: 16px;
        margin-left: 5px;
        cursor: pointer;
        color: #409eff;
      }
    }
    .val {
      line-height: 16px;
      em {
        color: #999;
        font-style: normal;
      }
    }
  }
}
.emplpyeeName-pop {
  font-size: 12px;
}
.duty-link {
  font-size: 12px;
  color: #3e80f5;
  line-height: 16px;
  display: flex;
  align-items: center;
  padding: 4px 0;
  margin: 0 12px;
  cursor: pointer;
  border-bottom: 1px dashed #D9D9D9;
  .icon-duty{
    height: 12px;
    width: 12px;
    background: url("~@/assets/icon_duty.png")  no-repeat;
    background-size: 100% 100%;
    margin-right:3px ;
  }
}
.el-collapse-item__header {
	height: 30px;
	line-height: 30px;
	border-bottom: 1px dashed #d9d9d9;
  white-space: nowrap;
}
.el-collapse-item__header.is-active {
  	border-bottom: 1px dashed #d9d9d9;
}
.worker-type-label {
	font-weight: 600;
	line-height: 30px;
	font-size: 12px;
	padding-left: 10px;
	color: #555;
}
</style>
