<!--
 * @Description: 年度计划详情
 * @Autor: yinjunying
 * @Date: 2022-04-26 14:18:36
-->
<template>
  <div class="guarantee-cnt" :element-loading-background="eLoadingBackground" :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText" v-loading="lsLoading">
    <div class="top-box">
      <div class="but-left">
        <el-button v-if="isSelf && isBd" type="primary" size="mini" @click="handleAdd">新增客户需求</el-button>
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
    <annualPlanDialog v-if="annualPlanObj.show" :options="annualPlanObj" :custid="custid" @getList="reloadData">
    </annualPlanDialog>
  </div>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import annualPlanTable from '@/views/crm/merchantManagement/annualPlanList/table'
import annualPlanDialog from "./annualPlanDialog"
import annualPlanApi from '@/api/crm/annualPlan'
export default {
  name: 'CUSTn',
  label: '客户需求',
  components: {
    annualPlanTable,
    annualPlanDialog
  },
  mixins: [mixin],
  props: ['orgid', 'custid', 'isSelf', 'isClient', 'isPotential', 'isManager','isBlacklist'],
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
      pageSize: 5,
      finished: false,
      roles: [],
      listTotal: 0
    }
  },
  activated () {
    this.queryUserInfo()
  },
  // mounted () {
  //   document.getElementById('scroll-wrapper').addEventListener('scroll', this.scrollBottom) // 添加滚动事件，检测滚动到页面底部
  // },
  // beforeDestroy () {
  //   document.getElementById('scroll-wrapper').removeEventListener('scroll', this.scrollBottom)
  // },
  computed: {
    // 销售
    isBd () {
      return (
        this.$store.state.user.roles.includes('bd') ||
        this.$store.state.user.roles.includes('obd')
      )
    }
  },
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
     * @description: 获取单个客户的年度计划列表
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-06 18:41:38
     */
    getListByCustid () {
      let data = {
        custid: this.custid,
        currPage: this.currPage,
        pageSize: this.pageSize
      }
      this.lsLoading = true
      annualPlanApi['queryYearlyPlanList'](data)
        .then((res) => {
          if (res.code === 0) {
            let { list } = res.data
            this.listTotal = res.data.total || 0
            if (list && list.length) {
              list.forEach(ele => {
                this.annualPlanAllList.push({ ...ele })
              })
            }
            // added on 2022-5-27 list数据包含明细和汇总的数据，审核通过取count，其它状态取detail
            this.annualPlanList = []
            if (this.annualPlanAllList.length) {
              this.annualPlanAllList.forEach(item => {
                if (item.detail.verifyStatus === 'pass') {
                  // 汇总的航线信息要从detail里面取
                  if (item.detail['portList'] && item.detail['portList'].length) {
                    item.count['lineInfoListAll'] = []
                    item.count['podInfoListAll'] = []
                    item.count['polInfoListAll'] = []
                    item.detail['portList'].forEach(detailItem => {
                      item.count['lineInfoListAll'].push({
                        lineCode: detailItem.lineCode,
                        lineName: detailItem.lineName
                      })
                      item.count['podInfoListAll'].push({
                        podPortCode: detailItem.podPortCode,
                        podPortName: detailItem.podPortName
                      })
                      item.count['polInfoListAll'].push({
                        polPortCode: detailItem.polPortCode,
                        polPortName: detailItem.polPortName
                      })
                    })
                  }
                  this.annualPlanList.push({ ...item.count })
                } else {
                  this.annualPlanList.push({ ...item.detail })
                }
              });
            }
            if (this.annualPlanList.length) {
              this.annualPlanList.forEach(item => {
                // if (item.portList && item.portList.length) { 不用进行数据处理了，直接返回的结果就是展示的结果
                  // item.portList.forEach(porItem => {
                  //   let porItemData = [...porItem.data]
                  //   porItemData.splice(2, 0, porItem.data[8])
                  //   porItemData.splice(5, 0, porItem.data[7])
                  //   porItemData.splice(9)
                  //   porItem.data = [...porItemData]
                  // })
                // }
                item.isSelf = item.createdBy === this.$store.state.user.userId
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
      this.annualPlanAllList = []
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