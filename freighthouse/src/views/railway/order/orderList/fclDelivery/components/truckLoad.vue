<template>
	<div class="edit-container pod-truck-detail">
		<!-- 详情 -->
		<div class="component-cont fclIntrustDetail">
			<div class="mb10 between h32 border-bt" id="saveBar">
				<div class="ft12 bold">新建计划(委托编号:{{ createItem.intrustNo }})</div>
				<div class="el-button-group">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isDisabledEdit" :loading="saveLoading">保存</el-button>
				</div>
			</div>
			<div class="mb10 between h32 border-bt isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<div class="ft12 bold">新建计划(委托编号:{{ createItem.intrustNo }})</div>
				<div class="el-button-group">
					<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
					<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isDisabledEdit" :loading="saveLoading">保存</el-button>
				</div>
			</div>
			<el-form ref="fclIntrustInfo" :rules="rules" :model="createItem" class="row-body" label-width="95px">
				<el-row>
					<el-col :span="6">
						<div class="intrust-plan-title">
							派送信息
						</div>

						<el-form-item label="收货人" prop="consignee" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="createItem.consignee" clearable></el-input>
						</el-form-item>
						<el-form-item label="收货人电话" prop="consigneePhone" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="createItem.consigneePhone" clearable></el-input>
						</el-form-item>
						<el-form-item label="收货人邮箱" prop="consigneeEmail" :show-message="false">
							<el-input maxlength="128" size="mini" placeholder="请输入" v-model="createItem.consigneeEmail" clearable></el-input>
						</el-form-item>
						<el-form-item label="邮政编码" prop="postcode" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="createItem.postcode" clearable :disabled="isDisabled || isDisabledEdit"></el-input>
						</el-form-item>
						<el-form-item label="收货工厂" prop="recvFactory" :show-message="false">
							<el-input maxlength="32" size="mini" placeholder="请输入" v-model="createItem.recvFactory" clearable :disabled="isDisabled || isDisabledEdit"></el-input>
						</el-form-item>
						<el-form-item label="卸货详细地址" prop="unloadAddress" :show-message="false">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="createItem.unloadAddress" clearable class="box-address-input" maxlength="512" :disabled="isDisabled || isDisabledEdit"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('un')">选择</el-button>
							</div>
						</el-form-item>
						<el-form-item label="快捷输入">
							<div class="box-address-flex">
								<el-input class="box-address-input" size="mini" clearable v-model="quickInputModel" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
								<el-button size="mini" type="primary" class="box-address-btn" @click="handleQuickInput('unload')">填充</el-button>
							</div>
						</el-form-item>
						<el-form-item label="备注" prop="remark">
							<el-input size="mini" placeholder="请输入" v-model="createItem.remark" clearable :disabled="isDisabled || isDisabledEdit" maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<div class="intrust-plan-title">
							装货信息
						</div>

						<el-form-item label="装货人" prop="loadContact">
							<el-input size="mini" placeholder="请输入" v-model="createItem.loadContact" clearable></el-input>
						</el-form-item>
						<el-form-item label="装货人电话" prop="loadContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="createItem.loadContactPhone" clearable></el-input>
						</el-form-item>
						<el-form-item label="装货详细地址" prop="loadAddress">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="createItem.loadAddress" clearable class="box-address-input" maxlength="512" :disabled="isDisabled || isDisabledEdit"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('on')">选择</el-button>
							</div>
						</el-form-item>

						<el-form-item label="快捷输入">
							<div class="box-address-flex">
								<el-input class="box-address-input" size="mini" clearable v-model="quickInputModelBox" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
								<el-button class="box-address-btn" size="mini" type="primary" @click="handleQuickInput('box')">填充</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<div class="intrust-plan-title">
							代理&车队信息
						</div>

						<el-form-item label="海外代理" prop="overseaAgentSupplierId">
							<el-select
								v-model="createItem.overseaAgentSupplierId"
								size="mini"
								clearable
								placeholder="请选择"
								style="width: 100%"
								remote
								filterable
								@visible-change="supplierVisibleChange"
								:filter-method="supplierFilterMehod"
								@change="handleSelectSupplierName"
							>
								<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="海外分公司" prop="overseasCompanyCode">
							<el-select v-model="createItem.overseasCompanyCode" size="mini" placeholder="请选择" style="width: 100%" clearable="" @change="changeOverseasCompany">
								<el-option v-for="(item, index) in abroadCompanyList" :label="item.companyName" :value="item.companyCode" :key="index"> </el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="车队" prop="supplierName" :show-message="false">
							<el-select style="width: 100%" placeholder="请选择" size="mini" v-model="createItem.supplierId" clearable :filterable="true" @visible-change="carVisibleChange" :filter-method="carFilterMehod" @change="val => handleCarSupplierName(val)">
								<el-option v-for="item in carSupplierList" :key="item.supplierId" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="车队联系电话" prop="supplierPhone" :show-message="false">
							<el-input size="mini" placeholder="请输入" clearable v-model="createItem.supplierPhone"></el-input>
						</el-form-item>
						<el-form-item label="车队联系人" prop="supplierContact" :show-message="false">
							<el-input size="mini" placeholder="请输入" clearable v-model="createItem.supplierContact"></el-input>
						</el-form-item>
						<el-form-item label="车队联系人电话" prop="supplierContactPhone" :show-message="false">
							<el-input size="mini" placeholder="请输入" clearable v-model="createItem.supplierContactPhone"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<div class="intrust-plan-title">
							派送节点
						</div>

						<el-form-item label="委托状态" prop="status" :show-message="false">
							<el-select style="width: 100%" placeholder="请选择" size="mini" :disabled="['add', 'copy'].includes(actionType)" v-model="createItem.status">
								<el-option v-for="(item, index) in dictMap.podDeliveryFclStatus" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="预计派送时间" :show-message="false" prop="preDeliveryTime">
							<elDatePickerLimit size="mini" v-model="createItem.preDeliveryTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
						<el-form-item label="实际派送时间" prop="deliveryTime" :show-message="false">
							<elDatePickerLimit noCanFuture size="mini" v-model="createItem.deliveryTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
						<el-form-item label="还空柜时间" prop="returnEmptyBoxTime" :show-message="false">
							<elDatePickerLimit noCanFuture size="mini" v-model="createItem.returnEmptyBoxTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
					</el-col>
				</el-row>
				<!-- 集装箱信息 -->
				<BindContainer :createItem="createItem" :isDisabledEdit="isDisabledEdit" :bindContainerList="createItem.cargoInfoList" @bind="handleBind" @importFile="importFileCallback" @cancelBind="handleCancelBind" />
				<div v-if="addressPopShow">
					<AddressPop @close="addressPopClose"></AddressPop>
				</div>
			</el-form>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { baseSupplierList, getForeignCity, getDomesticCity, getRegionAll, fclTruckIntrustRegion } from '@/api/base'
import { fclIntrustInfo, fclLoadDelete, fclIntrustSave, pushToEcs, fclIntrustCopy } from '@/api/order/podService/fclDelivery'
import BindContainer from './bindContainer'
import CargoInfo from './cargoInfo'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'
import SoInfoPop from './soInfoPop'
import { arrayHasDuplicateValue, unique } from '@/utils/index'
import { updateOverseasInfo, overseasTips, abroadCompanyList, overseasCanModify } from '@/api/order/list'
import { supplierInfo } from '@/api/crm/supplier'

const defaultQuery = {
	currPage: 1,
	pageSize: 30,
	query: [{ column: 'supplierName', type: 'default', value: '' }]
}
const defaultCreateQuery = {
	intrustNo: '',
	loadId: '',
	orderNo: '',
	custid: '',
	custName: '',
	preDeliveryTime: '',
	deliveryTime: '',
	returnEmptyBoxTime: '',
	portCode: '',
	loadAddress: '',
	unloadAddress: '',
	postcode: '',
	inPlanNo: '',
	remark: '',
	cargoInfoList: [],
	loadPlace: [],
	loadCountry: '',
	loadProvince: '',
	loadCity: '',
	loadDistrict: '',
	unloadPlace: [],
	unloadCountry: '',
	unloadProvince: '',
	unloadCity: '',
	unloadDistrict: '',
	consignee: '',
	consigneePhone: '',
	consigneeEmail: '',
	deliveryAddress: '',
	status: 'init',
	overseaAgentSupplierId: '',
	overseaAgentSupplierName: '',
	overseasCompanyCode: '',
	overseasCompanyName: '',
	loadContact: '',
	loadContactPhone: '',
	supplierId: '',
	supplierContact: '',
	supplierContactPhone: '',
	supplierPhone: '',
	recvFactory: ''
}

export default {
	filters: {
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		},
		podDeliveryFclStatusFilter(status) {
			return getDictLabel('podDeliveryFclStatus', status)
		}
	},
	props: {
		activityType: {
			type: String,
			default: ''
		},
		truckDetailQuery: {
			type: Object,
			default: () => ({})
		},
		actionType: {
			type: String,
			default: 'add'
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			abroadCompanyList: [],
			supplierList: [],
			carSupplierList: [],
			overseasAgentList: [],
			showCasPlace: true,
			isChina: true,
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			loadPlaceData: [],
			unloadPlaceData: [],
			// showDetail: false,
			createItem: Object.assign({}, defaultCreateQuery),
			infoData: {
				intrustNo: '',
				status: 'init',
				overseaAgentSupplierName: '',
				overseaAgentSupplierId: '',
				supplierId: '',
				supplierName: '',
				supplierContact: '',
				supplierContactPhone: '',
				supplierPhone: '',
				remark: '',
				loadInfoList: []
			},
			state: 'valid',
			portList: [],
			containerItem: {
				oid: '',
				cn: '',
				containerId: '',
				containerType: '',
				packageType: '',
				volume: '',
				weight: '',
				quantity: '',
				driverName: '',
				driverPhone: '',
				licensePlate: ''
			},
			// 发货单位下拉搜索
			custidOptions: [],
			type: '', // 保存类型,新增/编辑
			cargoInfoShow: false,
			cargoInfoList: [],
			rules: {
				unloadAddress: [{ required: true, message: '请输入卸货详细地址', trigger: 'blur' }],
				postcode: [{ required: false, message: '请输入邮政编码', trigger: 'blur' }],
				consignee: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
				consigneePhone: [{ required: true, message: '请输入收货人电话', trigger: 'blur' }],
				consigneeEmail: [{ required: true, message: '请输入收货人邮箱', trigger: 'blur' }],
				preDeliveryTime: [{ required: false, message: '', trigger: 'change' }],
				deliveryTime: [{ required: false, message: '', trigger: 'change' }],
				returnEmptyBoxTime: [{ required: false, message: '', trigger: 'change' }]
			},
			quickInputModel: '',
			quickInputModelBox: '',
			addressPopShow: false,
			loadType: '',
			soInfoPopShow: false,
			saveLoading: false
		}
	},
	created() {
		console.log('🚀 ~ this.truckDetailQuery--created', this.truckDetailQuery, this.orderInfo)
		// 进口业务必填项设置
		if (this.isImport) {
			this.rules.consigneeEmail = [{ required: false, message: '', trigger: 'change' }]
		} else {
			this.rules.consigneeEmail = [{ required: true, message: '', trigger: 'change' }]
		}

		//获取国家城市级联框数据
		this.getLoadPlaceData()
		// 海外分公司
		this.getAbroadCompanyList()
		this.init()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList,
			orderInfoDataObj: state => state.order.orderInfoDataObj,
			userId: state => state.user.userId
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isBd() {
			let isJoint = this.isJoint
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			// let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || (!this.isDoc && !this.isEpricing && !this.isEcs)
			let isBd = !this.isDoc && !this.isEpricing && !this.isEcs && !this.isOp // 放开操作权限 v20220607
			return isBd || isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		viewState() {
			return this.truckDetailQuery.action === 'view' && !this.isDoc && !this.isEpricing && !this.isEcs
		},
		isDisabled() {
			// 已派车,已签收完成,已还柜这3个委托状态不可编辑；未委托，已委托可以编辑
			return false
			// return ['dispatched', 'finish', 'return'].includes(this.infoData.status)
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return this.isImport && this.$route.query.source === 'jointList'
		},
		// 业务类型为进口，海外仓的
		isImport() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfoDataObj.businessType)
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed
				? {
						left: '120px',
						top: offsetTop + 24 + 'px'
				  }
				: {}
		},
		quickPlaceholder() {
			if (['st09', 'st10', 'st11', 'st12'].includes(this.orderInfo.serviceType)) {
				return '请依次输入收货人、收货人电话、派送地址，中文逗号隔开'
			} else {
				return '请依次输入收货人、收货人电话、卸货详细地址、装货详细地址，中文逗号隔开'
			}
		}
	},
	components: {
		BindContainer,
		CargoInfo,
		AddressPop,
		SoInfoPop
	},
	watch: {
		truckDetailQuery: {
			handler(val) {
				console.log('🚀 ~ val', val)
				this.init()
			}
		},
		'createItem.status': {
			handler(val) {
				console.log('🚀 ~ val', val)
				if (['return', 'finish'].includes(val)) {
					this.rules.preDeliveryTime = [{ required: true, message: '', trigger: 'change' }]
					this.rules.deliveryTime = [{ required: true, message: '', trigger: 'change' }]
				} else {
					this.rules.preDeliveryTime = [{ required: false, message: '', trigger: 'change' }]
					this.rules.deliveryTime = [{ required: false, message: '', trigger: 'change' }]
				}
				if (['return'].includes(val)) {
					this.rules.returnEmptyBoxTime = [{ required: true, message: '', trigger: 'change' }]
				} else {
					this.rules.returnEmptyBoxTime = [{ required: false, message: '', trigger: 'change' }]
				}
			}
		}
	},
	methods: {
		handleSelectSupplierName(val) {
			console.log('🚀 ~ val', val)
			let item = this.supplierList.find(item => item.value == val)
			console.log('🚀 ~ item', item)
			console.log('🚀 ~ this.supplierList', this.supplierList)
			if (item) {
				this.createItem.overseaAgentSupplierName = item.label
			} else {
				this.createItem.overseaAgentSupplierName = ''
			}
		},
		supplierFilterMehod(val) {
			console.log('🚀 ~ val', val)
			if (this.createItem.overseaAgentSupplierName && !val) {
				val = this.createItem.overseaAgentSupplierName
			}
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			// if (val) {
			// 	this.getSupplierList()
			// }
		},
		getSupplierList(val = '') {
			this.$store
				.dispatch('dict/querySeviceOverseaList', {
					category: 'category',
					value: 'overseas_agent',
					queryString: val
				})
				.then(data => {
					this.supplierList = data.list
					this.supplierList.forEach(item => {
						Object.assign(item, {
							label: item.name,
							value: item.supplierId
						})
					})
				})
		},
		carFilterMehod(val) {
			this.getCarList(val)
		},
		carVisibleChange(val) {
			if (val) {
				this.getCarList()
			}
		},
		getCarList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'truck', queryString: val }).then(data => {
				this.carSupplierList = data.list.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
			})
		},
		// 选择车队下拉，自动填充车队联系人，联系电话
		handleCarSupplierName(val) {
			if (val) {
				console.log('🚀 ~ val', val)
				supplierInfo({ supplierId: val }).then(res => {
					if (res.data && res.data.contact && res.data.contact.length > 0) {
						this.createItem.supplierContact = res.data.contact[0].name
						this.createItem.supplierContactPhone = res.data.contact[0].mobileNo
					} else {
						this.createItem.supplierContact = ''
						this.createItem.supplierContactPhone = ''
					}
				})
			}
		},
		getAbroadCompanyList() {
			// 海外分公司
			abroadCompanyList({ isAbroad: 'yes' }).then(res => {
				if (res.data) {
					this.abroadCompanyList = res.data
				}
			})
		},
		// 选择海外分公司
		changeOverseasCompany(val) {
			let item = this.abroadCompanyList.find(item => item.companyCode == val)
			if (item) {
				this.createItem.overseasCompanyName = item.companyName
			} else {
				this.createItem.overseasCompanyName = ''
			}
		},

		showAddressPop(val) {
			this.loadType = val
			this.addressPopShow = true
		},
		addressPopClose(action, value) {
			this.addressPopShow = false
			if (action === 'Confirm') {
				if (this.loadType === 'on') {
					// this.createItem.loadPlace = [value.addressProvince, value.addressCity]
					// this.createItem.loadProvince = value.addressProvince
					// this.createItem.loadCity = value.addressCity
					this.createItem.loadContact = value.contactName
					this.createItem.loadContactPhone = value.contactPhone
					this.createItem.loadAddress = value.addressDetail
					this.showCasPlace = false
					if (!value.isChina) {
						this.createItem.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.createItem.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
					this.createItem.loadCountry = value.addressCountry
					this.createItem.loadProvince = value.addressProvince
					this.createItem.loadCity = value.addressCity
					this.createItem.loadDistrict = value.addressArea
					// // 国内省市区
					// if (this.isChina && value.isChina) {
					// 	this.createItem.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					// 	this.createItem.loadCountry = value.addressCountry
					// 	this.createItem.loadProvince = value.addressProvince
					// 	this.createItem.loadCity = value.addressCity
					// 	this.createItem.loadDistrict = value.addressArea
					// }
					// // 国外国家到洲，有的数据只有国家没有洲
					// if (!this.isChina && !value.isChina) {
					// 	this.createItem.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					// 	this.createItem.loadCountry = value.addressCountry
					// 	this.createItem.loadProvince = value.addressProvince
					// }
				}
				if (this.loadType === 'un') {
					// this.createItem.unloadPlace = [value.addressProvince, value.addressCity]
					// this.createItem.unloadProvince = value.addressProvince
					// this.createItem.unloadCity = value.addressCity
					this.createItem.consignee = value.contactName
					this.createItem.consigneePhone = value.contactPhone
					this.createItem.unloadAddress = value.addressDetail
					this.createItem.postcode = value.postCode
					this.showCasPlace = false
					if (!value.isChina) {
						this.createItem.unloadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.createItem.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
					this.createItem.unloadCountry = value.addressCountry
					this.createItem.unloadProvince = value.addressProvince
					this.createItem.unloadCity = value.addressCity
					this.createItem.unloadDistrict = value.addressArea

					// // 国内省市区
					// if (this.isChina && value.isChina) {
					// 	this.createItem.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					// 	this.createItem.unloadCountry = value.addressCountry
					// 	this.createItem.unloadProvince = value.addressProvince
					// 	this.createItem.unloadCity = value.addressCity
					// 	this.createItem.unloadDistrict = value.addressArea
					// }
					// // 国外国家到洲，有的数据只有国家没有洲
					// if (!this.isChina && !value.isChina) {
					// 	this.createItem.unloadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					// 	this.createItem.unloadCountry = value.addressCountry
					// 	this.createItem.unloadProvince = value.addressProvince
					// }
				}
			}
		},
		// 打开关联委托信息弹窗
		handleOpenSoInfoPop() {
			this.soInfoPopShow = true
		},
		soInfoPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.soInfoPopShow = false
				this.handleRelate(value)
			} else {
				this.soInfoPopShow = false
			}
		},
		handleRelate(row) {
			console.log(row)
			this.createItem.loadPlace = row.loadPlace ? JSON.parse(row.loadPlace) : []
			this.handleLoadChange(this.createItem.loadPlace)
			this.createItem.loadAddress = row.loadAddress
			this.createItem.unloadPlace = row.unloadPlace ? JSON.parse(row.unloadPlace) : []
			this.handleUnloadChange(this.createItem.unloadPlace)
			this.createItem.unloadAddress = row.unloadAddress
			this.createItem.consignee = row.consignee
			this.createItem.consigneePhone = row.consigneePhone
			this.createItem.consigneeEmail = row.consigneeEmail
			this.createItem.postcode = row.postCode
			this.createItem.remark = row.remark
			this.transitPortSearch(row.podPortCode, 'port_of_destination', this.state)
			this.createItem.portCode = row.podPortCode
			//处理装货地点级联选择器
			// this.createItem.loadPlace = row.boxProvince ? [row.boxProvince, row.boxCity, row.boxDistrict] : []
			console.log('this.createItem', this.createItem)
		},
		handleQuickInput(type) {
			if (this.quickInputModel || this.quickInputModelBox) {
				if (type === 'box') {
					// 收货
					let arr = this.quickInputModelBox.split('，')
					this.createItem.loadContact = arr[0] || ''
					this.createItem.loadContactPhone = arr[1] || ''
					this.createItem.loadAddress = arr[2] || ''
				} else {
					// 装货
					let arr = this.quickInputModel.split('，')
					this.createItem.consignee = arr[0] || ''
					this.createItem.consigneePhone = arr[1] || ''
					if (!this.isDisabled) this.createItem.unloadAddress = arr[2] || ''
					if (!this.isDisabled) this.createItem.loadAddress = arr[3] || ''
				}
			}
		},
		//卸货地点
		handleUnloadChange(val) {
			this.createItem.unloadCountry = val[0] || ''
			this.createItem.unloadProvince = val[1] || ''
			this.createItem.unloadCity = val[2] || ''
			this.createItem.unloadDistrict = val[3] || ''
			console.log('🚀 ~ this.unloadPlace', this.createItem.unloadPlace)
		},
		//装货地点
		handleLoadChange(val) {
			this.createItem.loadCountry = val[0] || ''
			this.createItem.loadProvince = val[1] || ''
			this.createItem.loadCity = val[2] || ''
			this.createItem.loadDistrict = val[3] || ''
			console.log('🚀 ~ this.loadPlace', this.createItem.loadPlace)
		},
		//处理最后一级children为空数组问题
		handleChildren(data) {
			// 循环遍历json数据
			for (var i = 0; i < data.length; i++) {
				if (data[i].children.length < 1) {
					// children若为空数组，则将children设为undefined
					data[i].children = undefined
				} else {
					// children若不为空数组，则继续 递归调用 本方法
					this.handleChildren(data[i].children)
				}
			}
			return data
		},
		//获取数据
		async getLoadPlaceData() {
			let res = await fclTruckIntrustRegion({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.unloadPlaceData = this.loadPlaceData
			this.isChina = this.loadPlaceData.some(ele => ele.cname === '中国')
		},
		init() {
			if (this.actionType === 'add') {
				this.createItem = Object.assign({}, defaultCreateQuery)
				this.createItem.intrustNo = this.truckDetailQuery.intrustNo
				this.createItem.cargoInfoList = []
			} else if (this.actionType === 'copy') {
				this.getTruckCopyInfo()
			} else {
				this.getTruckLoadInfo()
			}
		},
		// 复制详情
		getTruckCopyInfo() {
			fclIntrustCopy({
				orderNo: this.truckDetailQuery.orderNo,
				jointNo: this.truckDetailQuery.jointNo,
				intrustNo: this.truckDetailQuery.intrustNo
			}).then(res => {
				let { data: resData } = res
				// for (let i in this.defaultCreateQuery) {
				// 	this.createItem[i] = resData[i]
				// }
				// this.createItem.loadPlace = this.getPlace('load', this.createItem)
				// this.createItem.unloadPlace = this.getPlace('unload', this.createItem)
				// this.getSupplierList(this.createItem.overseaAgentSupplierName)
				if (Array.isArray(resData.loadInfoList) && resData.loadInfoList.length) {
					let data = JSON.parse(JSON.stringify(resData))
					console.log('🚀 ~ data', data)
					this.createItem = { ...this.createItem, ...data.loadInfoList[0] }
					console.log('🚀 ~ this.createItem', this.createItem)
					// this.tableData = this.createItem.cargoInfoList
					this.createItem.intrustNo = data.intrustNo
					this.createItem.supplierContact = data.supplierContact
					this.createItem.supplierContactPhone = data.supplierContactPhone
					this.createItem.supplierId = data.supplierId
					this.createItem.supplierName = data.supplierName
					this.createItem.supplierPhone = data.supplierPhone
					this.createItem.overseaAgentSupplierId = data.overseaAgentSupplierId
					this.createItem.overseaAgentSupplierName = data.overseaAgentSupplierName
					this.createItem.overseasCompanyCode = data.overseasCompanyCode
					this.createItem.overseasCompanyName = data.overseasCompanyName
					this.createItem.status = data.status
					this.createItem.remark = data.remark
					this.createItem.loadPlace = this.getPlace('load', this.createItem)
					this.createItem.unloadPlace = this.getPlace('unload', this.createItem)
					this.getSupplierList(data.overseaAgentSupplierName)
					this.getCarList(data.supplierName)
				}
			})
		},
		// 获取详情
		getTruckLoadInfo() {
			fclIntrustInfo({
				orderNo: this.truckDetailQuery.orderNo,
				jointNo: this.truckDetailQuery.jointNo,
				intrustNo: this.truckDetailQuery.intrustNo
			}).then(res => {
				let { data: resData } = res
				// for (let i in this.defaultCreateQuery) {
				// 	this.createItem[i] = resData[i]
				// }
				// this.createItem.loadPlace = this.getPlace('load', this.createItem)
				// this.createItem.unloadPlace = this.getPlace('unload', this.createItem)
				// this.getSupplierList(this.createItem.overseaAgentSupplierName)
				if (Array.isArray(resData.loadInfoList) && resData.loadInfoList.length) {
					let data = JSON.parse(JSON.stringify(resData))
					console.log('🚀 ~ data', data)
					this.createItem = { ...this.createItem, ...data.loadInfoList[0] }
					console.log('🚀 ~ this.createItem', this.createItem)
					// this.tableData = this.createItem.cargoInfoList
					this.createItem.intrustNo = data.intrustNo
					this.createItem.supplierContact = data.supplierContact
					this.createItem.supplierContactPhone = data.supplierContactPhone
					this.createItem.supplierId = data.supplierId
					this.createItem.supplierName = data.supplierName
					this.createItem.supplierPhone = data.supplierPhone
					this.createItem.overseaAgentSupplierId = data.overseaAgentSupplierId
					this.createItem.overseaAgentSupplierName = data.overseaAgentSupplierName
					this.createItem.overseasCompanyCode = data.overseasCompanyCode
					this.createItem.overseasCompanyName = data.overseasCompanyName
					this.createItem.status = data.status
					this.createItem.remark = data.remark
					this.createItem.loadPlace = this.getPlace('load', this.createItem)
					this.createItem.unloadPlace = this.getPlace('unload', this.createItem)
					this.getSupplierList(data.overseaAgentSupplierName)
					this.getCarList(data.supplierName)
				}
			})
		},
		// // 详情
		// handleInfo(row, index) {
		// 	console.log('🚀 ~ row', row)
		// 	this.type = 'edit'
		// 	for (let i in defaultCreateQuery) {
		// 		this.createItem[i] = row[i]
		// 	}
		// 	Object.assign(this.createItem, { status: this.infoData.status })
		// 	this.custidOptions = [{ label: row.custName, value: row.custid }]
		// 	this.transitPortSearch(row.portCode, 'port_of_destination', this.state)
		// 	// this.portList = [{ label: row.portName, value: row.portCode }]
		// 	//点击详情反显装货和卸货地点
		// 	this.createItem.loadPlace = this.getPlace('load', row)
		// 	this.createItem.unloadPlace = this.getPlace('unload', row)
		// 	// this.showDetail = true
		// },
		getPlace(type, row) {
			let arr = []
			if (row[type + 'Country']) {
				arr.push(row[type + 'Country'])
			}
			if (row[type + 'Province']) {
				arr.push(row[type + 'Province'])
			}
			if (row[type + 'City']) {
				arr.push(row[type + 'City'])
			}
			if (row[type + 'District']) {
				arr.push(row[type + 'District'])
			}
			return arr
		},
		custFilterMehod(val) {
			this.getCustList(val)
		},
		custVisibleChange(val) {
			if (val) {
				this.getCustList()
			}
		},
		handleSelectCustid(val) {
			if (val) {
				let custItem = this.custidOptions.filter(item => item.value === val)
				this.createItem.custName = custItem[0].label
			} else {
				Object.assign(this.createItem, {
					custName: ''
				})
			}
		},
		// 获取发货单位
		getCustList(val = '') {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				let list = data.list
				this.custidOptions = list.map(o => {
					return {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		},
		// 目的地
		podPortVisibleChange(val) {
			if (val) this.transitPortSearch('', 'port_of_destination', this.state)
		},
		podPortFilterMehod(val) {
			this.transitPortSearch(val, 'port_of_destination', this.state)
		},
		handleChangePodPortCode(val) {},
		// 港口下拉数据
		transitPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.portList = result
			})
		},
		// 返回
		goBack() {
			this.$emit('hideDetail')
			// let { orderNo, source } = this.truckDetailQuery
			// this.$router.push({
			// 	name: 'PodFclDelivery',
			// 	params: {
			// 		orderNo
			// 	},
			// 	query: {
			// 		orderNo,
			// 		source
			// 	}
			// })
		},
		// // 新增
		// handleAdd() {
		// 	this.type = 'create'
		// 	let custStr = sessionStorage.getItem('custStr')
		// 	let cust = JSON.parse(custStr)
		// 	let portInfoStr = sessionStorage.getItem('portInfoStr')
		// 	let portInfo = JSON.parse(portInfoStr)
		// 	let portItem = portInfo ? portInfo[0] : {}
		// 	// this.portList = portInfo
		// 	this.transitPortSearch(portItem.portCode, 'port_of_destination', this.state)
		// 	this.custidOptions = [{ label: cust.custName, value: cust.custid }]
		// 	console.log('🚀 ~ this.createItem', this.createItem)
		// 	Object.assign(this.createItem, {}, defaultCreateQuery, {
		// 		status: 'init',
		// 		intrustNo: this.infoData.intrustNo,
		// 		custid: cust.custid,
		// 		custName: cust.custName,
		// 		portCode: portItem.portCode || '',
		// 		// loadDistrict: portItem.countryName + portItem.cityCname || ''
		// 		// loadProvince: this.createItem.loadProvince,
		// 		// loadCity: this.createItem.loadCity,
		// 		// unloadProvince: this.createItem.unloadProvince,
		// 		// unloadCity: this.createItem.unloadCity
		// 		loadProvince: '',
		// 		loadCity: '',
		// 		unloadProvince: '',
		// 		unloadCity: ''
		// 	})
		// 	// this.showDetail = true
		// },
		// 处理绑定集装箱的数据
		handleBind(value) {
      console.log("🚀 ~ value", value)
			let containerIdGroup = []
			this.createItem.cargoInfoList.map(item => {
				containerIdGroup.push(item.containerId)
			})
			let tempData = [...this.createItem.cargoInfoList]
			value.map(item => {
				if (!containerIdGroup.includes(item.containerId)) {
					tempData.push({
						containerId: item.containerId,
						cn: item.cn,
						containerType: item.containerType,
						quantity: item.quantity,
						weight: item.weight,
						volume: item.volume,
						packageType: item.packageInfo
					})
				}
			})
			this.createItem.cargoInfoList = tempData.map(item => {
				return item
			})
		},
		// 处理取消绑定集装箱的数据
		handleCancelBind(rowIndex) {
			this.createItem.cargoInfoList = this.createItem.cargoInfoList.filter((item, index) => {
				return rowIndex != index
			})
			// console.log(this.createItem.cargoInfoList)
		},
		// 取消
		handleCancel() {
			// this.showDetail = false
			this.$emit('hideDetail')
		},
		// 箱子校验
		validate(values) {
			let reg = /^\d+(\.\d+)?$/,
				numberReg = /^[0-9]+$/
			if (values.some(item => !numberReg.test(item.quantity))) {
				this.$message({ type: 'error', message: '请填写正确的货品件数' })
				return false
			}
			if (values.some(item => item.quantity < 1)) {
				this.$message({ type: 'error', message: '件数不能小于1' })
				return false
			}
			if (values.some(item => !reg.test(item.weight))) {
				this.$message({ type: 'error', message: '请填写正确的货品毛重' })
				return false
			}
			if (values.some(item => !reg.test(item.volume))) {
				this.$message({ type: 'error', message: '请填写正确的货品体积' })
				return false
			}
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '包装不能为空' })
				return false
			}
			return true
		},
		// 新增保存
		handleSave() {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_fcl_delivery_bonded' ? 'Y' : 'N'
			console.log('🚀 ~ this.truckDetailQuery', this.truckDetailQuery)
			this.$refs.fclIntrustInfo.validate(valid => {
				if (valid) {
					let data = {
						isBonded,
						intrustNo: this.createItem.intrustNo,
						orderNo: this.truckDetailQuery.orderNo,
						jointNo: this.truckDetailQuery.jointNo,
						overseaAgentSupplierId: this.createItem.overseaAgentSupplierId,
						overseaAgentSupplierName: this.createItem.overseaAgentSupplierName,
						supplierId: this.createItem.supplierId,
						supplierContact: this.createItem.supplierContact,
						supplierContactPhone: this.createItem.supplierContactPhone,
						supplierPhone: this.createItem.supplierPhone,
						remark: this.createItem.remark,
						overseasCompanyCode: this.createItem.overseasCompanyCode,
						overseasCompanyName: this.createItem.overseasCompanyName,
						status: this.createItem.status
					}
					data.loadInfoList = [JSON.parse(JSON.stringify({ ...this.createItem, intrustNo: this.truckDetailQuery.intrustNo, orderNo: this.truckDetailQuery.orderNo, jointNo: this.truckDetailQuery.jointNo }))]

					// table校验
					if (!this.validate(this.createItem.cargoInfoList)) return
					this.saveLoading = true
					this.saveDetail(data)
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		saveDetail(data) {
			fclIntrustSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							// this.getTruckLoadInfo()
							// this.showDetail = false
							this.$emit('getFclIntrustList')
							this.$emit('hideDetail')

							this.saveLoading = false

							let ecsObj = this.orderInfo.workAssign.find(item => item.jobCode === 'ecs')
							let ecsId = ''
							if (ecsObj) {
								ecsId = ecsObj.employeeId
							}
							// // 海运出口 创建人不是本订单的海外客服人员
							// if (!this.isImport && ecsId != this.userId && ['add', 'copy'].includes(this.actionType)) {
							// 	this.$confirm('是否推送提醒给海外客服人员？', '警告', {
							// 		confirmButtonText: '确定',
							// 		cancelButtonText: '取消',
							// 		type: 'warning'
							// 	})
							// 		.then(() => {
							// 			pushToEcs({ orderNo: this.truckDetailQuery.orderNo })
							// 		})
							// 		.catch(() => {})
							// }
						}
					})
				})
				.catch(() => {
					this.saveLoading = false
				})
		},
		// 取消关联集装箱
		handleCancelBind(rowIndex) {
			this.createItem.cargoInfoList = this.createItem.cargoInfoList.filter((item, index) => {
				return rowIndex != index
			})
			// console.log(this.createItem.cargoInfoList);
		},
		// 上传文件回调
		importFileCallback(value, index) {
			fclIntrustInfo({
				orderNo: this.truckDetailQuery.orderNo,
				jointNo: this.truckDetailQuery.jointNo,
				intrustNo: this.truckDetailQuery.intrustNo
			}).then(res => {
				// let { data } = res
				// let loadInfoList = data.loadInfoList
				// for (let i in this.createItem) {
				// 	this.createItem[i] = data[i]
				// }
				// Object.assign(this.createItem, {
				// 	cargoInfoList: loadInfoList.filter(item => item.loadId === value)[0].cargoInfoList
				// })

				let { data: resData } = res

				if (Array.isArray(resData.loadInfoList) && resData.loadInfoList.length) {
					let data = JSON.parse(JSON.stringify(resData))
					this.createItem = { ...this.createItem, ...data.loadInfoList[0] }
					this.createItem.intrustNo = data.intrustNo
					this.createItem.supplierContact = data.supplierContact
					this.createItem.supplierContactPhone = data.supplierContactPhone
					this.createItem.supplierId = data.supplierId
					this.createItem.supplierName = data.supplierName
					this.createItem.supplierPhone = data.supplierPhone
					this.createItem.overseaAgentSupplierId = data.overseaAgentSupplierId
					this.createItem.overseaAgentSupplierName = data.overseaAgentSupplierName
					this.createItem.overseasCompanyCode = data.overseasCompanyCode
					this.createItem.overseasCompanyName = data.overseasCompanyName
					this.createItem.status = data.status
					this.createItem.remark = data.remark
					this.createItem.loadPlace = this.getPlace('load', this.createItem)
					this.createItem.unloadPlace = this.getPlace('unload', this.createItem)
					this.getSupplierList(data.overseaAgentSupplierName)
					this.getCarList(data.supplierName)
					Object.assign(this.createItem, {
						cargoInfoList: resData.loadInfoList.filter(item => item.loadId === value)[0].cargoInfoList
					})
				}
			})
		},
		// 删除
		handleDelete(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return fclLoadDelete({ loadId: row.loadId, intrustNo: row.intrustNo, orderNo: this.truckDetailQuery.orderNo, jointNo: this.truckDetailQuery.jointNo })
				})
				.then(response => {
					// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
					// if (this.createItem.loadId === row.loadId) {
					// 	this.showDetail = false
					// }
					this.getTruckLoadInfo()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},
		// 查看集装箱
		handleViewCargo(row) {
			this.cargoInfoShow = true
			this.cargoInfoList = row.cargoInfoList
		},
		cargoInfoClose() {
			this.cargoInfoShow = false
		},
		handleViewFile(row) {}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
.pod-truck-detail {
	height: auto !important;
	.intrust-plan-title {
		margin: 0 10px 10px;
		padding: 4px;
		border-bottom: 1px solid #e9e9e9;
	}
	.between {
		&.isFixed {
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
			height: 30px;
			line-height: 20px;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			// top: 64px;
			right: 0;
			.tit {
				line-height: 20px;
			}
		}
	}
}
.el-row.between {
	flex-wrap: wrap;
	.item {
		display: block;
		padding-right: 30px;
		margin-bottom: 15px;
	}
}
.column-table {
	padding: 0 !important;
}
.fclIntrustDetail {
	.row-body {
		// padding: 10px 20px;
		.el-form-item {
			margin-bottom: 4px;
		}
		.el-form-item__content {
			margin-right: 10px;
			.el-date-editor .el-input__prefix{
				left: 0;
			}
		}
		.el-form-item__label {
			padding-right: 4px;
		}
		.row-tit,
		.row-table {
			padding: 0 !important;
		}
	}
	.el-form--label-top .el-form-item__label {
		float: left;
	}
	.el-autocomplete {
		display: block;
	}
	.box-address-flex {
		display: flex;
		display: flex;
		.box-address-input {
			flex: 1;
		}
		.box-address-btn {
			margin-left: 5px;
			width: 50px;
		}
	}
}
</style>
