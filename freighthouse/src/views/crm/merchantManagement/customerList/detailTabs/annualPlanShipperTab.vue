<!--
 * @Description: 船司年度计划详情
 * @Autor: yinjunying
 * @Date: 2022-06-08 09:13:28
-->
<template>
  <div class="guarantee-cnt" :element-loading-background="eLoadingBackground" :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText" v-loading="lsLoading">
    <div class="top-box">
      <div class="but-left">
        <el-button v-if="isValid==='valid'" type="primary" size="mini" @click="handleAdd">新增年度计划</el-button>
      </div>
    </div>
    <div class="annual-plan-table" id="scroll-wrapper">
      <annualPlanTable :data="annualPlanList" :allData="annualPlanAllList" :isDetail="isDetail" :isSelf="isSelf" :custid="custid"
        @getList="reloadData" />
      <div v-if="listTotal > annualPlanList.length" class="show-more-box">
        <el-button type="text" @click="showMore">加载更多</el-button>
      </div>
    </div>
    <!-- 新增/编辑年度计划 -->
    <annualPlanDialog v-if="annualPlanObj.show" :options="annualPlanObj" :shippingCarrierId="custid" @getList="reloadData">
    </annualPlanDialog>
  </div>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import annualPlanTable from '@/views/crm/merchantManagement/shippingCarrier/annualPlan/table'
import annualPlanDialog from "./annualPlanShipperDialog"
import annualPlanShipperApi from '@/api/crm/annualPlanShipper'
export default {
  name: 'ASC2',
  label: '年度计划',
  shipperShow: true,
  customerHide: true,
  components: {
    annualPlanTable,
    annualPlanDialog
  },
  mixins: [mixin],
  props: ['orgid', 'custid', 'isSelf', 'isClient', 'isPotential', 'isManager','isValid'],
  data () {
    return {
      isDetail: true, //是否是客户详情中的年度计划
      annualPlanList: [],
      annualPlanAllList: [],
      annualPlanObj: {
        show: false,
        data: [],
        title: '新增',
        type: 'add'
      },
      currPage: 1,
      pageSize: 10,
      finished: false,
      roles: [],
      listTotal: 0
    }
  },
  activated () {
    this.reloadData()
  },
  // mounted () {
  //   document.getElementById('scroll-wrapper').addEventListener('scroll', this.scrollBottom) // 添加滚动事件，检测滚动到页面底部
  // },
  // beforeDestroy () {
  //   document.getElementById('scroll-wrapper').removeEventListener('scroll', this.scrollBottom)
  // },
  methods: {
    /**
     * @description: 年度计划角色查询
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-19 09:52:48
     */
    queryUserInfo () {
      annualPlanApi['userInfo']({}).then(res => {
        if (res.code === 0) {
          this.roles = res.data.roles || []
          this.roles.length && sessionStorage.setItem('annualPlanRoles', this.roles)
          this.reloadData()
        }
      }).catch(() => { })
        .finally(() => { })
    },
    /**
     * @description: 获取我司实际装载周舱位数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-02 15:13:51
     */
    getActualUseTeuData (data, item) {
      annualPlanShipperApi['actualUseTeu'](data)
        .then(res => {
          if (res.code === 0) {
            let teuData = res.data || []
            if (item.portList && item.portList.length && item.portList[0].data && item.portList[0].data.length) {
              item.portList[0].data.forEach((dItem, dIndex) => {
                if (dItem.monthData && dItem.monthData.length) {
                  dItem.monthData.forEach(mItem => {
                    if (mItem.ordinateCode === "OUR_ACTUAL_WEEK_SPACE") {
                      for (let key in mItem) {
                        this.$set(mItem, key, teuData[dIndex].monthData[0][key])
                      }
                    }
                  })
                }
              })
            }
          }
        }).catch(() => { })
    },
    /**
     * @description: 获取单个客户的年度计划列表
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-06 18:41:38
     */
    getListByCustid () {
      let data = {
        shippingCarrierId: this.custid,
        currPage: this.currPage,
        pageSize: this.pageSize
      }
      this.lsLoading = true
      annualPlanShipperApi['getYearPlanList'](data)
        .then((res) => {
          if (res.code === 0) {
            this.annualPlanAllList = res.data.list || []
            this.listTotal = res.data.total || 0
            // added on 2022-5-27 list数据包含明细和汇总的数据，审核通过取count
            if (this.annualPlanAllList && this.annualPlanAllList.length) {
              this.annualPlanAllList.forEach(item => {
                // 汇总的航线信息要从count里面取
                if (item.count['portList'] && item.count['portList'].length) {
                  item.count['lineInfoListAll'] = []
                  item.count['polInfoListAll'] =  []
                  item.count['podInfoListAll'] = []
                  item.count['employeeInfoAll'] = []

                  item.count['portList'].forEach(allItem => {
                    allItem.lineInfo.forEach(detailItem=>{
                      item.count['lineInfoListAll'].push({
                      lineCode: detailItem.lineCode,
                      lineName: detailItem.lineName
                    })
                    })
                  })
                  item.count['portList'].forEach(allItem => {
                    allItem.polPortInfo.forEach(detailItem=>{
                      item.count['polInfoListAll'].push({
                      polPortCode: detailItem.polPortCode,
                      polPortName: detailItem.polPortName
                    })
                    })
                  })
                  item.count['portList'].forEach(allItem => {
                    allItem.podPortInfo.forEach(detailItem=>{
                      item.count['podInfoListAll'].push({
                      podPortCode: detailItem.podPortCode,
                      podPortName: detailItem.podPortName
                    })
                    })
                  })
                  item.count['portList'].forEach(allItem => {
                    allItem.employeeInfo.forEach(detailItem=>{
                      item.count['employeeInfoAll'].push({
                      employeeId: detailItem.employeeId,
                      employeeName: detailItem.employeeName
                    })
                    })
                  })
                }
                this.annualPlanList.push({ ...item.count })
              });
            }
            if (this.annualPlanList.length) {
              this.annualPlanList.forEach(item => {
                item.isSelf = item.createdBy === this.$store.state.user.userId
                let area = []
                let lineCode = []
                let lineName = []
                let polPortCode = []
                let polPortName = []
                let podPortCode = []
                let podPortName = []
                if (item.portList && item.portList.length) {
                  item.portList.forEach(pItem => {
                    pItem.area && area.push(pItem.area)
                    pItem.lineCode && lineCode.push(pItem.lineCode)
                    pItem.lineName && lineName.push(pItem.lineName)
                    if (pItem.polPortCode && pItem.polPortCode.length) {
                      pItem.polPortCode.forEach(polCItem => {
                        polPortCode.push(polCItem)
                      })
                    }
                    if (pItem.polPortName && pItem.polPortName.length) {
                      pItem.polPortName.forEach(polNItem => {
                        polPortName.push(polNItem)
                      })
                    }
                    if (pItem.podPortCode && pItem.podPortCode.length) {
                      pItem.podPortCode.forEach(podICtem => {
                        podPortCode.push(podICtem)
                      })
                    }
                    if (pItem.podPortName && pItem.podPortName.length) {
                      pItem.podPortName.forEach(podNItem => {
                        podPortName.push(podNItem)
                      })
                    }
                  })
                }
                // 每条年度计划都去获取一下【我司实际装载周舱位】数据
                let teuData = {
                  shippingCarrierCode: item.shippingCarrierCode,
                  area,
                  lineCode,
                  lineName,
                  polPortCode,
                  polPortName,
                  podPortCode,
                  podPortName,
                  year: item.year,
                  oid: item.oid
                }
                this.getActualUseTeuData(teuData, item)
              });
            }
            if (this.annualPlanList.length >= res.data.total) {
              this.finished = true
            }
            this.currPage += 1
          }
        })
        .catch(() => { })
        .finally(() => {
          this.lsLoading = false
        })
    },
    /**
     * @description: 重载数据，从第一页开始加载数据
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-10 09:46:58
     */
    reloadData () {
      this.annualPlanList = []
      this.currPage = 1
      this.finished = false
      this.getListByCustid()
    },
    /**
     * @description: 滚动加载
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-09 14:42:33
     */
    scrollBottom () {
      const ele = document.getElementById('scroll-wrapper')
      if (ele.scrollTop + ele.offsetHeight > ele.scrollHeight - 60 && !this.finished) {
        if (!this.lsLoading) {
          this.getListByCustid()
          this.lsLoading = true
        }
      }
    },
    /**
     * @description: 加载更多
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-29 10:57:23
     */
    showMore () {
      if (!this.lsLoading) {
        this.getListByCustid()
        this.lsLoading = true
      }
    },
    /**
     * @description: 新增/编辑年度计划
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-26 14:52:54
     */
    handleAdd () {
      this.annualPlanObj.show = true
      this.annualPlanObj.type = 'add'
      this.annualPlanObj.title = '新增'
    }
  }
}
</script>
<style lang="scss" scoped>
.annual-plan-table {
  height: calc(100vh - 170px);
  overflow: auto;
  padding: 0;
}
.show-more-box {
  text-align: center;
}
</style>