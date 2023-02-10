<template>
  <div class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{isDetail ? '费用模板详情' : '新增费用模板'}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" type="primary" @click="handleSave">保存</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="cancel(false)">取消</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <el-form :model="formData" ref="form" :rules="rules" :inline="true" size="mini" label-width="100px">
        <el-form-item label="费用模板名称：" prop="tempName">
          <el-input v-model="formData.tempName" placeholder="请输入费用模板名称"></el-input>
        </el-form-item>
        <el-form-item label="业务类型：" prop="businessType">
          <el-select v-model="formData.businessType" value-key placeholder="请选择业务类型" @change="queryBusinessServiceList">
            <el-option
              v-for="item in dictMap['businessType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用：" prop="enabled">
          <el-select v-model="formData.enabled" value-key placeholder="请选择是否启用">
            <el-option
              v-for="item in dictMap['yesNo']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="模板类型：" prop="tempType">
          <el-select v-model="formData.tempType" value-key placeholder="请选择模板类型">
            <el-option
              v-for="item in dictMap['feeTemplateType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="显示顺序：" prop="sortNum">
          <el-input v-model="formData.sortNum" placeholder="越大越排前，默认为1"></el-input>
        </el-form-item>
        <el-form-item label="模板等级：" prop="tempLevel">
          <el-select v-model="formData.tempLevel" value-key placeholder="请选择模板等级">
            <el-option
              v-for="item in dictMap['feeTemplateLevel']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注：" prop="remark" class="long-form-item">
          <el-input
            maxlength="500"
            show-word-limit
            type="textarea"
            v-model="formData.remark"
            placeholder="请填写备注"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="finance-search-list-gap"></div>
    <el-tabs v-model="activeName" class="fin-el-tabs">
      <el-tab-pane v-for="(item, index) in tabsList" :key="'tabsList' + index" :label="item.label" :name="item.name" class="fin-el-tab-pane">
        <template>
          <div v-if="item.name === 'biz' && activeName === 'biz'">
            <div class="finance-table-container">
               <!-- v-if="!isSpecialTemp" -->
              <div class="money-box">
                <div class="money-box-left">
                  <div class="money-title">应收</div>
                </div>
                <div class="money-box-right">
                  <el-button class="finance-btn" type="primary" size="mini" @click="addRow('option1')">新增应收费用</el-button>
                  <el-button class="finance-btn" size="mini" @click="handleCopy('receive')">复制</el-button>
                  <el-button class="finance-btn" size="mini" @click="addRow('option2', true)">收入转支出</el-button>
                  <el-button class="finance-btn" size="mini" type="danger" @click="handleDelete('receive')">删除</el-button>
                  <el-button v-if="isDetail" class="finance-btn" type="warning" size="mini" @click="handleEdit('receive')">修改</el-button>
                  <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">
                    {{showTable1? '收起':''}}
                    <i
                      :class="[showTable1?'el-icon-arrow-down':'el-icon-arrow-right']"
                    ></i>
                  </el-button>
                </div>
              </div>
              <FinanceTableMass v-show="showTable1" :option="option1" @send-multi="sendMulti"/>
              <!-- ($event, 1) -->
            </div>
            <div class="finance-table-container">
              <div class="money-box">
                <div class="money-box-left">
                  <div class="money-title">应付</div>
                </div>
                <div class="money-box-right">
                  <el-button class="finance-btn" type="primary" size="mini" @click="addRow('option2')">新增应付费用</el-button>
                  <el-button class="finance-btn" size="mini" @click="handleCopy('pay')">复制</el-button>
                  <el-button class="finance-btn" size="mini" @click="addRow('option1', true)">支出转收入</el-button>
                  <el-button class="finance-btn" type="danger" size="mini" @click="handleDelete('pay')">删除</el-button>
                  <el-button v-if="isDetail" class="finance-btn" type="warning" size="mini" @click="handleEdit('pay')">修改</el-button>
                  <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">
                    {{showTable2? '收起':''}}
                    <i
                      :class="[showTable2?'el-icon-arrow-down':'el-icon-arrow-right']"
                    ></i>
                  </el-button>
                </div>
              </div>
              <FinanceTableMass v-show="showTable2" :option="option2" @send-multi="sendMulti"/>
              <!-- ($event, 2) -->
            </div>
          </div>
          <div v-if="item.name === 'special' && activeName === 'special'">
            <div class="finance-table-container">
              <div class="money-box">
                <div class="money-box-left">
                  <div class="money-title">应付</div>
                </div>
                <div class="money-box-right">
                  <el-button class="finance-btn" type="primary" size="mini" @click="addRow('option3')">新增应付费用</el-button>
                  <el-button class="finance-btn" size="mini" @click="handleCopy('pay')">复制</el-button>
                  <el-button class="finance-btn" type="danger" size="mini" @click="handleDelete('pay')">删除</el-button>
                  <el-button v-if="isDetail" class="finance-btn" type="warning" size="mini" @click="handleEdit('pay')">修改</el-button>
                  <el-button type="text" class="collapse-btn" @click="handleCollapse('Table3')" size="mini">
                    {{showTable3? '收起':''}}
                    <i
                      :class="[showTable3?'el-icon-arrow-down':'el-icon-arrow-right']"
                    ></i>
                  </el-button>
                </div>
              </div>
              <FinanceTableMass v-show="showTable3" :option="option3" @send-multi="sendMulti"/>
              <!-- ($event, 2) -->
            </div>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapState } from 'vuex'
import { saveFinBill } from '@/api/fin/finBill'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import { getSysDate } from '@/api/fin/sysDate'
import { getCompanyPubDeptEmp } from '@/api/base'
import { getTaxRate } from '@/api/fin/tax'
import { addFeeTemplate, queryFeeTemplateDetail, modifyFeeTemplate } from '@/api/fin/feeTemp'
import { feeItemInfo } from '@/api/fin/feeitem'

export default {
  name: 'addFeeTemplate',
  components: {
    FinanceTableMass,
  },
  mixins: [mixin, routerMixin],
  // activated() {
  //   if (this.$route.meta.isUseCache) {
  //     return
  //   }
  //   this.$options.created.map((item) => item.call(this))
  //   this.$refs['form'].resetFields()
  //   this.$nextTick(() => {
  //     this.$refs['form'].clearValidate()
  //   })
  //   this.settleCorpNameRecei = ''
  //   this.settleCorpCodeRecei = ''
  //   this.settleCorpNamePay = ''
  //   this.settleCorpCodePay = ''
  // },
  data() {
    return {
      // 是否显示表格 应收1 应付2
      showTable1: true,
      showTable2: true,
      showTable3: true,
      // 表格数据 应收1 应付2
      option1: {},
      option2: {},
      option3: {},
      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      // 返回数据备份
      resData: {},
      // 表单数据
      formData: {
        tempName: '',
        businessType: '',
        enabled: 'yes',
        tempType: '',
        remark: '',
        tempLevel: 'personal', // 字典feeTemplateLevel: personal: '个人', department: '部门', company: '公司'
        sortNum: null
      },
      // 表单验证
      rules: {
        tempName: [{ required: true, message: ' ', trigger: 'blur' }],
        businessType: [{ required: true, message: ' ', trigger: 'blur' }],
        enabled: [{ required: true, message: ' ', trigger: 'blur' }],
        tempType: [{ required: true, message: ' ', trigger: 'blur' }],
      },
      // 应收应付列表配置
      columns: [],
      // 自定义表头
      customColumnsPopShow: false,
      forceRefresh: true,
      tempNo: '',
      isDetail: false,
      isCopy: false,
      loading: false,
      tabsList: [
        {
          label: '业务费用',
          name: 'biz'
        },
        {
          label: '专项管理',
          name: 'special'
        }
      ],
      activeName: 'biz',
      businessServiceList: [],
      serviceColumn: {},
    }
  },
  watch: {
  },
  computed: {
    isSpecialTemp() {
      return this.formData.tempType === 'special'
    },
    //   应收应付列表
    fbFeeVos() {
      return [
        ...this.option1.data.map((item) => ({ ...item, receipayType: 'receive', tempType: 'biz' })),
        ...this.option2.data.map((item) => ({ ...item, receipayType: 'pay', tempType: 'biz' })),
        ...this.option3.data.map((item) => ({ ...item, receipayType: 'pay', tempType: 'special' })),
      ]
    },
    // 新增行格式
    rowData() {
      let obj = { edit: true }
      this.columns.forEach((item) => (obj[item.prop] = ''))
      return obj
    },
    ...mapState({
      columnsBase: (state) => state.finance.columns.columnsBase,
      compCode: (state) => state.user.compCode
    }),
  },
  created() {
    this.init()
    let obj1 = { id: 'option1', edit: true, selection: {show: true, fixed: 'left'}, rootTipsHide: true,
      index: {show : true},
      operationBtns: {
        show: false
      }
    }
    this.option1 = { ...this.option, ...obj1, data: [], id: 'option1', $name: 'AddFeeTemplate1',
      handleKeyup: this.handleKeyup }
    this.option2 = { ...this.option, ...obj1, data: [], id: 'option2', $name: 'AddFeeTemplate2',
      handleKeyup: this.handleKeyup }
    this.option3 = { ...this.option, ...obj1, data: [], id: 'option3', $name: 'AddFeeTemplate3',
      handleKeyup: this.handleKeyup }
    let obj2 = { label: '删除', type: 'text', show: true, action: 'Delete' }
    this.option1.operationBtns.width = '80px'
    this.option1.operationBtns.data = this.option2.operationBtns.data = this.option3.operationBtns.data = [{ ...obj2 },
        { label: '复制', type: 'text', show: true, action: 'Copy' },]
    this.serviceColumn = {
      label: '服务项',
      prop: 'serviceCode',
      type: 'select',
      formatter: ({row}) => { return row.serviceName },
      remote: true,
      filterable: true,
      clearable: true,
      remoteMethod: (queryString, item, row) => {
        // this.queryBusinessServiceList({ queryString }, item)
      },
      visibleChange: (queryString, item, row) => {
        // this.queryBusinessServiceList({ queryString }, item)
        if (!row.feeCode) {
          return this.$message({ message: '须先选择费用名称', type: 'error' })
        }
        if (!this.formData.businessType) {
          return this.$message({ message: '须先选择业务类型', type: 'error' })
        }
        this.handleBizServs(item, row)
      },
      remoteSelectList: [],
    },
    this.columns = [
      { prop: 'settleCorpType', label: '结算单位类型', type: 'select', propInDict: 'feeTemplateSettleCorpType',
        change: (value, row , rowIndex) => {
          if (row.settleCorpCode) {
            row.settleCorpCode = ''
          }
          if (row.settleCorpName) {
            row.settleCorpName = ''
          }
        }
      },
      { prop: 'settleCorpCode', label: '固定值', type: 'variableType', dependentProp: 'settleCorpType', 
        formatter: ({row}) => { if (row.settleCorpCode) return row.settleCorpName },
        data: {
          fixed: {
            label: '结算单位',
            prop: 'settleCorpName',
            type: 'autocomplete',
            minWidth: 160,
            clearable: true,
            querySearch: (queryString, cb, row) => {
              if (!queryString) return // 为空时不查询
              this.querySettleUnit({ queryString, isAdd: true, isForbid: true, receipayType: row.receipayType }, cb)
            },
            select: (optionItem, row) => {
              row.settleCorpCode = optionItem.key
            },
          },
          customer: { prop: 'contentNull', label: '', type: 'text' },
          bkg_agent: { prop: 'contentNull', label: '', type: 'text' },
          shipper_customer: { prop: 'contentNull', label: '', type: 'text' },
        }
      },
      {
        label: '费用名称',
        prop: 'feeName',
        type: 'autocomplete',
        minWidth: 150,
        clearable: true,
        querySearch: (queryString, cb, row) => {
          cb([])
          this.selectedOptionItem = ''
          if (!this.formData.businessType) {
            return this.$message({
              message: '须先选择业务类型',
              type: 'error',
              showClose: true
            })
          }
          if (!queryString) return // 为空时不查询
          if (this.activeName === 'special') { // if (this.isSpecialTemp) {
            if (this.useNo) {
              this.querySpecialFeeItemList({orderNo: this.useNo, queryString, operation: 'add'}, cb)
            } else {
              this.querySpecialFeeItemList({orderNo: this.orderNo, queryString, operation: 'add'}, cb)
            }
            
          } else {
            let $this = this
            let cbs = function(data) {
              let ind1 = data.findIndex(item => {
                return item.feeCode === 'DCF2'
              })
              let ind2 = data.findIndex(item => {
                return item.feeCode === 'BSF'
              })
              if (ind1 > -1 && ind2 > -1) {
                if ($this.formData.businessType.includes('ship')) {
                  data.splice(ind2, 1)
                } else if ($this.formData.businessType.includes('air')) {
                  data.splice(ind1, 1)
                }
              }
              cb(data)
            }
            if (this.useNo) {
              this.queryFeeItemList({ orderNo: this.useNo, receipayType: row.receipayType, queryString, operation: 'add', excludeSpecialFee: 'yes' }, cbs) // this.$store.state.finance.orderNo. businessType: this.dictMap['orderFeeBusinessType'], serviceCode: row.serviceCode,
            } else {
              this.queryFeeItemList({ orderNo: this.orderNo, receipayType: row.receipayType, queryString, operation: 'add', excludeSpecialFee: 'yes' }, cbs) // this.$store.state.finance.orderNo. businessType: this.dictMap['orderFeeBusinessType'], serviceCode: row.serviceCode,
            }
          }
        },
        select: (optionItem, row) => {
          this.selectedOptionItem = optionItem
          row['feeName'] = optionItem.value
          row['feeCode'] = optionItem.key
          row['feeEnName'] = optionItem.feeEnName
          row['feeUnit'] = optionItem.feeUnit && optionItem.feeUnit.toLowerCase()
          row['currency'] = optionItem.currency // 获取费用项默认的币种
        },
        change: (val, row) => {
          setTimeout(() => {
            if (this.selectedOptionItem === '') {
              row['feeName'] = ''
              row['feeCode'] = ''
              row['feeEnName'] = ''
              return
            }
          }, 150)
        },
        clear: (row, item) => {
          // row.serviceCode = ''
          // row.serviceName = ''
        }
      },
      this.serviceColumn,
      {
        label: '单价',
        prop: 'unitPrice',
        width: 80,
        type: 'input',
        validateInput: (val, row, item, change) => {
          this.validateInput.call(this, val, row, item, change)
          this.$nextTick(() => {
            if (row.unitCount) {
              row.feeAmt = (row.unitPrice * row.unitCount).toFixed(2)
            }
          })
        },
      },
      {
        label: '计费单位', //dicMap[fee_unit]
        prop: 'feeUnit',
        type: 'select',
        width: 80,
      },
      {
        label: '币种',
        prop: 'currency',
        type: 'select',
        width: 80,
        propInDict: 'validCurrency',
      },
      // {
      //   label: '数量',
      //   prop: 'unitCount',width: 80,
      //   type: 'input',
      //   validateInput: (val, row, item, change) => {
      //     this.validateInput.call(this, val, row, item, change)
      //     this.$nextTick(() => {
      //       if (row.unitPrice) {
      //         row.feeAmt = (row.unitCount * row.unitPrice).toFixed(2)
      //       }
      //     })
      //   },
      // },
      // {
      //   label: '金额',
      //   prop: 'feeAmt',width: 100,
      //   type: 'text',
      // },
    ]
    this.option1.columns = [...this.columns]
    this.option2.columns = [...this.columns]
    this.option3.columns = [...this.columns]
  },
  activated() {
    console.log(this.$route.meta.isUseCache)
    if (this.$route.meta.isUseCache) {
      return
    }
    this.$refs['form'].resetFields()
    this.$nextTick(() => {
      this.$refs['form'].clearValidate()
    })
    this.option1.data = []
    this.option2.data = []
    this.option3.data = []
    this.init()
  },
  methods: {
    getData() {
      let data = {
        tempNo: this.tempNo
      }
      this.loading = true
      queryFeeTemplateDetail(data).then(res => {
        this.formData = Object.assign(this.formData, res.data)
        if (this.isCopy) this.formData.tempName = ''
        if (this.formData.tempType === 'biz') {
          this.tabsList = [
            {
              label: '业务费用',
              name: 'biz'
            }
          ]
          this.activeName = 'biz'
          // let column1 = this.option1.columns.find(item => item.prop === 'serviceCode')
          // column1.remoteSelectList = []
          this.option1.data = res.data.feeTemplateItemList.filter(item => {
            // if (item.serviceCode) {
            //   column1.remoteSelectList.push({ value: item.serviceCode, label: item.serviceName })
            // }
            return item.receipayType === 'receive'
          })
          // let column2 = this.option2.columns.find(item => item.prop === 'serviceCode')
          // column2.remoteSelectList = []
          this.option2.data = res.data.feeTemplateItemList.filter(item => {
            // if (item.serviceCode) {
            //   column2.remoteSelectList.push({ value: item.serviceCode, label: item.serviceName })
            // }
            return item.receipayType === 'pay'
          })
        } else {
          this.tabsList = [
            {
              label: '专项管理',
              name: 'special'
            }
          ]
          this.activeName = 'special'
          this.option3.data = res.data.feeTemplateItemList.filter(item => {
            return item.receipayType === 'pay'
          })
        }
        this.queryBusinessServiceList(this.formData.businessType)
      }).finally(() => {
        this.loading = false
      })
    },
    init() {
      this.tempNo = this.$route.query.tempNo
      this.isCopy = this.$route.query.isCopy
      this.tempType = this.$route.query.tempType
      if (this.tempNo) {
        this.isDetail = true
        this.getData()
      } else {
        this.isDetail = false
        if (this.tempType) {
          this.formData.tempType = this.tempType
        }
        this.tabsList = [
          {
            label: '业务费用',
            name: 'biz'
          },
          {
            label: '专项管理',
            name: 'special'
          }
        ]
        this.activeName = ''
        this.$nextTick(() => {
          this.activeName = 'biz'
        })
      }
    },
    // 切换表格显示
    handleCollapse(table) {
      this['show' + table] = !this['show' + table]
    },
    handleSave() {
      let reqMethod = ''
      if (this.isDetail && !this.isCopy) {
        reqMethod = modifyFeeTemplate
      } else {
        reqMethod = addFeeTemplate
      }
      this.saveFeeTemplate(reqMethod)
    },
    // 保存费用模板
    saveFeeTemplate(reqMethod) {
      try {
        this.$refs.form.validate((res, rej) => {
          if (!res) return
          // 清除不必要的请求参数
          // let fbFeeVos = this.fbFeeVos.map((item) => {
          //   if (!this.validateMoney(item.feeAmt)) {
          //     throw new Error()
          //   }
          //   let obj = { ...item, operation: 'update' }
          //   delete obj.edit
          //   delete obj.feeEnName
          //   delete obj.feeName
          //   return obj
          // })
          let fbFeeVos = this.fbFeeVos.filter(item => {
            if (this.isDetail && this.isCopy) {
              delete item.oid // 复制模板的时候删除此id
            }
            return !item.$isRowDelete // 过滤删除的费用
          })
          if (!this.validate(fbFeeVos, ['settleCorpType', 'feeName', 'serviceCode', 'unitPrice', 'feeUnit', 'currency'])) {
            return
          }
          try {
            fbFeeVos.forEach(item => {
              if (item.settleCorpType === 'fixed' && !item.settleCorpCode) {
                this.$message({ message: '结算单位类型为固定值时，须选择结算单位', type: 'error' })
                throw new Error('ending')
              }
            })
          } catch(e) {
            console.log(e.message)
            return
          }
          this.$confirm('确认保存费用模板吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(() => {
              let formData = null
              if (!this.formData.sortNum) {
                formData = Object.assign({}, this.formData, { sortNum: 1 })
              } else {
                formData = Object.assign({}, this.formData)
              }
              console.log({ ...formData, feeTemplateItemList: fbFeeVos }) // ...this.formData
              this.loading = true
              reqMethod({ ...formData, feeTemplateItemList: fbFeeVos }).then((res) => { // ...this.formData
                this.$message({ message: '添加成功！', type: 'success' })
                this.cancel(true)
              })
            })
            .catch((err) => {
              console.log(err)
            }).finally(() => {
              this.loading = false
            })
        })
      } catch (err) {}
    },
    handleCopy(type) {
      if (type === 'receive') {
        if (!this.multipleSelection1.length) {
          this.$message({
            type: 'error',
            message: '请至少选择一条应收费用进行复制',
            showClose: true
          })
          return
        }
        this.multipleSelection1.forEach(row => {
          this.copySingleFee(row)
        })
      } else if (type === 'pay') {
        if (this.activeName === 'biz') {
          if (!this.multipleSelection2.length) {
            this.$message({
              type: 'error',
              message: '请至少选择一条应付费用进行复制',
              showClose: true
            })
            return
          }
          this.multipleSelection2.forEach(row => {
            this.copySingleFee(row)
          })
        } else {
          if (!this.multipleSelection3.length) {
            this.$message({
              type: 'error',
              message: '请至少选择一条应付费用进行复制',
              showClose: true
            })
            return
          }
          this.multipleSelection3.forEach(row => {
            this.copySingleFee(row)
          })
        }
      }
    },
    copySingleFee(row) {
      let { settleCorpType, settleCorpName, settleCorpCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency } = row
      let feeItem = { settleCorpType, settleCorpName, settleCorpCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency }
      if (receipayType === 'receive') {
        this.addReceive(feeItem)
      } else if (receipayType === 'pay') {
        // feeItem.taxRate = taxRate
        this.addPay(feeItem)
      }
    },
    addReceive(feeItem) {
      if (!this['showTable1']) {
        this['showTable1'] = true
      }
      let obj = { canEdit: true }
      if (feeItem) {
        obj = feeItem
        delete obj.orderFeeId
      } else {
        // this.option1.columns.forEach(item => {
        //   obj[item.prop] = ''
        // })
        // // 默认值
        // obj['receipayType'] = 'receive'
        // obj['prepayType'] = (obj['prepayType'] === '' || !obj['prepayType']) ? 'prepay' : obj['prepayType']
        // obj['settleCorpName'] = this.settleCorpNameRecei ? this.settleCorpNameRecei : this.client ? this.client.unitName : ''
        // obj['settleCorpCode'] = this.settleCorpCodeRecei ? this.settleCorpCodeRecei : this.client ? this.client.unitCode : ''
        // obj['serviceName'] = this.serviceNameRecei ? this.serviceNameRecei : ''
        // obj['serviceCode'] = this.serviceCodeRecei ? this.serviceCodeRecei : ''
        // obj['unitCount'] = this.containerCount
        // obj['unitPrice'] = ''
      }
      // obj['settleCompName'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompName : this.$store.state.user.userInfo.settleCompanyName // 带出分公司的显示，但分公司code不传后台
      // obj['settleCompCode'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompCode : this.$store.state.user.userInfo.settleCompanyCode
      obj.edit = true
      obj.isAdd = true
      obj.index = this.option1.data.length
      this.option1.data.unshift(obj)
      this.option1.edit = true
      this.option2.edit = true // option2也置为edit true
      this.isEdit = true
      this.isAddReceive = true
    },
    addPay(feeItem) {
      if (this.activeName === 'biz') {
        if (!this['showTable2']) {
          this['showTable2'] = true
        }
        let obj = { canEdit: true }
        if (feeItem) {
          obj = feeItem
          delete obj.orderFeeId
        } else {
          // this.option2.columns.forEach(item => {
          //   obj[item.prop] = ''
          // })
          // // 默认值
          // // 1、在录入应付费用时，默认结算单位等于订舱代理。
          // // 2、应收、应付的数量：默认等于订单的箱量。
          // obj['receipayType'] = 'pay'
          // obj['prepayType'] = (obj['prepayType'] === '' || !obj['prepayType']) ? 'prepay' : obj['prepayType']
          // // obj['settleCorpName'] = this.client ? this.client.unitName : '' // client是委托单位，并不是应付的结算单位
          // // obj['settleCorpCode'] = this.client ? this.client.unitCode : ''
          // obj['settleCorpName'] = this.settleCorpNamePay ? this.settleCorpNamePay : this.bkgAgent.unitName ? this.bkgAgent.unitName : ''
          // obj['settleCorpCode'] = this.settleCorpCodePay ? this.settleCorpCodePay : this.bkgAgent.unitCode ? this.bkgAgent.unitCode : ''
          // obj['serviceName'] = this.serviceNamePay ? this.serviceNamePay : ''
          // obj['serviceCode'] = this.serviceCodePay ? this.serviceCodePay : ''
          // obj['unitCount'] = this.containerCount
        }
        // obj['settleCompName'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompName : this.$store.state.user.userInfo.settleCompanyName // 带出分公司的显示，但分公司code不传后台
        // obj['settleCompCode'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompCode : this.$store.state.user.userInfo.settleCompanyCode
        obj.edit = true
        obj.isAdd = true
        obj.index = this.option2.data.length
        this.option2.data.unshift(obj)
        this.option2.edit = true
        this.option1.edit = true
        this.isEdit = true
        this.isAddPay = true
        // this.getFeesCanEdit()
      } else {
        if (!this['showTable3']) {
          this['showTable3'] = true
        }
        let obj = { canEdit: true }
        if (feeItem) {
          obj = feeItem
          delete obj.orderFeeId
        } else {
        }
        obj.edit = true
        obj.isAdd = true
        obj.index = this.option3.data.length
        this.option3.data.unshift(obj)
        this.option3.edit = true
        this.isEdit = true
        this.isAddPay = true
      }
    },
    handleDelete(type) {
      if (type === 'receive') {
        if (!this.multipleSelection1.length) {
          this.$message({
            type: 'error',
            message: '请至少选择一条应收费用进行删除',
            showClose: true
          })
          return
        }
        this.multipleSelection1.forEach(row => {
          let $index = this.option1.data.findIndex(item => item === row)
          this.deleteSingleFee($index, row, this.option1)
        })
      } else if (type === 'pay') {
        if (this.activeName === 'biz') {
          if (!this.multipleSelection2.length) {
            this.$message({
              type: 'error',
              message: '请至少选择一条应付费用进行删除',
              showClose: true
            })
            return
          }
          this.multipleSelection2.forEach(row => {
            let $index = this.option2.data.findIndex(item => item === row)
            this.deleteSingleFee($index, row, this.option2)
          })
        } else {
          if (!this.multipleSelection3.length) {
            this.$message({
              type: 'error',
              message: '请至少选择一条应付费用进行删除',
              showClose: true
            })
            return
          }
          this.multipleSelection3.forEach(row => {
            let $index = this.option3.data.findIndex(item => item === row)
            this.deleteSingleFee($index, row, this.option3)
          })
        }
        
      }
    },
    deleteSingleFee($index, row, option) {
      if (row.isAdd) { // 新增的费用从列表删除
        option.data.splice($index, 1)
      } else { // 已存在的费用，显示删除的划线
        // let bool = this.editGuard([row], true)
        // if (!bool) return
        row.edit = false
        this.$set(row, '$isRowDelete', !row.$isRowDelete)
      }
      this.isEdit = true
      // this.getFeesCanEdit()
    },
    handleEdit(type) {
      if (type === 'receive') {
        if (!this.option1.data.length) return
        this.$set(this.option1, 'edit', true)
        if (this.multipleSelection1.length) {
          this.multipleSelection1.forEach(item => {
            this.$set(item, 'edit', true)
          })
        } else {
          this.option1.data.forEach(item => {
            this.$set(item, 'edit', true)
          })
        }
        
      }
      if (type === 'pay') {
        if (this.activeName === 'biz') {
          if (!this.option2.data.length) return
          this.$set(this.option2, 'edit', true)
          if (this.multipleSelection2.length) {
            this.multipleSelection2.forEach(item => {
              this.$set(item, 'edit', true)
            })
          } else {
            this.option2.data.forEach(item => {
              this.$set(item, 'edit', true)
            })
          }
        } else {
          if (!this.option3.data.length) return
          this.$set(this.option3, 'edit', true)
          if (this.multipleSelection3.length) {
            this.multipleSelection3.forEach(item => {
              this.$set(item, 'edit', true)
            })
          } else {
            this.option3.data.forEach(item => {
              this.$set(item, 'edit', true)
            })
          }
        }
      }
    },
    handleBizServs(item, row) {
      if (row.feeCode) {
        let data = {
          feeCode: row.feeCode
        }
        feeItemInfo(data).then(res => {
          if (res.data) {
            item.remoteSelectList = []
            res.data.serviceCodes.forEach(code => {
              if (code === '*') {
                item.remoteSelectList = this.businessServiceList
              } else {
                let f = this.businessServiceList.find(item => {
                  return item.value === code
                })
                if (f) {
                  item.remoteSelectList.push(f)
                }
              }
            })
          }
        })
      }
    },
    queryBusinessServiceList(value) { // queryString, item
      let params = { 
        businessType: value // this.formData.businessType
      }
      this.$store.dispatch('dict/queryBusinessServiceList', params).then(data => {
        // item.remoteSelectList = data
        this.businessServiceList = data
        this.serviceColumn.remoteSelectList = data
			})
    },
    handleKeyup(evt, option) {
      if (evt.key === 'Enter') {
        this.addRow(option.id)
      }
    },
    // 新增行  reverse 收转付  付转支
    addRow(optionId, reverse) {
      // if (!this.formData.tempType) {
      //   return this.$message({
      //     type: 'error',
      //     message: '须选择模板类型',
      //     showClose: true
      //   })
      // }
      if(reverse) {
        let selections, reverseArr
        let isPay = optionId === 'option2'
        if(!isPay) {
          if(!this.multipleSelection2.length) return this.$msgErrClose('请选择需要转收入的费用！')
          selections = this.multipleSelection2
        } else {
          if(!this.multipleSelection1.length) return this.$msgErrClose('请选择需要转支出的费用！')
          selections = this.multipleSelection1
        }
        reverseArr = selections.map(item => {
          let obj = Object.assign({}, item, { oid: null, isAdd: true, edit: true }) // { ...item, isAdd: true, edit: true }
          // obj._XID = obj.settleCorpCode = obj.settleCorpName = ''
          obj.$isRowCheck = obj.$isRowClick = false
          if(isPay) {
            obj.receipayType = 'pay'
          } else {
            obj.receipayType = 'receive'
          }
          return obj
        })
        this[optionId].data.unshift(...reverseArr)
        return
      }
      let arr = this[optionId].data
      // arr.unshift({ ...this.rowData })
      // if(formData.billType'(val){
      // let tag = val === 'dzg_bill_fee')
      let obj = { ...this.rowData, isAdd: true }
      // if(this.formData.billType === 'dzg_bill_fee') obj._forceEdit = true
      arr.unshift(Object.assign({ ...obj }, { receipayType: optionId === 'option1' ? 'receive' : 'pay' }, {
        // settleCorpName: optionId === 'option1' ? (this.settleCorpNameRecei ? this.settleCorpNameRecei : '') : (this.settleCorpNamePay ? this.settleCorpNamePay : ''),
        // settleCorpCode: optionId === 'option1' ? (this.settleCorpCodeRecei ? this.settleCorpCodeRecei : '') : (this.settleCorpCodePay ? this.settleCorpCodePay : '')
      }))
    },
    // 返回 关闭详情页 val 是否刷新列表
    cancel(refresh) {
      this.routerDelBack(refresh) // routerBack
    },
    // 自定义表头
    edit() {
      this.customColumnsPopShow = true
    },
    // 删除添加的行
    // handleDelete($index, row, option) {
    //   this.$confirm('确认删除此项吗？', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning',
    //   })
    //     .then(() => {
    //       option.data.splice($index, 1)
    //     })
    //     .catch(() => {})
    // },
    // handleCopy(row, option) {
    //   if (option === this.option1) {
    //     this.option1.data.unshift(Object.assign({}, row))
    //   } else {
    //     this.option2.data.unshift(Object.assign({}, row))
    //   }
    // },
    getTaxRate(row) {
      let data = {
        "feeCode": row.feeCode,
        "receipayType": "pay",
      }
      getTaxRate(data).then(res => {
        if (res.code === 0) {
          row.taxRate = res.data && res.data.taxRate
        }
      }).catch(err => {
        console.log(err)
      })
    },
    sendMulti(data, option){
      // this['multipleSelection'+type] = data
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      if (option === this.option3) this.multipleSelection3 = data
    }
  },
}
</script>
<style scoped lang="scss">
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.settlement-detail-form .el-form-item.long-form-item {
  width: 100%;
  display: flex;
  ::v-deep{
    .el-input{
      width: 100%;
    }
    label{
      flex: 0 0 auto;
    }
    .el-form-item__content {
      flex: 1 1 auto;
    }
  }
}
// .el-form-item {
//   width: 252px;
//   // width: 260px;
//   margin-bottom: 10px;
//   // margin-bottom: 7px;
//   margin-right: 24px;
// }
.el-form-item-text {
  font-size: 12px;
  /* width: 180px; */
}
// .settlement-detail-form {
//   padding: 20px 16px 8px; 
// }
.settlement-exchange-rates {
  width: 260px;
  display: inline-block;
  margin-right: 24px;
  vertical-align: top;
}
.settlement-exchange-rates .settlement-exchange-rates-title {
  color: #222222;
  line-height: 28px;
}
.finance-table-container {
  margin: 8px 16px 18px;
}
.finance-table-container + .finance-table-container {
  margin-top: 22px;
}

.select-template-box {
  margin-bottom: 10px;
}
.select-template-box .el-dropdown {
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  line-height: 26px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding-left: 5px;
}
.select-template-box .el-icon--right {
  margin-left: 0;
}
.select-template-box .el-dropdown-link:focus {
  outline: none;
}

.money-title > span {
  font-size: 12px;
  padding-left: 20px;
  i {
    font-style: normal;
    text-decoration: none;
    color: red;
  }
}
::v-deep .el-table .cell {
  padding-left: 4px;
  padding-right: 4px;
}
</style>