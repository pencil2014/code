<template>
	<div class="table-com-layout">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="ltlDeliveryInfo" ref="form" :rules="rules" :model="formData" label-width="80px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="装货人" prop="loadContact" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货人电话" prop="loadContactPhone" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="委托装柜时间" prop="preLoadTime">
							<elDatePickerLimit size="mini" v-model="formData.preLoadTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="实际装柜时间" prop="loadTime">
							<elDatePickerLimit noCanFuture size="mini" v-model="formData.loadTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货地点" prop="loadPlace" :show-message="false">
							<!-- <el-input size="mini" placeholder="请输入" v-model="formData.loadArea" clearable></el-input> -->
							<el-cascader
								style="width:100%"
								size="mini"
								:emitPath="true"
								v-model="formData.loadPlace"
								:options="loadPlaceData"
								:props="cityProps"
								clearable
								@change="handleLoadChange"
							></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货详细地址" prop="loadAddress">
							<el-input size="mini" placeholder="请输入" v-model="formData.loadAddress" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人" prop="unloadContact" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人电话" prop="unloadContactPhone" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货地点" prop="unloadPlace" :show-message="false">
							<!-- <el-input size="mini" placeholder="请输入" v-model="formData.unloadArea" clearable></el-input> -->
							<el-cascader
								style="width:100%"
								size="mini"
								:emitPath="true"
								v-model="formData.unloadPlace"
								:options="unloadPlaceData"
								:props="cityProps"
								clearable
								@change="handleUnloadChange"
							></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货详细地址" prop="unloadAddress">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadAddress" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="邮政编码" prop="postcode">
							<el-input size="mini" placeholder="请输入" v-model="formData.postcode" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="司机姓名" prop="driverName">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverName" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="司机电话" prop="driverPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车牌号" prop="licensePlate">
							<el-input size="mini" placeholder="请输入" v-model="formData.licensePlate" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="备注" prop="remark">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="快捷输入" >
							<div class="quick-class">
									<el-input size="mini" clearable v-model="quickInputModel" placeholder="请依次输入姓名、电话、地址，中文逗号隔开"></el-input>
									<el-button size="mini" type="primary" class="ml10" @click="handleQuickInput('box')">填充到装货人</el-button>
									<el-button size="mini" type="primary" class="ml10" @click="handleQuickInput('unload')">填充到卸货人</el-button>
							</div>
						</el-form-item>
					</el-col>
				</el-row>
				<div class="row-tit h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd && !isImportJoint">添加出仓货物</el-button>
					</div>
				</div>
				<el-table ref="outPlanBox" fit highlight-current-row style="width: 100%" class="outPlanBoxTable" :data="tableData">
					<el-table-column prop="inBatchNo" label="进仓编号" align="center"></el-table-column>
					<el-table-column prop="boxNo" label="货物箱号" align="center"></el-table-column>
					<el-table-column prop="cname" label="品名" align="center"></el-table-column>
					<el-table-column prop="mark" label="唛头" align="center"></el-table-column>
					<el-table-column prop="lastQuantity" label="剩余库存件数" align="center" width="100"></el-table-column>
					<el-table-column prop="quantity" label="预计出仓件数" align="center" width="120">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="validateNum('quantity', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="预计出仓毛重(KGS)" align="center" width="150">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="lastVolume" label="剩余库存体积" align="center" width="100"></el-table-column>
					<el-table-column prop="volume" label="预计出仓体积(CBM)" align="center" width="150">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="packageType" label="预计出仓包装" align="center" width="120">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="150" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd && !isImportJoint">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
		</BaseDialog>
		<div v-if="popCargoShow">
			<PopCargo @close="popCargoClose" :bindCargoList="tableData" :param="formData" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import {quantityMixin} from '@/views/order/order/mixins/quantityMixin'
import { validatePhone } from '@/utils/validate'
import BaseDialog from '@/components/Base/Dialog/index'
import PopCargo from '../../components/popCargo'
import { outSeqno } from '@/api/order/podService/warehouse'
import { getForeignCity } from '@/api/base'

const defaultFormData = {
	outPlanNo: '',
	loadContact: '',
	loadContactPhone: '',
	preLoadTime: '',
	loadTime: '',
	loadArea: '',
	loadAddress: '',
	unloadContact: '',
	unloadContactPhone: '',
	unloadArea: '',
	unloadAddress: '',
	postcode: '',
	driverName: '',
	driverPhone: '',
	licensePlate: '',
	remark: '',
	custid: '',
	custName: '',
	whId: '',
	whName: '',
	loadPlace: [],
	loadProvince: '',
	loadCity: '',
	unloadPlace: [],
	unloadProvince: '',
	unloadCity: ''
}
export default {
	mixins: [quantityMixin],
	data() {
		return {
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
				// loadContact: [{ required: true, message: '装货人不能为空', trigger: 'blur' }],
				// loadContactPhone: [{ required: true, message: '装货人电话不能为空', trigger: 'blur' }],
				unloadContact: [{ required: true, message: '卸货人不能为空', trigger: 'blur' }],
				unloadContactPhone: [{ required: true, message: '卸货人电话不能为空', trigger: 'blur' }],
				loadPlace: [{ required: true, message: '请选择装货地点', trigger: 'blur' }],
				unloadPlace: [{ required: true, message: '请选择卸货地点', trigger: 'blur' }]
			},
			tableData: [],
			popCargoShow: false // 添加货品弹窗
		}
	},
	props: {
		addressData: {
			type: Object,
			default: () => ({})
		}
	},
	watch: {
		// addressData: {
		//   handler(newValue) {
		//     console.log(newValue)
		//     for (let i in defaultFormData) {
		//       this.formData[i] = newValue[i] || ''
		//     }
		//     this.tableData = [...newValue.cargoInfoList]
		//     console.log(this.formData)
		//   },
		//   deep: true,
		//   immediate: true
		// }
	},
	created() {
		this.init()
		//获取国家城市级联框数据
		this.getLoadPlaceData()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			orderInfoDataObj: state => state.order.orderInfoDataObj
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
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfoDataObj.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
		},
	},
	components: {
		BaseDialog,
		PopCargo
	},
	methods: {
		handleQuickInput(type) {
       if (this.quickInputModel) {
				 let arr = this.quickInputModel.split('，')
				 if (type === 'box') { // 装货
            this.formData.loadContact = arr[0] || ''
						this.formData.loadContactPhone = arr[1] || ''
						this.formData.loadAddress = arr[2] || ''
				 } else { // 卸货
            this.formData.unloadContact = arr[0] || ''
						this.formData.unloadContactPhone = arr[1] || ''
						this.formData.unloadAddress = arr[2] || ''
				 }
			 }
		},
		//卸货地点
		handleUnloadChange(val) {
			this.formData.unloadCountry = val[0] || ''
			this.formData.unloadProvince = val[1] || ''
			this.formData.unloadCity = val[2] || ''
			this.formData.unloadDistrict = val[3] || ''

			// this.formData.unloadProvince = val[0] || ''
			// this.formData.unloadCity = val[1] || ''
			console.log('🚀 ~ this.unloadPlace', this.formData.unloadPlace)
		},
		//装货地点
		handleLoadChange(val) {
			this.formData.loadCountry = val[0] || ''
			this.formData.loadProvince = val[1] || ''
			this.formData.loadCity = val[2] || ''
			this.formData.loadDistrict = val[3] || ''

			// this.formData.loadProvince = val[0] || ''
			// this.formData.loadCity = val[1] || ''
			console.log('🚀 ~ this.loadPlace', this.formData.loadPlace)
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
			let res = await getForeignCity({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.unloadPlaceData = this.loadPlaceData
		},
		init() {
			for (let i in defaultFormData) {
				this.formData[i] = this.addressData[i] || ''
			}
			this.tableData = [...this.addressData.cargoInfoList]
			console.log(this.formData)
		},
		// 选择货品
		handleAddCargo() {
			this.popCargoShow = true
		},
		// 货品关闭回调
		popCargoClose(action, values) {
			console.log(action, values)
			this.popCargoShow = false
			values = values || []
			if (action === 'Confirm') {
				if (!values.length) return
				values = values.map(item => {
					return Object.assign(item, {
						inBatchNo: item.batchNo,
						quantity: item.lastQuantity,
						weight: item.lastWeight,
						volume: item.lastVolume
					})
				})
				let itemIds = []
				this.tableData.map(item => {
					itemIds.push(item.inItemId)
				})
				// 过滤掉table已有的货品，只取新增的货品并默认显示添加箱号、件毛体包装等
				let addCargoData = values.filter(item => !itemIds.includes(item.inItemId))
				this.tableData = this.tableData.concat(addCargoData)
			}
		},
		// 删除货物箱
		handleDelete(row, sIndex) {
			this.tableData = this.tableData.filter((item, index) => index !== sIndex)
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^[0-9]+$/,
				reg = /^\d+(\.\d+)?$/
			let quantityValid = values.some(item => !numberReg.test(item.quantity))
			let weightValid = values.some(item => !reg.test(item.weight))
			let volumeValid = values.some(item => !reg.test(item.volume))
			if (!values.length) {
				this.$message({ type: 'error', message: '请选择货品' })
				return false
			}
			if (values.some(item => !item.quantity || quantityValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品件数' })
				return false
			}
			if (values.some(item => !item.weight || weightValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品毛重' })
				return false
			}
			if (values.some(item => !item.volume || volumeValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品体积' })
				return false
			}
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '请选择正确的货品包装' })
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData }
						data.cargoInfoList = this.tableData
						let phoneValidateValues = [
							{ prop: 'loadContactPhone', message: '请输入正确的装货人电话', value: this.formData.loadContactPhone },
							{ prop: 'unloadContactPhone', message: '请输入正确的卸货人电话', value: this.formData.unloadContactPhone }
						]
						if (!this.validate(this.tableData)) return
						// if (!validatePhone(phoneValidateValues)) return
						this.close('Confirm', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss">
#ltlDeliveryInfo {
	// .el-row {
	// 	padding: 10px 0 0 0;
	// }
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item{
		margin-bottom: 4px;
	}
	.el-form-item__label {
		padding-right: 4px;
	}
	.el-form-item__content {
		margin-right: 10px;
	}
	.row-tit {
		padding: 0 0 !important;
	}
	.inPlanBoxTable {
		margin-top: -1px;
	}
	.outPlanBoxTable td {
		border-right: 1px solid #dfe6ec !important;
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
