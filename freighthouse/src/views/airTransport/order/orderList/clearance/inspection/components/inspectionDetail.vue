<template>
	<div class="inspection-container">
		<div class="row-tit h32">
			<div class="ft14 tit">{{ type === 'add' ? '新增报检' : '报检信息' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="!isOp || detailData.status === 'finish'">保存</el-button>
			</div>
		</div>
		<el-form ref="inspectionSave" :rules="rules" :model="detailData" class="row-body">
			<el-row>
				<el-col :span="4">
					<el-form-item label="报检委托编号" prop="intrustNo">
						<el-input size="mini" placeholder="请输入" v-model="detailData.intrustNo" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="4">
					<el-form-item label="报检公司" prop="inspectionSupplierId">
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
				<el-col :span="4">
					<el-form-item label="报检员姓名" prop="inspector">
						<el-input size="mini" placeholder="请输入报检员姓名" v-model="detailData.inspector" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="4">
					<el-form-item label="报检员电话" prop="inspectorPhone">
						<el-input size="mini" placeholder="请输入报检员电话" v-model="detailData.inspectorPhone" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="4">
					<el-form-item label="委托日期" prop="intrustTime">
						<elDatePickerLimit size="mini" v-model="detailData.intrustTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="收货人员" prop="consignee">
						<el-input size="mini" placeholder="请输入" v-model="detailData.consignee" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="发货人员" prop="shipper">
						<el-input size="mini" placeholder="请输入" v-model="detailData.shipper" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="通知人1" prop="notify1">
						<el-input size="mini" placeholder="请输入" v-model="detailData.notify1" clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="报检备注" prop="remark">
						<el-input size="mini" placeholder="请输入" v-model="detailData.remark" clearable></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<div class="table-com-layout">
				<div class="row-tit h32">
					<div class="ft14 tit">整箱清单</div>
					<div class="row-tit-operate">
						<el-button size="mini" type="default" @click="handleUploadBox" :disabled="!isOp || detailData.status === 'finish'">上传箱单清单</el-button>
						<el-button size="mini" type="default" @click="handleAddBox" :disabled="!isOp || detailData.status === 'finish'">新增集装箱</el-button>
					</div>
				</div>
				<el-table ref="inspectionBox" fit style="width: 100%" :data="boxList" :span-method="objectSpanMethod">
					<el-table-column prop="cn" label="箱号" align="center" width="100"></el-table-column>
					<el-table-column prop="status" label="附件信息" align="center" width="100">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button class="underline" @click="handleViewFileList(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || detailData.status === 'finish'">
									点击上传<span v-if="scope.row.fileNum">({{ scope.row.fileNum }})</span></el-button
								>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="name" label="品名" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入品名" v-model="scope.row.name" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="mark" label="唛头" align="center" width="250">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入唛头" v-model="scope.row.mark" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="quantity" label="件数" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="handleCountTotalPrice(scope.row, scope.$index)" @change="handleCountTotalPrice(scope.row, scope.$index)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="unitPrice" label="单价" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入单价" v-model="scope.row.unitPrice" clearable @blur="handleCountTotalPrice(scope.row, scope.$index)" @change="handleCountTotalPrice(scope.row, scope.$index)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="currency" label="币别" align="center" width="100">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.currency" placeholder="请选择" clearable @change="handleCountTotalPrice(scope.row, scope.$index)">
								<el-option v-for="(item, index) in currencyList" :key="index" :label="item.code" :value="item.code"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="毛重(KGS)" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="volume" label="体积(CBM)" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="packageType" label="包装" align="center" width="160">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="totalPrice" label="货值(总价)" align="center" width="150">
						<template slot-scope="scope">
							<span v-if="scope.row.totalPrice">{{ scope.row.currency }} {{ scope.row.totalPrice }}</span>
							<span v-else>--</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="120" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleAddCargo(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || detailData.status === 'finish'" v-if="containerIdSpanArr[scope.$index]">添加品名</el-button>
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || detailData.status === 'finish'">删除</el-button>
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
import {mixin} from '../../mixin'
import { getDictLabel, accMul } from '@/utils/tools'
import { supplierInfo } from '@/api/crm/supplier'
import {} from '@/api/order/inspection'
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
			}
		}
	},
	created() {},
	mounted() {},
	computed: {
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
			if ([0, 1].includes(columnIndex)) {
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
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'pol_inspection', queryString: val }).then(data => {
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
						inspector: contact && contact.length ? contact[0].name : '',
						inspectorPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
				})
			} else {
				Object.assign(this.detailData, {
					inspector: '',
					inspectorPhone: ''
				})
			}
		},
		// 新增装箱清单
		handleAddBox() {
			this.popContainerShow = true
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
				numberReg = /^[0-9]+$/
			let nameValid = this.boxList.some(item => !item.name)
			let markValid = this.boxList.some(item => !item.mark)
			let unitPriceValid = this.boxList.some(item => !reg.test(item.unitPrice))
			let currencyValid = this.boxList.some(item => !item.currency)
			let weightValid = this.boxList.some(item => !reg.test(item.weight))
			let volumeValid = this.boxList.some(item => !reg.test(item.volume))
			let quantityValid = this.boxList.some(item => !numberReg.test(item.quantity))
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
				this.$message({ type: 'warning', message: '请填写整箱清单信息', duration: 1000, onClose: () => {} })
				return false
			}
			if (nameValid) {
				this.$message({ type: 'warning', message: '请填写品名' })
				return false
			}
			if (markValid) {
				this.$message({ type: 'warning', message: '请填写唛头' })
				return false
			}
			if (isSameName) {
				this.$message({ type: 'warning', message: '单个箱号不能添加多个相同的品名' })
				return false
			}
			if (quantityValid) {
				this.$message({ type: 'warning', message: '请填写正确的件数' })
				return false
			}
			if (unitPriceValid) {
				this.$message({ type: 'warning', message: '请填写正确的单价' })
				return false
			}
			if (currencyValid) {
				this.$message({ type: 'warning', message: '请选择币别' })
				return false
			}
			if (weightValid) {
				this.$message({ type: 'warning', message: '请填写正确的毛重' })
				return false
			}
			if (volumeValid) {
				this.$message({ type: 'warning', message: '请填写正确的体积' })
				return false
			}
			if (packageTypeValid) {
				this.$message({ type: 'warning', message: '请选择包装' })
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
		// 附件信息弹窗关闭回调
		fileListPopClose(action, values) {
			let data = values.filter(item => item.fileNo)
			this.fileListShow = false
			// 新增时显示附件附件数量
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
			let { cn, containerId } = row
			let currency = 'USD'
			let totalPrice = ''
			let posIndex = index + this.containerIdSpanArr[index]
			console.log(index, this.containerIdSpanArr[index])
			let tempRowVal = { cn, containerId, currency, totalPrice }
			this.boxList.splice(posIndex, 0, tempRowVal)
			this.getSpanArr(this.boxList)

			// let {containerId} = row
			// this.detailData.inspectionCnVos.map(item => {
			//   let currency = 'USD'
			//   let cn = row.cn
			//   let containerId = row.containerId
			//   if (item.containerId === row.containerId) {
			//     return item.inspectionBoxVos.push(Object.assign(this.boxListItemQuery, {cn,containerId,currency}))
			//   }
			// })
			// this.setInitTableData(this.detailData.inspectionCnVos)
			// console.log(this.detailData.inspectionCnVos)
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
.inspection-container {
	.form-body {
		.el-form-item__content {
			margin-right: 10px;
		}
	}
}
</style>
