<!--
 * @Description: 船司年度计划表格
 * @Autor: yinjunying
 * @Date: 2022-06-06 18:29:31
-->
<template>
  <div class="table-wrapper">
    <template v-if="dataList.length">
      <el-card v-for="(item, index) in dataList" :key="index" :id="`box-card`+ index" class="mb5 box-card">
        <div slot="header" class="clearfix waitCheckBg">
          <div class="left-title">
            <span class="cust-name">{{index+1}}. {{ item.shippingCarrierCode }}</span>
            <span class="ml10"><b>（ {{ item.year }}年度计划 ）</b></span>
          </div>
          <div class="right-title">
            <template v-if="item.isEdit">
              <el-button  type="warning" size="mini" class="ml10" @click="handleEdit('edit', item)">编辑</el-button>
              <el-popconfirm title="失效后不可恢复，是否确定要将该年度计划失效？" @onConfirm="handleFailure(item)">
                <el-button slot="reference" type="danger" size="mini" class="ml10">失效</el-button>
              </el-popconfirm>
            </template>
            <el-button v-if="item.isShow" type="text" @click="panelSwitch(item,index)">收起
              <i class="el-icon-arrow-up el-icon--right"></i>
            </el-button>
            <el-button v-else type="text" @click="panelSwitch(item,index,'open')">展开
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>
        <el-collapse-transition>
          <div class="item mb10" v-show="item.isShow">
            <!-- <div class="create-panel"> -->
              <!-- <div>
                <span class="ml10">
                  {{ item.createdName }} {{ item.createdTime }} 创建
                </span>
              </div> -->
              <!-- <div class="port-search">
                <el-button :type="item.isShowTotal ? 'success' : 'default'" size="mini" class="ml10 changeBtn"
                  @click="showDetail(true, item, index)">汇总</el-button>
                <el-button :type="!item.isShowTotal ? 'success' : 'default'" size="mini" class="changeBtn"
                  @click="showDetail(false, item, index)">明细</el-button>
              </div> -->
            <!-- </div> -->
            <div v-if="item.ourTargetRange && item.ourTargetRange" class="price-panel">
              <span v-if="item.ourPriceRange" class="ml10">我司价格档次：{{ arrFormatString(item.ourPriceRange) }}</span>
              <span v-if="item.ourTargetRange" class="ml10">我司目标档次：{{ arrFormatString(item.ourTargetRange) }}</span>
            </div>
            <!-- <div v-if="!item.isShowTotal" class="port-item">
              <div class="port-item-box">
                <div class="port-title port-title-noPass">
                  起运港 ==> 航线：
                </div>
                <div class="port-checkbox">
                  <span v-for="(portItem, portIndex) in item.portList" :key="portIndex">
                    <el-button v-if="portItem.polPortName && portItem.lineName" type="primary" size="mini" plain
                      :class="[portIndex ? `ml5` : '', `mb5 port-btn port-btn`+portIndex]" @click="changePortList(index, portIndex)">
                      {{ arrFormatString(portItem.polPortName) }} ==> {{ portItem.lineName }}
                    </el-button>
                  </span>
                </div>
              </div>
            </div> -->
            <div v-if="item.isShowTotal" class="port-item">
              <div class="port-item-box">
                <div class="port-title port-title-pass">
                  航线：
                </div>
                <div class="port-checkbox">
                  <el-checkbox-group v-model="item.lineInfoList" size="mini" @change="(v) => changePolInfoList(v, item, 'line')">
                    <el-checkbox label="" border>全部</el-checkbox>
                    <template v-for="(portItem, portIndex) in item.lineInfoListAll">
                      <el-checkbox v-if="portItem.lineName && portItem.lineCode" :key="portIndex" :label="portItem.lineCode" border>
                        {{ portItem.lineName }}</el-checkbox>
                    </template>
                  </el-checkbox-group>
                </div>
              </div>
              <div class="port-item-box">
                <div class="port-title port-title-pass">
                  起运港：
                </div>
                <div class="port-checkbox">
                  <el-checkbox-group v-model="item.polInfoList" size="mini" @change="(v) => changePolInfoList(v, item, 'pol')">
                    <el-checkbox label="" border>全部</el-checkbox>
                    <el-checkbox v-for="(portItem, portIndex) in item.portInfoListAll" :key="portIndex"
                      :label="`${portItem.polPortCode}#${portItem.podPortCode}`" border>
                      <el-tooltip class="item" effect="light"
                        :disabled="arrFormatString(portItem.polPortName).length + arrFormatString(portItem.podPortName).length < 55"
                        :content="`${arrFormatString(portItem.polPortName)}`"
                        placement="top-start">
                        <span>{{ arrFormatString(portItem.polPortName) }}</span>
                      </el-tooltip>
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
              <div class="port-item-box">
                <div class="port-title port-title-pass">
                  创建人：
                </div>
                <div class="port-checkbox">
                  <el-checkbox-group v-model="item.employeeInfoList" size="mini" @change="(v) => changePolInfoList(v, item, 'employee')">
                    <el-checkbox label="" border>全部</el-checkbox>
                    <template v-for="(portItem, portIndex) in item.employeeInfoAll">
                      <el-checkbox v-if="portItem.employeeName && portItem.employeeId" :key="portIndex" :label="portItem.employeeId" border>
                        {{ portItem.employeeName }}</el-checkbox>
                    </template>
                  </el-checkbox-group>
                </div>
              </div>
            </div>
            <div class="port-table">
              <div class="port-table-box">
                <div v-for="(monthItem, monthIndex) in item.columns" :key="monthIndex" class="port-table-item">
                  <el-table v-if="item.curList[monthIndex] && item.curList[monthIndex].monthData"
                    :data.sync="item.curList[monthIndex].monthData" border fit v-loading="item.tableLoading"
                    :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner"
                    :element-loading-background="eLoadingBackground" :span-method="spanMethod" style="flex-direction: column ">
                    <el-table-column v-for="(colItem, colIndex) in monthItem" :key="colIndex" :prop="colItem.prop" :label="colItem.label"
                      :fixed="colItem.fixed" :width="colItem.width" :min-width="colItem.minWidth" align="center" header-align="center">
                      <template slot="header">
                        <div>{{ formatterHeader(colItem.label, 'week') }}</div>
                        <div>{{ formatterHeader(colItem.label, 'day') }}</div>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
              <p class="mt10" v-if="item.remarks">
                备注：{{ item.remarks }}
              </p>
            </div>
          </div>
        </el-collapse-transition>
      </el-card>
    </template>
    <template v-else>
      <div class="empty">
        <NoData size="small" />
      </div>
    </template>
    <!-- 编辑/复制年度计划 -->
    <annualPlanDialog v-if="annualPlanObj.show" :options="annualPlanObj" :shippingCarrierId="shippingCarrierId" @getList="getList">
    </annualPlanDialog>
  </div>
</template>

<script>
import annualPlanDialog from "@/views/crm/merchantManagement/customerList/detailTabs/annualPlanShipperDialog"
import annualPlanShipperApi from '@/api/crm/annualPlanShipper'
export default {
  components: {
    annualPlanDialog,
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    allData: {
      type: Array,
      default: () => []
    },
    isDetail: {
      type: Boolean,
      default: false
    },
    shippingCarrierId: {
      type: Number,
      default: 0
    },
    isSelf: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      oid: '',
      columnsData: [],
      dataList: [],
      allDataList: [],
      annualPlanObj: {
        show: false,
        data: [],
        type: '',
        title: '',
        oid: '',
        shippingCarrierId: '',
        year: '',
        createEmployeeId:''
      },
      roles: [],
      lineInfoList: [],
      polInfoList: [],
      employeeInfoList:[],
      isHas:{}
    }
  },
  watch: {
    data (nval) {
      this.dataList = nval
      if (nval.length) {
        this.dataList.forEach(item => {
          this.setColumnStyle(item)
          this.$set(item, 'lineInfoList', [''])
          this.$set(item, 'polInfoList', [''])
          this.$set(item, 'podInfoList', [''])
          this.$set(item, 'employeeInfoList', [''])
          this.$set(item, 'isShow', false)
          this.$set(item, 'isShowTotal', true)
          this.$set(item, 'tableLoading', false)
          this.$forceUpdate()
          // 合并起运港和目的港集合
          item.portInfoListAll = []
          if (item.polInfoListAll && item.polInfoListAll.length) {
            item.polInfoListAll.forEach((polItem, polIndex) => {
              item.portInfoListAll.push({
                polPortCode: polItem.polPortCode,
                polPortName: polItem.polPortName,
                podPortCode: item.podInfoListAll ? item.podInfoListAll[polIndex]&&
                item.podInfoListAll[polIndex].podPortCode : '',
                podPortName: item.podInfoListAll ?  item.podInfoListAll[polIndex]&&
                item.podInfoListAll[polIndex].podPortName : ''
              })
            })
          }
          if (item.portList && item.portList.length) {
            item.portList.forEach(() => {
              this.setPortUnique(item)
            })
            // 默认展示第一个航线数据
            item.curList = item.portList[0].data
          }
        })
      }
    },
    allData (newVal) {
      this.allDataList = newVal
    }
  },
  methods: {
    /**
     * @description: 截取表头周数和日期，打到换行的效果
     * @param {*} str 表头数据
     * @param {*} type 周天/日期
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-08 18:57:52
     */
    formatterHeader (str, type) {
      if (str) {
        if (type === 'week') {
          return str.substring(0, 3)
        } else {
          return str.substring(3)
        }
      } else {
        return ''
      }
    },
    /**
     * @description: 合并月目标T量，月目标利润
     * @param {*} rowIndex 行下标
     * @param {*} columnIndex 列下标
     * @return {*} 合并对象
     * @author: yinjunying
     * @Date: 2022-06-08 10:10:41
     */
    spanMethod ({ rowIndex, columnIndex }) {
      if ([4, 5].includes(rowIndex)) {
        if (columnIndex === 1) {
          return [1, 6];
        }
      }
    },
    /**
     * @description: 获取列表数据
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-07 18:07:24
     */
    getList () {
      this.$emit('getList')
    },
    /**
     * @description: 卡片的收起展示
     * @param {*} index 卡片索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-26 10:29:06
     */
    panelSwitch (item,index,type) {
      this.dataList[index].isShow = !this.dataList[index].isShow
      this.$forceUpdate()
      this.isHas = item.employeeInfoAll.find(item=>item.employeeId === this.$store.state.user.userId)
        if(this.isHas){
          this.$set(item, 'employeeInfoList', [this.$store.state.user.userId])
        }else{
          this.$set(item, 'employeeInfoList', [''])
        }
        //第一次进来，是创建人
      if(type==='open'&&this.isHas){
        this.changePolInfoList (item.employeeInfoList, item, 'employee','first') 
      }
    },
    /**
     * @description: 切换起运港->航线tab
     * @param {*} index 卡片索引
     * @param {*} portIndex 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-26 13:56:29
     */
    changePortList (index, portIndex) {
      this.dataList[index].curList = this.dataList[index].portList[portIndex].data
      if (this.dataList[index].portList.length) {
        this.dataList[index].portList.forEach((ele, i) => {
          document.getElementById(`box-card${index}`).getElementsByClassName('port-btn')[i].classList.remove('activeBtn')
        })
        document.getElementById(`box-card${index}`).getElementsByClassName(`port-btn${portIndex}`)[0].classList.add('activeBtn')
      }
      this.$forceUpdate()
    },
    /**
     * @description: 切换航线、起运港、目的港,创建人
     * @param {*} val 选中集合
     * @param {*} item 年度计划数据
     * @param {*} type 切换类型
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-27 17:12:56
     */
    changePolInfoList (val, item, type,time) {
      if (val.includes('')) {
        if (val.indexOf('')) {
          if (type === 'line') this.$set(item, 'lineInfoList', [''])
          if (type === 'pol') this.$set(item, 'polInfoList', [''])
          if (type === 'employee') this.$set(item, 'employeeInfoList', [''])
          val = ['']
        } else if (val.indexOf('') <= 0 && val.length > 1) {
          val.splice(val.findIndex(item => item === ''), 1)
        }
      }
      this.searchTotal(item,time)
    },
    /**
     * @description: 航线、起运港、目的港去重，+创建人
     * @param {*} item 年度计划数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-31 11:48:26
     */
    setPortUnique (item) {
      if (item.lineInfoListAll && item.lineInfoListAll.length) {
        item.lineInfoListAll = item.lineInfoListAll.filter((currentValue, currentIndex, selfArr) => {
          return selfArr.findIndex(x => x.lineCode === currentValue.lineCode) === currentIndex
        })
      }
      if (item.polInfoListAll && item.polInfoListAll.length) {
        item.polInfoListAll = item.polInfoListAll.filter((currentValue, currentIndex, selfArr) => {
          return selfArr.findIndex(x => x.polPortCode === currentValue.polPortCode) === currentIndex
        })
      }
      if (item.podInfoListAll && item.podInfoListAll.length) {
        item.podInfoListAll = item.podInfoListAll.filter((currentValue, currentIndex, selfArr) => {
          return selfArr.findIndex(x => x.podPortCode === currentValue.podPortCode) === currentIndex
        })
      }
      if (item.employeeInfoAll && item.employeeInfoAll.length) {
        item.employeeInfoAll = item.employeeInfoAll.filter((currentValue, currentIndex, selfArr) => {
          return selfArr.findIndex(x => x.employeeId === currentValue.employeeId) === currentIndex
        })
      }
    },
    /**
     * @description: 切换明细/汇总
     * @param {*} isShowTotal 是否显示的是汇总
     * @param {*} item 年度计划数据
     * @param {*} index 年度计划索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-30 18:29:58
     */
    showDetail (isShowTotal, item, index) {
      if (this.allDataList && this.allDataList.length) {
        this.allDataList.forEach((allItem, allIndex) => {
          if (index === allIndex) {
            for (let key in item) {
              if (isShowTotal) {
                this.$set(item, key, allItem.count[key])
              } else {
                this.$set(item, key, allItem.detail[key])
                this.setColumnStyle(item)
              }
            }
            this.$set(item, 'lineInfoList', [''])
            this.$set(item, 'polInfoList', [''])
            this.$set(item, 'employeeInfoList', [''])
            this.$set(item, 'isShow', true)
            this.$set(item, 'curList', item.portList[0].data)
            this.$set(item, 'isSelf', item.createdBy === this.$store.state.user.userId)
            this.$set(item, 'isShowTotal', isShowTotal)
            if (item.portList.length && item.portList[0].polPortName && !isShowTotal) {
              setTimeout(() => {
                document.getElementById(`box-card${index}`).getElementsByClassName(`port-btn`)[0].classList.add('activeBtn')
              }, 50);
            }
          }
        })
        this.setPortUnique(item)
      }
      this.$forceUpdate()
    },
    /**
     * @description: 设置表头宽度
     * @param {*} item 年度计划信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-12 13:56:26
     */
    setColumnStyle (item) {
      if (item.columns && item.columns.length) {
        item.columns.forEach((colItem, colIndex) => {
          colItem.forEach(subItem => {
            if (subItem.prop === "ordinate") {
              subItem.width = "150px"
            } else if (subItem.prop === "total") {
              subItem.minWidth = "60px"
            } else {
              subItem.minWidth = "90px"
            }
          })
        })
      }
    },
    /**
     * @description: 获取我司实际装载周舱位数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-02 15:13:51
     */
    getActualUseTeuData (data, curList) {
      annualPlanShipperApi['actualUseTeu'](data)
        .then(res => {
          if (res.code === 0) {
            let teuData = res.data || []
            console.log(`curList`, curList);
            curList.forEach((dItem, dIndex) => {
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
        }).catch(() => { })
    },
    /**
     * @description: 查看单条汇总数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-30 17:17:22
     */
    searchTotal (item,time) {
      item.isEdit = false
      let data = {
        planId: item.oid,
        year:[item.year],
        currPage: 1,
        shippingCarrierId: item.shippingCarrierId,
        lineCodes: [],
        polPortCodes: [],
        // podPortCodes: [],
        createEmployeeId:[]//新增创建人id的
      }
      let lineCodes = []
      let createEmployeeId = []
      let arr = ['lineInfoList', 'polInfoList', 'podInfoList','employeeInfoList']
      if(time==='first'){
        data.createEmployeeId = item.employeeInfoList
        if(!this.$store.state.user.roles.includes('cobd')){
          item.isEdit = true
        }else{
          item.isEdit = false
        }

      }else{
       arr.forEach(ele => {
        if (item[ele] && item[ele].length && !(item[ele].length === 1 && item[ele].includes(''))) {
          if (ele === 'lineInfoList') {
            lineCodes = item[ele]
            data.lineCodes = lineCodes
          }
          if (ele === 'polInfoList') {
            data.polPortCodes = item[ele]
          }
          if(ele === 'employeeInfoList'){
            createEmployeeId = item[ele]
            data.createEmployeeId = createEmployeeId
            if(createEmployeeId.length === 1 && !this.$store.state.user.roles.includes('cobd')){
              item.isEdit = true
            }else{
              item.isEdit = false
            }
          }
        }
        if (!item[ele].length) { //如果全不选，给后台标记
          if (ele === 'lineInfoList') data.lineUncheck = true
          if (ele === 'polInfoList') data.polPortUncheck = true
        }
      })
      }

      let polPortCodes = []
      let podPortCodes = []
      if (data.polPortCodes && data.polPortCodes.length) {
        data.polPortCodes.forEach(polItem => {
          if (polItem.includes("#")) {
            polItem.split("#")[0] && polPortCodes.push(polItem.split("#")[0])
            // polItem.split("#")[1] && podPortCodes.push(polItem.split("#")[1])
          } else {
            polPortCodes = polItem
          }
        })
      }
      data.polPortCodes = polPortCodes
      // data.podPortCodes = podPortCodes
      item.tableLoading = true
      annualPlanShipperApi['getYearPlanList'](data).then((res) => {
        if (res.code === 0) {
          let arr = []
          if (res.data.list && res.data.list.length) {
            arr = res.data.list[0]
            if (arr.count.portList && arr.count.portList.length) {
              item.portList = arr.count.portList
              item.curList = arr.count.portList[0].data || []
            } else {
              item.portList = []
              item.curList = []
            }
          } else {
            item.portList = []
            item.curList = []
          }
          let area = []
          let lineName = []
          let polPortName = []
          let podPortName = []
          // 每条年度计划都去获取一下【我司实际装载周舱位】数据
          let teuData = {
            shippingCarrierCode: item.shippingCarrierCode,
            area,
            lineCode: lineCodes,
            lineName,
            polPortCode: polPortCodes,
            polPortName,
            podPortCode: podPortCodes,
            podPortName,
            year: item.year,
            oid: item.oid,
            createEmployeeId:createEmployeeId
          }
          this.getActualUseTeuData(teuData, item.curList)
          this.$forceUpdate()
        }
      }).catch(() => { })
        .finally(() => {
          item.tableLoading = false
        })
    },
    /**
     * @description: 编辑/复制年度计划
     * @param {*} type edit-编辑 copy-复制
     * @param {*} row 年度计划
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-29 14:24:29
     */
    handleEdit (type, row) {
      this.annualPlanObj.show = true
      this.annualPlanObj.type = type
      this.annualPlanObj.title = type === 'edit' ? '编辑' : type === 'copy' ? '复制' : ''
      this.annualPlanObj.oid = row.oid
      this.annualPlanObj.shippingCarrierId = row.shippingCarrierId
      this.annualPlanObj.year = row.year
      this.annualPlanObj.createEmployeeId = row.employeeInfoList[0]
    },
    /**
     * @description: 失效年度计划
     * @param {*} oid 
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-15 15:20:32
     */
    handleFailure (item) {
      let data = { 
        shippingCarrierId:item.shippingCarrierId,
        createEmployeeId:item.employeeInfoList[0],
        year:item.year
       }
      annualPlanShipperApi['invalidByPlanId'](data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('操作成功！')
            this.$emit('getList')
          }
        })
        .catch(() => { })
        .finally(() => {
        })
    },
    /**
     * @description: 转换我司价格（目标）档次
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-27 10:26:25
     */
    arrFormatString (val) {
      if (val && val.length) {
        if (val.length > 1) {
          return val.join("、")
        } else {
          return val.join("")
        }
      } else {
        return ""
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.ml5 {
  margin-left: 5px;
}
.ml10 {
  margin-left: 10px;
}
.mb5 {
  margin-bottom: 5px;
}
.mb10 {
  margin-bottom: 10px;
}
.mt10 {
  margin-top: 10px;
}
.clearfix:after {
  clear: both;
}
.table-wrapper {
  padding: 0 8px;
  /deep/ .el-card__header {
    padding: 0;
  }
  /deep/ .el-card__body {
    padding: 0;
  }
  .cust-name {
    font-size: 14px;
    font-weight: bold;
    line-height: 35px;
    padding-left: 10px;
  }
  .left-title {
    float: left;
    .industry {
      margin-left: 20px;
      img {
        width: 16px;
        vertical-align: sub;
      }
    }
  }
  .right-title {
    float: right;
    /deep/ .el-button--text {
      padding: 9px 7px;
      font-size: 13px;
    }
    /deep/ .el-button {
      margin-top: 2px;
    }
  }
  .port-item {
    width: 100%;
    padding: 0 10px;
    .port-item-box {
      display: flex;
      .port-title {
        line-height: 18px;
        text-align: right;
        padding-right: 3px;
      }
      .port-title-pass {
        flex: 0 0 115px;
      }
      .port-title-noPass {
        flex: 0 0 102px;
      }
      .port-checkbox {
        flex: 1;
        /deep/ .el-checkbox {
          margin-right: 0 !important;
        }
        /deep/ .el-checkbox.is-bordered.el-checkbox--mini {
          padding: 1px 7px;
          border-radius: 3px;
          color: #1890ff;
          background: #e8f4ff;
          border-color: #a3d3ff;
          height: 22px;
          margin-bottom: 5px;
          margin-right: 5px !important;
          display: inline-block;
          max-width: 500px;
          width: auto;
          height: auto;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: pre;
          .el-checkbox__label {
            padding-left: 0;
            color: #1890ff !important;
            overflow: hidden;
            display: inline;
          }
          .el-checkbox__input {
            display: none;
          }
        }
        /deep/ .el-checkbox.is-bordered.el-checkbox--mini.is-checked {
          background: #1682e6;
          border-color: #1682e6;
          color: #ffffff;
          .el-checkbox__label {
            padding-left: 0;
            color: #ffffff !important;
          }
        }
        /deep/ .el-checkbox.is-bordered + .el-checkbox.is-bordered {
          margin-left: 0;
          vertical-align: top;
        }
      }
    }
  }
  .port-table {
    padding: 0 10px;
    .port-table-box {
      display: flex;
      flex-wrap: wrap;
      flex-flow: row wrap;
      justify-content: center;
      .port-table-item {
        width: 49.7%;
        margin-bottom: 5px;
        &:nth-of-type(2n) {
          margin-left: 5px;
        }
      }
    }
    /deep/ .el-table--border th,
    /deep/ .el-table--border td {
      border-right: 1px solid #dfe6ec !important;
    }
    /deep/ .el-table .cell {
      word-break: normal !important;
    }
    /deep/ .el-table th > .cell {
      padding-left: 0px;
      padding-right: 0px;
      font-weight: normal;
      color: #333;
    }
  }
  .create-panel {
    min-height: 30px;
    border-bottom: 1px solid #ddd;
    line-height: 30px;
    display: flex;
    justify-content: space-between;
    .refusedReason {
      line-height: 24px;
    }
    .port-search {
      margin-right: 10px;
    }
  }
  .price-panel {
    min-height: 30px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 5px;
    line-height: 30px;
    margin-bottom: 5px;
  }
}
.passCheck {
  color: #33b18a;
}
.refusedCheck {
  color: #e63923;
}
.waitCheckBg {
  background: #ebeef3;
}
.passCheckBg {
  background: #eaf1e8;
}
.refusedCheckBg {
  background: #fff3f2;
}
.activeBtn {
  background: #1682e6;
  border-color: #1682e6;
  color: #ffffff;
  outline: none;
}
.el-button--success:hover,
.el-button--success:focus {
  background: #33b18a;
  border-color: #33b18a;
  color: #ffffff;
}
.changeBtn {
  &:nth-of-type(1) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &:nth-of-type(2) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
.el-button--default {
  &:hover {
    color: #33b18a;
    border-color: #33b18a;
    background-color: #f5fffc;
  }
}
.changeBtn + .changeBtn {
  margin-left: 0 !important;
}
.serialNum {
  background: #1890ff;
  display: inline-block;
  color: #fff;
  width: 20px;
  height: 18px;
  border-radius: 25%;
  line-height: 18px;
  text-align: center;
  font-size: 14px;
  margin-top: 5px;
  margin-left: 10px;
}
</style>