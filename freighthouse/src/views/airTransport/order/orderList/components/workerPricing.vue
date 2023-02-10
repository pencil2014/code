<template>
  <div class="work-cont air-work-cont" :style="{height: `${checkPointHeight}px`,'padding-bottom':'80px'}">
    <div class="duty-link" @click="goDuty()"><i class="icon-duty"></i>查看值班人员</div>
    <el-collapse v-if="orderIsJoint" v-model="workerActives">
      <el-collapse-item name="1">
        <template slot="title">
          <div class="worker-type-label">协同参与人</div>
        </template>
        <div class="work-assign-item" v-for="(item, index) in joinOrderWorkOptions" :key="index">
          <WorkAssignUserInfo :item="item" />
          <div class="item-value">
            <span v-if="!item.show">{{item.employeeName}}</span>
            <el-select v-if="item.show" clearable size="mini" :disabled="((orderStatus!=='submit' || pricingAuditEmployeeDisabled) && !$route.query.jointNo) || jointWorkDisabled(item)" filterable remote v-model="item.employeeName" style="" placeholder="请选择" @visible-change="(val) => {visibleJoinChange(val, index)}" :remote-method="(val) => {filterJoinMehod(val, index)}" @change="(val) => {handleChangeJoinEmployee(val, index)}">
              <el-option v-for="(o,a) in item.data" :key="a" :label="o.cname" :value="o.employeeId">
                {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
              </el-option>
            </el-select>
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template slot="title">
          <div class="worker-type-label">原单参与人</div>
        </template>
        <div class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="index">
          <WorkAssignUserInfo :item="item" />
          <div class="item-value" v-if="pricingHide(item)" :class="workDisabled(item) ? 'invalid' : ''">
            <span v-if="!item.show">{{item.employeeName}}</span>
            <el-select v-if="item.show" clearable size="mini" filterable remote disabled v-model="item.employeeName" style="" placeholder="请选择" @visible-change="(val) => {visibleChange(val, index)}" :remote-method="(val) => {filterMehod(val, index)}" @change="(val) => {handleChangeEmployee(val, index)}">
              <el-option v-for="(o,a) in item.data" :key="a" :label="o.cname" :value="o.employeeId">
                {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
              </el-option>
            </el-select>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div v-else class="work-assign-item" v-for="(item, index) in orderWorkOptions" :key="index">
      <WorkAssignUserInfo :item="item" v-if="pricingHide(item)"/>
      <div class="item-value" v-if="pricingHide(item)" :class="workDisabled(item) ? 'invalid' : ''">
        <span v-if="!item.show">{{item.employeeName}}</span>
        <el-select v-if="item.show" clearable size="mini" filterable remote :disabled="workDisabled(item) || pricingAuditEmployeeDisabled" v-model="item.employeeName" style="" placeholder="请选择" @visible-change="(val) => {visibleChange(val, index)}" :remote-method="(val) => {filterMehod(val, index)}" @change="(val) => {handleChangeEmployee(val, index)}">
          <el-option v-for="(o,a) in item.data" :key="a" :label="o.cname" :value="o.employeeId">
            {{ o.cname }}<em v-if="o.deptCode" style="color: #999;font-style: normal">({{ o.deptCname }})</em>
          </el-option>
        </el-select>
      </div>
    </div>
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
            <el-collapse-item :name="index" v-for="(item, index) in jointWorkData" :key="index">
              <template slot="title">
                <div class="worker-company-name" :title="item.compName">{{item.compName}}</div>
              </template>
              <div class="joint-work-row">
                <div class="val">{{ item.jointNo }}</div>
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
import { employeeInfo, baseDeptParticipants } from '@/api/base'
import WorkAssignUserInfo from '@/views/order/order/components/workAssignUserInfo'

export default {
  data() {
    return {
      oQuery: this.$route.query,
      employeeOptions: [],
      activeNames: ['0'],
      employeeInfo: {},
      workerActives: ['1'],
      timerTr: null
    }
  },
  props: {
    pricingAuditEmployeeDisabled: {
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
    joinOrderWorkOptions: {
      type: Array,
      default: () => []
    },
    checkPointHeight: {
      type: Number,
      default: 0
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
    },
    bdDeptCode: {
      type: String,
      default: ''
    },
    asstDeptCode: {
      type: String,
      default: ''
    },
    orderIsJoint: {
      type: Boolean,
      default: false
    }
  },
  activated() {
    this.getOrderWork()
  },
  created() {
    // this.getOrderWork()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      order: (state) => state.order,
      compCode: (state) => state.user.compCode,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userInfo: (state) => state.user.userInfo,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
    }),
    ecsId() {
      let workAssign = []
      if (this.$route.query.source !== 'jointList') {
        workAssign = this.airOrderInfo.workAssign
      } else {
        workAssign = this.airOrderInfo.jointWorkAssign
      }
      let asstItem = workAssign && workAssign.find((el) => el.jobCode === 'ecs')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    epricingId() {
      let { workAssign } = this.airOrderInfo
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'epricing')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    isEpricing() {
      return this.ordDetRole === 'epricing'
    },
    editState() {
      let status = false
      // 协同单不可修改参与人，
      if (this.$route.query.source === 'jointList') {
        // status = false
        if (this.createItem.businessType === 'air_import') {
          status = true
        } else {
          status = false
        }
      } else {
        // 业务
        if (this.isBd) {
          // 草稿、已拒绝状态可修改参与人，其他状态不可修改
          if (['draft', 'refuse'].includes(this.orderStatus)) {
            status = true
          } else {
            status = false
          }
        }
        // 操作
        if (this.isOp) {
          if (['pass'].includes(this.orderStatus)) {
            status = true
          }
        }
        if (this.isPricing) {
          if (['draft', 'refuse', 'submit'].includes(this.orderStatus)) {
            status = true
          }
        }
      }
      return status
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      if (this.userEditRoles.length === 0) {
        return (
          !this.isPricing &&
          (((this.roles.includes('bd') ||
            this.roles.includes('obd') ||
            this.roles.includes('asst')) &&
            (this.roles.includes('manager') || this.roles.includes('duty'))) ||
            this.bdId === this.userId ||
            this.obdId === this.userId ||
            this.asstId === this.userId ||
            !this.bdId)
        )
      } else {
        return this.ordDetRole === 'bd'
      }
    },
    isPricing() {
      if (
        this.userEditRoles.length === 1 &&
        this.userEditRoles[0] === 'pricing' &&
        this.ordDetRole === 'pricing'
      ) {
        return true
      }
      if (this.userEditRoles.length === 0) {
        if (this.roles.includes('pricing')) {
          if (['draft', 'refuse'].includes(this.orderStatus)) {
            if (
              this.userId == this.currentPricingId &&
              (this.bdId === this.userId ||
                this.obdId === this.userId ||
                this.asstId === this.userId ||
                !this.bdId)
            ) {
              // 草稿状态下，参与人商务是登录人,展示商务视图
              return true
            } else {
              // 有商务角色，但是参与人商务不是登录人，这是不需要他审核订单，也不展示商务视图
              return false
            }
          } else {
            // 其他状态
            if (
              this.userId == this.currentPricingId ||
              (this.roles.includes('pricing') &&
                (this.roles.includes('manager') || this.roles.includes('duty')))
            ) {
              // 如果登录人id是商务参与人
              return true
            } else if (
              this.userId == this.bdId ||
              this.userId == this.obdId ||
              this.userId == this.asstId
            ) {
              return false
            } else {
              return false
            }
          }
        } else {
          return false
        }
      } else {
        return this.ordDetRole === 'pricing'
      }
    },
    bdId() {
      let { workAssign } = this.createItem
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
    obdId() {
      let { workAssign } = this.createItem
      let obdItem = workAssign && workAssign.find((el) => el.jobCode === 'obd')
      if (obdItem && obdItem.employeeId) {
        return obdItem.employeeId
      }
      return ''
    },
    asstId() {
      let { workAssign } = this.createItem
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'asst')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    currentPricingId() {
      // 当前选择的商务
      let list = this.orderWorkOptions.map((item) => {
        return {
          jobCode: item.jobCode,
          employeeId: item.employeeId ? item.employeeId : 0
        }
      })
      let pricingItem = list.find((e) => e.jobCode === 'pricing')
      if (pricingItem) {
        return pricingItem.employeeId
      } else {
        return ''
      }
    }
  },
  watch: {},
  components: {
    WorkAssignUserInfo
  },
  methods: {
    // 协同参与人下拉禁用设置
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
    goDuty() {
      let routeUrl = this.$router.resolve({
        name: 'DutyList'
      })
      window.open(routeUrl.href, '_blank')
    },
    getOrderWork() {
      let { workAssign } = this.createItem
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
    filterJoinMehod(val, index) {
      this.debounceLxz(() => {
        this.getJoinEmployeeName(val, index)
      })
    },

    visibleJoinChange(val, index) {
      if (val) {
        this.getJoinEmployeeName('', index)
      }
    },

    /*
     * 商务参与人特殊处理
     * 整箱的委托订舱st01的代订舱不显示商务，客户自订不显示商务
     * 拼箱的委托订仓st03的代订仓不显示商务，客户自订不显示商务
     */
    pricingHide(item) {
      // if (item.jobCode === 'pricing') {
      //   if (
      //     this.serviceList.includes('proxy_book') ||
      //     this.createItem.serviceType === 'st02'
      //   ) {
      //     return false
      //   }
      //   if (
      //     this.serviceList.includes('proxy_whbook') ||
      //     this.createItem.serviceType === 'st04'
      //   ) {
      //     return false
      //   }
      // }
      return true
    },
    // 参与人下拉禁用设置，
    workDisabled(item) {
      // 业务禁用bd,obd,服务项有订舱禁用bkg,服务项有代订舱，pricing禁用并清空
      // 客户自定禁用pricing,bkg
      // 协同单不可修改参与人，
      if (this.$route.query.source === 'jointList') {
        if (this.createItem.businessType === 'air_import') {
          return false
        } else {
          return true
        }
        // return true
      } else {
        if (this.isBd) {
          if (!['draft', 'refuse'].includes(this.orderStatus)) {
            // 业务不是草稿状态全部禁止
            return true
          }
          if (
            item.jobCode === 'bd'
            // item.jobCode === 'obd' ||
            // item.jobCode === 'asst' ||
            // item.jobCode === 'op'
          ) {
            return true
          } else {
            return false
          }
        } else if (this.isOp) {
          if (!['pass'].includes(this.orderStatus)) {
            // 操作不是审核通过状态全部禁止
            return true
          }
          return ['bd', 'obd', 'pricing', 'asst'].includes(item.jobCode)
        } else if (this.isPricing) {
          // if (!['draft', 'refuse'].includes(this.orderStatus)) {
          //   return true
          // }
          if (
            item.jobCode === 'bd' ||
            item.jobCode === 'obd' ||
            item.jobCode === 'asst'
          ) {
            return true
          }
          if (['draft', 'refuse'].includes(this.orderStatus)) {
            return false
          } else if (['submit'].includes(this.orderStatus)) {
            if (item.jobCode === 'op' || item.jobCode === 'pricing') {
              return false
            } else {
              return true
            }
          } else {
            return true
          }
        } else {
          return true
        }
      }
    },

    handleChangeEmployee(val, index) {
      let itemData = (
        this.orderWorkOptions[index].data
          ? this.orderWorkOptions[index].data
          : []
      ).find((ele) => ele.employeeId === val)
      this.orderWorkOptions[index].employeeName = itemData ? itemData.cname : ''
      this.orderWorkOptions[index].employeeId = itemData
        ? itemData.employeeId
        : ''
      this.orderWorkOptions[index].compCode = itemData
        ? itemData.companyCode
        : ''
      // 登录用户所在的分公司与所选商务不是同一个时，参与人订舱的值置为0
      let compCode = this.orderWorkOptions[index].compCode
      let jobCode = this.orderWorkOptions[index].jobCode
      if (jobCode === 'pricing' && compCode !== this.compCode) {
        this.orderWorkOptions.forEach((ele) => {
          if (ele.jobCode === 'bkg') {
            ele.employeeName = ''
            ele.employeeId = 0
          }
        })
      }
      // if (jobCode === 'pricing') {
      //   // 用户既是业务又是商务时候，新建订单时候选择的商务参与人是本人时，页面切换成商务视图
      //   if (this.userId == val) {
      //     this.$store.dispatch('airTransport/setRole', 'pricing')
      //   } else {
      //     this.$store.dispatch('airTransport/setRole', 'bd')
      //   }
      // }
    },
    handleChangeJoinEmployee(val, index) {
      let itemData = (
        this.joinOrderWorkOptions[index].data
          ? this.joinOrderWorkOptions[index].data
          : []
      ).find((ele) => ele.employeeId === val)
      this.joinOrderWorkOptions[index].employeeName = itemData
        ? itemData.cname
        : ''
      this.joinOrderWorkOptions[index].employeeId = itemData
        ? itemData.employeeId
        : ''
      this.joinOrderWorkOptions[index].compCode = itemData
        ? itemData.companyCode
        : ''
      // 登录用户所在的分公司与所选商务不是同一个时，参与人订舱的值置为0
      let compCode = this.joinOrderWorkOptions[index].compCode
      let jobCode = this.joinOrderWorkOptions[index].jobCode
      if (jobCode === 'pricing' && compCode !== this.compCode) {
        this.joinOrderWorkOptions.forEach((ele) => {
          if (ele.jobCode === 'bkg') {
            ele.employeeName = ''
            ele.employeeId = 0
          }
        })
      }
      // if (jobCode === 'pricing') {
      //   // 用户既是业务又是商务时候，新建订单时候选择的商务参与人是本人时，页面切换成商务视图
      //   if (this.userId == val) {
      //     this.$store.dispatch('airTransport/setRole', 'pricing')
      //   } else {
      //     this.$store.dispatch('airTransport/setRole', 'bd')
      //   }
      // }
    },

    // 获取员工name
    getEmployeeName(val, index) {
      let roleCode = this.orderWorkOptions[index].jobCode
      let deptCode = this.obdDeptCode
        ? this.obdDeptCode
        : this.asstDeptCode
        ? this.asstDeptCode
        : this.bdDeptCode
        ? this.bdDeptCode
        : ''
      if (deptCode) {
        let data = {
          name: val ? val.replace(/^\s+|\s+$/g, '') : '',
          deptCode: deptCode,
          roleCode
        }
        if (roleCode === 'pricing' || roleCode === 'eac' || roleCode === 'ac') {
          delete data.deptCode
        }
        if (
          this.createItem.businessType === 'air_import' &&
          roleCode === 'op'
        ) {
          delete data.deptCode
        }
        if (
          this.airOrderInfo.importsDeptcode &&
          (roleCode === 'pricing' || roleCode === 'op')
        ) {
          // 空运进口订单，有importsDeptcode，deptCode传deptCode
          data.deptCode = this.airOrderInfo.importsDeptcode
          data.isOnlyDeptCode = true
        }
        if (roleCode === 'epricing' || roleCode === 'ecs') {
          delete data.deptCode
        }
        baseDeptParticipants(data).then((res2) => {
          this.$set(this.orderWorkOptions[index], 'data', res2.data)
        })
      } else {
        this.$set(this.orderWorkOptions[index], 'data', [])
      }
    },
    // 获取员工name joinOrderWorkOptions
    getJoinEmployeeName(val, index) {
      let roleCode = this.joinOrderWorkOptions[index].jobCode
      // console.log('🚀 ~ roleCode', roleCode)
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        deptCode: this.userInfo.deptCode,
        roleCode: roleCode
      }
      baseDeptParticipants(data).then((res) => {
        let result = res.data.map((item) => {
          let { deptCname } = item
          item.label = item.cname + deptCname ? `(${deptCname})` : ''
          return { ...item }
        })
        // console.log('result', result)
        this.$set(this.joinOrderWorkOptions[index], 'data', result)
      })
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
  border-bottom: 1px dashed #d9d9d9;
  .icon-duty {
    height: 12px;
    width: 12px;
    background: url('~@/assets/icon_duty.png') no-repeat;
    background-size: 100% 100%;
    margin-right: 3px;
  }
}
.worker-type-label {
  font-weight: 600;
  line-height: 30px;
  font-size: 12px;
  padding-left: 10px;
  color: #555;
}

.air-work-cont {
  .el-collapse-item__header {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px dashed #d9d9d9;
  }
}
</style>
