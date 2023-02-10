<template>
	<div class="assign-wrap" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left"></div>
					<div class="money-box-right">
						<el-button @click="refreshListPage" size="mini" type="primary">刷新</el-button>
					</div>
				</div>
				<FinanceTable :option="option1" @send-multi="sendMulti" />
			</div>
		</div>
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
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { customerInventoryQueryPageList, customerList, queryWarehousePage } from '@/api/wms'
import CustomColumns from '@/components/customColumns/index'

export default {
	mixins: [mixin, mixin2],
	data() {
		return {
			option1: {},
			searchOption1: {},
			loading: false,
			multipleSelection1: [],
      selfColumnsBase: []
		}
	},
	watch: {},
	created() {
		this.searchOption1 = {
			saveName: 'CusWareList',
			saveShow: false,
			// saveDefault: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					{ key: 'wmsWarehouseId', value: '', showType: '1' },
					{ key: 'orderCustId', value: '', showType: '2' },
					{ key: 'workOrderNo', value: '', showType: '3' },
					{ key: 'inboundNo', value: '', showType: '4' },
					{ key: 'createdTime', value: '', showType: '5' },
					{ key: 'inboundContainerNo', value: '', showType: '6' },
					{ key: 'inboundLicensePlate', value: '', showType: '7' }
				],
				filterGroups: {
					wmsWarehouseId: {
						label: '仓库名称',
						type: 'remoteSelect',
						multiple: true,
						showType: '1',
						remoteSelectList: [],
						remoteMethod: (name, item) => this.getWarehouseOptions(name, item),
						visibleChange: (name, item) => this.getWarehouseOptions(name, item)
					},
					orderCustId: { label: '客户名称', type: 'remoteSelect', multiple: true, showType: '2', remoteSelectList: [], remoteMethod: (name, item) => this.getCustomerOptions(name, item), visibleChange: (name, item) => this.getCustomerOptions(name, item) },
					workOrderNo: { label: '客户入仓单号', type: 'input', showType: '3' },
					inboundNo: { label: '入库单号', type: 'input', showType: '4' },
					createdTime: { label: '入库时间区间', type: 'datetimerange', showType: '5', format: 'yyyy-MM-dd HH:mm:ss', ranges: ['startDate', 'endDate'] },
					inboundContainerNo: { label: '入库柜号', type: 'input', showType: '6' },
					inboundLicensePlate: { label: '入库车牌', type: 'input', showType: '7' }
				}
			}
		}
		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
				// {
				// 	label: '修改',
				// 	type: 'text',
				// 	show: true,
				// 	action: 'Modify',
				// 	style: {
				// 		color: '#E9851F'
				// 	}
				// }
			],
			width: 120,
			show: false
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
			isNew: true
		})
		this.option1 = Object.assign({}, this.option, {
			disableFixedIndex0: true,
			id: 'option1',
			$name: 'IntiWareList',
			data: [],
			tips: {
				text: '',
				show: false
			},
      index: {
        show: true
      },
			selection: { show: true, fixed: true },
			operationBtns,
			pagination,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      }
		})
		let columns = [
			{
				prop: 'workOrderNo',
				label: '客户入仓单号',
				type: 'text',
				width: 120
			},

			{
				prop: 'wmsWarehouseName',
				label: '仓库名称',
				type: 'text',
        width: 150
			},
			{
				prop: 'approximateCost',
				label: '预计仓租费',
				type: 'text',
        width: 120
			},
			{
				prop: 'approximateCurrency',
				label: '预计仓租费币种',
				type: 'text',
        width: 120
			},
			{
				prop: 'contractNo',
				label: '合同号',
				type: 'text',
        width: 100
			},
			{
				prop: 'orderCustName',
				label: '客户名称',
				type: 'text',
        width: 180
			},
			{
				prop: 'inboundNo',
				label: '入库单号',
				type: 'text',
        width: 150
			},
			{
				prop: 'inboundTime',
				label: '入库时间',
				type: 'text',
        width: 130
			},
			{
				prop: 'inboundLicensePlate',
				label: '入库车牌',
				type: 'text',
        width: 100
			},
			{
				prop: 'goodsName',
				label: '货物名称',
				type: 'text',
        width: 120
			},
			{
				prop: 'inboundDays',
				label: '入库天数',
				type: 'text'
			},

			{
				prop: 'overdueDays',
				label: '超期天数',
				type: 'text'
			},
			{
				prop: 'actualQuantity',
				label: '实入数',
				type: 'text'
			},
			{
				prop: 'outboundQuantity',
				label: '出库数',
				type: 'text'
			},
			{
				prop: 'inventoryQuantity',
				label: '库存数',
				type: 'text'
			},
			{
				prop: 'inventoryVolume',
				label: '库存体积（CBM）',
				type: 'text'
			},
			{
				prop: 'inventoryWeight',
				label: '库存重量（KGS）',
				type: 'text'
			},
			{
				prop: 'areaName',
				label: '货物位置',
				type: 'text',
        width: 120
			},
			{
				prop: 'loadingVolume13',
				label: '出库记录',
				type: 'button',
				width: 80,
        fixed: 'right',
        disabled: true,
				operationBtns: {
					show: true,
					callback: (fn, index, row, option) => {
						this.toCarogList(row)
					}
				},
				formatter: ({ cellValue }, row) => {
					return '<span style="cursor:pointer;">查看</span>'
				}
			}
		]
		this.option1.columns = columns
    this.selfColumnsBase = columns
	},
	activated() {
    this.getData()
  },
	methods: {
		// 跳转
		toCarogList(row) {
			this.$router.push({ path: '/wms/bound/inventoryDetail', query: { inboundOrderId: row.inboundOrderId } })
		},
		// 客户名称
		getCustomerOptions(name, item) {
			customerList({ name }).then(res => {
				item.remoteSelectList = res.data.map(item => {
					return { ...item, label: item.name, value: item.custid }
				})
			})
		},
		// 仓库列表
		getWarehouseOptions(name, item) {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [
          {
            column: "employeeId",
            type: "eq",
            value: JSON.parse(localStorage.getItem('userInfo')).sysUserId
          },
          {
            column: "warehouseName",
            type: "like",
            value: name
          }
        ]
      }
      queryWarehousePage(data)
        .then(({ data: { list } }) => {
          item.remoteSelectList.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: v.warehouseName,
              value: v.wmsWarehouseId
            }))
          )
        })
		},
		// 删除
		handleDelete() {
			this.$confirm('是否删除已选作业班组?', '', {
				confirmButtonText: '删除',
				cancelButtonText: '取消',
				type: 'warning',
				center: true,
				customClass: 'confirm-wrap',
				confirmButtonClass: 'confirm-off'
			})
				.then(() => {
					this.$message({
						type: 'success',
						message: '删除成功!'
					})
				})
				.catch(() => {})
		},
		handleSizeChange(val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange(val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		search() {
			this.option1.pagination.currPage = 1
			this.getData(true)
		},
		getData(isSearch) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: []
			}
			this.finCommonSearch(data.query, this.searchOption1, true)

			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || []
			// 特殊处理时间格式
			data.query.map(item => {
				if (item.column === 'startDate') {
					item.column = 'inboundTime'
					item.type = 'ge'
				}
				if (item.column === 'endDate') {
					item.column = 'inboundTime'
					item.type = 'le'
				}
			})
      data.columns = this.customColumnsKeys
			this.loading = true
			customerInventoryQueryPageList(data)
				.then(res => {
					if (res.code === 0) {
            let { configColumns } = res.data
            this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map(item => item.prop)
            this.option1.columns = this.columns.map(prop => {
              let obj = this.selfColumnsBase.find(item => item.prop === prop)
              if (obj) {
                return obj
              } else {
                return {}
              }
            })
						this.option1.data = res.data.list
						Object.assign(this.option1.pagination, res.data)
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
		sendMulti(data, option) {
			this.multipleSelection1 = data
		}
	},
	components: {
		FinanceTable,
		FinanceSearch,
    CustomColumns
	}
}
</script>
<style></style>
<style lang="scss">
.confirm-wrap {
	.el-icon-error {
		color: #ffba00;
	}
	.el-message-box__btns {
		display: flex;
		flex-direction: row-reverse;
		.confirm-on {
			background: #33b18a;
			border: 0;
		}
		.confirm-off {
			background: #cd4130;
			border: 0;
		}

		.el-button {
			margin-left: 8px;
		}
	}
}
.assign-wrap {
	.el-button--mini {
		padding: 3px 7px;
	}
	.el-input--mini .el-input__inner,
	.el-input--mini .el-input__icon,
	.el-range-editor--mini.el-input__inner {
		height: 20px;
		line-height: 20px;
	}
	.select-template-box {
		float: left;
	}
	.select-template-box .el-dropdown {
		margin-left: 0;
		margin-bottom: 0;
		border-radius: 0;
		font-size: 12px;
		border: 1px solid #d9d9d9;
		border-radius: 4px;
	}
	.select-template-box:hover .el-dropdown {
		background: rgb(236, 245, 255);
		color: rgb(64, 158, 255);
	}
	.select-template-box .el-dropdown-link {
		cursor: pointer;
		padding-left: 5px;
		line-height: 18px;
		display: inline-block;
	}
	.select-template-box .el-icon--right {
		margin-left: 0;
	}
	.select-template-box .el-dropdown-link:focus {
		outline: none;
	}
}
</style>
