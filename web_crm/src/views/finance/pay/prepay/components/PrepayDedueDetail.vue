<template>
  <div class="finance-page prepay-detail prepay-dedue-detail" v-loading="loading">
    <div class="finance-approve-detail finance-detail-page">
      <div class="money-box money-box-border-bottom" style="background: #ffffff">
        <div class="money-box-left">
          <div class="money-title">预付抵账明细</div>
        </div>
        <div class="money-box-right">
            <el-button  @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
    </div>
    <FinanceTableMass :option="option1" />
  </div>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { prepayDedueInfoList } from '@/api/fin/pay/'
export default {
    mixins: [mixin,routerMixin],
    components: {
      FinanceTableMass,
    },
    data(){
      return {
        loading: false,
        option1: {},
        selfColumnsBase: [
          {
            prop: 'writeoffSubType',
            label: '核销模式',
            width: 150,
            type: 'select',
            propInDict:'writeoffSubType'
          },
          {
            prop: 'payApplyNo',
            label: '付款申请单号',
            width: 150,
            type: 'button',
            operationBtns:{
              show: true,
              callback: (action,index,row,option) => {
                console.log(row);
                let query = {
                  applyNo: row.payApplyNo,
                  settleOrderNo: row.settleOrderNo,
                  confirmStatus: row.confirmStatus
                }
                this.routerPush('SettleDetail', query)
              },
            }
          },
          {
            prop: 'prepayApplyNo',
            label: '预付款申请单号',
            width: 150,
            type: 'button',
            operationBtns:{
              show: true,
              callback: (action,index,row,option) => {
                console.log(row);
                let query = {
                  source: 'createRegPrepayFrom',
                  applyNo:row.prepayApplyNo
                }
                this.routerPush('PrepayDetail', query)
              },
            }
          },
          {
            prop: 'writeoffReceipayNo',
            label: '核销编号',
            width: 150,
            type: 'button',
            operationBtns:{
              show: true,
              callback: (action,index,row,option) => {
                console.log(row);
                let query = {
                  writeoffReceipayNo:row.writeoffReceipayNo
                }
                this.routerPush('WritePayDetail', query)
              },
            }
          },
          {
            prop: 'sourceBizNo',
            label: '工作单号',
            width: 150,
            type: 'columnTip',
            sortable: false,
            component: 'ColumnTip',
            componentProps: {
            show: false,
            data: [],
            callback: (no, { row }, index) => {
              let orderNoList = row.orderNo_multiValue
              let sourceTypeList = row.sourceBizNo_multiValue
              let orderNo = orderNoList[index]
              let sourceType = sourceTypeList[index]
              let sourceBizNo = orderNo
              this.$emit('update:isJumpRouteFromPage', true)
                this.showOneNoDetail(sourceBizNo, sourceType, { feeId: '' })
              },
            },
          },
          {
            prop: 'settleCorpName',
            label: '结算单位',
            width: 180,
            type: 'text',
          },
          {
            prop: 'currency',
            label: '币种',
            type: 'text',
          },
          {
            prop: 'prepayAmt',
            label: '预付金额',
            type: 'text',
          },
          {
            prop: 'dedueAmt',
            label: '抵账金额',
            type: 'text',
          },
          {
            prop: 'prepayBalanceAmt',
            label: '预付款余额',
            type: 'text',
          },
          {
            prop: 'receivePayDate',
            label: '收付日期',
            type: 'text',
          },
          {
            prop: 'payAccountShortName',
            label: '付款银行',
            width: 120,
            type: 'text',
          },
          {
            prop: 'writeoffCreatedName',
            label: '核销人',
            width: 100,
            type: 'text',
          },
        ]
      }
    },
    created(){
      this.option1 = Object.assign({}, this.option, {
        id: 'option1', $name: 'PrepayDedueDetail',
        border: true,
        data: [
          ... this.option.data
        ],
        selection:false,
        tips: {
          text: '',
          show: false
        },
        customColumns: {
          show: false,
          handleCustomColumns: ()=> this.handleCustomColumns()
        },
        operationBtns: false,
        sortChange: (column, prop, order) => {
          this.descColumns = order == 'descending' ? [prop] : []
          this.ascColumns = order == 'ascending' ? [prop] : []
          this.getData()
        },
        maxHeight: this.getFinanceTableMaxHeight,
      })
      let columns = [...this.selfColumnsBase]
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
      this.selfColumnsBase.forEach((item) => (item.sortable = true))
      this.option1.columns = columns
    },
    activated() {
      // if (!this.$route.meta.isUseCache) {
      //   return
      // }
      this.getData()
    },
    methods:{
      cancel(refresh) {
          this.routerBack(refresh)
      },
      getData(params, isSearch) {
        this.loading = true
        let data ={
          applyNo: this.$route.query.applyNo
        }
        prepayDedueInfoList(data).then(res => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            let list = res.data
            let data = []
            list.forEach(item => {
              item.orderNo_multiValue = item.sourceBizNo.split(',').map(subItem => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.sourceBizNo_multiValue = item.sourceBizNo.split(',').map(subItem => {
                let arr = subItem.split('/')
                return arr[0]
              })
              data.push(item)
            })
            this.option1.data = data
            // this.table1DataBackup = [
            //   ... this.option1.data
            // ]
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        }).finally(() => {
          this.loading = false
        }).catch(err=>{
          this.delVisitedView()
          this.cancel()
        })
      },
    }
}
</script>

<style>
  .prepay-dedue-detail .el-table td {
    border-right: 1px solid #dfe6ec !important;
  }
  .prepay-dedue-detail .el-table td:first-child {
    border-left: 1px solid #dfe6ec !important;
  }
  .prepay-dedue-detail .el-table--border th{
    border-top: 1px solid #dfe6ec;
  }
  .prepay-dedue-detail .el-table--border th:first-child {
    border-left: 1px solid #dfe6ec;
  }
  .prepay-dedue-detail .finance-table .el-table .cell {
    color: #222222;
  }
</style>