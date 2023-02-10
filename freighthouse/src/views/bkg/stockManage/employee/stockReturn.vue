<template>
	<div class="finance-page">
		<FinanceSearch :searchOption="searchOption" @search="search" />
		<div class="finance-search-list-gap"></div>
		<div class="bkg-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<el-button
						v-if="false"
						class="finance-btn"
						@click="handleCustomColumns"
						size="mini"
						>自定义表头</el-button
					>
				</div>
				<div class="money-box-right">
					<el-radio-group
						v-model="verifyStatus"
						size="mini"
						@change="handleCurrentChange(1)"
					>
						<el-radio-button label>全部</el-radio-button>
						<el-radio-button label="pending">待处理</el-radio-button>
						<el-radio-button label="agreed">已处理</el-radio-button>
					</el-radio-group>
				</div>
			</div>
			<FinanceTable :option="option1" @send-multi="sendMulti" />
		</div>
		<el-dialog
			title="退舱确认"
			:visible.sync="retreatFormShow"
			width="600px"
			class="stock-return-box"
		>
			<el-form
				:model="retreatForm"
				ref="retreatForm"
				label-width="80px"
				:inline="true"
				size="mini"
				:rules="retreatFormRules"
			>
				<el-form-item label="退舱费:" prop="returnFee">
					<el-input v-model="retreatForm.returnFee" type="number"></el-input>
				</el-form-item>
				<el-form-item label="币别:" prop="returnFeeCurrency">
					<el-select
						size="mini"
						v-model="retreatForm.returnFeeCurrency"
						placeholder="请选择"
						filterable
						remote
						:remote-method="getCurrencyList"
						@visible-change="getCurrencyList('')"
					>
						<el-option
							v-for="item in currencyList"
							:key="item.code"
							:label="item.code"
							:value="item.code"
						>
						</el-option>
					</el-select>
				</el-form-item>
				<!-- <el-form-item label="SO售价:" prop="sellPrice">
					<el-input v-model="retreatForm.sellPrice" type="number"></el-input>
				</el-form-item> -->
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleSubmit" size="mini"
					>确定</el-button
				>
				<el-button @click="closeRefuse" size="mini">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="员工信息"
			:visible.sync="employDialog"
			width="600px"
			:close-on-click-modal="true"
		>
			<div class="employ-box" v-if="employeeInfo">
				<div class="base-item">
					姓名：{{ employeeInfo.cname }}({{ employeeInfo.ename }})
				</div>
				<div class="base-item">工号：{{ employeeInfo.employeeNo }}</div>
				<div class="base-item">部门：{{ employeeInfo.deptCname }}</div>
				<div class="base-item">职务：{{ employeeInfo.titleCname }}</div>
				<div class="base-item">邮箱：{{ employeeInfo.email }}</div>
				<div class="base-item">电话：{{ employeeInfo.mobileNo }}</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import Vue from 'vue'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listStockReturnAudit, retreatConfirm, cancelReturn } from '@/api/bkg/stockApply'
import { getEmployeeInfo, baseCurrencyList } from '@/api/base'
export default {
	components: {
		FinanceSearch,
		FinanceTable,
		CustomColumns,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			stockId: '',
			searchOption: {},
			option1: {},
			rightFilterBtns: [true, false, false],
			stockAllotData: {},
			retreatFormShow: false,
			retreatForm: {
				returnFee: '',
				returnFeeCurrency: '',
			},
			retreatFormRules: {
				returnFee: [
					{
						required: true,
						message: '退舱费不能为空',
						trigger: 'blur',
					},
				],
				returnFeeCurrency: [
					{
						required: true,
						message: '币别不能为空',
						trigger: 'blur',
					},
				],
			},
			verifyStatus: '',
			// 员工信息控制
			employDialog: false,
			employeeInfo: '',
			currencyList: [],
		}
	},
	created () {
		// console.log(this.$store.state.user)
		let { roles, userId } = this.$store.state.user
		let isPricing = roles.includes('pricing')
		this.searchOption = {
			addFilter: {
				defaultSearchLength: 4,
				searchInputGroup: [
					{ key: 'pol', value: '', showType: '1' },
					{ key: 'pod', value: '', showType: '2' },
					{ key: 'etdDate', value: '', showType: '3' },
					{ key: 'applierName', value: '', showType: '4' },
				],
				filterGroups: {
					pol: {
						label: '起运港',
						type: 'remoteSelect',
						showType: '1',
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						remoteSelectList: [],
					},
					pod: {
						label: '目的港',
						type: 'remoteSelect',
						showType: '2',
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						remoteSelectList: [],
					},
					etdDate: { label: 'ETD', type: 'date', showType: '3', format: 'yyyy-MM-dd' },
					applierName: { label: '业务员', type: 'input', showType: '4' }
				},
			},
		}
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			width: 120,
			data: [
				{
					label: '详情',
					show: true,
					action: 'stockApplyInfo',
				},
				{
					label: '确认',
					showFn: (row) => {
						return row['verifyStatus'] === 'pending'
					},
					action: 'stockAllot',
				},
				// {
				// 	label: '撤回',
				// 	showFn: (row) => {
				// 		return row['verifyStatus'] === 'pending' && row.createdBy == userId
				// 	},
				// 	action: 'stockAllotReturn',
				// },
			],
			fixed: 'right',
			show: true,
			callback: (action, $index, row, option) => {
				if (action === 'stockApplyInfo') {
					this.stockApplyInfo(row)
				} else if (action === 'stockAllot') {
					this.stockAllot(row)
				} else if (action === 'stockAllotReturn') {
					this.stockAllotReturn(row)
				}
			},
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			data: [],
			tips: {
				text: '',
				show: false,
			},
			selection: false,
			operationBtns,
			pagination,
		})
		let columns1 = [
			{
				prop: 'returnCode', label: '退舱编号',
			},
			{ prop: 'applyCode', label: '申请单号', width: 180 },
			{ prop: 'stockCode', label: '现舱编号' },
			{
				prop: 'polCname', label: '大船起运港', formatter: (row) => {
					return `${row.polEname}(${row.polCname})`
				}
			},
			{
				prop: 'podCname', label: '目的港', formatter: (row) => {
					return `${row.podEname}(${row.podCname})`
				}
			},
			{ prop: 'sysLineName', label: '系统航线' },
			{ prop: 'shipCarrierName', label: '船司' },
			{ prop: 'etdDate', label: 'ETD' },
			{ prop: 'cyCutOff', label: '截关时间' },
			{ prop: 'siCutOff', label: '截补料时间' },
			{ prop: 'containerType', label: '柜型' },

			// { prop: 'applyRemark', label: '申请备注' },

			{
				prop: 'verifyStatus',
				label: '审批状态',
				type: 'text',
				formatter: (row, pItem) => {
					let text = {
						pending: '未处理',
						agreed: '已处理',
					}
					let key = row[pItem.prop]
					return text[key]
				},
			},
			{ prop: 'returnNum', label: '退舱数量' },
			{ prop: 'returnRemark', label: '退舱原因' },
			{ prop: 'returnSoNos', label: '已退SO号', type: 'text', width: 130 },
			{
				prop: 'applierName', label: '申请人',
				type: "button",
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.getEmployeeInfo(row.applier)
					},
				},
			},
			{ prop: 'soNos', label: '分配SO信息', width: 130 },
			{ prop: 'returnFee', label: '退舱费' },
			{ prop: 'returnFeeCurrency', label: '币别' },
			{ prop: 'applyCount', label: '申请数量' },

		]
		this.option1.columns = columns1
		this.stockId = this.$route.query.stockId
		this.verifyStatus = this.$route.query.verifyStatus || ''
		this.getData()
	},
	methods: {
		// 搜索
		search () {
			this.getData()
		},
		// 获取数据
		getData (index) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: [],
			}
			this.searchOption.addFilter.searchInputGroup.forEach(({ key, value }) => {
				value && data.query.push({ column: key, value, type: 'eq' })
			})
			this.verifyStatus && data.query.push({ column: 'verifyStatus', value: this.verifyStatus, type: 'eq' })
			this.stockId && data.query.push({ column: 'stockId', value: this.stockId, type: 'eq' })
			listStockReturnAudit(data).then((res) => {
				let data = res.data
				this.option1.data = data.list.map(item => {
					if (item.verifyStatus === 'pending') {
						return Object.assign(item, { _isRefused: true })
					} else {
						return item
					}
				})
				this.option1.pagination.currPage = data.currPage
				this.option1.pagination.pageSize = data.pageSize
				this.option1.pagination.totalCount = data.totalCount
			})
		},
		// 分页方法
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData()
		},
		// 分页方法
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData()
		},
		// 表格选择
		sendMulti (data) {
			this.multipleSelection = data
		},
		// 表格-详情
		stockApplyInfo (row) {
			Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
				this.commonRoute(to, from)
			}
			this.routerPush('StockAllotDetail', { applyId: row.returnId, verifyStatus: row.verifyStatus, type: 'return' })
		},
		// 表格-确认
		stockAllot (row) {
			this.stockAllotData = row
			this.retreatForm.sellPrice = row.sellPrice
			this.retreatForm.returnFee = ''
			this.retreatFormShow = true
		},
		// 关闭退舱弹框
		closeRefuse () {
			this.retreatFormShow = false
		},
		// 确认退舱
		handleSubmit () {
			this.$refs['retreatForm'].validate((valid) => {
				if (valid) {
					this.stockAllotFn()
				}
			})
		},
		// 确认退舱
		stockAllotFn () {
			let { stockId, applyId, returnId, soNos } = this.stockAllotData
			let { returnFee, returnFeeCurrency } = this.retreatForm
			let returnSoList = soNos.split(',')
			let data = { stockId, applyId, returnId, returnFee, returnFeeCurrency, returnSoList }
			retreatConfirm(data).then((res) => {
				this.$msgSucClose('恭喜你，退舱确认成功！')
				this.closeRefuse()
				this.handleCurrentChange(1)
			})
		},
		// 业务员退舱撤回
		stockAllotReturn (row) {
			this.$confirmWarn('确认撤回？', () => {
				cancelReturn(row.returnId).then(() => {
					this.$msgSucClose('撤回成功！')
					this.handleCurrentChange(1)
				})
			})
		},
		// 远程搜索港口下拉数据 port_of_basic  port_of_destination
		portSearch (queryString, item, portAttribute) {
			let data = { queryString, portAttribute }
			this.$store.dispatch('dict/basePortList', data).then((data) => {
				item.remoteSelectList = data.map((item) => {
					return { label: item.value, value: item.portCode }
				})
			})
		},
		// 根据用户ID获取详细信息
		getEmployeeInfo (employeeId) {
			let data = {
				employeeId
			}
			getEmployeeInfo(data).then(res => {
				this.employeeInfo = res.data
				this.employDialog = true
			}).catch(() => { })
		},
		// 币别下拉列表自动补充的数据
		getCurrencyList (queryString) {
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.employ-box {
	display: flex;
	flex-wrap: wrap;
	.base-item {
		flex: 1;
		flex-basis: 50%;
		margin-bottom: 10px;
	}
}
</style>