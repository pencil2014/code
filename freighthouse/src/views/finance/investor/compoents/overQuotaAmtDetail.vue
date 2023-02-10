<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
	:element-loading-spinner="eLoadingSpinner"
	:element-loading-background="eLoadingBackground"
  >
    <div class="money-box bg-white money-box-border-bottom">
      <div class="money-box-left">
        <div class="money-title">{{receipayType === 'pay' ? '未付金额' : receipayType === 'receive' ? '未收金额' : '超额详情'}}</div>
      </div>
      <div class="money-box-right">
        <el-button @click="cancel" size="mini">返回</el-button>
      </div>
    </div>
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-seabill-cnt">
        <div class="money-box" style="background: #ffffff;">
            <div class="money-box-left">
				<template v-if="receipayType === 'receive'">
					<span>折币未收金额：{{amtData.unrecvAmt}} {{amtData.unrecvCurrency}} </span>
					<span v-if="amtData.unrecvDzgAmt">(含大掌柜未收金额：{{amtData.unrecvDzgAmt}} {{amtData.unrecvCurrency}})</span>
				</template>
				<template v-else-if="receipayType === 'pay'">
					<span>折币未付金额：{{amtData.unpayAmt}} {{amtData.unpayCurrency}} </span>
					<span v-if="amtData.unpayDzgAmt">(含大掌柜未付金额：{{amtData.unpayDzgAmt}} {{amtData.unpayCurrency}})</span>
				</template>
				<template v-else>
					<span>超额金额：{{amtData.overQuotaAmt}} {{amtData.creditCurrency}}</span>
				</template>
            </div>
            <div class="money-box-right">
				<el-button-group>
                    <el-button class="finance-btn" size="mini" @click="handleCustomColumns"
                        >自定义表头</el-button
                    >
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
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryOverQuotaAndArrear, recvPayBalanceDetailListPage, recvPayBalanceDetailList, getListAmtSummary } from '@/api/fin/internal'
import { dateFormat } from '@/views/finance/utils/finance'
import { listByRole } from '@/api/base'
export default {
    mixins : [ mixin, mixin2, routerMixin ],
    data(){
        return {
			amtData:{},
			unsettleAmtData:{},
            creditAccountNo:'',
			custId:'',
			businessType:'',
			receipayType:'',
            searchOption:{},
            option1:{},
            loading:false,
            selfColumnsBase:[
                {
					disabled: true,
					prop: 'sourceBizNo',
					label: '单号',
					width:140,
					type:'button',
					operationBtns: {
						show: true,
						callback: (action, $index, row, option) => {
							let sourceType = row.sourceType
							let sourceBizNo = row.sourceBizNo
							this.showOneNoDetail(sourceType, sourceBizNo, { feeId: row.feeId })
						},
					},
				},
                {
					prop: 'feeName',
					label: '费用名称',
                    width:120,
                    type:'text'
				},
                {
					prop: 'receipayType',
					label: '收付类型',
                    width:120,
                    type:'select',
					propInDict:'receipayType'
				},
                {
					prop: 'feeCurrency',
					label: '费用原币种',
                    type:'text'
				},
                {
					prop: 'feeBalance',
					label: this.$route.query.receipayType === 'pay' ? '费用未付金额' : '费用未收金额',
					width:100,
                    type:'text'
				},
                {
					prop: 'currency',
					label: '授信额度币种',
					width:110,
                    type: 'select',
					propInDict: 'feeitemReceipayGroup',
				},
                {
					prop: 'feeRate',
					label: '汇率',
                    type:'text'
				},
                {
					prop: 'unsettleAmt',
					label: this.$route.query.receipayType === 'pay' ? '折币未付金额' : '折币未收金额',
					width:100,
                    type:'text'
				},
                {
					prop: 'bdEmployeeName',
					label: '业务员',
					width:100,
                    type:'text'
				},
                {
					prop: 'bdDeptName',
					label: '所属部门',
                    width:100,
                    type:'text'
				},
                {
					prop: 'finDate',
					label: '财务日期',
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
				defaultSearchLength: 3,
				searchInputGroup: [
					{ key: "sourceBizNo", value: "", showType: "1" },
					{ key: "feeName", value: "", showType: "2" },
					{ key: "finDate", value: "", showType: "3" },
				],
				filterGroups: {
					sourceBizNo: {	label: "单号",	type: "input",	showType: "1" },
					feeName: {	label: "费用名称",	type: "input",	showType: "1" },
					feeCurrency: {	label: "费用原币种", type: "select",	selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), showType: "1" },
					// currency: {	label: "授信额度币种",	type: "select",	selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), showType: "1" },
					bdEmployeeId: {
						label: '业务员', showType: '1', type: 'remoteSelect', clearable: true, remoteSelectList: [],
						remoteMethod: (queryString, item) => {
							this.getSellers(queryString, item)
						},
						visibleChange: (queryString, item) => {
							this.getSellers(queryString, item)
						},
					},
					bdDeptName: {	label: "所属部门",	type: "input",	showType: "1" },
					finDate: {	label: "财务日期",	type: "daterange", format: 'yyyy-MM-dd', showType: "1" }
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
			data.query.push({"column": "orderNo", "type": "eq", "value": this.orderNo})
			data.query.push({"column": "custid", "type": "in", "value": this.custId})
      if(this.receipayType){
        data.query.push({"column": "receipayType", "type": "eq", "value": this.receipayType})
      }
			// data.query.push({"column": "receipayType", "type": "eq", "value": this.receipayType || "receive"})
			// this.loading = true
			recvPayBalanceDetailListPage(data).then(res => {
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
			// this.debounceLs(() => {
			// 	this.getListAmtSummary(data)
			// })
			
        },
		getListAmtSummary (data){
			getListAmtSummary(data).then(res=>{
				if(res.code === 0){
					this.unsettleAmtData = res.data
				}
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
		// 获取销售
		getSellers (name = '', item) {
			let query = [{ column: 'roleCode', type: 'in', value: 'bd,obd' }]
			name && query.push({ column: 'name', type: 'eq', value: name })
			listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
        if (this.remoteSelectCommon(item, list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId })))) return
				item.remoteSelectList = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
			})
		},
		getArrearAmt(){
			queryOverQuotaAndArrear([{
				"orderNo": this.orderNo,
				"custid":this.custId
			}]).then(res=>{
				if(res.data.length){
					this.amtData = res.data[0]
				}
			})
			
		}
    },
    activated () {
		this.custId = this.$route.query.custId ? this.$route.query.custId : ''
		this.orderNo = this.$route.query.orderNo
		this.businessType = this.$route.query.businessType
		this.receipayType = this.$route.query.receipayType
		this.getArrearAmt()

		this.searchOption.data = { sourceBizNo: '', feeName: '', feeCurrency: '', bdEmployeeId: '', bdDeptName: '', finDate: '' }
		this.searchOption.addFilter.searchInputGroup =  [
			{ key: "sourceBizNo", value: "", showType: "1" },
			{ key: "feeName", value: "", showType: "2" },
			{ key: "finDate", value: "", showType: "3" },
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