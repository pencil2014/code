<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height: 8px; background: #f8f9fd"></div>
    <div class="money-box">
      <div>
        <el-button
          v-if="checkAuth($route.name, 'tab-invoiceShift', 'btn-voucherPreview')"
          class="finance-btn"
          @click="generateVoucher(true)"
          size="mini"
          >预览凭证</el-button
        >
        <el-button class="finance-btn" size="mini" @click="multiApply"
          v-if="checkAuth($route.name, 'tab-invoiceShift', 'btn-voucherCreate')"
          >生成转字凭证</el-button
        >
        <el-button
          v-if="checkAuth($route.name, 'tab-invoiceShift', 'btn-voucherDel')"
          class="finance-btn"
          size="mini"
          @click="multiDel"
          type="danger"
          >删除凭证</el-button
        >
        <el-button class="finance-btn" size="mini" @click="multiApply2"
          v-if="checkAuth($route.name, 'tab-invoiceShift', 'btn-multiApply2')"
          >启动外账转字任务</el-button
        >
      </div>
      <div class="money-box-right">
        <el-button
          class="finance-btn"
          @click="refreshListPage"
          size="mini"
          type="primary"
          >刷新</el-button
        >
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
      <!-- :showDel="checkAuth($route.name, 'tab-preClose3', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-preClose3', 'btn-voucherCreate')" -->
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @close="dialogClose('previewDialog')"
      :showDel="true"
      :showCreate="true"
      @generate="(type, isAll) => generateVoucher('PreviewDialog', type, isAll)"
    />
    <el-dialog
      :title="dialogForcePrecloseTitle"
      :visible.sync="dialogShowForcePreclose"
      width="400px"
      @close="dialogShowForcePreclose = false"
    >
      <el-form
        :model="forcePrecloseForm"
        ref="forcePrecloseForm"
        label-width="100px"
        :inline="false"
        size="small"
        style="padding-top: 16px"
      >
        <el-form-item label="分公司" prop="settleCompName" v-if="!isManual">
          <el-input
            style="width: 250px"
            v-model="forcePrecloseForm.settleCompName"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          label="会计月份"
          prop="finMon"
          :rules="{ message: ' ', required: true, triggers: 'change,blur' }"
        >
          <el-date-picker
            style="width: 250px"
            v-model="forcePrecloseForm.finMon"
            type="month"
            value-format="yyyy-MM"
            placeholder="请选择日期"
            :pickerOptions="{
              disabledDate: (nowDate) => +new Date() - nowDate <= 0,
            }"
            :clearable="true"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          :disabled="lsLoading"
          type="primary"
          size="mini"
          @click="forcePrecloseSubmit"
          >确定</el-button
        >
        <el-button
          :disabled="lsLoading"
          @click="dialogShowForcePreclose = false"
          size="mini"
          >取消</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from "@/views/finance/components/financeTableMass/financeTableMass";
import FinanceSearch from "@/views/finance/components/financeSearch/financeSearch";
import { mixin } from "@/views/finance/orderFee/orderFee/mixin";
import { mixin2 } from "@/views/finance/mixins/mixin2";
import { mixin as voucherMixin } from "@/views/finance/voucher/mixin";
import { routerMixin } from "@/views/finance/mixins/routerMixin";
import CustomColumns from "@/components/customColumns/index";
import { mapState } from "vuex";
import {
  exInvoicePreclosingList,
  exInvoicePrecloseGenerateVoucher,
  manualStartOrderInvoiceShiftVoucher,
} from "@/api/fin/acct";
import { batchDeleteInvoiceShiftVoucher, exVoucherDelete } from "@/api/fin/voucher";
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
export default {
  name: "invoiceShift",
  label: "发票转字",
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    PreviewDialog
  },
  inject: ["tabRefresh"],
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true;
      return;
    }
    if (this.tabRefresh.pre) {
      this.tabRefresh.pre = false;
      this.handleCurrentChange(1);
    }
  },
  data() {
    return {
      searchOption: {},
      tableOption: {},
      dialogForcePrecloseTitle: "",
      dialogShowForcePreclose: false,
      forcePrecloseForm: {
        settleCompName: "",
        settleCompCode: "",
        finMon: "",
      },
      multipleSelection: [],
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        showData: '',
        isEx: true,
      },
      pageSizeUrl: exInvoicePreclosingList('geturl'),
      isManual: false,
    };
  },
  computed: {
    ...mapState({
      finance: (state) => state.finance,
      userInfo: (state) => state.user.userInfo,
    }),
  },
  created() {
    // 搜索配置
    let searchInputGroup = [
      "invoiceNo",
      "settleCompCode",
      "finMon",
      "voucherNo",
    ];
    this.searchOption = {
      saveDefault: true,
      saveName: "invoiceShiftList",
      listHeightFunc: this.computeFinTableHeight,
      isNotAutoLoad: true,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({
          key,
          value: "",
          range: { min: "", max: "" },
        })),
        filterGroups: {
          invoiceNo: { label: "发票号", type: "input" },
          settleCompCode: {
            label: "分公司",
            prop: "settleCorpCode",
            type: "remoteSelect",
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2(
                { queryString, unitTypes: "company" },
                item
              );
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2(
                { queryString, unitTypes: "company" },
                item
              );
            },
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          finMon: { label: "会计月份", type: "month", format: "yyyy-MM" },
          voucherNo: { label: "凭证号", type: "input" },
          voucherStatus: {
            label: "凭证生成状态",
            type: "select",
            selectOptions: [
              { label: "已生成", value: "yes" },
              { label: "未生成", value: "no" },
            ],
          },
          needShiftAccount: {
            label: "是否生成转字",
            type: "select",
            propInDict: "yesNo",
          },
          recvpayType: {
            label: "收付类型",
            type: "select",
            propInDict: "receipayType",
          }
        },
      },
    };
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true };
    let operationBtns = Object.assign(this.option.operationBtns, {
      width: "100px",
      data: [
        {
          label: "费用详情",
          type: "text",
          action: "goDetail",
          show: true,
        },
      ],
      fixed: "right",
      show: true,
      callback: (action, $index, row, option) => {
        if (action === "goDetail") {
          this.goDetail(row);
        }
      },
    });
    this.tableOption = {
      ...this.option,
      id: "option1",
      $name: "PreCloseSuccessTab",
      pagination,
      needTimeSort: true,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns,
      },
      emptyText: "数据将在查询后显示",
      operationBtns,
      colorColumns: ['voucherStatus'],
    };
    // this.tableOption.selection.show = false
    this.selfColumnsBase = [
      {
        prop: "invoiceNo",
        label: "发票号",
        width: "160px",
        type: "button",
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row);
          },
        },
      },
      { prop: "settleCompName", label: "分公司", minWidth: 130 },
      { prop: 'settleCorpName', label: '结算单位', minWidth: 130 },
      { prop: "finMon", label: "会计月份", width: 130 },
      // { prop: "acctVoucherSeqno", label: "凭证系列号", width: 130 },
      // { prop: "voucherNo", label: "凭证号", width: 130 },
      {
        prop: 'voucherNo',
        label: '凭证号',
        width: 80,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.initShowVoucher(this.previewDialog, row.acctVoucherSeqno, '', '')
          },
        },
      },
      {
        prop: "needShiftAccount",
        label: "是否生成转字凭证",
        type: "select",
        propInDict: "yesNo",
        width: 150,
      },
      {
        prop: "voucherStatus",
        label: "凭证生成状态",
        type: "select",
        width: 150,
        propInDict: 'voucherStatus',
      },
      { prop: "voucherSuccessTime", label: "凭证生成时间", width: 150 },
      { prop: "voucherErrormsg", label: "凭证失败原因", width: 150 },
      {
        prop: "recvpayType",
        label: "发票应收应付类型",
        type: "select",
        propInDict: "receipayType",
        width: 130,
      },
      { prop: "drawInvoiceBasicAmt", label: "开票金额(本位币)", width: 130 },
      { prop: "drawInvoiceBasicTaxAmt", label: "税额(本位币)", width: 130 },
      { prop: "taxRate", label: "税率", width: 130 },
      { prop: "submitTaxAmt", label: "上报税额(本位币)", width: 130 },
      { prop: "totalFeeTaxAmt", label: "费用总税额(本位币)", width: 130 },
      { prop: "createdTime", label: "创建时间", width: 130}
    ];
    this.tableOption.columns = [...this.selfColumnsBase]; // columns
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop));
    this.optionMaxHeight = this.tableOption;
  },
  methods: {
    goDetail (row) {
      let { exInvoicePreclosingId } = row
      this.routerPushTab('InvoiceDetail', {
        exInvoicePreclosingId
      })
    },
    // 跳转至发票详情页
    showDetail(row) {
      if (row.recvpayType === "receive") {
        this.showOneNoDetail("invoiceNo", row.invoiceId, {
          isTab: true,
          receipayType: "receive",
        })
      } else {
        let query = {
          invoicePaymentId: row.invoiceId,
          invoiceNo: row.invoiceNo,
          isTab: true,
        }
        this.routerPushTab("InvoicePaymentListDetail", query)
      }
    },
    getData(isSearch) {
      if (this.debounceLsFn()) return;
      this.lsLoading = true;
      let data = this.convertSearch(this.tableOption, this.searchOption);
      data.columns = this.customColumnsKeys;
      if (isSearch) {
        this.searchBackup = data.query;
      }
      data.query = this.searchBackup || [];
      exInvoicePreclosingList(data)
        .then((res) => {
          this.$set(this.tableOption, "emptyText", "未查询到任何数据");
          let { configColumns } = res.data;
          this.columns =
            configColumns.length > 0
              ? configColumns
              : this.selfColumnsBase.map((item) => item.prop);
          this.columns = [...this.columns];
          this.tableOption.columns = this.columns
            .map((prop) =>
              this.selfColumnsBase.find((item) => item.prop === prop)
            )
            .filter((v) => v);
          this.tableOption.data = res.data.list || [];
          Object.assign(this.tableOption.pagination, res.data);
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false));
    },
    // 预览凭证
    generateVoucher(type, type2, isAll) {
      if (type2 === "refresh") {
        return this.getData();
      }
      if (type === "PreviewDialog") {
        // let needShiftAccountSeqNos = this.multipleSelection.filter(
        //   (v) => !v.acctVoucherSeqno && v.needShiftAccount == "yes"
        // );
        let needShiftAccountSeqNos = this.multipleSelection.filter(
          (v) => !v.acctVoucherSeqno
        );
        let finPreclosingIds =
          needShiftAccountSeqNos[this.$refs.PreviewDialog.currIndex - 1]
            .exInvoicePreclosingId;
        if (isAll === "all") {
          finPreclosingIds = needShiftAccountSeqNos
            .map((v) => v.exInvoicePreclosingId)
            .join(",");
        }
        console.log(
          this.$refs.PreviewDialog.currIndex - 1,
          finPreclosingIds,
          isAll
        );
        this.$confirmWarn("是否进行生成凭证？", () => {
          this.lsLoading = true;
          this.$refs.PreviewDialog.lsLoading = false;
          exInvoicePrecloseGenerateVoucher({
            finPreclosingIds,
            settleCompCode: this.userInfo.settleCompanyCode,
          })
            .then((res) => {
              this.$msgSucClose("凭证已经处理！");
              // this.previewDialog.show = false
              // this.getData()
            })
            .finally(() => this.lsLoading = false)
        });
        return;
      }
      let selectRow = this.multipleSelection;
      if (!selectRow.length) {
        return this.$msgErrClose(`请勾选需要预览凭证的项！`);
      }
      if ([...new Set(selectRow.map((v) => v.voucherStatus))].length === 2) {
        return this.$msgErrClose(
          `凭证状态为已生成和未生成的记录不能同时预览！`
        );
      }
      let seqNos = selectRow.map((v) => v.acctVoucherSeqno);
      // 未生成
      if (!seqNos[0]) {
        // let needShiftAccountSeqNos = selectRow.filter(
        //   (v) => !v.acctVoucherSeqno && v.needShiftAccount == "yes"
        // );
        let needShiftAccountSeqNos = selectRow.filter(
          (v) => !v.acctVoucherSeqno
        );
        if (!needShiftAccountSeqNos.length)
          return this.$msgErrClose(`请选择是否生成凭证为是的记录！`);
        this.lsLoading = true;
        exInvoicePrecloseGenerateVoucher({
          finPreclosingIds: needShiftAccountSeqNos
            .map((v) => v.exInvoicePreclosingId)
            .join(","),
          settleCompCode: this.userInfo.settleCompanyCode,
          preview: "yes",
        })
          .then((res) => {
            if (!res.data || !res.data.length) {
              return this.$msgErrClose(`没有可生成凭证的数据！`);
            }
            this.previewDialog.showData = res.data;
            this.previewDialog.seqNo = "";
            this.previewDialog.show = true;
          })
          .finally(() => (this.lsLoading = false));
        return;
      }
      // 已生成
      this.previewDialog.showData = "";
      this.previewDialog.seqNo = seqNos.join(",");
      this.previewDialog.show = true;
    },
    multiApply2() {
      this.isDel = false;
      this.isManual = true
      this.dialogForcePrecloseTitle = "启动外账转字任务";
      this.forcePrecloseForm.finMon = "";
      this.dialogShowForcePreclose = true;
      this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate());
      return;
    },
    multiApply() {
      this.isManual = false
      if (!this.multipleSelection.length) {
        this.isDel = false;
        this.dialogForcePrecloseTitle = "生成转字凭证";
        this.forcePrecloseForm.finMon = "";
        this.forcePrecloseForm.settleCompName = this.userInfo.settleCompanyName;
        this.forcePrecloseForm.settleCompCode = this.userInfo.settleCompanyCode;
        this.dialogShowForcePreclose = true;
        this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate());
        return;
      }
      let finPreclosingIds = this.multipleSelection
        .map((v) => v.exInvoicePreclosingId)
        .join(",");
      this.$confirmWarn("是否进行生成转字凭证？", () => {
        this.lsLoading = true;
        exInvoicePrecloseGenerateVoucher({
          finPreclosingIds,
          settleCompCode: this.userInfo.settleCompanyCode,
        })
          .then((res) => {
            this.$msgSucClose("凭证已经处理！");
            this.getData();
          })
          .catch(() => (this.lsLoading = false));
      });
    },
    multiDel() {
      if(this.multipleSelection.length){
        return this.delVoucher()
      }
      this.isManual = false;
      this.isDel = true;
      this.dialogForcePrecloseTitle = "删除凭证";
      this.forcePrecloseForm.finMon = "";
      this.forcePrecloseForm.settleCompName = this.userInfo.settleCompanyName;
      this.forcePrecloseForm.settleCompCode = this.userInfo.settleCompanyCode;
      this.dialogShowForcePreclose = true;
      this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate());
    },
    // 删除凭证
    delVoucher() {
      let selectRow = this.multipleSelection
      let arr = selectRow.filter((item) => item.voucherNo)
      if (!arr.length) {
        return this.$msgErrClose(`请勾选已生成凭证的项！`)
      }
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(val.voucherNo)
        voucherSeqNos.push(val.acctVoucherSeqno)
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(`您是否确认删除${voucherNos.join(',')}凭证号下面的所有明细？`, () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    forcePrecloseSubmit() {
      this.$refs.forcePrecloseForm.validate((res) => {
        if (res) {
          let method, str, strWarn;
          method = this.isManual ? manualStartOrderInvoiceShiftVoucher : 
            this.isDel
              ? batchDeleteInvoiceShiftVoucher
              : exInvoicePrecloseGenerateVoucher;
          str = this.isManual ? '启动外账转字任务操作成功！' : this.isDel ? "删除成功！" : "凭证已经处理！";
          strWarn = this.isManual ? '启动外账转字任务' : this.isDel ? "删除凭证" : "生成转字凭证";
          this.$confirmWarn(`是否进行${strWarn}？`, () => {
            this.lsLoading = true;
            method(this.isManual ? {finMon: this.forcePrecloseForm.finMon} : this.forcePrecloseForm)
              .then((res) => {
                this.dialogShowForcePreclose = false;
                this.$msgSucClose(str);
                this.getData();
              })
              .catch(() => (this.lsLoading = false));
          });
        }
      });
    },
  },
  watch: {
    'previewDialog.show'(val) {
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
  },
};
</script>
