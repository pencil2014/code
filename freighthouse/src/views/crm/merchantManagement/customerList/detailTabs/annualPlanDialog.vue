<!--
 * @Description: 新增/编辑年度计划弹框
 * @Autor: yinjunying
 * @Date: 2022-04-26 14:49:41
-->
<template>
  <div>
    <el-dialog :before-close="cancel" v-loading="lsLoading" :visible.sync="options.show" class="annual-plan-add"
      :title="`${options.title}客户需求`" modal-append-to-body='false' width="1000px">
      <div class="header-box">
        <div class="year-box">
          <el-form :inline="true" :model="formData" label-width="100px" class="annual-plan-form" ref="annualPlanForm" size="mini">
            <el-form-item label="年度:" required>
              <el-date-picker v-model="formData.year" type="year" value-format="yyyy" placeholder="请选择年度" class="middle-item"
                style="width: 200px" :disabled="['edit'].includes(options.type)" :picker-options="pickerOptions">
              </el-date-picker>
            </el-form-item>
          </el-form>
        </div>
        <div class="import-box">
          <el-button type="primary" size="mini" class="mini-btn" @click="importData">导入数据</el-button>
          <el-button v-if="options.type === 'edit'" type="success" size="mini" class="mini-btn" @click="handleDownload">导出数据</el-button>
          <el-button v-else type="success" size="mini" class="mini-btn" @click="handleTempDownload">下载导入模板</el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <el-card v-for="(item, index) in formData.portList" :key="index" :id="`edit-box-card`+ index" class="mb5 edit-box-card">
          <div slot="header" class="clearfix">
            <div class="left-title">
              <el-form :inline="true" :model="item" label-width="80px" class="annual-plan-form" :ref="`portForm${index}`">
                <el-form-item label="起运港:" required>
                  <el-select v-model="item.polPortCode" placeholder="请选择起运港" filterable remote collapse-tags clearable value-key="portCode"
                    :remote-method="(str) => { getPort(str, 'port_of_basic', index) }" @visible-change="(v) => showPolport(v, index)"
                    @change="(v) => changePort(v, index, 'port_of_basic')">
                    <el-option v-for="optionItem in polList" :label="`${optionItem.ename}(${optionItem.cname})`"
                      :value="optionItem.portCode" :key="optionItem.portCode">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="目的港:" required>
                  <el-select v-model="item.podPortCode" placeholder="请选择目的港" filterable remote collapse-tags clearable value-key="portCode"
                    :remote-method="(str) => { getPort(str, 'port_of_destination', index)}" @visible-change="(v) => showPodport(v, index)"
                    @change="(v) => changePort(v, index, 'port_of_destination')">
                    <el-option v-for="optionItem in podList" :label="`${optionItem.ename}(${optionItem.cname})`"
                      :value="optionItem.portCode" :key="optionItem.portCode">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="系统航线:">
                  <el-input v-model="item.lineName" disabled style="width: 130px"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="right-title">
              <i class="el-icon-circle-plus" title="新增" @click="addPort"></i>
              <el-popconfirm v-if="formData.portList.length === 1 ? index : index > -1" title="确定移除该航线信息吗？" @onConfirm="removePort(index)">
                <i slot="reference" class="el-icon-remove" title="移除"></i>
              </el-popconfirm>
              <el-button v-if="item.isShow" type="text" @click="changeShow(item, false)">收起
                <i class="el-icon-arrow-up el-icon--right"></i>
              </el-button>
              <el-button v-else type="text" @click="changeShow(item, true)">展开
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="item.isShow" class="card-table-list">
              <vxe-table :ref="`xTable${index}`" :data.sync="item.data" border fit class="card-table" size="mini" show-footer keep-source
                :footer-method="(v) => footerMethod(v, index)"
                :edit-config="{trigger: 'click', mode: 'cell', showIcon: false, activeMethod: activeCellMethod }"
                @edit-closed="(v) => editClosedEvent(v, index)">
                <vxe-column v-for="(colItem, colIndex) in columnsData" :key="colIndex" :field="colItem.prop" :title="colItem.label"
                  align="center" header-align="center" :width="colItem.width" :min-width="colItem.minWidth" :fixed="colItem.fixed"
                  :edit-render="{autofocus: '.vxe-input--inner'}">
                  <template #edit="{ row, rowIndex }" v-if="!['ordinate', 'total'].includes(colItem.prop)">
                    <vxe-input v-if="[4,5].includes(rowIndex)" v-model="row[colItem.prop]" type="integer" min='0' :controls="false">
                    </vxe-input>
                    <vxe-input v-else v-model="row[colItem.prop]" type="number" min='0' :controls="false"></vxe-input>
                  </template>
                  <template #default="{ row, rowIndex }" v-else-if="['total'].includes(colItem.prop)">
                    <span>{{ countAmount(row, rowIndex, index) }}</span>
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
          </el-collapse-transition>
        </el-card>
      </div>
      <div class="table-wrapper">
        <el-form :inline="true" :model="formData" label-width="60px" class="annual-plan-remark-form" size="mini">
          <el-form-item label="备注:">
            <el-input type="textarea" v-model="formData.remarks" placeholder="请输入备注（限512个字）" maxlength="512" show-word-limit
              :autosize="{ minRows: 2, maxRows: 4}"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button v-if="['draft', ''].includes(formData.verifyStatus)" size="mini" type="primary" :loading="draftLoading"
          @click="handleSave(true)">暂存
        </el-button>
        <el-button size="mini" type="success" @click="handleSave(false)" :loading="saveLoading">提交</el-button>
        <el-button size="mini" @click="cancel">取消</el-button>
      </div>
      <!-- 导入数据 -->
      <annualPlanImport v-if="importOptions.show" :options="importOptions" @sendPortData="getPortData"></annualPlanImport>
    </el-dialog>
  </div>
</template>

<script>
import { portList, portSystemLineInfo } from '@/api/base'
import { columnsData } from '@/views/crm/data/annualPlan'
import annualPlanApi from '@/api/crm/annualPlan'
import annualPlanImport from './annualPlanImportDialog'
const reg = /^\d+(?:\.\d{0,2})?/
let date = new Date()
let currcentYear = date.getFullYear()
let goalYear = Number(currcentYear + 1)
export default {
  components: {
    annualPlanImport
  },
  props: {
    options: {
      type: Object,
      default: () => { }
    },
    custid: ''
  },

  data () {
    return {
      columnsData: [],
      formData: {
        oid: '',
        year: '',
        remarks: '',
        verifyStatus: '',
        portList: [
          {
            // gainRateData: [], //中标率那一行的数据集合
            isShow: true,
            polPortCode: '',
            polPortName: '',
            podPortCode: '',
            podPortName: '',
            lineCode: '',
            lineName: '',
            data: [
              {
                ordinate: '客户预计T量(总)',
                ordinateCode: 'CUSTOMER_ACTUAL_TEU',
                jan: null,
                feb: null,
                mar: null,
                apr: null,
                may: null,
                jun: null,
                jul: null,
                aug: null,
                sept: null,
                oct: null,
                nov: null,
                dec: null,
                total: null
              },
              {
                ordinate: '客户预计T量(端到端)',
                ordinateCode: 'CUSTOMER_ACTUAL_TEU_ENDPOINT',
                jan: null,
                feb: null,
                mar: null,
                apr: null,
                may: null,
                jun: null,
                jul: null,
                aug: null,
                sept: null,
                oct: null,
                nov: null,
                dec: null,
                total: null
              },
              {
                ordinate: '长帆目标T(总）',
                ordinateCode: 'LONG_SAIL_TARGET_TEU',
                jan: null,
                feb: null,
                mar: null,
                apr: null,
                may: null,
                jun: null,
                jul: null,
                aug: null,
                sept: null,
                oct: null,
                nov: null,
                dec: null,
                total: null
              },
              {
                ordinate: '长帆目标T量(端到端)',
                ordinateCode: 'LONG_SAIL_TARGET_TEU_ENDPOINT',
                jan: null,
                feb: null,
                mar: null,
                apr: null,
                may: null,
                jun: null,
                jul: null,
                aug: null,
                sept: null,
                oct: null,
                nov: null,
                dec: null,
                total: null
              },
              // {
              //   ordinate: '长帆实际T量',
              //   ordinateCode: 'LONG_SAIL_ACTUAL_TEU',
              //   jan: null,
              //   feb: null,
              //   mar: null,
              //   apr: null,
              //   may: null,
              //   jun: null,
              //   jul: null,
              //   aug: null,
              //   sept: null,
              //   oct: null,
              //   nov: null,
              //   dec: null,
              //   total: null
              // },
              // {
              //   ordinate: '长帆实际T量-端到端',
              //   ordinateCode: 'LONG_SAIL_ACTUAL_TEU_ENDPOINT',
              //   jan: null,
              //   feb: null,
              //   mar: null,
              //   apr: null,
              //   may: null,
              //   jun: null,
              //   jul: null,
              //   aug: null,
              //   sept: null,
              //   oct: null,
              //   nov: null,
              //   dec: null,
              //   total: null
              // },
              // {
              //   ordinate: '实际T量完成率',
              //   ordinateCode: 'ACTUAL_TEU_COMPLETE_RATE',
              //   jan: null,
              //   feb: null,
              //   mar: null,
              //   apr: null,
              //   may: null,
              //   jun: null,
              //   jul: null,
              //   aug: null,
              //   sept: null,
              //   oct: null,
              //   nov: null,
              //   dec: null,
              //   total: null
              // },
              // {
              //   ordinate: '实际T量完成率-端到端',
              //   ordinateCode: 'ACTUAL_TEU_COMPLETE_RATE_ENDPOINT',
              //   jan: null,
              //   feb: null,
              //   mar: null,
              //   apr: null,
              //   may: null,
              //   jun: null,
              //   jul: null,
              //   aug: null,
              //   sept: null,
              //   oct: null,
              //   nov: null,
              //   dec: null,
              //   total: null
              // },
              // {
              //   ordinate: '长帆占比',
              //   ordinateCode: 'LONG_SAIL_RATE',
              //   jan: null,
              //   feb: null,
              //   mar: null,
              //   apr: null,
              //   may: null,
              //   jun: null,
              //   jul: null,
              //   aug: null,
              //   sept: null,
              //   oct: null,
              //   nov: null,
              //   dec: null,
              //   total: null
              // },
              // {
              //   ordinate: '长帆占比-端到端',
              //   ordinateCode: 'LONG_SAIL_RATE_ENDPOINT',
              //   jan: null,
              //   feb: null,
              //   mar: null,
              //   apr: null,
              //   may: null,
              //   jun: null,
              //   jul: null,
              //   aug: null,
              //   sept: null,
              //   oct: null,
              //   nov: null,
              //   dec: null,
              //   total: null
              // },
            ]
          }
        ]
      },
      polList: [],
      podList: [],
      modifiedRows: [],
      draftLoading: false,
      saveLoading: false,
      importOptions: {
        show: false
      },
      pickerOptions:{
        disabledDate(date) {
            return date.getTime() < Date.now() - 8.64e7  || date.getFullYear() > currcentYear+1
          }
      }
    }
  },
  created () {
    this.columnsData = [...columnsData]
    if (this.options.oid) {
      this.getAnnualPlanInfo()
    } else {
      this.formData.year = this.getCurYear()
    }
  },
  methods: {
    /**
     * @description: 打开导入弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-01 14:14:51
     */
    importData () {
      this.importOptions.show = true
    },
    /**
     * @description: 下载导入模板
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-01 14:15:14
     */
    handleTempDownload () {
      this.$store.dispatch('order/downloadBlobFile', {
        uri: '/crm/yearlyPlan/temp/download',
        params: {
          folder: 'excel',
          fileName: 'inspectionCiq_temp.xlsx'
        }
      }).then(res => {
        let link = document.createElement("a")
        link.href = window.URL.createObjectURL(res);
        link.download = "年度计划导入模板.xlsx"
        link.click()
      })
    },
    handleDownload () {
      let data = {
        planId: this.options.oid
      }
      annualPlanApi['exportSpecificCustomers'](data)
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
     * @description: 接收导入数据
     * @param {*} data 目标数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-06 09:22:34
     */
    getPortData (data) {
      this.formData.portList = data
      this.formData.portList.forEach((item, index) => {
        this.$set(item, 'podPortName', item.pod)
        this.$set(item, 'podPortCode', item.podCode)
        this.$set(item, 'polPortName', item.pol)
        this.$set(item, 'polPortCode', item.polCode)
        this.$set(item, 'isShow', true)
        this.getPort('', 'port_of_basic', index)
        this.getPort('', 'port_of_destination', index)
        // 处理中标率哪一行
        // if (item.data.length === 7) {
        //   item.data.splice(6, 1)
        // }
        // 处理长帆占比数据格式，加上%
        // item.data.forEach((dataItem, dataIndex) => {
        //   if ([2].includes(dataIndex)) {
        //     for (let key in dataItem) {
        //       if (!['ordinate', 'ordinateCode'].includes(key)) {
        //         if (dataItem[key]) {
        //           dataItem[key] += '%'
        //         }
        //       }
        //     }
        //   }
        // })
      })
    },
    /**
     * @description: 获取当前年份，新增时给默认年度
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-07 14:31:27
     */
    getCurYear () {
      let nowDate = new Date()
      return nowDate.getFullYear() + ''
    },
    /**
     * @description: 切换收起/展开 需强制刷新页面，不然会没反应
     * @param {*} item
     * @param {*} isShow
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-14 14:45:12
     */
    changeShow (item, isShow) {
      item.isShow = isShow
      this.$forceUpdate()
    },
    /**
     * @description: 获取单个年度计划详情
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-07 14:32:00
     */
    getAnnualPlanInfo () {
      let data = {
        oid: this.options.oid,
        custid:this.custid || this.$route.query.custid || this.options.custid
      }
      this.lsLoading = true
      annualPlanApi['queryYearlyPlan'](data)
        .then((res) => {
          if (res.code === 0) {
            this.formData = { ...res.data } || {}
            if (this.formData.portList && this.formData.portList.length) {
              this.formData.portList.forEach((item, index) => {
                // 默认展开全部年度计划
                this.changeShow(item, true)
                item.data.splice(4) //删除多余的行,只有四行是需要填写的
                this.getPort('', 'port_of_basic', index)
                this.getPort('', 'port_of_destination', index)
                // 复制时，清空指定的项 “年度、目标T量、目标USD、投标次数、中标次数”的数据自动清空
                if (this.options.type === 'copy') {
                  this.$set(this.formData, 'verifyStatus', '')
                  this.$set(this.formData, 'year', '')
                  item.data.forEach((dataItem, dataIndex) => {
                    if ([4, 5,6,7,8,9].includes(dataIndex)) {
                      for (let key in dataItem) {
                        if (!['ordinate', 'ordinateCode'].includes(key)) {
                          dataItem[key] = ''
                        }
                      }
                    }
                  })
                } else if (this.options.type === 'edit') {
                  // 处理长帆占比数据格式，加上%
                  // item.data.forEach((dataItem, dataIndex) => {
                  //   if ([2].includes(dataIndex)) {
                  //     for (let key in dataItem) {
                  //       if (!['ordinate', 'ordinateCode'].includes(key)) {
                  //         if (dataItem[key]) {
                  //           dataItem[key] += '%'
                  //         }
                  //       }
                  //     }
                  //   }
                  // })
                }
                this.$forceUpdate()
              })
            }
          }
        })
        .catch(() => { })
        .finally(() => {
          this.lsLoading = false
        })
    },
    /**
     * @description: 起运港下拉框出现/隐藏时触发
     * @param {Boolean} isShow true-出现 false-隐藏
     * @param {Number} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-28 16:04:29
     */
    showPolport (isShow, index) {
      if (isShow) {
        this.getPort('', 'port_of_basic', index)
      }
    },
    /**
     * @description: 目的港下拉框出现/隐藏时触发
     * @param {Boolean} isShow true-出现 false-隐藏
     * @param {Number} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-28 16:04:29
     */
    showPodport (isShow, index) {
      if (isShow) {
        this.getPort('', 'port_of_destination', index)
      }
    },
    /**
     * @description: 获取港口下拉选项
     * @param {String} str 已知港口名
     * @param {String} type 起运港-port_of_basic 目的港-port_of_destination
     * @param {Number} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-28 16:02:19
     */
    getPort (str = '', type, index) {
      if (str === '') {
        str = type === 'port_of_basic' ? this.formData.portList[index].polPortCode : this.formData.portList[index].podPortCode
      }
      const data = {
        portName: str,
        portAttribute: type,
        portCodes: '',
        state: 'valid'
      }
      portList(data)
        .then((res) => {
          if (type === 'port_of_basic') {
            this.polList = res.data || []
            if (this.polList.length) {
              this.polList.forEach(item => {
                item.ename = item.ename.trim()
                item.cname = item.cname.trim()
              });
            }
          } else {
            this.podList = res.data || []
            if (this.podList.length) {
              this.podList.forEach(item => {
                item.ename = item.ename.trim()
                item.cname = item.cname.trim()
              });
            }
          }
        })
        .catch(() => { })
    },
    /**
     * @description: 获取系统航线信息
     * @param {*} item 
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-25 10:16:58
     */
    getLineInfo (item) {
      portSystemLineInfo(item.podPortCode).then((res) => {
        if (res.code === 0) {
          if (res.data && res.data.length) {
            item.lineCode = res.data[0].sysLineCode
            item.lineName = res.data[0].cname || res.data[0].ename
          }
        }
      })
    },
    /**
     * @description: 新增航线
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-26 17:02:28
     */
    addPort () {
      this.formData.portList.push(this.$options.data.call(this).formData.portList[0])
    },
    /**
     * @description: 移除航线
     * @param {Number} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-27 12:05:34
     */
    removePort (index) {
      this.formData.portList.splice(index, 1)
    },
    /**
     * @description: 自动计算合计数
     * @param {Object} row 当前行数据
     * @param {Number} rowIndex 当前行索引
     * @return {Number} 该行总合计数
     * @author: yinjunying
     * @Date: 2022-04-27 17:43:04
     */
    countAmount (row, rowIndex, index) {
      let total = null
      this.columnsData.forEach(ele => {
        if (!['ordinate', 'total'].includes(ele.prop) && row[ele.prop]) {
          total += Number(row[ele.prop].toString().match(reg));
        }
      });
      // if (rowIndex === 2) { 
      //   if (this.formData.portList[index].data[1]['total'] && this.formData.portList[index].data[0]['total']) {
      //     total = Number(this.formData.portList[index].data[1]['total'] / this.formData.portList[index].data[0]['total'] * 100).toString().match(reg) + '%'
      //   } else {
      //     total = null
      //   }
      // }
      row['total'] = total || null
      return total
    },
    /**
     * @description: 设置单元格不可编辑
     * @param {Number} columnIndex 列索引
     * @param {Number} rowIndex 行索引
     * @return {Boolean} true-能编辑 false-不能编辑
     * @author: yinjunying
     * @Date: 2022-04-27 17:57:22
     */
    activeCellMethod ({ columnIndex, rowIndex }) {
      //获取当前的年份和月份，只能修改当前月份之后的数据
      let year  = this.formData.year
      let currentMonth = date.getMonth()
      if(currcentYear == year){
        if(columnIndex < currentMonth){
          this.$msgWarnClose('选择月份小于当前月份不可填')
          return false
        }
      }
      if (rowIndex > 3) {
        return false
      }
      return true
    },
    /**
     * @description: 计算当前月份中标率
     * @param {Array} data 表格数据
     * @param {String} field 字段名
     * @return {Number} 当前月份中标率 
     * @author: yinjunying
     * @Date: 2022-04-28 14:36:28
     */
    // calRate (data, field) {
    //   let [bidNum, winNum] = [0, 0]
    //   data.forEach((row, rowIndex) => {
    //     if (rowIndex === 4) {
    //       bidNum = row[field]
    //     }
    //     if (rowIndex === 5) {
    //       winNum = row[field]
    //     }
    //   })
    //   if (bidNum) {
    //     if (Number(bidNum) !== 0) {
    //       if (winNum === '0') {
    //         return "0.00%"
    //       } else if ((bidNum === '0' && (winNum !== '0' && winNum !== null)) || (winNum === null)) {
    //         return ''
    //       } else if (winNum !== '0' && winNum !== null) {
    //         return Number((Number(winNum) / Number(bidNum)) * 100).toString().match(reg) + '%'
    //       }
    //     } else if (Number(bidNum) === 0 && Number(winNum) === 0) {
    //       return ''
    //     }
    //   } else {
    //     return ''
    //   }
    // },
    /**
     * @description: 表格底部中标率处理
     * @param {Array} columns 列集合
     * @param {Array} data 数据集合
     * @return {Array} 各列中标率集合
     * @author: yinjunying
     * @Date: 2022-04-28 14:37:36
     */
    // footerMethod ({ columns, data }, index) {
    //   const arr = [
    //     columns.map((column, columnIndex) => {
    //       if (columnIndex === 0) {
    //         return '中标率'
    //       } else {
    //         return this.calRate(data, column.property)
    //       }
    //     })
    //   ]
    //   this.formData.portList[index].gainRateData = [...arr]
    //   return arr
    // },
    /**
     * @description: 切换起运港
     * @param {*} val portCode
     * @param {*} index 航线索引
     * @param {*} type 起运港/目的港
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-06 18:20:55
     */
    changePort (val, index, type) {
      let data = type === 'port_of_basic' ? this.polList : this.podList
      if (val) {
        data.forEach(pItem => {
          if (val === pItem.portCode) {
            if (type === 'port_of_basic') {
              this.formData.portList[index].polPortName = `${pItem.ename}(${pItem.cname})`
            } else {
              this.formData.portList[index].podPortName = `${pItem.ename}(${pItem.cname})`
              this.getLineInfo(this.formData.portList[index])
            }
          }
        })
      } else {
        if (type === 'port_of_basic') {
          this.formData.portList[index].polPortName = ""
        } else {
          this.formData.portList[index].podPortName = ""
          this.formData.portList[index].lineCode = ""
          this.formData.portList[index].lineName = ""
        }
      }
      this.$forceUpdate()
    },
    /**
     * @description: 确定保存数据
     * @param {Boolean} isDraft 是否草稿暂存 false-暂存 true-保存
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-28 18:41:51
     */
    handleSave (isDraft) {
      if (!this.formData.year) {
        this.$msgErrClose("请选择年度！")
        return
      }
      let params = JSON.parse(JSON.stringify(this.formData))
      const isValid = params.portList.every((item, index) => {
        if (!item.polPortCode.length) {
          this.$msgErrClose(`请选择航线${index + 1}的起运港！`)
          return false
        }
        if (!item.podPortCode.length) {
          this.$msgErrClose(`请选择航线${index + 1}的目的港！`)
          return false
        }
        // 判断是否有相同的起运港+目的港数据
        for (let i = 0; i < params.portList.length; i++) {
          for (let j = i + 1; j < params.portList.length; j++) {
            if ((params.portList[i].polPortCode === params.portList[j].polPortCode) && (params.portList[i].podPortCode === params.portList[j].podPortCode)) {
              this.$msgErrClose(`${params.portList[i].polPortName}到${params.portList[i].podPortName}的数据重复！`)
              return false
            }
          }
        }
        return true
      })
      if (isValid) {
        params.isDraft = isDraft
        params.custid = this.custid || this.$route.query.custid || this.options.custid
        // 处理数据格式
        params.portList.forEach((item, index) => {
          // 处理中标率
          // if (item.gainRateData.length) {
          //   let obj = {
          //     ordinateCode: 'WIN_RATE'
          //   }
          //   item.gainRateData[0].forEach((gainItem, gainIndex) => {
          //     if (gainIndex === 0) {
          //       obj[this.columnsData[gainIndex]['prop']] = gainItem
          //     } else {
          //       if (gainItem && gainItem.length) {
          //         if (gainItem.includes('%')) {
          //           obj[this.columnsData[gainIndex]['prop']] = Number(gainItem.split("%")[0])
          //         } else {
          //           obj[this.columnsData[gainIndex]['prop']] = gainItem
          //         }
          //       } else {
          //         obj[this.columnsData[gainIndex]['prop']] = ''
          //       }
          //     }
          //   })
          //   item.data.push(obj)
          //   item.data.forEach(ele => {
          //     this.$delete(ele, '_XID')
          //   })
          //   // 删除不需要的参数
          //   const deleteArr = ['gainRateData', 'isShow']
          //   deleteArr.forEach(ele => {
          //     this.$delete(item, ele)
          //   })
          // }
          // 处理长帆占比，去掉% 2022-5-17
          // if (item.data[2].ordinateCode === 'LONG_SAIL_RATE') {
          //   for (let key in item.data[2]) {
          //     if (!['ordinateCode', 'ordinate'].includes(key)) {
          //       if (item.data[2][key]) {
          //         if (item.data[2][key].includes('%')) {
          //           item.data[2][key] = Number(item.data[2][key].split("%")[0])
          //         }
          //       } else {
          //         item.data[2][key] = ''
          //       }
          //     }
          //   }
          // }
        })
        // 复制保存时，去掉oid
        if (this.options.type === 'copy') {
          params.oid = ''
        }
        //编辑时记录被编辑的行，后台用来判断是否需要重新提交审核
        // if (!isDraft) {
        //   if (this.options.type === 'edit' && ['pass', 'refuse'].includes(this.formData.verifyStatus)) {
        //     if (this.modifiedRows.length) {
        //       params.modifiedRows = this.modifiedRows.join(',')
        //       let auditedRows = ["LONG_SAIL_RATE", "ACTUAL_TEU", "LONG_SAIL_TARGET_TEU", "TARGET_USD"] //需要审核的行
        //       let checkedRows = auditedRows.filter(item => this.modifiedRows.includes(item)) //修改的数据中是否有需要审核的行，如果有，就提示是否需要重新提交审核
        //       if (checkedRows.length) {
        //         this.$confirmWarn(`提交后将不可修改，是否确定提交？`, () => {
        //           this.saveApi(isDraft, params)
        //         })
        //       } else {
        //         this.saveApi(isDraft, params)
        //       }
        //     } else {
        //       this.saveApi(isDraft, params)
        //     }
        //   }
        //   if (['draft', ''].includes(this.formData.verifyStatus)) {
        //     this.$confirmWarn(`提交后将不可修改，是否确定提交？`, () => {
        //       this.saveApi(isDraft, params)
        //     })
        //   }   不需要审核了
        // } else {
          this.saveApi(isDraft, params)
        // }
      }
    },
    /**
     * @description: 调用保存接口
     * @param {*} 请求参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-06 17:00:00
     */
    saveApi (isDraft, data) {
      // 处理航线格式
      if (isDraft) {
        this.draftLoading = true
      } else {
        this.saveLoading = true
      }
      annualPlanApi['addYearlyPlan'](data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('操作成功！')
            this.cancel()
            this.$emit('getList')
          }
        })
        .catch(() => { })
        .finally(() => {
          if (isDraft) {
            this.draftLoading = false
          } else {
            this.saveLoading = false
          }
        })
    },
    /**
     * @description: 单元格编辑状态下被关闭时会触发该事件，用于记录被修改的行信息
     * @param {*} row
     * @param {*} column
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-09 15:11:29
     */
    editClosedEvent ({ row, column }, index) {
      const $table = this.$refs[`xTable${index}`][0]
      const field = column.property
      // 判断单元格值是否被修改
      if ($table.isUpdateByRow(row)) {
        this.modifiedRows.push(row.ordinateCode)
        this.modifiedRows = Array.from(new Set(this.modifiedRows))
      }
      // 计算长帆占比
      // let targetVal = this.formData.portList[index].data[1][field]
      // let totalVal = this.formData.portList[index].data[0][field]
      // if (totalVal) {
      //   if (!['0', '0.00'].includes(totalVal)) {
      //     if (['0', '0.00'].includes(targetVal)) {
      //       this.formData.portList[index].data[2][field] = "0.00%"
      //     } else if ((['0', '0.00'].includes(totalVal) && (!['0', '0.00'].includes(targetVal) && targetVal !== null && targetVal !== '')) || (targetVal === null) || (targetVal === '')) {
      //       this.formData.portList[index].data[2][field] = ''
      //     } else if (targetVal && !['0', '0.00'].includes(targetVal)) {
      //       this.formData.portList[index].data[2][field] = (targetVal / totalVal * 100).toString().match(reg) + '%'
      //     }
      //   } else if (['0', '0.00'].includes(totalVal) && ['0', '0.00'].includes(targetVal)) {
      //     this.formData.portList[index].data[2][field] = ''
      //   }
      // } else {
      //   this.formData.portList[index].data[2][field] = ''
      // }
    },
    /**
     * @description: 关闭新增/编辑年度计划弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-01 16:07:50
     */
    cancel () {
      this.options.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
.mini-btn {
  font-size: 12px;
  height: 20px;
  padding: 3px 7px;
}
.annual-plan-add {
  .header-box {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    .import-box {
      margin-top: 5px;
      margin-right: 20px;
    }
  }
  /deep/ .el-dialog__body {
    padding: 10px 0 10px 10px;
    max-height: 600px;
  }
  /deep/ .el-dialog__footer {
    padding: 10px 24px;
  }
  .annual-plan-form {
    /deep/ .el-form-item {
      margin-top: 4px;
      .el-form-item__content {
        flex: 1;
        .el-input__inner {
          height: 23px !important;
          width: 100%;
          line-height: 22px;
          font-size: 10px;
          padding-right: 10px;
        }
        .el-select {
          width: 200px;
          .el-select__tags {
            height: 23px !important;
            width: 100%;
            line-height: 22px;
            .el-select__input {
              margin-left: 5px;
              height: 20px;
              line-height: 18px;
              font-size: 12px;
            }
            & > span {
              max-width: 80% !important;
            }
            span {
              width: auto;
              .el-tag--small {
                margin-bottom: 7px;
                &:nth-of-type(2) .el-select__tags-text {
                  max-width: 26px;
                }
                .el-select__tags-text {
                  line-height: 14px;
                  max-width: 90%;
                }
                .el-icon-close {
                  top: 2px !important;
                  right: -5px;
                  height: 15px !important;
                  width: 15px !important;
                  line-height: 14px;
                }
              }
              .el-tag {
                margin: 4px 3px;
                height: 17.5px;
                &:nth-of-type(1) {
                  padding-right: 5px;
                  max-width: 200px;
                }
                &:nth-of-type(2) {
                  padding-right: 0;
                  width: 28px;
                }
              }
            }
          }
          .el-input--suffix {
            right: 0px !important;
            .el-input__icon {
              line-height: 20px !important;
            }
            .el-input__suffix {
              right: 5px !important;
            }
          }
        }
      }
    }
  }
  .annual-plan-remark-form {
    /deep/ .el-form-item {
      margin-right: 0 !important;
      margin-top: 5px;
      margin-bottom: 0;
      .el-form-item__content {
        .el-input--mini {
          width: 900px;
        }
      }
    }
  }
  .clearfix:after {
    clear: both;
  }
  .table-wrapper {
    width: 970px;
    padding: 0 0 0 10px;
    .edit-box-card {
      margin-bottom: 5px;
      .card-table-list {
        padding: 10px;
      }
      .card-table {
        /deep/ .vxe-table--header,
        /deep/ .vxe-table--body,
        /deep/ .vxe-table--footer {
          width: 938px !important;
        }
        /deep/ .vxe-body--x-space {
          margin-bottom: 0;
        }
        /deep/ .el-input__inner {
          height: 22px;
          text-align: center;
        }
        /deep/ .el-table__body tr td {
          border-right: 1px solid #dfe6ec !important;
        }
        /deep/ .vxe-header--column,
        /deep/ .vxe-body--column {
          padding: 0;
          height: 28px;
          .vxe-cell {
            padding-left: 3px;
            padding-right: 3px;
            text-align: center;
            .vxe-input--inner {
              text-align: center;
              font-size: 13px;
            }
          }
        }
        /deep/ .vxe-table--footer-wrapper .vxe-footer--column {
          background-color: #ffffff;
          line-height: 20px;
        }
        /deep/ .vxe-table--footer-wrapper table td div span {
          color: #606266 !important;
          font-weight: normal !important;
          font-size: 13px;
        }
        /deep/ .vxe-input.size--mini {
          height: 23px !important;
          margin-bottom: 1px;
        }
        /deep/ .vxe-cell--label {
          font-size: 13px;
        }
      }
    }
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
      margin-left: 10px;
      margin-top: 2px;
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
      /deep/ i.el-icon-circle-plus {
        color: #417f90;
        font-size: 20px;
        cursor: pointer;
        vertical-align: sub;
      }
      /deep/ i.el-icon-remove {
        color: #afafaf;
        font-size: 20px;
        cursor: pointer;
        vertical-align: sub;
        margin: 0 5px;
      }
    }
  }
}
</style>
