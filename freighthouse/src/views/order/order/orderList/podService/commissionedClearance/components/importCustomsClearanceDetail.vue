<template>
	<div class="customsClearance-container">
		<div class="mb10 between h32 border-bt" id="saveBar">
			<div class="ft14 tit">{{ type === 'add' ? '新增委托' : '委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<ButtonTip
					btnType="primary" 
					:btnDisabled="(isBd && !jointState) || isDisabledEdit" 
					btnText="保存" 
					:tipContent="isDocTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleSave">
				</ButtonTip>
				<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="(isBd && !jointState) || isDisabledEdit">保存</el-button> -->
			</div>
		</div>
		<div class="mb10 between h32 border-bt isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<div class="ft14 tit">{{ type === 'add' ? '新增委托' : '委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<ButtonTip
					btnType="primary" 
					:btnDisabled="(isBd && !jointState) || isDisabledEdit" 
					btnText="保存" 
					:tipContent="isDocTip || isJointTip || isFinishTip || statusTip" 
					class="operateBtn-tip ml10" 
					@click="handleSave">
				</ButtonTip>
				<!-- <el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="(isBd && !jointState) || isDisabledEdit">保存</el-button> -->
			</div>
		</div>
		<el-form ref="customsClearanceSave" :rules="rules" :model="detailData" class="form-body" style="padding: 0 10px" label-width="125px">
			<el-row>
				<el-col :span="6">
					<el-form-item label="清关委托编号" prop="intrustNo" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.intrustNo" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<!-- <el-col :span="6">
					<el-form-item label="国家" prop="countryName" :show-message="false">
						<el-input size="mini" placeholder="请输入国家" v-model="detailData.countryName" disabled clearable></el-input>
					</el-form-item>
				</el-col> -->
				<el-col :span="6">
					<el-form-item label="申报方式" prop="declareType" :show-message="false">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="detailData.declareType">
							<el-option v-for="(item, index) in dictMap.importDeclareType" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="报关单号" prop="customsBillNo" :required="billNoRequired" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.customsBillNo" clearable maxlength="128"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="报关行" prop="customsSupplyId" :show-message="false">
						<el-select
							style="width: 100%"
							clearable
							:filterable="true"
							@visible-change="supplierVisibleChange"
							:filter-method="supplierFilterMehod"
							placeholder="请选择"
							size="mini"
							v-model="detailData.customsSupplyId"
							@change="handleSelectSupplierName"
						>
							<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
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
					<el-form-item label="清关方式" prop="customsClearanceType" :show-message="false">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="detailData.customsClearanceType">
							<el-option v-for="(item, index) in dictMap.podCommClearanceMode" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="收货人是否有进口权" prop="isImportRight" :show-message="false">
						<el-select style="width: 100%" clearable placeholder="请选择" size="mini" v-model="detailData.isImportRight">
							<el-option v-for="(item, index) in yesOrNoOptions" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<!-- <el-col :span="6">
					<el-form-item label="HSCODE" prop="hscode" :show-message="false">
						<el-select size="mini" v-model="detailData.hscode" style="width: 100%" remote filterable clearable placeholder="请选择海关编号" @change="handleChangeHscode" :remote-method="val => queryCargoHscode(val)">
							<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="中文品名" prop="cargoCname" :show-message="false">
						<el-input size="mini" v-model="detailData.cargoCname" clearable placeholder="请输入中文品名" maxlength="128"></el-input>
					</el-form-item>
				</el-col> -->
				<el-col :span="24">
					<el-form-item label="清关备注" prop="remark">
						<el-input size="mini" placeholder="请输入" v-model="detailData.remark" clearable show-word-limit maxlength="512"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<div class="table-com-layout">
				<div class="row-tit h32">
					<div class="ft12 tit bold">清关货物</div>
				</div>
				<el-table fit style="width: 100%" :data="detailData.cargos" class="comClear-table-border">
					<el-table-column prop="hscode" label="HS code" align="center">
						<template slot-scope="scope">
							<el-form-item class="cargos-hscode-item" :prop="'cargos.' + scope.$index + '.hscode'" :rules="rules.hscode" :show-message="false">
								<el-select size="mini" v-model="scope.row.hscode" style="width: 100%" filterable clearable placeholder="请选择海关编号" @change="val => handleChangeHscode(val, scope.row)">
									<el-option v-for="(item, index) in hscodeOptions" :key="index" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column prop="cname" label="中文品名" align="center"> </el-table-column>
					<el-table-column prop="ename" label="英文品名" align="center"> </el-table-column>
					<el-table-column prop="totalPrice" label="货值" align="center">
						<template slot-scope="scope">
							<el-form-item class="cargos-hscode-item" :prop="'cargos.' + scope.$index + '.totalPrice'" :rules="rules.totalPrice" :show-message="false">
								<el-input maxlength="16" size="mini" placeholder="请输入货值" v-model="scope.row.totalPrice" clearable @blur="validatePoint(scope.row, 'totalPrice')"></el-input>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column prop="currency" label="币种" align="center">
						<template slot-scope="scope">
							<el-form-item class="cargos-hscode-item" :prop="'cargos.' + scope.$index + '.currency'" :rules="rules.currency" :show-message="false">
								<el-select size="mini" filterable v-model="scope.row.currency">
									<el-option v-for="item in currencyList" :label="item.code" :value="item.code" :key="item.code"></el-option>
								</el-select>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="" align="center">
						<template slot-scope="scope">
							<i class="el-icon-circle-plus-outline plus-minus-outline" @click="handleAddCargo(scope.$index)"></i>
							<i class="el-icon-remove-outline plus-minus-outline" @click="handleDeleteCargo(scope.$index)" v-if="scope.$index > 0"></i>
						</template>
					</el-table-column>
				</el-table>
			</div>
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
								<ButtonTip
									btnType="text" 
									:btnDisabled="(isBd && !jointState) || isDisabledEdit" 
									btnText="" 
									:tipContent="isDocTip || isJointTip || isFinishTip || statusTip" 
									class="operateBtn-tip" 
									@click="handleViewFileList(scope.row, scope.$index)">
									点击上传<em v-if="scope.row.fileNum" class="fileNum">({{ scope.row.fileNum }})</em>
								</ButtonTip>
								<!-- <el-button class="underline" @click="handleViewFileList(scope.row, scope.$index)" type="text" size="mini" :disabled="(isBd && !jointState) || isDisabledEdit">
									点击上传<em v-if="scope.row.fileNum" class="fileNum">({{ scope.row.fileNum }})</em></el-button
								> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
				<!-- <el-table ref="customsClearanceBox2" fit style="width: 100%" :data="hblList2" class="comClear-table-border" v-if="createItem.businessType === 'ship_import_lcl'">
					<el-table-column prop="hblNo" label="HBL单号" align="center" width="300"></el-table-column>
					<el-table-column prop="status" label="附件信息" align="center">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button class="underline" @click="handleViewFileList(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || detailData.customsClearanceStatus === 'finish'">
									点击上传<em v-if="scope.row.fileNum" class="fileNum">({{ scope.row.fileNum }})</em></el-button
								>
							</div>
						</template>
					</el-table-column>
				</el-table> -->
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
import { orderJointInfo, orderInfo } from '@/api/order/list'
import CustomsClearanceFileList from './customsClearanceFileList'
import { customsClearanceGetOrderCargoInfo, baseCurrencyList } from '@/api/base'

export default {
	filters: {},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
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
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isBd: {
			type: Boolean,
			default: false
		},
		isDocTip: {
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
		},
		statusTip: {
			type: String,
			default: ''
		},
	},
	data() {
		return {
			state: 'valid',
			oQuery: this.$route.query,
			detailData: Object.assign({}, this.createItem),
			supplierList: [],
			rules: {
				intrustNo: [{ required: true, message: '请输入委托编号', trigger: 'blur' }],
				isImportRight: [{ required: true, message: '请选择', trigger: 'change' }],
				hscode: [{ required: true, message: '请选择', trigger: 'change' }],
				totalPrice: [{ required: true, message: '请输入货值', trigger: 'blur' }],
				currency: [{ required: true, message: '请选择', trigger: 'change' }],
				cargoCname: [{ required: true, message: '请输入', trigger: 'blur' }],
				declareType: [{ required: true, message: '请输入', trigger: 'change' }],
				// customsBillNo: [{ required: true, message: '请输入', trigger: 'blur' }],
				customsClearanceType: [{ required: true, message: '请选择', trigger: 'blur' }]
			},
			hblList: [], // 装箱清单
			hblList2: [],
			blNoSpanArr: [], // blNoSpanArr是一个空数组，用于存放M单号每一行记录的合并数
			blNoPos: 0, // blNoPos是blNoSpanArr的索引
			fileListQuery: {}, // 附件列表参数
			fileNumIndex: null, // 点击查看附件行索引
			fileListShow: false, // 查看附件弹窗
			hscodeOptions: [], // hscode下拉数据
			yesOrNoOptions: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			],
			currencyList: []
		}
	},
	created() {
		this.queryCargoHscode()
		this.getCurrencyList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
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
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		// isBd() {
		// 	let isBd =this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || (!this.isDoc && !this.isEpricing && !this.isEcs)
		// 	if (['ship_customs','ship_export_customs','ship_import_customs'].includes(this.$store.state.order.orderInfoDataObj.businessType) && this.ordDetRole === 'op_truck') {
		// 		isBd =false
		// 	}
		// 	return isBd
		// },
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
		},
		billNoRequired() {
			// 进口业务 当“清关状态”变为“已委托”或者“清关完成”时，则“报关单号”需必填
			// return ['intrust', 'finish'].includes(this.detailData.customsClearanceStatus)
			return false
		},
	},
	components: {
		CustomsClearanceFileList
	},
	watch: {
		createItem: {
			handler(newVal) {
				console.log('🚀 ~ newVal', newVal)
				console.log('🚀 ~ newVal.cargos', newVal.cargos)
				let detailData = Object.assign(
					{ ...newVal },
					{
						customsSupplyId: newVal.customsSupplyId || ''
					}
				)

				if (detailData.customsSupplyId) {
					this.supplierList = [{ label: detailData.customsSupplyName, value: detailData.customsSupplyId }]
				} else {
					this.supplierList = []
				}
				this.detailData = JSON.parse(JSON.stringify(detailData))
				if (newVal.cargos) {
					this.detailData.cargos = JSON.parse(JSON.stringify(newVal.cargos))
				} else {
					this.detailData.cargos = [{ hscode: '', cname: '', ename: '', totalPrice: '' }]
				}
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
		getCurrencyList(queryString) {
      // 币别下拉列表
			baseCurrencyList(queryString, 'valid').then(response => {
				this.currencyList = response.data
			})
		},
		// add
		handleAddCargo() {
			console.log('🚀 ~ this.createItem', this.createItem)
			this.detailData.cargos.push({
				hscode: '',
				cname: '', //中文品名
				ename: '', //英文品名
				totalPrice: ''
			})
		},

		// 删除一行箱型箱量
		handleDeleteCargo(index) {
			this.detailData.cargos.splice(index, 1)
		},
		validatePoint(item, val) {
			const reg = /^\d+(\.\d+)?$/
			if (item[val] && !reg.test(item[val])) {
				item[val] = ''
				return this.$message.error('请输入正确数字')
			}
		},
		handleChangeHscode(val, row) {
			console.log('🚀 ~ row', row)
			console.log('🚀 ~ val', val)
			// if (!val) this.hscodeOptions = []
			let item = this.hscodeOptions.find(item => item.value === val)
			if (item) {
				row.cname = item.cname
				row.ename = item.ename
			} else {
				row.cname = ''
				row.ename = ''
			}
		},
		// hscode模糊查询
		queryCargoHscode() {
			customsClearanceGetOrderCargoInfo({ orderNo: this.$route.query.orderNo }).then(response => {
				// this.hscodeOptions = response.data.map(item => {
				// 	return Object.assign(item, {
				// 		label: `[${item.hscode}]${item.cname}`,
				// 		value: item.hscode
				// 	})
				// })
				// 报关单，hscode非必填了
				let data=response.data || []
				let arr =[]
				for(let i=0;i<data.length;i++){
					if(data[i].hscode){
						arr.push({
							label: `[${data[i].hscode}]${data[i].cname}`,
							value: data[i].hscode,
							...data[i]
						})
					}
				}
				this.hscodeOptions = arr
			})
		},
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
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val && !this.detailData.customsSupplyId) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'category', value: 'declaration', queryString: val }).then(data => {
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
@import '../../../../less/index.scss';
.customsClearance-container {
	.cargos-hscode-item {
		.el-form-item__content {
			margin-left: 0 !important;
		}
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
	.form-body {
		.el-form-item {
			margin-bottom: 4px;
		}
		.el-form-item__label {
			padding-right: 4px;
		}
		.el-form-item__content {
			margin-right: 10px;
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
