<!--
 * @Description: 船司年度计划列表
 * @Autor: yinjunying
 * @Date: 2022-06-08 09:13:28
-->
<template>
  <div class="finance-page" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <FinanceSearch ref="searchComp" :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="annual-plan-table" id="scroll-wrapper">
        <annualPlanTable :data="annualPlanList" :allData="annualPlanAllList" :roles="roles" @getList="search"
          @scrollBottom="scrollBottom" />
        <div v-if="listTotal > annualPlanAllList.length" class="show-more-box">
          <el-button type="text" @click="showMore">加载更多</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import annualPlanTable from './table'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { shipperSearchData } from '@/views/crm/data/annualPlan'
import annualPlanShipperApi from '@/api/crm/annualPlanShipper'
export default {
  components: {
    annualPlanTable,
    FinanceSearch
  },
  data () {
    return {
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      annualPlanList: [],
      annualPlanAllList: [],
      finished: false,
      currPage: 1,
      pageSize: 10,
      roles: [],
      listTotal: 0
    }
  },
  created () {
    // 搜索配置
    let searchObj = {}
    shipperSearchData.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 8,
        searchInputGroup: [
          { key: 'shippingCarrierCode', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'year', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'createName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'area', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'polPortCodes', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'lineCodes', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'countryCode', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'podPortCodes', value: '', showType: '1', range: { min: '', max: '' } }
        ],
        filterGroups: { ...searchObj },
        dateArr: ['createdTime'],
        callback: true,
      }
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
     * @description: 获取年度计划列表数据
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-21 11:26:43
     */
    getData (query) {
      this.lsLoading = true
      let param = {
        currPage: this.currPage,
        pageSize: this.pageSize
      }
      if(query) {
        for(var i in query){
          if(i === 'area'|| i === 'countryCode'){
            query[i] = query[i].split(',')
          }else if(i === 'lineCodes'|| i === 'podPortCodes'|| i === 'polPortCodes'){
            query[i] = query[i][0].split(',')
          }else if(i === 'year'){
            query[i] = query[i].split(',').map(Number)
          }
        }
      }
      let data = { ...param, ...query }
      annualPlanShipperApi['getYearPlanList'](data)
        .then(res => {
          if (res.code === 0) {
            let { list } = res.data
            this.listTotal = res.data.total || 0
            if (list && list.length) {
              list.forEach(ele => {
                this.annualPlanAllList.push({ ...ele })
              })
            }
            this.annualPlanList = []
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
              })
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
        }).catch(() => { })
        .finally(() => {
          this.lsLoading = false
        })
    },
    /**
     * @description: 重载数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-19 09:51:53
     */
    reloadData () {
      this.annualPlanAllList = []
      this.currPage = 1
      this.finished = false
      this.getData()
    },
    /**
     * @description: 查询列表数据
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-09 12:13:07
     */
    search () {
      this.annualPlanAllList = []
      this.currPage = 1
      this.finished = false
      this.getData(this.formatQueryParams())
    },
    /**
     * @description: 转换查询参数
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-09 15:33:51
     */
    formatQueryParams () {
      let query = this.$refs.searchComp.addFilterSearch()
      let data = {}
      if (query && query.length) {
        query.forEach(item => {
          let { column, type, value } = item
          if (column) {
            if (column === 'createdTime') {
              if (type === 'ge') {
                data['createdTimeBegin'] = value || ''
              } else if (type === 'le') {
                data['createdTimeEnd'] = value || ''
              }
            } else if (['polPortCodes', 'lineCodes', 'podPortCodes'].includes(column)) {
              data[column] = []
              data[column].push(value)
            } else {
              data[column] = value || ''
            }
          }
        })
      }
      return data
    },
    /**
     * @description: 滚动加载
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-09 12:04:21
     */
    scrollBottom () {
      const ele = document.getElementById('scroll-wrapper')
      if (ele.scrollTop + ele.offsetHeight > ele.scrollHeight - 100 && !this.finished) {
        if (!this.lsLoading) {
          this.getData(this.formatQueryParams())
          this.lsLoading = true
        }
      }
    },
    /**
     * @description: 加载更多
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-29 09:53:24
     */
    showMore () {
      if (!this.lsLoading) {
        this.getData(this.formatQueryParams())
        this.lsLoading = true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.annual-plan-table {
  height: calc(100vh - 126px);
  overflow: auto;
  padding: 0;
}
.show-more-box {
  text-align: center;
}
</style>