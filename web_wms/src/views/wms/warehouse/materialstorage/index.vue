<template>
	<div>
		<div v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
			<el-tabs v-model="activeName" class="fin-el-tabs">
        <el-tab-pane label="仓库辅材" name="material"></el-tab-pane>
        <el-tab-pane label="客户自带辅材" name="custMaterial"></el-tab-pane>
      </el-tabs>
      <div>
        <FinanceSearch ref="searchComp" :searchOption="searchOption" @search="search" />
        <div class="finance-search-list-gap"></div>
        <div class="finance-list-container">
          <div class="money-box">
            <div class="money-box-left">
              <template  v-if="activeName === 'material'">
                <el-button size="mini" type="primary" @click="handleAddPurchase">新增采购辅材</el-button>
                <el-button size="mini" type="primary" @click="handleAddDamage">新增损坏辅材</el-button>
                <el-button size="mini" type="warning" @click="handleUpdateAlert">修改库存预警值</el-button>
              </template>
            </div>
            <div class="money-box-right">
              <el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
            </div>
          </div>
          <FinanceTable :option="tableOption" @getData="getData" @send-multi="sendMulti" />
        </div>
      </div>
		</div>
		<!-- 辅材维护 -->
		<purchase-dialog v-if="purchseOptions.show" :options="purchseOptions" @getData="getData"></purchase-dialog>
		<!-- 辅材损坏 -->
		<damage-dialog v-if="damageOptions.show" :options="damageOptions" @getData="getData"></damage-dialog>
		<!-- 修改预警值 -->
		<CrmDialog v-if="alertDialog.show" :option="alertDialog" @close="confirmAlert"></CrmDialog>
		<!-- 库存量、损坏量 -->
		<quantity-dialog v-if="quantityOptions.show" :options="quantityOptions"></quantity-dialog>
	</div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { materialTableData, custMaterialTableData } from '@/views/wms/warehouse/data/materialstorage.js'
import { mixin } from '@/views/finance/mixins/mixin'
import purchaseDialog from './purchaseDialog'
import damageDialog from './damageDialog'
import quantityDialog from './quantityDialog'
import { getMaterialstorageList, updateInventoryAlert, queryCustSelfList } from '@/api/wms/warehouse.js'
import CrmDialog from '@/components/dialog/formDialog.vue'
export default {
	name: 'materialstorage',
	components: {
		FinanceTable,
		FinanceSearch,
		purchaseDialog,
		damageDialog,
		CrmDialog,
		quantityDialog
	},
	mixins: [mixin],
	data() {
		return {
			loading: false,
			searchOption: {}, //查询参数
			tableOption: {}, //表格参数
			dataList: [], //列表数据
			purchseOptions: {
				show: false,
				type: '',
				title: '',
				id: '',
				data: {}
			},
			damageOptions: {
				show: false,
				type: '',
				title: '',
				id: '',
				data: {}
			},
			selfColumnsBase: [],
			multipleSelection: [],
			alertDialog: {
				show: false,
				showClear: true,
				btnLoading: false,
				title: '修改库存预警值',
				text: '确定',
				formItems: [
					{
						type: 'number',
						prop: 'inventoryAlert',
						label: '预警值',
						maxlength: 10,
						rules: [{ required: true, message: '修改库存预警值必填', trigger: 'blur' }]
					}
				],
				form: { inventoryAlert: '' }
			},
			quantityOptions: {
				show: false,
				type: '',
				title: '',
				data: {}
			},
      activeName: ''
		}
	},
	created() {
		this.activeName = 'material'
	},
	mounted() {},
  watch: {
    activeName (val) {
      // 设置查询配置参数
		  this.setSearchOption(val)
      // 设置表格配置参数
		  this.setTableOption(val)
      // 获取列表
      this.getData()
    }
  },
	methods: {
		/**
		 * @description: 设置查询参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 11:39:15
		 */
		setSearchOption(type) {
      let searchProps = []
      let searchData = []
      if (type === 'material') {
        searchProps = ['warehouseName', 'consumableName', 'inventoryAlert']
			  searchData = materialTableData.filter(item => searchProps.includes(item.prop))
      } else {
        searchProps = ['warehouseName', 'consumableName', 'orderCustName']
			  searchData = custMaterialTableData.filter(item => searchProps.includes(item.prop))
      }
			let searchObj = {}
			searchData.forEach(v => {
				searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
			})
			let searchInputGroup = []
			let defaultSearchLength = 3
			let searchPropsNew = searchProps.slice(0, defaultSearchLength)
			searchPropsNew.forEach(item => {
				searchInputGroup.push({
					key: item,
					value: ''
				})
			})
			this.searchOption = {
				addFilter: {
					defaultSearchLength,
					searchInputGroup,
					filterGroups: { ...searchObj },
					callback: true
				}
			}
		},
		/**
		 * @description: 设置表格参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 17:14:47
		 */
		setTableOption(type) {
      if (type === 'material') {
        this.selfColumnsBase = materialTableData.map(item => {
          let target = { ...item }
          if (target.callback) {
            if (target.prop === 'fileName') {
              target.callback = row => this.showPic(row)
            } else if (target.prop === 'inventoryQuantity') {
              target.callback = row => this.showQuantity(row, 'inventory')
            } else if (target.prop === 'damageQuantity') {
              target.callback = row => this.showQuantity(row, 'damage')
            }
          }
          return target
        })
      } else {
        this.selfColumnsBase = custMaterialTableData.map(item => {
          let target = { ...item }
          if (target.callback) {
            if (target.prop === 'inventoryQuantity') {
              target.callback = row => this.showQuantity(row, 'custInventory')
            }
          }
          return target
        })
      }
			// 分页配置
			let pagination = { ...this.option.pagination, show: true, pageSize: 20, isNew: true }
			// 整合列表配置参数
			this.tableOption = {
				...this.option,
				id: 'tableOption',
				operationBtns: {
					show: false
				},
        index: {
          show: true
        },
				pagination,
				sortable: false,
				columns: [...this.selfColumnsBase],
				data: []
			}
		},
		/**
		 * @description: 获取列表数据
		 * @param {*} query 查询参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 14:25:58
		 */
		getData(query) {
			let data = {
				currPage: this.tableOption.pagination.currPage,
				pageSize: this.tableOption.pagination.pageSize,
				query
			}
      let method = ''
      if (this.activeName === 'material') {
        method = getMaterialstorageList
      } else {
        method = queryCustSelfList
      }
			this.loading = true
			method(data)
				.then(({ code, data }) => {
					if (code === 0) {
						this.tableOption.pagination.hasNextPage = data.hasNextPage
						this.tableOption.pagination.hasPreviousPage = data.hasPreviousPage
						this.tableOption.pagination.isFirstPage = data.isFirstPage
						this.tableOption.pagination.isLastPage = data.isLastPage
						this.tableOption.data = data.list || []
						if (this.tableOption.data.length) {
							this.tableOption.data.forEach(item => {
								this.selfColumnsBase.forEach(ele => {
									if (ele.prop === 'fileName' && item.fileName) {
										ele.formatter = ({ row }) => {
											if (row.fileName) {
												return '查看'
											}
										}
									}
								})
							})
						}
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		// 分页页面数量change   有分页必写此方法
		handleSizeChange(val) {
			let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.pageSize = val
			this.getData(query)
		},
		// 分页改变当前页   有分页必写此方法
		handleCurrentChange(val, event) {
			let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.currPage = val
			this.getData(query)
		},
		// 搜索按钮
		search(query) {
			this.tableOption.pagination.currPage = 1
			this.getData(query)
		},
		/**
		 * @description: 获取列表复选框选中的数据
		 * @param {*} data
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:48:40
		 */
		sendMulti(data) {
			this.multipleSelection = data
		},
		/**
		 * @description: 新增采购辅材
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 14:27:03
		 */
		handleAddPurchase() {
			this.purchseOptions.show = true
		},
		/**
		 * @description: 新增损坏辅材
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 19:30:37
		 */
		handleAddDamage() {
      if (!this.multipleSelection.length) {
				this.$message.error('请选择要新增的数据！')
			} else {
        if (this.multipleSelection.length > 1) {
          return this.$message.error('请选择只能选择一条的数据！')
        } else {
          this.damageOptions.show = true
          this.damageOptions.data = this.multipleSelection[0]
        }
      }
		},
		/**
		 * @description: 修改库存预警值
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 19:30:56
		 */
		handleUpdateAlert() {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要修改的数据！')
			} else {
				// 如果选择一条 带出默认值 否则 清空
				if (this.multipleSelection.length === 1) {
					this.alertDialog.form.inventoryAlert = this.multipleSelection[0].inventoryAlert
				} else {
					this.alertDialog.form.inventoryAlert = ''
				}
				this.alertDialog.show = true
			}
		},
		/**
		 * @description: 确定修改库存预警值
		 * @param {*} tag
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 19:31:25
		 */
		confirmAlert(tag) {
			if (!tag) {
				return this.closeAlert()
			}
			let ids = []
			this.multipleSelection.forEach(item => {
				ids.push(item.wmsConsumableInventoryId)
			})
			let data = {
				wmsConsumableInventoryIdList: ids,
				...this.alertDialog.form
			}
			this.alertDialog.btnLoading = true
			// 校验预警值为负数
			if (data.inventoryAlert < 0) {
				this.alertDialog.btnLoading = false
				return this.$message.error('预警值不能为负数')
			}
			// 校验预警值最大值
			if (data.inventoryAlert > 999999) {
				this.alertDialog.btnLoading = false
				return this.$message.error('预警值最大不能超过999999')
			}
			// 校验预警值数字
			if (!/^\d*$/.test(data.inventoryAlert)) {
				this.alertDialog.btnLoading = false
				return this.$message.error('预警值只能填写整数')
			}
			updateInventoryAlert(data)
				.then(() => {
					this.alertDialog.btnLoading = false
					this.$msgSucClose('修改成功！')
					this.handleCurrentChange(1)
					this.closeAlert()
				})
				.catch(() => {
					this.alertDialog.btnLoading = false
				})
		},
		/**
		 * @description: 关闭修改库存预警值弹框
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 19:31:35
		 */
		closeAlert() {
			this.alertDialog.show = false
		},
		/**
		 * @description: 查看图片
		 * @param {*} row
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 11:48:16
		 */
		showPic(row) {
			if (row.fileNo) {
				window.open(`/base/fileView/preview/${row.fileNo}/sowoll`)
			} else {
				this.$message.error('该图片信息缺失，不能查看！')
			}
		},
		/**
		 * @description: 显示库存量/损坏量信息
		 * @param {*} type
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-24 19:34:29
		 */
		showQuantity(row, type) {
			this.quantityOptions.show = true
			this.quantityOptions.type = type
			this.quantityOptions.data = row
			this.quantityOptions.title = type === 'inventory' ? '仓库辅材库存量' : type === 'custInventory' ? '客户自带辅材库存量' : '损坏量'
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
// /deep/ .el-tabs__item {
//   padding: 0 0 0 20px !important;
//   height: 34px;
// }
// /deep/ .el-tabs__header {
//   margin: 0 !important;
//   background: #fff;
// }
</style>
