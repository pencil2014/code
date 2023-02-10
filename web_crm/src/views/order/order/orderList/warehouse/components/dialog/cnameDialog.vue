<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="cnameDialog" ref="form" :model="formData">
				<el-row>
					<el-col :span="20">
						<el-row>
							<el-col :span="12" style="display: flex;">
								<template v-if="clickType == 'planOut'">
									<el-form-item label="仓库名称" prop="whId">
										<el-select ref="warehouseSelect" v-model="formData.whId" filterable clearable @visible-change="wareHouseSearch" :filter-method="wareHouseSearch" size="mini">
											<el-option v-for="(ele, index) in whOptions" :key="index" :label="ele.label" :value="ele.value"></el-option>
										</el-select>
									</el-form-item>
									<el-form-item label="客户名称" prop="custid">
										<el-select ref="customSelect" v-model="formData.custid" filterable clearable @visible-change="customerSearch" :filter-method="customerSearch" size="mini">
											<el-option v-for="(ele, index) in custOptions" :key="index" :label="ele.label" :value="ele.value"></el-option>
										</el-select>
									</el-form-item>
									<el-form-item label="进仓编码" prop="batchNo">
										<el-input v-model="formData.batchNo" clearable size="mini"></el-input>
									</el-form-item>
								</template>
							</el-col>
							<el-col :span="clickType == 'planOut' ? 4 : 10">
								<el-form-item label="中文品名" prop="cname">
									<el-input v-model="formData.cname" clearable size="mini" maxlength="128"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="clickType == 'planOut' ? 4 : 10">
								<el-form-item label="海关编码" prop="hscode">
									<el-input v-model="formData.hscode" clearable size="mini"></el-input>
								</el-form-item>
							</el-col>
						</el-row>
					</el-col>
					<el-col :span="4" style="text-align: right;">
						<el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
						<el-button size="mini" @click="reset">重置</el-button>
					</el-col>
				</el-row>
				<div class="cname-cont">
					<div class="row-tit">
						<span class="tit">品名信息</span>
					</div>
					<div>
						<el-table :data="tableData" border  align="center" style="width: 100%;">
							<el-table-column align="center" label="" width="100px">
								<template slot-scope="scope">
									<el-radio :disabled="clickType === 'planOut' && !scope.row.realEnterTime"  v-model="selectCargo" :label="scope.row" @change="clickRow"><span></span></el-radio>
								</template>
							</el-table-column>
							<el-table-column v-if="clickType == 'planOut'" prop="batchNo" align="center" label="进仓编码"> </el-table-column>
							<el-table-column v-if="clickType === 'planOut'" prop="realEnterTime" align="center" label="实际进仓时间"></el-table-column>
							<el-table-column prop="cname" align="center" label="中文品名"> </el-table-column>
							<el-table-column prop="ename" align="center" label="英文品名"> </el-table-column>
							<el-table-column prop="type" align="center" label="货物类型"> </el-table-column>
							<el-table-column prop="mark" align="center" label="唛头"> </el-table-column>
							<el-table-column prop="hscode" align="center" label="海关编码"> </el-table-column>
							<template v-if="clickType == 'planOut'">
								<el-table-column prop="lastQuantity" align="center" label="剩余件数"> </el-table-column>
								<!-- <el-table-column
              prop="lastWeight"
              align="center"
              label="剩余毛重">
              </el-table-column>
              <el-table-column
              prop="lastVolume"
              align="center"
              label="剩余体积">
              </el-table-column> -->
							</template>
							<template slot="empty"> 暂无信息<el-button v-if="clickType != 'planOut'" type="text" @click="addCnameFunc">，点击新增品名</el-button> </template>
						</el-table>
						<div style="margin-top: 10px;">
							<Pagination :config="tableConfig" :tableQuery="formData" :callback="tableCallBack" />
						</div>
					</div>
				</div>
			</el-form>
		</BaseDialog>
		<div v-if="showAddCnameDialog">
			<AddCnameDialog @close="closeAddCnameDialog" @handleConfirm="handleConfirm"></AddCnameDialog>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import AddCnameDialog from './addCnameDialog'
import { getCargoList, listStock } from '@/api/order/list'
import { warehouseList } from '@/api/order/warehouse'
import Pagination from "@/components/Base/Table/newPagination"
const defaultPage = {
	pageSize: 10,
	currPage: 1
}

let defaultFormData = {
	totalCount: null,
	ascColumns: [],
	descColumns: [],
	custid: '',
	whId: '',
	batchNo: '',
	cname: '',
	hscode: ''
}
export default {
	data() {
		return {
			tableConfig: {
        // 分页
        pagination: {
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        },
      },
			selectCargo: {}, // 选中列
			dialogConfig: {
				title: '添加品名',
				show: true,
				size: 'medium',
				width: '70%'
			},
			formData: Object.assign({}, defaultFormData, defaultPage, { orderNo: this.clickType == 'planOut' ? this.$route.query.orderNo : '' }),
			tableData: [], // table列表数据
			showAddCnameDialog: false,
			whOptions: [], // 仓库下拉数据
			custOptions: [] // 客户下拉数据
		}
	},
	props: {
		clickType: ''
	},
	activated() {
		console.log('🚀 ~ activated', activated)
		// window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	created() {
		console.log('🚀 ~ created')
		this.getList()
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	destroyed() {
		console.log('🚀 ~ destroyed')
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	computed: {},
	components: {
		BaseDialog,
		FormItem,
		AddCnameDialog,
		Pagination
	},
	methods: {
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
				//触发的事件
				this.handleSearch()
			}
		},
		getList() {
			let getListFun = this.clickType == 'planOut' ? listStock : getCargoList
			getListFun(this.formData).then(res => {
				let data = res.data.list
				if (this.clickType == 'planOut') {
					data.map(item => (item = Object.assign(item, item.cargoVo)))
				}
				this.tableData = [...data]
				this.formData.totalCount = res.data.totalCount
				this.formData.currPage = res.data.currPage

				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
        this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.formData.pageSize = res.data.pageSize
			})
		},
		// 搜索框重置
		reset() {
			this.formData = { ...defaultFormData, ...defaultPage, orderNo: this.clickType == 'planOut' ? this.$route.query.orderNo : '' }
			this.getList()
		},
		// 当一行被点中时
		clickRow(row) {
			this.selectCargo = row
		},
		// 点击新增品名
		addCnameFunc() {
			this.showAddCnameDialog = true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (Object.keys(this.selectCargo).length > 0) {
					this.$emit('handleConfirm', this.selectCargo)
					this.close('Confirm')
				} else {
					this.$message.error('请选择品名！')
				}
			} else {
				this.close('Cancel')
			}
		},
		// 新增货品回调
		handleConfirm(data) {
			this.$emit('handleConfirm', data)
			this.close('confirm')
		},
		closeAddCnameDialog(action) {
			if (action == 'Confirm') this.close('confirm')
			this.showAddCnameDialog = false
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		handleSearch() {
			this.formData.currPage = 1
			// this.formData.whId = this.searchConfig.filter(item => item.key == "whId")[0].value || ''
			// this.formData.deliveryCustid = this.searchConfig.filter(item => item.key == "deliveryCustid")[0].value || ''
			// this.formData.orderNo = this.searchConfig.filter(item => item.key == "orderNo")[0].value || ''
			// this.formData.planNo = this.searchConfig.filter(item => item.key === 'planNo')[0].value || ''
			this.getList()
		},
		// 仓库模糊查询
		wareHouseSearch(queryString) {
			if (!queryString) this.$refs.warehouseSelect.blur()
			let data = {
				currPage: 1,
				pageSize: 50,
				warehouseName: queryString === true ? '' : queryString
			}
			warehouseList(data).then(res => {
				let list = res.data.list
				this.whOptions = list
					.filter(item => item.state === 'valid')
					.map(item => {
						return {
							value: item.whId,
							label: item.warehouseName
						}
					})
			})
		},
		// 客户模糊查询
		customerSearch(val) {
			if (!val) this.$refs.customSelect.blur()
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
		// 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
		// 分页
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
			this.getList()
		},
	}
}
</script>

<style lang="scss">
.dialog-layout .row-tit {
	border-bottom: unset !important;
}
#cnameDialog {
	.el-row {
		padding: 0 !important;
		margin-top: 0 !important;
	}
	.el-form-item {
		display: flex;
		margin-bottom: 4px;
		.el-form-item__content {
			margin-right: 10px;
			display: inline-block;
			flex: 1;
		}
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.cname-cont .row-tit {
		height: 32px;
		line-height: 32px;
		padding: 0 !important;
		.tit{
			line-height: 32px;
		}
	}
	.el-table td {
		padding: 7px 0;
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
