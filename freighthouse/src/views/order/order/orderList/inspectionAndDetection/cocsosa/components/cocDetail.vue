<template>
	<div class="coc-container">
		<div class="row-tit h32" id="saveBar">
			<div class="ft12 tit">{{ type === 'add' ? '新增COC/SASO委托' : 'COC/SASO委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<ButtonTip
					btnType="primary" 
					:btnDisabled="!isOp || isJoint || detailData.status === 'finish'" 
					btnText="保存" 
					:tipContent="isOpTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleSave">
				</ButtonTip>
				<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="!isOp || isJoint || detailData.status === 'finish'">保存</el-button> -->
			</div>
		</div>
		<div class="row-tit h32 isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<div class="ft12 tit">{{ type === 'add' ? '新增COC/SASO委托' : 'COC/SASO委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<ButtonTip
					btnType="primary" 
					:btnDisabled="!isOp || isJoint || detailData.status === 'finish'" 
					btnText="保存" 
					:tipContent="isOpTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleSave">
				</ButtonTip>
				<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="!isOp || isJoint || detailData.status === 'finish'">保存</el-button> -->
			</div>
		</div>
		<el-form ref="cocSave" :rules="rules" :model="detailData" class="form-body mt10" label-width="90px">
			<el-row>
				<el-col :span="6">
					<el-form-item label="检测委托编号" prop="intrustNo" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.intrustNo" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="国家" prop="countryName" :show-message="false">
						<el-input size="mini" placeholder="请输入国家" v-model="detailData.countryName" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="检测类型" prop="checkType" :show-message="false">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="detailData.checkType" @change="handleSelectCheckType">
							<el-option v-for="(item, index) in checkTypeOptions" :key="item" :label="index" :value="index"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="申报公司" prop="declareCustid" :show-message="false">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="detailData.declareCustid" :filterable="true" @visible-change="custVisibleChange" :filter-method="custFilterMehod" @change="handleSelectCustName">
							<el-option v-for="(item, index) in custOptions" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="联系人姓名" prop="declareContact">
						<el-input size="mini" placeholder="请输入联系人姓名" v-model="detailData.declareContact" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="联系人电话" prop="declareContactPhone">
						<el-input size="mini" placeholder="请输入联系人电话" v-model="detailData.declareContactPhone" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="检测公司" prop="checkSupplierId" :show-message="false">
						<el-select
							style="width: 100%"
							clearable
							placeholder="请选择"
							size="mini"
							v-model="detailData.checkSupplierId"
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
					<el-form-item label="检测联系人" prop="checkContact">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="detailData.checkContact"
							:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
							placeholder="请输入检测联系人"
							@select="value => handleSelectContact(value)"
						></el-autocomplete>
						<!-- <el-input size="mini" placeholder="请输入检测联系人" v-model="detailData.checkContact" clearable></el-input> -->
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="检测联系人电话" prop="checkContactPhone">
						<el-input size="mini" placeholder="请输入检测联系人电话" v-model="detailData.checkContactPhone" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="验货日期" prop="examineGoodsTime">
						<elDatePickerLimit size="mini" v-model="detailData.examineGoodsTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="检测要求" prop="remark">
						<el-input size="mini" placeholder="请输入" v-model="detailData.remark" clearable maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<div class="table-com-layout">
				<div class="row-tit h32" style="border-bottom: 0; padding: 0">
					<div class="ft12 tit">箱单清单</div>
					<div class="row-tit-operate">
						<ButtonTip
							btnType="primary" 
							:btnDisabled="!isOp || isJoint || detailData.status === 'finish'" 
							btnText="上传箱单清单" 
							:tipContent="isOpTip || isJointTip || isFinishTip || statusTip" 
							class="operateBtn-tip" 
							@click="handleUploadBox">
						</ButtonTip>
						<!-- <el-button size="mini" type="default" @click="handleUploadBox" :disabled="!isOp || isJoint || detailData.status === 'finish'">上传箱单清单</el-button> -->
						<!-- <el-button size="mini" type="default" @click="handleAddBox" :disabled="isBd">新增集装箱</el-button> -->
					</div>
				</div>
				<el-table ref="cocBox" border fit highlight-current-row stripe style="width: 100%" :data="boxList" :span-method="objectSpanMethod">
					<el-table-column prop="blNo" label="M单号" align="center" width="120"></el-table-column>
					<el-table-column prop="status" label="附件信息" align="center">
						<template slot-scope="scope">
							<div class="operate-group">
								<ButtonTip
									btnType="text" 
									:btnDisabled="!isOp || isJoint || detailData.status === 'finish'" 
									btnText="" 
									:tipContent="isOpTip || isJointTip || isFinishTip || statusTip" 
									class="operateBtn-tip" 
									@click="handleViewFileList(scope.row, scope.$index)">
									点击上传<em v-if="scope.row.fileNum">({{ scope.row.fileNum }})</em>
								</ButtonTip>
								<!-- <el-button class="underline" @click="handleViewFileList(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || isJoint || detailData.status === 'finish'">
									点击上传<em v-if="scope.row.fileNum">({{ scope.row.fileNum }})</em></el-button
								> -->
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="cn" label="箱号" align="center" width="120" v-if="!isBulkRo"></el-table-column>
					<el-table-column prop="name" label="品名" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入品名" v-model="scope.row.name" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="mark" label="唛头" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入唛头" v-model="scope.row.mark" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="quantity" label="件数" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入件数" v-model="scope.row.quantity" clearable @blur="validateQuantity('quantity', scope.row)" @input="handleCountTotalPrice(scope.row)" @change="handleCountTotalPrice(scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="unitPrice" label="单价" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入单价" v-model="scope.row.unitPrice" clearable @input="handleCountTotalPrice(scope.row)" @change="handleCountTotalPrice(scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="currency" label="币别" align="center">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.currency" placeholder="请选择" clearable @change="handleCountTotalPrice(scope.row)">
								<el-option v-for="(item, index) in currencyList" :key="index" :label="item.code" :value="item.code"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="毛重(KGS)" align="center" width="100">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)" ></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="volume" label="体积(CBM)" align="center" width="100">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)" ></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="packageType" label="包装" align="center">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="totalPrice" label="货值(总价)" align="center">
						<template slot-scope="scope">
							<span v-if="scope.row.totalPrice">{{ scope.row.currency }} {{ scope.row.totalPrice }}</span>
							<span v-else>--</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<ButtonTip v-if="containerIdSpanArr[scope.$index]"
									btnType="text" 
									:btnDisabled="!isOp || isJoint || detailData.status === 'finish'" 
									btnText="添加品名" 
									:tipContent="isOpTip || isJointTip || isFinishTip || statusTip" 
									class="operateBtn-tip" 
									@click="handleAddCargo(scope.row, scope.$index)">
								</ButtonTip>
								<!-- <el-button @click="handleAddCargo(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || isJoint || detailData.status === 'finish'" v-if="containerIdSpanArr[scope.$index]">添加品名</el-button> -->
								<ButtonTip
									btnType="text" 
									:btnDisabled="!isOp || isJoint || detailData.status === 'finish'" 
									btnText="删除" 
									:tipContent="isOpTip || isJointTip || isFinishTip || statusTip" 
									class="operateBtn-tip" 
									btnClassName="red"
									@click="handleDelete(scope.row, scope.$index)">
								</ButtonTip>
								<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || isJoint || detailData.status === 'finish'">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-form>
		<div v-if="fileListShow">
			<CocFileList :param="fileListQuery" @close="fileListPopClose" />
		</div>
		<div v-if="boxUploadShow">
			<CocBoxUpload :intrustNo="detailData.intrustNo" @close="boxUploadPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import {mixin} from '../../mixin'
import { getDictLabel, accMul } from '@/utils/tools'
import { orderJointInfo, orderInfo } from '@/api/order/list'
import { supplierInfo, customerInfo } from '@/api/crm/supplier'
import CocFileList from './cocFileList'
import CocBoxUpload from './cocBoxUpload'

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
		// attachmentList: {
		//   type: Array,
		//   default: () => ([])
		// },
		type: {
			type: String,
			default: ''
		},
		isJoint: {
			type: Boolean,
			default: false
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isOpTip: {
			type: String,
			default: ''
		},
		isJointTip: {
			type: String,
			default: ''
		},
		isFinishTip: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			state: 'valid',
			oQuery: this.$route.query,
			custOptions: [],
			supplierList: [],
			checkTypeOptions: { COC: 'inspection_detection_coc', SASO: 'inspection_detection_saso' },
			detailData: {},
			rules: {
				intrustNo: [{ required: true, message: '请输入委托编号', trigger: 'blur' }],
				countryName: [{ required: true, message: '请输入国家', trigger: 'blur' }],
				checkType: [{ required: true, message: '请选择检测类型', trigger: 'change' }],
				declareCustid: [{ required: true, message: '请选择申报公司', trigger: 'change' }],
				checkSupplierId: [{ required: true, message: '请选择检测公司', trigger: 'change' }]
			},
			boxList: [], // 装箱清单
			blNoSpanArr: [], // blNoSpanArr是一个空数组，用于存放M单号每一行记录的合并数
			blNoPos: 0, // blNoPos是blNoSpanArr的索引
			containerIdSpanArr: [],
			pos: 0,
			fileListQuery: {}, // 附件列表参数
			fileNumIndex: null, // 点击查看附件行索引
			fileListShow: false, // 查看附件弹窗
			boxUploadShow: false, // 装箱清单弹窗
			boxListItemQuery: {
				oid: undefined,
				blNo: '',
				blId: '',
				fileNum: '',
				cn: '',
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
			contactInfo: [],
		}
	},
	created() {},
	mounted() {},
	computed: {
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
		CocFileList,
		CocBoxUpload
	},
	watch: {
		createItem: {
			handler(newVal) {
				this.detailData = Object.assign(
					{ ...newVal },
					{
						checkSupplierId: newVal.checkSupplierId === 0 ? '' : newVal.checkSupplierId,
						declareCustid: newVal.declareCustid === 0 ? '' : newVal.declareCustid
					}
				)
				this.custOptions = [{ label: this.detailData.declareCustName, value: this.detailData.declareCustid }]
				this.supplierList = [{ label: this.detailData.checkSupplierName, value: this.detailData.checkSupplierId }]
				// 获取报检公司联系人信息
				if (this.detailData.checkSupplierId) {
					supplierInfo({ supplierId: this.detailData.checkSupplierId }).then((res) => {
						let { contact } = res.data
						this.restaurants = this.loadAll(contact)
					})
				}
				this.setInitTableData(this.detailData.cocBlVos)
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
				if (item.cocCnVos && item.cocCnVos.length) {
					item.cocCnVos.map(ele => {
						if (ele.cocBoxVos && ele.cocBoxVos.length) {
							ele.cocBoxVos.map((o, oIndex) => {
								let itemQuery = {}
								for (let i in this.boxListItemQuery) {
									itemQuery[i] = item[i] ? item[i] : ele[i] ? ele[i] : o[i]
								}
								if (oIndex === 0) {
									Object.assign(itemQuery, {
										addCargo: true,
										length: ele.cocBoxVos.length
									})
								}
								boxList.push(itemQuery)
							})
						} else {
							boxList.push({ blNo: item.blNo, blId: item.blId, fileNum: item.fileNum, cn: ele.cn, containerId: ele.containerId })
						}
					})
				} else {
					boxList.push({ blNo: item.blNo, blId: item.blId, fileNum: item.fileNum })
				}
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
			this.blNoSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.containerIdSpanArr.push(1) //containerIdSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是containerIdSpanArr的索引
					this.blNoSpanArr.push(1)
					this.blNoPos = 0
				} else {
					// 判断M单号当前元素与上一个元素是否相同
					if (data[i].blNo === data[i - 1].blNo) {
						this.blNoSpanArr[this.blNoPos] += 1
						this.blNoSpanArr.push(0)
					} else {
						this.blNoSpanArr.push(1)
						this.blNoPos = i
					}
					// 判断箱号当前元素与上一个元素是否相同
					if (data[i].blNo === data[i - 1].blNo && data[i].containerId === data[i - 1].containerId) {
						this.containerIdSpanArr[this.pos] += 1
						this.containerIdSpanArr.push(0)
					} else {
						this.containerIdSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.containerIdSpanArr, this.blNoSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// M单号，附件信息列需合并
			if ([0, 1].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.blNoSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
			// 箱号列需合并
			if (!this.isBulkRo && columnIndex === 2) {
				const _row = this.containerIdSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row,
					colspan: _col
				}
			}
		},
		// 跟进单价，件数，币别计算货值
		handleCountTotalPrice(row) {
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
		// 获取申报公司
		custFilterMehod(val) {
			this.getCustList(val)
		},
		custVisibleChange(val) {
			if (val) {
				this.getCustList()
			}
		},
		getCustList(val = '') {
			this.$store.dispatch('dict/queryCustomerList', val).then(data => {
				this.custOptions = data.list
				this.custOptions.forEach(item => {
					Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.name,
						value: item.custid ? Number(item.custid) : ''
					})
				})
			})
		},
		handleSelectCustName(val) {
			if (val) {
				let custItem = this.custOptions.find(item => item.value === val)
				this.detailData.declareCustName = custItem.label
				customerInfo({ custid: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.detailData, {
						declareContact: contact && contact.length ? contact[0].name : '',
						declareContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
				})
			} else {
				Object.assign(this.detailData, {
					declareCustid: '',
					declareCustName: '',
					declareContact: '',
					declareContactPhone: ''
				})
			}
		},
		// 获取供应商
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val) {
				if (!this.detailData.checkType) {
					return this.$message({ type: 'error', message: '请先选择检测类型' })
				}
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'coc_saso', queryString: val }).then(data => {
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
				this.detailData.checkSupplierName = supplierItem.label
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.detailData, {
						checkContact: contact && contact.length ? contact[0].name : '',
						checkContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
					this.restaurants = this.loadAll(contact)
				})
			} else {
				Object.assign(this.detailData, {
					checkSupplierId: '',
					checkSupplierName: '',
					checkContact: '',
					checkContactPhone: ''
				})
			}
		},
		querySearchContact(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString
				? restaurants.filter(this.createFilter(queryString))
				: restaurants
			cb(results)
		},
		handleSelectContact(item) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						Object.assign(this.detailData, {
							checkContactPhone: this.contactInfo[i].mobileNo,
						})
						return
					}
				}
			}
		},
		createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
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
		handleSelectCheckType(val) {
			Object.assign(this.detailData, {
				checkSupplierId: '',
				checkSupplierName: ''
			})
			this.supplierList = []
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
			let unitPriceValid = this.boxList.some(item => !reg.test(item.unitPrice))
			let weightValid = this.boxList.some(item => !reg.test(item.weight))
			let volumeValid = this.boxList.some(item => !reg.test(item.volume))
			let quantityValid = this.boxList.some(item => !numberReg.test(item.quantity))
			let packageTypeValid = this.boxList.some(item => !item.packageType)
			let currencyValid = this.boxList.some(item => !item.currency)
			let markValid = this.boxList.some(item => !item.mark)

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
				this.$message({ type: 'error', message: '请填写整箱清单信息' })
				return false
			}
			if (nameValid) {
				this.$message({ type: 'error', message: '请填写品名' })
				return false
			}
			if (isSameName) {
				this.$message({ type: 'error', message: '单个箱号不能添加多个相同的品名' })
				return false
			}
			if (markValid) {
				this.$message({ type: 'error', message: '请填写唛头' })
				return false
			}
			if (quantityValid) {
				this.$message({ type: 'error', message: '请填写正确的件数' })
				return false
			}
			if (unitPriceValid) {
				this.$message({ type: 'error', message: '请填写正确的单价' })
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
			if (currencyValid) {
				this.$message({ type: 'error', message: '请选择正确的币别' })
				return false
			}
			if (packageTypeValid) {
				this.$message({ type: 'error', message: '请选择包装' })
				return false
			}
			return true
		},
		handleSave() {
			this.$refs.cocSave.validate(valid => {
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
				blNo: row.blNo,
				blId: row.blId,
				intrustNo: this.detailData.intrustNo,
				checkSupplierName: this.detailData.checkSupplierName ? this.detailData.checkSupplierName : undefined
			})
			console.log(this.fileListQuery)
		},
		// 附件信息弹窗关闭回调
		fileListPopClose(action, values) {
			let data = values.filter(item => item.fileNo)
			this.fileListShow = false
			this.$set(
				this.boxList,
				this.fileNumIndex,
				Object.assign(this.boxList[this.fileNumIndex], {
					fileNum: data.length
				})
			)
			// if (this.type === 'add') {
			//   this.$set(this.boxList, this.fileNumIndex, Object.assign(this.boxList[this.fileNumIndex], {
			//     fileNum: data.length
			//   }))
			// } else {
			//   this.$emit('update', this.detailData.intrustNo)
			// }
		},
		// 添加品名
		handleAddCargo(row, index) {
			let { cn, containerId, blNo, blId } = row
			let currency = 'USD'
			let totalPrice = ''
			let posIndex = index + this.containerIdSpanArr[index]
			console.log(index, this.containerIdSpanArr[index])
			let tempRowVal = { blNo, blId, cn, containerId, currency, totalPrice }
			this.boxList.splice(posIndex, 0, tempRowVal)
			this.getSpanArr(this.boxList)
		},
		handleDelete(row, sIndex) {
			this.boxList = this.boxList.filter((item, index) => index !== sIndex)
			this.getSpanArr(this.boxList)
		}
	}
}
</script>
<style lang="scss">
@import '../../../../less/index.scss';
.coc-container {
	padding: 0 20px;
	.row-tit{
		padding: 0;
		&.isFixed{
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
			height: 30px !important;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			// top: 64px;
			right: 0;
			.tit{
				line-height: 20px !important;
			}
		}
	}
	.form-body {
		.el-form-item{
			margin-bottom: 4px;
		}
		.el-form-item__label {
			padding-right: 4px;
		}
		.el-form-item__content {
			margin-right: 10px;
		}
	}
}
</style>
