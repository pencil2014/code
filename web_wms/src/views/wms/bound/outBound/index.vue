<template>
	<div v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch ref="searchComp" :searchOption="searchOption" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button size="mini" type="primary" @click="handleAdd">新增</el-button>
						<el-button size="mini" type="primary" @click="handleFee">费用</el-button>
						<el-button size="mini" type="primary" @click="handleDispatch">派工</el-button>
						<el-button size="mini" type="danger" @click="removeDispatch">删除派工</el-button>
						<el-button size="mini" type="primary" @click="handleUsed">辅材使用</el-button>
						<el-button size="mini" @click="handlePrint('outbound')">打印出库单</el-button>
						<el-button size="mini" @click="handlePrint('check')">打印出库检查单</el-button>
					</div>
					<div class="money-box-right">
						<el-button size="mini" type="primary" @click="handleConfirm('confirm')">确认出库</el-button>
						<el-button size="mini" type="danger" @click="handleConfirm('cancel')">撤销确认出库</el-button>
						<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
					</div>
				</div>
				<FinanceTable :option="tableOption" @send-multi="sendMulti" @getData="getData" />
			</div>
		</div>
		<!-- 入库详情弹框 -->
		<detail-dialog v-if="detailOptions.show" :options="detailOptions" @getData="getData"></detail-dialog>
		<!-- 新增派工弹框 -->
		<dispatch-dialog v-if="dispatchOptions.show" :options="dispatchOptions" @getData="getData"></dispatch-dialog>
		<!-- 耗材使用 -->
		<material-dialog v-if="materialOptions.show" :options="materialOptions" @getData="getData"></material-dialog>
		<!-- 费用 -->
		<fee-dialog v-if="feeOptions.show" :options="feeOptions" @getData="getData"></fee-dialog>
		<!-- 上传装货照片 -->
		<upload-dialog v-if="uploadOptions.show" :options="uploadOptions" :getData="getData"></upload-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
	</div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { tableData } from '@/views/wms/bound/data/outBound.js'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import detailDialog from './detailDialog'
import dispatchDialog from './dispatchDialog'
import materialDialog from './materialDialog.vue'
import feeDialog from './feeDialog.vue'
import { queryPageList, operateOutBound, deleteOutBound } from '@/api/wms/outBound.js'
import { removeWorkTeam } from '@/api/wms/inBound.js'
import uploadDialog from './uploadDialog'
import CustomColumns from '@/components/customColumns/index'
export default {
	name: 'outBoundList',
	components: {
		FinanceTable,
		FinanceSearch,
		detailDialog,
		dispatchDialog,
		materialDialog,
		feeDialog,
		uploadDialog,
    CustomColumns
	},
	mixins: [mixin, mixin2],
	data() {
		return {
			loading: false,
			searchOption: {}, //查询参数
			tableOption: {}, //表格参数
			dataList: [], //列表数据
			multipleSelection: [], //复选框选中数据
			detailOptions: {
				show: false,
				type: '',
				title: '',
				id: '',
				activeName: 'baseInfo'
			},
			dispatchOptions: {
				show: false,
				type: '',
				title: '',
				data: {}
			},
			materialOptions: {
				show: false,
				data: {}
			},
			feeOptions: {
				show: false,
				data: {}
			},
			uploadOptions: {
				show: false,
				id: ''
			},
      selfColumnsBase: tableData
		}
	},
	activated() {
		// 从客户库存列表跳转过来 查看详情
		if (this.$route.query.outboundOrderId) {
			this.showDialog('detail', { outboundOrderId: this.$route.query.outboundOrderId })
		}
	},
	created() {
		// 设置查询配置参数
		this.setSearchOption()
		// 设置表格配置参数
		this.setTableOption()
	},
	activated() {
		// 获取列表数据
		this.refreshListPage()
	},
	methods: {
		/**
		 * @description: 设置查询参数
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 11:39:15
		 */
		setSearchOption() {
			// 在outBoundData中筛选出需要查询的字段
			let searchProps = ['warehouseId',  'custId', 'inboundNo', 'outboundNo', 'lsWorkOrderNo', 'goodsName', 'outboundTime', 'outboundStatus',  'orderPush', 'containerNo', 'createdBy',  'shippingBookNo', 'consumableStatus']
			let searchData = tableData.filter(item => searchProps.includes(item.prop))
			let searchObj = {}
			searchData.forEach(v => {
				searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
			})
			let searchInputGroup = []
			// 默认显示前7条
			let defaultSearchLength = 9
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
		setTableOption() {
			// 分页配置
			let pagination = { ...this.option.pagination, show: true, pageSize: 20, isNew: true }
			// 操作按钮配置
			let operationBtns = {
				...this.option.operationBtns,
				width: '160px',
				data: [
					{
						label: '详情',
						type: 'text',
						show: true,
						action: 'Detail'
					},
					{
						label: '上传装货照片',
						action: 'Upload',
						showFn: row => {
							return ['yes'].includes(row.hasDischargePicture) && ['created'].includes(row.outboundStatus)
						}
					},
					// {
					// 	label: '修改',
					// 	action: 'Edit',
					// 	style: 'color: orange',
					// 	showFn: row => {
					// 		return ['created', 'process'].includes(row.outboundStatus)
					// 	}
					// },
					{
						label: '删除',
						action: 'Delete',
						showFn: row => {
							return ['created', 'process'].includes(row.outboundStatus)
						}
					}
				]
			}
			// 整合列表配置参数
			this.tableOption = {
				...this.option,
				id: 'tableOption',
				pagination,
				sortable: false,
				selection: {
					show: true,
					fixed: 'left'
				},
        index: {
          show: true
        },
				columns: [...tableData],
				operationBtns,
				data: [],
        customColumns: {
          show: true,
          handleCustomColumns: this.handleCustomColumns
        }
			}
		},
		/**
		 * @description: 获取复选框选中的数据
		 * @param {*} data
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 17:56:25
		 */
		sendMulti(data) {
			this.multipleSelection = data
		},
		/**
		 * @description: 获取列表数据
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-16 17:56:49
		 */
		getData(isSearch) {
			let data = {
				currPage: this.tableOption.pagination.currPage,
				pageSize: this.tableOption.pagination.pageSize,
				query: []
			}
      this.finCommonSearch(data.query, this.searchOption, true)
      if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
      data.columns = this.customColumnsKeys
			this.loading = true
			queryPageList(data)
				.then(({ code, data }) => {
					if (code === 0) {
            let { configColumns } = data
            this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map(item => item.prop)
            this.tableOption.columns = this.columns.map(prop => {
              let obj = this.selfColumnsBase.find(item => item.prop === prop)
              if (obj) {
                return obj
              } else {
                return {}
              }
            })
            this.tableOption.pagination.hasNextPage = data.hasNextPage
            this.tableOption.pagination.hasPreviousPage = data.hasPreviousPage
            this.tableOption.pagination.isFirstPage = data.isFirstPage
            this.tableOption.pagination.isLastPage = data.isLastPage
						this.tableOption.data = data.list || []
						if (this.tableOption.data.length) {
							this.tableOption.data.forEach(item => {
								tableData.forEach(ele => {
									if (ele.prop === 'hasDischargePicture') {
										ele.callback = row => {
											if (row.hasDischargePicture === 'yes') {
												this.showDialog('detail', row)
												this.detailOptions.activeName = 'dischargePic'
											} else {
												return
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
			// let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.pageSize = val
			this.getData && this.getData(true)
		},
		// 分页改变当前页   有分页必写此方法
		handleCurrentChange(val, event) {
			// let query = this.$refs.searchComp.addFilterSearch()
			this.tableOption.pagination.currPage = val
			this.getData && this.getData(true)
		},
		// 搜索按钮
		search() {
			this.tableOption.pagination.currPage = 1
			this.getData(true)
		},
		handleAdd() {
			this.showDialog('add')
			this.detailOptions.activeName = 'baseInfo'
		},
		// handleEdit(row) {
		// 	this.showDialog('edit', row)
		// 	this.detailOptions.activeName = 'baseInfo'
		// },
		handleDetail(row) {
      // 从订单同步过来的数据(planNo不为空)，已办单的数据不能修改
      if (row.planNo) {
        if (['process'].includes(row.outboundStatus)) {
          this.showDialog('edit', row)
        } else {
          this.showDialog('detail', row)
        }
      } else {
        if (['created', 'process'].includes(row.outboundStatus)) {
          this.showDialog('edit', row)
        } else {
          this.showDialog('detail', row)
        }
      }
			this.detailOptions.activeName = 'baseInfo'
		},
		/**
		 * @description: 显示入库信息弹框
		 * @param {*} type
		 * @param {*} row
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-19 09:28:08
		 */
		showDialog(type, row) {
			// this.detailOptions.show = true
			this.detailOptions.type = type
			this.detailOptions.title = type === 'add' ? '新增出库信息' : '出库信息详情'
			this.detailOptions.id = row ? row.outboundOrderId : ''
      if (this.detailOptions.type === 'add') {
        this.$router.push({ path: '/wms/bound/outBoundAdd', query: this.detailOptions })
      } else {
        this.$router.push({ path: '/wms/bound/outBoundDetail', query: this.detailOptions })
      }
		},
		/**
		 * @description: 上传装货照片
		 * @param {*} row
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-26 17:30:37
		 */
		handleUpload(row) {
			this.uploadOptions.show = true
			this.uploadOptions.id = row.outboundOrderId
		},
		/**
		 * @description: 删除入库单
		 * @param {*} row
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-26 18:32:44
		 */
		handleDelete(row) {
			this.$confirm('确定删除该出库单？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				dangerouslyUseHTMLString: true,
				type: 'warning'
			})
				.then(() => {
					let data = {
						outboundOrderId: row.outboundOrderId
					}
					deleteOutBound(data).then(res => {
						if (res.code === 0) {
							this.$message.success('操作成功！')
							this.handleCurrentChange(1)
						}
					})
				})
				.catch(() => {})
		},
		/**
		 * @description: 新增费用
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-30 16:55:08
		 */
		handleFee() {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要新增费用的数据！')
			} else if (this.multipleSelection.length > 1) {
				this.$message.error('只能选择一条要新增费用的数据！')
			} else {
				this.feeOptions.show = true
				this.feeOptions.data = this.multipleSelection[0]
			}
		},
		/**
		 * @description: 派工
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-18 10:50:20
		 */
		handleDispatch() {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要派工的数据！')
			} else if (this.multipleSelection.length > 1) {
				this.$message.error('只能选择一条要派工的数据！')
			} else {
				let canDisptch = this.multipleSelection.every(item => ['created'].includes(item.outboundStatus))
				if (canDisptch) {
					this.dispatchOptions.show = true
					this.dispatchOptions.data = this.multipleSelection[0]
				} else {
					this.$message.error('所选数据必须全是已办单的数据！')
				}
			}
		},
		/**
		 * @description: 删除派工
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-18 11:59:15
		 */
		removeDispatch() {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要删除派工的数据！')
			} else {
				let canRemove = this.multipleSelection.every(item => item.outboundStatus === 'process')
				if (canRemove) {
					this.$confirm('是否删除已选中的出库单的派工？', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						dangerouslyUseHTMLString: true,
						type: 'warning'
					})
						.then(() => {
							this.removeDispatchApi()
						})
						.catch(() => {})
				} else {
					this.$message.error('所选数据必须全是装货中的数据！')
				}
			}
		},
		/**
		 * @description: 调用删除派工接口
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-26 10:54:04
		 */
		removeDispatchApi() {
			let data = {
				orderIds: [],
				orderType: 'outbound'
			}
			this.multipleSelection.forEach(item => {
				data.orderIds.push(item.outboundOrderId)
			})
			removeWorkTeam(data).then(res => {
				if (res.code === 0) {
					this.$message.success('操作成功！')
					this.handleCurrentChange(1)
				}
			})
		},
		/**
		 * @description: 耗材使用
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-29 17:33:41
		 */
		handleUsed() {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要新增辅材使用的数据！')
			} else if (this.multipleSelection.length > 1) {
				this.$message.error('只能选择一条入库单数据！')
			} else {
				this.materialOptions.show = true
				this.materialOptions.data = this.multipleSelection[0]
			}
		},
		/**
		 * @description: 确认出库/撤销确认出库
		 * @param {*} type
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-29 12:01:34
		 */
		handleConfirm(type) {
			if (!this.multipleSelection.length) {
				this.$message.error(`请选择要${type === 'confirm' ? '确认出库' : '撤销确认出库'}的数据！`)
			} else {
				let status = type === 'confirm' ? 'process' : type === 'cancel' ? 'done' : ''
				let flag = this.multipleSelection.every(item => [status].includes(item.outboundStatus))
				if (flag) {
          if (type === 'confirm') {
            let valid = this.multipleSelection.some(item => !item.actualQuantity)
            if (valid) {
              return this.$message.error("所选数据存在货物实出数为0或为空的数据，请修改后再操作！")
            }
            let validTally = this.multipleSelection.some(item => !item.tallyManId)
            if (validTally) {
              return this.$message.error("所选数据存在理货员为空的数据，请修改后再操作！")
            }
          }
					let data = {
						outboundOrderIds: [],
						confirmType: type
					}
					this.multipleSelection.forEach(item => {
						data.outboundOrderIds.push(item.outboundOrderId)
					})
					operateOutBound(data).then(res => {
						if (res.code === 0) {
							this.$message.success('操作成功！')
							this.handleCurrentChange(1)
						}
					})
				} else {
					this.$message.error(`所选数据必须全是${type === 'confirm' ? '装货中' : '已出库'}的数据！`)
				}
			}
		},
		/**
		 * @description: 打印出库单/出库检查单
		 * @return {*}
		 * @author: yinjunying
		 * @Date: 2022-08-29 17:30:51
		 */
		handlePrint(type) {
			if (!this.multipleSelection.length) {
				this.$message.error('请选择要打印的出库单！')
			} else if (this.multipleSelection.length > 1) {
				this.$message.error('只能选择一条要打印的数据！')
			} else {
				this.$confirm('是否打印已选中的出库单？', '提示', {
					confirmButtonText: '打印',
					cancelButtonText: '取消',
					dangerouslyUseHTMLString: true,
					type: 'warning'
				})
					.then(() => {
						let data = {
							outboundOrderId: this.multipleSelection[0].outboundOrderId
						}
            let url = ''
            if (type === 'outbound') {
              url = 'print'
            } else {
              url = 'printCheckList'
            }
						this.$store
							.dispatch('wms/exportBlobFile', {
								uri: '/wms/outBound/' + url,
								data
							})
							.then(res => {
								const content = res
								// 主要的是在这里的转换，必须要加上{ type: 'application/pdf' }
								// 要不然无法进行打印
								const blob = new Blob([content], { type: 'application/pdf' })
								var date = new Date().getTime()
								var ifr = document.createElement('iframe')
								ifr.style.frameborder = 'no'
								ifr.style.display = 'none'
								ifr.style.pageBreakBefore = 'always'
								ifr.setAttribute('id', 'printPdf' + date)
								ifr.setAttribute('name', 'printPdf' + date)
								ifr.src = window.URL.createObjectURL(blob)
								document.body.appendChild(ifr)
								this.doPrint('printPdf' + date)
								window.URL.revokeObjectURL(ifr.src)
							})
					})
					.catch(() => {})
			}
		},
		// 调用打印机
		doPrint(val) {
			var ordonnance = document.getElementById(val).contentWindow
			setTimeout(() => {
				ordonnance.print()
			}, 100)
		}
	}
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
</style>
