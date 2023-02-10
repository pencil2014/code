<template>
	<div class="customsClearance-container">
		<div class="mb10 between h32 border-bt" id="saveBar">
			<div class="ft14 tit">{{ type === 'add' ? '新增委托' : '委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="mb10 between h32 border-bt isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<div class="ft14 tit">{{ type === 'add' ? '新增委托' : '委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isDisabledEdit">保存</el-button>
			</div>
		</div>
		<el-form ref="customsClearanceSave" :rules="rules" :model="detailData" class="form-body" style="padding: 0 10px" label-width="90px">
			<el-row>
				<el-col :span="6">
					<el-form-item label="清关委托编号" prop="intrustNo" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.intrustNo" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="国家" prop="countryName" :show-message="false">
						<el-input size="mini" placeholder="请输入国家" v-model="detailData.countryName" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="海外代理" prop="overSeaAgentId" :show-message="false">
						<el-select
							style="width: 100%"
							clearable
							placeholder="请选择"
							size="mini"
							remote
							:filterable="true"
							@visible-change="supplierVisibleChange"
							:filter-method="supplierFilterMehod"
							v-model="detailData.overSeaAgentId"
							@change="handleSelectSupplierName"
						>
							<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="海外分公司" prop="overSeaCompanyCode" :show-message="false">
						<el-select v-model="detailData.overSeaCompanyCode" clearable @change="handleSelectOverseasCompanyName" size="mini" filterable placeholder="请选择" style="width: 100%">
							<el-option v-for="(item, index) in abroadCompanyList" :label="item.companyName" :value="item.companyCode" :key="index"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="清关员姓名" prop="customsClearancePeople">
						<el-input size="mini" placeholder="请输入清关员姓名" v-model="detailData.customsClearancePeople" clearable @blur="validContact('customsClearancePeople')"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="清关员电话" prop="customsClearancePhone">
						<el-input size="mini" placeholder="请输入清关员电话" v-model="detailData.customsClearancePhone" clearable @blur="validContact('customsClearancePhone')"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="预计清关时间" prop="customsClearanceTime">
						<elDatePickerLimit size="mini" v-model="detailData.customsClearanceTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="实际清关时间" prop="realCustomsClearanceTime">
						<elDatePickerLimit noCanFuture size="mini" v-model="detailData.realCustomsClearanceTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="清关方式" prop="customsClearanceType">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="detailData.customsClearanceType">
							<el-option v-for="(item, index) in dictMap.podCommClearanceMode" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="24">
					<el-form-item label="清关备注" prop="remark">
						<el-input size="mini" placeholder="请输入" v-model="detailData.remark" clearable show-word-limit maxlength="512"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<div class="table-com-layout">
				<div class="row-tit h32">
					<div class="ft12 tit bold">清关单号</div>
				</div>
				<el-table ref="customsClearanceBox" fit style="width: 100%" :data="hblList" :span-method="objectSpanMethod" class="comClear-table-border">
					<el-table-column prop="mblNo" label="MBL单号" align="center" width="120"></el-table-column>
					<el-table-column prop="hblNo" label="HBL单号" align="center" width="120"></el-table-column>
					<el-table-column label="附件信息" align="center">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button class="underline" @click="handleViewFileList(scope.row, scope.$index)" type="text" size="mini" :disabled="isDisabledEdit">
									点击上传<em v-if="scope.row.fileNum" class="fileNum">({{ scope.row.fileNum }})</em></el-button
								>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-form>
		<div v-if="fileListShow">
			<CustomsClearanceFileList :param="fileListQuery" :attachmentList="attachmentList" @close="fileListPopClose" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel, accMul } from '@/utils/tools'
import { abroadCompanyList } from '@/api/order/list'
import CustomsClearanceFileList from './customsClearanceFileList'

export default {
	filters: {},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		mblVos: {
			type: Array,
			default: () => []
		},
		hblVos: {
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
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			abroadCompanyList: [],
			state: 'valid',
			oQuery: this.$route.query,
			detailData: Object.assign({}, this.createItem),
			supplierList: [],
			rules: {
				intrustNo: [{ required: true, message: '请输入委托编号', trigger: 'blur' }],
				countryName: [{ required: true, message: '请输入国家', trigger: 'blur' }]
				// overSeaAgentId: [
				// 	{ required: false, message: '请选择海外代理', trigger: 'change' }
				// ],
				// overseasCompanyCode: [
				// 	{ required: true, message: '请选择海外分公司', trigger: 'change' }
				// ],
			},
			hblList: [], // 装箱清单
			hblList2: [],
			blNoSpanArr: [], // blNoSpanArr是一个空数组，用于存放M单号每一行记录的合并数
			blNoPos: 0, // blNoPos是blNoSpanArr的索引
			fileListQuery: {}, // 附件列表参数
			fileNumIndex: null, // 点击查看附件行索引
			fileListShow: false // 查看附件弹窗
		}
	},
	created() {
		this.getAbroadCompanyList()
	},
	mounted() {
		// this.rules.overSeaAgentId = [{ required: true, message: '请选择海外代理', trigger: 'change' }]
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.orderList.ordDetRole
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
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			// return !this.isBkg && !this.isEpricing && !this.isEcs
		},
		viewState() {
			return this.oQuery.action === 'view' && !this.isOp
		},
		jointState() {
			return this.oQuery.jointNo ? true : false
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
		CustomsClearanceFileList
	},
	watch: {
		createItem: {
			handler(newVal) {
				this.detailData = Object.assign(
					{ ...newVal },
					{
						overSeaAgentId: newVal.overSeaAgentId === 0 ? '' : newVal.overSeaAgentId
					}
				)
				if (this.detailData.overSeaAgentId) {
					this.supplierList = [{ label: this.detailData.overSeaAgentName, value: this.detailData.overSeaAgentId }]
				} else {
					this.supplierList = []
				}
				// console.log(this.supplierList)
				// this.getListOverseas()
			},
			deep: true,
			immediate: true
		},
		mblVos: {
			handler(newVal) {
				this.setInitTableData(newVal)
			},
			immediate: true
		},
		hblVos: {
			handler(newVal) {
				if (newVal && newVal.length) {
					this.hblList2 = newVal.map(item => {
						return Object.assign({}, item, {
							hblNo: item.blNo
						})
					})
				}
			},
			immediate: true
		}
	},
	methods: {
		handleSelectOverseasCompanyName(val) {
			let findItem = this.abroadCompanyList.find(item => item.companyCode === val)
			this.detailData.overSeaCompanyName = findItem ? findItem.companyName : ''
		},
		getAbroadCompanyList() {
			// 海外分公司
			abroadCompanyList({ isAbroad: 'yes' }).then(res => {
				if (res.data) {
					this.abroadCompanyList = res.data
				}
			})
		},
		// getListOverseas(){
		// 	listOverseasSelect({orderNo:this.$route.query.orderNo}).then(res=>{
		// 		this.supplierList = res.data || []
		// 		this.supplierList.forEach(item => {
		// 			Object.assign(item, {
		// 				label: item.name,
		// 				value: Number(item.code)
		// 			})
		// 		})
		// 		console.log(this.supplierList)
		// 	})
		// },
		validContact(val) {
			let message = ''
			message = val === 'customsClearancePeople' ? '清关员姓名' : val === 'customsClearancePhone' ? '清关员电话' : ''
			if (this.detailData[val].length > 16) {
				this.detailData[val] = this.detailData[val].slice(0, 16)
				return this.$message.warning(message + '输入不能超过16位字符')
			}
		},
		// 初始化表格
		setInitTableData(values) {
			values = values || []
			let list = []
			if (!values.length) return (this.hblList = [])
			values.map(item => {
				if (item.hblVos && item.hblVos.length) {
					item.hblVos.map(ele => {
						let itemQuery = {}
						itemQuery.hblNo = ele.blNo
						itemQuery.mblNo = item.blNo
						itemQuery.fileNum = ele.fileNum
						itemQuery.blId = ele.blId
						list.push(itemQuery)
					})
				} else {
					list.push({ mblNo: item.blNo, mblId: item.blId, fileNum: item.fileNum })
				}
			})
			console.log(list)
			this.hblList = list
			this.getSpanArr(this.hblList)
		},
		// 储存合并相同的箱号的id
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.blNoSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.blNoSpanArr.push(1)
					this.blNoPos = 0
				} else {
					// 判断M单号当前元素与上一个元素是否相同
					if (data[i].mblNo === data[i - 1].mblNo) {
						this.blNoSpanArr[this.blNoPos] += 1
						this.blNoSpanArr.push(0)
					} else {
						this.blNoSpanArr.push(1)
						this.blNoPos = i
					}
				}
			}
			console.log(this.blNoSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// M单号，附件信息列需合并
			if (columnIndex === 0) {
				//用于设置要合并的列
				const _row = this.blNoSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
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
		supplierFilterMehod(val) {
			if (this.detailData.overSeaAgentName && !val) {
				val = this.detailData.overSeaAgentName
			}
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			// if (val) {
			// 	this.getSupplierList()
			// }
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'category', value: 'overseas_agent', queryString: val }).then(data => {
				// over_sea_agent
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
			let findItem = this.supplierList.find(item => item.value === val)
			this.detailData.overSeaAgentName = findItem ? findItem.label : ''
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
		handleSave() {
			this.$refs.customsClearanceSave.validate(valid => {
				if (valid) {
					if (!this.detailData.overSeaAgentId && !this.detailData.overSeaCompanyCode) {
						return this.$message.error(`“海外分公司”、“海外代理”不能都为空`)
					}
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
			if (!this.detailData.customsClearanceType) {
				return this.$message({
					type: 'warning',
					message: '请先选择清关方式'
				})
			}
			this.fileListShow = true
			Object.assign(this.fileListQuery, {
				countryCode: this.detailData.countryCode,
				mblNo: row.mblNo,
				blNo: row.hblNo,
				blId: row.blId,
				mblId: row.mblId,
				intrustNo: this.detailData.intrustNo,
				customsClearanceType: this.detailData.customsClearanceType
			})
			console.log(this.fileListQuery)
		},
		// 附件信息弹窗关闭回调
		fileListPopClose(action, values) {
			console.log(action, values)
			let data = values.filter(item => item.fileNo)
			this.fileListShow = false
			if (this.type === 'add') {
				if (this.mblVos.length) {
					this.$set(
						this.hblList,
						this.fileNumIndex,
						Object.assign(this.hblList[this.fileNumIndex], {
							fileNum: data.length
						})
					)
				}
				if (this.hblVos.length) {
					this.$set(
						this.hblList2,
						this.fileNumIndex,
						Object.assign(this.hblList2[this.fileNumIndex], {
							fileNum: data.length
						})
					)
				}
			} else {
				this.$emit('update', this.detailData.intrustNo)
			}
		}
	}
}
</script>
<style lang="scss">
// @import '../../../../less/index.scss';
.customsClearance-container {
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
	.form-body {
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
	}
	.comClear-table-border td {
		border-right: 1px solid #dfe6ec !important;
	}
	.fileNum {
		font-size: 12px;
		font-style: normal;
		// margin-left: 5px;
	}
}
</style>
