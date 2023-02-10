<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="cargoInfo" ref="form" :rules="rules" :model="formData" label-width="100px">
				<el-row>
					<el-col v-for="(ele, index) in inputItem" :span="ele.span || 6" :key="index">
						<FormItem :item="ele" :form="formData" />
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
				<CargoPop ref="cargoPop" :tableInfo="tableInfo" :cargo="cargo" :tableConfig="tableConfig" @tableClick="tableClick" @changeCargo="changeCargo" @delete="handleDelete"> </CargoPop>
				<!-- <DefaultTableComp ref="defaultTableComp" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick"></DefaultTableComp> -->
			</el-form>
			<div v-if="addressPopShow">
				<AddressPop @close="addressPopClose"></AddressPop>
			</div>
		</BaseDialog>
	</div>
</template>

<script>
import store from '@/store'
import { copyArry } from '@/utils/tools'
import { validateBox, validatePhone } from '@/utils/validate'
import { warehouseOutplanDetail, getWarehouseInplanDetail } from '@/api/order/list'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import CargoPop from './addCarInfoCargo'
import AddressPop from '@/views/order/order/orderList/components/boxAddressPop'
// import DefaultTableComp from '../../../../components/defaultTableComp'
import { handleWarehouseData } from '../../../../js/handleData'
import { getDomesticCity, fclTruckIntrustRegion } from '@/api/base'

var defaultTableList = {
	cname: '',
	mark: '',
	quantity: '',
	weight: '',
	volume: '',
	packageType: ''
}
export default {
	data() {
		return {
			isChina: true,
			dialogConfig: {
				title: '装货信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: Object.assign(
				{
					loadPlace: [],
					boxContact: '',
					boxContactPhone: '',
					boxAddress: '',
					unloadPlace: [],
					unloadContact: '',
					unloadContactPhone: '',
					unloadAddress: ''
				},
				this.warehouseDetailData
			),
			inputItem: [
				{ label: '联系人', key: 'boxContact', prop: 'boxContact', type: 'input', inputType: 'text' },
				{ label: '联系人联系方式', key: 'boxContactPhone', prop: 'boxContactPhone', type: 'input', inputType: 'text' },
				// { label: '装货地点', key: 'boxArea', prop: 'boxArea', type: 'input', inputType: 'text' },
				{
					label: '装货地点',
					key: 'loadPlace',
					prop: 'loadPlace',
					type: 'cascader',
					options: [],
					props: {
						value: 'cname',
						label: 'cname',
						children: 'children'
					},
					change: value => {
						this.handleRevChange(value)
					}
				},
				{
					label: '装货详细地址',
					key: 'boxAddress',
					prop: 'boxAddress',
					type: 'address',
					inputType: 'text',
					maxlength: '512',
					click: () => {
						this.showAddressPop('on')
					}
				},
				{ label: '委托装柜时间', key: 'preBoxTime', prop: 'preBoxTime', type: 'dateLimit', inputType: 'text' },
				{ label: '实际到场时间', key: 'boxTime', type: 'dateLimit', inputType: 'text' },
				{ label: '卸货人', key: 'unloadContact', prop: 'unloadContact', type: 'input', rows: '1', inputType: 'text' },
				{ label: '卸货人联系方式', key: 'unloadContactPhone', prop: 'unloadContactPhone', type: 'input', rows: '1', inputType: 'text' },
				// { label: '卸货地点', key: 'unloadArea', prop: 'unloadArea', type: 'input', rows: '1', inputType: 'text' },
				{
					label: '卸货地点',
					key: 'unloadPlace',
					prop: 'unloadPlace',
					type: 'cascader',
					options: [],
					props: {
						value: 'cname',
						label: 'cname',
						children: 'children'
					},
					change: value => {
						this.handleUnloadChange(value)
					}
				},
				{
					label: '卸货详细地址',
					key: 'unloadAddress',
					prop: 'unloadAddress',
					type: 'address',
					rows: '1',
					inputType: 'text',
					maxlength: '512',
					click: () => {
						this.showAddressPop('un')
					}
				},
				{ label: '司机姓名', key: 'driverName', prop: 'driverName', type: 'input', inputType: 'text' },
				{ label: '司机联系方式', key: 'driverPhone', prop: 'driverPhone', type: 'input', rows: '1', inputType: 'text' },
				{ label: '车牌号', key: 'licensePlate', prop: 'licensePlate', type: 'input', rows: '1', inputType: 'text' }
			],
			rules: Object.assign({
				boxContact: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
				boxContactPhone: [{ required: true, message: '联系人联系方式不能为空', trigger: 'blur' }],
				// boxArea: [{ required: true, message: '装货地点不能为空', trigger: 'blur' }],
				loadPlace: [{ required: true, message: '装货地点不能为空', trigger: 'blur' }],

				boxAddress: [{ required: true, message: '装货详细地址不能为空', trigger: 'blur' }],
				unloadContact: [{ required: true, message: '卸货人不能为空', trigger: 'blur' }],
				unloadContactPhone: [{ required: true, message: '卸货人联系方式不能为空', trigger: 'blur' }],
				// unloadArea: [{ required: true, message: '卸货地点不能为空', trigger: 'blur' }],
				unloadPlace: [{ required: true, message: '卸货地点不能为空', trigger: 'blur' }],

				unloadAddress: [{ required: true, message: '卸货详细地址不能为空', trigger: 'blur' }]
			}),
			tableInfo: {
				title: '进仓货品',
				titleBtnList: [{ label: '添加进仓货品', key: 'add', type: 'primary' }]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: false
				},
				columns: handleWarehouseData.addCarCargoColumn(this.arrCargos(), this.changeCargo), //  表格显示的表头
				list: this.initList(),
				// 操作按钮组
				operationBtns: { show: false },
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 操作按钮组
				operationBtns: {
					width: '150px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						let fn = this['handle' + action]
						if (typeof fn !== 'function') return
						this['handle' + action](row, $index)
					},
					data: [
						{
							label: '删除',
							type: 'text',
							show: true,
							action: 'Delete'
						}
					]
				},
				// 分页
				pagination: {
					show: false,
					total: 0
				}
			},
			warehouseInplanStatus: store.state.dict.dictMap.warehouseInplanStatus, // 进仓状态
			showCnameDialog: false, // 显示品名弹窗
			clickCnameIndex: '', // 点击品名下标
			cargo: this.arrCargos() || [], // 进/出仓计划下拉菜单信息
			isIn: (this.warehouseDetailData && this.warehouseDetailData.warehouseInoutType == 'in') || '', // 派车类型是进仓
			quickInputModel: '',
			addressPopShow: false,
			loadType: 'on'
		}
	},
	props: {
		warehouseDetailData: {
			type: Object,
			default() {
				{
				}
			}
		}
	},

	created() {
		//获取省市区级联框数据
		this.getLoadPlaceData()
		if (this.isBd || !this.isOpTruck) {
			this.tableInfo = {
				title: '进仓货品',
				titleBtnList: [{ label: '添加进仓货品', key: 'add', type: 'primary', disabled: true }]
			}
		}
	},
	mounted() {},
	computed: {},
	components: {
		BaseDialog,
		CargoPop,
		// DefaultTableComp,
		FormItem,
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
		//卸货地点省市区
		handleUnloadChange(val) {
			this.formData.unloadCountry = val[0] || ''
			this.formData.unloadProvince = val[1] || ''
			this.formData.unloadCity = val[2] || ''
			this.formData.unloadDistrict = val[3] || ''
			console.log('🚀 ~ this.unloadPlace', this.formData.unloadPlace)
		},
		//装货地点省市区
		handleRevChange(val) {
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
		//获取省市区数据
		async getLoadPlaceData() {
			// let res = await getDomesticCity({})
			let res = await fclTruckIntrustRegion({})
			//处理最后一级children空数组
			this.inputItem[2].options = this.handleChildren(res.data)
			this.inputItem[8].options = this.inputItem[2].options
			console.log('🚀 ~ this.inputItem[2]', this.inputItem[2])
			this.isChina = this.inputItem[2].options.some(ele => ele.cname === '中国')
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						// let phoneValidateValues = [
						// 	{ prop: 'boxContactPhone', message: '请输入正确的联系人联系方式', value: this.formData.boxContactPhone },
						// 	{ prop: 'unloadContactPhone', message: '请输入正确的卸货人联系方式', value: this.formData.unloadContactPhone }
						// ]
						if (!validateBox(this.tableConfig.list)) return
						// if (!validatePhone(phoneValidateValues)) return
						let data = { ...this.formData, rowId: this.formData.boxContactPhone }
						data.truckDriver = {
							driverId: data.driverId,
							driverName: data.driverName,
							driverPhone: data.driverPhone,
							licensePlate: data.licensePlate
						}
						data.truckCargos = [...this.tableConfig.list]
						delete data.truckCargos_copy
						delete data.truckContainers
						delete data.truckLoadVos
						this.$emit('handleConfirm', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		tableClick(type) {
			// 表格添加行
			if (type == 'add') {
				this.tableConfig.list.push({ ...defaultTableList })
			}
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		handleDelete(row, index) {
			this.tableConfig.list.splice(index, 1)
		},
		// 点击品名
		cnameClick(index) {
			this.clickCnameIndex = index
			this.showCnameDialog = true
		},
		closeCnameDialog() {
			this.showCnameDialog = false
		},
		initList() {
			let list = copyArry(this.warehouseDetailData.truckCargos)
			list.map(item => {
				// item.mark = item.cargoVo && item.cargoVo.mark || item.cargoMark || ''
			})
			return list
		},
		// 货品数据，为下拉选择框加label和value
		arrCargos() {
			console.log(this.warehouseDetailData)
			let truckCargos = this.warehouseDetailData && this.warehouseDetailData.truckCargos_copy
			truckCargos.map(item => {
				item.label = (item.cargoVo && item.cargoVo.cname) || item.cargoName || ''
				item.value = (item.cargoVo && item.cargoVo.cargoId) || item.cargoId || ''
				item.mark = (item.cargoVo && item.cargoVo.mark) || item.cargoMark || ''
			}) || []
			return truckCargos
		},
		// 选择品名回调函数
		changeCargo(value, row, index) {
			Object.assign(this.tableConfig.list[index], {
				...this.cargo.filter(item => {
					if (item.cargoId === value) {
						item.cname = item.label
						return item
					}
				})[0]
			})
		},
		// 设置商品信息id
		// setId(id, list) {
		//   list.map((item, index) => item.rowId = id+index)
		// },
		handleQuickInput(type) {
			if (this.quickInputModel) {
				let arr = this.quickInputModel.split('，')
				if (type === 'box') {
					// 装货
					this.formData['boxContact'] = arr[0] || ''
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

<style lang="scss">
.dialog-layout .row-tit {
	border-bottom: unset !important;
}
#cargoInfo {
	.el-row {
		padding: 0 !important;
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item__content {
		margin-right: 10px;
	}
	.row-tit {
		padding: 0 !important;
	}
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label {
		padding-right: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
}
#deliveryContact {
	display: inline-block;
	.deliveryContact {
		width: 30%;
	}
	span {
		width: 10%;
		padding: 2%;
	}
	.deliveryContactPhone {
		width: 60%;
	}
}
.quick-class {
	display: flex;
	align-items: center;
	.title {
		width: 75px;
	}
}
</style>
