<template>
  <el-dialog :title="dialogOption.title" :visible.sync="dialogOption.show" width="90%">
    <div
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <el-form :model="form" ref="form" :rules="rules" label-position="left" inline size="mini">
        <el-form-item label="账簿" prop="acBookId">
          <el-select filterable v-model="form.acBookId" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="item in (dialogOption.ACBOOK||[])"
              :key="item.acBookId"
              :label="item.label"
              :value="item.acBookId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="finDate">
          <el-date-picker
            v-model="form.finDate"
            type="date"
            :placeholder="$t('Common.plSelect')"
            value-format="yyyy-MM-dd"
            :clearable="false"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="凭证字" prop="voucherClass">
          <el-select v-model="form.voucherClass" :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="item in (dialogOption.VOUCHERCLASS||[])"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div class="preview-header">
        <div class="fl">
          <span v-if="form.finDate">{{form.finDate.slice(0,4)}}年第{{form.finDate.slice(5,7)}}期</span>
        </div>
        <div class="fr">
          <el-button size="mini" class="finance-btn" type="primary" @click="addRow">新增行</el-button>
          <el-button size="mini" class="finance-btn" type="danger" @click="deleteRow">删除行</el-button>
          <el-button size="mini" class="finance-btn" @click="insertRow">插入行</el-button>
          <el-button size="mini" class="finance-btn" @click="copyRow">复制行</el-button>
        </div>
      </div>
      <div class="finance-table inner-table" id="sort-table-add">
        <el-table
          ref="table"
          :data="tableOption.data"
          show-summary
          :summary-method="sumMethod"
          highlight-current-row
          row-key="id"
        >
          <el-table-column width="50px" align="center" label="拖拽" class-name="drag__col">
            <img class="drag__icon" src="../../../../assets/icon-drag.png" />
          </el-table-column>
          <!-- <el-table-column
            width="40px"
            type="index"
            align="center"
            label="序号"
            class-name="drag__disabled"
          ></el-table-column>-->
          <!-- <el-table-column width="40px" type="index" align="center" class-name="index-class"></el-table-column> -->
          <el-table-column
            align="center"
            v-for="item in tableOption.columns"
            :prop="item.prop"
            :key="item.id"
            :label="item.label"
            :width="item.width"
            :minWidth="item.minWidth"
            :show-overflow-tooltip="item.type === 'text'"
          >
            <template slot-scope="scope">
              <template v-if="item.prop==='id'">{{+scope.$index+1}}</template>
              <template v-else-if="item.type==='input'">
                <el-input
                  type="text"
                  :placeholder="$t('Common.plEnter')"
                  clearable
                  v-model="scope.row[item.prop]"
                  @focus="item.focus && item.focus(scope.row, item)"
                  @blur="item.blur && item.blur(scope.row, item)"
                  @input=" (value) => { item.validateInput && item.validateInput(value, scope.row, item) } "
                  @clear="item.clear&&item.clear(scope.row)"
                ></el-input>
              </template>
              <template v-else-if="item.type==='add'">
                <el-input
                  :disabled="scope.row.isDisabled"
                  v-model="scope.row[item.prop]"
                  :placeholder="scope.row.isDisabled?'':'点击添加数据'"
                  :suffix-icon="scope.row.isDisabled?'':'el-icon-circle-plus-outline'"
                  @focus="addClick($event,scope.row)"
                ></el-input>
              </template>
              <template v-else-if="item.type==='select'">
                <el-select
                  v-model="scope.row[item.prop]"
                  :placeholder="$t('Common.plSelect')"
                  @change="(value) => item.change && item.change(value, scope.row, item)"
                >
                  <el-option
                    v-for="(optionItem, j) in dictMap[item.propInDict || item.prop].filter((v) => v.value != 'ORIGINAL')"
                    :key="'select' + item.prop + j"
                    :label="optionItem.label"
                    :value="optionItem.value"
                  ></el-option>
                </el-select>
              </template>
              <template v-else-if="item.type==='remoteSelect'">
                <el-select
                  v-model="scope.row[item.prop]"
                  :placeholder="$t('Common.plSelect')"
                  filterable
                  remote
                  :clearable="!!item.clearable"
                  :remote-method="(queryString) => item.remoteMethod(queryString, item)"
                  @visible-change="(val) => val && item.remoteMethod('', item)"
                  @change="(value) => item.change && item.change(value, scope.row, item)"
                >
                  <el-option
                    v-for="(optionItem, j) in item.selectOptions"
                    :key="'select' + item.prop + j"
                    :label="optionItem.label"
                    :value="optionItem.value"
                  ></el-option>
                </el-select>
              </template>
              <template v-else-if="item.type==='text'">{{scope.row[item.prop]}}</template>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="80">
            <template slot-scope="scope">
              <el-button
                v-if="scope.$index !== 0 && tableOption.data.length > 1"
                type="text"
                size="mini"
                @click.stop="upDown('up', scope.$index)"
              >上移</el-button>
              <el-button
                v-if="scope.$index !== dataLen - 1 && tableOption.data.length > 1"
                type="text"
                size="mini"
                @click.stop="upDown('down', scope.$index)"
              >下移</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div slot="footer" style="margin-top:18px; text-align: right;">
        <el-button type="primary" size="mini" @click="sure">{{$t('Common.sure')}}</el-button>
        <el-button plain size="mini" @click="cancel">{{$t('Common.cancel')}}</el-button>
      </div>
    </div>
    <el-dialog
      class="body__dialog"
      :title="dimensionOption.title"
      :visible.sync="dimensionOption.show"
      append-to-body
      width="400px"
    >
      <el-form
        :model="dimensionOption.form"
        ref="dimensionForm"
        :rules="rules"
        size="mini"
        label-width="80px"
      >
        <el-form-item
          v-for="item in dimensionOption.formItems"
          :label="item.label"
          :prop="item.prop"
          :key="item.prop"
          :rules="item.rules"
        >
          <el-select
            v-model="dimensionOption.form[item.prop]"
            :placeholder="$t('Common.plSelect')"
            filterable
            remote
            :noRemote="true"
            :remote-method="(queryString) => item.remoteMethod(queryString, item)"
            @visible-change="(val) => val && item.remoteMethod('', item)"
            clearable
          >
            <!-- dimensionFinValue: "BM000080", dimensionNameValue -->
            <el-option
              v-for="(optionItem,index) in item.selectOptions"
              :key="optionItem.value+index"
              :label="optionItem.label"
              :value="optionItem.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="dimensionSure">{{$t('Common.sure')}}</el-button>
        <el-button @click="dimensionOption.show = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as voucherMixin } from '../mixin.js'
import Sortable from 'sortablejs'
import { decimalFixed2, dateFormat } from '@/views/finance/utils/finance'
import { subjectList, searchDimensionFincode, voucherAdd, getKdExchangeRate } from '@/api/fin/acct'
import VoucherDialog from './voucherDialog'
// import LSnum from 'bignumber.js'

export default {
  name: 'addDialog',
  components: {
    FinanceTable,
    VoucherDialog,
  },
  mixins: [mixin, voucherMixin],
  props: {
    dialogOption: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
    dataLen() {
      return this.tableOption.data ? this.tableOption.data.length : 0
    },
  },
  data() {
    let row = {
      summaryInfo: '',
      subjectCode: '',
      subjectName: '',
      dimensions: '',
      srcCurrency: '',
      typeRate: '固定汇率',
      exRate: '',
      srcAmt: '',
      srcAmtOld: '',
      debitAmt: '',
      debitAmtOld: '',
      creditAmt: '',
      creditAmtOld: '',
      isDisabled: true,
    }
    return {
      tableOption: {
        columns: [
          { prop: 'id', label: this.$t('Common.index'), type: 'text', width: '50px' },
          { prop: 'summaryInfo', label: this.$t('Finance.abstract'), type: 'input', minWidth: 160 },
          {
            prop: 'subjectCode',
            label: '科目编码',
            type: 'remoteSelect',
            width: 100,
            clearable: true,
            change: (value, row, item) => {
              if (!value) {
                row.subjectName = row.dimensions = row._dimensions = row.__dimensions = row.__jd = ''
                row.isDisabled = true
                row.isRequiredDimensions = false
                return
              }
              let find = item.selectOptions.find((v) => v.value === value)
              row.subjectName = find?.fullName || ''
              row.dimensions = ''
              row._dimensions = find.dimensions || []
              row.__dimensions = {}
              if (row._dimensions.length) {
                row.isDisabled = false
                if (row._dimensions.find((item) => item.isRequired === 'yes')) {
                  row.isRequiredDimensions = true
                } else {
                  row.isRequiredDimensions = false
                }
              } else {
                row.isDisabled = true
                row.isRequiredDimensions = false
              }
              // console.log(find.direction);
              if (find.direction && find.direction !== 'flat') {
                // 默认借贷方向
                row.__jd = find.direction + 'Amt'
              }
              // this.$set(row, 'subjectName', value)
            },
            selectOptions: [],
            remoteMethod: (query, item) => {
              query = !query ? [] : [{ column: 'subjectCode', type: 'default', value: query }]
              subjectList({ currPage: 1, pageSize: 30, query }).then(({ data }) => {
                item.selectOptions = data.list.map((v) => ({ ...v, value: v.subjectCode, label: v.subjectCode }))
              })
            },
          },
          { prop: 'subjectName', label: '科目全称', type: 'text', minWidth: 130 },
          { prop: 'dimensions', label: '核算维度', type: 'add', minWidth: 130 },
          {
            prop: 'srcCurrency',
            label: this.$t('FeeList.currency'),
            type: 'select',
            width: 60,
            propInDict: 'currency',
            change: (value, row) => {
              if (this.form.finDate) {
                getKdExchangeRate({
                  srcCurrency: value,
                  finMon: this.form.finDate.slice(0, 7),
                  acBookId: this.form.acBookId,
                }).then((res) => {
                  row.exRate = res.data?.rate || 1
                  if (row.srcAmt) {
                    let direction = row.__click || row.__jd || 'debitAmt'
                    row[direction] = row[direction + 'Old'] = decimalFixed2(new LSnum(row.exRate).times(row.srcAmt).valueOf())
                  }
                })
              }
            },
          },
          { prop: 'typeRate', label: '汇率类型', type: 'text', width: 60 },
          { prop: 'exRate', label: '汇率', type: 'text', width: 80 },
          // {
          //   prop: 'exRate',
          //   label: '汇率',
          //   type: 'input',
          //   width: 80,
          //   validateInput: (value, row, item) => {
          //     this.diyValid(value, row, item.prop, /^(\d+(\.\d{0,6})?)?$/, /^(\d+(\.\d{0,6})?)?/)
          //   },
          // },
          {
            prop: 'srcAmt',
            label: '原币金额',
            type: 'input',
            width: 80,
            validateInput: (value, row, item) => {
              this.diyValid(value, row, item.prop)
            },
            blur: (row) => {
              // console.log(row.__click, row.__jd)
              if (row.srcAmtOld == row.srcAmt) {
                return
              }
              row.srcAmtOld = row.srcAmt
              if (row.exRate) {
                if (!row.srcAmt) {
                  row.debitAmt = row.creditAmt = ''
                  return
                }
                let direction = row.__click || row.__jd || 'debitAmt'
                row[direction] = row[direction + 'Old'] = decimalFixed2(new LSnum(row.exRate).times(row.srcAmt).valueOf())
              }
            },
            clear: (row) => {
              row.srcAmtOld = row.srcAmt = row.debitAmtOld = row.debitAmt = row.creditAmt = row.creditAmtOld = ''
            },
          },
          {
            prop: 'debitAmt',
            label: '借方金额',
            type: 'input',
            width: 80,
            blur: (row) => {
              // console.log(row.exRate && Number(row.debitAmt))
              if (row.debitAmtOld == row.debitAmt) {
                return
              }
              row.debitAmtOld = row.debitAmt
              if (row.exRate && Number(row.debitAmt)) {
                row.creditAmt = row.creditAmtOld = ''
                row.__click = 'debitAmt'
                row.srcAmt = row.srcAmtOld = decimalFixed2(new LSnum(row.debitAmt).div(row.exRate).valueOf())
                // console.log(row.debitAmt, row.exRate,row.srcAmt);
              } else {
                row.srcAmt = row.srcAmtOld = row.debitAmt = row.debitAmtOld = ''
              }
            },
            validateInput: (value, row, item) => {
              this.diyValid(value, row, item.prop)
            },
            clear: (row) => {
              if (row.debitAmtOld) {
                row.srcAmtOld = row.srcAmt = row.debitAmtOld = row.debitAmt = ''
              }
            },
          },
          {
            prop: 'creditAmt',
            label: '贷方金额',
            type: 'input',
            width: 80,
            blur: (row) => {
              // console.log(row.exRate && Number(row.creditAmt))
              if (row.creditAmtOld == row.creditAmt) {
                return
              }
              row.creditAmtOld = row.creditAmt
              if (row.exRate && Number(row.creditAmt)) {
                row.debitAmt = row.debitAmtOld = ''
                row.__click = 'creditAmt'
                row.srcAmt = row.srcAmtOld = decimalFixed2(new LSnum(row.creditAmt).div(row.exRate).valueOf())
                // console.log(row.creditAmt, row.exRate, row.srcAmt)
              } else {
                row.srcAmt = row.srcAmtOld = row.creditAmt = row.creditAmtOld = ''
              }
            },
            validateInput: (value, row, item) => {
              this.diyValid(value, row, item.prop)
            },
            clear: (row) => {
              if (row.creditAmtOld) {
                row.srcAmtOld = row.srcAmt = row.creditAmt = row.creditAmtOld = ''
              }
            },
          },
        ],
        data: [],
      },
      dimensionOption: { show: false, title: '维度数据录入', formItems: [], form: {} },
      form: { finDate: '', voucherClass: '', acBookId: '' },
      rules: {
        finDate: [{ required: true, message: ' ', trigger: 'blur' }],
        voucherClass: [{ required: true, message: ' ', trigger: 'change' }],
        acBookId: [{ required: true, message: ' ', trigger: 'change' }],
      },
      voucherClassOptions: [],
      acBookOptions: [],
      row,
      rowId: 0,
    }
  },
  watch: {
    'form.finDate'(val) {
      if (val) {
        this.tableOption.data.forEach((item) => {
          if (item.srcCurrency) {
            getKdExchangeRate({ srcCurrency: item.srcCurrency, finMon: val.slice(0, 7), acBookId: this.form.acBookId }).then(
              (res) => {
                item.exRate = res.data?.rate || 1
              }
            )
          }
        })
      }
    },
  },
  mounted() {
    this.addRow()
    this.addRow()
    this.addRow()
    this.setCurrentRow()
    this.$nextTick(() => {
      this.form.finDate = dateFormat('yyyy-mm-dd', new Date())
      this.Sortable = Sortable.create(document.querySelector('#sort-table-add .el-table__body-wrapper tbody'), {
        handle: '.drag__col',
        onUpdate: (event) => {
          this.$nextTick(() => {
            let newIndex = event.newIndex
            let oldIndex = event.oldIndex
            let item = this.tableOption.data.splice(oldIndex, 1)
            this.tableOption.data.splice(newIndex, 0, item[0])
            // this.setCurrentRow(this.getCurrentIndex())
          })
        },
      })
    })
  },
  methods: {
    // 核算维度数据确定按钮
    dimensionSure() {
      console.log(this.dimensionOption.form)
      // <!-- dimensionFinValue: "BM000080", dimensionNameValue -->);
      this.$refs['dimensionForm'].validate((valid) => {
        if (valid) {
          let str = ''
          let obj = JSON.parse(JSON.stringify(this.dimensionOption.form))
          this.dimensionOption.formItems.forEach((item) => {
            if (obj[item.prop]) {
              str = str + obj[item.prop] + ';'
            }
          })
          this.backupRow.dimensions = str
          this.backupRow.__dimensions = obj
          this.dimensionOption.show = false
          // console.log(this.tableOption.data)
        }
      })
    },
    // 点击添加核算维度
    addClick(event, row) {
      // console.log(row);
      if (!row.subjectCode) {
        event.target.blur()
        if (!this.dimensionTimeout) {
          this.dimensionTimeout = true
          this.$msgErrClose('请先选择科目编码！')
          setTimeout(() => {
            this.dimensionTimeout = false
          }, 2000)
        }
        return
      }
      if (!row._dimensions || !row._dimensions.length) {
        event.target.blur()
        if (!this.dimensionTimeout) {
          this.dimensionTimeout = true
          this.$msgWarnClose('该科目下无核算维度数据！')
          setTimeout(() => {
            this.dimensionTimeout = false
          }, 2000)
        }
        return
      }
      this.backupRow = row
      let obj = {}
      let rules = { required: true, message: ' ', trigger: 'blur' }
      this.dimensionOption.formItems = row._dimensions.map((item) => {
        // <!-- dimensionFinValue: "BM000080", dimensionNameValue -->);
        obj[item.dimensionCode] = ''
        return {
          label: item.dimensionName,
          prop: item.dimensionCode,
          rules: item.isRequired === 'yes' ? rules : {},
          selectOptions: [],
          remoteMethod: (query, item) => {
            searchDimensionFincode({ dimensionCode: item.prop, textValue: query || '' }).then(({ data }) => {
              item.selectOptions = (data || []).map((v) => ({
                label: v.dimensionNameValue,
                value: `${v.dimensionFinValue}/${v.dimensionNameValue}`,
              }))
            })
          },
        }
      })
      // console.log(this.dimensionOption.formItems)
      this.dimensionOption.form = { ...(row.__dimensions || obj) }
      this.dimensionOption.show = true
      // console.log(this.dimensionOption.form)
      this.$nextTick(() => {
        this.$refs.dimensionForm.clearValidate()
      })
      // console.log(item, form)
      // this.dimensionOption.title = `查找${item.label}`
      // this.dimensionOption.cfg = { ...item, form }
      // this.dimensionOption.show = true
    },
    // 设置选中行
    setCurrentRow(index) {
      this.$nextTick(() => {
        this.$refs.table.setCurrentRow(this.tableOption.data[index || 0])
      })
    },
    // 获取选中行的索引
    getCurrentIndex() {
      let row = this.$refs.table.store.states.currentRow
      let index
      this.tableOption.data.forEach((item, i) => {
        if (item === row) index = i
      })
      return index
    },
    // 新增行
    addRow() {
      this.rowId++
      this.tableOption.data.push({ ...this.row, id: this.rowId })
    },
    // 删除行
    deleteRow() {
      if (this.tableOption.data.length <= 1) {
        return this.$msgErrClose('至少要有一条数据！')
      }
      let index = this.getCurrentIndex()
      let data = JSON.parse(JSON.stringify(this.tableOption.data))
      data.splice(index, 1)
      this.tableOption.data = data
      this.setCurrentRow(index)
    },
    // 插入行
    insertRow() {
      this.rowId++
      let index = this.getCurrentIndex()
      this.tableOption.data.splice(index, 0, { ...this.row, id: this.rowId })
    },
    // 复制行
    copyRow() {
      this.rowId++
      this.tableOption.data.push({ ...this.$refs.table.store.states.currentRow, id: this.rowId })
    },
    // 上下移动
    upDown(type, index) {
      let data = JSON.parse(JSON.stringify(this.tableOption.data))
      let row = data[index]
      data.splice(index, 1)
      data.splice(type === 'up' ? index - 1 : +index + 1, 0, row)
      this.tableOption.data = data
    },
    // 自定义求和
    sumMethod({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        let prop = column.property
        if (prop === 'srcAmt') {
          sums[index] = '合计'
        } else if (['debitAmt', 'creditAmt'].includes(prop)) {
          const values = data.map((item) => Number(item[column.property] || 0))
          sums[index] = decimalFixed2(values.reduce((prev, curr) => prev.plus(curr), BIGZERO).valueOf())
          this['__' + prop] = sums[index]
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    // 新增凭证确定按钮
    sure() {
      this.$refs.form.validate((res) => {
        if (res) {
          let list = this.getValidRows()
          if (!list.length) {
            this.$msgErrClose('请保证至少一条记录是完整的！')
          }
          let errStrList = this.errList.filter((item) => item.length)
          let errDict = { debitAmt: '借贷金额', dimensions: '核算维度', srcCurrency: '币种' }
          if (errStrList.length) {
            let errStr = ''
            this.errList.forEach((item, index) => {
              if (!item.length) return
              let str = item.map((v) => errDict[v]).join('、')
              errStr = `${errStr}序号${+index + 1}：${str}不能为空；`
            })
            return this.$msgErrClose(errStr)
          }
          if (this.__debitAmt !== this.__creditAmt) {
            return this.$msgErrClose('借贷不相等！')
          }
          // console.log(list)
          let voucherItemList = list.map((item) => {
            let row = this.row
            let obj = {}
            for (const key in row) {
              obj[key] = item[key]
            }
            let arr = []
            let dimensions = item.__dimensions
            item._dimensions.forEach((item) => {
              let val = dimensions[item.dimensionCode]
              if (val) {
                arr.push({
                  dimensionCode: item.dimensionCode,
                  dimensionFinValue: val.split('/')[0],
                  dimensionNameValue: val.split('/')[1],
                })
              }
              // if (dimensions[item.prop]) {
              //   arr.push({
              //     dimensionCode: item.prop,
              //     dimensionFinValue: dimensions[item.prop].dimensionFinValue,
              //     dimensionNameValue: dimensions[item.prop].dimensionNameValue,
              //   })
              // }
            })

            obj.dimensions = arr
            return obj
          })
          if (this.warnList.length) {
            let msg = this.warnList.join('；')
            this.$confirmWarn(msg + '，是否仍继续保存？', () => this.voucherAdd(voucherItemList))
            return
          }
          this.voucherAdd(voucherItemList)
        }
      })
    },
    voucherAdd(voucherItemList) {
      this.lsLoading = true
      voucherAdd({ ...this.form, voucherItemList })
        .then((res) => {
          this.$msgSucClose('新增成功！')
          this.$emit('close', 'refresh')
        })
        .catch(() => (this.lsLoading = false))
    },
    // 新增凭证取消按钮
    cancel() {
      this.$emit('close')
    },
    // 输入框验证数字
    diyValid(value, row, prop, reg1, reg2) {
      reg1 = reg1 || /^-?(\d+(\.\d{0,2})?)?$/
      reg2 = reg2 || /^-?(\d+(\.\d{0,2})?)?/
      if (!reg1.test(value)) {
        let res = reg2.exec(row[prop])
        row[prop] = res && res[0]
        if (!this[prop + 'Timeout']) {
          this[prop + 'Timeout'] = true
          this.$msgErrClose('请输入正确的数字！')
          setTimeout(() => {
            this[prop + 'Timeout'] = false
          }, 2000)
        }
      }
    },
    // 验证行内数据
    getValidRows() {
      this.errList = []
      this.warnList = []
      console.log(this.tableOption.data)
      return this.tableOption.data.filter((item, index) => {
        this.errList.push([])
        let hasVal = item.subjectCode
        let tag = true
        for (const key in this.row) {
          if (['debitAmt', 'creditAmt'].includes(key)) {
            //  借、贷金额必须有一方有数据
            // console.log(`${item.debitAmt}, ${item.creditAmt}`)
            if (item.debitAmt === '' && item.creditAmt === '') {
              // console.log(key)
              hasVal && this.errList[index].push(key)
              tag = false
            }
          } else if (!item[key]) {
            if (key === 'dimensions') {
              // 值为空，且是核算维度，且核算维度是必须的
              if (item.isRequiredDimensions) {
                hasVal && this.errList[index].push(key)
                tag = false
              }
            } else if (['srcCurrency'].includes(key)) {
              // 币种必填
              hasVal && this.errList[index].push(key)
              tag = false
            }
          }
        }
        if (tag) {
          let amt = Number(item.debitAmt) || Number(item.creditAmt)
          if (decimalFixed2(new LSnum(item.srcAmt).times(item.exRate).valueOf()) != amt) {
            this.warnList.push(`序号${+index + 1}金额不相等[${item.srcAmt}*${item.exRate}!=${amt}]`)
          }
        }
        // console.log(tag)
        return tag
      })
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  max-height: 80vh;
  padding: 20px;
  overflow: hidden;
  // 输入框 form
  .el-form-item {
    margin: 0 20px 10px 0;
    .el-form-item__content {
      width: 180px;
      & > div {
        width: 100%;
      }
    }
  }
  // 表格样式
  .inner-table {
    .el-table::before {
      // background: #29aee2;
      height: 0;
    }
    th,
    td {
      border-top: 1px solid #29aee2;
      border-left: 1px solid #29aee2;
      border-bottom: 0;
      &:nth-child(13) {
        border-right: 1px solid #29aee2 !important;
      }
    }
    .el-table__header th {
      background: transparent !important;
    }
    .el-table__footer-wrapper {
      td {
        color: #222222;
        background: transparent;
        font-weight: bold;
        border-bottom: 1px solid #29aee2 !important;
      }
    }
    th.gutter,
    colgroup.gutter {
      display: table-cell !important;
    }
    .el-button {
      user-select: none !important;
      padding: 0;
    }
    .el-button + .el-button {
      margin-left: 4px;
    }
    .cell.el-tooltip {
      overflow: hidden;
    }
    tr:hover > td {
      background: none;
    }
    tr.current-row > td {
      background-color: #e0f0fa !important;
    }
  }
  // 表格头部按钮
  .preview-header {
    overflow: hidden;
    .fl {
      float: left;
      font-size: 12px;
      line-height: 28px;
      color: #222222;
      font-weight: bold;
      span {
        font-weight: normal;
        color: #4a4a4a;
        padding-left: 280px;
      }
    }
    .fr {
      float: right;
    }
  }
  /* 用于element计算右侧列高度不准确的情况 */
  .el-table__fixed-right {
    min-height: 70px !important;
  }
  .drag__icon {
    margin-top: 3px;
  }
  .finance-table .el-table__footer-wrapper {
    tr td:nth-last-of-type(4) {
      color: #222222;
    }
    td {
      // font-size: 14px;
      background: rgba(231, 235, 255, 0.3) !important;
      font-weight: bold;
      color: #3e80f5;
    }
  }
}
.body__dialog ::v-deep {
  // .el-form-item__label,
  // .el-form-item__content,
  input {
    height: 20px;
    line-height: 20px;
  }
  .el-form-item {
    margin-right: 0;
  }
  .el-form-item__content {
    width: calc(100% - 80px) !important;
  }
  .el-button--mini {
    padding: 3px 10px;
  }
}
</style>