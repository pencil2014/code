<template>
	<div>
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
							<!-- <el-input size="mini" placeholder="请输入" v-model="formData.loadArea" clearable :disabled="addressData.status !== 'init'"></el-input>
               -->
							<el-cascader v-if="showCasPlace"  style="width:100%" size="mini" :emitPath="true" v-model="formData.loadPlace" :options="loadPlaceData" :props="cityProps" clearable :disabled="addressData.status !== 'init'" @change="handleLoadChange"></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货详细地址" prop="loadAddress">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.loadAddress" clearable maxlength="512" :disabled="addressData.status !== 'init'" class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('on')">选择</el-button>
							</div>
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
							<!-- <el-input size="mini" placeholder="请输入" v-model="formData.unloadArea" clearable :disabled="addressData.status !== 'init'"></el-input> -->
							<el-cascader v-if="showCasPlace"  style="width:100%" size="mini" :emitPath="true" v-model="formData.unloadPlace" :options="unloadPlaceData" :props="cityProps" clearable :disabled="addressData.status !== 'init'" @change="handleUnloadChange"></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货详细地址" prop="unloadAddress">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.unloadAddress" clearable maxlength="512" :disabled="addressData.status !== 'init'" class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('un')">选择</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="邮政编码" prop="postcode">
							<el-input size="mini" placeholder="请输入" v-model="formData.postcode" clearable :disabled="addressData.status !== 'init'"></el-input>
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
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable :disabled="addressData.status !== 'init'"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="快捷输入">
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
						<el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd || addressData.status !== 'init'">添加出仓货物</el-button>
					</div>
				</div>
				<el-table ref="outPlanBox" border fit highlight-current-row stripe style="width: 100%" class="outPlanBoxTable" :data="tableData">
					<!-- <el-table-column prop="inBatchNo" label="进仓编号" align="center"></el-table-column> -->
					<el-table-column prop="boxNo" label="货物箱号" align="center"></el-table-column>
					<el-table-column prop="cname" label="品名" align="center"></el-table-column>
					<el-table-column prop="mark" label="唛头" align="center"></el-table-column>
					<!-- <el-table-column prop="lastQuantity" label="剩余库存件数" align="center"></el-table-column> -->
					<el-table-column prop="quantity" label="预计出仓件数" align="center">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable :disabled="addressData.status !== 'init'" @blur="validateNum('quantity', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="预计出仓毛重(KGS)" align="center" width="150">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable :disabled="addressData.status !== 'init'" @blur="validateVolumeWeight('weight', scope.row)"></el-input>
						</template>
					</el-table-column>
					<!-- <el-table-column prop="lastVolume" label="剩余库存体积" align="center"></el-table-column> -->
					<el-table-column prop="volume" label="预计出仓体积(CBM)" align="center" width="150">
						<template slot-scope="scope">
							<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable :disabled="addressData.status !== 'init'" @blur="validateVolumeWeight('volume', scope.row)"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="packageType" label="预计出仓包装" align="center">
						<template slot-scope="scope">
							<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable :disabled="addressData.status !== 'init'" filterable>
								<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="150" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || addressData.status !== 'init'">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
		</BaseDialog>
		<div v-if="popCargoShow">
			<PopCargo @close="popCargoClose" :bindCargoList="tableData" :param="formData" />
		</div>
		<div v-if="addressPopShow">
			<AddressPop @close="addressPopClose"></AddressPop>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import BaseDialog from '@/components/Base/Dialog/index'
import PopCargo from '../../components/popCargo'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'
import { outSeqno } from '@/api/order/podService/warehouse'
import { getForeignCity, fclTruckIntrustRegion } from '@/api/base'

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
			showCasPlace:true,
			isChina: true,
			cityProps: {
				value: 'cname',
				label: 'cname',
				children: 'children'
			},
			loadPlaceData: [],
			unloadPlaceData: [],
			dialogConfig: {
				title: '装货信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: Object.assign({}, defaultFormData),
			rules: {
				loadPlace: [{ required: true, message: '请选择装货地点', trigger: 'blur' }],
				unloadPlace: [{ required: true, message: '请选择卸货地点', trigger: 'blur' }],
				// loadContact: [{ required: true, message: '装货人不能为空', trigger: 'blur' }],
				// loadContactPhone: [{ required: true, message: '装货人电话不能为空', trigger: 'blur' }],
				unloadContact: [{ required: true, message: '卸货人不能为空', trigger: 'blur' }],
				unloadContactPhone: [{ required: true, message: '卸货人电话不能为空', trigger: 'blur' }]
			},
			tableData: [],
			popCargoShow: false, // 添加货品弹窗
			quickInputModel: '',
			addressPopShow: false,
			loadType: ''
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
			orderNo: state => state.railway.orderNo,
			custid: state => state.railway.custid,
			ordDetRole: state => state.railway.ordDetRole
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
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'op_truck' || this.isAc
		}
	},
	components: {
		BaseDialog,
		PopCargo,
		AddressPop
	},
	methods: {
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
					this.formData.unloadContact = value.contactName
					this.formData.unloadContactPhone = value.contactPhone
					// this.formData.unloadProvince = value.addressProvince
					// this.formData.unloadCity = value.addressCity
					this.formData.unloadAddress = value.addressDetail
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
			if (this.quickInputModel) {
				let arr = this.quickInputModel.split('，')
				if (type === 'box') {
					// 装货
					this.formData.loadContact = arr[0] || ''
					this.formData.loadContactPhone = arr[1] || ''
					this.formData.loadAddress = arr[2] || ''
				} else {
					// 卸货
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
			// let res = await getForeignCity({})
			let res = await fclTruckIntrustRegion({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.unloadPlaceData = this.loadPlaceData
			this.isChina = this.loadPlaceData.some(ele => ele.cname === '中国')
		},
		init() {
			for (let i in defaultFormData) {
				this.formData[i] = this.addressData[i] || ''
			}
			console.log('🚀 ~ 	this.addressData', this.addressData)
			if (this.addressData.loadId) this.formData.loadId = this.addressData.loadId
			this.tableData = [...this.addressData.cargoInfoList]
		},
		// 选择货品
		handleAddCargo() {
			this.popCargoShow = true
		},
		// 货品关闭回调
		popCargoClose(action, values) {
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
		validatePhone() {
			// let reg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/
			// if (!reg.test(this.formData.loadContactPhone)) {
			// 	this.$message({ type: 'error', message: '请输入正确的装货人电话' })
			// 	return false
			// }
			// if (!reg.test(this.formData.unloadContactPhone)) {
			// 	this.$message({ type: 'error', message: '请输入正确的卸货人电话' })
			// 	return false
			// }
			return true
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData }
						console.log('🚀 ~ this.tableData', this.tableData)
						data.cargoInfoList = this.tableData
						if (!this.validate(this.tableData)) return
						// if (!this.validatePhone()) return
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
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label {
		padding-right: 4px;
	}
	.el-form-item__content {
		margin-right: 10px;
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
