<template>
	<div class="ltlDelivery-detail">
		<div :class="['row-tit', 'h32', 'mt10']">
			<div class="ft14 tit">新建计划(委托号:{{ formData.intrustNo }})</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || isDisabledEdit">保存</el-button>
			</div>
		</div>

		<el-form ref="form" class="ltlDelivery-detail-body" :rules="rules" :model="formData" label-width="100px">
			<el-row>
				<el-col :span="6">
					<div class="intrust-plan-title">
						派送信息
					</div>

					<el-form-item label="收货人" prop="consignee" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="formData.consignee" clearable></el-input>
					</el-form-item>
					<el-form-item label="收货人电话" prop="consigneePhone" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="formData.consigneePhone" clearable></el-input>
					</el-form-item>
					<el-form-item label="收货人邮箱" prop="consigneeEmail" :show-message="false">
						<el-input maxlength="128" size="mini" placeholder="请输入" v-model="formData.consigneeEmail" clearable></el-input>
					</el-form-item>
					<el-form-item label="邮政编码" prop="postcode" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="formData.postcode" clearable maxlength="32"></el-input>
					</el-form-item>
					<el-form-item label="收货工厂" prop="recvFactory" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="formData.recvFactory" clearable maxlength="32"></el-input>
					</el-form-item>
					<el-form-item label="卸货详细地址" prop="unloadAddress" :show-message="false">
						<div class="box-address-flex">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadAddress" clearable maxlength="512" class="box-address-input"></el-input>
							<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('un')">选择</el-button>
						</div>
					</el-form-item>
					<el-form-item label="快捷输入">
						<div class="box-address-flex">
							<el-input class="box-address-input" size="mini" clearable v-model="quickInputModel" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
							<el-button size="mini" type="primary" class="box-address-btn" :disabled="isBd || isDisabledEdit" @click="handleQuickInput('unload')">填充</el-button>
						</div>
					</el-form-item>
					<el-form-item label="备注">
						<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<div class="intrust-plan-title">
						装货信息
					</div>

					<el-form-item label="装货人" prop="loadContact" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="formData.loadContact" clearable></el-input>
					</el-form-item>
					<el-form-item label="装货人电话" prop="loadContactPhone" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="formData.loadContactPhone" clearable></el-input>
					</el-form-item>
					<el-form-item label="装货详细地址" prop="loadAddress" :show-message="false">
						<div class="box-address-flex">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadAddress" clearable maxlength="512" class="box-address-input"></el-input>
							<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('on')">选择</el-button>
						</div>
					</el-form-item>
					<el-form-item label="快捷输入">
						<div class="box-address-flex">
							<el-input class="box-address-input" size="mini" clearable v-model="quickInputModelBox" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
							<el-button size="mini" type="primary" class="box-address-btn" :disabled="isBd || isDisabledEdit" @click="handleQuickInput('box')">填充</el-button>
						</div>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<div class="intrust-plan-title">
						代理&车队信息
					</div>
					<el-form-item label="海外代理" prop="overseaAgentId">
						<el-select v-model="formData.overseaAgentId" size="mini" clearable placeholder="请选择" style="width: 100%" remote filterable @visible-change="supplierVisibleChange" :filter-method="supplierFilterMehod" @change="handleSelectSupplierName">
							<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="海外分公司" prop="overseasCompanyCode">
						<el-select v-model="formData.overseasCompanyCode" size="mini" placeholder="请选择" clearable="" style="width: 100%" @change="val => changeOverseasCompany(val)">
							<el-option v-for="(item, index) in abroadCompanyList" :label="item.companyName" :value="item.companyCode" :key="index"> </el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="车队" prop="supplierName" :show-message="false">
						<el-select style="width: 100%" placeholder="请选择" size="mini" v-model="formData.supplierId" clearable :filterable="true" @visible-change="carVisibleChange" :filter-method="carFilterMehod" @change="val => handleCarSupplierName(val)">
							<el-option v-for="item in carSupplierList" :key="item.supplierId" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="车队联系电话" prop="supplierPhone" :show-message="false">
						<el-input size="mini" placeholder="请输入" clearable v-model="formData.supplierPhone"></el-input>
					</el-form-item>
					<el-form-item label="车队联系人" prop="supplierContact" :show-message="false">
						<el-input size="mini" placeholder="请输入" clearable v-model="formData.supplierContact"></el-input>
					</el-form-item>
					<el-form-item label="车队联系人电话" prop="supplierContactPhone" :show-message="false">
						<el-input size="mini" placeholder="请输入" clearable v-model="formData.supplierContactPhone"></el-input>
					</el-form-item>
					<el-form-item label="司机">
						<el-input size="mini" placeholder="请输入" v-model="formData.driverName" clearable maxlength="16"></el-input>
					</el-form-item>
					<el-form-item label="司机电话">
						<el-input size="mini" placeholder="请输入" v-model="formData.driverPhone" clearable maxlength="16"></el-input>
					</el-form-item>
					<el-form-item label="车牌号">
						<el-input size="mini" placeholder="请输入" v-model="formData.licensePlate" clearable maxlength="16"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<div class="intrust-plan-title">
						派送节点
					</div>

					<el-form-item label="委托状态" prop="status" :show-message="false">
						<el-select style="width: 100%" placeholder="请选择" size="mini" :disabled="disableStatus" v-model="formData.status">
							<el-option v-for="(item, index) in dictMap.podDeliveryLtlStatus" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="预计派送时间" :show-message="false" prop="preLoadTime">
						<elDatePickerLimit size="mini" v-model="formData.preLoadTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
					</el-form-item>
					<el-form-item label="实际派送时间" prop="loadTime" :show-message="false">
						<elDatePickerLimit noCanFuture size="mini" v-model="formData.loadTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
					</el-form-item>
					<el-form-item label="签收时间" prop="signTime" :show-message="false">
						<elDatePickerLimit noCanFuture size="mini" v-model="formData.signTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
					<el-form-item label="签收附件" prop="signFileName" :show-message="false">
						<upload-input v-model="formData.signFileName" :disabled="isBd || isDisabledEdit" @downloadFile="handleDownload" @handleView="handleView" @uploadFile="handleAdd" @delFile="delFile" />
					</el-form-item>
				</el-col>
			</el-row>
			<div class="row-tit between h32">
				<div class="ft14 tit"></div>
				<div class="row-tit-operate">
					<el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd || isDisabledEdit">添加货品</el-button>
				</div>
			</div>
			<el-table ref="cargo" fit highlight-current-row style="width: 100%" class="outPlanBoxTable" :data="tableData" show-summary :summary-method="getSummaries">
				<el-table-column prop="hscode" label="HS code" align="center">
					<template slot-scope="scope">
						<el-select size="mini" v-model="scope.row.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" @change="handleChangeHscode" :remote-method="val => queryCargoHscode(val)">
							<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column prop="cname" label="中文品名" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入中文品名" v-model.number="scope.row.cname" clearable maxlength="128"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="ename" label="英文品名" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入英文品名" v-model.number="scope.row.ename" clearable maxlength="128"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="quantity" label="件数" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="validateNum('quantity', scope.row)"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="weight" label="毛重(KGS)" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="volume" label="体积(CBM)" align="center">
					<template slot-scope="scope">
						<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="packageType" label="包装" align="center">
					<template slot-scope="scope">
						<el-select v-model="scope.row.packageType" size="mini" filterable placeholder="请选择包装">
							<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column prop="files" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in scope.row.files" :key="index">
							<span :title="item.fileName" size="mini" @click="handleViewFile(item.fileNo, item.fileName)">{{ item.fileName }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit">删除</el-button>
							<el-button @click="handleFile(scope.row)" type="text" size="mini" :disabled="isBd || isDisabledEdit || !scope.row.oid">上传</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</el-form>
		<div v-if="uploadPopShow">
			<FileUpload @close="uploadPopClose" />
		</div>
		<div v-if="addressPopShow">
			<AddressPop @close="addressPopClose"></AddressPop>
		</div>
		<!-- 关联委派信息弹窗 -->
		<div v-if="soInfoPopShow">
			<SoInfoPop @close="soInfoPopClose" />
		</div>
		<div v-if="uploadShow">
			<FileUploadCargo :row="rowData" @close="cargoPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDomesticCity, cargoHscodeList, getForeignCity, fclTruckIntrustRegion } from '@/api/base'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import UploadInput from '@/components/Base/upload/upload-input.vue'
import FileUpload from './fileUploadNew.vue'
import FileUploadCargo from './fileUploadCargo.vue'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'
// import { ltlFileDelete,ltlFileUpload } from '@/api/order/podService/ltlDelivery'
import SoInfoPop from './soInfoPop'
import { arrayHasDuplicateValue, unique } from '@/utils/index'
import { updateOverseasInfo, overseasTips, abroadCompanyList, overseasCanModify } from '@/api/order/list'
import { supplierInfo } from '@/api/crm/supplier'

const defaultFormData = {
	loadId: undefined,
	outPlanNo: '',
	loadContact: '',
	loadContactPhone: '',
	loadTime: '',
	loadAddress: '',
	consignee: '',
	consigneePhone: '',
	consigneeEmail: '',
	unloadAddress: '',
	driverName: '',
	driverPhone: '',
	licensePlate: '',
	shipperCustid: '',
	shipperCustName: '',
	loadPlace: [],
	unloadPlace: [],
	unloadProvince: '',
	unloadCity: '',
	unloadDistrict: '',
	unloadDistrict: '',
	signFileNo: '',
	signFileName: '',
	cargoInfoList: [],
	remark: '',
	preLoadTime: '',
	postcode: '',
	signTime: '',
	loadProvince: '',
	loadCity: '',
	loadDistrict: '',
	signInfo: '',
	status: 'init',
	overseaAgentId: '',
	overseaAgentName: '',
	overseasCompanyCode: '',
	overseasCompanyName: '',
	supplierId: '',
	supplierPhone: '',
	supplierContact: '',
	intrustNo: '',
	supplierContactPhone: '',
	recvFactory: ''
}

export default {
	mixins: [quantityMixin],
	data() {
		return {
			rowData: {},
			uploadShow: false,
			disableStatus: false,
			overseaAgentId: '',
			overseaAgentName: '',
			abroadCompanyList: [],
			supplierList: [],
			carSupplierList: [],
			overseasAgentList: [],
			showCasPlace: true,
			isChina: true,
			oQuery: this.$route.query,
			uploadPopShow: false,
			loadPlaceData: [],
			unloadPlaceData: [],
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			dialogConfig: {
				title: '装货信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: Object.assign({}, defaultFormData),
			rules: {
				loadContact: [{ required: false, message: '', trigger: 'change' }],
				loadContactPhone: [{ required: false, message: '', trigger: 'change' }],
				// loadPlace: [{ required: true, message: '', trigger: 'change' }],
				// unloadPlace: [{ required: true, message: '', trigger: 'change' }],
				consignee: [{ required: true, message: '', trigger: 'blur' }],
				consigneePhone: [{ required: true, message: '', trigger: 'blur' }],
				consigneeEmail: [{ required: true, message: '', trigger: 'blur' }],
				unloadAddress: [{ required: true, message: '', trigger: 'blur' }],
				preLoadTime: [{ required: false, message: '', trigger: 'change' }],
				loadTime: [{ required: false, message: '', trigger: 'change' }],
				signTime: [{ required: false, message: '', trigger: 'change' }],
				signFileName: [{ required: false, message: '', trigger: 'change' }]
			},
			tableData: [],
			hscodeOptions: [],
			quickInputModel: '',
			quickInputModelBox: '',
			addressPopShow: false,
			loadType: '',
			soInfoPopShow: false
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.ordDetRole,
			serviceInfoList: state => state.railway.serviceInfoList,
			orderInfo: state => state.railway.orderInfoDataObj
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},

		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isBd() {
			let isBd = !this.isEpricing && !this.isEcs && !this.isBkg

			return isBd || this.isJoint
		},

		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pod_ltl_delivery')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
		viewState() {
			return this.oQuery.action === 'view' && !this.isOp
		},
		jointState() {
			return this.oQuery.jointNo ? true : false
		}
	},
	components: { UploadInput, FileUpload, AddressPop, SoInfoPop, FileUploadCargo },
	created() {
		this.init()
		//获取国家城市级联框数据
		this.getLoadPlaceData()
		// 海外分公司
		this.getAbroadCompanyList()
	},
	watch: {
		createItem: {
			handler() {
				this.init()
			},
			deep: true
		},
		'formData.status': {
			handler(val) {
				if (val === 'finish') {
					this.rules.preLoadTime = [{ required: true, message: '', trigger: 'change' }]
					this.rules.loadTime = [{ required: true, message: '', trigger: 'change' }]
					this.rules.signTime = [{ required: true, message: '', trigger: 'change' }]
				} else {
					this.rules.preLoadTime = [{ required: false, message: '', trigger: 'change' }]
					this.rules.loadTime = [{ required: false, message: '', trigger: 'change' }]
					this.rules.signTime = [{ required: false, message: '', trigger: 'change' }]
				}
			}
		},
		'formData.signTime': {
			handler(val) {
				if (val && (new Date() - new Date(val)) / 1000 / 60 / 60 / 24 > 14) {
					this.rules.signFileName = [{ required: true, message: '', trigger: 'change' }]
				} else {
					this.rules.signFileName = [{ required: false, message: '', trigger: 'change' }]
				}
			}
		}
	},
	methods: {
		cargoPopClose(action, data) {
			this.uploadShow = false
			if (action === 'Confirm') {
				console.log('🚀 ~ Confirm')
				console.log('🚀 ~ data', data)
				this.rowData.files = data
			}
		},
		// 上传附件
		handleFile(row) {
			console.log('🚀 ~ row', row)
			this.rowData = row
			this.uploadShow = true
		},
		handleViewFile(fileNo, fileName) {
			// let fileNo = row.fileNo.split(',')[index]
			// let fileName = row.fileName.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
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
						this.formData.supplierContact = res.data.contact[0].name
						this.formData.supplierContactPhone = res.data.contact[0].mobileNo
					} else {
						this.formData.supplierContact = ''
						this.formData.supplierContactPhone = ''
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
				this.formData.overseasCompanyName = item.companyName
			} else {
				this.formData.overseasCompanyName = ''
			}
		},

		handleSelectSupplierName(val) {
			console.log('🚀 ~ val', val)
			let item = this.supplierList.find(item => item.value == val)
			console.log('🚀 ~ item', item)
			console.log('🚀 ~ this.supplierList', this.supplierList)
			if (item) {
				this.formData.overseaAgentName = item.label
			} else {
				this.formData.overseaAgentName = ''
			}
		},
		supplierFilterMehod(val) {
			console.log('🚀 ~ val', val)
			if (this.formData.overseaAgentName && !val) {
				val = this.formData.overseaAgentName
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

		showAddressPop(val) {
			this.loadType = val
			this.addressPopShow = true
		},
		addressPopClose(action, value) {
			this.addressPopShow = false
			if (action === 'Confirm') {
				if (this.loadType === 'on') {
					// this.formData.loadPlace = [value.addressProvince, value.addressCity]
					this.formData.loadContact = value.contactName
					this.formData.loadContactPhone = value.contactPhone
					// this.formData.loadProvince = value.addressProvince
					// this.formData.loadCity = value.addressCity
					this.formData.loadAddress = value.addressDetail
					this.showCasPlace = false
					if (!value.isChina) {
						this.formData.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.formData.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
					this.formData.loadCountry = value.addressCountry
					this.formData.loadProvince = value.addressProvince
					this.formData.loadCity = value.addressCity
					this.formData.loadDistrict = value.addressArea
					// // 国内省市区
					// if (this.isChina && value.isChina) {
					// 	this.formData.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					// 	this.formData.loadCountry = value.addressCountry
					// 	this.formData.loadProvince = value.addressProvince
					// 	this.formData.loadCity = value.addressCity
					// 	this.formData.loadDistrict = value.addressArea
					// }
					// // 国外国家到洲，有的数据只有国家没有洲
					// if (!this.isChina && !value.isChina) {
					// 	this.formData.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					// 	this.formData.loadCountry = value.addressCountry
					// 	this.formData.loadProvince = value.addressProvince
					// }
				}
				if (this.loadType === 'un') {
					// this.formData.unloadPlace = [value.addressProvince, value.addressCity]
					this.formData.consignee = value.contactName
					this.formData.consigneePhone = value.contactPhone
					this.formData.unloadAddress = value.addressDetail
					this.formData.postcode = value.postCode
					// this.formData.unloadProvince = value.addressProvince
					// this.formData.unloadCity = value.addressCity
					this.formData.unloadAddress = value.addressDetail
					this.showCasPlace = false
					if (!value.isChina) {
						this.formData.unloadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.formData.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
					this.formData.unloadCountry = value.addressCountry
					this.formData.unloadProvince = value.addressProvince
					this.formData.unloadCity = value.addressCity
					this.formData.unloadDistrict = value.addressArea

					// // 国内省市区
					// if (this.isChina && value.isChina) {
					// 	this.formData.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					// 	this.formData.unloadCountry = value.addressCountry
					// 	this.formData.unloadProvince = value.addressProvince
					// 	this.formData.unloadCity = value.addressCity
					// 	this.formData.unloadDistrict = value.addressArea
					// }
					// // 国外国家到洲，有的数据只有国家没有洲
					// if (!this.isChina && !value.isChina) {
					// 	this.formData.unloadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					// 	this.formData.unloadCountry = value.addressCountry
					// 	this.formData.unloadProvince = value.addressProvince
					// }
				}
			}
		},
		handleQuickInput(type) {
			if (this.quickInputModel || this.quickInputModelBox) {
				if (type === 'box') {
					// 装货
					let arr = this.quickInputModelBox.split('，')
					this.formData.loadContact = arr[0] || ''
					this.formData.loadContactPhone = arr[1] || ''
					this.formData.loadAddress = arr[2] || ''
				} else {
					// 卸货
					let arr = this.quickInputModel.split('，')
					this.formData.consignee = arr[0] || ''
					this.formData.consigneePhone = arr[1] || ''
					this.formData.unloadAddress = arr[2] || ''
				}
			}
		},
		uploadPopClose(action, val) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.formData.signFileNo = val.fileNo
				this.formData.signFileName = val.name
			}
		},
		delFile() {
			// 删除文件
			this.formData.signFileNo = ''
			this.formData.signFileName = ''
		},
		handleAdd() {
			// 上传
			this.uploadPopShow = true
		},
		// 附件下载
		handleDownload() {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: this.formData.signFileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.formData.signFileName
					link.click()
				})
		},
		handleView() {
			this.$store.dispatch('order/previewFile', {
				fileNo: this.formData.signFileNo,
				fileName: this.formData.signFileName
			})
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^[0-9]+$/
			let quantityValid = values.some(item => !numberReg.test(item.quantity))

			if (!values.length) {
				this.$message({ type: 'error', message: '请选择货品' })
				return false
			}
			if (values.some(item => !item.hscode)) {
				this.$message({ type: 'error', message: '请选择正确的HS code' })
				return false
			}
			if (values.some(item => !item.cname)) {
				this.$message({ type: 'error', message: '请输入中文品名' })
				return false
			}
			if (values.some(item => !item.ename)) {
				this.$message({ type: 'error', message: '请输入英文品名' })
				return false
			}
			if (values.some(item => !item.quantity || quantityValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品件数' })
				return false
			}

			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '请选择包装' })
				return false
			}
			return true
		},
		// 删除货物箱
		handleDelete(row, sIndex) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.tableData = this.tableData.filter((item, index) => index !== sIndex)
				})
				.catch(err => {
					console.log('err')
				})
		},
		handleAddCargo() {
			this.tableData.push({})
		},
		handleChangeHscode(val) {
			if (!val) this.hscodeOptions = []
		},
		// hscode模糊查询
		queryCargoHscode(queryString) {
			queryString &&
				cargoHscodeList({ keyword: queryString }).then(response => {
					this.hscodeOptions = response.data.map(item => {
						return Object.assign(item, {
							label: item.cargoDesc,
							value: item.hscode
						})
					})
				})
		},
		getSummaries(param) {
			const { columns, data } = param
			const sums = []
			columns.forEach((column, index) => {
				if (index === 0) {
					return (sums[index] = '合计')
				}
				const values = data.map(item => Number(item[column.property]))
				if (column.property === 'quantity' || column.property === 'weight' || column.property === 'volume') {
					sums[index] = values.reduce((prev, curr) => {
						const value = Number(curr)
						if (!isNaN(value)) {
							return Number(prev + curr).fixed(3)
						} else {
							return Number(prev).fixed(3)
						}
					}, 0)
					sums[index]
				}
			})
			return sums // Number(value).fixed(3)
		},
		handleCancel() {
			this.$emit('cancel')
		},
		handleSave() {
			this.$refs.form.validate(valid => {
				console.log('保存的数据是：', this.formData)
				if (valid) {
					if (!this.validate(this.tableData)) return
					let data = { ...this.formData }
					data.cargoInfoList = this.tableData
					let createItem = JSON.parse(JSON.stringify(this.createItem))
					createItem.intrustNo = data.intrustNo
					createItem.loadInfoList[0] = data
					createItem.remark = data.remark
					createItem.supplierContact = data.supplierContact
					createItem.supplierContactPhone = data.supplierContactPhone
					createItem.supplierId = data.supplierId
					createItem.supplierName = data.supplierName
					createItem.supplierPhone = data.supplierPhone
					createItem.overseaAgentId = data.overseaAgentId
					createItem.overseaAgentName = data.overseaAgentName
					createItem.overseasCompanyCode = data.overseasCompanyCode
					createItem.overseasCompanyName = data.overseasCompanyName
					createItem.status = data.status
					createItem.preLoadTime = data.preLoadTime
					createItem.loadTime = data.loadTime
					this.$emit('save', createItem)
				} else {
					this.$message.error('请按要求填写数据')
					return false
				}
			})
		},
		//处理最后一级children为空数组问题
		handleChildren(data) {
			// 循环遍历json数据
			for (let i = 0; i < data.length; i++) {
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
			if (Array.isArray(this.createItem.loadInfoList) && this.createItem.loadInfoList.length) {
				this.disableStatus = false
				let data = JSON.parse(JSON.stringify(this.createItem))
				console.log('🚀 ~ data', data)
				this.formData = { ...this.formData, ...data.loadInfoList[0] }
				this.tableData = this.formData.cargoInfoList
				this.formData.loadPlace = this.getPlace('load', this.formData)
				this.formData.unloadPlace = this.getPlace('unload', this.formData)
				this.formData.intrustNo = data.intrustNo
				this.formData.supplierContact = data.supplierContact
				this.formData.supplierContactPhone = data.supplierContactPhone
				this.formData.supplierId = data.supplierId
				this.formData.supplierName = data.supplierName
				this.formData.supplierPhone = data.supplierPhone
				this.formData.overseaAgentId = data.overseaAgentId
				this.formData.overseaAgentName = data.overseaAgentName
				this.formData.overseasCompanyCode = data.overseasCompanyCode
				this.formData.overseasCompanyName = data.overseasCompanyName
				this.formData.status = data.status
				this.getSupplierList(data.overseaAgentName)
				this.getCarList(data.supplierName)
			} else {
				this.disableStatus = true
				this.formData = Object.assign({}, defaultFormData)
				this.formData.intrustNo = this.createItem.intrustNo
				this.tableData = []
				this.formData.loadPlace = []
				this.formData.unloadPlace = []
			}
		},
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
			console.log(20220517, arr)
			return arr
		},
		//装货地点
		handleLoadChange(val) {
			this.formData.loadCountry = val[0] || ''
			this.formData.loadProvince = val[1] || ''
			this.formData.loadCity = val[2] || ''
			this.formData.loadDistrict = val[3] || ''
			console.log('🚀 ~ this.loadPlace', this.formData.loadPlace)
		},
		//卸货地点
		handleUnloadChange(val) {
			this.formData.unloadCountry = val[0] || ''
			this.formData.unloadProvince = val[1] || ''
			this.formData.unloadCity = val[2] || ''
			this.formData.unloadDistrict = val[3] || ''
			console.log('🚀 ~ this.unloadPlace', this.formData.unloadPlace)
		},
		// 打开关联委派信息弹窗
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
			this.formData.loadContact = row.loadContact
			this.formData.loadContactPhone = row.loadContactPhone
			this.formData.loadPlace = row.loadPlace ? JSON.parse(row.loadPlace) : []
			this.handleLoadChange(this.formData.loadPlace)
			this.formData.loadAddress = row.loadAddress
			this.formData.unloadPlace = row.unloadPlace ? JSON.parse(row.unloadPlace) : []
			this.handleUnloadChange(this.formData.unloadPlace)
			this.formData.unloadAddress = row.unloadAddress
			this.formData.consignee = row.consignee
			this.formData.consigneePhone = row.consigneePhone
			this.formData.consigneeEmail = row.consigneeEmail
			this.formData.postcode = row.postCode
			this.formData.remark = row.remark
			//处理装货地点级联选择器
			// this.formData.loadPlace = row.boxProvince ? [row.boxProvince, row.boxCity, row.boxDistrict] : []
			console.log('this.formData', this.formData)
		}
	}
}
</script>

<style lang="scss">
@import '../../../../less/index.scss';
.ltlDelivery-detail {
	.si-file-wrap {
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.si-file-wrap span {
		cursor: pointer;
		color: #1890ff;
	}
	.intrust-plan-title {
		margin: 0 10px 10px;
		padding: 4px;
		border-bottom: 1px solid #e9e9e9;
	}
	.row-tit {
		padding: 0 !important;
	}
	.ltlDelivery-detail-body {
		margin-top: 10px;
		.el-form-item {
			margin-bottom: 4px;
		}
		.el-form-item__label {
			padding-right: 4px;
		}
		.el-form-item__content {
			margin-right: 10px;
			.el-date-editor .el-input__prefix{
				left: 0;
			}
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
	.quick-class {
		display: flex;
		align-items: center;
		.title {
			width: 75px;
		}
	}
}
</style>
