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
					<el-button-group>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(0)"
							size="mini"
							:class="rightFilterBtns[0] ? 'right-filter-btns-effect' : ''"
							>全部</el-button
						>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(1)"
							size="mini"
							:class="rightFilterBtns[1] ? 'right-filter-btns-effect' : ''"
							>待分配</el-button
						>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(2)"
							size="mini"
							:class="rightFilterBtns[2] ? 'right-filter-btns-effect' : ''"
							>已分配</el-button
						>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(3)"
							size="mini"
							:class="rightFilterBtns[3] ? 'right-filter-btns-effect' : ''"
							>已拒绝</el-button
						>
					</el-button-group>
				</div>
			</div>
			<FinanceTable :option="option1" @send-multi="sendMulti" />
		</div>
		<el-dialog
			title="申领拒绝"
			:visible.sync="refuseOpen"
			width="600px"
			class="stock-manage-refuse"
		>
			<el-form :model="refuseForm" ref="refuseForm" label-width="80px">
				<el-form-item
					label="拒绝原因："
					prop="refuseReason"
					:rules="{
						required: true,
						message: '拒绝原因不能为空',
						trigger: 'blur',
					}"
				>
					<el-input
						type="textarea"
						placeholder
						:maxlength="500"
						:autosize="{ minRows: 4, maxRows: 6 }"
						show-word-limit
						v-model="refuseForm.refuseReason"
					></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleSubmit" size="mini"
					>确定</el-button
				>
				<el-button @click="closeRefuse" size="mini">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="现舱分配"
			:visible.sync="allotOpen"
			class="self-dialog"
			width="1000px"
		>
			<div class="allot-cnt">
				<FinanceTable :option="option2" @send-multi="sendMulti" />
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitAllot" size="mini"
					>分配</el-button
				>
				<el-button size="mini" @click="closeAllot">取消</el-button>
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
				<div class="base-item">职务：{{ employeeInfo.titleCode }}</div>
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
import { listStockApplyAudit, refuse, listStockSoByStockId, allocate } from '@/api/bkg/stockApply'
import { getEmployeeInfo } from '@/api/base'
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
			verifyStatus: '',
			searchOption: {},
			rightFilterBtns: [true, false, false, false],
			option1: {},
			option2: {},
			customColumnsPopShow: false,
			refuseData: {},
			refuseOpen: false,
			refuseForm: {
				refuseReason: '',
			},
			allotOpen: false,
			allotData: {},
			multipleSelection: [],
			// 员工信息控制
			employDialog: false,
			employeeInfo: '',
		}
	},
	created () {
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
			width: '120px',
			data: [
				{
					label: '详情',
					type: 'text',
					show: true,
					action: 'stockApplyInfo',
				},
				{
					label: '分配',
					type: 'text',
					// show: true,
					showFn: (row) => {
						return row.verifyStatus === 'unallocated'
					},
					action: 'stockAllot',
				},
				{
					label: '拒绝',
					type: 'text',
					// show: true,
					showFn: (row) => {
						return row.verifyStatus === 'unallocated'
					},
					action: 'stockReject',
				},
			],
			fixed: 'right',
			show: true,
			callback: (action, $index, row, option) => {
				if (action === 'stockApplyInfo') {
					this.stockApplyInfo(row)
				} else if (action === 'stockAllot') {
					this.stockAllot(row)
				} else if (action === 'stockReject') {
					this.stockReject(row)
				}
			},
		})
		let pagination1 = Object.assign({}, this.option.pagination, {
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
			pagination: pagination1,
		})
		let columns = [
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
			{ prop: 'shipCarrierCode', label: '船司' },
			{ prop: 'etdDate', label: 'ETD' },
			{ prop: 'cyCutOff', label: '截关时间' },
			{ prop: 'siCutOff', label: '截补料时间' },
			{ prop: 'containerType', label: '柜型' },
			{ prop: 'containerNum', label: '柜量总数' },
			{ prop: 'lastCount', label: '剩余可用数' },
			{ prop: 'sellPrice', label: '售价' },
			{ prop: 'currencyCode', label: '币别' },
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
			{ prop: 'applyRemark', label: '申请备注' },
			{ prop: 'applyCount', label: '申请数量' },
			{ prop: 'distributeNum', label: '分配柜量数' },
			{ prop: 'soNos', label: '分配SO信息', width: 130 },
			{
				prop: 'verifyStatus',
				label: '审批状态',
				type: 'text',
				formatter: (row, pItem) => {
					let text = {
						unallocated: '未处理',
						allocated: '已分配',
						refuse: '已拒绝',
						part_allocated: '部分分配'
					}
					let key = row[pItem.prop]
					return text[key]
				},
			},
			{ prop: 'refuseReason', label: '拒绝原因' },
			{ prop: 'createdName', label: '创建人' },
			{ prop: 'createdTime', label: '创建时间' },
		]
		this.option1.columns = columns
		this.option2 = Object.assign({}, this.option, {
			id: 'option2',
			tips: { text: '', show: false },
			operationBtns: false,
			pagination: false,
		})
		let columns2 = [
			{ prop: 'so', label: 'SO号' },
			{ prop: 'containerType', label: '柜型' },
			{ prop: 'containerNum', label: '柜量' },
			{
				prop: 'status',
				label: 'SO状态',
				type: 'text',
				formatter: (row) => {
					return row['status'] === 'unallocated' ? '未分配' : '已分配'
				},
			},
			{ prop: 'remark', label: '现舱备注' },
			{ prop: 'currencyCode', label: '币别' },
			// {
			// 	prop: "costPrice",
			// 	label: "售价",
			// 	type: "text",
			// },
			{ prop: 'costPrice', label: '成本价' },
		]
		this.option2.columns = columns2
		this.stockId = this.$route.query.stockId
		this.verifyStatus = this.$route.query.verifyStatus || ''
		if (this.verifyStatus) {
			let status = ['', 'unallocated', 'allocated', 'refuse']
			let index = status.indexOf(this.verifyStatus)
			this.rightFilterBtns = [false, false, false, false]
			this.$set(this.rightFilterBtns, index, true)
		}
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
			this.searchOption.addFilter.searchInputGroup.forEach((item) => {
				let { key, value } = item
				if (value) {
					data.query.push({ column: key, value: value, type: 'eq' })
				}
			})
      // 现舱发布跳转过来带搜索条件
      if (!index && index !== 0 && this.verifyStatus) {
        let status = ['', 'unallocated', 'allocated', 'refuse']
			  index = status.indexOf(this.verifyStatus)
      }
			if (index) {
				let status = ['', 'unallocated', 'allocated', 'refuse']
				let verifyStatus = status[index]
				data.query.push({ column: 'verifyStatus', value: verifyStatus, type: 'eq' })
			}
			if (this.stockId) {
				data.query.push({ column: 'stockId', value: this.stockId, type: 'eq' })
			}
			listStockApplyAudit(data)
				.then((res) => {
					let data = res.data
					this.option1.data = data.list.map(item => {
						if (item.verifyStatus === 'unallocated') {
							return Object.assign(item, { _isRefused: true })
						} else {
							return item
						}
					})
					this.option1.pagination.currPage = data.currPage
					this.option1.pagination.pageSize = data.pageSize
					this.option1.pagination.totalCount = data.totalCount
				})
				.catch(() => { })
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
		// 自定义表头
		handleCustomColumns () { },
		// 右边筛选操作
		rightFilterAction (index) {
			this.getData(index)
			this.rightFilterBtns = [false, false, false, false]
			this.$set(this.rightFilterBtns, index, true)
		},
		// 表格-详情方法回调
		stockApplyInfo (row) {
			Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
				this.commonRoute(to, from)
			}
			this.routerPush('StockAllotDetail', { applyId: row.applyId, verifyStatus: row.verifyStatus })
		},
		// 表格-拒绝方法回调
		stockReject (row) {
			this.$confirm('是否确认要拒绝该申领？', '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.refuseData = row
					// 打开拒绝弹窗
					this.refuseOpen = true
				})
				.catch(() => { })
		},
		// 关闭拒绝弹窗
		closeRefuse () {
			this.refuseOpen = false
			this.refuseForm.refuseReason = ''
		},
		// 分配拒绝验证
		handleSubmit () {
			this.$refs['refuseForm'].validate((valid) => {
				if (valid) {
					this.stockRefuseFn()
				}
			})
		},
		// 拒绝分配确认
		stockRefuseFn () {
			let data = {
				applyId: this.refuseData.applyId,
				refuseReason: this.refuseForm.refuseReason,
			}
			refuse(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: '恭喜你，拒绝分配成功！',
							type: 'success',
						})
						this.closeRefuse()
						this.getData()
					}
				})
				.catch(() => {
					this.$message({
						message: '对不起，拒绝分配失败！',
						type: 'success',
					})
				})
		},
		// 表格-分配方法回调
		stockAllot (row) {
			this.allotData = row
			this.listStockSoByStockId(row)
		},
		// 获取现舱分舱so列表
		listStockSoByStockId (row) {
			let data = row.stockId
			listStockSoByStockId(data)
				.then((res) => {
					this.option2.data = res.data
					this.allotOpen = true
				})
				.catch(() => { })
		},
		// 分配成功
		submitAllot () {
			let len = this.multipleSelection.length
			if (!len) {
				return this.$message({
					message: '请勾选现舱分配的数据',
					type: 'error',
				})
			}
			this.$confirm('是否确认要分配？', '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					this.stockAllotFn()
				})
				.catch(() => { })
		},
		// 现舱分配
		stockAllotFn () {
			let soNos = this.multipleSelection.map((item) => {
				return item.so
			})
			let data = {
				applyId: this.allotData.applyId,
				soNos,
			}
			allocate(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							message: '恭喜你，现舱分配成功',
							type: 'success',
						})
					}
					this.allotOpen = false
					this.getData()
				})
				.catch(() => { })
		},
		// 关闭申领弹窗
		closeAllot () {
			this.allotOpen = false
		},
		// 表格选择操作
		sendMulti (data) {
			this.multipleSelection = data
		},
		// 远程搜索港口下拉数据 port_of_basic  port_of_destination
		portSearch (queryString, item, port) {
			let data = {
				queryString,
				portAttribute: port,
			}
			this.$store.dispatch('dict/basePortList', data).then((data) => {
				item.remoteSelectList = data.map((item) => {
					return {
						label: item.value,
						value: item.portCode,
					}
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
	},
}
</script>

<style lang="scss" scoped>
.app-wrapper ::v-deep .finance-page {
	textarea {
		height: auto !important;
		min-height: auto !important;
	}
}
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
