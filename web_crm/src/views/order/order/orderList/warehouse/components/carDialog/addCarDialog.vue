<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="newCar" ref="form" :rules="rules" :model="formData" label-width="100px">
				<el-row>
					<el-col v-for="(ele, index) in inputItem" :span="ele.span || 6" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<div class="mt10">
					<el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
						<template v-if="detailData.warehouseInoutType == 'out'">
							<el-table-column fixed prop="planNo" label="出仓计划编号" align="center" width="150">
								<template slot-scope="scope">
									<div class="column-text">{{scope.row.planNo}}</div>
								</template>
							</el-table-column>
						</template>
						<template v-if="detailData.warehouseInoutType == 'in'">
							<el-table-column fixed prop="planNo" label="进仓计划编号" align="center" width="150">
								<template slot-scope="scope">
									<div class="column-text">{{scope.row.planNo}}</div>
								</template>
							</el-table-column>
						</template>
						<el-table-column v-if="detailData.warehouseInoutType == 'in'" fixed prop="shipperCustName" label="发货单位" align="center">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.shipperCustName}}</div>
							</template>
						</el-table-column>
						<template v-if="detailData.warehouseInoutType == 'out'">
							<el-table-column fixed prop="warehouseName" label="出仓仓库" align="center">
								<template slot-scope="scope">
									<div class="column-text">{{scope.row.warehouseName}}</div>
								</template>
							</el-table-column>
						</template>
						<template v-if="detailData.warehouseInoutType == 'in'">
							<el-table-column fixed prop="warehouseName" label="进仓仓库" align="center">
								<template slot-scope="scope">
									<div class="column-text">{{scope.row.warehouseName}}</div>
								</template>
							</el-table-column>
						</template>
						<el-table-column prop="boxContact" label="联系人" align="center">
							<template slot-scope="scope">
								<div class="column-text">{{scope.row.boxContact}}</div>
							</template>
						</el-table-column>
						<el-table-column prop="boxContactPhone" label="联系人电话" align="center" width="120"> </el-table-column>
						<el-table-column label="装货地点" align="center">
							<template slot-scope="scope">
									<div class="column-text">
										{{ scope.row.boxProvince ? scope.row.boxProvince + scope.row.boxCity + scope.row.boxDistrict : '' }}
									</div>
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
						<el-table-column prop="unloadContactPhone" label="卸货电话" align="center"> </el-table-column>
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
						<el-table-column prop="driverPhone" label="司机电话" align="center"> </el-table-column>
						<el-table-column prop="licensePlate" label="车牌号" align="center"> </el-table-column>
						<el-table-column fixed="right" label="操作" width="120" align="center">
							<template slot-scope="scope">
								<el-button v-if="scope.row.length" @click="handleInfo('add', scope.row, scope.$index)" type="text" size="mini">添加地址</el-button>
								<el-button v-if="scope.row.boxContact" @click="handleInfo('info', scope.row, scope.$index)" type="text" size="mini">详情</el-button>
								<el-button v-if="!scope.row.length" @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
					<table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
				</div>
			</el-form>
		</BaseDialog>
		<div v-if="showDialog">
			<AddCarInfoDialog :warehouseDetailData="AddrDetailData" @close="closeDialog" @handleConfirm="handleConfirm"></AddCarInfoDialog>
		</div>
		<div v-if="showCargoDialog">
			<CargosDialog :cargosList="cargosList" @close="closeDialog" @handleConfirm="closeDialog"></CargosDialog>
		</div>
	</div>
</template>

<script>
import { copyArry, getDictLabel, getDictMap } from '@/utils/tools'
import { handleWarehouseData } from '../../../../js/handleData'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import AddCarInfoDialog from './addCarInfoDialog'
import CargosDialog from './cargosDialog'
import { supplierInfo } from '@/api/crm/supplier'
import tableTooltip from '@/components/Base/Table/table-tooltip'

var defaultFormData = {
	intrustNo: '',
	supplierId: '',
	supplierName: '',
	supplierContact: '',
	supplierContactPhone: '',
	deliveryContact: '',
	intrustStatus: '',
	boxRemark: ''
}
export default {
	data() {
		return {
			tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
			dialogConfig: {
				title: '新增派车计划',
				show: true,
				size: 'medium',
				width: '80%'
			},
			tableData: [],
			formData: Object.assign({}, defaultFormData, this.detailData),
			inputItem: [
				{ label: '委托编号', key: 'intrustNo', prop: 'intrustNo', type: 'input', inputType: 'text', disabled: true },
				{
					label: '车队',
					key: 'supplierId',
					prop: 'supplierId',
					type: 'select',
					filterable: true,
					remote: true,
					options: [],
					visibleChange: (val, item) => {
						if (val) this.supplierNameSearch('', item)
					},
					remoteMethod: (queryString, item) => {
						this.supplierNameSearch(queryString, item)
					},
					change: (val, item) => {
						if (val) {
							let label = item.options.filter(o => o.value === val)[0].label
							this.formData.supplierName = label
							supplierInfo({ supplierId: val }).then(res => {
								let { contact } = res.data
								Object.assign(this.formData, {
								  supplierContact: contact && contact.length ? contact[0].name || contact[0].ename : '',
								  supplierContactPhone: contact && contact.length ? contact[0].mobileNo : ''
								})
								this.restaurants = this.loadAll(contact)
							})
							console.log('this.formData', this.formData)
						}
					}
				},
				{
					label: '车队联系人',
					key: 'supplierContact',
					prop: 'supplierContact',
					type: 'autocomplete',
					inputType: 'text',
					querySearch: (queryString, cb) => {
						let restaurants = this.restaurants
						let results = queryString
							? restaurants.filter(this.createFilter(queryString))
							: restaurants
						cb(results)
					},
					handleSelect: (item) => {
						if (item.value) {
							for (let i = 0; i < this.contactInfo.length; i++) {
								if (item.value === this.contactInfo[i].value) {
									Object.assign(this.formData, {
										supplierContactPhone: this.contactInfo[i].mobileNo,
									})
									return
								}
							}
						}
					},
				},
				// { label: '车队联系人', key: 'supplierContact', prop: 'supplierContact', type: 'input', inputType: 'text' },
				{ label: '车队联系人电话', key: 'supplierContactPhone', prop: 'supplierContactPhone', type: 'input', inputType: 'text' },
				{ label: '派车类型', key: 'warehouseInoutType_cn', prop: 'warehouseInoutType_cn', type: 'input', inputType: 'text', disabled: true },
				{ label: '委托状态', key: 'intrustStatus', prop: 'intrustStatus', type: 'select', options: getDictMap('truckIntrustStatus') },
				{ label: '注意事项', key: 'boxRemark', prop: 'boxRemark', type: 'input', rows: '2', span: 24, inputType: 'textarea', maxlength: '512', showWordLimit: true }
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
			AddrDetailData: {}, // 地址详情
			restaurants: [], // 供应商所有值
			contactInfo: [],
		}
	},
	props: {
		detailData: {
			type: Object,
			default() {
				{
				}
			}
		}
	},
	created() {
		console.log(this.detailData)
		this.arryDetailData()
	},
	mounted() {},
	computed: {},
	components: {
		BaseDialog,
		FormItem,
		AddCarInfoDialog,
		CargosDialog,
		tableTooltip
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
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = Object.assign({}, this.formData),
							truckLoads = [],
							truckLoads_copy = [...this.detailData.truckLoads]
						console.log(this.detailData.truckLoads, this.tableData)
						truckLoads_copy.map(item => {
							item.truckLoadVos.map(o => {
								let planType = this.detailData.warehouseInoutType == 'in' ? 'inPlanNo' : 'outPlanNo'
								let whId = this.detailData.warehouseInoutType == 'in' ? 'inWhId' : 'outWhId'
								let warehouseName = this.detailData.warehouseInoutType == 'in' ? 'inWarehouseName' : 'outWarehouseName'
								item[planType] = item.planNo
								item[whId] = item.whId
								item[warehouseName] = item.warehouseName
								o.truckCargos.map(ele => {
									delete ele.oid
									return Object.assign(ele, ele.cargoVo)
								})
								truckLoads.push(Object.assign(o, item))
							})
						})
						data.truckLoads = truckLoads
						console.log(this.tableData)
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
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 初始化表格数据
		arryDetailData() {
			this.tableData = []
			this.detailData.truckLoads.forEach(item => {
				let data = Object.assign({}, item, { length: item.truckLoadVos.length })
				item.truckLoadVos.forEach((o, index) => {
					o.addrIndex = index + 1
					o.planNo_copy = data.planNo
					if (index == 0) Object.assign(o, data)
					if (!o.boxContact) o.truckCargos = []
					this.tableData.push(o)
				})
				delete data.truckLoadVos
			})
			console.log(this.tableData)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			if (columnIndex < 3) {
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
			let planNo = row.planNo || row.planNo_copy
			this.detailData.truckLoads.map(item => {
				if (item.planNo == planNo) {
					item.truckLoadVos.splice(row.addrIndex - 1, 1)
				}
				this.arryDetailData()
			})
		},
		handleInfo(type, row, index) {
			this.clickAddrIndex = ''
			row.planNo_copy = row.planNo_copy || row.planNo
			this.clickPlanNo = row.planNo_copy
			let truckCargos_copy = this.detailData.truckLoads.filter(item => item.planNo == row.planNo_copy)[0].truckCargos_copy
			// let truckCargos_copy = this.detailData.truckLoads.filter(item => item.planNo == row.planNo_copy)[0].truckCargos_copy
			console.log(truckCargos_copy)
			if (type == 'info') {
				this.clickAddrIndex = row.addrIndex
				row.truckCargos_copy = [...copyArry(truckCargos_copy)]
				row.truckCargos = [...row.truckCargos]
				console.log(row.truckCargos_copy)
			} else {
				row = {
					truckCargos_copy: [...copyArry(truckCargos_copy)],
					truckCargos: [...copyArry(truckCargos_copy)]
				}
				console.log(row.truckCargos_copy)
			}
			this.AddrDetailData = row
			console.log('row', row)
			this.showDialog = true
		},
		handleViewCargos(row) {
			this.cargosList = row.truckCargos
			this.showCargoDialog = true
		},
		handleConfirm(data) {
			console.log('callback', data)
			this.detailData.truckLoads.map(item => {
				if (item.planNo === this.clickPlanNo) {
					// 详情回调
					if (this.clickAddrIndex) {
						item.truckLoadVos.map(o => {
							if (o.addrIndex === this.clickAddrIndex) {
								Object.assign(o, data)
							}
						})
						// 新增回调
					} else {
						if (!item.truckLoadVos[0].boxContact) item.truckLoadVos = []
						item.truckLoadVos.push(data)
					}
				}
			})
			this.arryDetailData()
			console.log('callback_truckLoads', this.detailData.truckLoads)
			this.showDialog = false
		},
		closeDialog() {
			this.showDialog = false
			this.showCargoDialog = false
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
#newCar {
	.el-row {
		padding: 0;
	}
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item__content {
		margin-right: 10px;
	}
	.row-tit {
		padding: 0 20px !important;
	}
	.el-form-item__label{
		padding-right: 4px;
	}
	.el-form-item__label, .el-form-item__content{
		line-height: 20px;
	}
	// .el-table--border td {
	//   border-right: 1px solid #dfe6ec !important;
	// }
}
.truckCargos.el-table th {
	background-color: #fff !important;
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
