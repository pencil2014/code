<!--
 * @Description: 年度计划列表
 * @Autor: yinjunying
 * @Date: 2022-04-26 09:08:45
-->
<template>
  <div class="finance-page" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <FinanceSearch ref="searchComp" :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div>
          <el-button type="primary" size="mini" @click="handleExport">导出明细</el-button>
        </div>
      </div>
      <div class="annual-plan-table" id="scroll-wrapper">
        <annualPlanTable :data="annualPlanList" :allData="annualPlanAllList" :roles="roles" @getList="search" />
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
import { searchData } from '@/views/crm/data/annualPlan'
import annualPlanApi from '@/api/crm/annualPlan'
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
      pageSize: 5,
      roles: [],
      listTotal: 0
    }
  },
  created () {
    // 搜索配置
    let searchObj = {}
    searchData.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 9,
        searchInputGroup: [
          { key: 'bdEmployeeId', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'verifyTime', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'year', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'polPortCodes', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'podPortCodes', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'lineCodes', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'ordinate', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['createdTime', 'verifyTime'],
        callback: true,
      }
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
      let data = { ...param, ...query }
      annualPlanApi['queryYearlyPlanList'](data)
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
              })
            }
            if (this.annualPlanList.length) {
              this.annualPlanList.forEach(item => {
                // if (item.portList && item.portList.length) {
                //   item.portList.forEach(porItem => {
                //     let porItemData = [...porItem.data]
                //     porItemData.splice(2, 0, porItem.data[8])
                //     porItemData.splice(5, 0, porItem.data[7])
                //     porItemData.splice(9)
                //     porItem.data = [...porItemData]
                //   })
                // }
                item.isSelf = item.createdBy === this.$store.state.user.userId
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
            } else if (column === 'verifyTime') {
              if (type === 'ge') {
                data['verifyTimeBegin'] = value || ''
              } else if (type === 'le') {
                data['verifyTimeEnd'] = value || ''
              }
            } else if (column === 'bdEmployeeId') {
              data[column] = Number(value) || ''
            } else if (['polPortCodes', 'podPortCodes', 'lineCodes'].includes(column)) {
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
     * @description: 导出数据
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-21 11:27:17
     */
    handleExport () {
      annualPlanApi['export'](this.formatQueryParams())
        .then(res => {
          if (res.code === 0 && res.data && res.data.filePath) {
            location.href = res.data.filePath
          } else {
            this.$msgErrClose("导出错误，请稍后再试！")
          }
        }).catch(() => { })
        .finally(() => {
        })
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
  height: calc(100vh - 170px);
  overflow: auto;
  padding: 0;
}
.show-more-box {
  text-align: center;
}
</style>