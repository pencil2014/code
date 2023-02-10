<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="apply" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="apply-form" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
      <div class="apply-form-row warning">
        MBL关联的HBL 并未同意放货，业务申请提前同意放该MBL，请谨慎审核！
      </div>
      <div class="blNo-list" v-for="(item, index) in param.blNosArr" :key="index">
        <el-row>
          <el-col :span="8">
            <div class="unit">
              <div class="label-fl">提单号：</div>
              <div class="value-fr">{{item.blNo}}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="unit">
              <div class="label-fl">销售：</div>
              <div class="value-fr">{{item.bdEmployeeName}}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="unit">
              <div class="label-fl">申请人：</div>
              <div class="value-fr">{{item.agreeApplyEmployeeName}}</div>
            </div>
          </el-col>
        </el-row>
        <div class="unit mt06">
          <div class="label-fl">申请原因：</div>
          <div class="value-fr">{{item.agreeApplyReason}}</div>
        </div>
        <!-- 结算单位table -->
        <el-table border fit highlight-current-row style="width: 100%" ref="settleList" :data="tableDataObj[item.orderNo+item.blId] || []" class="settle-list-table" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
          <el-table-column prop="settleCorpName" label="结算单位" align="center" width="200"></el-table-column>
          <el-table-column prop="settleCycle" label="结算方式" align="center" width="90">
            <template slot-scope="scope">
              {{ scope.row.settleCycle | getDictLabelFilter('settleCycle') }}
            </template>
          </el-table-column>
          <el-table-column prop="isArrear" label="是否超期" align="center" width="80">
            <template slot-scope="scope">
              <span :class="{red: scope.row.isArrear === 'yes'}">{{scope.row.isArrear === 'yes' ? '是' : '否'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="arrearDays" label="超期天数" align="center" width="80"></el-table-column>
          <el-table-column prop="isOverQuota" label="是否超额" align="center" width="80">
            <template slot-scope="scope">
              <span :class="{red: scope.row.isOverQuota === 'yes'}">{{scope.row.isOverQuota === 'yes' ? '是' : '否'}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="currency" label="币别" align="center" width="80"></el-table-column>
          <el-table-column prop="arrearAmt" label="超期金额" align="center" width="100">
            <template slot="header">
              超期金额
              <el-tooltip class="item" effect="dark" placement="top" content="超期金额=原超期金额-账期内和之前未付金额-账期内和之前预收款金额。">
                <i class="el-icon-question" style="font-size: 14px"></i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <span class="red">{{scope.row.arrearAmt}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orginArrearAmt" label="原超期金额" align="center" width="100"></el-table-column>
          <el-table-column prop="overQuotaAmt" label="超额金额" align="center" width="100">
            <template slot="header">
              超额金额
              <el-tooltip class="item" effect="dark" placement="top" content="超额金额=原超额金额-所有预收款金额。">
                <i class="el-icon-question" style="font-size: 14px"></i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <span class="red">{{scope.row.overQuotaAmt}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orginOverQuotaAmt" label="原超额金额" align="center" width="100"></el-table-column>
          <el-table-column prop="arrearUnpayUsdAmt" label="账期未付金额" align="center" width="100"></el-table-column>
          <el-table-column prop="fiscalTermPreReceiveAmt" label="账期内预收金额" align="center" width="110"></el-table-column>
          <el-table-column prop="preReceiveAmt" label="预收款金额" align="center" width="100"></el-table-column>
          <!-- <el-table-column prop="preReceiveAmt" label="查看信控配置" align="center" width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="text" class="" @click="handleViewCustName(scope.row)">查看</el-button>
            </template>
          </el-table-column> -->
          <el-table-column label="是否后有柜" align="center" width="90">
            <template slot-scope="scope">
              <el-button type="text" size="mini" v-if="scope.row.custBlIds && scope.row.custBlIds.length" @click="handleViewLastContainer(scope.row)">是</el-button>
              <span v-else>否</span>
            </template>
          </el-table-column>
        </el-table>
        <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
      </div>
      <el-row class="apply-form-cont">
        <el-form-item :required="true" :show-message="true" label="审批结果" prop="blAgreeReleaseStatus">
          <!-- <span class="icon-required">*</span> -->
          <el-radio-group v-model="createdItem.blAgreeReleaseStatus">
            <el-radio
              v-for="(item, index) in blAgreeReleaseStatusOptions"
              :key="index"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因" prop="reason" :required="true" :show-message="false">
          <el-input maxlength="512" show-word-limit :style="{ width: '100%' }" type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.reason"></el-input>
        </el-form-item>
      </el-row>
    </el-form>
    <div v-if="lastContainerPopShow">
			<LastContainerPop :lastContainerPopQuery="lastContainerPopQuery" @close="lastContainerPopClose" />
		</div>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import LastContainerPop from '@/views/order/order/orderList/blFinList/components/lastContainerPop'
import { finSettListBatch } from '@/api/order/bl'
const defaultCreate = {
  blAgreeReleaseStatus: 'pass',
  reason: ''
}
export default {
  data() {
    return {
      dialogConfig: {
        title: '审批',
        show: true,
        width: '1120px',
        inputSize: ''
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
      },
      blAgreeReleaseStatusOptions: [
        { label: '审核通过', value: 'pass' },
        { label: '审核拒绝', value: 'refuse' }
      ],
      tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
      },
      tableDataObj: [],
      lastContainerPopShow: false,
      lastContainerPopQuery: {}
    }
  },
  props: {
    param: {
      type: Object,
      default: () => ({})
    }
  },
  created() {
    this.init()
  },

  mounted() {
  },
  destroyed() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    })
  },
  watch: {},
  components: {
    BaseDialog,
    tableTooltip,
    LastContainerPop
  },
  methods: {
    init() {
      this.getFinSettList()
    },
    // 获取关联费用的结算单位
    getFinSettList() {
      this.lsLoading = true
      let query = this.param.blNosArr.map(item => {
        return {
          orderNo: item.orderNo,
          blId: item.blId,
          // type: item.applyType
        }
      })
      finSettListBatch(query).then(res => {
        let { data } = res
        this.tableDataObj = res.data
        // let t = this.param.data[0].orderNo+this.param.data[0].blId
        // this.tableData = this.tableDataObj[t]
        // this.tableData = data.filter(item => this.param.custSettleUnit.indexOf(item.settleCorpName) !== -1)
      }).finally(() => {
        this.lsLoading = false
      })
    },
    // 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
    },
    // 打开后有柜的弹窗
    handleViewLastContainer(row) {
      this.lastContainerPopQuery = {... row}
      this.lastContainerPopShow = true
    },
		lastContainerPopClose(action, value) {
			this.lastContainerPopShow = false
		},
    close(action, value, isSpecial) {
      this.$emit('close', action, value, isSpecial)
    },
    // 弹窗关闭回调
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.apply.validate(valid => {
          if (valid) {
            this.close('Confirm', {
              blIdList: this.param.blIdList,
              blAgreeReleaseStatus: this.createdItem.blAgreeReleaseStatus,
              reason: this.createdItem.reason
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.apply-form{
  .apply-form-row {
    line-height: 20px;
    &.warning{
      color: #e63923;
      // margin-top: 15px
    }
  }
  .blNo-list{
    background-color: #f3f3f3;
    padding: 5px;
    margin-top: 8px;
    .unit{
      display: flex;
      line-height: 16px;
      &.mt06{
        margin-top: 6px;
      }
      .label-fl{
        width: 60px;
        text-align: right;
      }
      .value-fr{
        flex: 1;
        .btn-special{
          margin-left: 10px;
        }
      }
    }
  }
  .apply-form-cont{
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px dashed #e6e6e6;
  }
  /deep/ .el-form-item {
    margin-bottom: 4px;
  }
  /deep/ .el-radio{
    .el-radio__label{
      font-size: 12px;
    }
  }
  .settle-list-table {
    margin-top: 4px;
    /deep/ .cell {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    /deep/ .el-table__empty-block {
      min-height: 30px;
    }
    /deep/ .el-table__empty-text {
      line-height: 30px;
    }
  }
}
</style>