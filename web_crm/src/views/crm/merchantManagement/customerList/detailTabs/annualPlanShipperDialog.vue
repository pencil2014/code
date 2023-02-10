<!--
 * @Description: 新增/编辑年度计划弹框
 * @Autor: yinjunying
 * @Date: 2022-06-08 09:13:28
-->
<template>
  <div>
    <el-dialog :before-close="cancel" :visible.sync="options.show" class="annual-plan-add" :title="`${options.title}年度计划`"
      :append-to-body="false" width="1200px">
      <div class="header-box">
        <div class="year-box">
          <p v-if="options.type !== 'edit'" class="tips">温馨提示：请先选择正确的年度再填写表格数据，如果修改年度，表格数据将被置空。</p>
          <el-form :inline="true" :model="formData" label-width="92px" class="annual-plan-form" ref="annualPlanForm" size="mini">
            <el-form-item label="年度：" required>
              <el-date-picker v-model="formData.year" type="year" value-format="yyyy" placeholder="请选择年度" class="middle-item"
                style="width: 200px" :disabled="['edit'].includes(options.type)" @change="changeYear">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="我司价格档次：" required label-width="100px">
              <el-select v-model="formData.ourPriceRange" placeholder="请选择我司价格档次" multiple clearable collapse-tags>
                <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in dictMap['ourPriceRange']"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="我司目标档次：" required label-width="100px">
              <el-select v-model="formData.ourTargetRange" placeholder="请选择我司目标档次" multiple clearable collapse-tags>
                <template v-for="item in dictMap['ourPriceRange']">
                  <el-option v-if="item.value !== 'online_freight'" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="table-wrapper" v-loading="tablesLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner">
        <el-card v-for="(item, index) in formData.portList" :key="index" :id="`edit-box-card`+ index" class="mb5 edit-box-card">
          <div slot="header" class="clearfix">
            <div class="left-title">

              <el-form :inline="true" :model="item" class="annual-plan-form" :ref="`portForm${index}`" label-width="100px">
                <span class="serialNum" v-if="formData.portList.length > 1">{{index+1}}</span>
                <el-form-item label="区域：" required :label-width="formData.portList.length > 1 ? `62px` : `80px`">
                  <el-select v-model="item.area" placeholder="请选择区域" remote 
                  clearable value-key="area"
                    :remote-method="(str) => { getAreasList(str, index) }" @visible-change="(str) => showAreas(str, index)"
                    @change="(str) => changeAreas(str, index)">
                    <el-option v-for="optionItem in areaList" :label="`${optionItem}`" :value="optionItem" :key="optionItem">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="起运港：" required>
                  <el-select v-model="item.polPortCode" placeholder="请选择起运港" filterable remote clearable collapse-tags multiple
                    value-key="portCode" :remote-method="(str) => { getPort(str, index, 'port_of_basic') }"
                    @visible-change="(str) => showPort(str, index, 'port_of_basic')"
                    @change="(str) => changePort(str, index, 'port_of_basic')" :disabled="!item.area">
                    <el-option v-for="optionItem in item.polList" :label="`${optionItem.ename}(${optionItem.cname})`"
                      :value="optionItem.portCode" :key="optionItem.portCode">
                    </el-option>
                  </el-select>
                </el-form-item><br />
                <el-form-item label="系统航线：" required label-width="80px">
                  <el-select v-model="item.lineCode" placeholder="请选择系统航线" filterable remote clearable value-key="sysLineCode"
                    :remote-method="(str) => { getLineInfo(str, index) }" @visible-change="(str) => showLineInfo(str, index)"
                    @change="(str) => changeLineInfo(str, index)">
                    <el-option v-for="optionItem in lineList" :label="`${optionItem.cname || optionItem.ename}`"
                      :value="optionItem.sysLineCode" :key="optionItem.sysLineCode">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="目的港国家：">
                  <el-select v-model="item.countryCode" placeholder="请选择目的港国家" filterable remote clearable value-key="countryCode"
                    :remote-method="(str) => { getCountryList(str) }" @visible-change="(str) => showCountry(str, index)">
                    <el-option v-for="optionItem in podCountryList" :label="`${optionItem.ename}(${optionItem.cname})`"
                      :value="optionItem.countryCode" :key="optionItem.countryCode">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="目的港：" label-width="100px">
                  <el-select v-model="item.podPortCode" placeholder="请选择目的港" filterable multiple remote clearable collapse-tags
                    value-key="portCode" :remote-method="(str) => { getPort(str, index, 'port_of_destination') }"
                    @visible-change="(str) => showPort(str, index, 'port_of_destination')"
                    @change="(str) => changePort(str, index, 'port_of_destination')">
                    <template v-if="item.podList && item.podList.length">
                      <el-option v-for="optionItem in item.podList" :label="`${optionItem.ename}(${optionItem.cname})`"
                        :value="optionItem.portCode" :key="optionItem.portCode">
                      </el-option>
                    </template>
                    <template v-else>
                      <el-option value="暂无数据" disabled></el-option>
                    </template>
                  </el-select>
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
              <el-row :gutter="5">
                <el-col :span="12" v-for="(monthItem, monthIndex) in columnsData" :key="monthIndex" class="mb5">
                  <vxe-table v-if="columnsData.length && item.data[monthIndex].monthData" :ref="`vxetable${index}${monthIndex}`"
                    :data="item.data[monthIndex].monthData" border fit class="card-table" size="mini"
                    :edit-config="{trigger: 'click', mode: 'cell', showIcon: false, activeMethod: activeCellMethod }"
                    :span-method="colspanMethod">
                    <vxe-column v-for="(colItem, colIndex) in monthItem" :key="setUniqueNuber(colIndex)" :field="colItem.prop"
                      :title="colItem.label" align="center" header-align="center" :width="colItem.width" :min-width="colItem.minWidth"
                      :fixed="colItem.fixed" :edit-render="{autofocus: '.vxe-input--inner'}">
                      <template #header>
                        <template v-if="colItem.prop === 'ordinate'">
                          <div>{{ colItem.label }}</div>
                          <div>
                            <template v-if="monthIndex < 11">
                              <el-popconfirm v-if="monthIndex < 10"
                                :title="`【同步剩余月】系统将把${monthIndex+1}月份的年度计划数据同步到剩余的${monthIndex !== 10 ? (monthIndex + 2)+ '-': ''}12月，确定继续？`"
                                @onConfirm="autoComplete(item.data, monthIndex, 'all')">
                                <el-link type="primary" slot="reference" class="tableLink">
                                  同步剩余月</el-link>
                              </el-popconfirm>
                              <el-popconfirm :title="`【同步下月】系统将${monthIndex+1}月份的年度计划数据同步到${monthIndex + 2}月，确定继续？`"
                                @onConfirm="autoComplete(item.data, monthIndex, 'next')">
                                <el-link type="primary" slot="reference" class="tableLink" style="margin-left: 5px">
                                  同步下月</el-link>
                              </el-popconfirm>
                            </template>
                          </div>
                        </template>
                        <template v-else>
                          <div>{{ formatterHeader(colItem.label, 'week') }}</div>
                          <div>{{ formatterHeader(colItem.label, 'day') }}</div>
                        </template>
                      </template>
                      <template #edit="{ row, rowIndex}">
                        <vxe-input v-if="rowIndex < 3" v-model="row[colItem.prop]" type="integer" min='0' :controls="false">
                        </vxe-input>
                        <vxe-input v-else v-model="row[colItem.prop]" type="number" min='0' :controls="false"></vxe-input>
                      </template>
                      <template #default="{ row, rowIndex }" v-if="['total'].includes(colItem.prop)">
                        <span>{{ countAmount(row, rowIndex, monthItem) }}</span>
                      </template>
                    </vxe-column>
                  </vxe-table>
                </el-col>
              </el-row>
            </div>
          </el-collapse-transition>
        </el-card>
      </div>
      <div class="table-wrapper">
        <el-form :inline="true" :model="formData" label-width="65px" class="annual-plan-remark-form" size="mini">
          <el-form-item label="备注：">
            <el-input type="textarea" v-model="formData.remarks" placeholder="请输入备注（限512个字）" maxlength="512" show-word-limit
              :autosize="{ minRows: 2, maxRows: 4}"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button size="mini" type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
        <el-button size="mini" @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { portList, baseSystemLineList, countrySelectList } from '@/api/base'
import { monthDataObj } from '@/views/crm/data/annualPlan'
import annualPlanShipperApi from '@/api/crm/annualPlanShipper'
import { mapGetters } from 'vuex'
export default {
  components: {},
  props: {
    options: {
      type: Object,
      default: () => { }
    },
    shippingCarrierId: ''
  },
  data () {
    return {
      columnsData: [],
      formData: {
        year: '',
        ourPriceRange: [], //我司价格档次
        ourTargetRange: [], //我司目标档次
        remarks: "",
        portList: [
          {
            data: [],
            countryCode: "",
            isShow: true,
            area: '',
            polList: [],
            podList: [],
            lineInfo:[{
              lineCode: "",
              lineName: "",
            }],
            podPortInfo:[{
              podPortCode: [],
              podPortName: [],
            }],
            polPortInfo:[{
              polPortCode: [],
              polPortName: [],
            }],
            employeeInfo:[{
              employeeId: '',
              employeeName: ''
            }]
          }
        ]
      },
      lineList: [],
      areaList: [],
      modifiedRows: [],
      draftLoading: false,
      saveLoading: false,
      monthDataObj: JSON.parse(JSON.stringify(monthDataObj)),
      tablesLoading: false,
      podCountryList: []
    }
  },
  created () {
    this.getAnnualPlanInfo()
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  methods: {
    /**
     * @description: 切换年度组件时回调
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-11 17:00:39
     */
    changeYear (val) {
      if (!val) {
        this.columnsData = []
      } else {
        this.getTableColumn()
      }
    },
    /**
     * @description: 获取表格列唯一标识，用时间戳+field下标
     * @param {*} index field下标
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-11 16:41:59
     */
    setUniqueNuber (index) {
      return `${new Date().getTime() + index}`
    },
    /**
     * @description: 获取表格表头、表格数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-11 16:32:39
     */
    getAnnualPlanInfo () {
      if (this.options.shippingCarrierId) {
        this.getAnnualPlanDetailInfo()
      } else {
        this.formData.year = this.getCurYear()
        this.getTableColumn()
      }
    },
    /**
     * @description: 获取动态周数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-08 18:57:25
     */
    getTableColumn () {
      let data = {
        year: this.formData.year
      }
      this.tablesLoading = true
      annualPlanShipperApi['getColumns'](data)
        .then((res) => {
          let { code, data } = res
          if (code === 0) {
            this.columnsData = []
            if (data && data.length) {
              this.columnsData = data
              this.formData.portList[0].data = []
              this.columnsData.forEach((item, index) => {
                //现默认monthDataObj是四周，如果获取表头之后有第五周，动态新增一个fifthWeek属性
                this.formData.portList[0].data.push(JSON.parse(JSON.stringify(this.monthDataObj)))
                this.formData.portList[0].data[index].monthData.forEach(monthItem => {
                  if (item.length === 7) {
                    this.$set(monthItem, 'fifthWeek', null)
                  } else if (item.length === 6) {
                    if (monthItem.hasOwnProperty('fifthWeek')) this.$delete(monthItem, 'fifthWeek')
                  }
                })
                this.setColumnStyle(item)
              })
            }
          }
        })
        .catch(() => {
        })
        .finally(() => {
          this.tablesLoading = false
        })
    },
    /**
     * @description: 设置表头样式
     * @param {*} item 表头集合
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-11 17:11:08
     */
    setColumnStyle (item) {
      if (item && item.length) {
        item.forEach(subItem => {
          if (subItem.prop === "ordinate") {
            subItem.width = "130px"
          } else if (subItem.prop === "total") {
            if (item.length === 6) {
              subItem.minWidth = "40px"
            } else if (item.length === 7) {
              subItem.minWidth = "35px"
            }
          } else {
            subItem.minWidth = "55px"
          }
        })
      }
    },
    /**
     * @description: 截取表头周数和日期，达到换行的效果
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
    getAnnualPlanDetailInfo () {
      let data = {
        year:this.options.year,
        shippingCarrierId:this.options.shippingCarrierId,
        createEmployeeId:this.options.createEmployeeId,
        oid: this.options.oid
      }
      this.tablesLoading = true
      annualPlanShipperApi['getByPlanId'](data)
        .then((res) => {
          if (res.code === 0) {
            this.formData = { ...res.data } || {}
            if (this.formData.year) {
              this.formData.year += ''
            }
            this.columnsData = this.formData.columns
            // 设置表头宽度
            this.columnsData.forEach((colItem, colIndex) => {
              this.setColumnStyle(colItem)
            })
            if (this.formData.portList && this.formData.portList.length) {
              this.formData.portList.forEach((item, index) => {
                item.lineCode = item.lineInfo[0].lineCode
                item.lineName = item.lineInfo[0].lineName
                item.polPortCode = item.polPortInfo[0].polPortCode
                item.polPortName = item.polPortInfo[0].polPortName
                item.podPortCode = item.podPortInfo[0].podPortCode
                item.podPortName = item.podPortInfo[0].podPortName
                // 将返回的数据转成字符串
                if (item.data && item.data.length) {
                  item.data.forEach(dataItem => {
                    dataItem.monthData = dataItem.monthData.filter(weekItem => (weekItem.ordinateCode !== "OUR_ACTUAL_WEEK_SPACE"))
                    if (dataItem.monthData && dataItem.monthData.length) {
                      dataItem.monthData.forEach((weekItem, weekIndex) => {
                        let ordinateArr = ['firstWeek', 'secondWeek', 'thirdWeek', 'fourthWeek', 'fifthWeek']
                        ordinateArr.forEach(ordItem => {
                          if (ordItem !== 'fifthWeek') {
                            if (weekItem[ordItem] === undefined || weekItem[ordItem] === null) {
                              weekItem[ordItem] = null
                            } else {
                              weekItem[ordItem] += ''
                            }
                          } else if (weekItem.hasOwnProperty('fifthWeek')) {
                            if (weekItem['fifthWeek'] === undefined || weekItem['fifthWeek'] === null) {
                              weekItem['fifthWeek'] = null
                            } else {
                              weekItem['fifthWeek'] += ''
                            }
                          }
                        })
                      })
                    }
                  })
                }
                // 默认展开全部年度计划
                this.changeShow(item, true)
                this.getPort('', index, 'port_of_basic')
                this.getPort('', index, 'port_of_destination')
                this.getLineInfo('', index)
                this.getCountryList(item.countryCode)
                this.$forceUpdate()
              })
            }
          }
        })
        .catch(() => {
        })
        .finally(() => {
          this.tablesLoading = false
        })
    },
    /**
     * @description: 获取港口下拉选项
     * @param {String} str 已知港口名
     * @param {Number} index 航线索引
     * @param {String} type 起运港/目的港
     * @param {Object} extraParams 额外参数 在选择“区域”之后要把区域的参数带进来
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-28 16:02:19
     */
    getPort (str = '', index, type, extraParams) {
      // if (str === '') {
      //   str = type === 'port_of_basic' ? this.formData.portList[index].polPortCode.join("") : this.formData.portList[index].podPortCode.join("")
      // }
      let data = {
        portName: str,
        portAttribute: type,
        portCodes: '',
        state: 'valid',
        sysLineCode: '',
        area: ''
      }
      if (type === 'port_of_destination') {
        // if(this.formData.portList[index].lineInfo.length>0){
        //     data.sysLineCode = this.formData.portList[index].lineInfo[0].lineCode
        // }else{
        //   data.sysLineCode =''
        // }
         data.sysLineCode = this.formData.portList[index].lineCode
      } else {
        data.area = this.formData.portList[index].area
      }
      if (extraParams) {
        data = Object.assign({}, data, extraParams)
      }
      portList(data)
        .then((res) => {
          if (res.code === 0) {
            if (type === 'port_of_basic') {
              this.formData.portList[index].polList = res.data || []
              if (this.formData.portList[index].polList.length) {
                this.formData.portList[index].polList.forEach(item => {
                  item.ename = item.ename.trim()
                  item.cname = item.cname.trim()
                });
              }
            } else {
              this.formData.portList[index].podList = res.data || []
              if (this.formData.portList[index].podList.length) {
                this.formData.portList[index].podList.forEach(item => {
                  item.ename = item.ename.trim()
                  item.cname = item.cname.trim()
                });
                // // 从目的港信息中取出目的港国家信息 只过滤出有countryCode和中英文名有其一的数据
                // this.formData.portList[index].podCountryList = this.formData.portList[index].podList.filter(item => item.countryCode && (item.countryEname || item.countryName))
                // this.formData.portList[index].podCountryList = this.formData.portList[index].podCountryList.map(item => {
                //   return {
                //     countryCode: item.countryCode,
                //     countryEname: item.countryEname,
                //     countryName: item.countryName
                //   }
                // })
                // // 目的港国家信息去重
                // this.formData.portList[index].podCountryList = this.formData.portList[index].podCountryList.filter((currentValue, currentIndex, selfArr) => {
                //   return selfArr.findIndex(x => x.countryCode === currentValue.countryCode) === currentIndex
                // })
              }
            }
            this.$forceUpdate()
          }
        })
        .catch(() => { })
    },
    /**
     * @description: 起运港下拉框出现/隐藏时触发
     * @param {Boolean} isShow true-出现 false-隐藏
     * @param {Number} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-28 16:04:29
     */
    showPort (isShow, index, type) {
      if (isShow) {
        if (type === 'port_of_basic') {
          this.formData.portList[index].polList = []
        } else {
          this.formData.portList[index].podList = []
        }
        this.getPort('', index, type)
      }
    },
    /**
     * @description: 切换起运港
     * @param {*} val portCode
     * @param {*} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-06 18:20:55
     */
    changePort (val, index, type) {
      let data = type === 'port_of_basic' ? this.formData.portList[index].polList : this.formData.portList[index].podList
      if (type === 'port_of_basic') {
        this.formData.portList[index].polPortName = []
      } else {
        this.formData.portList[index].podPortName = []
      }
      // if (type === 'port_of_basic') {
      //   this.formData.portList[index].polPortInfo[0].polPortName = []
      // } else {
      //   this.formData.portList[index].podPortInfo[0].podPortName = []
      // }
      if (val && val.length) {
        data.forEach(pItem => {
          val.forEach(vItem => {
            if (vItem === pItem.portCode) {
              if (type === 'port_of_basic') {
                this.formData.portList[index].polPortName.push(`${pItem.ename}(${pItem.cname})`)
              } else {
                this.formData.portList[index].podPortName.push(`${pItem.ename}(${pItem.cname})`)
              }
              // if (type === 'port_of_basic') {
              //   this.formData.portList[index].polPortInfo[0].polPortName.push(`${pItem.ename}(${pItem.cname})`)
              // } else {
              //   this.formData.portList[index].podPortInfo[0].podPortName.push(`${pItem.ename}(${pItem.cname})`)
              // }
            }
          })

        })
      }
      this.$forceUpdate()
    },
    /**
     * @description: 获取系统航线信息
     * @param {String} str 已知系统航线
     * @param {Number} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-25 10:16:58
     */
    getLineInfo (str, index) {
      if (str === '') {
         str = this.formData.portList[index].lineName
      }
      baseSystemLineList(str).then((res) => {
        if (res.code === 0) {
          this.lineList = res.data || []
          if (this.lineList.length) {
            this.lineList.forEach(item => {
              item.ename = item.ename.trim()
              item.cname = item.cname.trim()
            })
          }
        }
      })
    },
    /**
     * @description: 系统航线下拉框出现/隐藏时触发
     * @param {Boolean} isShow true-出现 false-隐藏
     * @param {Number} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-09 11:30:21
     */
    showLineInfo (isShow, index) {
      if (isShow) {
        this.getLineInfo('', index)
      }
    },
    /**
     * @description: 切换系统航线 
     * @param {*} val sysLineCode
     * @param {*} index 航线索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-10 17:16:32
     */
    changeLineInfo (val, index) {
      this.formData.portList[index].countryCode = ''
      // this.formData.portList[index].countryName = ''
      // this.formData.portList[index].countryEname = ''
      this.formData.portList[index].podPortCode = []
      this.formData.portList[index].podPortName = []
      if (val) {
        this.lineList.forEach(lineItem => {
          if (val === lineItem.sysLineCode) {
            this.formData.portList[index].lineName = lineItem.cname || lineItem.ename
          }
        })
      } else {
        this.formData.portList[index].lineName = ""
      }
      let params = {
        sysLineCode: val
      }
      this.getPort('', index, 'port_of_destination', params)
      this.$forceUpdate()
    },
    /**
     * @description: 获取区域信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-27 15:54:39
     */
    getAreasList (str, index) {
      if (str === '') {
        str = this.formData.portList[index].area
      }
      let data = {
        area: str
      }
      annualPlanShipperApi['getAreas'](data)
        .then((res) => {
          if (res.code === 0) {
            this.areaList = res.data || []
          }
        })
        .catch(() => { })
        .finally(() => { })
    },
    /**
     * @description: 区域下拉框出现/隐藏时触发
     * @param {*} isShow
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-27 16:07:42
     */
    showAreas (isShow, index) {
      if (isShow) {
        this.formData.portList[index].areaList = []
        this.getAreasList('', index)
      }
    },
    /**
     * @description: 切换区域时重新获取起运港数据
     * @param {*} str
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-28 10:32:34
     */
    changeAreas (str, index) {
      this.formData.portList[index].polPortCode = []
      this.formData.portList[index].polPortName = []
      if (str) {
        let params = {
          area: str
        }
        this.getPort('', index, 'port_of_basic', params)
      }
    },
    /**
     * @description: 获取目的港国家
     * @param {*} val
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 14:37:27
     */
    getCountryList (val) {
      // if (val === '') {
      //   val = this.formData.portList[index].countryCode
      // }
      countrySelectList({ countryCode: val, state: 'valid' })
        .then((res) => {
          if (res.code === 0) {
            this.podCountryList = res.data || []
            this.$forceUpdate()
          }
        }).catch(() => { })
    },
    /**
     * @description: 目的港国家下拉回调
     * @param {*} isShow
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-05 14:38:55
     */
    showCountry (isShow, index) {
      if (isShow) {
        this.podCountryList = []
        this.getCountryList(this.formData.portList[index].countryCode)
      }
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
      for (let i = 0; i < 12; i++) {
        this.formData.portList[this.formData.portList.length - 1].data.push(JSON.parse(JSON.stringify(this.monthDataObj)))
      }
      this.formData.portList.map(item=>{
        item.isShow = false
      })
      this.formData.portList[this.formData.portList.length - 1].isShow = true
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
     * @description: 设置单元格不可编辑
     * @param {Object} column 列信息
     * @return {Boolean} true-能编辑 false-不能编辑
     * @author: yinjunying
     * @Date: 2022-06-10 17:00:32
     */
    activeCellMethod ({ column }) {
      return !['ordinate', 'total'].includes(column['property'])
    },
    /**
     * @description: 合并月目标T量，月目标利润
     * @param {*} rowIndex 行下标
     * @param {*} columnIndex 列下标
     * @return {*} 合并对象
     * @author: yinjunying
     * @Date: 2022-06-08 11:55:04
     */
    colspanMethod ({ rowIndex, columnIndex }) {
      if ([3, 4].includes(rowIndex)) {
        if (columnIndex === 1) {
          return { rowspan: 1, colspan: 6 }
        }
      }
    },
    /**
     * @description: 计算各月份数据总计
     * @param {*} row 表格行数据
     * @param {*} rowIndex 表格行数据下标
     * @param {*} monthItem 月份表格
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-08 14:58:29
     */
    countAmount (row, rowIndex, monthItem) {
      let total = null
      monthItem.forEach(ele => {
        if ([0, 1, 2].includes(rowIndex) && !['ordinate', 'total'].includes(ele.prop) && row[ele.prop]) {
          total += Number(row[ele.prop]);
        }
      });
      row['total'] = total || null
      return total
    },
    /**
     * @description: 各表格自动补全
     * @param {*} monthData 某月表格数据
     * @param {*} monthIndex 表格数据索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-15 16:36:45
     */
    autoComplete (data, monthIndex, type) {
      let orgMonthdData = data[monthIndex].monthData //补全的源数据
      if (data && data.length) {
        data.forEach((item, index) => {
          if (type === 'all') {
            if (index >= monthIndex) {
              if (item.monthData && item.monthData.length) {
                item.monthData.forEach((weekItem, weekIndex) => {
                  for (let key in weekItem) {
                    if (key !== '_XID') {
                      this.$set(weekItem, key, orgMonthdData[weekIndex][key])
                    }
                  }
                })
              }
            }
          } else if (type === 'next') {
            if (index === (monthIndex + 1)) {
              if (item.monthData && item.monthData.length) {
                item.monthData.forEach((weekItem, weekIndex) => {
                  for (let key in weekItem) {
                    if (key !== '_XID') {
                      this.$set(weekItem, key, orgMonthdData[weekIndex][key])
                    }
                  }
                })
              }
            }
          }
        })
      }
      this.$forceUpdate()
    },
    /**
     * @description: 确定保存数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-28 18:41:51
     */
    handleSave () {
      let params = JSON.parse(JSON.stringify(this.formData))
      if (!params.year) return this.$msgErrClose("请选择年度！")
      if (!params.ourPriceRange.length) return this.$msgErrClose("请选择我司价格档次！")
      if (!params.ourTargetRange.length) return this.$msgErrClose("请选择我司目标档次！")
      const isValid = params.portList.every((item, index) => {
        if (!item.area.length) {
          this.$msgErrClose(`请选择航线${index + 1}的区域！`)
          return false
        }
        if (!item.polPortCode.length) {
          this.$msgErrClose(`请选择航线${index + 1}的起运港！`)
          return false
        }
        if (!item.lineCode) {
          this.$msgErrClose(`请选择航线${index + 1}的系统航线！`)
          return false
        }
        return true
      })
      if (isValid) {
        params.shippingCarrierId = this.shippingCarrierId || this.$route.query.shippingCarrierId || this.options.shippingCarrierId
        // 处理数据格式
        params.portList.forEach((item, index) => {
          // 删除不必要的参数
          this.$delete(item, 'isShow')
          this.$delete(item, 'podList')
          this.$delete(item, 'polList')
          this.$delete(item, 'podCountryList')
          //组装
           item.polPortInfo[0].polPortCode = []
           item.polPortInfo[0].polPortName = []
           item.podPortInfo[0].podPortCode = []
           item.podPortInfo[0].podPortName = []
           item.lineInfo[0].lineCode = []
           item.lineInfo[0].lineName = []
          //起运港
          item.polPortCode.forEach(pol=>{
            item.polPortInfo[0].polPortCode.push(pol)
          })
          item.polPortName.forEach(polName=>{
            item.polPortInfo[0].polPortName.push(polName)
          })
          //目的港
          item.podPortCode.forEach(pod=>{
            item.podPortInfo[0].podPortCode.push(pod)
          })
          item.podPortName.forEach(podName=>{
            item.podPortInfo[0].podPortName.push(podName)
          })
          //航线
          item.lineInfo[0].lineCode = item.lineCode
          item.lineInfo[0].lineName = item.lineName
        })
        // 复制保存时，去掉oid
        if (this.options.type === 'copy') {
          params.oid = ''
        }else if(this.options.type === 'edit'){
          //编辑的时候，传创建人id
          params.createEmployeeId  = [params.createdBy]
        }
        console.log('params',params)
        this.saveApi(params)
      }
    },
    /**
     * @description: 调用保存接口
     * @param {*} 请求参数
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-05-06 17:00:00
     */
    saveApi (data) {
      this.saveLoading = true
      annualPlanShipperApi['addYearPlan'](data)
        .then((res) => {
          if (res.code === 0) {
            this.$msgSucClose('操作成功！')
            this.cancel()
            this.$emit('getList')
          }
        })
        .catch(() => { })
        .finally(() => {
          this.saveLoading = false
        })
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
      margin-bottom: 2px;
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
              line-height: 16px;
              .el-tag--small {
                margin-bottom: 7px;
                &:nth-of-type(2) .el-select__tags-text {
                  max-width: 26px;
                }
                .el-select__tags-text {
                  line-height: 14px;
                  max-width: 100%;
                }
              }
              .el-tag {
                margin: 2px 3px;
                height: 17.5px;
                &:nth-of-type(1) {
                  padding-right: 5px;
                  max-width: 200px;
                }
                &:nth-of-type(2) {
                  padding: 0;
                  max-width: 45px;
                  min-width: 24px;
                }
              }
            }
            i {
              top: 2px !important;
              right: -5px !important;
              height: 15px !important;
              min-width: 15px !important;
              line-height: 14px;
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
          width: 1090px;
        }
      }
    }
  }
  .tips {
    font-size: 12px;
    color: #ee7625;
    margin-bottom: 5px;
    text-indent: 28px;
  }
  .serialNum {
    background: #1890ff;
    display: inline-block;
    color: #fff;
    width: 18px;
    height: 18px;
    border-radius: 25%;
    line-height: 18px;
    text-align: center;
    font-size: 14px;
    margin-top: 5px;
  }
  .clearfix:after {
    clear: both;
  }
  .table-wrapper {
    width: calc(100% - 10px);
    .edit-box-card {
      margin-bottom: 5px;
      .card-table-list {
        min-height: 300px;
        padding: 10px;
        .tableLink {
          text-decoration: underline;
          font-size: 12px;
        }
      }
      .card-table {
        margin-bottom: 5px;
        /deep/ .vxe-table--header,
        /deep/ .vxe-table--body,
        /deep/ .vxe-table--footer {
          width: 49.9% !important;
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
            padding-left: 3px !important;
            padding-right: 3px !important;
            text-align: center;
            .vxe-input--inner {
              text-align: center;
              font-size: 12px;
            }
            .vxe-cell--title {
              font-weight: normal !important;
            }
          }
        }
        /deep/ .vxe-table--body-wrapper {
          overflow-x: hidden;
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
          font-size: 12px;
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
      padding-bottom: 4px;
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
