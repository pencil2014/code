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
        <div class="money-box-left"></div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable :option="option1" />
    </div>
    <el-dialog title="财务代码" :visible.sync="finCodeDialogShow" width="660px">
      <FinanceTable :option="option2" />
    </el-dialog>

    <el-dialog
      :noModalClose="dialogType === 'finCode'"
      :title="dialogTitle"
      :visible.sync="dialogShow"
      width="460px"
      @close="dialogClose"
    >
      <template>
        <div v-if="dialogType === 'serviceCode'">{{serviceCodesStr}}</div>
        <el-form v-else :model="form" ref="form" label-width="122px" :inline="false" size="mini">
          <el-form-item label="旧财务代码：" v-if="form.oldFinCode && dialogType === 'finCode'">
            <el-input v-model="form.oldFinCode" disabled></el-input>
          </el-form-item>
          <el-form-item
            label="财务代码："
            :rules="{required: true, message: ' ', trigger: 'change'}"
            v-if="dialogType === 'finCode'"
            prop="newFinCode"
          >
            <el-input :maxlength="32" v-model="form.newFinCode"></el-input>
          </el-form-item>
          <el-form-item
            label="是否可录应付费用："
            :rules="{required: true, message: ' '}"
            v-if="dialogType === 'isForbidPayFee'"
            prop="isForbidPayFee"
          >
            <el-select style="width: 100%;" v-model="form.isForbidPayFee" :placeholder="$t('Common.plSelect')">
              <el-option
                v-for="item in [{label:$t('Common.yes'),value:'no'},{label:$t('Common.no'),value:'yes'}]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item> 
          <el-form-item
            label="是否可录应收费用："
            :rules="{required: true, message: ' '}"
            v-if="dialogType === 'isForbidRecvFee'"
            prop="isForbidRecvFee"
          >
            <el-select style="width: 100%;" v-model="form.isForbidRecvFee" :placeholder="$t('Common.plSelect')">
              <el-option
                v-for="item in [{label: $t('Common.yes'),value:'no'},{label: $t('Common.no'),value:'yes'}]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <span slot="footer" v-if="dialogType !== 'serviceCode'">
        <el-button size="mini" type="primary" @click="dialogClose(true)">{{$t('Common.sure')}}</el-button>
        <el-button size="mini" @click="dialogShow = false">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { settleUnitList, serviceItemlist, changeFinCode, changeFeeForbid, finCodeList } from '@/api/companyResource'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { getDictLabel } from '@/utils/tools'
export default {
  name: 'employeeTitle',
  mixins: [mixin, mixin2],
  data() {
    return {
      keyDownActive: true,
      // 列表页--表格配置
      option1: {},
      option2: {},
      // 列表页--搜索配置
      searchOption: {},
      dialogTitle: '',
      dialogType: '',
      dialogShow: false,
      finCodeDialogShow: false,
      serviceCodesStr: '',
      form: { newFinCode: '', oldFinCode: '', isForbidFee: '', isForbidPayFee: '', isForbidRecvFee: '', },
      pageSizeUrl: true,
    }
  },
  components: {
    FinanceTable,
    FinanceSearch,
  },
  created() {
    // 列表页--搜索配置
    let searchInputGroup = ['unitName', 'unitType', 'settleCycle', 'isTemporary']
    this.searchOption = {
      saveDefault: true,
      // isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          // settleCorpCode: {
          //   label: this.$t('FeeList.settleCorp'),
          //   prop: 'settleCorpCode',
          //   type: 'remoteSelect',
          //   remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
          //   visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item),
          //   remoteSelectList: [],
          // },
          // settleCompCode: {
          //   label: this.$t('FeeList.settleComp'),
          //   prop: 'settleCorpCode',
          //   type: 'remoteSelect',
          //   remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          //   visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          //   remoteSelectList: [],
          // },
          unitName: { label: '结算单位名称', type: 'input' },
          unitCode: { label: '结算单位编码', type: 'input' },
          customerFinCode: { label: '客户财务代码', type: 'input' },
          supplierFinCode: { label: '供应商财务代码', type: 'input' },
          unitType: { label: this.$t('FeeList.settleCorpType'), type: 'select', prop: 'unitType' },
          settleCycle: { label: '结算周期', type: 'select', prop: 'settleCycle' },
          isTemporary: { label: this.$t('Collect.isVirtual'), type: 'select', prop: 'yesNo' },
          state: {
            label: '是否有效',
            type: 'select',
            selectOptions: [
              { label: this.$t('Common.yes'), value: 'valid' },
              { label: this.$t('Common.no'), value: 'invalid' },
            ],
          },
          isBlack: { label: '是否黑名单', type: 'select', prop: 'yesNo' },
          isForbidFee: {
            label: '是否可录费用',
            type: 'select',
            selectOptions: [
              { label: this.$t('Common.yes'), value: 'no' },
              { label: this.$t('Common.no'), value: 'yes' },
            ],
          },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = {
      ...this.option,
      operationBtns: false,
      selection: false,
      id: 'option1',
      $name: 'SettleUnit',
      pagination,
      emptyText: this.$t('Common.emptyText'),
    }

    let columns = [
      {
        label: '结算单位编码',
        prop: 'unitCode',
        width: 220,
        type: 'text',
      },
      {
        label: '客商orgid',
        prop: 'orgid',
        width: 130,
        type: 'text',
      },
      // {
      //   label: '财务编码',
      //   prop: 'finCode',
      //   width: 220,
      //   type: 'text',
      // },
      {
        prop: 'unitName',
        label: '结算单位名称',
        minWidth: 150,
        type: 'text',
      },
      {
        prop: 'unitType',
        label: this.$t('FeeList.settleCorpType'),
        width: 130,
        type: 'text',
        // propInDict:"settleUnitType"
        formatter: ({ row }, column) => {
          if (row.unitType) {
            let unitTypeName = ''
            row.unitType.split(',').map((item) => {
              unitTypeName = unitTypeName + ' ' + getDictLabel('unitType', item)
            })
            return unitTypeName
          }
          return ''
        },
      },
      {
        prop: 'isTemporary',
        label: this.$t('Collect.isVirtual'),
        width: 100,
        type: 'select',
        // propInDict: 'yesNo',
        formatter: ({ row }) => (row.isTemporary === 'yes' ? `<span class="ls_red">${this.$t('Common.yes')}}</span>` : this.$t('Common.no')),
      },
      // 是否有效(state) ，是否黑名单，是否可录费用

      {
        prop: 'state',
        label: '是否有效',
        width: 100,
        type: 'text',
        formatter: ({ row }) => (row.state === 'valid' ? this.$t('Common.yes') : `<span class="ls_red">${this.$t('Common.no')}}</span>`),
      },
      {
        prop: 'isBlack',
        label: '是否黑名单',
        width: 100,
        type: 'select',
        // propInDict: 'yesNo',
        formatter: ({ row }) => (row.isBlack === 'yes' ? `<span class="ls_red">${this.$t('Common.yes')}}</span>` : this.$t('Common.no')),
      },
      // {
      //   prop: 'isForbidFee',
      //   label: '是否可录费用',
      //   width: 130,
      //   type: 'button',
      //   formatter: ({ row }) => (row.isForbidFee === 'yes' ? `<span class="ls_red underline">否</span>` : '是'),
      //   callback: (row) => {
      //     this.showDetail(row, 'isForbidFee')
      //   },
      // },
      {
        prop: 'isForbidPayFee',
        label: '是否可录应付费用',
        width: 130,
        type: 'button',
        formatter: ({ row }) => (row.isForbidPayFee === 'yes' ? `<span class="ls_red underline">${this.$t('Common.no')}}</span>` : this.$t('Common.yes')),
        callback: (row) => {
          this.showDetail(row, 'isForbidPayFee')
        },
      },
      {
        prop: 'isForbidRecvFee',
        label: '是否可录应收费用',
        width: 130,
        type: 'button',
        formatter: ({ row }) => (row.isForbidRecvFee === 'yes' ? `<span class="ls_red underline">${this.$t('Common.no')}</span>` : this.$t('Common.yes')),
        callback: (row) => {
          this.showDetail(row, 'isForbidRecvFee')
        },
      },
      {
        prop: 'settleCycle',
        label: '结算周期',
        width: 100,
        type: 'select',
      },
      {
        prop: 'serviceCodes',
        label: this.$t('FeeList.serviceCodes'),
        width: 100,
        type: 'button',
        // propInDict:"settleUnitType"
        formatter: () => '查看',
        callback: (row) => {
          serviceItemlist({ settleUnitId: row.settleUnitId }).then((res) => {
            if (!res.data.length) {
              return this.$msgWarnClose('无服务项！')
            }
            this.dialogType = 'serviceCode'
            this.dialogTitle = '服务项'
            this.dialogShow = true
            this.serviceCodesStr = res.data.map((item) => this.dictMapObj.orderServiceList[item.serviceCode]).join('，')
          })
          // this.serviceCodesShow()
        },
      },
      {
        prop: 'finCode',
        label: '财务代码',
        width: '100px',
        type: 'button',
        formatter: ({ row }) => '查看',
        callback: (row) => {
          this.rowSettle = row
          finCodeList({ settleUnitId: row.settleUnitId }).then((res) => {
            this.finCodeDialogShow = true
            this.option2.data = res.data.map((item) => ({ ...row, ...item }))
          })
        },
      },
    ]
    this.option1.columns = columns

    this.option2 = {
      ...this.option,
      operationBtns: false,
      selection: false,
      id: 'option1',
      $name: 'SettleUnitFinCode',
      pagination: false,
      columns: [
        { prop: 'kdAccountName', label: '账套名称', minWidth: 100, type: 'text' },
        {
          prop: 'customerFinCode',
          label: '客户财务代码',
          width: '220px',
          type: 'button',
          formatter: ({ row }) =>
            row.customerFinCode
              ? row.customerFinCode
              : ['customer', 'temporary'].find((v) => row.unitType.split(',').includes(v))
              ? '添加财务代码'
              : '',
          callback: (row) => {
            this.showDetail(row, 'customerFinCode')
          },
        },
        {
          prop: 'supplierFinCode',
          label: '供应商财务代码',
          width: '220px',
          type: 'button',
          formatter: ({ row }) =>
            row.supplierFinCode
              ? row.supplierFinCode
              : ['supplier', 'temporary'].find((v) => row.unitType.split(',').includes(v))
              ? '添加财务代码'
              : '',
          callback: (row) => {
            this.showDetail(row, 'supplierFinCode')
            console.log(row)
          },
        },
      ],
    }
    // this.getData()
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 搜索按钮
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 封装请求参数并请求列表
    getData(isSearch) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      // if (isSearch) {
      //   this.searchBackup = []
      //   this.searchOption.addFilter.searchInputGroup.forEach((val) => {
      //     val && this.searchBackup.push({ column: val.key, type: 'eq', value: val.value })
      //   })
      // }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      // this.option1.data = [{ unitType: 'supplier,customer' }]
      settleUnitList(data)
        .then((res) => {
          let { list } = res.data
          this.option1.data = list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    // table行详情按钮
    showDetail(row, prop) {
      console.log(row)
      // unitType  oldFinCode  newFinCode
      this.form.unitCode = row.unitCode
      if (prop === 'isForbidPayFee') {
        this.dialogType = 'isForbidPayFee'
        this.dialogTitle = '修改是否可录应付费用'
        this.form.isForbidRecvFee = this.form.isForbidFee = undefined
        this.form.isForbidPayFee = row[prop] || 'no'
      } else if (prop === 'isForbidRecvFee') {
        this.dialogType = 'isForbidRecvFee'
        this.dialogTitle = '修改是否可录应收费用'
        this.form.isForbidPayFee = this.form.isForbidFee = undefined
        this.form.isForbidRecvFee = row[prop] || 'no'
      } else {
        this.form.unitType = prop === 'customerFinCode' ? 'customer' : 'supplier'
        this.form.oldFinCode = row[prop]
        this.form.newFinCode = ''
        this.form.kingdeeAccountId = row.kingdeeAccountId
        this.dialogType = 'finCode'
        this.dialogTitle = !row[prop] ? '添加财务代码' : '修改财务代码'
      }
      this.dialogShow = true
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    dialogClose(e) {
      if (e === true) {
        this.$refs.form.validate((valid) => {
          if (!valid) return
          if (this.dialogType === 'finCode') {
            changeFinCode(this.form).then((res) => {
              this.$msgSucClose(this.$t('Hedge.modifyTips'))
              finCodeList({ settleUnitId: this.rowSettle.settleUnitId }).then((res) => {
                this.option2.data = res.data.map((item) => ({ ...this.rowSettle, ...item }))
              })
              this.dialogShow = false
              this.getData()
            })
          } else {
            // TODO
            let { unitCode, isForbidPayFee, isForbidRecvFee } = this.form
            changeFeeForbid({ unitCode, isForbidPayFee, isForbidRecvFee }).then((res) => {
              this.$msgSucClose(this.$t('Hedge.modifyTips'))
              this.dialogShow = false
              this.getData()
            })
          }
        })
      }
    },
  },
}
</script>
