<template>
	<div>
		<div class="finance-page self__css">
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button-group>
							<el-button
								class="finance-btn"
								type
								size="mini"
								@click="openUpload"
								>导入</el-button
							>
						</el-button-group>
						<el-button-group>
							<el-button
								class="finance-btn"
								type
								size="mini"
								@click="openImport"
								>新增</el-button
							>
						</el-button-group>
					</div>
					<div class="money-box-right"></div>
				</div>
				<FinanceTable
					:option="option1"
					@send-multi="sendMulti"
					class="statistic-list"
				/>
			</div>
			<!-- 新增 -->
			<el-dialog
				:title="title"
				:visible.sync="stockImportShow"
				class="self-dialog"
				width="1000px"
			>
				<div class="stock-import-cnt">
					<el-form
						ref="stockImportForm"
						:model="stockImportForm"
						:inline="true"
						label-width="90px"
						size="mini"
						:rules="stockImportFormRegRules"
					>
						<el-form-item label="大船起运港:" prop="polData">
							<el-select
								v-model="stockImportForm.polData"
								size="mini"
								placeholder="请选择"
								reserve-keyword
								filterable
								remote
								clearable
                :disabled="disabledForm"
								:remote-method="searchPolCode"
								@change="initSysLine"
							>
								<el-option
									v-for="item in polCodeList"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="目的港:" prop="podData">
							<el-select
								v-model="stockImportForm.podData"
								size="mini"
								placeholder="请选择"
								reserve-keyword
								filterable
								remote
								clearable
								:remote-method="searchPodCode"
								@change="initSysLine"
                :disabled="disabledForm"
							>
								<el-option
									v-for="item in podCodeList"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="系统航线:" prop="sysLineData">
							<el-select
								v-model="stockImportForm.sysLineData"
								size="mini"
								placeholder="请选择"
								reserve-keyword
								filterable
								remote
								clearable
								:remote-method="sysLineQuerySearch"
                :disabled="disabledForm"
							>
								<el-option
									v-for="item in sysLineList"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="船司:" prop="shipCarrierData">
							<el-select
								v-model="stockImportForm.shipCarrierData"
								size="mini"
								placeholder="请选择"
								reserve-keyword
								filterable
								remote
								clearable
								:remote-method="shipQuerySearch"
                :disabled="disabledForm"
							>
								<el-option
									v-for="item in shipQueryList"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="截关时间:" prop="cyCutOff">
							<el-date-picker
								v-model="stockImportForm.cyCutOff"
								value-format="yyyy-MM-dd HH:mm:ss"
								type="date"
                :disabled="disabledForm"
							></el-date-picker>
						</el-form-item>
						<el-form-item label="截补料时间:" prop="siCutOff">
							<el-date-picker
								v-model="stockImportForm.siCutOff"
								value-format="yyyy-MM-dd HH:mm:ss"
								type="date"
                :disabled="disabledForm"
							></el-date-picker>
						</el-form-item>
						<el-form-item label="ETD:" prop="etdDate">
							<el-date-picker
								v-model="stockImportForm.etdDate"
								value-format="yyyy-MM-dd"
								type="date"
                :disabled="disabledForm"
							></el-date-picker>
						</el-form-item>
						<el-form-item label="箱型箱量:" prop="containerType">
							<el-select
								size="mini"
								v-model="stockImportForm.containerType"
								class="containercum"
                :disabled="disabledForm"
							>
								<el-option
									v-for="(o, key) in containerTypeOptions"
									:key="key"
									:label="o.label"
									:value="o.value"
								></el-option> </el-select
							>*
							<el-input
								v-model="stockImportForm.containerNum"
								placeholder="数量"
								class="containercum"
								type="number"
							></el-input>
						</el-form-item>
						<el-form-item label="币种:" prop="currencyData">
							<!-- <el-input
								v-model="stockImportForm.currencyData"
                disabled
              ></el-input>-->
							<el-select
								v-model="stockImportForm.currencyData"
								placeholder="请选择"
							>
								<el-option
									v-for="(op, j) in currencyOptions"
									:key="'currency' + j"
									:label="op.label"
									:value="op.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="成本价:" prop="costPrice">
							<el-input
								v-model="stockImportForm.costPrice"
								type="number"
							></el-input>
						</el-form-item>
						<el-form-item label="售价:" prop="sellPrice">
							<el-input
								v-model="stockImportForm.sellPrice"
								type="number"
							></el-input>
						</el-form-item>
					</el-form>
					<div class="so-list-box">
						<div class="so-left">*SO：</div>
						<div class="so-item-box">
							<div class="so-item" v-for="(item, index) in soList" :key="index">
								<div class="so-cnt">
									<div class="so-number">
										<el-input
											type="text"
											v-model="item.so"
											placeholder="请输入"
											class="so"
                      :disabled="item.status === 'allocated'"
										></el-input
										>-
										<el-input
											type="number"
											v-model="item.containerNum"
											placeholder="箱量"
											class="number"
                      :disabled="item.status === 'allocated'"
										></el-input>
									</div>
									<div class="remark-box">
										<el-input
											type="textarea"
											v-model="item.remark"
											placeholder="现舱备注"
											class="remark"
                      :disabled="item.status === 'allocated'"
										></el-input>
									</div>
								</div>
								<div class="so-right">
									<div v-if="index === 0" @click="addSo">+</div>
									<div v-if="index !== 0 && item.status !== 'allocated' " @click="delSo(index)">-</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button type="primary" @click="submitImport" size="mini"
						>发布</el-button
					>
					<el-button size="mini" @click="closeDialog">取消</el-button>
				</span>
			</el-dialog>
			<!-- so信息 -->
			<el-dialog
				title="SO信息"
				:visible.sync="soDialoig"
				width="1000px"
				class="self-dialog"
			>
				<div class="so-table-box">
					<FinanceTable :option="option2" />
				</div>
			</el-dialog>
			<!-- 已分配申领数 -->
			<el-dialog
				title="已分配申领数"
				:visible.sync="allotOpen"
				width="1000px"
				class="self-dialog bkg-dialog-statistic"
			>
				<div class="so-table-box">
					<FinanceTable :option="option3" />
				</div>
			</el-dialog>
			<!-- 导入 -->
			<FinanceUpload
				upload-title="现舱导入"
				upload-api="/bkg/stock/importStock"
				:upload-params="uploadParams"
				:show-upload="showUpload"
				@send-res-upload="sendResUpload"
				@close-upload="closeUpload"
			>
				<div class="download-model">
					<el-link type="primary" @click="stockDownload">下载模板</el-link>
				</div>
			</FinanceUpload>
		</div>
	</div>
</template>
<script>
import Vue from 'vue'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUpload from '@/views/finance/receivable/components/financeUpload'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dateFormat } from '@/views/finance/utils/finance'
import { baseCurrencyList, baseSystemLineList, baseShippingCarrierList, portSystemLineInfo } from '@/api/base'
import {
	listStockByPricing,
	updateSellPrice,
	addStock,
	listAllStockSoByStockId,
	updateStockSoRemark,
	listStockApplyAudit,
	deleteStock,
  detailStock
} from '@/api/bkg/stockApply'
export default {
	components: {
		FinanceTable,
		FinanceSearch,
		FinanceUpload,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			option1: {},
			option2: {},
			option3: {},
			searchOption1: {},
			multipleSelection1: [],
			stockImportShow: false,
			stockImportForm: {
				polData: '',
				podData: '',
				sysLineData: '',
				shipCarrierData: '',
				cyCutOff: '',
				siCutOff: '',
				etdDate: '',
				containerType: '',
				containerNum: '',
				currencyData: '',
				currencyName: '',
				costPrice: '',
				sellPrice: '',
			},
			stockImportFormRegRules: {
        shipCarrierData: {
          required: true,
					message: '船司不能为空',
					trigger: 'blur'
        },
				polData: [
					{
						required: true,
						message: '起运港不能为空',
						trigger: 'blur',
					},
				],
				podData: [
					{
						required: true,
						message: '目的港不能为空',
						trigger: 'blur',
					},
				],
				cyCutOff: [
					{
						required: true,
						message: '截关时间不能为空',
						trigger: 'blur',
					},
				],
				// siCutOff: [
				// 	{
				// 		required: true,
				// 		message: "截补料时间不能为空",
				// 		trigger: "blur",
				// 	},
				// ],
				etdDate: [
					{
						required: true,
						message: 'ETD不能为空',
						trigger: 'blur',
					},
				],
				containerType: [
					{
						required: true,
						message: '箱型不能为空',
						trigger: 'blur',
					},
				],
				containerNum: [
					{
						required: true,
						message: '箱量不能为空',
						trigger: 'blur',
					},
				],
				currencyData: [
					{
						required: true,
						message: '币种不能为空',
						trigger: 'blur',
					},
				],
				costPrice: [
					{
						required: true,
						message: '成本价不能为空',
						trigger: 'blur',
					},
				],
				sellPrice: [
					{
						required: true,
						message: '售价不能为空',
						trigger: 'blur',
					},
				],
			},
			polCodeList: [],
			podCodeList: [],
			sysLineList: [],
			shipQueryList: [],
			containerTypeOptions: [
				{
					label: '20GP',
					value: '20GP',
				},
				{
					label: '40GP',
					value: '40GP',
				},
				{
					label: '40HQ',
					value: '40HQ',
				},
			],
			currencyOptions: [],
			soList: [
				{
					so: '',
					containerNum: '',
					remark: '',
				},
			],
			soDialoig: false,
			allotOpen: false,
			showUpload: false,
			editData: {},
			uploadParams: {},
			soData: {},
      title: '新增现舱',
      disabledForm: false
		}
	},
	created () {
		this.searchOption1 = {
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
							this.portSearch(val, 'port_of_basic', item)
						},
						visibleChange: (val, item) => {
							this.portSearch(val, 'port_of_basic', item)
						},
						remoteSelectList: [],
					},
					pod: {
						label: '目的港',
						type: 'remoteSelect',
						showType: '2',
						remoteMethod: (val, item) => {
							this.portSearch(val, 'port_of_destination', item)
						},
						visibleChange: (val, item) => {
							this.portSearch(val, 'port_of_destination', item)
						},
						remoteSelectList: [],
					},
					etdDate: { label: 'ETD', type: 'date', showType: '3' },
				},
			},
		}
		this.init()
	},
	methods: {
		// 初始化表格
		init () {
			let operationBtns1 = Object.assign({}, this.option.operationBtns, {
				width: 120,
				data: [
					{
						label: '改价',
						type: 'text',
						showFn: (row) => !row.edit,
						action: 'Edit',
					},
					{
						label: '保存',
						type: 'text',
						showFn: (row) => row.edit,
						action: 'Save',
					},
					{
						label: '编辑',
						type: 'text',
						showFn: (row) => !row.edit,
						action: 'ChangeData',
					},
					{
						label: '删除',
						type: 'text',
						showFn: (row) => row.allocatedNum == 0,
						action: 'Delete',
					},
				],
				fixed: 'right',
				show: true,
				callback: (action, $index, row, option) => {
					if (action === 'Edit') {
						this.editData = row
						row.edit = true
					} else if (action === 'Save') {
						if (/^\d+(\.\d{0,2})?$/.test(row['sellPrice'])) {
							row.edit = false
							this.updateSellPrice()
						} else {
							this.$message({
								type: 'error',
								message: '请输入正确的售价！',
								showClose: true,
							})
						}
					} else if (action === 'ChangeData') {
						this.changeData(row)
					} else if (action === 'Delete') {
						this.deleteStock(row)
					}
				},
			})
			let pagination = Object.assign({}, this.option.pagination, {
				width: '120px',
				show: true,
			})
			this.option1 = Object.assign({}, this.option, {
				id: 'option1',
				edit: true,
				data: [],
				tips: {
					text: '',
					show: false,
				},
				operationBtns: operationBtns1,
				pagination,
				selection: false,
			})
			let columns = [
				{
					prop: 'stockCode',
					label: '现舱编号',
					type: 'text',
					formatter: (row) => {
						return `${row['remindFlag'] ? '<span class="bkg-tag">到</span>' : ''} ${row['stockCode']}`
					},
				},
				{
					prop: 'polCname',
					label: '大船起运港',
					type: 'text',
					width: 125,
					formatter: (row) => {
						return `${row.polEname}(${row.polCname})`
					}
				},
				{
					prop: 'podCname',
					label: '目的港',
					type: 'text',
					width: 125,
					formatter: (row) => {
						return `${row.podEname}(${row.podCname})`
					}
				},
				{
					prop: 'sysLineName',
					label: '系统航线',
					type: 'text',
				},
				{
					prop: 'shipCarrierCode',
					label: '船司',
					type: 'text',
				},
				{
					prop: 'etdDate',
					label: 'ETD',
					type: 'text',
				},
				{
					prop: 'cyCutOff',
					label: '截关时间',
					type: 'text',
				},
				{
					prop: 'siCutOff',
					label: '截补料时间',
					type: 'text',
				},
				{
					prop: 'containerType',
					label: '柜型',
					type: 'text',
				},
				{
					prop: 'containerNum',
					label: '柜量总数',
					type: 'text',
				},
				{
					prop: 'lastCount',
					label: '剩余可用数',
					type: 'text',
				},
				{
					prop: 'sellPrice',
					label: '售价',
					type: 'input',
					validateInput: (val, row, item, change) => {
						if (change) {
							if (!/^\d+(\.\d{0,2})?$/.test(val)) {
								this.$message({
									type: 'error',
									message: '请输入正确的数字！',
									showClose: true,
								})
								let res = /\d+(\.\d{0,2})?/g.exec(val)
								row[item.prop] = res ? res[0] : ''
							}
						}
					},
				},
				{
					prop: 'currencyCode',
					label: '币别',
					type: 'text',
				},
				{
					prop: 'allocatedNum',
					label: '已分配数',
					type: 'button',
					operationBtns: {
						show: true,
						callback: (action, index, row) => {
							this.listStockApply(row['stockId'])
						},
					},
				},
				{
					prop: 'applyCount',
					label: '申领数',
					type: 'button',
					operationBtns: {
						show: true,
						callback: (action, index, row) => {
							this.goApplyList(row)
						},
					},
				},

				{
					prop: 'returnNum',
					label: '退回数',
					type: 'button',
					operationBtns: {
						show: true,
						callback: (action, index, row) => {
							this.goRefuseList(row)
						},
					},
				},
				{
					prop: 'stockId',
					label: 'SO信息',
					type: 'button',
					operationBtns: {
						show: true,
						callback: (action, $index, row, option) => {
							if (action === 'showSoDialog') {
								this.soData = row
								this.listAllStockSoByStockId()
								this.soDialoig = true
							}
						},
						data: [
							{
								label: '点击查看',
								type: 'text',
								show: true,
								action: 'showSoDialog',
							},
						],
					},
				},
				{
					prop: 'createdName',
					label: '创建人',
					type: 'text',
				},
				{
					prop: 'createdTime',
					label: '创建时间',
					type: 'text',
				},
				{
					prop: 'freetimeRemark',
					label: 'Freetime说明',
					type: 'text',
				},
				{
					prop: 'cancelRemark',
					label: '退舱费说明',
					type: 'text',
				},
			]
			this.option1.columns = columns
			let operationBtns2 = Object.assign({}, this.option.operationBtns, {
				width: 120,
				data: [
					{
						label: '修改',
						type: 'text',
						showFn: (row) => {
							return row['status'] === 'unallocated' && !row['edit']
						},
						action: 'Edit',
					},
					{
						label: '保存',
						type: 'text',
						showFn: (row) => {
							return row['status'] === 'unallocated' && row['edit']
						},
						action: 'Save',
					},
				],
				fixed: 'right',
				show: true,
				callback: (action, $index, row, option) => {
					if (action === 'Edit') {
						row['edit'] = true
					} else if (action === 'Save') {
						if (!row['remark'].trim().length) {
							return this.$message({
								message: '备注不能为空',
								type: 'error',
							})
						}
						let data = {
							soId: row['soId'],
							remark: row['remark'],
						}
						updateStockSoRemark(data)
							.then((res) => {
								this.$message({
									message: '备注修改成功',
									type: 'success',
								})
							})
							.catch()
						row['edit'] = false
					} else {
					}
				},
			})
			this.option2 = Object.assign({}, this.option, {
				id: 'option2',
				data: [],
				tips: false,
				operationBtns: operationBtns2,
				pagination: false,
				selection: false,
				edit: true,
			})
			let columns2 = [
				{
					prop: 'so',
					label: 'SO号',
					type: 'text',
					width: '90px',
				},
				{
					prop: 'containerType',
					label: '柜型',
					type: 'text',
				},
				{
					prop: 'containerNum',
					label: '柜量',
					type: 'text',
				},
				{
					prop: 'status',
					label: 'SO状态',
					type: 'text',
					formatter: (row, pItem) => {
						return row[pItem.prop] === 'unallocated' ? '未分配' : '已分配'
					},
				},
				{
					prop: 'remark',
					label: '现舱备注',
					type: 'input',
					width: 200,
				},
				{
					prop: 'applierName',
					label: '申请人',
					type: 'text',
				},
				{
					prop: 'currencyCode',
					label: '币别',
					type: 'text',
				},
				{
					prop: 'costPrice',
					label: '成本价',
					type: 'text',
				},
				{
					prop: 'createdTime',
					label: '申请时间',
					type: 'text',
				},
			]
			this.option2.columns = columns2

			this.option3 = Object.assign({}, this.option, {
				id: 'option3',
				data: [],
				tips: false,
				operationBtns: false,
				pagination: false,
				selection: false,
			})
			let columns3 = [
				{
					prop: 'applyId',
					label: '申请单号',
					type: 'text',
					width: '90px',
				},
				{
					prop: 'stockId',
					label: '现舱编号',
					type: 'text',
					width: 125,
				},
				{
					prop: 'applierName',
					label: '申请人',
					type: 'text',
					width: 125,
				},
				{
					prop: 'createdTime',
					label: '申请时间',
					type: 'text',
				},
				{
					prop: 'applyRemark',
					label: '申请备注',
					type: 'text',
				},
				{
					prop: 'shipCarrierName',
					label: '柜型',
					type: 'text',
				},
				{
					prop: 'applyCount',
					label: '申请数量',
					type: 'text',
				},
				{
					prop: 'distributeNum',
					label: '分配柜量',
					type: 'text',
				},
				{
					prop: 'sellPrice',
					label: '售价',
					type: 'text',
				},
				{
					prop: 'soNos',
					label: '分配SO信息',
					type: 'columnTip',
					width: 130,
					component: 'ColumnTip',
					componentProps: {
						show: false,
						formatter: (row) => {
							let soInfoVos = row.soInfoVos.map((item) => {
								return `SO号：${item.so} &nbsp;&nbsp; 柜型：${item.containerType}&nbsp;&nbsp; 柜量：${item.containerNum}&nbsp;&nbsp; 售价：${item.sellPrice}</br>`
							})
							return soInfoVos.join('')
						},
						width: 450,
					},
				},
				{
					prop: 'verifyStatus',
					label: '审批状态',
					type: 'text',
					formatter: (row, pItem) => {
						return row['applyCount'] === row['distributeNum'] ? '全部满足' : '部分满足'
					},
				},
			]
			this.option3.columns = columns3
			this.getData()
		},
		// 获取数据
		getData () {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: [],
			}
			this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
				let { key, value } = item
				if (value) {
					if (key === 'etdDate') {
						data.query.push({
							column: 'etdDate',
							type: 'eq',
							value: dateFormat('yyyy-mm-dd', value),
						})
					} else {
						data.query.push({
							column: key,
							value: value,
							type: 'eq',
						})
					}
				}
			})
			listStockByPricing(data).then((res) => {
				if (res.code === 0) {
					this.option1.data = res.data.list.map((item) => {
						return Object.assign({}, item, { edit: false })
					})
					this.option1.pagination.currPage = res.data.currPage
					this.option1.pagination.pageSize = res.data.pageSize
					this.option1.pagination.totalCount = res.data.totalCount
				}
			})
		},
		// 修改售价
		updateSellPrice () {
			let { stockId, sellPrice } = this.editData
			let data = {
				stockId,
				sellPrice,
			}
			updateSellPrice(data)
				.then((res) => {
					if (res.code === 0) {
						this.$message({
							type: 'success',
							message: '售价修改成功',
							showClose: true,
						})
					}
				})
				.catch()
		},
		// 导入按钮
		openUpload () {
			this.showUpload = true
		},
		//导入
		sendResUpload (data) {
			if (data.data.errorFile) {
				const h = this.$createElement
				this.$msgbox({
					title: '',
					message: h('div', { style: 'text-align:center;padding:10px 0' }, [
						h('i', { class: 'el-icon-warning', style: 'display: inline-block;font-size: 38px;color:#CD4130' }, ''),
						h('p', null, '数据导入异常，请检查数据？ '),
						h('p', null, data.data.resultMsg),
					]),
					showCancelButton: false,
					confirmButtonText: '关闭',
				})
					.then((action) => { })
					.catch((err) => { })
			}
		},
		// 关闭导入
		closeUpload () {
			this.showUpload = false
			this.getData()
		},
		// 新增舱位
		openImport () {
      this.title = '新增现舱'
			this.stockImportShow = true
		},
		// 初始化航线
		initSysLine (val) {
			if (val) {
				portSystemLineInfo(val.split('-')[0])
					.then((res) => {
						if (res.data.length) {
							let { sysLineCode, cname } = res.data[0]
							this.stockImportForm.sysLineData = `${sysLineCode}-${cname}`
						}
					})
					.catch()
			}
		},
		// 新增提交验证
		submitImport () {
			this.$refs['stockImportForm'].validate((valid) => {
				if (valid) {
					let containerNum = this.stockImportForm.containerNum > 0
					if (!containerNum) {
						return this.$message({
							message: '箱型箱量必须大于0 ',
							type: 'error',
						})
					}
					let costPrice = this.stockImportForm.costPrice > 0
					if (!costPrice) {
						return this.$message({
							message: '成本价必须大于0 ',
							type: 'error',
						})
					}
					let sellPrice = this.stockImportForm.sellPrice > 0
					if (!sellPrice) {
						return this.$message({
							message: '售价必须大于0 ',
							type: 'error',
						})
					}
					let status = this.soList.some((item) => {
						return !item.so || !item.containerNum
					})
					if (status) {
						return this.$message({
							message: 'so编号、箱量信息都为必填',
							type: 'error',
						})
					}
					let num = this.soList.some((item) => {
						return item.containerNum <= 0
					})
					if (num) {
						return this.$message({
							message: 'so的箱量必须大于0',
							type: 'error',
						})
					}
					let total = this.soList.reduce((pre, cur) => {
						return (pre += Number(cur.containerNum))
					}, 0)
					if (total !== Number(this.stockImportForm.containerNum)) {
						return this.$message({
							message: '箱型箱量总数与so的箱量不相等',
							type: 'error',
						})
					}
					this.submitImportFn()
				} else {
					return false
				}
			})
		},
		//新增提交
		submitImportFn () {
			let data = {}
			if (!this.stockImportForm.stockId) {
				let {
					polData,
					podData,
					sysLineData,
					shipCarrierData,
					cyCutOff,
					siCutOff,
					etdDate,
					containerType,
					containerNum,
					currencyData,
					costPrice,
					sellPrice,
				} = this.stockImportForm
				let polSoure = polData.split('-'),
					podSource = podData.split('-'),
					sysLineSopource = sysLineData.split('-'),
					shipCarrierSource = shipCarrierData.split('-'),
					currencySource = currencyData.split('-')
				data = {
					pol: polSoure[0],
					polCname: polSoure[1],
					polEname: polSoure[2],
					pod: podSource[0],
					podCname: podSource[1],
					podEname: podSource[2],
					sysLineCode: sysLineSopource[0],
					sysLineName: sysLineSopource[1],
					shipCarrierCode: shipCarrierSource[0],
					shipCarrierName: shipCarrierSource[1],
					cyCutOff,
					siCutOff,
					etdDate,
					containerType,
					containerNum,
					sellPrice,
					currencyCode: currencySource[0],
					currencyName: currencySource[1],
					costPrice,
				}
			} else {
				data = this.stockImportForm
			}
			data.list = this.soList
			addStock(data).then((res) => {
				if (res.code === 0) {
					this.$message({
						message: `恭喜你，${this.title}成功！`,
						type: 'success',
					})
					this.closeDialog()
				}
			}).catch
		},
		// 增加so
		addSo () {
			this.soList.push({
				so: '',
				containerNum: '',
				remark: '',
			})
		},
		// 删除so
		delSo (index) {
			this.soList.splice(index, 1)
		},
		// 关闭新增弹窗
		closeDialog () {
			this.stockImportShow = false
      this.$refs['stockImportForm'].clearValidate()
			this.getData()
		},
		// so列表
		listAllStockSoByStockId () {
			let data = this.soData.stockId
			listAllStockSoByStockId(data)
				.then((res) => {
					this.option2.data = res.data.map((item) => {
						return Object.assign(item, { edit: false })
					})
				})
				.catch()
		},
		// 已分配数
		listStockApply (stockId) {
			let data = {
				currPage: 1,
				pageSize: 30,
				query: [
					{
						column: 'verifyStatus',
						type: 'in',
						value: 'allocated,part_allocated',
					},
					{
						column: 'stockId',
						type: 'eq',
						value: stockId,
					},
				],
			}
			listStockApplyAudit(data)
				.then((res) => {
					this.option3.data = res.data.list
					this.allotOpen = true
				})
				.catch()
		},
		// 删除现舱
		deleteStock (row) {
			this.$confirm('是否确认删除该条数据?', "警告", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.deleteStockFn(row)
			}).catch((err) => {
			})
		},
		deleteStockFn (row) {
			let stockId = row.stockId
			let data = {
				stockId
			}
			deleteStock(data).then(res => {
				if (res.code === 0) {
					this.getData()
					this.$msgSucClose('现舱删除成功')
				}
			}).catch(() => { })
		},
		// 分页
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		// 分页
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		// 表格选项
		sendMulti (data, option) {
			if (option === this.option1) this.multipleSelection1 = data
		},
		// 搜索
		search () {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		// 起运港
		searchPolCode (val) {
			this.portSearch(val, 'port_of_basic', 'polCodeList')
		},
		// 目的港
		searchPodCode (val) {
			this.portSearch(val, 'port_of_destination', 'podCodeList')
		},
		// 远程搜索港口下拉数据
		portSearch (queryString, portAttribute, item) {
			let data = {
				queryString,
				portAttribute,
			}
			this.$store.dispatch('dict/basePortList', data).then((data) => {
				let datasource = data.map((ele) => {
					if (['polCodeList', 'podCodeList'].includes(item)) {
						return {
							label: ele.value,
							value: `${ele.portCode}-${ele.cname}-${ele.ename}`,
						}
					} else {
						return {
							label: ele.value,
							value: ele.portCode,
						}
					}
				})
				if (item === 'polCodeList') {
					this.polCodeList = datasource
				} else if (item === 'podCodeList') {
					this.podCodeList = datasource
				} else {
					item.remoteSelectList = datasource
				}
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch (queryString) {
			baseSystemLineList(queryString, '').then((data) => {
				this.sysLineList = data.data.map((item) => {
					return {
						label: item.cname,
						value: `${item.sysLineCode}-${item.cname}`,
					}
				})
			})
		},

		// 船公司下拉列表自动补充的数据
		shipQuerySearch (queryString) {
			baseShippingCarrierList(queryString, '').then((data) => {
				this.shipQueryList = data.data.map((ele) => {
					return Object.assign(ele, {
						label: ele.carrierCode,
						value: `${ele.carrierCode}-${ele.cname}`,
					})
				})
			})
		},
		// 币别下拉列表自动补充的数据
		getCurrencyList () {
			baseCurrencyList()
				.then((res) => {
					let preArr = [],
						otherArr = []
					res.data.forEach((item) => {
						let currency = {
							label: `${item.code}(${item.cnName})`,
							value: `${item.code}-${item.cnName}`,
						}
						if (['CNY', 'USD'].includes(item.code)) {
							preArr.push(currency)
						} else {
							otherArr.push(currency)
						}
					})
					this.currencyOptions = [...preArr, ...otherArr]
				})
				.catch(() => { })
		},
		// 跳转申领数页面
		goApplyList (row) {
			Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
				this.commonRoute(to, from)
			}
			this.routerPush('BkgStockManage', { stockId: row.stockId, verifyStatus: 'unallocated' })
		},
		// 跳转退舱数页面
		goRefuseList (row) {
			Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
				this.commonRoute(to, from)
			}
			this.routerPush('StockReturnManage', { stockId: row.stockId, verifyStatus: 'agreed' })
		},
		stockDownload () {
			this.$store
				.dispatch('finance/downloadBlobFile', {
					uri: '/bkg/stock/file/temp/download',
					params: { folder: 'excel', fileName: 'so_import_temp.xlsx' },
				})
				.then((res) => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = 'so_import_temp.xlsx'
					link.click()
				})
			// stockDownload({ folder: 'excel', FileName: 'so_import_temp.xlsx' }).then((res) => {})
		},
		// 编辑信息
		changeData (row) {
      this.title = '编辑现舱'
			console.log(row)
      if (row.allocatedNum == 0) {
        this.disabledForm = false
      } else {
        this.disabledForm = true
      }
      let data = {
        stockId: row.stockId
      }
      detailStock(data).then(res => {
        if (res.code === 0) {
          this.stockImportForm =  Object.assign(this.stockImportForm, res.data)
          this.stockImportForm.currencyData = `${this.stockImportForm.currencyCode}`
          this.stockImportForm.polData = `${this.stockImportForm.polEname}(${this.stockImportForm.polCname})`
          this.stockImportForm.podData = `${this.stockImportForm.podEname}(${this.stockImportForm.podCname})`
          this.stockImportForm.sysLineData = `${this.stockImportForm.sysLineName}`
          this.stockImportForm.shipCarrierData = `${this.stockImportForm.shipCarrierName}`
          this.stockImportForm.costPrice = this.stockImportForm.stockSos[0]?.costPrice || ''
          this.soList = this.stockImportForm.stockSos
				  this.stockImportShow = true
        }
      }).catch(()=>{})

			// this.stockImportForm = Object.assign(this.stockImportForm, row)
			// this.stockImportForm.currencyData = `${this.stockImportForm.currencyCode}`
			// this.stockImportForm.polData = `${this.stockImportForm.polEname}(${this.stockImportForm.polCname})`
			// this.stockImportForm.podData = `${this.stockImportForm.podEname}(${this.stockImportForm.podCname})`
			// this.stockImportForm.sysLineData = `${this.stockImportForm.sysLineName}`
			// this.stockImportForm.shipCarrierData = `${this.stockImportForm.shipCarrierName}`
			// let data = row.stockId
			// listAllStockSoByStockId(data).then(res => {
			// 	this.soList = res.data
			// 	this.stockImportShow = true
			// }).catch(() => { })

		}
	},
	mounted () {
		// 获取币种下拉框
		this.getCurrencyList()
	},
}
</script>
<style lang="scss" scoped>
.so-list-box {
	font-size: 12px;
	display: flex;
	.so-left {
		width: 90px;
		text-align: right;
	}
	.so-item-box {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.so-item {
		display: flex;
		margin-bottom: 10px;
		.so-cnt {
		}
		.so-right {
			margin-left: 15px;
			div {
				background-color: #3e80f5;
				color: #fff;
				width: 20px;
				height: 20px;
				cursor: pointer;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 16px;
			}
		}
	}
}
</style>

<style lang="scss">
.bkg-dialog-statistic {
	.el-dialog {
		transform: none !important;
		-webkit-transform: none !important;
	}
}
.self__css .receivable-file-upload {
	display: block;
	text-align: center;
}
.download-model {
	width: 100%;
	text-align: left;
}
</style>
