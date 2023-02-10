<template>
	<div class="edit-container" id="polLtlDetail">
		<div class="component-cont table-com-layout">
			<div class="between btLine" id="saveBar">
				<div class="ft12 h20 bold">派车委托单：{{ createItem.intrustNo }}</div>
				<div class="">
					<el-button size="mini" class="ml10" @click="handleCancelDetail">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="isBd || !isOp || isDisabledEdit" 
						btnText="保存" 
						:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
						class="operateBtn-tip ml10" 
						@click="handleSave()">
					</ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave()" :disabled="isBd || !isOp || isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<div class="between btLine isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<div class="ft12 h20 bold">派车委托单：{{ createItem.intrustNo }}</div>
				<div class="">
					<el-button size="mini" class="ml10" @click="handleCancelDetail">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="isBd || !isOp || isDisabledEdit" 
						btnText="保存" 
						:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
						class="operateBtn-tip ml10" 
						@click="handleSave()">
					</ButtonTip>
					<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave()" :disabled="isBd || !isOp || isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<el-form ref="saveForm" :model="createItem" :rules="rules" label-width="90px">
				<el-row>
					<el-col :span="4" class="oneFifth">
						<el-form-item label="委托编号" prop="intrustNo">
							<el-input size="mini" placeholder="请输入" v-model="createItem.intrustNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="4" class="oneFifth">
						<el-form-item label="车队" prop="supplierId">
							<el-select
								style="width: 100%"
								placeholder="请选择"
								size="mini"
								v-model="createItem.supplierId"
								clearable
								:filterable="true"
								@visible-change="supplierVisibleChange"
								:filter-method="supplierFilterMehod"
								@change="handleSelectSupplierName"
								:disabled="isBd || isDisabledEdit"
							>
								<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="4" class="oneFifth">
						<el-form-item label="车队联系人" prop="supplierContact">
							<el-autocomplete
								style="width: 100%"
								size="mini"
								clearable
								v-model="createItem.supplierContact"
								:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
								placeholder="请输入车队联系人"
								:disabled="isBd || isDisabledEdit"
								@select="value => handleSelectContact(value)"
								:maxlength="16"
							></el-autocomplete>
							<!-- <el-input size="mini" placeholder="请输入车队联系人" v-model="createItem.supplierContact" clearable :disabled="isBd" @blur="validContact('supplierContact')"></el-input> -->
						</el-form-item>
					</el-col>
					<el-col :span="4" class="oneFifth">
						<el-form-item label="车队联系人电话" prop="supplierContactPhone">
							<el-input size="mini" placeholder="请输入车队联系人电话" v-model="createItem.supplierContactPhone" clearable :disabled="isBd || isDisabledEdit" maxlength="16"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="4" class="oneFifth">
						<el-form-item label="派车类型" prop="dispatchType">
							<el-select size="mini" placeholder="请选择派车类型" v-model="createItem.dispatchType" clearable style="width: 100%" disabled>
								<el-option v-for="item in polLtlDispatchType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="注意事项" prop="boxRemark">
							<el-input type="textarea" rows="1" size="mini" placeholder="请输入" v-model="createItem.boxRemark" clearable :disabled="isBd || isDisabledEdit" show-word-limit maxlength="512"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<div class="between mt10">
					<div class="ft14"></div>
					<div class="el-button-group">
						<ButtonTip
							btnType="primary" 
							:btnDisabled="isBd || !isOp || isDisabledEdit" 
							btnText="新增地址" 
							:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
							class="operateBtn-tip ml10" 
							@click="handleAdd()">
						</ButtonTip>
						<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd()" :disabled="!isOp || isDisabledEdit">新增地址</el-button> -->
					</div>
				</div>
				<el-table ref="table" fit border style="width: 100%" :data="tableData" class="border-table column-table mt04" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
					<!-- <el-table-column prop="shipperCustName" label="客户名称" align="center" width="200"> </el-table-column> -->
					<el-table-column label="装货地点" width="150" align="center">
						<span v-if="scope.row.boxCountry === '中国'" slot-scope="scope">
							{{ scope.row.boxCountry + scope.row.boxProvince + scope.row.boxCity + scope.row.boxDistrict }}
						</span>
						<span v-else slot-scope="scope">
							{{ scope.row.boxCountry + scope.row.boxProvince }}
						</span>
					</el-table-column>
					<el-table-column prop="boxAddress" label="装货详细地址" align="center" width="150">
						<template slot-scope="scope">
							<div class="operate-group column-text">
								{{ scope.row.boxAddress }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="boxContact" label="装货人" align="center"></el-table-column>
					<el-table-column prop="boxContactPhone" label="装货人电话" align="center" width="120"></el-table-column>
					<el-table-column prop="preBoxTime" label="委托装货时间" align="center" width="150"></el-table-column>
					<el-table-column prop="boxTime" label="实际到场时间" align="center" width="150"></el-table-column>
					<el-table-column label="卸货地点" align="center" width="150">
						<template slot-scope="scope">
							{{ scope.row.unloadProvince + scope.row.unloadCity + scope.row.unloadDistrict }}
						</template>
					</el-table-column>
					<el-table-column prop="unloadAddress" label="卸货详细地址" align="center" width="150">
						<template slot-scope="scope">
							<div class="operate-group column-text">
								{{ scope.row.unloadAddress }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="unloadContact" label="卸货人" align="center"></el-table-column>
					<el-table-column prop="unloadContactPhone" label="卸货人电话" align="center" width="120"></el-table-column>
					<!-- <el-table-column prop="postcode" label="邮政编码" align="center"></el-table-column> -->
					<el-table-column label="货品信息" align="center">
						<template slot-scope="scope">
							<el-button size="mini" type="text" class="underline" @click="handleViewCargo(scope.row)">查看</el-button>
						</template>
					</el-table-column>
					<el-table-column label="司机姓名" align="center">
						<template slot-scope="scope">
							{{ scope.row.driverName }}
						</template>
					</el-table-column>
					<el-table-column label="司机电话" align="center">
						<template slot-scope="scope">
							{{ scope.row.driverPhone }}
						</template>
					</el-table-column>
					<el-table-column label="车牌号" align="center">
						<template slot-scope="scope">
							{{ scope.row.licensePlate }}
						</template>
					</el-table-column>
					<el-table-column label="签收证明" align="center" width="350">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-tooltip effect="dark" :content="scope.row.signFileName" placement="top" v-if="scope.row.signFileName">
									<el-button type="text" size="mini" @click="handleViewFile(scope.row)">{{ scope.row.signFileName }}</el-button>
								</el-tooltip>
								<ButtonTip
									btnType="text" 
									:btnDisabled="isBd || !isOp || isDisabledEdit" 
									btnText="上传" 
									:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
									class="operateBtn-tip" 
									@click="handleUpload(scope.row, scope.$index)">
								</ButtonTip>
								<!-- <el-button @click="handleUpload(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit">上传</el-button> -->
								<!-- <el-button @click="handleDeleteFile(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd" v-if="scope.row.signFileName">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="signTime" label="签收时间" align="center" width="150"></el-table-column>
					<el-table-column label="操作" width="100" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleInfo(scope.row, scope.$index)" type="text" size="mini">详情</el-button>
								<ButtonTip
									btnType="text" 
									:btnDisabled="isBd || !isOp || isDisabledEdit" 
									btnText="删除" 
									:tipContent="isOpTruckAndOpTip || isJointTip || isFinishTip || statusTip" 
									class="operateBtn-tip" 
									btnClassName="red"
									@click="handleDelete(scope.row, scope.$index)">
								</ButtonTip>
								<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
				<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
			</el-form>
		</div>
		<div v-if="ltlDeliveryInfoShow">
			<LtlDeliveryInfo @close="ltlDeliveryInfoClose" :addressData="addressData" />
		</div>
		<div v-if="showCargoDialog">
			<CargosDialog :cargosList="cargosList" @close="closeDialog"></CargosDialog>
		</div>
		<div v-if="uploadFileShow">
			<FileUpload :param="uploadFileQuery" @close="uploadFilePopClose"></FileUpload>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { supplierInfo, customerInfo } from '@/api/crm/supplier'
import { scatterTruckIntrustSaveBulk } from '@/api/order/shippingTruck'
import LtlDeliveryInfo from './components/ltlDeliveryInfo'
import CargosDialog from './components/cargosDialog'
import FileUpload from './components/fileUpload'
import tableTooltip from '@/components/Base/Table/table-tooltip'
const defaultCreateQuery = {
	oid: undefined,
	// orderNo: '',
	intrustNo: '',
	// intrustStatus: '',
	loadType: '',
	// dispatchStatus: '',
	supplierId: '',
	supplierName: '',
	supplierContact: '',
	boxContactPhone: '',
	supplierContactPhone: '',
	boxRemark: '',
	dispatchType: 'receive',
	truckLoads: []
}
export default {
	filters: {},
	props: {
		detailData: {
			type: Object,
			default: () => ({})
		},
		orderInfo: {
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
		isOpTruckAndOpTip: {
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
	data() {
		return {
			tableCellMouse: {
				cellDom: null, // 鼠标移入的cell-dom
				hidden: null, // 是否移除单元格
				row: null // 行数据
			},
			oQuery: this.$route.query,
			supplierList: [],
			createItem: Object.assign({}, defaultCreateQuery),
			tableData: [],
			ltlDeliveryInfoShow: false,
			addressType: '',
			addressData: {},
			clickRowIndex: '', // 点击的row索引
			showCargoDialog: false,
			cargosList: [],
			uploadFileShow: false,
			uploadFileQuery: {},
			rules: {
				intrustNo: [{ required: true, message: ' ', trigger: 'blur' }],
				supplierId: [{ required: true, message: ' ', trigger: 'change' }]
				// supplierContact: [{ required: true, message: ' ', trigger: 'blur' }],
				// supplierContactPhone: [{ required: true, message: ' ', trigger: 'blur' }]
			}
		}
	},
	created() {
		this.setInit()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			polLtlDispatchType: state => state.orderService.polLtlDispatchType,
			serviceInfoList: state => state.order.serviceInfoList
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return ['op_truck', 'op'].includes(this.ordDetRole)
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isJoint
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pol_ltl')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' ? true : false
		},
		viewState() {
			return this.truckDetailQuery.action === 'view' && !this.isOp
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
		}
	},
	components: {
		LtlDeliveryInfo,
		CargosDialog,
		FileUpload,
		tableTooltip
	},
	watch: {
		detailData: {
			handler(newVal) {
				// this.createItem = Object.assign({}, defaultCreateQuery, newVal)
				this.setInit()
			},
			deep: true
		}
	},
	methods: {
		// 鼠标移入cell
		showTooltip(row, column, cell) {
			this.tableCellMouse.cellDom = cell
			this.tableCellMouse.row = row
			this.tableCellMouse.hidden = false
		},
		// 鼠标移出cell
		hiddenTooltip() {
			this.tableCellMouse.hidden = true
		},
		validContact(val) {
			let message = ''
			message = val === 'supplierContact' ? '车队联系人' : val === 'supplierContactPhone' ? '车队联系人电话' : ''
			if (this.createItem[val].length > 16) {
				this.createItem[val] = this.createItem[val].slice(0, 16)
				return this.$message.warning(message + '输入不能超过16位字符')
			}
		},
		setInit() {
			this.supplierList = [{ label: this.detailData.supplierName, value: this.detailData.supplierId }]
			this.createItem = Object.assign({}, defaultCreateQuery, this.detailData)
			this.tableData = this.detailData.truckWarehouseLoads && this.detailData.truckWarehouseLoads.length ? this.detailData.truckWarehouseLoads[0].truckLoadVos : []
			console.log('🚀 ~ this.tableData', this.tableData)
			// 获取车队联系人信息
			if (this.createItem.supplierId) {
				supplierInfo({ supplierId: this.createItem.supplierId }).then(res => {
					let { contact } = res.data
					this.restaurants = this.loadAll(contact)
				})
			}
		},
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'pol_ltl', queryString: val }).then(data => {
				this.supplierList = data.list.map(item => {
					return Object.assign(item, {
						label: item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
			})
		},
		// 选择车队下拉，自动填充车队联系人，联系电话
		handleSelectSupplierName(val) {
			if (val) {
				let label = this.supplierList.filter(o => o.value === val)[0].label
				this.createItem.supplierName = label
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.createItem, {
						supplierContact: contact && contact.length ? contact[0].name || contact[0].ename : '',
						supplierContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
					this.restaurants = this.loadAll(contact)
				})
			} else {
				Object.assign(this.createItem, {
					supplierName: '',
					supplierContact: '',
					supplierContactPhone: ''
				})
			}
		},
		querySearchContact(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
			cb(results)
		},
		handleSelectContact(item) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						Object.assign(this.createItem, {
							supplierContactPhone: this.contactInfo[i].mobileNo
						})
						return
					}
				}
			}
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
		handleCancelDetail() {
			this.$emit('hideDetail')
		},
		handleSave() {
			this.$refs.saveForm.validate(valid => {
				if (valid) {
					let data = Object.assign({}, this.createItem)
					data.orderNo = this.oQuery.orderNo
					data.jointNo = this.oQuery.jointNo
					data.loadType = 'scatter'
					data.truckLoads = this.tableData
					delete data.truckWarehouseLoads
					if (!this.tableData.length) return this.$message({ type: 'error', message: '装货信息不能为空' })
					scatterTruckIntrustSaveBulk(data).then(res => {
						this.$emit('hideDetail', 'save')
						this.$message({ type: 'success', message: '保存成功' })
					})
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		// 新增地址弹窗
		handleAdd() {
			let cargos = this.orderInfo.cargoList.map(item => {
				if (item.packageInfo) {
					item.packageType = item.packageInfo
				}
				return Object.assign({}, item)
			})
			this.ltlDeliveryInfoShow = true
			this.addressType = 'add'
			this.addressData = {
				baseFile: {},
				truckCargos: cargos,
				intrustStatus: ''
			}
		},
		handleInfo(row, index) {
			console.log('🚀 ~ row', row)
			// 处理装卸货地点
			let loadPlace = []
			let unloadPlace = []
			if (row.boxCountry === '中国') {
				loadPlace = [row.boxCountry, row.boxProvince, row.boxCity, row.boxDistrict]
			} else {
				loadPlace = row.boxProvince ? [row.boxCountry, row.boxProvince] : [row.boxCountry]
			}
			if (row.unloadCountry === '中国') {
				unloadPlace = [row.unloadCountry, row.unloadProvince, row.unloadCity, row.unloadDistrict]
			} else {
				unloadPlace = row.unloadProvince ? [row.unloadCountry, row.unloadProvince] : [row.unloadCountry]
			}
			this.addressData = Object.assign({}, row, {
				intrustStatus: this.detailData.intrustStatus,
				loadPlace: loadPlace,
				unloadPlace: unloadPlace
			})
			this.clickRowIndex = index
			this.addressType = 'info'
			this.ltlDeliveryInfoShow = true
		},
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
		ltlDeliveryInfoClose(action, values) {
			if (action === 'Confirm') {
				console.log('新增地址弹窗回调', values)
				if (this.addressType === 'add') {
					this.tableData.push(values)
				}
				if (this.addressType === 'info') {
					this.$set(this.tableData, this.clickRowIndex, values)
					// this.tableData[this.clickRowIndex] = data
					// this.tabldData = data
				}
			}
			this.ltlDeliveryInfoShow = false
		},
		handleViewCargo(row) {
			this.showCargoDialog = true
			this.cargosList = row.truckCargos
		},
		closeDialog() {
			this.showCargoDialog = false
		},
		handleUpload(row, index) {
			this.uploadFileShow = true
			this.clickRowIndex = index
			Object.assign(this.uploadFileQuery, row, {
				intrustNo: this.createItem.intrustNo
			})
		},
		uploadFilePopClose(action, values) {
			console.log(action, values)
			this.uploadFileShow = false
			if (action === 'Confirm') {
				this.$set(this.tableData, this.clickRowIndex, Object.assign(this.tableData[this.clickRowIndex], values))
				// this.$emit('importFile', this.createItem.intrustNo)
			}
		},
		handleDeleteFile(row, index) {
			this.clickRowIndex = index
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						intrustNo: this.createItem.intrustNo,
						loadId: row.loadId,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}
					return ltlFileDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.$set(
								this.tableData,
								this.clickRowIndex,
								Object.assign(this.tableData[this.clickRowIndex], {
									signFile: '',
									signFileName: '',
									signFileNo: '',
									signTime: ''
								})
							)
						}
					})
				})
				.catch(() => {})
		},
		handleViewFile(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.signFile, fileName: row.signFileName })
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#polLtlDetail .oneFifth {
	width: 20%;
}
#polLtlDetail .el-form-item {
	margin-right: 8px;
	margin-bottom: 4px;
}
#polLtlDetail .el-form-item .el-form-item__label {
	padding-right: 4px;
}
#polLtlDetail .btLine {
	position: relative;
	padding-bottom: 4px;
	margin-bottom: 10px;
	&:before {
		content: '';
		position: absolute;
		display: block;
		left: -10px;
		right: -10px;
		bottom: 0;
		background-color: #e9e9e9;
		height: 1px;
	}
}
#polLtlDetail .between {
	&.isFixed {
		position: fixed;
		background-color: #fff;
		z-index: 999;
		padding: 5px 20px;
		height: 30px;
		box-shadow: 4px 0px 10px 0px #e9e9e9;
		top: 24px;
		// top: 64px;
		right: 0;
		.tit {
			line-height: 20px;
		}
	}
}
</style>
