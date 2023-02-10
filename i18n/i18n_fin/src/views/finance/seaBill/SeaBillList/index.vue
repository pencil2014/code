<template>
	<div class="finance-page">
		<FinanceSearch :searchOption="searchOption" @search="search" />
		<div class="finance-search-list-gap"></div>
		<div class="finance-seabill-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<el-button-group>
						<el-button class="finance-btn" size="mini" @click="sendBdConfirm"
							>发送商务确认</el-button
						>
					</el-button-group>
					<el-button-group>
						<el-button
							class="finance-btn"
							@click="dialogOrderShow = true"
							size="mini"
							>导入账单</el-button
						>
					</el-button-group>
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
							>待确认</el-button
						>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(2)"
							size="mini"
							:class="rightFilterBtns[2] ? 'right-filter-btns-effect' : ''"
							>已通过</el-button
						>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(3)"
							size="mini"
							:class="rightFilterBtns[3] ? 'right-filter-btns-effect' : ''"
							>未通过</el-button
						>
					</el-button-group>
				</div>
			</div>
			<FinanceTable :option="option1" @send-multi="sendMulti" />
		</div>
		<el-dialog
			title="导入账单"
			:visible.sync="dialogOrderShow"
			class="self-dialog"
			width="1000px"
		>
			<div class="order-import-cnt">
				<el-form
					ref="orderImportForm"
					:model="orderImportForm"
					:inline="true"
					label-width="90px"
					size="mini"
					:rules="orderImportRegRules"
				>
					<el-form-item label="账单类型:" prop="shBillType">
						<el-select
							v-model="orderImportForm.shBillType"
							:placeholder="$t('Common.plSelect')"
						>
							<el-option
								v-for="(op, i) in dictMap['shBillType']"
								:key="'shBillType' + i"
								:label="op.label"
								:value="op.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="收到账单时间:" prop="billDate">
						<el-date-picker
							v-model="orderImportForm.billDate"
							type="date"
							value-format="yyyy-MM-dd"
							:placeholder="$t('Common.plSelect')"
						>
						</el-date-picker>
					</el-form-item>
					<el-form-item label="单号类型:" prop="bizNoType">
						<el-select
							v-model="orderImportForm.bizNoType"
							:placeholder="$t('Common.plSelect')"
							@change="searchOrderInfo"
						>
							<el-option
								v-for="(op, j) in dictMap['shBillBizNoType']"
								:key="'shBillBizNoType' + j"
								:label="op.label"
								:value="op.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="最晚确认时间:" prop="checkBfDate">
						<el-date-picker
							v-model="orderImportForm.checkBfDate"
							type="date"
							value-format="yyyy-MM-dd"
							:placeholder="$t('Common.plSelect')"
						>
						</el-date-picker>
					</el-form-item>
					<el-form-item label="账单SO:" prop="bizNo">
						<el-input
							v-model="orderImportForm.bizNo"
							@blur="searchOrderInfo"
						></el-input>
					</el-form-item>
					<el-form-item label="工作单号:" prop="orderNo">
						<el-select
							v-model="orderImportForm.orderNo"
							:placeholder="$t('Common.plSelect')"
							@change="changeOrderNo"
						>
							<el-option
								v-for="(op, i) in orderNoArr"
								:key="'orderNo' + i"
								:label="op.orderNo"
								:value="op.orderNo"
							></el-option>
						</el-select>
						<!-- <el-input v-model="orderImportForm.bizNo"></el-input> -->
					</el-form-item>
					<el-form-item label="结算单位:" prop="settleCorpName">
						<el-input
							v-model="orderImportForm.settleCorpName"
							disabled
						></el-input>
					</el-form-item>
					<el-form-item label="系统SO:" prop="soNos">
						<el-select
							v-model="orderImportForm.soNos"
							multiple
							collapse-tags
							:placeholder="$t('Common.plSelect')"
						>
							<el-option
								v-for="(op, j) in orderImportForm.soNoList"
								:key="'soNos' + j"
								:label="op"
								:value="op"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="船名船次:" prop="voyage">
						<el-input v-model="orderImportForm.voyage" disabled></el-input>
					</el-form-item>
					<el-form-item label="起运/目的港:" prop="podName">
						<el-input v-model="orderImportForm.podName" disabled></el-input>
					</el-form-item>
					<el-form-item
						label="附件:"
						prop="fileNo"
						class="invoice-payment-add-form-upload"
						style="position: relative"
					>
						<el-input
							v-model="orderImportForm.fileNo"
							style="
								position: absolute;
								right: 0;
								top: 0;
								width: 1px;
								height: 1px;
								opacity: 0;
							"
						></el-input>
						<FinanceUploadEmbed
							v-if="dialogOrderShow"
							:upload-api="uploadApi"
							:upload-params="uploadParams"
							:file-list-edit="fileListEdit"
							:limit="1"
							@send-res-file-list="sendResFileList"
						/>
					</el-form-item>
				</el-form>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitOrder" size="mini"
					>{{$t('Common.submit')}}</el-button
				>
				<el-button size="mini" @click="closeDialog">{{$t('Common.cancel')}}</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import FinanceSearch from "@/views/finance/components/financeSearch/financeSearch"
import FinanceTable from "@/views/finance/components/financeTable/financeTable"
import FinanceUploadEmbed from "@/views/finance/components/financeUpload/financeUploadEmbed"
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import { mapGetters } from "vuex"
import { listPage, saveOrUpdate, orderInfo, sendConfirm } from '@/api/fin/shBill'
import { employeeSelectlist } from '@/api/companyResource'
import { dateFormat } from '@/views/finance/utils/finance'
export default {
	components: {
		FinanceSearch,
		FinanceTable,
		FinanceUploadEmbed,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			searchOption: {},
			selectedOptionItem: '',
			rightFilterBtns: [true, false, false, false],
			option1: {},
			multipleSelection: [],
			dialogOrderShow: false,
			orderImportForm: {
				shBillType: "",
				bizNoType: "",
				bizNo: "",
				billDate: "",
				checkBfDate: "",
				settleCorpCode: "",
				settleCorpName: "",
				orderNo: "",
				soNos: "",
				carrierLineName: "",
				polPortName: "",
				podPortName: '',
				podName: '',
				vessel: '',
				voyage: '',
				fileNo: '',
				fileName: '',
				soNoList: [],
			},
			orderImportRegRules: {
				shBillType: [
					{
						required: true,
						message: "账单类型不能为空",
						trigger: "change",
					},
				],
				bizNoType: [
					{
						required: true,
						message: "单号类型不能为空",
						trigger: "change",
					},
				],
				checkBfDate: [
					{
						required: true,
						message: "最晚确认时间不能为空",
						trigger: "change",
					},
				],
				orderNo: [
					{
						required: true,
						message: "账单SO不能为空",
						trigger: "change",
					},
				],
				fileNo: [
					{
						required: true,
						message: "账单附件不能为空",
						trigger: "change",
					},
				],
			},
			uploadApi: "/base/webapi/file/upload",
			uploadParams: {},
			fileListEdit: [],
			orderNoArr: [],
		};
	},
	computed: {
		...mapGetters(["dictMap"]),
	},
	created () {
		this.searchOption = {
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					{
						key: "shBillNo",
						value: "",
						showType: "1",
					},
					{
						key: "bizNoType",
						value: "",
						showType: "2",
					},
					{
						key: "settleCorpCode",
						value: "",
						showType: "3",
					},
					{
						key: "carrierLineName",
						value: "",
						showType: "4",
					},
					{
						key: "sendStatus",
						value: "",
						showType: "5",
					},
					{
						key: "billDate",
						value: "",
						showType: "6",
					},
				],
				filterGroups: {
					shBillNo: {
						label: "账单确认编号",
						type: "input",
						showType: "1",
					},
					orderNo: {
						label: "工作单号",
						type: "input",
						showType: "1",
					},
					bizNo: {
						label: "单号",
						type: "input",
						showType: "1",
					},
					bdEmplNo: {
						label: "工号",
						type: "input",
						showType: "1",
					},
					bizNoType: {
						label: "单号类型",
						type: "select",
						showType: "2",
						prop: 'shBillBizNoType',
						//表格里面用 propInDict: 'sh_bill_biz_no_type',
					},
					shBillType: {
						label: "账单类型",
						type: "select",
						showType: "2",
						prop: 'shBillType'
					},
					settleCorpCode: {
						label: "结算单位",
						type: "autocomplete",
						showType: "3",
						querySearch: (queryString, cb) => {
							this.selectedOptionItem = "";
							this.querySettleUnit(queryString, cb);
						},
						select: (optionItem, row) => {
							this.selectedOptionItem = optionItem;
							row.valueReq = "settleCorpCode";
							row.settleCorpCode = optionItem.key;
						},
						change: (val, row) => {
							// 延时150ms获取select中的改变
							setTimeout(() => {
								if (this.selectedOptionItem === "") {
									row.valueReq = "";
									return;
								}
							}, 150);
						},
					},
					carrierLineName: {
						label: "航线",
						type: "remoteSelect",
						showType: "4",
						remoteMethod: (val, item) => {
							this.sysLineQuerySearch(val, item)
						},
						visibleChange: (val, item) => {
							this.sysLineQuerySearch(val, item)
						},
						remoteSelectList: []
					},
					polPortName: {
						label: "起运港",
						type: "remoteSelect",
						showType: "4",
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_basic')
						},
						remoteSelectList: []
					},
					podPortName: {
						label: "目的港",
						type: "remoteSelect",
						showType: "4",
						remoteMethod: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						visibleChange: (val, item) => {
							this.portSearch(val, item, 'port_of_destination')
						},
						remoteSelectList: []
					},
					vessel: {
						label: "船名",
						type: "remoteSelect",
						showType: "4",
						remoteMethod: (queryString, item, row) => {
							this.querySearchVessel(queryString, item)
						},
						visibleChange: (queryString, item, row) => {
							this.querySearchVessel(queryString, item)
						},
						remoteSelectList: []
					},
					voyage: {
						label: "船次",
						type: "remoteSelect",
						showType: "4",
						remoteMethod: (queryString, item, row) => {
							this.querySearchVoyage(queryString, item)
						},
						visibleChange: (queryString, item, row) => {
							this.querySearchVoyage(queryString, item)
						},
						remoteSelectList: []
					},
					sendStatus: {
						label: "是否发送商务",
						type: "select",
						showType: "5",
						selectOptions: [{ label: this.$t('Common.yes'), value: 'yes' }, { label: this.$t('Common.no'), value: 'no' }]
					},
					employeeName: {
						label: "商务",
						type: "remoteSelect",
						showType: "5",
						remoteMethod: (queryString, item, row) => {
							this.getEmployeeList(queryString, item)
						},
						visibleChange: (queryString, item, row) => {
							this.getEmployeeList(queryString, item)
						},
						remoteSelectList: []
					},
					billDate: {
						label: "收到账单时间",
						type: "daterange",
						showType: "6",
					},
					checkBfDate: {
						label: "最晚确认时间",
						type: "daterange",
						showType: "6",
					},
					createdTime: {
						label: "创建时间",
						type: "daterange",
						showType: "6",
					},
					bdConfirmTime: {
						label: "确认时间",
						type: "daterange",
						showType: "6",
					},
				},
			},
		};
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			data: [
				{
					label: "修改",
					type: "text",
					showFn: (row) => ['pending', 'refuse'].includes(row.confirmStatus), //待确认和不通过可以修改
					action: "Edit",
				},
			],
		});
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
		});
		this.option1 = Object.assign({}, this.option, {
			id: "option1", $name: 'seaBillList',
			data: [],
			tips: {
				text: "",
				show: false,
			},
			operationBtns,
			pagination,
		});
		let columns = [
			{
				prop: "shBillNo",
				label: "账单确认编号",
				type: "text",
			},
			{
				prop: "shBillType",
				label: "账单类型",
				type: "text",
				formatter: (row, pItem) => {
					return row[pItem.prop] === 'main' ? '大船' : '驳船'
				}
			},
			{
				prop: "settleCorpName",
				label: "结算单位",
				type: "text",
			},
			{
				prop: "orderNo",
				label: "工作单号",
				type: "button",
				width: 125,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option, subItem) => {
						this.showOrderDetail(row)
					},
				},
			},
			{
				prop: "bizNo",
				label: "单号",
				type: 'tooltip',
			},
			{
				prop: "bizNoType",
				label: "单号类型",
				type: "text",
				formatter: (row, pItem) => {
					return row[pItem.prop] === 'bl_no' ? '提单号' : 'SO号'
				}
			},
			{
				prop: "sysLineName",
				label: "航线",
				type: "text",
			},
			{
				prop: "shBillId",
				label: "账单",
				type: "button",
				operationBtns: {
					show: true,
					callback: (action, $index, row, option) => {
						// 下载账单
						if (action === 'downloadFile' && row.fileNo) {
							let { fileName, fileNo } = row
							this.$store.dispatch('finance/downloadBlobFile', {
								uri: '/base/webapi/file/download',
								params: {
									fileNo
								}
							}).then(res => {
								let link = document.createElement("a")
								link.href = window.URL.createObjectURL(res)
								link.download = fileName || '账单下载'
								link.click()
							})
						}
					},
					data: [
						{
							label: '下载',
							type: 'text',
							show: true,
							action: 'downloadFile'
						}
					]
				},
			},
			{
				prop: "employeeName",
				label: "商务",
				type: "text",
			},
			{
				prop: "employeeId",
				label: "工号",
				type: "text",
			},
			{
				prop: "checkBfDate",
				label: "最晚确认时间",
				type: "text",
			},
			{
				prop: "sendStatus",
				label: "是否发送商务",
				type: "text",
				formatter: (row, pItem) => {
					let text = row[pItem.prop] === 'yes' ? this.$t('Common.yes') : this.$t('Common.no')
					return text
				}
			},
			{
				prop: "confirmStatus",
				label: "确认状态",
				type: "text",
				formatter: (row, pItem) => {
					let text = {
						'cancel': '已取消',
						'pending': '待确认',
						'pass': '已通过',
						'refuse': '未通过'
					}
					let key = row[pItem.prop]
					return text[key] || '--'
				}
			},
			{
				prop: "rejectReason",
				label: "失败原因",
				type: "tooltip",
			},
			{
				prop: "billDate",
				label: "收到账单时间",
				type: "text",
			},
			{
				prop: "polPortName",
				label: "起运港",
				type: "text",
			},
			{
				prop: "podPortName",
				label: "目的港",
				type: "text",
			},
			{
				prop: "vessel",
				label: "船名",
				type: "text",
			},
			{
				prop: "voyage",
				label: "船次",
				type: "text",
			},
			{
				prop: "confirmName",
				label: "确认人",
				type: "text",
			},
			{
				prop: "confirmTime",
				label: "确认时间",
				type: "text",
			},
		];
		this.option1.columns = columns
		/*获取列表数据*/
		this.getData()
	},
	methods: {
		/*搜索方法*/
		search () {
			this.getData(true)
			this.rightFilterBtns = [false, false, false, false, false]
			this.$set(this.rightFilterBtns, 0, true)
		},
		// 获取数据列表
		getData (isSearch, index) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				columns: [],
				query: []
			}
			this.searchOption.addFilter.searchInputGroup.forEach(item => {
				let { key, value, range, req, valueReq } = item
				if (range && (range.min || range.max)) {
					if (range.min) {
						data.query.push({
							column: key + 'Min',
							type: 'eq',
							value: range.min,
						})
					}
					if (range.max) {
						data.query.push({
							column: key + 'Max',
							type: 'eq',
							value: range.max,
						})
					}
					return
				}
				if (valueReq && item[valueReq]) {
					data.query.push({
						column: valueReq,
						type: 'eq',
						value: item[valueReq],
					})
					return
				}
				if (value) {
					if (value instanceof Array) {
						if (key === 'billDate' || key === 'checkBfDate' || key === 'createdTime' || key === 'bdConfirmTime') {
							data.query.push({
								column: key + 'Start',
								type: 'eq',
								value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
							})
							data.query.push({
								column: key + 'End',
								type: 'eq',
								value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
							})
						}
					} else {
						data.query.push({
							column: key,
							value: value,
							type: 'default'
						})
					}
				}
			})
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			if (index) {
				let confirmStatus = ['', 'pending', 'pass', 'refuse']
				data.query.push({
					column: 'confirmStatus',
					value: confirmStatus[index],
					type: 'default'
				})
			}
			listPage(data).then((res) => {
				this.option1.data = res.data.list
				this.option1.pagination.currPage = res.data.currPage
				this.option1.pagination.pageSize = res.data.pageSize
				this.option1.pagination.totalCount = res.data.totalCount
			}).catch(err => {
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
		// 商务下拉框
		getEmployeeList (queryString, item) {
			employeeSelectlist({ name: queryString }).then((res) => {
        if (this.remoteSelectCommon(item, data.map(item=>({label:item.cname,value:item.employeeId})))) return
				item.remoteSelectList = res.data.map(item => {
					return {
						label: item.cname,
						value: item.employeeId
					}
				})
			})
		},
		// 远程搜索港口下拉数据
		portSearch (queryString, item, port) {
			let data = {
				queryString,
				portAttribute: port
			}
			this.$store.dispatch('dict/basePortList', data).then(data => {
        if (this.remoteSelectCommon(item, data.map(item=>({label:item.value,value:item.portId})))) return
				item.remoteSelectList = data.map(item => {
					return {
						label: item.value,
						value: item.portId
					}
				})
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch (queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
        if (this.remoteSelectCommon(item, data.map(item=>({label:item.value,value:item.key})))) return
				item.remoteSelectList = data.map(item => {
					return {
						label: item.value,
						value: item.key
					}
				})
			})
		},
		// 跳转订单详情
		showOrderDetail (row) {
			let orderNo = row.orderNo
			this.showOneNoDetail('order', orderNo)
		},
		// 右边筛选操作
		rightFilterAction (index) {
			this.getData(true, index)
			this.rightFilterBtns = [false, false, false, false, false]
			this.$set(this.rightFilterBtns, index, true)
		},
		// 选择列表
		sendMulti (data) {
			this.multipleSelection = data
		},
		// 显示提示框
		showColumnDetail (params) {
			this.showColumnDetailHandle(params)
		},
		// 发送商务确认
		sendBdConfirm () {
			let len = this.multipleSelection.length
			if (!len) {
				return this.$message({
					message: '请选择发送商务的账单！',
					type: 'error',
					showClose: true,
				})
			}
			let status = this.multipleSelection.some(item => {
				return item.sendStatus === 'yes'
			})
			if (status) {
				return this.$message({
					message: '数据中含有已发送过给商务的账单，请重新选择！',
					type: 'error',
					showClose: true,
				})
			}
			this.$confirm('您是否确认将选中记录发送给商务确认？', '确认信息', {
				confirmButtonText: '确认',
				cancelButtonText: this.$t('Common.cancel'),
				type: 'warning'
			}).then(() => {
				let shBillNos = this.multipleSelection.map(item => {
					return item.shBillNo
				})
				sendConfirm({ shBillNos }).then(res => {
					this.$message({
						type: 'success',
						message: '发送给商务确认成功!'
					})
					this.multipleSelection = []
					this.getData()
				}).catch(() => {
					this.$message({
						type: 'error',
						message: '发送给商务确认失败！'
					})
				})
			}).catch(() => { })
		},
		// 编辑账单
		handleEdit (row) {
			this.orderImportForm = Object.assign({}, this.orderImportForm, row)
			this.orderImportForm.podName = `${this.orderImportForm.polPortName}/${this.orderImportForm.podPortName}`
			let soNosArr = this.orderImportForm.soNos
			if (soNosArr) {
				let soNos = soNosArr.split(',')
				this.orderImportForm.soNos = soNos
				this.orderImportForm.soNoList = soNos
			}
			this.fileListEdit = [{
				name: this.orderImportForm.fileName,
				url: this.orderImportForm.fileNo
			}]
			this.dialogOrderShow = true
		},
		// 查询导入账单信息
		searchOrderInfo () {
			let { bizNoType, bizNo } = this.orderImportForm
			if (!bizNoType && bizNo) {
				return this.$message({
					message: `请选择单号类型`,
					type: 'warning'
				})
			}
			if (bizNoType && bizNo) {
				this.orderInfoFn()
			}
		},
		// 提交修改新增账单
		submitOrder () {
			this.$refs.orderImportForm.validate(valid => {
				if (valid) {
					let data = this.orderImportForm
					if (this.orderImportForm.soNos.length) {
						data.soNos = this.orderImportForm.soNos.join(',')
					}
					saveOrUpdate(data).then(res => {
						let text = this.orderImportForm.shBillId ? '修改' : '新增'
						if (res.code === 0) {
							this.$message({
								message: `${text}账单成功！`,
								type: 'success'
							})
							this.closeDialog()
						} else {
							this.$message({
								message: `${text}账单失败,请重试！`,
								type: 'warning'
							})
						}
						this.getData(true)
					}).catch(err => {
						this.$message.error(error || 'Has Error')
						this.closeDialog()
					})
				}
			})
		},
		// 查询新增账单信息
		orderInfoFn () {
			let { bizNoType, bizNo } = this.orderImportForm
			let data = {
				bizNoType,
				bizNo
			}
			orderInfo(data).then(res => {
				if (res.code === 0 && res.data.length) {
					this.orderNoArr = res.data
				} else {
					this.$confirm('找不到对应单号，请核实单号是否正确！', "查询失败", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning"
					}).then(() => { }).catch((err) => { })
				}
			}).catch(() => { })
		},
		// 关闭新增账单弹窗
		closeDialog () {
			this.dialogOrderShow = false
			this.$refs.orderImportForm.resetFields()
			this.fileListEdit = []
			this.orderImportForm = {
				shBillType: "",
				bizNoType: "",
				bizNo: "",
				billDate: "",
				checkBfDate: "",
				settleCorpCode: "",
				settleCorpName: "",
				orderNo: "",
				soNos: "",
				carrierLineName: "",
				polPortName: "",
				podPortName: '',
				podName: '',
				vessel: '',
				voyage: '',
				fileNo: '',
				fileName: '',
				soNoList: [],
			}
		},
		// 上传附件
		sendResFileList (val) {
			if (val.length) {
				let item = val[0]
				this.orderImportForm.fileNo = item.fileNo
				this.orderImportForm.fileName = item.name
			}
		},
		// 切换工作单号
		changeOrderNo () {
			let data = this.orderNoArr.filter(item => {
				return item.orderNo === this.orderImportForm.orderNo
			})
			this.orderImportForm = Object.assign({}, this.orderImportForm, data[0])
			this.orderImportForm.podName = `${this.orderImportForm.polPortName}/${this.orderImportForm.podPortName}`
		},
		// 船名输入建议
		querySearchVessel (queryString, item) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
        if (this.remoteSelectCommon(item, (data||[]).map(item=>({label:item.key,value:item.value})))) return
				if (data.length) {
					item.remoteSelectList = data.map(ele => {
						return {
							label: ele.key,
							value: ele.value
						}
					})
				}
			})
		},
		// 航次输入建议
		querySearchVoyage (queryString, item) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
        if (this.remoteSelectCommon(item, (data||[]).map(item=>({label:item.key,value:item.value})))) return
				if (data.length) {
					item.remoteSelectList = data.map(ele => {
						return {
							label: ele.key,
							value: ele.value
						}
					})
				}
			})
		},
	}
}
</script>

<style lang="scss" scoped>
.finance-page {
	.order-import-cnt {
		.el-input,
		.el-select {
			width: 200px;
		}
	}
}
</style>
