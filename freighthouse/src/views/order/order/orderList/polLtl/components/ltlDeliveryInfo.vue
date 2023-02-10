<template>
	<div class="table-com-layout">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="pol-ltl-delivery-info" ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<!-- <el-col :span="6">
						<el-form-item label="客户名称" prop="shipperCustid" :show-message="false">
							<el-select v-model="formData.shipperCustid" filterable clearable @visible-change="customerSearch" :filter-method="customerSearch" @change="handleChangeCustId" size="mini" style="width:100%">
								<el-option v-for="(ele, index) in custOptions" :key="index" 
									:label="ele.label" 
									:value="ele.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col> -->
					<el-col :span="6">
						<el-form-item label="装货人" prop="boxContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.boxContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货人电话" prop="boxContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.boxContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="委托装货时间" prop="preBoxTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.preBoxTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="实际到场时间" prop="boxTime">
							<elDatePickerLimit noCanFuture size="mini" v-model="formData.boxTime" type="datetime" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd HH:mm:ss" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货地点" prop="loadPlace" :show-message="false">
							<el-cascader v-if="showCasPlace" style="width:100%" size="mini" filterable :emitPath="true" v-model="formData.loadPlace" :options="loadPlaceData" :props="cityProps" clearable @change="handleLoadChange"></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="装货详细地址" prop="boxAddress" :show-message="false">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.boxAddress" clearable maxlength="512" show-word-limit class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('on')">选择</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人" prop="unloadContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货人电话" prop="unloadContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.unloadContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货地点" prop="unloadPlace" :show-message="false">
							<el-cascader v-if="showCasPlace" style="width:100%" size="mini" filterable :emitPath="true" v-model="formData.unloadPlace" :options="unloadPlaceData" :props="cityProps" clearable @change="handleUnloadChange"></el-cascader>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="卸货详细地址" prop="unloadAddress" :show-message="false">
							<div class="box-address-flex">
								<el-input size="mini" placeholder="请输入" v-model="formData.unloadAddress" clearable maxlength="512" show-word-limit class="box-address-input"></el-input>
								<el-button type="default" size="mini" class="box-address-btn" @click="showAddressPop('un')">选择</el-button>
							</div>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="4">
						<el-form-item label="邮政编码" prop="postcode">
							<el-input size="mini" placeholder="请输入" v-model="formData.postcode" clearable></el-input>
						</el-form-item>
					</el-col> -->
					<el-col :span="6">
						<el-form-item label="司机姓名">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverName" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="司机电话">
							<el-input size="mini" placeholder="请输入" v-model="formData.driverPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="车牌号">
							<el-input size="mini" placeholder="请输入" v-model="formData.licensePlate" clearable></el-input>
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
				<div class="row-tit between h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd || addressData.intrustStatus === 'dispatched'">添加货品</el-button>
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
							<el-input size="mini" placeholder="请输入件数" v-model="scope.row.quantity" clearable @blur="validateQuantity('quantity', scope.row)"></el-input>
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
					<el-table-column label="操作" width="150" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || addressData.intrustStatus === 'dispatched'">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
			<div v-if="addressPopShow">
				<AddressPop @close="addressPopClose"></AddressPop>
			</div>
		</BaseDialog>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import { validatePhone } from '@/utils/validate'
import BaseDialog from '@/components/Base/Dialog/index'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'
import { getDomesticCity, cargoHscodeList, fclTruckIntrustRegion } from '@/api/base'

const defaultFormData = {
	loadId: undefined,
	outPlanNo: '',
	boxContact: '',
	boxContactPhone: '',
	preBoxTime: '',
	boxTime: '',
	boxAddress: '',
	unloadContact: '',
	unloadContactPhone: '',
	unloadAddress: '',
	// postcode: '',
	driverName: '',
	driverPhone: '',
	licensePlate: '',
	shipperCustid: '',
	shipperCustName: '',
	// whId: '',
	// whName: '',
	loadPlace: [],
	boxProvince: '',
	boxCity: '',
	boxDistrict: '',
	unloadPlace: [],
	unloadProvince: '',
	unloadCity: '',
	unloadDistrict: '',
	signFileNo: '',
	signFileName: '',
	truckCargos: []
}
export default {
	mixins: [quantityMixin],
	data() {
		return {
			showCasPlace: true,
			isChina: true,
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
				shipperCustid: [{ required: true, message: ' ', trigger: 'change' }],
				loadPlace: [{ required: true, message: ' ', trigger: 'blur' }],
				boxAddress: [{ required: true, message: ' ', trigger: 'blur' }],
				unloadPlace: [{ required: true, message: ' ', trigger: 'blur' }],
				preBoxTime: [{ required: true, message: ' ', trigger: 'change' }],
				unloadAddress: [{ required: true, message: ' ', trigger: 'blur' }]
			},
			tableData: [],
			custOptions: [],
			hscodeOptions: [],
			quickInputModel: '',
			addressPopShow: false,
			loadType: 'on' // on-装货，un-卸货
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
			ordDetRole: state => state.order.orderList.ordDetRole
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
		}
	},
	components: {
		BaseDialog,
		AddressPop
	},
	methods: {
		showAddressPop(val) {
			this.addressPopShow = true
			this.loadType = val
		},
		addressPopClose(action, value) {
			this.addressPopShow = false
			if (action === 'Confirm') {
				if (this.loadType === 'on') {
					this.formData.boxContact = value.contactName || ''
					this.formData.boxContactPhone = value.contactPhone || ''
					// this.formData.loadPlace = [value.addressProvince, value.addressCity, value.addressArea]
					// this.formData.boxProvince = value.addressProvince
					// this.formData.boxCity = value.addressCity
					// this.formData.boxDistrict = value.addressArea
					this.formData.boxAddress = value.addressDetail
					this.showCasPlace = false
					if (!value.isChina) {
						this.formData.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					} else {
						this.formData.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					}
					this.$nextTick(() => {
						this.showCasPlace = true
					})
					this.formData.boxCountry = value.addressCountry
					this.formData.boxProvince = value.addressProvince
					this.formData.boxCity = value.addressCity
					this.formData.boxDistrict = value.addressArea

					// // 国内省市区
					// if (this.isChina && value.isChina) {
					// 	this.formData.loadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
					// 	this.formData.boxCountry = value.addressCountry
					// 	this.formData.boxProvince = value.addressProvince
					// 	this.formData.boxCity = value.addressCity
					// 	this.formData.boxDistrict = value.addressArea
					// }
					// // 国外国家到洲，有的数据只有国家没有洲
					// if (!this.isChina && !value.isChina) {
					// 	this.formData.loadPlace = value.addressProvince ? [value.addressCountry, value.addressProvince] : [value.addressCountry]
					// 	this.formData.boxCountry = value.addressCountry
					// 	this.formData.boxProvince = value.addressProvince
					// }
				}
				if (this.loadType === 'un') {
					this.formData.unloadContact = value.contactName || ''
					this.formData.unloadContactPhone = value.contactPhone || ''
					// this.formData.unloadPlace = [value.addressProvince, value.addressCity, value.addressArea]
					// this.formData.unloadProvince = value.addressProvince
					// this.formData.unloadCity = value.addressCity
					// this.formData.unloadDistrict = value.addressArea
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
							return prev + curr
						} else {
							return prev
						}
					}, 0)
					sums[index]
				}
			})
			return sums
		},
		custVisibleChange(val) {
			val && this.customerSearch('')
		},
		custRemoteMethod(val) {
			this.customerSearch(val)
		},
		// 客户模糊查询
		customerSearch(val) {
			this.$store.dispatch('dict/queryCustomerList', val === true ? '' : val).then(data => {
				let list = data.list
				this.custOptions = list.map(o => {
					return {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		},
		handleChangeCustId(val) {
			let findItem = this.custOptions.find(item => item.value === val)
			this.formData.shipperCustName = findItem ? findItem.label : ''
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
		handleChangeHscode(val) {
			if (!val) this.hscodeOptions = []
		},
		//卸货地点
		handleUnloadChange(val) {
			this.formData.unloadCountry = val[0] || ''
			this.formData.unloadProvince = val[1] || ''
			this.formData.unloadCity = val[2] || ''
			this.formData.unloadDistrict = val[3] || ''

			// this.formData.unloadProvince = val[0] || ''
			// this.formData.unloadCity = val[1] || ''
			// this.formData.unloadDistrict = val[2] || ''
			console.log('🚀 ~ this.unloadPlace', this.formData.unloadPlace)
		},
		//装货地点
		handleLoadChange(val) {
			this.formData.boxCountry = val[0] || ''
			this.formData.boxProvince = val[1] || ''
			this.formData.boxCity = val[2] || ''
			this.formData.boxDistrict = val[3] || ''

			// this.formData.boxProvince = val[0] || ''
			// this.formData.boxCity = val[1] || ''
			// this.formData.boxDistrict = val[2] || ''
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
			// let res = await getDomesticCity({})
			let res = await fclTruckIntrustRegion({})
			//处理最后一级children空数组
			this.loadPlaceData = this.handleChildren(res.data)
			this.unloadPlaceData = this.loadPlaceData
			this.isChina = this.loadPlaceData.some(ele => ele.cname === '中国')
		},
		init() {
			// for (let i in defaultFormData) {
			// 	this.formData[i] = this.addressData[i] || ''
			// }
			console.log('addressData', this.addressData)
			this.formData = Object.assign({}, defaultFormData, this.addressData)
			// this.createItem.unloadPlace = [value.addressCountry, value.addressProvince, value.addressCity, value.addressArea]
			this.tableData = [...this.addressData.truckCargos]
			this.custOptions = [{ label: this.formData.shipperCustName, value: this.formData.shipperCustid }]
			console.log(this.formData, this.tableData)
		},
		handleAddCargo() {
			this.tableData.push({})
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
		close(action, value) {
			this.$emit('close', action, value)
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^\d+(?=\.{0,1}\d+$|$)/,
				reg = /^\d+(\.\d+)?$/
			let quantityValid = values.some(item => !numberReg.test(item.quantity))
			let weightValid = values.some(item => !reg.test(item.weight))
			let volumeValid = values.some(item => !reg.test(item.volume))
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
			// if (values.some(item => !item.weight || weightValid)) {
			// 	this.$message({ type: 'error', message: '请填写正确的货品毛重' })
			// 	return false
			// }
			// if (values.some(item => !item.volume || volumeValid)) {
			// 	this.$message({ type: 'error', message: '请填写正确的货品体积' })
			// 	return false
			// }
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '请选择包装' })
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						if (!this.validate(this.tableData)) return
						let data = { ...this.formData }
						data.truckCargos = this.tableData
						this.close('Confirm', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		handleQuickInput(type) {
			if (this.quickInputModel) {
				let arr = this.quickInputModel.split('，')
				if (type === 'box') {
					// 装货
					this.formData.boxContact = arr[0] || ''
					this.formData.boxContactPhone = arr[1] || ''
					this.formData.boxAddress = arr[2] || ''
				} else {
					// 卸货
					this.formData.unloadContact = arr[0] || ''
					this.formData.unloadContactPhone = arr[1] || ''
					this.formData.unloadAddress = arr[2] || ''
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
#pol-ltl-delivery-info {
	// .el-row {
	// 	padding: 10px 0 0 0;
	// }
	::v-deep .el-form-item {
		margin-bottom: 4px;
	}
	::v-deep .el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	::v-deep .el-form-item__labe {
		padding-right: 4px;
	}
	::v-deep .el-form-item__label,
	::v-deep .el-form-item__content {
		line-height: 20px;
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
