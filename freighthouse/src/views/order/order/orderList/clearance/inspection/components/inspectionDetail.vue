<template>
	<div class="inspection-container">
		<div class="info-tit" id="saveBar">
			<div class="tit">{{ type === 'add' ? '新增报检' : '报检信息' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<ButtonTip
					btnType="primary" 
					:btnDisabled="!isOpTruck || isJoint || isDisabledEdit" 
					btnText="保存" 
					:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleSave">
				</ButtonTip>
				<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="!isOpTruck || isJoint || isDisabledEdit">保存</el-button> -->
			</div>
		</div>
		<div class="info-tit isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<div class="tit">{{ type === 'add' ? '新增报检' : '报检信息' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<ButtonTip
					btnType="primary" 
					:btnDisabled="!isOpTruck || isJoint || isDisabledEdit" 
					btnText="保存" 
					:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleSave">
				</ButtonTip>
				<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="!isOpTruck || isJoint || isDisabledEdit">保存</el-button> -->
			</div>
		</div>
		<el-form ref="inspectionSave" :rules="rules" :model="detailData" class="agent-row-body" label-width="90px">
			<el-row>
				<el-col :span="6">
					<el-form-item label="报检委托编号" prop="intrustNo">
						<el-input size="mini" placeholder="请输入" v-model="detailData.intrustNo" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="报检公司" prop="inspectionSupplierId" :show-message="false">
						<el-select
							style="width: 100%"
							clearable
							placeholder="请选择"
							size="mini"
							v-model="detailData.inspectionSupplierId"
							:filterable="true"
							@visible-change="supplierVisibleChange"
							:filter-method="supplierFilterMehod"
							@change="handleSelectSupplierName"
						>
							<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="报检员姓名" prop="inspector">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="detailData.inspector"
							:fetch-suggestions="(queryString, cb) => querySearchInspector(queryString, cb)"
							placeholder="请输入报检员姓名"
							@select="value => handleSelectInspector(value)"
						></el-autocomplete>
						<!-- <el-input size="mini" placeholder="请输入报检员姓名" v-model="detailData.inspector" clearable ></el-input> -->
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="报检员电话" prop="inspectorPhone">
						<el-input size="mini" placeholder="请输入报检员电话" v-model="detailData.inspectorPhone" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="委托日期" prop="intrustTime">
						<elDatePickerLimit size="mini" v-model="detailData.intrustTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="收货人员" prop="consignee" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.consignee" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="发货人员" prop="shipper" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.shipper" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="通知人1" prop="notify1" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.notify1" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="报检备注" prop="remark">
						<el-input size="mini" placeholder="请输入" v-model="detailData.remark" clearable maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<div class="table-com-layout mt10">
				<div class="row-tit mb04" style="border-bottom: 0px">
					<div class="ft14 tit">{{ isFcl ? '整箱清单' : '拼箱清单' }}</div>
					<div class="row-tit-operate">
						<el-button size="mini" type="default" @click="handleViewLclFileList" v-if="!isFcl">附件信息</el-button>
						<ButtonTip
							btnType="default" 
							:btnDisabled="!isOpTruck || isJoint || isDisabledEdit" 
							btnText="上传箱单清单" 
							:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
							class="operateBtn-tip ml10" 
							@click="handleUploadBox">
						</ButtonTip>
						<!-- <el-button size="mini" type="default" @click="handleUploadBox" :disabled="!isOpTruck || isJoint  || isDisabledEdit">上传箱单清单</el-button> -->
						<ButtonTip
							btnType="primary" 
							:btnDisabled="!isOpTruck || isJoint || isDisabledEdit" 
							:btnText="isFcl ? '新增集装箱' : '添加货物信息'" 
							:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
							class="operateBtn-tip ml10" 
							@click="handleAddBox">
						</ButtonTip>
						<!-- <el-button size="mini" type="primary" @click="handleAddBox" :disabled="!isOpTruck || isJoint || isDisabledEdit">{{ isFcl ? '新增集装箱' : '添加货物信息' }}</el-button> -->
					</div>
				</div>
				<el-table ref="inspectionBox" fit style="width: 100%" :data="boxList" :span-method="objectSpanMethod">
					<el-table-column prop="cn" label="箱号" align="center" width="120" v-if="isFcl"></el-table-column>
					<el-table-column prop="status" label="附件信息" align="center" width="100" v-if="isFcl">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button class="underline" @click="handleViewFileList(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOpTruck || isJoint || detailData.status === 'finish' || isDisabledEdit">
									点击上传<em v-if="scope.row.fileNum">({{ scope.row.fileNum }})</em></el-button
								>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="name" label="品名" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入品名" v-model="scope.row.name" clearable maxlength="32"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="mark" label="唛头" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入唛头" v-model="scope.row.mark" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="quantity" label="件数" align="center" width="120">
						<template slot-scope="scope">
							<el-input
								size="mini"
								placeholder="请输入件数"
								v-model="scope.row.quantity"
								clearable
								@blur="validateNum('quantity', scope.row)"
								@input="handleCountTotalPrice(scope.row, scope.$index)"
								@change="handleCountTotalPrice(scope.row, scope.$index)"
							></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="unitPrice" label="单价" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入单价" v-model="scope.row.unitPrice" clearable @input="handleCountTotalPrice(scope.row, scope.$index)" @change="handleCountTotalPrice(scope.row, scope.$index)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="currency" label="币别" align="center" width="120">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.currency" placeholder="请选择" clearable @change="handleCountTotalPrice(scope.row, scope.$index)">
								<el-option v-for="(item, index) in currencyList" :key="index" :label="item.code" :value="item.code"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="毛重(KGS)" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="volume" label="体积(CBM)" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="packageType" label="包装" align="center" width="140">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="totalPrice" label="货值(总价)" align="center" width="120">
						<template slot-scope="scope">
							<span v-if="scope.row.totalPrice">{{ scope.row.currency }} {{ scope.row.totalPrice }}</span>
							<span v-else>--</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<ButtonTip v-if="isFcl && containerIdSpanArr[scope.$index]"
									btnType="text" 
									:btnDisabled="!isOpTruck || isJoint || isDisabledEdit" 
									btnText="添加品名" 
									:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
									class="operateBtn-tip" 
									@click="handleAddCargo(scope.row, scope.$index)">
								</ButtonTip>
								<ButtonTip
									btnType="text" 
									:btnDisabled="!isOpTruck || isJoint || isDisabledEdit" 
									btnText="删除" 
									:tipContent="isOpTruckTip || isFinishTip || isJointTip || statusTip" 
									class="operateBtn-tip" 
									btnClassName="red"
									@click="handleDelete(scope.row, scope.$index)">
								</ButtonTip>
								<!-- <el-button @click="handleAddCargo(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOpTruck || isJoint || isDisabledEdit" v-if="isFcl && containerIdSpanArr[scope.$index]">添加品名</el-button> -->
								<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOpTruck || isJoint || isDisabledEdit">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-form>
		<div v-if="fileListShow">
			<InspectionFileList :param="fileListQuery" :attachmentList="attachmentList" @close="fileListPopClose" />
		</div>
		<div v-if="boxUploadShow">
			<InspectionBoxUpload :intrustNo="detailData.intrustNo" @close="boxUploadPopClose" />
		</div>
		<div v-if="popContainerShow">
			<PopContainer @close="popContainerClose" :bindContainerList="boxList" />
		</div>
		<div v-if="showCnameDialog">
			<CnameDialog :clickType="'planIn'" @close="closeCnameDialog"></CnameDialog>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { mixin } from '../../mixin'
import { getDictLabel, accMul } from '@/utils/tools'
import { orderJointInfo, orderInfo } from '@/api/order/list'
import { supplierInfo } from '@/api/crm/supplier'
// import {} from '@/api/order/inspection'
import InspectionFileList from './inspectionFileList'
import InspectionBoxUpload from './inspectionBoxUpload'
import PopContainer from './popContainer'
import CnameDialog from './cnameDialog'

export default {
	mixins: [mixin],
	filters: {},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		currencyList: {
			type: Array,
			default: () => []
		},
		attachmentList: {
			type: Array,
			default: () => []
		},
		type: {
			type: String,
			default: ''
		},
		isJoint: {
			type: Boolean,
			default: false
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isJointTip: {
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
		isOpTruckTip: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			state: 'valid',
			oQuery: this.$route.query,
			supplierList: [],
			detailData: {},
			rules: {
				intrustNo: [{ required: true, message: '请输入委托编号', trigger: 'blur' }],
				inspectionSupplierId: [{ required: true, message: '请选择报检公司', trigger: 'change' }],
				consignee: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
				shipper: [{ required: true, message: '请输入发货人', trigger: 'blur' }],
				notify1: [{ required: true, message: '请输入通知人1', trigger: 'blur' }]
			},
			boxList: [], // 代理报检装箱清单
			containerIdSpanArr: [],
			pos: 0,
			fileListQuery: {}, // 附件列表参数
			fileNumIndex: null, // 点击查看附件行索引
			fileListShow: false, // 查看附件弹窗
			boxUploadShow: false, // 装箱清单弹窗
			popContainerShow: false, // 集装箱弹窗
			showCnameDialog: false, // 品名弹窗
			clickCnameIndex: '',
			boxListItemQuery: {
				oid: undefined,
				cn: '',
				fileNum: '',
				containerId: null,
				currency: '',
				intrustNo: '',
				mark: '',
				name: '',
				packageType: '',
				quantity: '',
				unitPrice: '',
				volume: '',
				weight: '',
				totalPrice: ''
			},
			restaurants: [], // 供应商所有值
			contactInfo: []
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			orderInfoData: state => state.order.orderInfoData,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isFcl() {
			return this.orderInfoData.businessType === 'ship_export_fcl'
		},
		isOpTruck() {
			// 整箱 op_truck
			if (['ship_export_fcl','ship_customs','ship_export_customs','ship_import_customs'].includes(this.orderInfoData.businessType)) {
				return this.userEditRoles.includes('op_truck')
			}

			// 散杂滚装、散货 op, op_truck
			if (['ship_export_lcl', 'ship_bulk_ro'].includes(this.orderInfoData.businessType)) {
				return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs') || this.userEditRoles.includes('op_truck')
			}
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
	},
	components: {
		InspectionFileList,
		InspectionBoxUpload,
		PopContainer,
		CnameDialog
	},
	watch: {
		createItem: {
			handler(newVal) {
				this.detailData = { ...newVal }
				this.supplierList = [{ label: this.detailData.inspectionSupplierName, value: this.detailData.inspectionSupplierId }]
				// 获取报检公司联系人信息
				if (this.detailData.inspectionSupplierId) {
					supplierInfo({ supplierId: this.detailData.inspectionSupplierId }).then(res => {
						let { contact } = res.data
						this.restaurants = this.loadAll(contact)
					})
				}
				this.setInitTableData(this.detailData.inspectionCnVos)
				console.log('', this.detailData)
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		// 初始化表格
		setInitTableData(values) {
			values = values || []
			let boxList = []
			if (!values.length) return (this.boxList = [])
			values.map(item => {
				item.inspectionBoxVos.map((ele, index) => {
					let itemQuery = {}
					for (let i in this.boxListItemQuery) {
						itemQuery[i] = item[i] ? item[i] : ele[i]
					}
					if (index === 0) {
						Object.assign(itemQuery, {
							addCargo: true,
							length: item.inspectionBoxVos.length
						})
					}
					boxList.push(itemQuery)
				})
			})
			console.log(boxList)
			this.boxList = boxList
			this.getSpanArr(this.boxList)
		},
		// 储存合并相同的箱号的id
		getSpanArr(data) {
			/*
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.containerIdSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.containerIdSpanArr.push(1) //containerIdSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是containerIdSpanArr的索引
				} else {
					// 判断箱号当前元素与上一个元素是否相同
					if (data[i].containerId === data[i - 1].containerId) {
						this.containerIdSpanArr[this.pos] += 1
						this.containerIdSpanArr.push(0)
					} else {
						this.containerIdSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.containerIdSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 箱号，附件列需合并
			if (this.isFcl && [0, 1].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.containerIdSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		// 跟进单价，件数，币别计算货值
		handleCountTotalPrice(row, index) {
			let { currency, unitPrice, quantity } = row
			if (currency && unitPrice && quantity) {
				let totalPrice = accMul(quantity, unitPrice)
				Object.assign(row, { totalPrice })
			} else {
				Object.assign(row, {
					totalPrice: ''
				})
			}
		},
		// 获取供应商
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'pol_declaration', queryString: val }).then(data => {
				this.supplierList = data.list
				this.supplierList.forEach(item => {
					Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
			})
		},
		handleSelectSupplierName(val) {
			if (val) {
				let supplierItem = this.supplierList.find(item => item.value === val)
				this.detailData.inspectionSupplierName = supplierItem.label
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.detailData, {
						inspector: contact && contact.length ? contact[0].name || contact[0].ename : '',
						inspectorPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
					this.restaurants = this.loadAll(contact)
				})
			} else {
				Object.assign(this.detailData, {
					inspector: '',
					inspectorPhone: ''
				})
			}
		},
		querySearchInspector(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
			cb(results)
		},
		handleSelectInspector(item) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						Object.assign(this.detailData, {
							inspectorPhone: this.contactInfo[i].mobileNo
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
		// 新增装箱清单
		handleAddBox() {
			// 整箱选择集装箱
			if (this.isFcl) {
				return (this.popContainerShow = true)
			}
			// 拼箱增加货物信息
			this.handleAddCargo()
		},
		// 选择集装箱关闭回调
		popContainerClose(action, values) {
			this.popContainerShow = false
			values = values || []
			if (action === 'Confirm') {
				if (!values.length) return
				let containerIds = []
				this.boxList.map(item => {
					containerIds.push(item.containerId)
				})
				// 过滤掉详情已有的箱子，只取新增的箱子并默认显示添加品名，币别为USD
				let addContainerData = values.filter(item => !containerIds.includes(item.containerId))
				addContainerData.map(item => {
					return Object.assign(item, {
						addCargo: true,
						currency: 'USD',
						length: 1
					})
				})
				this.boxList = this.boxList.concat(addContainerData)
				this.getSpanArr(this.boxList)

				// addContainerData.map(item => {
				//   this.detailData.inspectionCnVos.push({
				//     cn: item.cn,
				//     containerId: item.containerId,
				//     fileNum: '',
				//     inspectionBoxVos:[{currency: 'USD'}]
				//   })
				// })
				// this.setInitTableData(this.detailData.inspectionCnVos)
				// console.log('callback', this.boxList)
			}
		},
		// 装箱清单上传
		handleUploadBox() {
			this.boxUploadShow = true
		},
		// 装箱清单上传回调
		boxUploadPopClose(action, values) {
			this.boxUploadShow = false
			if (action === 'Confirm') {
				this.setInitTableData(values)
			}
		},
		handleCancel() {
			this.$emit('cancel')
		},
		// 格式校验
		validate() {
			let isSameName = false,
				reg = /^\d+(\.\d+)?$/,
				numberReg = /^\d+(?=\.{0,1}\d+$|$)/
			let nameValid = this.boxList.some(item => !item.name)
			let markValid = this.boxList.some(item => !item.mark)
			let unitPriceValid = this.boxList.some(item => !reg.test(item.unitPrice))
			let currencyValid = this.boxList.some(item => !item.currency)
			let weightValid = this.boxList.some(item => !reg.test(item.weight))
			let volumeValid = this.boxList.some(item => !reg.test(item.volume))
			// let quantityValid= this.boxList.some(item =>!numberReg.test(item.quantity)||item.quantity>9999999)
			let quantityValidErrType = ''
			for (let i = 0; i < this.boxList.length; i++) {
				if (!numberReg.test(this.boxList[i].quantity)) {
					quantityValidErrType = 1
					break
				} else if (numberReg.test(this.boxList[i].quantity) && this.boxList[i].quantity > 9999999) {
					quantityValidErrType = 2
					break
				}
			}

			let packageTypeValid = this.boxList.some(item => !item.packageType)

			for (let i = 0; i < this.boxList.length; i++) {
				if (i === 0) {
					isSameName = false
				} else {
					if (this.boxList[i].containerId === this.boxList[i - 1].containerId && this.boxList[i].name === this.boxList[i - 1].name) {
						isSameName = true
					}
				}
			}
			if (!this.boxList.length) {
				let t = ''
				t = this.isFcl ? '整箱' : '拼箱'
				this.$message({ type: 'error', message: `请填写${t}清单信息`, duration: 1000, onClose: () => {} })
				return false
			}
			if (nameValid) {
				this.$message({ type: 'error', message: '请填写品名' })
				return false
			}
			if (markValid) {
				this.$message({ type: 'error', message: '请填写唛头' })
				return false
			}
			if (isSameName) {
				this.$message({ type: 'error', message: '单个箱号不能添加多个相同的品名' })
				return false
			}
			if (quantityValidErrType === 1) {
				this.$message({ type: 'error', message: '请填写正确的件数' })
				return false
			}
			if (quantityValidErrType === 2) {
				this.$message({ type: 'error', message: '最大件数不能超过9999999' })
				return false
			}
			if (unitPriceValid) {
				this.$message({ type: 'error', message: '请填写正确的单价' })
				return false
			}
			if (currencyValid) {
				this.$message({ type: 'error', message: '请选择币别' })
				return false
			}
			if (weightValid) {
				this.$message({ type: 'error', message: '请填写正确的毛重' })
				return false
			}
			if (volumeValid) {
				this.$message({ type: 'error', message: '请填写正确的体积' })
				return false
			}
			if (packageTypeValid) {
				this.$message({ type: 'error', message: '请选择包装' })
				return false
			}
			return true
		},
		handleSave() {
			this.$refs.inspectionSave.validate(valid => {
				// valid
				if (valid) {
					if (!this.validate()) return
					this.$emit('save', this.detailData)
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		// 查看附件
		handleViewFileList(row, index) {
			this.fileNumIndex = index
			this.fileListShow = true
			Object.assign(this.fileListQuery, {
				cn: row.cn,
				containerId: row.containerId,
				intrustNo: this.detailData.intrustNo
			})
			console.log(this.fileListQuery)
		},
		handleViewLclFileList() {
			this.fileListShow = true
			Object.assign(this.fileListQuery, {
				intrustNo: this.detailData.intrustNo
			})
		},
		// 附件信息弹窗关闭回调
		fileListPopClose(action, values) {
			let data = values.filter(item => item.fileNo)
			this.fileListShow = false
			// 新增时显示附件附件数量
			if (this.isFcl) {
				this.$set(
					this.boxList,
					this.fileNumIndex,
					Object.assign(this.boxList[this.fileNumIndex], {
						fileNum: data.length
					})
				)
			}
		},
		// 添加品名
		handleAddCargo(row, index) {
			if (this.isFcl) {
				let { cn, containerId } = row
				let currency = 'USD'
				let totalPrice = ''
				let posIndex = index + this.containerIdSpanArr[index]
				console.log(index, this.containerIdSpanArr[index], this.boxList)
				let tempRowVal = { cn, containerId, currency, totalPrice }
				this.boxList.splice(posIndex, 0, tempRowVal)
				this.getSpanArr(this.boxList)
			} else {
				this.boxList.push({})
			}
		},
		handleDelete(row, sIndex) {
			this.boxList = this.boxList.filter((item, index) => index !== sIndex)
			this.getSpanArr(this.boxList)
		},
		// 点击品名
		cnameClick(index) {
			this.clickCnameIndex = index
			this.showCnameDialog = true
		},
		closeCnameDialog(action, values) {
			this.showCnameDialog = false
			if (action === 'Confirm') {
				console.log('品名关闭回调', values)
				Object.assign(this.boxList[this.clickCnameIndex], {
					name: values.cname,
					mark: values.mark
				})
			}
		}
	}
}
</script>
<style lang="scss">
@import '../../../../less/index.scss';
.agentDetail .inspection-container {
	.row-body {
		// .el-col-6{
		// 	width: 20%;
		// }
		.el-form-item__content {
			margin-right: 10px;
		}
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
		&.isFixed {
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
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
}
</style>
