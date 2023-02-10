<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            class="finance-btn"
            type="primary"
            size="mini"
            @click="dialogShowSet = true"
          >修改下个关账日</el-button>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
        </div>
      </div>
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <el-dialog title="修改" :visible.sync="dialogShow" width="400px" @close="dialogShow = false">
      <el-form
        :model="form"
        ref="form"
        :rules="rules"
        label-width="100px"
        :inline="false"
        size="mini"
        style="padding-top: 16px"
      >
        <el-form-item :label="$t('FeeList.settleComp')" prop="settleCompName">
          <el-autocomplete
            style="width:250px"
            disabled
            v-model="form.settleCompName"
            placeholder="请选择分公司名"
            :select-when-unmatched="true"
            :fetch-suggestions="
              (queryString, cb) => {
                querySettleUnit({ queryString, unitTypes: 'company', isAdd: true }, cb);
              }
            "
            @select="
              value => {
                form.settleCompCode = value.key;
              }
            "
          ></el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('FeeList.finDate')" prop="finDate">
          <el-date-picker
            style="width:250px"
            disabled
            v-model="form.finDate"
            type="date"
            value-format="yyyy-MM-dd"
            :placeholder="$t('Common.plSelect')"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="下个关账日" prop="nextCloseDate">
          <el-date-picker
            style="width:250px"
            v-model="form.nextCloseDate"
            type="date"
            value-format="yyyy-MM-dd"
            :placeholder="$t('Common.plSelect')"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sure">{{$t('Common.sure')}}</el-button>
        <el-button @click="dialogShow = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改下个关账日"
      :visible.sync="dialogShowSet"
      width="400px"
      @close="dialogShowSet = false"
    >
      <el-form
        :model="formSet"
        ref="formSet"
        :rules="rulesSet"
        label-width="100px"
        :inline="false"
        size="mini"
        style="padding-top: 16px"
      >
        <el-form-item label="下个关账日" prop="nextCloseDate">
          <el-date-picker
            style="width:250px"
            v-model="formSet.nextCloseDate"
            type="date"
            value-format="yyyy-MM-dd"
            :placeholder="$t('Common.plSelect')"
            :picker-options="pickerOptionsSet"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sureSet">{{$t('Common.sure')}}</el-button>
        <el-button @click="dialogShowSet = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import API from '@/api/fin/finClose'
import { dateFormat } from '../../utils/finance'

export default {
  name: 'finDate',
  mixins: [mixin, mixin2, voucherMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },

  data() {
    return {
      keyDownActive: true,
      //下一个关账日期配置选项
      pickerOptions: {},
      // 返回数据备份
      resData: {},
      // 列表页--搜索配置
      searchOption: {},
      tableOption: {},
      dialogShow: false,
      form: {
        oid: 0,
        finMon: '',
        settleCompName: '',
        settleCompCode: '',
        finDate: '',
        nextCloseDate: '',
      },
      rules: {
        nextCloseDate: [{ required: true, message: '请选择下一个关账日' }],
      },
      dialogShowSet: false,
      formSet: { nextCloseDate: '' },
      rulesSet: {
        nextCloseDate: [{ required: true, message: '请选择下一个关账日' }],
      },
      pickerOptionsSet: {
        disabledDate(date) {
          // let nowDate = new Date()
          // nowDate.setMonth(+nowDate.getMonth() + 1)
          // nowDate.setDate(0)
          // if (date.getTime() <= nowDate) {
          if (date.getTime() <= new Date().setDate(0)) {
            return true
          }
          return false
        },
      },
    }
  },
  computed: {},
  created() {
    // 搜索配置
    this.searchOption = {
      saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 1,
        searchInputGroup: [
          { key: 'settleCompCode', value: '', showType: '3' },
          // { key: 'finDate', value: '', showType: '8' },
          // { key: 'createdTime', value: '', showType: '5' },
        ],
        filterGroups: {
          finBillNo: { label: '费用单号', type: 'input', showType: '1' },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCompCode',
            type: 'remoteSelect',
            showType: '3',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          createdTime: { label: this.$t('Common.createTime'), type: 'daterange', showType: '5' },
          updatedTime: { label: '更新时间', type: 'daterange', showType: '5' },
          finDate: {label: this.$t('FeeList.finDate'), type: 'date', showType: '8', format: 'yyyy-MM-dd' },
        },
      },
    }

    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = { ...this.option, id: 'option1', $name: 'FinDate', pagination, selection: false }
    // this.tableOption.operationBtns.show = false
    this.tableOption.operationBtns.data = this.editOperate
    if (!this.checkAuth(this.$route.name, 'btn-edit')) this.tableOption.operationBtns = false
    let columns = [
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), width: 200 },
      { prop: 'finDate', label: '财务日期' },
      { prop: 'finMon', label: '财务月份' },
      { prop: 'nextCloseDate', label: '下个关账日' },
      { prop: 'createdTime', label: '创建时间' },
      { prop: 'updatedName', label: '更新人', type: 'select' },
      { prop: 'updatedTime', label: '更新时间', width: 130 },
      // {
      //   prop: 'test',
      //   label: '操作',
      //   type: 'button',
      //   width: '130px',
      //   fixed: 'right',
      //   hasMargin: true,
      //   formatter: (row, item) => '修改',
      //   operationBtns: {
      //     show: true,
      //     callback: (action, index, row, option, subItem, btnIndex) => {
      //       this.handleEdit(row)
      //     },
      //   },
      // },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
    this.getData()
  },
  methods: {
    // 搜索按钮
    search() {
      this.tableOption.pagination.currPage = 1
      this.getData(true)
    },

    // 封装请求参数并请求列表
    getData(isSearch) {
      this.lsLoading = true
      console.log(this.searchOption.addFilter.searchInputGroup)
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [],
      }
      this.searchOption.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        if (value) {
          if (value instanceof Array) {
            if (value.length === 0) {
              return
            }
            let TimeIndex = key.indexOf('Time')
            if (TimeIndex > -1) {
              data.query.push({
                column: key + 'Start',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]),
              })
              data.query.push({
                column: key + 'End',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]),
              })
            }
          } else {
            data.query.push({
              column: key,
              type: 'default', // 该接口的type后台写的都是default
              value: req || value,
            })
          }
        }
      })

      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      console.log('data:', data)
      API.sysDateList(data)
        .then((res) => {
          if (res.code === 0) {
            this.tableOption.data = res.data.list || []
            Object.assign(this.tableOption.pagination, res.data)
            // this.tableOption.pagination.currPage = res.data.currPage
            // this.tableOption.pagination.pageSize = res.data.pageSize
            // this.tableOption.pagination.totalCount = res.data.totalCount
            this.resData = {
              allColumns: [...new Set(res.data.allColumns)],
              configColumns: [...new Set(res.data.configColumns)],
            }
          }
        })
        .finally(() => (this.lsLoading = false))
    },
    // 点击修改打开对话框
    handleSingleEdit(row) {
      this.dialogShow = true
      this.$nextTick(() => {
        //打开对话框先充值表单
        this.$refs.form.resetFields()
        //为表单赋值
        this.form.settleCompName = row.settleCompName
        this.form.finDate = row.finDate
        this.form.nextCloseDate = row.nextCloseDate
        this.form.oid = row.oid
        this.form.settleCompCode = row.settleCompCode
        this.form.finMon = row.finMon
        //下次关账时间框选项配置
        this.pickerOptions = {
          disabledDate(date) {
            //若小于下次关账时间 则设置禁用
            if (date.getTime() <= new Date(row.finDate).setDate(0)) {
              return true
            }
            return false
          },
        }
      })
    },
    // 提交修改
    sure() {
      this.$refs.form.validate((res) => {
        if (res) {
          //提交修改
          this.lsLoading = true
          API.sysDateSave(this.form)
            .then((res) => {
              this.$message.success(this.$t('Hedge.modifyTips'))
              this.dialogShow = false
              //重新拉取数据
              this.getData()
            })
            .catch(() => (this.lsLoading = false))
        }
      })
    },
    sureSet() {
      this.$refs.formSet.validate((res) => {
        if (res) {
          //提交修改
          this.lsLoading = true
          API.setNextCloseDate(this.formSet)
            .then((res) => {
              this.$msgSucClose(this.$t('Hedge.modifyTips'))
              this.dialogShowSet = false
              //重新拉取数据
              this.getData()
            })
            .catch(() => (this.lsLoading = false))
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep .el-button.el-button--text {
  margin-left: 6px;
  margin-right: 6px;
}
</style>
