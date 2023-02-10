<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="money-box">
      <div>
        <el-button
          v-if="checkAuth($route.name, 'tab-incomeCostShift', 'btn-voucherPreview')"
          class="finance-btn"
          @click="generateVoucher(true)"
          size="mini"
          >{{$t('PayApplyList.previewVoucher')}}</el-button
        >
        <el-button
          v-if="checkAuth($route.name, 'tab-incomeCostShift', 'btn-voucherCreate')" class="finance-btn" size="mini" @click="multiApply"
          >{{$t('PayApplyList.generateVoucher')}}</el-button
        >
        <el-button
          v-if="checkAuth($route.name, 'tab-incomeCostShift', 'btn-voucherDel')"
          class="finance-btn"
          size="mini"
          @click="multiDel"
          type="danger"
          >{{$t('PayApplyList.deleteVoucher')}}</el-button
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
        :props="{ key: 'prop', label: 'label' }"
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
      @generate="(type, isAll, precloseId) => generateVoucher('PreviewDialog', type, isAll, precloseId)"
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
        <el-form-item :label="$t('FeeList.settleComp')" prop="settleCompName">
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
            :placeholder="$t('Common.plSelect')"
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
          >{{$t('Common.sure')}}</el-button
        >
        <el-button
          :disabled="lsLoading"
          @click="dialogShowForcePreclose = false"
          size="mini"
          >{{$t('Common.cancel')}}</el-button
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
import {
  exOrderPreclosingList,
  exOrderPrecloseGenerateVoucher,
} from "@/api/fin/acct";
import { mapState } from "vuex";
import { listByRole } from "@/api/base";
import { departmentTreeList } from "@/api/companyResource";
import CustomColumns from "@/components/customColumns/index";
import { batchDeleteExOrderShiftVoucher, exVoucherDelete } from "@/api/fin/voucher";
import PreviewDialog from "@/views/finance/voucher/components/previewDialog";
export default {
  name: "incomeCostShift",
  label: "会计转字",
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    PreviewDialog,
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
      keyDownActive: true,
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
        title: "凭证预览",
        seqNo: "",
        showData: "",
        isEx: true,
      },
      pageSizeUrl: exOrderPreclosingList("geturl"),
    };
  },
  watch: {
    "previewDialog.show"(val) {
      !val && this.previewDialog._refresh && this.getData();
      this.previewDialog._refresh = false;
    },
  },
  computed: {
    ...mapState({
      finance: (state) => state.finance,
      userInfo: (state) => state.user.userInfo,
    }),
  },
  created() {
    this.loanBasicData();
    // 搜索配置
    let searchInputGroup = ["billNo", "settleCompCode", "finMon", "voucherNo"];
    this.searchOption = {
      saveDefault: true,
      saveName: "incomeCostShiftList",
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
          billNo: { label: "单号", type: "input" },
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
          finMon: { label: "会计月份", type: "month", format: "yyyy-MM" },
          // finDate: {
          //   label: '预关帐日期',
          //   type: 'daterange',
          //   format: 'yyyy-MM-dd',
          //   keys: ['fromFinDate', 'toFinDate'],
          // },
          voucherStatus: {
            label: "转字凭证状态",
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
          voucherNo: { label: "转字凭证号", type: "input" },
          needRecvAccount: {
            label: "是否生成收字",
            type: "select",
            propInDict: "yesNo",
          },
          recvVoucherNo: { label: "收字凭证号", type: "input" },
          recvVoucherStatus: {
            label: "收字凭证状态",
            type: "select",
            selectOptions: [
              { label: "已生成", value: "yes" },
              { label: "未生成", value: "no" },
            ],
          },
          needPayAccount: {
            label: "是否生成付字",
            type: "select",
            propInDict: "yesNo",
          },
          payVoucherNo: { label: "付字凭证号", type: "input" },
          payVoucherStatus: {
            label: "付字凭证状态",
            type: "select",
            selectOptions: [
              { label: "已生成", value: "yes" },
              { label: "未生成", value: "no" },
            ],
          },
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
        prop: "billNo",
        label: "单号",
        width: "160px",
        type: "button",
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row);
          },
        },
      },
      {
        prop: "billType",
        label: "订单类型",
        width: 130,
        type: "select",
        propInDict: "voucherBizType",
      },
      { prop: "settleCompName", label: "分公司名称", minWidth: 130 },
      { prop: "finMon", label: "会计月份", width: 130 },
      // { prop: "acctVoucherSeqno", label: "凭证系列号", width: 130 },
      // { prop: 'voucherNo', label: this.$t('Hedge.voucherNumber'), width: 130},
      {
        prop: "voucherNo",
        label: "转字凭证号",
        width: 80,
        type: "button",
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.initShowVoucher(
              this.previewDialog,
              row.acctVoucherSeqno,
              "",
              ""
            );
          },
        },
      },
      {
        prop: "feeFromDate",
        label: "关账时间段",
        width: 180,
        formatter: ({ row }) =>
          row.feeFromDate ? row.feeFromDate + " ~ " + row.feeToDate : "",
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
        label: "转字凭证状态",
        type: "select",
        width: 130,
        propInDict: 'voucherStatus',
        // formatter: ({ cellValue }) =>
        //   cellValue === "yes" ? "已生成" : "未生成",
      },
      { prop: "voucherSuccessTime", label: "转字凭证生成时间", width: 150 },
      { prop: "voucherErrormsg", label: "转字凭证失败原因", width: 150 },

      { prop: "acfinDate", label: "订单会计日期", width: 130 },
      // { prop: "recvVoucherSeq", label: "收字凭证系列号", width: 150 },
      // { prop: "recvVoucherNo", label: "收字凭证号", width: 130 },
      {
        prop: "recvVoucherNo",
        label: "收字凭证号",
        width: 80,
        type: "button",
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.initShowVoucher(
              this.previewDialog,
              row.recvVoucherSeq,
              "",
              ""
            );
          },
        },
      },
      {
        prop: "recvVoucherStatus",
        label: "收字凭证状态",
        type: "select",
        width: 130,
        propInDict: 'voucherStatus',
      },
      {
        prop: "needRecvAccount",
        label: "是否需要生成收字凭证",
        type: "select",
        propInDict: "yesNo",
        width: 150,
      },
      { prop: "recvErrormsg", label: "付字凭证失败原因", width: 130 },
      // { prop: "payVoucherSeq", label: "付字凭证系列号", width: 150 },
      // { prop: "payVoucherNo", label: "付字凭证号", width: 130 },
      {
        prop: "payVoucherNo",
        label: "付字凭证号",
        width: 80,
        type: "button",
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.initShowVoucher(
              this.previewDialog,
              row.payVoucherSeq,
              "",
              ""
            );
          },
        },
      },
      {
        prop: "payVoucherStatus",
        label: "付字凭证状态",
        type: "select",
        width: 130,
        propInDict: 'voucherStatus',
      },
      {
        prop: "needPayAccount",
        label: "是否需要生成付字凭证",
        type: "select",
        propInDict: "yesNo",
        width: 150,
      },
      { prop: "payErrormsg", label: "付字凭证失败原因", width: 130 },
      { prop: "createdTime", label: "创建时间", width: 150 },
    ];
    this.tableOption.columns = [...this.selfColumnsBase]; // columns
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop));
    this.optionMaxHeight = this.tableOption;
  },
  methods: {
    goDetail(row) {
      let { exOrderPreclosingId } = row;
      this.routerPushTab("IncomeCostDetail", {
        exOrderPreclosingId,
      });
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
      exOrderPreclosingList(data)
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

    // 跳转至详情页
    showDetail(row) {
      if (!row.billNo) {
        return this.$message.error("单号不能为空！");
      }
      this.showOneNoDetail("sourceBizNo", row.billNo, { isTab: true });
    },
    // 获取销售
    getSellers(name = "", item, role) {
      let query = [{ column: "roleCode", type: "eq", value: role }]; // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: "name", type: "eq", value: name });
      listByRole({ currPage: 1, pageSize: 30, query }).then(
        ({ data: { list } }) => {
          list = list.map((v) => ({
            ...v,
            label: `${v.cname}(${v.employeeNo})`,
            value: v.employeeId,
          }));
          if (this.remoteSelectCommon(item, list)) return;
          item.remoteSelectList = list;
        }
      );
    },
    // 部门下拉框
    loanBasicData() {
      // departmentTreeList({ state: 'valid' }).then((res) => {
      //   let resData1 = JSON.parse(JSON.stringify(res.data || []))
      //   let resData2 = JSON.parse(JSON.stringify(res.data || []))
      //   let resData3 = JSON.parse(JSON.stringify(res.data || []))
      //   this.departmentListO.splice(0, 1000, ...this.getTreeData(resData1))
      //   this.departmentListB.splice(0, 1000, ...this.getTreeData(resData2))
      //   this.departmentListOBD.splice(0, 1000, ...this.getTreeData(resData3))
      // })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length
            ? this.getTreeData(item.childList)
            : undefined)
      );
      return data;
    },
    // 预览凭证
    generateVoucher(type, type2, isAll, precloseId) {
      console.log(precloseId);
      if (type2 === "refresh") {
        return this.getData();
      }
      if (type === "PreviewDialog") {
        // let needShiftAccountSeqNos = this.multipleSelection.filter((v) => !v.acctVoucherSeqno && v.needShiftAccount == 'yes')
        let needShiftAccountSeqNos = this.multipleSelection.filter(
          (v) => !v.acctVoucherSeqno
        );
        let finPreclosingIds = precloseId
          // needShiftAccountSeqNos[this.$refs.PreviewDialog.currIndex - 1]
          //   .exOrderPreclosingId;
        if (isAll === "all") {
          finPreclosingIds = needShiftAccountSeqNos
            .map((v) => v.exOrderPreclosingId)
            .join(",");
        }
        console.log(
          precloseId,
          finPreclosingIds,
          isAll
        );
        this.$confirmWarn("是否进行生成凭证？", () => {
          this.lsLoading = true;
          this.$refs.PreviewDialog.lsLoading = false;
          exOrderPrecloseGenerateVoucher({
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
      // 转字、收字、付字有一个即可
      if ([...new Set(selectRow.map((v) => v.voucherStatus || v.payVoucherStatus || v.recvVoucherStatus))].length === 2) {
        return this.$msgErrClose(
          `凭证状态为已生成和未生成的记录不能同时预览！`
        );
      }
      let seqNos = []
      selectRow.forEach((v) => {
        v.acctVoucherSeqno && seqNos.push(v.acctVoucherSeqno)
        v.recvVoucherSeq && seqNos.push(v.recvVoucherSeq)
        v.payVoucherSeq && seqNos.push(v.payVoucherSeq)
      });
      // 未生成
      if (!seqNos[0]) {
        // let needShiftAccountSeqNos = selectRow.filter((v) => !v.acctVoucherSeqno && v.needShiftAccount == 'yes')
        let needShiftAccountSeqNos = selectRow.filter(
          (v) => !v.acctVoucherSeqno
        );
        if (!needShiftAccountSeqNos.length)
          return this.$msgErrClose(`请选择是否生成凭证为是的记录！`);
        this.lsLoading = true;
        exOrderPrecloseGenerateVoucher({
          finPreclosingIds: needShiftAccountSeqNos
            .map((v) => v.exOrderPreclosingId)
            .join(","),
          settleCompCode: this.userInfo.settleCompanyCode,
          preview: "yes",
        })
          .then((res) => {
            if (!res.data || !res.data.length) {
              return this.$msgErrClose(this.$t('Hedge.genVouchersTips'));
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
    multiApply() {
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
        .map((v) => v.exOrderPreclosingId)
        .join(",");
      this.$confirmWarn("是否生成凭证？", () => {
        this.lsLoading = true;
        exOrderPrecloseGenerateVoucher({
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
      let arr = selectRow.filter((item) => item.voucherNo || item.recvVoucherNo || item.payVoucherNo)
      if (!arr.length) {
        return this.$msgErrClose(this.$t('Hedge.generatedTips'))
      }
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(val.voucherNo, val.recvVoucherNo, val.payVoucherNo)
        voucherSeqNos.push(val.acctVoucherSeqno, val.recvVoucherSeq, val.payVoucherSeq, )
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null' && v)
      voucherSeqNos = [...new Set(voucherSeqNos)].filter((v) => v)
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips', {voucherNos: voucherNos.join(',')}), () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
         this.$msgErrClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    forcePrecloseSubmit() {
      this.$refs.forcePrecloseForm.validate((res) => {
        if (res) {
          let method, str, strWarn;
          method = this.isDel
            ? batchDeleteExOrderShiftVoucher
            : exOrderPrecloseGenerateVoucher;
          str = this.isDel ? "删除成功！" : "凭证已经处理！";
          strWarn = this.isDel ? "删除凭证" : "生成转字凭证";
          this.$confirmWarn(`是否进行${strWarn}？`, () => {
            this.lsLoading = true;
            method(this.forcePrecloseForm)
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
};
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep .el-button.el-button--text {
  margin-left: 6px;
  margin-right: 6px;
}
</style>
