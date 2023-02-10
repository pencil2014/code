<template>
  <el-form
    :model="supplierBillDetailForm"
    ref="form"
    :inline="true"
    size="mini"
    label-width="150px"
    label-suffix=":"
  >
    <template v-if="type === 'express'">
      <el-form-item :label="$t('Supplier.statementNo')" prop="supplierBillNo">
        <div v-html="supplierBillDetailForm.supplierBillNo"></div>
      </el-form-item>
      <DetailDiv :label="$t('Supplier.courierCompany')" :content="supplierBillDetailForm.supplierCorpName" :isTooltip="true"></DetailDiv>
      <!-- <el-form-item :label="$t('Supplier.parsingMode')" prop="parseMode">
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'parseMode', type: 'select', propInDict: 'supplierBillParseMode'})"
        ></div>
      </el-form-item>-->
      <el-form-item v-if="source==='detail'" :label="$t('Supplier.totalpayable')" prop="supplierPayMap">
        <div v-html="supplierBillDetailForm.supplierPayMapStr"></div>
      </el-form-item>
      <!-- <el-form-item label="业务日期范围：" prop="bizDate">
        <div class="el-form-item-text" v-html="supplierBillDetailForm.bizDate"></div>
      </el-form-item>-->
      <!-- <el-form-item v-if="source==='result'" :label="$t('Supplier.comparMethod')" prop="statementType">
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'statementType', type: 'select', propInDict: 'supplierBillCompareStatementType'})"
        ></div>
      </el-form-item>-->
      <el-form-item
        v-if="isCompared === true && supplierBillDetailForm.matchResult && source!=='checking'"
        :label="$t('Supplier.comparMethod')"
        prop="compareType"
      >
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'compareType', type: 'select', propInDict: 'expressBillCompareType'})"
        ></div>
      </el-form-item>
      <el-form-item v-if="source==='checking'" :label="$t('Supplier.comparMethod')" prop="compareType">
        <el-select v-model="supplierBillDetailForm.compareType" :placeholder="$t('Common.plEnter')">
          <!-- <el-select :value="'express'" :placeholder="$t('Common.plEnter')"> -->
          <!-- v-for="(op, j) in [{label:'快递单号',value:'express'}]" -->
          <el-option
            v-for="(op, j) in dictMap['expressBillCompareType']"
            :key="'expressBillCompareType' + j"
            :label="op.label"
            :value="op.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item v-if="source==='result'" :label="$t('Supplier.comparMethod')" prop="statementType">
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'statementType', type: 'select', propInDict: 'supplierBillCompareStatementType'})"
        ></div>
      </el-form-item>-->
      <!-- v-if="isCompared === true && supplierBillDetailForm.matchResult" -->
      <el-form-item
        v-if="isCompared === true && supplierBillDetailForm.matchResult"
        :label="$t('Supplier.comparresults')"
        prop="matchResult"
      >
        <div
          class="el-form-item-text"
          style="display:inline-block;"
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'matchResult', type: 'select', propInDict: 'supplierBillCompareMatchResult'})"
        ></div>
        <el-button
          v-if="supplierBillDetailForm.matchResult !== 'all'"
          type="text"
          @click="dialogVisibleDiff=true"
          style="display:inline-block;"
        >{{$t('Supplier.detcompardif')}}</el-button>
      </el-form-item>
      <el-form-item
        v-if="source==='detail' && supplierBillDetailForm.supplierNum"
        :label="$t('Supplier.costbars')"
        prop="feeAmount"
      >
        <div v-html="supplierBillDetailForm.supplierNum"></div>
      </el-form-item>
    </template>
    <template v-else>
      <h3 v-if="source==='result'">{{$t('Settle.baseInfo')}}</h3>
      <DetailDiv
        :label="$t('Settle.recvCorpName')"
        :content="supplierBillDetailForm.supplierCorpName"
        :isTooltip="true"
      ></DetailDiv>
      <el-form-item :label="$t('Supplier.statementNo')" prop="supplierBillNo">
        <div class="el-form-item-text" v-html="supplierBillDetailForm.supplierBillNo"></div>
      </el-form-item>
      <el-form-item :label="$t('FeeList.receipayType')" prop="receipayType">
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'receipayType', type: 'select', propInDict: 'feeitemReceipayGroup'})"
        ></div>
      </el-form-item>
      <el-form-item :label="$t('Supplier.parsingMode')" prop="parseMode">
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'parseMode', type: 'select', propInDict: 'supplierBillParseMode'})"
        ></div>
      </el-form-item>
      <el-form-item :label="$t('Supplier.MatchCompanies')" prop="matchCompType">
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'matchCompType', type: 'select', propInDict: 'supplierBillMatchCropCode'})"
        ></div>
      </el-form-item>
      <el-form-item
        :label="supplierBillDetailForm.bizType ? $t('FeeList.bizDate') : $t('Supplier.busDateRange')"
        prop="bizDate"
      >
        <div class="el-form-item-text" v-html="supplierBillDetailForm.bizDate"></div>
      </el-form-item>
      <el-form-item v-if="source==='result'" :label="$t('Supplier.comparMethod')" prop="statementType">
        <div
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'statementType', type: 'select', propInDict: 'supplierBillCompareStatementType'})"
        ></div>
      </el-form-item>
      <el-form-item v-if="source==='checking'" :label="$t('Supplier.comparMethod')" prop="statementType">
        <el-select v-model="supplierBillDetailForm.statementType" :placeholder="$t('Common.plEnter')">
          <el-option
            v-for="(op, j) in dictMap['supplierBillCompareStatementType']"
            :key="'supplierBillCompareStatementType' + j"
            :label="op.label"
            :value="op.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="source==='result'" :label="$t('Common.createdBy')" prop="createdName">
        <div v-html="supplierBillDetailForm.createdName"></div>
      </el-form-item>
      <el-form-item v-if="source==='result'" :label="$t('Common.createTime')" prop="createdTime">
        <div v-html="supplierBillDetailForm.createdTime"></div>
      </el-form-item>
      <el-form-item v-if="source==='result'" :label="$t('Supplier.reCostSources')">
        <div
          v-html="dictMapObj['supplierBillFeeSourceType'][supplierBillDetailForm.matchFeeSourceType]"
        ></div>
      </el-form-item>
      <el-form-item
        v-if="source==='result' && supplierBillDetailForm.matchFeeSourceType === 'settle_order'"
        :label="$t('FeeList.settleOrderNo')"
      >
        <div v-html="supplierBillDetailForm.settleOrderNo"></div>
      </el-form-item>
      <!-- <el-form-item
        v-if="isCompared === true && supplierBillDetailForm.matchResult"
        :label="$t('Supplier.comparresults')"
        prop="result"
      >
        <div
          class="el-form-item-text"
          style="display:inline-block;"
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'result', type: 'select', propInDict: 'supplierBillCompareMatchResult'})"
        ></div>
        <el-button
          v-if="supplierBillDetailForm.result !== 'all'"
          type="text"
          @click="openDiffCompare"
          style="display:inline-block;"
        >{{$t('Supplier.detcompardif')}}</el-button>
      </el-form-item>-->
      <!-- <el-form-item v-if="source==='result'" :label="$t('Supplier.comparresults')" prop="result">
      <div
        v-html="renderNoEdit(supplierBillDetailForm, {prop: 'result', type: 'select', propInDict: 'supplierBillCompareMatchResult'})"
      ></div>
      </el-form-item>-->
      <el-form-item v-if="source==='detail'" :label="$t('Supplier.totalpayable')" prop="supplierPayMap">
        <div v-html="supplierBillDetailForm.supplierPayMapStr"></div>
      </el-form-item>
      <el-form-item v-if="source==='detail'" :label="$t('Supplier.totalreceivables')" prop="supplierReceiveMap">
        <div v-html="supplierBillDetailForm.supplierReceiveMapStr"></div>
      </el-form-item>
      <el-form-item v-if="source==='detail'" :label="$t('Supplier.costbars')" prop="supplierNum">
        <div v-html="supplierBillDetailForm.supplierNum"></div>
      </el-form-item>
      <el-form-item v-if="source==='detail'" :label="$t('Supplier.comparresults')" prop="matchResult">
        <div
          class="el-form-item-text"
          style="display:inline-block;"
          v-html="renderNoEdit(supplierBillDetailForm, {prop: 'matchResult', type: 'select', propInDict: 'supplierBillCompareMatchResult'})"
        ></div>
        <el-button type="text" @click="openDiffCompare" style="display:inline-block;">{{$t('Supplier.viewdetails')}}</el-button>
      </el-form-item>
    </template>
    <el-dialog
      v-if="type === 'express'"
      :title="$t('Supplier.detacomdif')"
      :visible.sync="dialogVisibleDiff"
      class="finance-select-settlement finance-diff-compare"
      width="1200px"
    >
      <DiffCompare
        :type="type"
        :refresh="dialogVisibleDiff"
        :lastCompareId="supplierBillDetailForm.lastCompareId || supplierBillDetailForm.expressCompareId || 0"
        :supplier-bill-id="supplierBillDetailForm.supplierBillId || 0"
      />
    </el-dialog>
  </el-form>
</template>
<script>
import { mapGetters } from 'vuex'
import DiffCompare from '@/views/finance/supplierBill/supplierBillList/components/diffCompare'
export default {
  name: 'supplierBillDetailForm',
  props: {
    supplierBillDetailForm: {
      type: Object,
      default: () => ({}),
    },
    source: {
      type: String,
      default: '',
    },
    isCompared: {
      type: Boolean,
      default: true,
    },
    refresh: Boolean,
  },
  components: {
    DiffCompare,
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    typeComputed() {
      return this.type === 'express' ? this.$t('Supplier.courierCompany') : this.$t('Supplier.suppliers')
    },
    type() {
      return this.$route.query.expressBillId ? 'express' : 'supplier'
    },
  },
  data() {
    return {
      dialogVisibleDiff: false,
      option1: {},
    }
  },
  created() {
    console.log(this.supplierBillDetailForm)
    // this.option1
  },
  watch: {
    supplierBillDetailForm: {
      handler(val) {
        console.log(val)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    openDiffCompare() {
      this.$emit('openDiffCompare')
    },
    renderNoEdit(row, item) {
      let { formatter, prop, type, selectOptions, propInDict } = item
      // if (prop === 'matchResult' && row[prop] === undefined) {
      //   prop = 'result'
      // }
      if (formatter) {
        return formatter(row, item)
      } else if (type && type === 'select') {
        let obj = ''
        if (propInDict && this.dictMap[propInDict]) {
          obj = this.dictMap[propInDict].find((item) => {
            return item.value === row[prop]
          })
        } else if (this.dictMap[prop]) {
          obj = this.dictMap[prop].find((item) => {
            return item.value === row[prop]
          })
        } else if (selectOptions) {
          obj = selectOptions.find((item) => {
            return item.value === row[prop]
          })
        }
        return obj && obj.label
      } else {
        return row[prop]
      }
    },
  },
}
</script>
<style scoped lang="scss">
/deep/ .detail__div{
   width: 25% !important;
   margin-right: 0;
   .detail__label{
    width: 150px;
   }
}
.el-form-item {
  width: 25%;
  margin-bottom: 7px;
  margin-right: 0;
  font-size: 12px;
}
.el-form-item ::v-deep .el-form-item__content {
  font-size: 12px;
  width: calc(100% - 150px);
}
</style>