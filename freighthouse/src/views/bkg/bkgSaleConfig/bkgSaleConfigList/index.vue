<template>
	<div class="finance-page">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button-group>
							<el-button
								class="finance-btn"
								type="primary"
								@click="handleAdd"
								size="mini"
								>新建</el-button
							>
						</el-button-group>
						<el-button-group>
							<el-button class="finance-btn" @click="handleUpload" size="mini"
								>批量导入</el-button
							>
						</el-button-group>
					</div>
					<div class="money-box-right">
						<el-button-group>
							<el-button
								class="finance-btn"
								@click="handleFreetime"
								plain
								size="mini"
								:class="isFreetime ? 'right-filter-btns-effect' : ''"
								>Freetime</el-button
							>
							<el-button
								class="finance-btn"
								@click="handleBkgCancel"
								plain
								size="mini"
								:class="!isFreetime ? 'right-filter-btns-effect' : ''"
								>退仓费</el-button
							>
						</el-button-group>
					</div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
		</div>
		<el-dialog
			:title="'配置' + (isFreetime ? 'Freetime' : '退舱费')"
			:visible.sync="dialogVisible"
			:close-on-click-modal="false"
			width="600px"
			class="saleconfig"
		>
			<el-form
				:model="form"
				ref="form"
				:inline="true"
				label-width="100px"
				size="mini"
			>
				<el-form-item
					label="船公司："
					prop="shipCarrierCode"
					:rules="[
						{ required: true, message: '船司不能为空', trigger: 'change' },
					]"
				>
					<el-select
						size="mini"
						v-model="form.shipCarrierCode"
						filterable
						remote
						reserve-keyword
						placeholder="请选择船公司"
						:remote-method="shipCarrierSearch"
						@focus="shipCarrierSearch('')"
						@change="shipCarrierChange"
					>
						<el-option
							v-for="item in shipCarrierCodeList"
							:key="item.carrierCode"
							:label="item.carrierCode"
							:value="item.carrierCode"
						>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					class="oneEighth"
					label="目的港"
					:rules="[{ required: true, message: ' ', trigger: 'change' }]"
					prop="pod"
					:show-message="true"
				>
					<el-select
						size="mini"
						v-model="form.pod"
						filterable
						remote
						placeholder="请输入"
						:remote-method="podPortFilterMethod"
						@visible-change="podPortVisibleChange"
						@change="handleChangePodPort"
					>
						<el-option
							v-for="item in polCodeList"
							:key="item.key"
							:label="item.value"
							:value="item.key"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					label="系统航线："
					prop="sysLineName"
					:rules="[
						{ required: true, message: '系统航线不能为空', trigger: 'change' },
					]"
				>
					<el-select
						size="mini"
						v-model="form.sysLineName"
						disabled
						filterable
						remote
						reserve-keyword
						placeholder="请选择航线"
					>
						<el-option
							v-for="item in sysLineCodeList"
							:key="item.key"
							:label="item.value"
							:value="item.key"
						>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					v-if="isFreetime"
					:label="'Freetime备注：'"
					prop="freetimeRemark"
					class="remark"
					:rules="[{ required: true, message: ' ', trigger: 'change' }]"
				>
					<el-input
						v-model="form.freetimeRemark"
						placeholder="请输入交易原因，不超过500个字"
						type="textarea"
						:maxlength="500"
						show-word-limit
					>
					</el-input>
				</el-form-item>
				<el-form-item
					v-if="!isFreetime"
					:label="'退舱备注：'"
					prop="cancelRemark"
					class="remark"
					:rules="[{ required: true, message: ' ', trigger: 'change' }]"
				>
					<el-input
						v-model="form.cancelRemark"
						placeholder="请输入交易原因，不超过500个字"
						type="textarea"
						:maxlength="500"
						show-word-limit
					>
					</el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" size="mini" @click="handleAddSubmit"
					>确定</el-button
				>
				<el-button size="mini" @click="dialogVisible = !dialogVisible"
					>取消</el-button
				>
			</span>
		</el-dialog>
		<!-- 批量导入 -->
		<FinanceUpload
			upload-title="批量导入"
			:upload-api="uploadApi"
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
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { freetimeListPage, freetimeSave, freetimeDelete, bkgCancelListPage, bkgCancelFeeSave, bkgCancelFeeDelete } from "@/api/bkg/bkgSaleConfig"
import { basePortList, baseSystemLineList, baseShippingCarrierList, baseCurrencyList, portSystemLineInfo } from '@/api/base'
import { mapState } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import FinanceUpload from '@/views/finance/receivable/components/financeUpload'
const defaultCreateQuery = {
	"oid": null,
	"shipCarrierCode": "",
	"shipCarrierName": "",
	"freetimeRemark": "",
	"cancelRemark": "",
	"pod": "",
	"podEname": "",
	"sysLineCode": "",
	"sysLineName": "",
}
export default {
	mixins: [mixin, mixin2, routerMixin],
	data () {
		return {
			option1: {},
			searchOption1: {},
			multipleSelection1: [],
			isFreetime: true,
			dialogVisible: false,
			addType: "",
			sysLineDisabled: '',
			//船公司list
			shipCarrierCodeList: [],
			//目的港list
			polCodeList: [],
			//系统航线
			sysLineCodeList: [],
			form: Object.assign({}, defaultCreateQuery),
			showUpload: false,
			uploadApi: '/bkg/freetime/import',
			file: '',
			fileList: [],
			uploadParams: {},
			errorFile: {},
		}
	},
	created () {
		let alias1 = this
		this.autocomplete1 = {
			querySearch: (queryString, cb) => {
				alias1.selectedOptionItem = ''
				alias1.shipQuerySearch(queryString, cb)
			},
			select: (optionItem, row) => {
				console.log(optionItem);
				alias1.selectedOptionItem = optionItem
				this.form.shipCarrierCode = optionItem.key
				this.form.shipCarrierName = optionItem.value
			},
			change: (optionItem, row) => {
				setTimeout(() => {
					if (alias2.selectedOptionItem === '') {
						this.form.shipCarrierCode = ""
						this.form.shipCarrierName = ""
						return
					}
				}, 500)
			}
		}
		this.searchOption1 = {
			addFilter: {
				defaultSearchLength: 3,
				searchInputGroup: [
					{
						key: 'shipCarrierName',
						value: '',
						showType: '1',
					},
					{
						key: 'pod',
						value: '',
						showType: '2',
					},
					{
						key: 'sysLineCode',
						value: '',
						showType: '3',
					},
				],
				filterGroups: {
					shipCarrierName: {
						label: '船司',
						type: 'remoteSelect',
						remoteMethod: (val, item) => {
							this.shipQuerySearch(val, item)
						},
						visibleChange: (val, item) => {
							this.shipQuerySearch(val, item)
						},
						remoteSelectList: [],
					},
					pod: {
						label: '目的港',
						type: 'remoteSelect',
						remoteMethod: (val, item) => {
							this.portSearch(val, 'port_of_destination', "valid", item)
						},
						visibleChange: (val, item) => {
							this.portSearch(val, 'port_of_destination', "valid", item)
						},
						remoteSelectList: [],
					},
					sysLineCode: {
						label: '系统航线',
						type: 'remoteSelect',
						remoteMethod: (val, item) => {
							this.sysLineQuerySearch(val, item)
						},
						visibleChange: (val, item) => {
							this.sysLineQuerySearch(val, item)
						},
						remoteSelectList: [],
					},
				}
			}
		}
		this.init1()
	},
	methods: {
		init1 () {
			let pagination = Object.assign({}, this.option.pagination, {
				width: '120px',
				show: true
			})
			let operationBtns = Object.assign({}, this.option.operationBtns, {
				width: '120px',
				data: [
					{
						label: '修改',
						type: 'text',
						show: true,
						action: 'Edit'
					},
					{
						label: '删除',
						type: 'text',
						show: true,
						action: 'Delete'
					}
				]
			})
			this.option1 = Object.assign({}, this.option, {
				loading: true,
				id: 'option1',
				data: [],
				tips: {
					text: '',
					show: false
				},
				operationBtns,
				pagination,
				// sortable: true,
			})
			let columns = [
				{
					prop: 'shipCarrierName',
					label: '船司',
					type: 'text'
				},
				{
					prop: 'podEname',
					label: '目的港',
					type: 'text',
					formatter: (row) => {
						return row.podCname ? `${row.podEname}(${row.podCname})` : row.podEname
					}
				},
				{
					prop: 'sysLineName',
					label: '系统航线',
					type: 'text',
				},
				{
					prop: 'freetimeRemark',
					label: 'freetime备注',
					type: 'tooltip',
					width: 135,
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
				}
			]
			this.option1.columns = columns
			this.getData()
		},
		init2 () {
			let pagination = Object.assign({}, this.option.pagination, {
				show: true
			})
			let operationBtns = Object.assign({}, this.option.operationBtns, {
				width: '120px',
				data: [
					{
						label: '修改',
						type: 'text',
						show: true,
						action: 'Edit'
					},
					{
						label: '删除',
						type: 'text',
						show: true,
						action: 'Delete'
					}
				]
			})
			this.option1 = Object.assign({}, this.option, {
				loading: true,
				id: 'option1',
				data: [],
				tips: {
					text: '',
					show: false
				},
				operationBtns,
				pagination,
				// sortable: true,
			})
			let columns = [
				{
					prop: 'shipCarrierName',
					label: '船司',
					type: 'text'
				},
				{
					prop: 'podEname',
					label: '目的港',
					type: 'text'
				},
				{
					prop: 'sysLineName',
					label: '系统航线',
					type: 'text',
				},
				{
					prop: 'cancelRemark',
					label: "退仓备注",
					type: 'tooltip',
					width: 135,
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
				}
			]
			this.option1.columns = columns
			this.getData()
		},
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		getData (isSearch) {
			this.option1.loading = true
			let data = {
				"currPage": this.option1.pagination.currPage,
				"pageSize": this.option1.pagination.pageSize,
				"query": []
			}
			this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
				let { key, value } = item
				if (value) {
					data.query.push({
						column: key,
						value: value,
						type: 'eq',
					})
				}
			})
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			if (this.buttonSearch) {
				data.query.push({ column: 'verifyStatus', type: 'eq', value: this.buttonSearch })
			}
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			if (this.isFreetime) {
				freetimeListPage(data).then(res => {
					if (res.code === 0) {
						this.decompose(res)
					}
				}).finally(() => {
					this.option1.loading = false
				})
			} else {
				bkgCancelListPage(data).then(res => {
					if (res.code === 0) {
						this.decompose(res)
					}
				}).finally(() => {
					this.option1.loading = false
				})
			}


		},
		decompose (res) {
			let { list } = res.data
			let data = []
			list.forEach(item => {
				data.push(item)
			})
			this.option1.data = data
			this.table1DataBackup = [
				... this.option1.data
			]
			this.option1.pagination.currPage = res.data.currPage
			this.option1.pagination.pageSize = res.data.pageSize
			this.option1.pagination.totalCount = res.data.totalCount
		},
		//修改
		handleEdit (row, index) {
			Object.assign(this.form, {}, defaultCreateQuery)
			this.dialogVisible = true
			console.log(row);
			Object.assign(this.form, {}, row)
			this.polCodeSearch(row.podEname, 'port_of_destination', 'valid')
		},
		//删除
		handleDelete (index, row) {
			this.$confirm('是否确认删除？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {
					if (this.isFreetime) {
						freetimeDelete({ oid: row.oid }).then(res => {
							this.$msgSucClose('删除成功！')
							this.getData()
						})
					} else {
						bkgCancelFeeDelete({ oid: row.oid }).then(res => {
							this.$msgSucClose('删除成功！')
							this.getData()
						})
					}
				}).catch(() => { })

		},
		sendMulti (data, option) {
			if (option === this.option1) this.multipleSelection1 = data
		},

		search (data) {
			this.buttonSearch = data
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		showDetail (row) {
		},
		//新建
		handleAdd () {
			this.form = Object.assign({}, defaultCreateQuery)
			this.dialogVisible = true
			this.$refs.form.resetFields()
		},

		handleFreetime () {
			if (this.isFreetime === true) {
				return  //不要重复操作
			}
			this.isFreetime = true
			this.init1()

		},
		handleBkgCancel () {
			if (this.isFreetime === false) {
				return  //不要重复操作
			}
			this.isFreetime = false
			this.init2()
		},
		//船司
		shipCarrierSearch (queryString) {
			baseShippingCarrierList(queryString, '').then(response => {
				this.shipCarrierCodeList = response.data
			})
		},
		shipCarrierChange (val) {
			this.form.shipCarrierName = val
		},
		//确定保存
		handleAddSubmit () {
			console.log(this.form);
			this.$refs.form.validate(valid => {
				if (valid) {
					if (this.isFreetime) {
						freetimeSave(this.form).then(res => {
							this.getData()
							this.$msgSucClose('提交成功！')
							this.dialogVisible = false
						})
					} else {
						bkgCancelFeeSave(this.form).then(res => {
							this.getData()
							this.$msgSucClose('提交成功！')
							this.dialogVisible = false
						})
					}
				}
			})

		},
		//系统航线
		sysLineSearch (queryString) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				console.log(data);
				this.sysLineCodeList = data
			})
		},
		// 目的地
		handleChangePodPort (val) {
			let optionItem = this.polCodeList.filter(item => {
				return item.key === val
			})
			this.form.podEname = optionItem[0].ename
			if (!val) {
				this.changeSysLineDisabeld(false)
			} else {
				this.initSystemLine(val);
				this.changeSysLineDisabeld(true)
			}
		},
		initSystemLine (key) {
			portSystemLineInfo(key).then(response => {
				this.sysLineCodeList = response.data
				if (this.sysLineCodeList.length > 0) {
					this.form.sysLineCode = this.sysLineCodeList[0].sysLineCode
					this.form.sysLineName = this.sysLineCodeList[0].cname
				}
			})
		},
		changeSysLineDisabeld (value) {
			this.sysLineDisabled = value
		},
		podPortVisibleChange (val) {
			val && this.polCodeSearch(val, 'port_of_destination', 'valid')
		},
		podPortFilterMethod (val) {
			this.polCodeSearch(val, 'port_of_destination', 'valid')

		},
		polCodeSearch (queryString, portAttribute, state, type, cb) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.polCodeList = data
			})
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch (queryString, item) {
			baseShippingCarrierList(queryString, '').then(res => {
				let list = res.data.map(item => {
					return {
						key: item.carrierCode,
						value: item.carrierCode
					}
				})
				item.remoteSelectList = list
			})
		},
		// 远程搜索港口下拉数据
		portSearch (queryString, portAttribute, state, item) {
			basePortList(queryString, portAttribute, state).then(res => {
				item.remoteSelectList = res.data.map(item => {
					return {
						label: `${item.ename}(${item.cname})`,
						value: item.portCode
					}
				})
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch (queryString, item) {
			baseSystemLineList(queryString, '').then(res => {
				let datasource = res.data.filter(item => item.sysLineCode)
				item.remoteSelectList = datasource.map(item => {
					return {
						label: `${item.cname}`,
						value: item.sysLineCode
					}
				})
			})
		},
		// 导入
		handleUpload () {
			if (this.isFreetime) {
				this.uploadApi = '/bkg/freetime/import'
			} else {
				this.uploadApi = '/bkg/bkgCancelFee/import'
			}

			this.showUpload = true
		},
		stockDownload () {
			let fileName = this.isFreetime ? 'freetime_temp.xlsx' : 'cancel_fee_temp.xlsx'
			this.$store
				.dispatch('finance/downloadBlobFile', {
					uri: '/bkg/file/temp/download',
					params: { folder: 'excel', fileName },
				})
				.then((res) => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.isFreetime ? 'Freetime导入模板.xlsx' : '退仓费导入模板.xlsx'
					link.click()
				})
			// stockDownload({ folder: 'excel', FileName: 'so_import_temp.xlsx' }).then((res) => {})
		},
		//批量导入
		sendResUpload (data) {
			this.errorFile = data.data.errorFile
			if (data.data.errorFile) {
				const h = this.$createElement;
				this.$msgbox({
					title: '',
					message: h('div', { style: "text-align:center;padding:10px 0" }, [
						h('i', { class: "el-icon-warning", style: "display: inline-block;font-size: 38px;color:#CD4130" }, ''),
						h('p', null, '数据导入异常，请检查数据？ '),
						h('p', null, data.data.resultMsg),
						h('a', { style: 'color: #3E80F5;text-decoration:underline;', on: { click: this.onSendResUpload }, }, '下载异常数据')
					]),
					showCancelButton: false,
					confirmButtonText: "关闭",
				}).then(action => {
					// this.onSendResUpload()
				}).catch(err => {
				})
			} else {
				const h = this.$createElement;
				this.$msgbox({
					title: '',
					message: h('div', { style: "text-align:center;padding:16px 0" }, [
						h('i', { class: "el-icon-success", style: "display: inline-block;font-size: 38px;color:#33B18A" }, ''),
						h('p', null, data.data.resultMsg),
					]),
					showCancelButton: false,
					confirmButtonText: '关闭',
				}).then(action => {
				}).catch(err => {
				})
			}
		},
		closeUpload () {
			this.showUpload = false
			this.getData()
		},
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			role: state => state.user.role,
			bdRoles: state => state.user.bdRoles,
			opRoles: state => state.user.opRoles,
		}),
	},
	watch: {
	},
	components: {
		FinanceTable,
		FinanceSearch,
		FinanceUpload
	}
}
</script>
<style lang="scss" >
.receivable-file-upload {
	display: block !important;
}
.download-model {
	width: 100%;
	text-align: left;
}
</style>