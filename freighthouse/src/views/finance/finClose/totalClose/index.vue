<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
    class="finance-page"
  >
    <div class="finance-container finance-list-container">
      <FinanceSearch :searchOption="searchOption" @search="search" :border="true" />
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'btn-totalClose')"
            class="finance-btn"
            type="primary"
            size="mini"
            @click="dialogShow = true"
          >总关账</el-button>

          <el-button
            v-if="checkAuth($route.name, 'btn-updateStatus')"
            class="finance-btn"
            @click="recheckFinClosing"
            size="mini"
          >更新检查状态</el-button>
        </div>
        <div class="money-box-right">
          <el-button
            v-if="checkAuth($route.name, 'btn-record')"
            class="finance-btn"
            @click="goRecord"
            size="mini"
          >关账记录</el-button>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <el-dialog title="总关账" :visible.sync="dialogShow" width="400px" @close="dialogShow = false">
      <el-form
        :model="form"
        ref="form"
        :rules="rules"
        label-width="100px"
        :inline="false"
        size="small"
        style="padding-top: 16px"
      >
        <el-form-item label="分公司" prop="settleComp">
          <!-- <el-input
            style="width:250px"
            v-model="form.settleCompName"
            placeholder="请选择分公司名"
            size="mini"
            disabled
          ></el-input>-->
          <el-select
            size="mini"
            v-model="form.settleComp"
            filterable
            remote
            clearable
            placeholder="请选择分公司"
            style="width:250px"
            :remote-method="(queryString)=>querySettleUnit2({ queryString, unitTypes: 'company' }, settleCompObj)"
            @visible-change="()=>querySettleUnit2({ queryString:'', unitTypes: 'company' }, settleCompObj)"
          >
            <!-- :clearable="!filterGroups[item.key].multiple && (filterGroups[item.key].clearable || true)" -->
            <!-- v-for="o in sortByValue(filterGroups[item.key].remoteSelectList,item.value)" -->
            <el-option
              v-for="(o,index) in settleCompObj.remoteSelectList"
              :key="o.value+o.label+index"
              :label="o.label"
              :value="o"
            ></el-option>
          </el-select>
          <!-- remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
          },-->
          <!-- <el-autocomplete
            style="width:250px"
            v-model="form.settleCompName"
            placeholder="请选择分公司名"
            :select-when-unmatched="true"
            :fetch-suggestions="
              (queryString, cb) => {
                querySettleUnit({ queryString, unitTypes: 'company' }, cb);
              }
            "
            @select="
              value => {
                form.settleCompCode = value.key;
              }
            "
          ></el-autocomplete>-->
        </el-form-item>
        <el-form-item label="总关账月份" prop="finMon">
          <el-input style="width:250px" v-model="form.finMon" disabled></el-input>
        </el-form-item>
        <el-form-item label="下次总关账日期" prop="nextCloseDate">
          <el-date-picker
            style="width:250px"
            v-model="form.nextCloseDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择日期"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sure">确定</el-button>
        <el-button @click="dialogShow = false" size="mini">取消</el-button>
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
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { parseTime } from '@/utils'
import API from '@/api/fin/finClose'
import { mapState, mapMutations } from 'vuex'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'

export default {
  name: 'totalClose1',
  label: '总关账汇总',
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      keyDownActive: true,
      pickerOptions: {},
      searchOption: {},
      multipleSelection: [],
      tableOption: {},
      dialogShow: false,
      settleCompObj: { remoteSelectList: [] },
      departmentList: [],
      form: {
        settleComp: {},
        settleCompName: '',
        settleCompCode: '',
        finMon: '',
        nextCloseDate: '',
      },
      rules: {
        settleComp: [{ required: true, message: '须选择分公司', type: 'object' }],
        nextCloseDate: [{ required: true, message: '须选择下次总关账日期' }],
      },
    }
  },
  watch: {
    'form.settleComp'(val) {
      // console.log(val)
      if (!val) return
      API.getSysDate({ settleCompCode: val.value }).then((res) => {
        this.form.finMon = res.data.finMon
        // this.forcePrecloseForm.finMon = res.data.finMon
        //设置下次关账时间
        let nextCloseDate = new Date(res.data.nextCloseDate).setMonth(new Date(res.data.nextCloseDate).getMonth() + 1)
        this.form.nextCloseDate = parseTime(nextCloseDate, '{y}-{m}-{d}')
        //设置下次关账时间框配置选项
        this.pickerOptions = {
          disabledDate: (date) => {
            //若小于下次关账时间 则设置禁用
            return date.getTime() <= new Date(this.form.nextCloseDate).setDate(0)
          },
        }
      })
    },
    // dialogShow(val) {
    //   if (val) {
    //     this.$nextTick(() => {
    //       this.$refs.form.resetFields()
    //       this.form.settleCompCode = ''
    //     })
    //   }
    // },
  },
  created() {
    this.loanBasicData()
    // 搜索配置
    let searchInputGroup = ['settleCompCode', 'finMon']
    this.searchOption = {
      saveDefault: true,
      saveName: 'totalcloseList1',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 2,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          settleCompCode: {
            label: '分公司',
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          // deptCode: {
          //   label: '部门',
          //   prop: 'departCode',
          //   type: 'cascader',
          //   showType: '4',
          //   cascaderList: this.departmentList,
          //   cascaderProps: {
          //     children: 'childList',
          //     label: 'deptCname',
          //     value: 'deptCode',
          //     checkStrictly: true,
          //   },
          // },
          finMon: { label: '财务月份', type: 'month', format: 'yyyy-MM' },
        },
      },
    }

    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'TotalClose',
      pagination,
      selection: false,
    }
    this.tableOption.operationBtns = false
    let columns = [
      // { prop: 'settleCompName', label: '分公司' },
      // { prop: 'finMon', label: '关账年月' },
      // { prop: 'bookName', label: '账簿名称' },
      // { prop: 'createdName', label: '关账人' },
      // { prop: 'createdTime', label: '关账时间' },
      { prop: 'settleCompName', label: '分公司' },
      { prop: 'finMon', label: '财务月份', type: 'text' },
      // { prop: 'deptName', label: '部门', type: 'text' },
      // {
      //   prop: 'closeFailOrderCount',
      //   label: '总关账失败订单数',
      //   type: 'button',
      //   no__line: (row, val) => !val || val === '0',
      //   callback: ({ settleCompCode, deptCode }) => this.routerPush('TotalCloseDetail', { settleCompCode, deptCode }),
      // },
      {
        prop: 'uncloseFeeCount',
        label: '未预关账费用数',
        type: 'text',
      },
      {
        prop: 'exUncloseFeeCount',
        label: '外账未预关账费用数',
        type: 'text',
      },
      {
        prop: 'preCloseFailOrderCount',
        label: '预关账失败订单数',
        type: 'button',
        no__line: (row, val) => !val || val === '0',
        callback: () => this.routerPush('PreClose', { tab: 0 }),
      },
      {
        prop: 'feeAdjustOrderCount',
        label: '调费待审批订单数',
        type: 'button',
        no__line: (row, val) => !val || val === '0',
        callback: () => this.routerPush('FeeClosedModifyFeeList'),
      },
    ]
    this.tableOption.columns = columns
    this.optionMaxHeight = this.tableOption
    // this.getData()
  },
  methods: {
    getData(isSearch) {
      this.lsLoading = true
      let data = this.convertSearch(this.tableOption, this.searchOption)
      data = data || {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [],
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      let obj = JSON.parse(JSON.stringify(data))
      let find = obj.query.find((item) => item.column === 'deptCode')
      if (find) {
        find.type = 'eq'
        find.value = find.value.split(',').pop()
      }
      // let { settleCompanyCode: settleCompCode, deptCode } = this.$store.state.user.userInfo
      // data.query = (this.searchBackup || []).concat([
      //   { column: 'settleCompCode', type: 'eq', value: settleCompCode },
      //   { column: 'deptCode', type: 'eq', value: deptCode },
      // ])
      // API.closeList(data)
      API.finClosingStat(obj)
        .then((res) => {
          this.tableOption.data = res.data.list || []
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    // 确定关账
    sure() {
      this.$refs.form.validate((res) => {
        if (res) {
          this.lsLoading = true
          let settleComp = this.form.settleComp
          API.close({ ...this.form, settleCompName: settleComp.label, settleCompCode: settleComp.value })
            .then((res) => {
              this.dialogShow = false
              this.$msgSucClose('关账成功！')
              this.getData()
            })
            .catch(() => (this.lsLoading = false))
        }
      })
    },
    recheckFinClosing() {
      this.$confirmWarn('本次操作会执行分公司当前财务月份内订单进行预关账，确认是否执行？', () => {
        API.recheckFinClosing({}).then(() => this.$msgSucClose('已更新检查状态！'))
      })
    },
    goRecord() {
      this.routerPush('TotalCloseRecord')
    },
    // 所属部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => {
        if (item.childList.length) {
          item.childList = this.getTreeData(item.childList)
        } else {
          item.childList = undefined
        }
      })
      return data
    },
  },
}
</script>
<style lang="scss"></style>
