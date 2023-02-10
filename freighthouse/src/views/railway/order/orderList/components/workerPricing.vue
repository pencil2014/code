<template>
  <div class="work-cont" :style="{ height: `${checkPointHeight}px` }">
    <!-- 协同参与人 -->
    <el-collapse v-if="showJoint" v-model="activeNamesJoint" @change="handleChange">
      <!-- 协同 协同参与人 -->
      <el-collapse-item v-if="jointWorkAssignList.length > 0" name="joint">
        <div slot="title" class="worker-type-label">协同参与人</div>
        <div class="work-assign-item" v-for="(item, index) in jointWorkAssignList" :key="item.jobCode">
          <WorkAssignUserInfo :item="item" />
          <div class="item-value" :class="!editState ? 'invalid' : ''">
            <span v-if="!item.show">{{ item.employeeName }}</span>
            <el-select clearable v-if="item.show" size="mini" :filterable="true" v-model="item.employeeName" :disabled="jointWorkDisabled(item)" style="" placeholder="请选择" @visible-change="
								val => {
									visibleChangeJoint(val, index)
								}
							" :filter-method="
							  val => {
									filterMehodJoint(val, index)
								}
							" @change="
								val => {
									handleChangeEmployeeJoint(val, index)
								}
							">
              <el-option v-for="o in item.data" :key="o.employeeId" :label="o.cname" :value="o.employeeId">
                {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
              </el-option>
            </el-select>
          </div>
        </div>
      </el-collapse-item>
      <!-- 协同 主单参与人 -->
      <el-collapse-item v-if="orgWorkAssignList.length > 0" name="origin">
        <div slot="title" class="worker-type-label">主单参与人</div>
        <div class="work-assign-item" v-for="(item, index) in orgWorkAssignList" :key="item.jobCode">
          <WorkAssignUserInfo :item="item" />
          <div class="item-value" :class="!editStateMain ? 'invalid' : ''">
            <span v-if="!item.show">{{ item.employeeName }}</span>
            <el-select clearable v-if="item.show" size="mini" :filterable="true" :disabled="!editStateMain || workDisabledMain(item)" v-model="item.employeeName" style="" placeholder="请选择" @visible-change="
								val => {
									visibleChangeOrg(val, index)
								}
							" :filter-method="
								val => {
									filterMehodOrg(val, index)
								}
							" @change="
								val => {
									handleChangeEmployeeOrg(val, index)
								}
							">
              <el-option v-for="o in item.data" :key="o.employeeId" :label="o.cname" :value="o.employeeId">
                {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
              </el-option>
            </el-select>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <!-- 非协同参与人 -->
    <div v-else class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="item.jobCode">
      <WorkAssignUserInfo :item="item" v-if="pricingHide(item)"/>
      <div class="item-value" v-if="pricingHide(item)" :class="!editState ? 'invalid' : ''">
        <span v-if="!item.show">{{ item.employeeName }}</span>
        <el-select clearable v-if="item.show" size="mini" :filterable="true" :disabled="!editState || workDisabled(item)" v-model="item.employeeName" style="" placeholder="请选择" @visible-change="
						val => {
							visibleChange(val, index)
						}
					" :filter-method="
						val => {
							filterMehod(val, index)
						}
					" @change="
						val => {
							handleChangeEmployee(val, index)
						}
					">
          <el-option v-for="o in item.data" :key="o.employeeId" :disabled="bdAndAsstDisabledItem(item.jobCode, o.employeeId)" :label="o.cname" :value="o.employeeId">
            {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="mt10">
      <div class="joint-work-item" v-if="jointAuditWorkData && Object.keys(jointAuditWorkData).length">
        <div class="item-label">{{ jointAuditWorkData.jobCname }}</div>
        <div class="item-value joint-work">
          <span>{{ jointAuditWorkData.employeeName }}</span>
        </div>
      </div>
      <div class="joint-work-item" v-if="jointWorkData && jointWorkData.length">
        <div class="item-label">协同岗位分配</div>
        <div class="item-value joint-work">
          <el-collapse v-model="activeNames" @change="handleChange">
            <el-collapse-item :title="item.compName" :name="index" v-for="(item, index) in jointWorkData" :key="index">
              <template slot="title">
                <div class="worker-company-name" :title="item.compName">{{ item.compName }}</div>
              </template>
              <div class="joint-work-row">
                <div class="val">
                  <el-tooltip class="item" v-if="$route.query.source === 'orderList'" popper-class="copyOrderNo-pop" placement="left-start" :visible-arrow="false">
                    <div @click="copy($event,item.jointNo)" slot="content">复制</div>
                    <el-button type="text" class="jointNo-link" @click="handleToJointOrderDetail(item.jointNo)">{{ item.jointNo }}</el-button>
                  </el-tooltip>
                  <span v-else>{{ item.jointNo }}</span>
                </div>
              </div>
              <div class="joint-work-row" v-if="item.jobUserList && item.jobUserList.length">
                <div class="label">协同内容：</div>
                <div class="val" v-for="(ele, b) in item.jobUserList" :key="'user' + b">
                  <WorkAssignUserInfo :item="ele" type="jointService" />
                  <div>
                    <el-tooltip :disabled="!ele.serviceName.toString()" class="item" effect="dark" :content="`${ele.serviceName.toString()}` ? `服务项：${ele.serviceName.toString()}` : ''" placement="top-start">
                      <el-input disabled v-model="ele.employeeName"></el-input>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>
   
<script>
import { mapState } from 'vuex'
import { employeeInfo, baseDeptParticipants, railDeptCode } from '@/api/base'
import clip from '@/utils/clipboard'
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'
export default {
  data() {
    return {
      oQuery: this.$route.query,
      employeeOptions: [],
      activeNamesJoint: ['joint', 'origin'],
      activeNames: ['0'],
      employeeInfo: {}
    }
  },
  props: {
    jointAuditWorkData: {
      type: Object,
      default: () => ({})
    },
    jointWorkData: {
      type: Array,
      default: () => []
    },
    isJoint: {
      type: Boolean,
      default: false
    },
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
    orderWorkOptions: {
      type: Array,
      default: () => []
    },
    jointWorkAssignList: {
      type: Array,
      default: () => []
    },
    orgWorkAssignList: {
      type: Array,
      default: () => []
    },
    checkPointHeight: {
      type: Number,
      default: 0
    },
    obdDeptCode: {
      type: String,
      default: ''
    },
    bdDeptCode: {
			type: String,
			default: ''
		}
  },
  activated() {
    this.getOrderWork()
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState('railway', ['ordDetRole', 'overseasTipMsg', 'isCanModify']),
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      order: (state) => state.railway,
      compCode: (state) => state.user.compCode,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId,
      deptCode: (state) => state.user.deptCode,
      userEditRoles: (state) => state.railway.userEditRoles,
      orderInfoDataObj: state => state.railway.orderInfoDataObj
    }),
    // 安亮: 订单列表进去只有商务才可以看到协同参与人 20220218
    showJoint() {
      if (this.$route.query.jointNo) {
        return true //协同列表跳过来肯定显示协同参与人
      } else {
        return (
          (this.isJoint && this.isPricing) ||
          (this.jointWorkAssignList.length > 0 && this.isBkg)
        ) //商务协同的时候 或者 bkg有协同参与人的时候 显示
      }
    },
    editState() {
      let status = false
      if (!this.ordDetRole) {
        status = false
      }
      // 业务
      if (this.isBd) {
        // 草稿、已拒绝状态可修改参与人，其他状态不可修改
        if (['draft', 'refuse'].includes(this.orderStatus)) {
          status = true
        }
      }
      if (this.isPricing) {
        // 草稿、已拒绝状态可修改参与人，其他状态不可修改
        if (['submit'].includes(this.orderStatus)) {
          status = true
        }
      }
      // 操作
      if (this.isBkg) {
        if (['pass'].includes(this.orderStatus)) {
          status = true
        }
      }
      if (this.isEcs || this.isEpricing) {
        if (['pass'].includes(this.orderStatus)) {
          status = true
        }
      }
      return status
    },
    // 主单参与人
    editStateMain() {
      let status = false
      // bkg 海外业务 海外商务 可以编辑
      // if (this.isBkg || this.isEcs || this.isEpricing) {
      // 	if (['pass'].includes(this.orderStatus)) {
      // 		status = true
      // 	}
      // }
      return status
    },

    isEpricing() {
      return this.ordDetRole === 'epricing'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    isAc() {
      return this.roles.includes('ac')
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBkg() {
      return this.ordDetRole === 'bkg'
    },
    isBd() {
      return this.ordDetRole === 'bd'
    },
    isPricing() {
      return this.ordDetRole === 'pricing'
    }
  },
  watch: {},
  components: {
    WorkAssignUserInfo
  },
  methods: {
    bdAndAsstDisabledItem(type,code){
			// obd,asst 下拉不能选择的数据
			let result =false
			if(['obd','asst'].includes(type)){
				if(code== this.orderInfoDataObj.main.bdEmployeeId){
					result =true
				}
			}
			return result
		},
    jointWorkDisabled(item) {
      if (this.$route.query.source === 'jointList') {
        if (
          ['bd', 'obd', 'asst', 'pricing', 'bkg', 'csc'].includes(item.jobCode)
        ) {
          return true
        } else {
          if (this.isEpricing || this.isEcs) {
            return !['ecs', 'epricing'].includes(item.jobCode)
          } else {
            return false
          }
        }
      } else {
        if (this.isPricing) {
          return ['pricing'].includes(item.jobCode)
        }
        return false
      }
    },
    copy(e, value) {
      clip(value, e)
    },
    handleToJointOrderDetail(jointNo) {
      let routeUrl = this.$router.resolve({
        name: 'RailwayOrderDetail',
        params: {
          orderNo: this.$route.query.orderNo
        },
        query: {
          jointNo: jointNo,
          orderNo: this.$route.query.orderNo,
          source: 'jointList',
          action: this.$route.query.action,
          showBl: ['st07', 'st08'].includes(this.createItem.serviceType),
          showRelate: false
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    // jointDisabled(item) {
    // 	let state = false
    // 	if (this.isPricing) {
    // 		state = true
    // 	}
    // 	if (this.$route.query.jointNo) {
    // 		state = ['bd', 'obd', 'asst', 'pricing'].includes(item.jobCode)
    // 	}
    // 	return state
    // },
    debounceLxz(fn, time = 800) {
      clearTimeout(this.timerTr)
      this.timerTr = setTimeout(() => {
        if (!fn || !(fn instanceof Function)) {
          this.$message({
            message: '参数错误！',
            type: 'error',
            showClose: true
          })
        } else {
          fn()
        }
      }, time)
    },
    getOrderWork() {
      let { workAssign } = this.createItem
      console.log('🚀 ~ workAssign', workAssign)

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
    },

    filterMehod(val, index) {
      this.debounceLxz(() => {
        this.getEmployeeName(val, index)
      })
    },

    visibleChange(val, index) {
      if (val) {
        this.getEmployeeName('', index)
      }
    },
    // 协同 协同参与人
    filterMehodJoint(val, index) {
      this.debounceLxz(() => {
        this.getEmployeeNameJoint(val, index)
      })
    },
    visibleChangeJoint(val, index) {
      if (val) {
        this.getEmployeeNameJoint('', index)
      }
    },
    handleChangeEmployeeJoint(val, index) {
      console.log('🚀 ~ index', index)
      console.log('🚀 ~ val', val)
      console.log('🚀 ~ userId', this.userId)
      let itemData = null
      this.jointWorkAssignList[index].data &&
        (itemData = this.jointWorkAssignList[index].data.find(
          (ele) => ele.employeeId === val
        ))

      this.jointWorkAssignList[index].employeeName = itemData
        ? itemData.cname
        : ''
      this.jointWorkAssignList[index].employeeId = itemData
        ? itemData.employeeId
        : ''
      this.jointWorkAssignList[index].compCode = itemData
        ? itemData.companyCode
        : ''
    },
    getEmployeeNameJoint(val, index) {
      let roleCode = this.jointWorkAssignList[index].jobCode
      let deptCode = this.deptCode
      // 商务 操作 取铁路code
      if (roleCode === 'pricing' || roleCode === 'bkg') {
        railDeptCode().then((res) => {
          deptCode = res.data
          let data = {
            name: val ? val.replace(/^\s+|\s+$/g, '') : '',
            deptCode,
            roleCode,
            isOnlyDeptCode: true
          }

          baseDeptParticipants(data).then((res) => {
            this.$set(this.jointWorkAssignList[index], 'data', res.data)
          })
        })
      } else {
        let data = {
          name: val ? val.replace(/^\s+|\s+$/g, '') : '',
          deptCode,
          roleCode
        }
        // eac 不传deptCode
        if (roleCode === 'eac' || roleCode === 'ac') {
          delete data.deptCode
        }

        baseDeptParticipants(data).then((res) => {
          this.$set(this.jointWorkAssignList[index], 'data', res.data)
        })
      }
    },
    // 协同 主单参与人
    filterMehodOrg(val, index) {
      this.debounceLxz(() => {
        this.getEmployeeNameOrg(val, index)
      })
    },
    visibleChangeOrg(val, index) {
      if (val) {
        this.getEmployeeNameOrg('', index)
      }
    },
    handleChangeEmployeeOrg(val, index) {
      console.log('🚀 ~ index', index)
      console.log('🚀 ~ val', val)
      console.log('🚀 ~ userId', this.userId)
      let itemData = null
      this.orgWorkAssignList[index].data &&
        (itemData = this.orgWorkAssignList[index].data.find(
          (ele) => ele.employeeId === val
        ))

      this.orgWorkAssignList[index].employeeName = itemData
        ? itemData.cname
        : ''
      this.orgWorkAssignList[index].employeeId = itemData
        ? itemData.employeeId
        : ''
      this.orgWorkAssignList[index].compCode = itemData
        ? itemData.companyCode
        : ''
    },
    getEmployeeNameOrg(val, index) {
      let roleCode = this.orgWorkAssignList[index].jobCode
      let deptCode = this.deptCode
      // 商务 操作 取铁路code
      if (roleCode === 'pricing' || roleCode === 'bkg') {
        railDeptCode().then((res) => {
          deptCode = res.data
          let data = {
            name: val ? val.replace(/^\s+|\s+$/g, '') : '',
            deptCode,
            roleCode,
            isOnlyDeptCode: true
          }

          baseDeptParticipants(data).then((res) => {
            this.$set(this.orgWorkAssignList[index], 'data', res.data)
          })
        })
      } else {
        let data = {
          name: val ? val.replace(/^\s+|\s+$/g, '') : '',
          deptCode,
          roleCode
        }
        // eac 不传deptCode
        if (roleCode === 'eac' || roleCode === 'ac') {
          delete data.deptCode
        }
        if (roleCode === 'epricing' || roleCode === 'ecs') {
          delete data.deptCode
          if (
            this.createItem.main.overseasServiceType === 'company' &&
            this.createItem.main.overseasCompanyCode
          ) {
            data.deptCode = this.createItem.main.overseasCompanyCode
          }
        }

        baseDeptParticipants(data).then((res) => {
          this.$set(this.orgWorkAssignList[index], 'data', res.data)
        })
      }
    },

    /*
     * 商务参与人特殊处理
     * 整箱的委托订舱st07的代订舱不显示商务，客户自订不显示商务
     * 拼箱的委托订仓st03的代订仓不显示商务，客户自订不显示商务
     */
    pricingHide(item) {
      if (item.jobCode === 'pricing') {
        if (this.serviceList.includes('proxy_book')) {
          return false
        }
        if (this.serviceList.includes('proxy_whbook')) {
          return false
        }
      }
      return true
    },
    noCanSelect(item) {
			console.log('20220906', this.noCanSelectEcsAndEpricing, item.jobCode)
      if (this.noCanSelectEcsAndEpricing && ['ecs', 'epricing'].includes(item.jobCode)) {
			  // 0906 海运出口整箱，海运出口拼箱，散杂滚装出口，在没有选择目的港服务项时不能选择海外客服、海外商务参与人
				return true
			}
			return false
		},
    // 参与人下拉禁用设置，
    workDisabled(item) {
      // 业务禁用bd,
      if (this.isBd) {
        if (item.jobCode === 'bd') {
					return true
				} else if (item.jobCode === 'obd' || item.jobCode === 'asst') {
					// 建单时当前登录人不是当前销售，则OBD和下单助理不可编辑，否则可以编辑
					if(this.orderInfoDataObj.main.bdEmployeeId == this.userId){
						return false
					} else{
						return true
					}
				} else {
          return false
        }
      }
      if (this.isPricing) {
        return true
      }

      // 操作禁用bd,obd,asst,pricing
      if (this.isBkg) {
        // this.overseasTipMsg ||  0331
        // if (!this.isCanModify) {
        // 	return ['bd', 'obd', 'asst', 'pricing', 'ecs', 'epricing'].includes(item.jobCode)
        // }
        return ['bd', 'obd', 'asst', 'pricing'].includes(item.jobCode)
      }
      console.log(this.isEcs)
      if (this.isEpricing || this.isEcs) {
        return !['ecs', 'epricing'].includes(item.jobCode)
      }
    },
    // 主单参与人下拉禁用设置，
    workDisabledMain(item) {
      // 禁用除海外客服 海外商务之外的参与人 this.isEpricing || this.isEcs ||
      // if (this.isBkg) {
      // 	// 有同分公司或海外代理费用录入时，不能编辑；海外服务类型审核期间，也是不能编辑  // this.overseasTipMsg ||  0331
      // 	if (!this.isCanModify) return true

      // 	return !['ecs', 'epricing'].includes(item.jobCode)
      // }
      return true
    },
    handleChangeEmployee(val, index) {
      console.log('🚀 ~ index', index)
      console.log('🚀 ~ val', val)
      console.log('🚀 ~ userId', this.userId)
      let itemData = null
      this.orderWorkOptions[index].data &&
        (itemData = this.orderWorkOptions[index].data.find(
          (ele) => ele.employeeId === val
        ))

      this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
      this.orderWorkOptions[index].employeeId = itemData
        ? itemData.employeeId
        : ''
      this.orderWorkOptions[index].compCode = itemData
        ? itemData.companyCode
        : ''
    },

    // 获取员工name
    getEmployeeName(val, index) {
      let roleCode = this.orderWorkOptions[index].jobCode
      let deptCode = this.obdDeptCode
      // 商务 操作 取铁路code
      if (roleCode === 'pricing' || roleCode === 'bkg') {
        railDeptCode().then((res) => {
          deptCode = res.data
          let data = {
            name: val ? val.replace(/^\s+|\s+$/g, '') : '',
            deptCode,
            roleCode,
            isOnlyDeptCode: true
          }

          baseDeptParticipants(data).then((res) => {
            this.$set(this.orderWorkOptions[index], 'data', res.data)
          })
        })
      } else {
        let data = {
          name: val ? val.replace(/^\s+|\s+$/g, '') : '',
          deptCode,
          roleCode
        }
        // eac 不传deptCode
        if (roleCode === 'eac' || roleCode === 'ac') {
          delete data.deptCode
        }
        if (roleCode === 'obd') {
          // 2、OBD不限制公司
          delete data.deptCode
        }
        if (roleCode === 'asst') {
          // 3、下单助理和销售同公司
          data.deptCode =this.bdDeptCode
        }
        // if (roleCode === 'epricing' || roleCode === 'ecs') {
        // 	delete data.deptCode
        // 	if (this.createItem.main.overseasServiceType === 'company' && this.createItem.main.overseasCompanyCode) {
        // 		data.deptCode = this.createItem.main.overseasCompanyCode
        // 	}
        // }

        baseDeptParticipants(data).then((res) => {
          this.$set(this.orderWorkOptions[index], 'data', res.data)
        })
      }
    },

    handleChange(val) {},

    handleTogglePopOver(employeeId) {
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
.el-collapse-item__header {
  height: 30px;
  line-height: 30px;
  border-bottom: 1px dashed #d9d9d9;
}
.worker-type-label {
  font-weight: 600;
  line-height: 30px;
  font-size: 12px;
  padding-left: 10px;
  color: #555;
}
.work-cont {
  position: relative;
  height: 100%;
  overflow-y: auto;
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
      .jointNo-link {
        font-size: 12px;
        text-decoration: underline;
        padding: 5px 0px;
      }
      .el-input {
        font-size: 12px;
      }
    }
  }
}
.emplpyeeName-pop {
  font-size: 12px;
}
.copyOrderNo-pop.is-dark {
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
  padding: 2px 5px;
}
</style>
