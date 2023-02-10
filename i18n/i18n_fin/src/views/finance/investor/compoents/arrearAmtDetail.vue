<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
    >
    <div class="money-box bg-white money-box-border-bottom">
      <div class="money-box-left"><div class="money-title">超期详情</div></div>
      <div class="money-box-right">
        <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
      </div>
    </div>
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-seabill-cnt">
      <div class="money-box" style="background: #ffffff;">
        <div class="money-box-left">
          <span>超期金额：{{arrearAmt}}{{arrearCurrency}}</span>
        </div>
        <div class="money-box-right">
        <el-button-group>
          <el-button class="finance-btn" size="mini" @click="handleCustomColumns"
          >{{$t('Common.custTableHead')}}</el-button>
        </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1"/>
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
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryOverQuotaAndArrear, recvPayBalanceDetailListPage, recvPayBalanceDetailList } from '@/api/fin/internal'
import { dateFormat } from '@/views/finance/utils/finance'
import { queryFiscalTermPage, queryFiscalTermFeePage } from '@/api/fin/fiscalterm'
export default {
    mixins : [ mixin, routerMixin ],
    data(){
      return {
        sourceBizNo:0,
        arrearCurrency:"",
        arrearAmt:0,
        searchOption:{},
        option1:{},
        loading:false,
        selfColumnsBase:[
            {
              disabled: true,
              prop: 'fiscalTermNo',
              label: '应收账单编号',
              width:140,
              type:'button',
              operationBtns: {
                show: true,
                callback: (action, $index, { fiscalTermNo }, option) => {
                  this.routerPush("FiscalTermDetail", {
                    fiscalTermNo
                  })
                },
              },
            },
            {
              prop: 'settleCompName',
              label: this.$t('FeeList.settleComp'),
              width:140,
              type:'text'
            },
            {
              prop: 'settleCorpName',
              label: this.$t('FeeList.settleCorp'),
              width:120,
              type:'text'
            },
            {
              prop: 'receipayType',
              label: this.$t('FeeList.receipayType'),
              type:'select',
					    propInDict:'receipayType'
            },
            {
              prop: 'recvUsdAmt',
              label: '折USD应收',
              type:'text'
            },
            {
              prop: 'unrecvUsdAmt',
              label: '折USD未收',
              type: 'text',
            },
            {
              prop: 'arrearUsdAmt',
              label: '超期折USD金额',
              width:100,
              type:'text'
            },
            {
              prop: 'arrearDays',
              label: '逾期天数',
              type:'text'
            },
            {
              prop: 'settleDate',
              label: '账单日',
              type:'text'
            },
            {
              prop: 'dueDate',
              label: '结款到期日期',
              width:100,
              type:'text'
            },
            {
              prop: 'graceDays',
              label: '宽限天数',
              type:'text'
            }
        ]
      }
    },
    components:{
      FinanceTableMass,
      FinanceSearch,
      CustomColumns
    },
    created(){
      this.searchOption = {
        addFilter: {
          defaultSearchLength: 2,
          searchInputGroup: [
            { key: "fiscalTermNo", value: "", showType: "1" },
            { key: "dueDate", value: "", showType: "2" },
          ],
          filterGroups: {
            fiscalTermNo: {	label: "应收账单编号",	type: "input",	showType: "1" },
            // ownerCompCame: {	label: "所属分公司",	type: "input",	showType: "1" },
            ownerCompCode: {
              label: this.$t('FeeList.settleComp'),
              prop: 'settleCorpCode',
              type: 'remoteSelect',
              remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
              visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
              remoteSelectList: [],
            },
            // currency: {	label: "币种",	type: "select", selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),	showType: "1" },
            settleDate: {	label: "账单日",	type: "daterange", format: 'yyyy-MM-dd',	showType: "1" },
            dueDate: {	label: "结款到期日期",	type: "daterange", format: 'yyyy-MM-dd',	showType: "1" },
          },
        },
      };
      // 表格配置
      let pagination = { ...this.option.pagination, show: true, isNew: true }
      this.option1 = {
          ...this.option,
          id: 'option1',
          pagination,
          operationBtns: false,
          selection: false,
          sortable: false,
          sortChange: (column, prop, order) => {
            this.descColumns = order == 'descending' ? [prop] : []
            this.ascColumns = order == 'ascending' ? [prop] : []
            this.getData()
          },
      }
      let columns = [...this.selfColumnsBase]
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
      this.selfColumnsBase.forEach((item) => (item.sortable = true))
      this.option1.columns = columns
    },
    methods:{
      // 自定义表头
      handleCustomColumns(){
			  this.customColumnsPopShow = true
      },
      //返回
      cancel(){
        this.routerBack()
      },
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
      getData(isSearch) {
        let data ={
          "currPage": this.option1.pagination.currPage,
          "pageSize": this.option1.pagination.pageSize,
          "columns":[],
          "query":[]
        }
        if (this.customColumnsKeys && this.customColumnsKeys.length) {
          data.columns = this.customColumnsKeys
        }
        this.searchOption.addFilter.searchInputGroup.forEach((item) => {
          let { key, value, range, req, valueReq } = item
          if (!value) return
          if (typeof value !== 'object') {
            if(valueReq && item[valueReq]){
                data.query.push({
                column: valueReq,
                type: 'eq',
                value:  item[valueReq],
                })
                console.log(item[valueReq]);
              }
              return data.query.push({
                column: key,
                type: 'eq',
                value: req || value,
              })
            }
            if (key === 'recvCorpCode' || key === 'payStatus' || key === 'status') {
            if (!value.length) return
            data.query.push({
              column: key,
              type: 'eq',
              value: value.join(','),
            })
          }else{
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
        })
        data.query.push({"column": "custId", "type": "eq", "value": this.custId})
        data.query.push({"column": "hasArrear", "type": "eq", "value": 'yes'})
        // this.loading = true
        queryFiscalTermPage(data).then(res => {
          if (res.code === 0) {
            if (res.data.configColumns && res.data.configColumns.length) {
              let columns = res.data.configColumns
              this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
              this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
              this.configColumns = res.data.configColumns
            }
            let list  = res.data.list
            let data = []
            list.forEach(item => {
                data.push(item)
              })
              this.option1.data = data
              this.table1DataBackup = [
                ... this.option1.data
              ]
              Object.assign(this.option1.pagination, res.data)
              // this.option1.pagination.currPage = res.data.currPage
              // this.option1.pagination.pageSize = res.data.pageSize
              // this.option1.pagination.totalCount = res.data.totalCount 
          }
        }).catch(err=>{
          this.delVisitedView()
          this.cancel()
        }).finally(() => {
          this.loading = false
        })
      },
      search(data, index) {
			  this.buttonSearch = data
			  this.option1.pagination.currPage = 1
			  this.getData(null,true)
        if (index || index === 0) {
          this.rightFilterBtns = [false, false, false]
          this.rightFilterBtns[index] = true
        }
		  },
    },
    activated () {
      this.custId = this.$route.query.custId ? this.$route.query.custId : ''
      this.arrearAmt = this.$route.query.arrearAmt
      this.arrearCurrency = this.$route.query.arrearCurrency

      this.searchOption.data = { fiscalTermNo: '', ownerCompCode: '', settleDate: '', dueDate: '' }
      this.searchOption.addFilter.searchInputGroup =  [
        { key: "fiscalTermNo", value: "", showType: "1" },
        { key: "dueDate", value: "", showType: "2" },
      ]
      // this.handleCurrentChange(1)
    }
}
</script>

<style lang="scss" scoped>
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right {
  margin-top: 6px;
}
</style>