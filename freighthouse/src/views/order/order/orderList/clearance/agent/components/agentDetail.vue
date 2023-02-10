<template>
	<div class="agentDetail">
		<el-form ref="form" label-width="90px">
			<div class="info-tit" id="saveBar">
				<span class="tit">报关委托单号: {{ intrustNo }}</span>
				<div class="row-tit-operate">
					<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="noPermit || isDisabledEdit" 
						btnText="保存" 
						:tipContent="noPermitTip || isFinishTip || statusTip || isJointTip" 
						class="operateBtn-tip ml10" 
						@click="callBack({ type: 'save' })">
					</ButtonTip>
					<!-- <el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="noPermit || isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<div class="info-tit isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<span class="tit">报关委托单号: {{ intrustNo }}</span>
				<div class="row-tit-operate">
					<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="noPermit || isDisabledEdit" 
						btnText="保存" 
						:tipContent="noPermitTip || isFinishTip || statusTip || isJointTip" 
						class="operateBtn-tip ml10" 
						@click="callBack({ type: 'save' })">
					</ButtonTip>
					<!-- <el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="noPermit || isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<div class="agent-row-body">
				<el-row>
					<el-col :span="ele.key === 'remark' ? 18 : 6" v-for="(ele, index) in inputItem.items" :key="index">
						<FormItem :item="ele" :form="inputItem.form" />
					</el-col>
				</el-row>
				<!-- 报关委托单  -->
				<DefaultTableComp class="agent-table" :class="noPermit ? 'disabled' : ''" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" />
			</div>
		</el-form>
		<!-- 集装箱弹窗 -->
		<div v-if="showContainer">
			<ContainerDialog :disabledContainers="disabledContainers" :declarationId="declarationId" :defaultSelectIds="defaultSelectIds" @addContainerFun="addContainerFun" @close="closeDialog"></ContainerDialog>
		</div>
		<!-- 商品弹窗 -->
		<div v-if="showCargo">
			<CargoDialog :noPermit="noPermit" :customsCargoList="customsCargoList" @addContainerFun="addContainerFun" @close="closeDialog"></CargoDialog>
		</div>
		<!-- 关联委派信息弹窗 -->
		<div v-if="showIntrust">
			<PopIntrust @close="popIntrustClose" :disabledContainers="disabledContainers" :containerId="currentRowcontainerId"></PopIntrust>
		</div>
		<div v-if="popFileShow">
			<PopFile :tableData.sync="fileList" @close="popFileClose" @delFile="delFileFn" showDelBtn/>
		</div>
		<div v-if="uploadPopShow">
      <FileUpload @close="uploadPopClose" />
    </div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { mixin } from '../../mixin'
import { handleData } from '../../../../js/handleData'
import FormItem from '@/components/Form/elFormItem'
import { getCustomsDetail, listBoundContainer } from '@/api/order/list'
import DefaultTableComp from '../../../../components/defaultTableComp'
import ContainerDialog from './containerDialog'
import CargoDialog from './cargoDialog'
import TableColumnPopover from './tableColumnPopover'
import PopIntrust from './popRelateIntrust'
import PopFile from './popFile'
import FileUpload from './fileUpload'
import { baseSupplierList, shipTradeModeList } from '@/api/base'
import { supplierInfo } from '@/api/crm/supplier'
import { getDictMap, copyArry } from '@/utils/tools'

const defaultAddList = {
	companyTitle: '',
	customsNo: '',
	tradeTypeCode: '',
	containers: '',
	commodityNos: ''
}

export default {
	mixins: [mixin],
	data() {
		return {
			fileClumIndex:'',
			uploadPopShow: false,
			containerIds: [],
			disabledContainers: [],
			oQuery: this.$route.query,
			formDetailData: {},
			inputItem: this.setInputItem({isRelease: 'N', isPayTaxes: 'N'}), // 委托详情 输入框信息
			tableInfo: {
				title: '报关委托单',
				titleBtnList: [{ label: '新增报关单', key: 'add', type: 'primary',disabled:this.isDisabledEdit, tipContent: this.isFinishTip || this.statusTip || this.isJointTip }]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: false,
					// 是否支持列表项选中功能
					mutiSelect: false,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ customsNo }) {
						return customsNo ? true : false
					}
				},
				columns: handleData.agentDetailColumn(this.handleViewFile, this.handleRelate, TableColumnPopover, this.customerSearch, this.getShipTradeModeList,this.handleUploadFile), //  表格显示的表头
				list: [],
				// 操作按钮组
				operationBtns: {
					width: '150px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						let fn = this['handle' + action]
						if (typeof fn !== 'function') return
						this['handle' + action](row, $index)
					},
					data: [
						{
							label: '集装箱',
							type: 'text',
							show: (item, row) => {
								// 整箱需要集装箱，散货无集装箱
								return ['ship_export_fcl','ship_customs','ship_export_customs','ship_import_customs'].includes(this.orderInfoData.businessType)
							},
							action: 'Container'
						},
						{
							label: '商品',
							type: 'text',
							show: (item, row) => {
								return true
							},
							action: 'Cargo'
						},
						{
							label: '删除',
							type: 'text',
							className: 'delete-class',
							show: true,
							disabled:(item, row) => {
								if (this.noPermit || this.isDisabledEdit) {
									return true
								} else {
									return false
								}
							},
							tipContent: this.noPermitTip || this.isFinishTip || this.statusTip || this.isJointTip,
							action: 'Delete'
						}
					]
				},

				// 操作提示
				tips: {
					text: '',
					show: false
				},

				// 分页
				pagination: {
					show: false,
					total: 0
				}
			},
			showContainer: false, // 集装箱弹窗是否显示
			declarationId: '', // 当前集装箱弹窗所在的报关委托单
			showCargo: false, // 商品弹窗是否显示
			currentRowIndex: null, // 点击集装箱，商品所在的行数
			customsCargoList: [],
			customsSupplierName: '', // 报关行名称
			restaurants: [], // 供应商所有值
			intrustNo: this.newIntrustNo || '', // 报关委托单号
			defaultSelectIds: [], // 打开集装箱弹窗，默认选中id
			contactInfo: [],
			showIntrust: false, // 打开关联委派信息弹窗
			currentRowcontainerId: '',
			popFileShow: false, // 查看附件弹窗
			fileList: []
		}
	},
	props: {
		oid: '',
		newIntrustNo: '',
		isJoint: false,
		orderInfoData: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		noPermitTip: {
			type: String,
			default: ''
		},
		isFinishTip: {
			type: String,
			default: ''
		},
		statusTip: {
			type: String,
			default: ''
		},
		isJointTip: {
			type: String,
			default: ''
		}
	},
	created() {
		this.getContainerList()
		if (this.oid) this.getDetailInfo()
		if (!this.oid) {
			this.tableConfig.list.push({ ...defaultAddList })
		}
		// 散杂滚装、散货拼箱报关没有集装箱，没有关联委派信息
		if (['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType)) {
			this.tableConfig.columns = this.tableConfig.columns.filter(item => !['containers', 'relate', 'fileList'].includes(item.prop))
		}
		if (this.noPermit) {
			this.tableInfo.titleBtnList = []
			this.tableConfig.columns = handleData.agentDetailColumn(this.handleViewFile, this.handleRelate, TableColumnPopover, this.customerSearch, this.getShipTradeModeList,this.handleUploadFile, true)
		}
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		noPermit() {
			// 整箱-op_truck,已完成，被协同 
			if (['ship_export_fcl'].includes(this.orderInfoData.businessType)) {
				// || this.formDetailData.intrustStatus === 'intrusted'
				return this.isBd || this.isJoint || !this.isOpTruck
			}
			// 散杂滚装、拼箱-op,op_truck
			if (['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType)) {
				// || this.formDetailData.intrustStatus === 'intrusted'
				return this.isBd || this.isJoint || (!this.isOpTruck && !this.isOp)
			}
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed ? {
				left: '120px',
				top: offsetTop + 24 + 'px'
			} : {}
		}
	},
	components: {
		FormItem,
		DefaultTableComp,
		ContainerDialog,
		CargoDialog,
		TableColumnPopover,
		PopIntrust,
		PopFile,
		FileUpload
	},
	watch: {
		'inputItem.form.isRelease':function(val){
			// console.log(this.inputItem.items)
			let index=this.inputItem.items.findIndex(el=>el.key==='releaseTime')
			if(val==='Y'){
				this.$set(this.inputItem.items[index],'required',true)
			}else{
				this.$set(this.inputItem.items[index],'required',false)
			}
		},
		oid(newval) {
			console.log('🚀 ~ newval', newval)
			if (!newval) {
				this.formDetailData = {}
				this.inputItem = this.setInputItem({isRelease: 'N', isPayTaxes: 'N'})
				console.log(this.newIntrustNo)
				this.intrustNo = this.newIntrustNo
				this.tableConfig.list = []
				this.tableConfig.list.push({ ...defaultAddList })
			} else {
				this.getDetailInfo()
				this.getContainerList()
			}
		},
		noPermit(val) {
			if (val) {
				this.tableInfo.titleBtnList = []
				this.tableConfig.columns = handleData.agentDetailColumn(this.handleViewFile, this.handleRelate, TableColumnPopover, this.customerSearch, this.getShipTradeModeList,this.handleUploadFile, true)
			} else {
				this.tableConfig.columns = handleData.agentDetailColumn(this.handleViewFile, this.handleRelate, TableColumnPopover, this.customerSearch, this.getShipTradeModeList,this.handleUploadFile)
				this.tableInfo.titleBtnList =[{ label: '新增报关单', key: 'add', type: 'primary',disabled:this.isDisabledEdit, tipContent: this.isFinishTip || this.statusTip || this.isJointTip }]
			}
		}
	},
	methods: {
		delFileFn(index){

		},
		getContainerList() {
			listBoundContainer({ orderNo: this.oQuery.orderNo }).then(res => {
				this.containerIds = res.data
			})
		},
		getDetailInfo() {
			getCustomsDetail({ oid: this.oid, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.formDetailData = res.data
				this.inputItem = this.setInputItem(res.data)
				this.intrustNo = this.newIntrustNo || res.data.intrustNo || ''
				if (res.data && res.data.customsDeclarationList) {
					this.tableConfig.list = copyArry(this.arrCustomsDeclarationList(res.data.customsDeclarationList))
				}
				// 已委托不可修改保存
				if (this.noPermit) {
					this.tableInfo.titleBtnList = []
					this.tableConfig.columns = handleData.agentDetailColumn(this.handleViewFile, this.handleRelate, TableColumnPopover, this.customerSearch, this.getShipTradeModeList,this.handleUploadFile, true)
				} else {
					this.tableConfig.columns = handleData.agentDetailColumn(this.handleViewFile, this.handleRelate, TableColumnPopover, this.customerSearch, this.getShipTradeModeList,this.handleUploadFile)
					this.tableInfo.titleBtnList = [{ label: '新增报关单', key: 'add', type: 'primary',disabled:this.isDisabledEdit, tipContent: this.isFinishTip || this.statusTip || this.isJointTip  }]
				}
			})
		},
		arrCustomsDeclarationList(data) {
			return data.map((v, i) => {
				// 集装箱信息
				let soList = this.arrContainerList(v.customsContainerList)
				v.containers = soList.label
				v.soList = soList
				v.customsContainerList = [...v.customsContainerList]
				// 商品编号
				v.commodityNos = this.arrCargoList(v.customsCargoList)
				return v
			})
		},
		arrContainerList(data) {
			let soList = { label: '', list: [] }
			// 集装箱信息
			let soArr = [...new Set(data.map(item => item.so))]
			let cnArr = data.map(item => item.cn)
			soList.label = cnArr.join('、')
			soArr.forEach(so => {
				let cnList = []
				data.map(item => {
					if (item.so == so) cnList.push(item.cn)
				})
				soList.list.push({ so: so, cn: cnList.join('、') })
			})
			return soList
		},
		arrCargoList(data) {
			return [...new Set(data.map(item => item.commodityNo))].join('、')
		},
		setInputItem(data) {
			if (data.customsSupplierId) {
				supplierInfo({ supplierId: data.customsSupplierId }).then(res => {
					let { contact } = res.data
					self.restaurants = self.loadAll(contact)
				})
			}
			let self = this
			return {
				form: {
					intrustNo: self.intrustNo || data.intrustNo || '',
					customsSupplierName: data.customsSupplierName || '',
					customsSupplierId: data.customsSupplierId || '',
					customsType: data.customsType || '',
					declarant: data.declarant || '',
					declarantPhone: data.declarantPhone || '',
					intrustTime: data.intrustTime || '',
					remark: data.remark || '',
					customsNumber: data.customsNumber || '',
					releaseTime: data.releaseTime || '',
					isPayTaxes: data.isPayTaxes || '',
					isRelease: data.isRelease
				},
				items: [
					{ label: '报关方式', key: 'customsType', type: 'select', options: getDictMap('customsType'), required: true },
					{
						label: '报关行',
						key: 'customsSupplierId',
						type: 'select',
						inputType: 'text',
						required: true,
						filterable: true,
						options: [{ value: data.customsSupplierId, label: data.customsSupplierName }],
						filterMethod: (queryString, item) => {
							self.getSupplierList(queryString, item)
						},
						visibleChange: (value, item) => {
							if (value) self.getSupplierList('', item)
						},
						change(value, item) {
							if (value) {
								self.inputItem.form.customsSupplierName = item.options.filter(o => o.value === value)[0].label
								supplierInfo({ supplierId: value }).then(res => {
									let { contact } = res.data
									Object.assign(self.inputItem.form, {
										declarant: contact && contact.length ? contact[0].name || contact[0].ename : '',
										declarantPhone: contact && contact.length ? contact[0].mobileNo : ''
									})
									self.restaurants = self.loadAll(contact)
								})
							}
						}
					},
					{
						label: '报关员姓名',
						key: 'declarant',
						type: 'autocomplete',
						inputType: 'text',
						// required: true,
						querySearch: (queryString, cb) => {
							let restaurants = this.restaurants
							let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
							cb(results)
						},
						handleSelect: item => {
							if (item.value) {
								for (let i = 0; i < this.contactInfo.length; i++) {
									if (item.value === this.contactInfo[i].value) {
										Object.assign(this.inputItem.form, {
											declarantPhone: this.contactInfo[i].mobileNo
										})
										return
									}
								}
							}
						}
					},
					{ label: '报关员电话', key: 'declarantPhone', type: 'input', inputType: 'text' },
					{ label: '委托日期', key: 'intrustTime', type: 'datetimeLimit' },
					{ label: '正报几票', key: 'customsNumber', type: 'input', inputType: 'text', hide: ['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType) },
					{ label: '报关放行', key: 'isRelease', type: 'radio', options: [{label: '是', value: 'Y'}, {label: '否', value: 'N'}]},
					{ label: '报关放行时间', key: 'releaseTime', type: 'datetimeLimit', required: false },
					{ label: '代垫税金', key: 'isPayTaxes', type: 'radio', options: [{label: '是', value: 'Y'}, {label: '否', value: 'N'}]},
					{ label: '报关备注', key: 'remark', type: 'input', inputType: 'text', maxlength: '512', showWordLimit: true }
				]
			}
		},
		// 选择集装箱弹窗关闭回调
		containersPopClose(action, data) {
			this.showContainer = false
			if (action === 'Confirm') {
				// 集装箱列表
				let soList = this.arrContainerList(data)
				this.tableConfig.list.map((item, index) => {
					if (index == this.currentRowIndex) {
						item.containers = soList.label
						item.soList = soList
						item.customsContainerList = [...data]
					}
				})
				this.$forceUpdate()
			}
		},
		// 委托单列表 新增集装箱/商品
		addContainerFun(data) {
			if (data.type == 'Container') {
				// 集装箱列表
				let soList = this.arrContainerList(data.list)
				this.tableConfig.list.map((item, index) => {
					if (index == this.currentRowIndex) {
						item.containers = soList.label
						item.soList = soList
						item.customsContainerList = [...data.list]
					}
				})
				this.$forceUpdate()
			} else {
				// 商品编号
				this.tableConfig.list.map((item, index) => {
					if (index == this.currentRowIndex) {
						item.commodityNos = this.arrCargoList(data.list)
						item.customsCargoList = [...data.list]
					}
				})
			}
		},
		// 表格按钮回调
		callBack(data) {
			if (data.type == 'save') {
				this.formDetailData = Object.assign(this.formDetailData, this.inputItem.form, {
					intrustNo: this.intrustNo
				})
				// 件数传参给后端0，修复后端报件数>999999
				let customsDeclarationList = [...this.tableConfig.list]
				customsDeclarationList.forEach(item => {
					item.customsCargoList &&
						item.customsCargoList.forEach(ele => {
							if (!ele.quantity) ele.quantity = 0
						})
					if(item.fileList && item.fileList.length) {
						item.fileNoList = item.fileList.map(item => {
							return item.fileNo
						})
					}	
					delete item.containers
					delete item.soList
					delete item.fileList
				})
				this.formDetailData.customsDeclarationList = [...customsDeclarationList]
				data.list = this.formDetailData
			}
			console.log(data)
			this.$emit('callBack', data)
		},
		// 表格按钮回调
		tableClick(type) {
			if (type == 'add') {
				this.tableConfig.list.push({ ...defaultAddList })
			}
		},
		// 新增集装箱
		handleContainer(row, index) {
			this.showContainer = true
			this.declarationId = row.declarationId || ''
			this.currentRowIndex = index
			this.defaultSelectIds = (row.customsContainerList && [...row.customsContainerList.map(item => item.containerId)]) || []
			let selectContainers = this.tableConfig.list
				.reduce((arr, cur) => {
					if (cur.customsContainerList) {
						arr = [...arr, ...cur.customsContainerList]
					}
					return arr
				}, [])
				.map(item => item.containerId)
				.filter(item => !this.defaultSelectIds.includes(item))

			this.disabledContainers = [...new Set([...this.containerIds, ...selectContainers])].filter(item => !this.defaultSelectIds.includes(item)).map(item => item.toString())
		},

		// 新增商品
		handleCargo(row, index) {
			this.showCargo = true
			this.currentRowIndex = index
			this.customsCargoList = row.customsCargoList
		},
		// 表格操作回调
		handleDelete(row, index) {
			this.tableConfig.list.splice(index, 1)
		},
		closeDialog() {
			this.showContainer = false
			this.showCargo = false
		},
		createFilter(queryString) {
			return restaurant => {
				return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
			}
		},
		loadAll(data) {
			let arr = []
			for (let i = 0; i < data.length; i++) {
				let obj = {}
				obj.value = data[i].name || data[i].ename
				obj.mobileNo = data[i].mobileNo
				arr.push(obj)
			}
			this.contactInfo = arr
			return arr
		},
		// 获取订舱代理
		getSupplierList(queryString, item) {
			this.$store.dispatch('dict/querySupplierList', { category: 'category', value: 'declaration', queryString: queryString }).then(data => {
				item.options =
					(data.list &&
						data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})) ||
					[]
			})
		},
		// 贸易方式模糊查询
		getShipTradeModeList(queryString, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				queryKey: queryString
			}
			shipTradeModeList(data).then(res => {
				item.data =
					(res.data &&
						res.data.list.map(o => {
							return {
								label: o.shortName,
								value: o.code
							}
						})) ||
					[]
			})
		},
		// 客商模糊查询
		customerSearch(val, item) {
			this.$store.dispatch('dict/queryCustomerList', val || '').then(data => {
				let list = data.list
				item.data = list.map(o => {
					return {
						value: this.$language == 'en' ? o.ename : o.name,
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		},
		// 关联委派信息弹窗
		handleRelate(index, row) {
			if (this.noPermit) {
				return
			}
			this.showIntrust = true
			let { customsContainerList } = row
			let containerIdArr = []
			if (customsContainerList && customsContainerList.length) {
				containerIdArr = customsContainerList.map(item => item.containerId)
			}
			this.currentRowIndex = index
			this.declarationId = row.declarationId || ''
			this.currentRowcontainerId = containerIdArr.join(',')
			let selectContainers = this.tableConfig.list
				.reduce((arr, cur) => {
					if (cur.customsContainerList) {
						arr = [...arr, ...cur.customsContainerList]
					}
					return arr
				}, [])
				.map(item => item.containerId.toString())

			this.disabledContainers = [...new Set([...this.containerIds, ...selectContainers])].map(item => item.toString())
		},
		// 关闭关联委派信息弹窗回调
		popIntrustClose(action, value) {
			if (action === 'Confirm') {
				this.showIntrust = false
				this.handleSetIntrustData(value)
			} else {
				this.showIntrust = false
			}
		},
		handleSetIntrustData(value) {
			console.log(value)
			Object.assign(this.inputItem.form, {
				customsType: value.customsType,
				customsNumber: value.customsNumber,
				remark: value.remark
			})
			// 集装箱信息
			let soList = { label: '', list: [] }
			let soArr = value.so.split(',')
			let cnArr = value.cn.split(',')
			let containerIdArr = value.containerId.split(',')
			let data = []

			soList.label = cnArr.join('、')
			soArr.forEach((so, index) => {
				data.push({
					cn: cnArr[index],
					so: so,
					containerId: containerIdArr[index],
					orderNo: this.$route.query.orderNo,
					declarationId: this.declarationId
				})
				soList.list.push({ so: so, cn: cnArr[index] })
			})
			this.tableConfig.list.map((item, index) => {
				if (index == this.currentRowIndex) {
					item.containers = value.cn
					item.soList = soList
					item.customsContainerList = [...data]
					item.fileList = value.fileList
					item.fileNoList = value.fileNo.split(',')
				}
			})

			this.$forceUpdate()
		},
		// 查看附件
		handleViewFile(index, row) {
			this.popFileShow = true
			this.fileList = row.fileList
			console.log('查看附件', row.fileList)
		},
		popFileClose() {
			this.popFileShow = false
		},
		handleUploadFile(index, row) {
			console.log(index)
			this.fileClumIndex = index
			this.uploadPopShow = true
			this.fileList = row.fileList
		},
		uploadPopClose(action,data) {
			this.uploadPopShow = false
      if (action === 'Confirm') {
				if(!this.tableConfig.list[this.fileClumIndex].fileList){
					this.tableConfig.list[this.fileClumIndex].fileList=[]
				}
				this.tableConfig.list[this.fileClumIndex].fileList=this.tableConfig.list[this.fileClumIndex].fileList.concat(data)
				
				let arr=[]
				for(let i=0;i<this.tableConfig.list[this.fileClumIndex].fileList.length;i++){
					arr.push(this.tableConfig.list[this.fileClumIndex].fileList[i].fileNo)
				}
				this.tableConfig.list[this.fileClumIndex].fileNoList=arr
      }
		}
	}
}
</script>
<style lang="scss">
.agentDetail {
	border-top: 12px solid #f5f7f9;
	.el-checkbox__label {
		display: inline-block;
		padding-left: 6px;
		line-height: 19px;
		font-size: 12px;
	}
	.agent-row-body {
		padding: 0 20px 10px 20px;
		.el-radio__label{
			font-size: 12px;
		}
		.el-form-item {
			margin-bottom: 4px !important;
		}
		.el-form-item__content {
			margin-right: 10px;
			line-height: 20px;
		}
		.el-form-item__label {
			// padding: 0;
			line-height: 20px;
			padding-right: 4px;
		}
		.el-form-item__label,
		.el-form-item__content {
			line-height: 20px;
		}
		.row-tit,
		.row-table {
			padding: 0 !important;
		}
		.agent-table {
			.column-text-btn .relate {
				height: 20px;
				border-radius: 2px;
				border: 1px solid #3e80f5;
				padding: 0 10px;
				color: #3e80f5;
				cursor: pointer;
			}
			&.disabled {
				.column-text-btn .relate {
					border: 1px solid #e6ebf5;
					color: #c0c0c0;
					background-color: #fff;
				}
			}
		}
	}
	.el-form--label-top .el-form-item__label {
		float: left;
	}
	.el-autocomplete {
		display: block;
	}
	.info-tit {
		display: flex;
		justify-content: space-between;
		height: 40px;
		line-height: 20px;
		margin-bottom: 10px;
		padding: 10px 20px !important;
		border-bottom: 1px solid #e9e9e9;
		.tit {
			line-height: 20px !important;
			font-weight: bold;
			font-size: 12px;
		}
		&.isFixed{
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
			height: 30px;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			// top: 64px;
			right: 0;
			.tit{
				line-height: 20px;
			}
		}
	}
	.delete-class {
		color: #CD4130;
	}
}
</style>
