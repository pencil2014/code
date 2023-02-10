<template>
	<div id="carInfoDetail">
		<div :class="['row-tit', { isFixed: saveBarFixed }]" :style="styleObject" id="saveBar">
			<span class="tit">运输管理详情</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="isBd || !isOpTruck || isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="row-body">
			<el-form id="newCar" ref="form" :rules="rules" :model="formData" label-width="100px">
				<el-row class="mt10">
					<el-col v-for="(ele, index) in inputItem" :span="ele.span || 6" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<!-- <div class="row-tit">
					<span class="tit">货物信息</span>
				</div> -->
				<div class="mt10 car-table">
					<el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
						<template v-if="detailData.warehouseInoutType == 'out'">
							<el-table-column fixed prop="outPlanNo" label="出仓计划编号" align="center" width="150"> </el-table-column>
						</template>
						<template v-if="detailData.warehouseInoutType == 'in'">
							<el-table-column fixed prop="inPlanNo" label="进仓计划编号" align="center" width="150"> </el-table-column>
						</template>
						<el-table-column v-if="detailData.warehouseInoutType == 'in'" fixed prop="shipperCustName" label="发货单位" align="center">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.shipperCustName}}</div>
							</template>
						</el-table-column>
						<template v-if="detailData.warehouseInoutType == 'out'">
							<el-table-column fixed prop="outWarehouseName" label="出仓仓库" align="center"> </el-table-column>
						</template>
						<template v-if="detailData.warehouseInoutType == 'in'">
							<el-table-column fixed prop="inWarehouseName" label="进仓仓库" align="center"> </el-table-column>
						</template>
						<el-table-column prop="boxContact" label="联系人" align="center"> </el-table-column>
						<el-table-column prop="boxContactPhone" label="联系人电话" align="center" width="120">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.boxContactPhone}}</div>
							</template>
						</el-table-column>
						<el-table-column label="装货地点" width="150" align="center">
							<!-- <template slot-scope="scope">
								{{ scope.row.boxProvince + scope.row.boxCity + scope.row.boxDistrict }}
							</template> -->
							<template slot-scope="scope">
								<div v-if="scope.row.boxCountry === '中国'" class="column-text">{{ scope.row.boxCountry + scope.row.boxProvince + scope.row.boxCity + scope.row.boxDistrict }}</div>
								<div v-else class="column-text">{{ scope.row.boxCountry + scope.row.boxProvince }}</div>
							</template>
						</el-table-column>
						<el-table-column prop="boxAddress" label="装货详细地址" align="center" width="120">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.boxAddress}}</div>
							</template>
						</el-table-column>
						<el-table-column prop="preBoxTime" label="委托装柜时间" align="center" width="120"> </el-table-column>
						<el-table-column prop="boxTime" label="实际到场时间" align="center" width="120"> </el-table-column>
						<el-table-column prop="unloadContact" label="卸货人" align="center"> </el-table-column>
						<el-table-column prop="unloadContactPhone" label="卸货电话" align="center">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.unloadContactPhone}}</div>
							</template>
						</el-table-column>
						<el-table-column prop="unloadAddress" label="卸货详细地址" align="center" width="120">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.unloadAddress}}</div>
							</template>
						</el-table-column>
						<el-table-column prop="" label="货品信息" align="center" width="120">
							<template slot-scope="scope">
								<el-button v-if="scope.row.boxContact" @click="handleViewCargos(scope.row)" type="text" size="mini">查看</el-button>
							</template>
						</el-table-column>
						<el-table-column prop="driverName" label="司机姓名" align="center"> </el-table-column>
						<el-table-column prop="driverPhone" label="司机电话" align="center">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.driverPhone}}</div>
							</template>
						</el-table-column>
						<el-table-column prop="licensePlate" label="车牌号" align="center"> </el-table-column>
						<el-table-column fixed="right" label="操作" width="120" align="center">
							<template slot-scope="scope">
								<el-button v-if="scope.row.length" @click="handleInfo('add', scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || !isOpTruck || isDisabledEdit">添加地址</el-button>
								<el-button v-if="scope.row.boxContact" @click="handleInfo('info', scope.row, scope.$index)" type="text" size="mini">详情</el-button>
								<el-button v-if="!scope.row.length" @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd || !isOpTruck || isDisabledEdit">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
					<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
				</div>
			</el-form>
		</div>
		<div v-if="showDialog">
			<AddCarInfoDialog :warehouseDetailData="AddrDetailData" @close="closeDialog" @handleConfirm="handleConfirm"></AddCarInfoDialog>
		</div>
		<div v-if="showCargoDialog">
			<CargosDialog :cargosList="cargosList" @close="closeDialog" @handleConfirm="closeDialog"></CargosDialog>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { copyArry, getDictLabel, getDictMap } from '@/utils/tools'
import { getWarehouseInplanDetail, warehouseOutplanDetail } from '@/api/order/list'
import { handleWarehouseData } from '../../../../js/handleData'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import AddCarInfoDialog from './addCarInfoDialog'
import CargosDialog from './cargosDialog'

var defaultFormData = {
	planNo: '',
	positionNo: '',
	warehouseName: '',
	deliveryCustName: '',
	deliveryContact: '',
	inRemark: ''
}
export default {
	data() {
		return {
			tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
			oQuery: this.$route.query,
			dialogConfig: {
				title: '派车计划详情',
				show: true,
				size: 'medium',
				width: '80%'
			},
			tableData: [],
			formData: Object.assign({}, defaultFormData, this.detailData, { warehouseInoutType_cn: getDictLabel('warehouseInoutType', this.detailData.warehouseInoutType) }),
			inputItem: [
				{ label: '委托编号', key: 'intrustNo', prop: 'intrustNo', type: 'input', inputType: 'text', disabled: true },
				{
					label: '车队',
					key: 'supplierId',
					prop: 'supplierId',
					type: 'select',
					filterable: true,
					remote: true,
					options: [{ label: this.detailData.supplierName, value: this.detailData.supplierId }],
					visibleChange: (val, item) => {
						if (val) this.supplierNameSearch('', item)
					},
					remoteMethod: (queryString, item) => {
						this.supplierNameSearch(queryString, item)
					},
					change: (val, item) => {
						let label = item.options.filter(o => o.value === val)[0].label
						this.formData.supplierName = label
					}
				},
				{ label: '车队联系人', key: 'supplierContact', prop: 'supplierContact', type: 'input', inputType: 'text' },
				{ label: '车队联系人电话', key: 'supplierContactPhone', prop: 'supplierContactPhone', type: 'input', inputType: 'text' },
				{ label: '派车类型', key: 'warehouseInoutType_cn', prop: 'warehouseInoutType_cn', type: 'input', disabled: true },
				{ label: '委托状态', key: 'intrustStatus', prop: 'intrustStatus', type: 'select', options: getDictMap('truckIntrustStatus') },
				{ label: '注意事项', key: 'boxRemark', prop: 'boxRemark', type: 'input', rows: '2', inputType: 'textarea', span: 24, maxlength: '512', showWordLimit: true }
			],
			rules: {
				intrustNo: [{ required: true, message: '委托编号不能为空', trigger: 'blur' }],
				supplierId: [{ required: true, message: '车队不能为空', trigger: 'blur' }],
				supplierContact: [{ required: true, message: '车队联系人不能为空', trigger: 'blur' }],
				supplierContactPhone: [{ required: true, message: '车队联系人电话不能为空', trigger: 'blur' }],
				intrustStatus: [{ required: true, message: '派车类型不能为空', trigger: 'blur' }]
			},
			warehouseInplanStatus: this.$store.state.dict.dictMap.warehouseInplanStatus, // 进仓状态
			showDialog: false, // 显示品名弹窗
			showCargoDialog: false, // 显示商品信息弹窗
			cargosList: [], // 商品信息表格数据
			clickAddrIndex: '', // 点击地址下标
			warehouseDetailData: this.detailData, // 进仓计划中添加的货品信息
			carItem: {}, // 装货信息
			AddrDetailData: {} // 地址详情
		}
	},
	props: {
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		detailData: {
			type: Object,
			default() {
				{
				}
			}
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	created() {
		console.log(this.detailData)
		this.arryDetailData()
		// 散货拼箱散车服务项
		if (this.$route.name === 'PolLtl') {
			this.inputItem = [
				{ label: '委托编号', key: 'intrustNo', prop: 'intrustNo', type: 'input', inputType: 'text', disabled: true },
				{
					label: '车队',
					key: 'supplierId',
					prop: 'supplierId',
					type: 'select',
					filterable: true,
					remote: true,
					options: [{ label: this.detailData.supplierName, value: this.detailData.supplierId }],
					visibleChange: (val, item) => {
						if (val) this.supplierNameSearch('', item)
					},
					filterMethod: (queryString, item) => {
						this.supplierNameSearch(queryString, item)
					},
					change: (val, item) => {
						let label = item.options.filter(o => o.value === val)[0].label
						this.formData.supplierName = label
					}
				},
				{ label: '车队联系人', key: 'supplierContact', prop: 'supplierContact', type: 'input', inputType: 'text' },
				{ label: '车队联系人电话', key: 'supplierContactPhone', prop: 'supplierContactPhone', type: 'input', inputType: 'text' },
				{ label: '派车类型', key: 'dispatchType', prop: 'dispatchType', type: 'select', options: this.polLtlDispatchType },
				{ label: '注意事项', key: 'boxRemark', prop: 'boxRemark', type: 'input', rows: '1', inputType: 'textarea', maxlength: '512' }
			]
		}
	},
	mounted() {},
	watch: {
		detailData: {
			handler(newVal) {
				this.arryDetailData()
			},
			deep: true,
			immediate: true
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			polLtlDispatchType: state => state.orderService.polLtlDispatchType,
			serviceInfoList: state => state.order.serviceInfoList,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isBd() {
			return !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'doc' || this.ordDetRole === 'ac' || this.isJoint || this.isFinish
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pol_warehouse')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' ? true : false
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === 'pol_warehouse')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
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
		BaseDialog,
		FormItem,
		AddCarInfoDialog,
		CargosDialog
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
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 初始化表格数据
		arryDetailData() {
			this.tableData = []
			if (!this.detailData.truckLoads.length) {
				this.tableData = [{ boxProvince: '', boxCity: '', boxDistrict: '', length: 1 }]
			}
			this.detailData.truckLoads.forEach(item => {
				let data = Object.assign({}, item, { length: item.truckLoadVos.length })
				delete data.truckLoadVos
				item.truckLoadVos.forEach((o, index) => {
					o.addrIndex = index + 1
					o.planNo_copy = this.detailData.warehouseInoutType == 'in' ? data.inPlanNo : data.outPlanNo
					let tempData = Object.assign({}, o)
					if (index == 0) Object.assign(tempData, data)
					if (!o.boxContact) o.truckCargos = []
					this.tableData.push(tempData)
				})
			})
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			let num = this.detailData.warehouseInoutType == 'in' ? 3 : 2
			if (columnIndex < num) {
				if (row.length) {
					return {
						rowspan: row.length,
						colspan: 1
					}
				} else {
					return {
						rowspan: 0,
						colspan: 0
					}
				}
			}
		},
		handleDelete(row, index) {
			this.detailData.truckLoads.map(item => {
				let planNo = this.detailData.warehouseInoutType == 'in' ? 'inPlanNo' : 'outPlanNo'
				if (item[planNo] == row.planNo_copy) {
					console.log(item.truckLoadVos)
					item.truckLoadVos.splice(row.addrIndex - 1, 1)
				}
				this.arryDetailData()
			})
		},
		handleInfo(type, row, index) {
			console.log('🚀 ~ row', row)
			this.clickAddrIndex = ''
			this.clickPlanNo = row.planNo_copy
			let func = this.detailData.warehouseInoutType == 'in' ? getWarehouseInplanDetail : warehouseOutplanDetail
			func({ planNo: row.planNo_copy, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				let truckCargos_copy = this.detailData.warehouseInoutType == 'in' ? res.data.warehouseInplanItems : res.data.warehouseOutplanItems
				truckCargos_copy.map(ele => {
					return Object.assign(ele, {
						mark: ele.cargoVo.mark,
						cname: ele.cargoVo.cname
					})
				})
				if (type == 'info') {
					//点击详情反显装货卸货地点
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

					row.loadPlace = loadPlace
					row.unloadPlace = unloadPlace
					this.clickAddrIndex = row.addrIndex
					row.truckCargos_copy = [...copyArry(truckCargos_copy)]
					// row.truckCargos = [...copyArry(truckCargos_copy)]
					console.log(row.truckCargos, truckCargos_copy)

					row.truckCargos.forEach(item => {
						let sItem = truckCargos_copy.find(ele => (ele.cargoId = item.cargoId))
						if (sItem) item.cargoVo = sItem.cargoVo
					})
					this.AddrDetailData = row
					console.log('🚀 ~ this.AddrDetailData', this.AddrDetailData)
				} else {
					let planNo = this.detailData.warehouseInoutType == 'in' ? 'inPlanNo' : 'outPlanNo'
					let addValues = {
						truckCargos_copy: [...copyArry(truckCargos_copy)],
						truckCargos: [...copyArry(truckCargos_copy)]
					}
					this.AddrDetailData = addValues
				}
				console.log(this.AddrDetailData)
				this.showDialog = true
			})
		},
		handleConfirm(data) {
			console.log(data)
			let planNo = this.detailData.warehouseInoutType == 'in' ? 'inPlanNo' : 'outPlanNo'
			this.detailData.truckLoads.map(item => {
				if (item[planNo] === this.clickPlanNo) {
					// 详情回调
					if (this.clickAddrIndex) {
						item.truckLoadVos.map(o => {
							if (o.addrIndex === this.clickAddrIndex) {
								return Object.assign(o, data)
							}
						})
						// 新增回调
					} else {
						if (!item.truckLoadVos[0].boxContact) item.truckLoadVos = []
						item.truckLoadVos.push(data)
					}
				}
			})
			console.log(this.detailData.truckLoads)
			this.arryDetailData()

			this.showDialog = false
		},
		handleViewCargos(row) {
			this.cargosList = row.truckCargos
			this.showCargoDialog = true
		},
		closeDialog() {
			this.showDialog = false
			this.showCargoDialog = false
		},
		// 详情取消保存回调
		callBack(data) {
			if (data.type == 'save') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData },
							truckLoads = [],
							truckLoads_copy = [...this.detailData.truckLoads]
						console.log(this.detailData.truckLoads)
						truckLoads_copy.map(item => {
							item.truckLoadVos.map(o => {
								// let planType = this.detailData.warehouseInoutType=='in'?'inPlanNo':'outPlanNo'
								// let whId = this.detailData.warehouseInoutType=='in'?'inWhId':'outWhId'
								// let warehouseName = this.detailData.warehouseInoutType=='in'?'inWarehouseName':'outWarehouseName'
								// item[planType] = item.planNo
								// item[whId] = item.whId
								// item[warehouseName] = item.warehouseName
								truckLoads.push(Object.assign(o, item))
							})
						})
						data.truckLoads = truckLoads
						data.oid = this.detailData.oid
						console.log(data)
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
		// 客户模糊查询
		supplierNameSearch(queryString, item) {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'truck', queryString: queryString }).then(data => {
				item.options =
					(data.list &&
						data.list.map(ele => {
							return Object.assign(ele, {
								label: this.$language == 'en' ? ele.ename : ele.name,
								value: ele.supplierId ? Number(ele.supplierId) : ''
							})
						})) ||
					[]
			})
		}
	}
}
</script>

<style lang="scss">
.dialog-layout .row-tit {
	border-bottom: unset !important;
}
#carInfoDetail {
	border-top: 12px solid #f5f7f9;
	.el-row,
	.car-table {
		padding: 0 20px;
	}
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item__label {
		padding-right: 4px;
		line-height: 20px;
	}
	.el-form-item__content {
		margin-right: 10px;
		line-height: 20px;
	}
	.row-tit {
		height: 36px;
		padding: 0 20px !important;
		border-bottom: 1px solid #dfe4ed;
		.tit {
			line-height: 36px;
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
	#newCar .row-tit,
	#cargoInfo .row-tit {
		padding: 0 !important;
	}
	#newCar .row-table,
	#cargoInfo .row-table {
		padding: 0;
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
</style>
