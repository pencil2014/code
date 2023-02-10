<!--
 * @Description: 年度计划表格
 * @Autor: yinjunying
 * @Date: 2022-04-25 11:00:13
-->
<template>
  <div class="table-wrapper">
    <template v-if="dataList.length">
      <el-card v-for="(item, index) in dataList" :key="index" :id="`box-card`+ index" class="mb5 box-card">
        <div slot="header"
          :class="['clearfix', item.verifyStatus === 'pass' ? 'passCheckBg' : item.verifyStatus === 'refuse' ? 'refusedCheckBg' : 'waitCheckBg']">
          <div class="left-title">
            <span class="cust-name">{{index+1}}. {{ item.custName }}</span>
            <span class="industry">
              <template v-if="item.isWhitelist === 'yes'">
                <img src="~@/assets/white.png" alt="" /> {{ item.industry }}
              </template>
              <template v-else>
                {{ item.industry ? `所属行业：${ formatterIndustry(item.industry) }` : '' }}
              </template>
            </span>
          </div>
          <div class="right-title">
            <span>
              <span class="ml10"><b>{{ item.year }}年度计划</b></span>
              <span v-if="['draft'].includes(item.verifyStatus)" class="ml10"><i class="el-icon-edit"></i> <span
                  v-text='formatterStatus(item.verifyStatus)'></span></span>
              <span v-if="['submit', 'submit_manager'].includes(item.verifyStatus)" class="ml10"><i class="el-icon-time"></i> <span
                  v-text='formatterStatus(item.verifyStatus)'></span></span>
              <span v-if="['pass'].includes(item.verifyStatus)" class="ml10 passCheck"><i class="el-icon-success"></i> <span
                  v-text='formatterStatus(item.verifyStatus)'></span></span>
              <span v-if="['refuse'].includes(item.verifyStatus)" class="ml10 refusedCheck"><i class="el-icon-error"></i> <span
                  v-text='formatterStatus(item.verifyStatus)'></span></span>
            </span>
            <template v-if="!['submit', 'submit_manager'].includes(item.verifyStatus) && item.isSelf">
              <el-button type="warning" size="mini" class="ml10" @click="handleEdit('edit', item)">编辑</el-button>
            </template>
            <el-button type="primary" size="mini" class="ml10" @click="handleEdit('copy', item)">复制
            </el-button>
            <el-popconfirm v-if="['submit', 'refuse', 'draft'].includes(item.verifyStatus) && item.isSelf" title="删除该年度计划将不可恢复，确定删除？"
              @onConfirm="handleDelete(item.oid)">
              <el-button slot="reference" type="danger" size="mini" class="ml10">删除</el-button>
            </el-popconfirm>
            <template
              v-if="(['submit'].includes(item.verifyStatus) && isLeader) || (['submit_manager'].includes(item.verifyStatus) && isManager)">
              <el-popconfirm title="确定审核通过？" @onConfirm="handleCheck('pass', item.oid)">
                <el-button slot="reference" type="success" size="mini" class="ml10">审核通过</el-button>
              </el-popconfirm>
              <el-popconfirm title="确定审核拒绝？" @onConfirm="handleCheck('refuse', item.oid)">
                <el-button slot="reference" type="danger" size="mini" class="ml10">审核拒绝</el-button>
              </el-popconfirm>
            </template>
            <el-button v-if="item.isShow" type="text" @click="panelSwitch(index)">收起
              <i class="el-icon-arrow-up el-icon--right"></i>
            </el-button>
            <el-button v-else type="text" @click="panelSwitch(index)">展开
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>
        <el-collapse-transition>
          <div class="item mb10" v-show="item.isShow">
            <div class="create-panel">
              <div>
                <span class="ml10">
                  {{ item.createdName }} {{ item.createdTime }} 创建
                </span>
                <template v-if="['pass'].includes(item.verifyStatus)">
                  <span class="ml10">
                    {{ item.verifyName }} {{ item.verifyTime }}
                    <span class="passCheck" v-text='formatterStatus(item.verifyStatus)'></span>
                  </span>
                </template>
                <template v-if="['refuse'].includes(item.verifyStatus)">
                  <span class="ml10">
                    {{ item.verifyName }}{{ item.verifyTime }}
                    <span class="refusedCheck" v-text='formatterStatus(item.verifyStatus)'></span>
                  </span>
                </template>
                <p class="ml10 refusedReason refusedCheck" v-if="['refuse'].includes(item.verifyStatus)">
                  拒绝原因：{{ item.verifyRemarks }}
                </p>
              </div>
              <div class="port-search">
                <template v-if="['pass'].includes(item.verifyStatus)">
                  <el-button :type="item.isShowTotal ? 'success' : 'default'" size="mini" class="ml10 changeBtn"
                    @click="showDetail(true, item, index)">汇总</el-button>
                  <el-button :type="!item.isShowTotal ? 'success' : 'default'" size="mini" class="changeBtn"
                    @click="showDetail(false, item, index)">明细</el-button>
                </template>
              </div>
            </div>
            <div v-if="!item.isShowTotal" class="port-item">
              <div class="port-item-box">
                <div class="port-title port-title-noPass">
                  起运港 --> 目的港：
                </div>
                <div class="port-checkbox">
                  <span v-for="(portItem, portIndex) in item.portList" :key="portIndex">
                    <el-button v-if="portItem.polPortName && portItem.podPortName" type="primary" size="mini" plain
                      :class="[portIndex ? `ml5` : '', `mb5 port-btn port-btn`+portIndex]" @click="changePortList(index, portIndex)">
                      {{ portItem.polPortName }} --> {{ portItem.podPortName }}
                    </el-button>
                  </span>
                </div>
              </div>
            </div>
            <div v-else-if="item.isShowTotal && isDetail" class="port-item">
              <div class="port-item-box">
                <div class="port-title port-title-pass">
                  航线：
                </div>
                <div class="port-checkbox">
                  <el-checkbox-group v-model="item.lineInfoList" size="mini" @change="(v) => changePolInfoList(v, item, 'line')">
                    <el-checkbox label="" border>全部</el-checkbox>
                    <template v-for="(portItem, portIndex) in item.lineInfoListAll">
                      <el-checkbox v-if="portItem.lineName && portItem.lineCode" :key="portIndex" :label="portItem.lineCode" border>
                        {{portItem.lineName}}</el-checkbox>
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
                    <el-checkbox v-for="(portItem, portIndex) in item.polInfoListAll" :key="portIndex" :label="portItem.polPortCode" border>
                      {{portItem.polPortName}}</el-checkbox>
                  </el-checkbox-group>
                </div>

              </div>
              <div class="port-item-box">
                <div class="port-title port-title-pass">
                  目的港：
                </div>
                <div class="port-checkbox">
                  <el-checkbox-group v-model="item.podInfoList" size="mini" @change="(v) => changePolInfoList(v, item, 'pod')">
                    <el-checkbox label="" border>全部</el-checkbox>
                    <el-checkbox v-for="(portItem, portIndex) in item.podInfoListAll" :key="portIndex" :label="portItem.podPortCode" border>
                      {{portItem.podPortName}}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </div>
            <div class="port-table">
              <el-table :data.sync="item.curList" border fit v-loading="item.tableLoading" :element-loading-text="eLoadingText"
                :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
                <el-table-column v-for="(colItem, colIndex) in columnsData" :key="colIndex" :prop="colItem.prop" :label="colItem.label"
                  :fixed="colItem.fixed" :width="colItem.width" :min-width="colItem.minWidth" align="center" header-align="center">
                </el-table-column>
              </el-table>
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
    <annualPlanDialog v-if="annualPlanObj.show" :options="annualPlanObj" :custid="custid" @getList="getList">
    </annualPlanDialog>
    <!-- 填写审核拒绝原因 -->
    <CrmDialog v-if="checkRefusedDialog.show" :option="checkRefusedDialog" @close="confirmCheckRefused"></CrmDialog>
  </div>
</template>

<script>
import annualPlanDialog from "@/views/crm/merchantManagement/customerList/detailTabs/annualPlanDialog"
import CrmDialog from '@/views/crm/components/crmDialog'
import { columnsData } from '@/views/crm/data/annualPlan'
import annualPlanApi from '@/api/crm/annualPlan'
import { formatIndustry } from "@/utils/crm"
export default {
  components: {
    annualPlanDialog,
    CrmDialog
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
    custid: {
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
        custid: ''
      },
      checkRefusedDialog: {
        title: '审核拒绝原因',
        show: false,
        showClear: true,
        btnLoading: false,
        formItems: [
          {
            label: '拒绝原因',
            type: 'textarea',
            prop: 'refusedReason',
            maxlength: 512,
            rules: [
              { required: true, message: '拒绝原因必填', trigger: 'blur' },
              { max: 512, message: '拒绝原因最大长度限制512位', trigger: 'blur' }
            ]
          }
        ],
        form: { refusedReason: '' }
      },
      isManager: false,
      isLeader: false,
      roles: [],
      lineInfoList: [],
      polInfoList: [],
      podInfoList: []
    }
  },
  created () {
    this.columnsData = [...columnsData]

  },
  watch: {
    data (nval) {
      this.dataList = nval
      if (this.dataList.length) {
        this.roles = sessionStorage.getItem('annualPlanRoles')
        this.isManager = this.roles.includes('manager')
        this.isLeader = this.roles.includes('leader')
        this.dataList.forEach((item, index) => {
          item.isShow = true
          if (item.verifyStatus === 'pass') {
            item.isShowTotal = true
          }
          this.$set(item, 'lineInfoList', [''])
          this.$set(item, 'polInfoList', [''])
          this.$set(item, 'podInfoList', [''])
          this.$set(item, 'isShow', true)
          this.$set(item, 'tableLoading', false)
          this.$forceUpdate()
          if (item.portList && item.portList.length) {
            item.portList.forEach((porItem, proIndex) => {
              // this.setPercent(porItem)
              if (item.verifyStatus === 'pass') {
                this.setPortUnique(item)
              } else {
                if (proIndex === 0) {
                  if (porItem.polPortName && porItem.podPortName) {
                    setTimeout(() => {
                      document.getElementById(`box-card${index}`).getElementsByClassName(`port-btn0`)[proIndex].classList.add('activeBtn')
                    }, 500)
                  }
                }
              }
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
     * @description: 转化年度计划格式
     * @param {*} str
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-14 11:55:13
     */
    formatterIndustry (str) {
      return formatIndustry(str)
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
     * @description: 转换年度计划状态，后台返的是英文
     * @param {*} val 状态英文值
     * @return {*} 转换后的状态
     * @author: yinjunying
     * @Date: 2022-05-07 09:29:01
     */
    formatterStatus (val) {
      if (val) {
        if (val === 'submit') return '待主管审核'
        if (val === 'submit_manager') return '待经理审核'
        if (val === 'refuse') return '审核拒绝'
        if (val === 'pass') return '审核通过'
        if (val === 'draft') return '草稿'
      } else {
        return ''
      }
    },
    /**
     * @description: 卡片的收起展示
     * @param {*} index 卡片索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-26 10:29:06
     */
    panelSwitch (index) {
      this.dataList[index].isShow = !this.dataList[index].isShow
      this.$forceUpdate()
    },
    /**
     * @description: 切换起运港->目的港tab
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
     * @description: 切换航线、起运港、目的港
     * @param {*} val 选中集合
     * @param {*} item 年度计划数据
     * @param {*} type 切换类型
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-27 17:12:56
     */
    changePolInfoList (val, item, type) {
      if (val.includes('')) {
        if (val.indexOf('')) {
          if (type === 'line') this.$set(item, 'lineInfoList', [''])
          if (type === 'pol') this.$set(item, 'polInfoList', [''])
          if (type === 'pod') this.$set(item, 'podInfoList', [''])
          val = ['']
        } else if (val.indexOf('') <= 0 && val.length > 1) {
          val.splice(val.findIndex(item => item === ''), 1)
        }
      }
      this.searchTotal(item)
    },
    /**
     * @description: 航线、起运港、目的港去重
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
    },
    /**
     * @description: 在长帆占比和中标率后面加“%”
     * @param {*} porItem 航线信息
     * @return {*} 
     * @author: yinjunying
     * @Date: 2022-06-02 15:29:51
     */
    // setPercent (porItem) {
    //   this.columnsData.forEach(colItem => {
    //     if (colItem.prop !== 'ordinate') {
    //       porItem.data.forEach((monItem, monIndex) => {
    //         if ([3, 8].includes(monIndex)) {
    //           if (porItem.data[monIndex][colItem.prop]) {
    //             if (!porItem.data[monIndex][colItem.prop].includes('%')) {
    //               porItem.data[monIndex][colItem.prop] += '%'
    //             }
    //           } else {
    //             porItem.data[monIndex][colItem.prop] = ''
    //           }
    //         }
    //       });
    //     }
    //   })
    // },
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
                if (item.portList && item.portList.length) {
                  item.portList.forEach(porItem => {
                    // this.setPercent(porItem)
                  })
                }
              }
            }
            this.$set(item, 'lineInfoList', [''])
            this.$set(item, 'polInfoList', [''])
            this.$set(item, 'podInfoList', [''])
            this.$set(item, 'isShow', true)
            this.$set(item, 'curList', item.portList[0].data)
            this.$set(item, 'isSelf', item.createdBy === this.$store.state.user.userId)
            this.$set(item, 'isShowTotal', isShowTotal)
            if (item.portList.length && item.portList[0].polPortName && item.portList[0].podPortName && !isShowTotal) {
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
     * @description: 查看单条汇总数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-30 17:17:22
     */
    searchTotal (item) {
      let data = {
        planId: item.oid,
        currPage: 1,
        custid: item.custid
      }
      let arr = ['lineInfoList', 'podInfoList', 'polInfoList']
      arr.forEach(ele => {
        if (item[ele] && item[ele].length && !(item[ele].length === 1 && item[ele].includes(''))) {
          if (ele === 'lineInfoList') data.lineCodes = item[ele]
          if (ele === 'podInfoList') data.podPortCodes = item[ele]
          if (ele === 'polInfoList') data.polPortCodes = item[ele]
        }
        if (!item[ele].length) { //如果全不选，给后台标记
          if (ele === 'lineInfoList') data.lineUncheck = true
          if (ele === 'podInfoList') data.podPortUncheck = true
          if (ele === 'polInfoList') data.polPortUncheck = true
        }
      })
      item.tableLoading = true
      annualPlanApi['queryYearlyPlanList'](data).then((res) => {
        if (res.code === 0) {
          let arr = []
          if (res.data.list && res.data.list.length) {
            arr = res.data.list[0]
            if (arr.count.portList && arr.count.portList.length) {
              item.portList = arr.count.portList
              item.curList = arr.count.portList[0].data || []
              if (item.portList && item.portList.length) {
                item.portList.forEach(porItem => {
                  // this.setPercent(porItem)
                })
              }
            } else {
              item.portList = []
              item.curList = []
            }
          } else {
            item.portList = []
            item.curList = []
          }
        }
      }).catch(() => { })
        .finally(() => {
          item.tableLoading = false
        })
    },
    /**
     * @description: 编辑/复制年度计划
     * @param {*} type edit-编辑 copy-复制
     * @param {*} oid 年度计划主键
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-29 14:24:29
     */
    handleEdit (type, row) {
      this.annualPlanObj.show = true
      this.annualPlanObj.type = type
      this.annualPlanObj.title = type === 'edit' ? '编辑' : type === 'copy' ? '复制' : ''
      this.annualPlanObj.oid = row.oid
      this.annualPlanObj.custid = row.custid
    },
    /**
     * @description: 删除年度计划
     * @param {*} oid 年度计划主键
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-29 15:03:50
     */
    handleDelete (oid) {
      let data = {
        oid: oid,
        custid:this.custid
      }
      annualPlanApi['deleteYearlyPlan'](data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('删除成功！')
            this.$emit('getList')
          }
        })
        .catch(() => { })
        .finally(() => {
        })
    },
    /**
     * @description: 审核
     * @param {*} type pass-通过 refuse-拒绝
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-29 15:06:06
     */
    handleCheck (type, oid) {
      this.oid = oid
      if (type === 'pass') {
        this.checkAnnualPlan(type, oid)
      } else if (type === 'refuse') {
        this.checkRefusedDialog.show = true
      }
    },
    /**
     * @description: 调用审核接口
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-07 12:19:24
     */
    checkAnnualPlan (type, oid) {
      let data = {
        oid: oid,
        status: type,
        custid:this.custid,
        reason: this.checkRefusedDialog.form.refusedReason || ''
      }
      annualPlanApi['verifyYearlyPlan'](data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('审核成功！')
            this.$emit('getList')
            if (type === 'refuse') {
              this.closeCheckRefused()
            }
          }
        })
        .catch(() => { })
        .finally(() => {
        })
    },
    /**
     * @description: 确认审核拒绝
     * @param {*} tag 
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-29 15:29:48
     */
    confirmCheckRefused (tag) {
      if (!tag) {
        return this.closeCheckRefused()
      }
      // 调用审核拒绝接口
      this.checkAnnualPlan('refuse', this.oid)
    },
    /**
     * @description: 关闭拒绝原因弹框
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-29 15:31:34
     */
    closeCheckRefused () {
      this.checkRefusedDialog.show = false
      this.checkRefusedDialog.form.refusedReason = ''
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
        flex: 0 0 53px;
      }
      .port-title-noPass {
        flex: 0 0 118px;
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
          .el-checkbox__label {
            padding-left: 0;
            color: #1890ff !important;
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
        }
      }
    }
  }
  .port-table {
    padding: 0 10px;
  }
  .create-panel {
    min-height: 30px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 5px;
    line-height: 30px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    .refusedReason {
      line-height: 24px;
    }
    .port-search {
      margin-right: 10px;
    }
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
</style>