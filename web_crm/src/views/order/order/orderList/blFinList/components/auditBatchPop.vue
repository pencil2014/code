<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="processing" :rules="rules" :model="createdItem" label-position="right" label-width="75px" class="audit-form">
      <div class="audit-batch-row" v-for="(item, index) in param.data" :key="index">
        <el-row class="audit-form-row">
          <el-col :span="8">
            <div class="item-lab">工作号：</div>
            <div class="item-val">{{item.orderNo}}</div>
          </el-col>
          <el-col :span="8">
            <div class="blNo">
              <div class="item-lab">提单号：</div>
              <div class="item-val"><i class="icon-hbl" v-if="item.blType">{{ item.blType === 'hbl' ? 'H' : 'M' }}</i>{{item.blNo}}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="item-lab">出单方式：</div>
            <div class="item-val">{{item.blMode | getDictLabelFilter('blMode')}}</div>
          </el-col>
        </el-row>
        <el-row class="audit-form-row">
          <el-col :span="8">
            <div class="item-lab">销售：</div>
            <div class="item-val">{{item.bdEmployeeName}}</div>
          </el-col>
          <el-col :span="8">
            <el-tooltip class="item" effect="dark" placement="top" :content="item.custSettleUnit">
              <div class="settleUnit-tooltip">
                <div class="item-lab">结算单位：</div>
                <div class="item-val">{{item.custSettleUnit}}</div>
              </div>
            </el-tooltip>
          </el-col>
          <el-col :span="8">
            <div class="item-lab">申请原因：</div>
            <div class="item-val">{{item.applyType | getDictLabelFilter('blFinApplyType')}}</div>
          </el-col>
        </el-row>
        <el-row class="audit-form-row" v-if="['pledge', 'dzg'].includes(item.applyType)">
          <el-col :span="24" v-if="item.applyType === 'pledge'">
            <div class="item-lab">被押单号：</div>
            <div class="item-val">{{item.pledgeOrderNo}}</div>
          </el-col>
          <el-col :span="8" v-if="item.applyType === 'dzg'">
            <div class="item-lab">被押大掌柜单：</div>
            <div class="item-val">{{item.pledgeOrderNo}}</div>
          </el-col>
          <el-col :span="8" v-if="item.applyType === 'dzg'">
            <div class="item-lab">被押T量：</div>
            <div class="item-val">{{item.pledgeAmount}}</div>
          </el-col>
          <el-col :span="8" v-if="item.applyType === 'dzg'">
            <div class="item-lab">被押提单号：</div>
            <div class="item-val">{{item.pledgeBlNo}}</div>
          </el-col>
        </el-row>
        <el-row class="audit-form-row">
          <el-col :span="24">
            <div class="item-lab">申请人：</div>
            <div class="item-val">{{item.applyEmployeeName}}</div>
          </el-col>
        </el-row>
        <div class="audit-form-row">
          <div class="label-fl" style="width: 60px">申请备注：</div>
          <div class="value-fr">{{item.applyRemark}}</div>
        </div>
        <div class="audit-form-row warning" v-if="item.applyType === 'pledge' && item.pledgeOrderNos">
          <!-- <div class="label-fl"></div> -->
          <div class="value-fr">
            {{`所选的被押提单，已被工作号${item.pledgeOrderNos}押了。`}}
          </div>
        </div>
        <div class="audit-form-row warning" v-if="item.applyType === 'dzg' && item.isDzgOrder && item.dzgBlNos">
          <!-- <div class="label-fl"></div> -->
          <div class="value-fr">
            {{`该被押工作号，已被提单${item.dzgBlNos}押了。`}}
          </div>
        </div>
      </div>
      <div class="audit-form-row warning" v-if="Object.keys(tipsObj).length">
        <div class="label-fl">注意：</div>
        <div class="value-fr" >
          <div v-for="(ele, index) in tipsObj" :key="index">{{ele}}</div>
        </div>
      </div>
      <div class="audit-form-row warning" >
        <div class="label-fl"></div>
        <div class="value-fr" >
          <div>是否确认审核通过，请仔细核对，谨慎操作！！！</div>
        </div>
      </div>
      <!-- 结算单位table -->
      <el-table border fit highlight-current-row style="width: 100%" ref="settleList" :data="tableData" class="settle-list-table" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
        <el-table-column prop="settleCorpName" label="结算单位" align="center" width="200"></el-table-column>
        <el-table-column prop="settleCycle" label="结算方式" align="center" width="70">
          <template slot-scope="scope">
            {{ scope.row.settleCycle | getDictLabelFilter('settleCycle') }}
          </template>
        </el-table-column>
        <el-table-column prop="isArrear" label="是否超期" align="center" width="70">
          <template slot-scope="scope">
            <span :class="{red: scope.row.isArrear === 'yes'}">{{scope.row.isArrear === 'yes' ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="arrearDays" label="超期天数" align="center" width="70"></el-table-column>
        <el-table-column prop="isOverQuota" label="是否超额" align="center" width="70">
          <template slot-scope="scope">
            <span :class="{red: scope.row.isOverQuota === 'yes'}">{{scope.row.isOverQuota === 'yes' ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="currency" label="币别" align="center" width="60"></el-table-column>
        <el-table-column prop="arrearAmt" label="超期金额" align="center" width="90">
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
        <el-table-column prop="orginArrearAmt" label="原超期金额" align="center"  width="90"></el-table-column>
        <el-table-column prop="overQuotaAmt" label="超额金额" align="center" width="90">
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
        <el-table-column prop="orginOverQuotaAmt" label="原超额金额" align="center"  width="90"></el-table-column>
        <el-table-column prop="arrearUnpayUsdAmt" label="账期未付金额" align="center" width="95"></el-table-column>
        <el-table-column prop="fiscalTermPreReceiveAmt" label="账期内预收金额" align="center" width="105"></el-table-column>
        <el-table-column prop="preReceiveAmt" label="预收款金额" align="center" width="90"></el-table-column>
        <el-table-column label="是否后有柜" align="center" width="90">
          <template slot-scope="scope">
            <el-button type="text" size="mini" v-if="scope.row.custBlIds && scope.row.custBlIds.length" @click="handleViewLastContainer(scope.row)">是</el-button>
            <span v-else>否</span>
          </template>
        </el-table-column>
      </el-table>
      <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
      <!-- 普通审核 -->
      <div class="pledge-cont" v-if="!param.isSpecial">
        <el-form-item :required="true" :show-message="false" label="审核结果" prop="auditStatus">
          <el-radio-group v-model="createdItem.auditStatus">
            <el-radio
              v-for="(item, index) in auditStatusOptions"
              :key="index"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :show-message="false" label="审核备注" prop="remark" v-if="createdItem.auditStatus === 'pass'">
          <el-input type="textarea" :style="{ width: '100%' }" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createdItem.remark"></el-input>
        </el-form-item>
        <template v-if="createdItem.auditStatus === 'processing'">
          <el-form-item :required="true" :show-message="false" label="处理中原因" prop="reason">
            <el-select v-model="createdItem.reason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 33%">
              <el-option v-for="(item, index) in dictMap.blFinAuditProcessingReason" :label="item.label" :value="item.value" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :show-message="false" label="处理中备注" prop="remark">
            <el-input type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.remark" maxlength="512" show-word-limit></el-input>
          </el-form-item>
        </template>
        <template v-if="createdItem.auditStatus === 'refuse'">
          <el-form-item :required="true" :show-message="false" label="拒绝原因" prop="reason">
            <el-select v-model="createdItem.reason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 33%">
              <el-option v-for="(item, index) in dictMap.blFinAuditProcessingReason" :label="item.label" :value="item.value" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :show-message="false" label="拒绝备注" prop="remark">
            <el-input type="textarea" size="mini" :rows="3" placeholder="请输入" v-model="createdItem.remark" maxlength="512" show-word-limit></el-input>
          </el-form-item>
        </template>
      </div>
      <!-- 特殊审核 -->
      <div class="pledge-cont" v-else>
        <el-form-item :required="true" :show-message="true" label="审核结果" prop="auditStatus">
          <!-- <span class="icon-required">*</span> -->
          <el-radio-group v-model="createdItem.auditStatus">
            <el-radio
              v-for="(item, index) in auditStatusOptions"
              :key="index"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :show-message="false" label="审核备注" prop="auditRemark" v-if="createdItem.auditStatus === 'pass'">
          <el-input type="textarea" :style="{ width: '100%' }" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createdItem.auditRemark"></el-input>
        </el-form-item>
        <el-form-item :show-message="false" label="拒绝原因" prop="refuseRemark" v-if="createdItem.auditStatus === 'refuse'">
          <el-input type="textarea" :style="{ width: '100%' }" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="createdItem.refuseRemark"></el-input>
        </el-form-item>
      </div>
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
import LastContainerPop from './lastContainerPop'
import { finSettListBatch, getFinApplyReasonBatch, checkPledgeOrder, checkDzgOrder } from '@/api/order/bl'
import { getDictLabel } from '@/utils/tools'
const defaultCreate = {
  auditRemark: '',
  refuseRemark: '',
  auditStatus: 'pass',
  reason: '',
  remark: ''
}
export default {
  data() {
    return {
      rules: {},
      tableDataObj: {},
      tableData: [],
      dialogConfig: {
        title: '批量审核',
        show: true,
        width: '1120px',
        btns: [
          {label: '确定', action: 'Confirm', type: 'primary'},
          {label: '取消', action: 'Cancel'}
        ]
      },
      createdItem: Object.assign({}, defaultCreate),
      tipsObj: {},
      pledgeOrderNos: '',
      isDzgOrder: false,
      dzgBlNos: '',
      auditStatusOptions: [
        { label: '审核通过', value: 'pass' },
        { label: '处理中', value: 'processing' },
        { label: '审核拒绝', value: 'refuse' }
      ],
      tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
      },
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
    console.log('this.param', this.param)
    if (this.param.isSpecial) {
      this.auditStatusOptions = [
        { label: '审核通过', value: 'pass' },
        { label: '审核拒绝', value: 'refuse' }
      ]
    }
    this.getFinSettList()
    if (this.param.data) {
      this.param.data.forEach(item => {
        // 获取押柜被押单号
        if (item.applyType === 'pledge' && item.pledgeBlId) {
          checkPledgeOrder(item.pledgeBlId).then(res => {
            item.pledgeOrderNos = res.data
          })
          // this.getPledgeInfo(item)
        }
        // 查询押大掌柜单号是否被其他提单押了，是就显示提示信息
        if (item.applyType === 'dzg' && item.pledgeOrderNo) {
          checkDzgOrder({orderNo: item.pledgeOrderNo}).then(res => {
            let { isDzgOrder, pledgeSource } = res.data
            item.isDzgOrder = isDzgOrder
            item.dzgBlNos = pledgeSource
          })
        }
      })
    }
    // if (this.param.applyType === 'pledge') {
    //   this.getPledgeInfo()
    // }
    // if (this.param.applyType === 'dzg') {
    //   this.getDzgPledgeInfo()
    // }
  },

  mounted() {
  },
  destroyed() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap
    }),
  },
  watch: {
    // param: {
    //   handler(newVal, oldVal) {
    //     this.batchData = newVal.data
    //   }
    // }
  },
  components: {
    BaseDialog,
    tableTooltip,
    LastContainerPop
  },
  methods: {
    // 打开后有柜的弹窗
    handleViewLastContainer(row) {
      this.lastContainerPopQuery = {... row}
      this.lastContainerPopShow = true
    },
		lastContainerPopClose(action, value) {
			this.lastContainerPopShow = false
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
    handleSelectReason(val) {
    },
    // // 查询押大掌柜单号是否被其他提单押了，是就显示提示信息
    // getDzgPledgeInfo() {
    //   // 被押大掌柜单号为空的不请求接口
    //   if (!this.param.pledgeOrderNo) return
    //   checkDzgOrder({orderNo: this.param.pledgeOrderNo}).then(res => {
    //     let { isDzgOrder, pledgeSource } = res.data
    //     this.isDzgOrder = isDzgOrder
    //     this.dzgBlNos = pledgeSource
    //   })
    // },
    // // 获取押柜信息
    // getPledgeInfo() {
    //   let { pledgeBlId } = this.param
    //   // 押柜提单为空的不请求接口
    //   if (!pledgeBlId) return
    //   checkPledgeOrder(pledgeBlId).then(res => {
    //     this.pledgeOrderNos = res.data
    //   })
    // },
    // 获取关联费用的结算单位
    getFinSettList() {
      let query = this.param.data.map(item => {
        return {
          orderNo: item.orderNo,
          blId: item.blId,
          type: item.applyType
        }
      })
      finSettListBatch(query).then(res => {
        let { data } = res
        this.tableDataObj = res.data
        let t = this.param.data[0].orderNo+this.param.data[0].blId
        this.tableData = this.tableDataObj[t]
        // this.tableData = data.filter(item => this.param.custSettleUnit.indexOf(item.settleCorpName) !== -1)
        this.getFinApplyReason()
      })
    },
    // 获取申请原因
    getFinApplyReason() {
      let query = []
      this.param.data.map(item => {
        let orderBls = [
          {orderNo: item.orderNo, blId: item.blId}
        ]
        let settlementInfos = this.tableDataObj[item.orderNo+item.blId].map(ele => {
          return {
            settleCorpCode: ele.settleCorpCode,
            settleCompCode: ele.settleCompCode,
            custid: ele.custId,
            companyId: ele.companyId
          }
        })
        query.push({
          orderBls,
          settlementInfos
        })
      })
      // let settlementInfos = this.tableData.map(item => {
      //   return {
      //     // unitCode: item.unitCode,
      //     settleCorpCode: item.settleCorpCode,
      //     settleCompCode: item.settleCompCode,
      //     custid: item.custId,
      //     companyId: item.companyId
      //   }
      // })
      // let data = {
      //   orderBls: this.param.orderBls,
      //   settlementInfos,
      // }
      getFinApplyReasonBatch(query).then(res => {
        this.tipsObj = res.data
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    // 弹窗关闭回调
    dialogCallback(action, done) {
      if (['Pass', 'Processing', 'Refuse','Confirm'].includes(action)) {
        this.$refs.processing.validate(valid => {
          if (valid) {
            // // 特殊申请审核需要校验审核结果必填
            // if (this.param.isSpecial && !this.createdItem.auditStatus) {
            //   return this.$message.error('审核结果为必填')
            // }
            let data = {...this.createdItem}
            this.close(action, data)
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
.audit-form{
  .audit-batch-row{
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px dashed #ddd;
  }
  .audit-form-row {
    display: flex;
    margin-top: 4px;
    line-height: 16px;
    .audit-form-unit {
      padding-right: 20px;
      position: relative;
      .el-icon-question {
        position: absolute;
        width: 12px;
        height: 12px;
        right: -18px;
        top: 4px;
        color: #bfbfbf;
      }
    }
    .blNo{
      display: flex;
      .icon-hbl {
        display: inline-block;
        width: 16px;
        height: 16px;
        background: #3e80f5;
        border-radius: 2px;
        color: #fff;
        line-height: 16px;
        text-align: center;
        font-style: normal;
        margin: 0 4px 0 0;
        font-size: 12px;
      }
    }
    &.warning{
      color: #e63923;
      margin-top: 5px
    }
    .label-fl{
      width: 40px;
    }
    .value-fr{
      flex: 1;
      .btn-special{
        margin-left: 10px;
      }
    }
    .item-lab{
      display: inline-block;
      width: 60px;
      text-align: right;
    }
    .item-val{
      display: inline-block;
      text-align: left;
    }
    .settleUnit-tooltip{
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 10px;
    }
  }
  .pledge-cont{
    // border-top: 1px dashed #ddd;
    // padding-top: 10px;
    margin-top: 15px;
    .audit-form-item {
      font-size: 12px;
      line-height: 20px;
    }
    /deep/ .el-radio{
      .el-radio__label{
        font-size: 12px;
      }
    }
    /deep/ .el-form-item {
      .el-form-item__label{
        padding-right: 4px;
      }
      &.auditStatus-required{
        .el-form-item__content{
          position: relative;
          .icon-required{
            position: absolute;
            left: -60px;
            font-size: 12px;
            line-height: 20px;
            color: #e63923;
          }
        }
      }
    }
  }
 
  /deep/ .el-form-item {
    margin-bottom: 4px;
  }
  .settle-list-table{
    margin-top: 4px;
    /deep/ .cell {
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  /deep/ .el-table th{
    height: 24px;
    padding: 2px 0;
  }
  /deep/ .el-table__empty-block{
    min-height: 30px;
    .el-table__empty-text {
      line-height: 30px;
    }
  }
}

.apply-order-table {
  background-color: #fff;
  margin-top: 20px;
  // padding: 10px;
  .tips-abs {
    position: absolute;
    left: 50%;
    top: -30px;
    margin-left: -172px;
    z-index: 2;
  }
}
</style>
