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
						<el-radio-button label="unallocated">待分配</el-radio-button>
						<el-radio-button label="allocated,part_allocated"
							>已分配</el-radio-button
						>
						<el-radio-button label="refuse">已拒绝</el-radio-button>
					</el-radio-group>
				</div>
			</div>
			<FinanceTable :option="option1" @send-multi="sendMulti" />
		</div>
		<el-dialog
			title="现舱申领"
			:visible.sync="stockApplyShow"
			class="self-dialog"
			width="600px"
		>
			<el-form
				:model="form"
				ref="form"
				:inline="true"
				label-width="100px"
				size="mini"
			>
				<el-form-item label="申领柜量：" :rules="rulesMsg" prop="applyCount">
					<el-input-number
						v-model="form.applyCount"
						size="mini"
						controls-position="right"
						@change="handleChange"
						:min="1"
						:max="stockApplyDate.lastCount"
					></el-input-number>
					<span class="right-box"
						>剩余数量：{{ stockApplyDate.lastCount }}</span
					>
				</el-form-item>
				<el-form-item label="业务报价：" prop="bdQuotation">
					<el-input
						style="width: 130px"
						v-model="form.bdQuotation"
						size="mini"
						controls-position="right"
						:min="1"
						:max="stockApplyDate.lastCount"
						v-lsNumber="{
							value: 'number',
							obj: form,
							key: 'bdQuotation',
							positive: true,
						}"
						@change="handleChange"
					></el-input>
				</el-form-item>
				<el-form-item label="申领备注：" prop="applyRemark" :rules="rulesMsg">
					<el-input
						type="textarea"
						placeholder="请输入内容"
						v-model.trim="form.applyRemark"
						maxlength="100"
						show-word-limit
					></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitApply" size="mini"
					>确认</el-button
				>
				<el-button size="mini" @click="closeDialog">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog
			title="现舱退费"
			:visible.sync="allotOpen"
			class="self-dialog"
			width="1000px"
		>
			<div class="stock-apply-cnt">
				<div class="allot-msg">退舱费说明：{{ returnRemark }}</div>
				<FinanceTable :option="option2" @send-multi="sendMulti" />
				<div class="remarks-box">
					<span>退舱备注：</span>
					<div class="textarea-box">
						<el-input
							type="textarea"
							placeholder="请输入内容"
							v-model.trim="remarks"
							maxlength="100"
							show-word-limit
							:rules="{
								required: true,
								message: '退舱备注不能为空',
								trigger: 'blur',
							}"
						></el-input>
					</div>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitAllot" size="mini"
					>确认退回</el-button
				>
				<el-button size="mini" @click="closeAllot">取消</el-button>
			</span>
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
import { listStockApply, deleteApply, returnSo, retreat, updateApplyCount } from '@/api/bkg/stockApply'
export default {
	components: {
		FinanceSearch,
		FinanceTable,
		CustomColumns,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			searchOption: {},
			rightFilterBtns: [true, false, false, false, false],
			option1: {},
			option2: {},
			customColumnsPopShow: false,
			stockApplyDate: {},
			stockApplyShow: false,
			applyNum: '',
			applyReason: '',
			allotOpen: false,
			allotDate: {},
			returnRemark: '',
			remarks: '',
			multipleSelection: [],
			form: {
				applyCount: 0,
				applyRemark: '',
				bdQuotation: '',
			},
			rulesMsg: [{ required: true, message: ' ', trigger: 'change' }],
			verifyStatus: '',
		}
	},
	created () {
		this.searchOption = {
			addFilter: {
				defaultSearchLength: 3,
				searchInputGroup: [
					{ key: 'pol', value: '', showType: '1' },
					{ key: 'pod', value: '', showType: '2' },
					{ key: 'etdDate', value: '', showType: '3' },
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
					label: '修改',
					showFn: (row) => {
						return ['unallocated', 'refuse'].includes(row['verifyStatus'])
					},
					action: 'stockApply',
				},
				{
					label: '撤回',
					showFn: (row) => {
						return row['verifyStatus'] === 'unallocated'
					},
					action: 'stockReject',
				},
				{
					label: '退舱',
					showFn: (row) => {
						return row['verifyStatus'] === 'allocated' || row['verifyStatus'] === 'part_allocated'
					},
					action: 'stockAllot',
				},
			],
			fixed: 'right',
			show: true,
			callback: (action, $index, row, option) => {
				if (action === 'stockApply') {
					this.stockApply(row)
				} else if (action === 'stockApplyInfo') {
					this.stockApplyInfo(row)
				} else if (action === 'stockAllot') {
					this.stockAllot(row)
				} else if (action === 'stockReject') {
					this.stockReject(row)
				}
			},
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			data: [],
			tips: { text: '', show: false },
			selection: false,
			operationBtns,
			pagination,
		})
		let columns1 = [
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
			{ prop: 'applyCount', label: '申请数量' },
			{ prop: 'distributeNum', label: '分配柜量数' },
			{ prop: 'cyCutOff', label: '截关时间' },
			{ prop: 'siCutOff', label: '截补料时间' },
			{ prop: 'containerType', label: '柜型' },
			// { prop: 'containerNum', label: '柜量总数' },
			// { prop: 'lastCount', label: '剩余可用数' },
			{ prop: 'sellPrice', label: '售价' },
			{ prop: 'applierName', label: '申请人' },
			{ prop: 'applyRemark', label: '申请备注' },
			{ prop: 'soNos', label: '分配SO信息', width: 130 },
			{
				prop: 'verifyStatus',
				label: '审批状态',
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
			// {
			// 	prop: "returnNum",
			// 	label: "退舱数量",
			// 	type: "text",
			// },
			// {
			// 	prop: "returnSoNos",
			// 	label: "退舱SO信息",
			// 	type: "text",
			// },
			// {
			// 	prop: "cancelRemark",
			// 	label: "退舱原因",
			// 	type: "text",
			// },
			// {
			// 	prop: "returnFee",
			// 	label: "退舱费",
			// 	type: "text",
			// },
			{ prop: 'createdName', label: '创建人' },
			{ prop: 'createdTime', label: '创建时间' },
			{ prop: 'freetimeRemark', label: 'Freetime说明' },
			{ prop: 'cancelRemark', label: '退舱费说明' },
			// { prop: 'applyRemark', label: '备注' },
		]
		this.option1.columns = columns1
		this.option2 = Object.assign({}, this.option, {
			id: 'option2',
			data: [],
			tips: false,
			pagination: false,
			operationBtns: false,
		})
		let columns2 = [
			{ prop: 'so', label: 'SO号' },
			{ prop: 'containerType', label: '柜型' },
			{ prop: 'containerNum', label: '柜量' },
			{ prop: 'remark', label: '现舱备注' },
			{ prop: 'sellPrice', label: '售价' },
			{ prop: 'currencyCode', label: '币别' },
		]
		this.option2.columns = columns2
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
			if (this.verifyStatus) {
				if (this.verifyStatus === 'allocated,part_allocated') {
					data.query.push({ column: 'verifyStatus', value: this.verifyStatus, type: 'in' })
				} else {
					data.query.push({ column: 'verifyStatus', value: this.verifyStatus, type: 'eq' })
				}
			}
			listStockApply(data).then((res) => {
				let data = res.data
				this.option1.data = data.list
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
		// 表格-详情方法回调
		stockApplyInfo (row) {
			Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
				this.commonRoute(to, from)
			}
			this.routerPush('StockApplyDetail', { applyId: row.applyId, verifyStatus: row.verifyStatus })
		},
		// 表格-修改回调
		stockApply (row) {
			this.stockApplyDate = row
			this.form.applyCount = row.applyCount
			this.form.applyRemark = row.applyRemark
			this.stockApplyShow = true
		},
		// 申请数量
		handleChange () { },
		// 提交申请
		submitApply () {
			this.$refs.form.validate((v) => {
				if (!v) return
				updateApplyCount({ applyId: this.stockApplyDate.applyId, ...this.form }).then((res) => {
					this.$msgSucClose(` 恭喜你，修改成功！`)
					this.getData()
					this.closeDialog()
				})
			})
		},
		// 关闭弹窗
		closeDialog () {
			this.stockApplyShow = false
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
		// 表格-撤回
		stockReject (row) {
			this.$confirmWarn('是否确认撤回该舱位申领？', () => {
				this.stockRejectFn(row)
			})
		},
		// 撤回申
		stockRejectFn (row) {
			deleteApply(row.applyId).then((res) => {
				this.$msgSucClose('恭喜你，撤回申领成功！')
				this.getData()
			})
		},
		// 表格-退舱
		stockAllot (row) {
			this.allotDate = row
			let { sysLineCode, shipCarrierCode, pod, applyId } = row
			let data = {
				sysLineCode,
				shipCarrierCode,
				podCode: 'PYTER', // pod, // 'PYTER'
				applyId,
			}
			returnSo(data).then((res) => {
				this.returnRemark = res.data.returnRemark
				this.option2.data = res.data.applySos.map((item) => {
					return { ...item, _disabled: item.status !== 'not_use' }
				})
				this.allotOpen = true
			})
		},
		// 提交退舱
		submitAllot () {
			let len = this.multipleSelection.length
			if (!len) {
				return this.$msgErrClose('请勾选需要退舱的数据')
			}
			let remarks = this.remarks.trim()
			if (!remarks.length) {
				return this.$msgErrClose('请填写退舱备注')
			}
			this.stockAllotFn()
		},
		// 关闭现舱退费
		closeAllot () {
			this.allotOpen = false
			this.remarks = ''
		},
		// 退舱
		stockAllotFn () {
			let { applyId, stockId } = this.allotDate
			let returnRemark = this.remarks
			let soNos = this.multipleSelection.map((item) => {
				return item.so
			})
			let data = { applyId, stockId, returnRemark, soNos }
			retreat(data).then((res) => {
				this.$msgSucClose('恭喜你，申请退舱成功！')
				this.allotOpen = false
				this.getData()
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.finance-page .self-dialog {
	.el-form-item {
		display: flex;
		::v-deep .el-form-item__content {
			flex: 1 1 auto;
			input {
				line-height: 26px !important;
				height: 26px !important;
			}
		}
	}
	.right-box {
		float: right;
	}
	::v-deep textarea {
		min-height: 40px !important;
	}
}
.app-wrapper ::v-deep .finance-page {
	.input .el-input__inner {
		height: 28px !important;
	}
}
.stock-apply-cnt {
	font-size: 12px;
	/deep/ .finance-el-table {
		padding: 8px 0;
	}
	.apply-num-box {
		display: flex;
		line-height: 28px;
		.left-box,
		.right-box {
			flex: 1;
		}
		.left-box {
			span {
				color: red;
			}
		}
		.right-box {
			text-align: right;
		}
	}
	.apply-reason {
		margin-top: 20px;
		vertical-align: top;
		display: flex;
		.textarea-box {
			display: inline-block;
			width: 500px;
		}
	}
}
.remarks-box {
	display: flex;
	margin-top: 10px;
	.textarea-box {
		flex: 1;
	}
}
</style>
