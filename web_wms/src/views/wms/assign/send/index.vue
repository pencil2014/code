<template>
	<div class="assign-wrap" v-loading="loading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div>
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
				<div class="money-box">
					<div class="money-box-left">
						<el-button @click="toAdd" size="mini" type="primary">新增</el-button>
						<el-button @click="handleOn" size="mini" type="success">完工</el-button>
					</div>
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
import { workDispatchQueryPage, workDispatchComplete, customerList, workDispatchRemove, queryWarehousePage, checkWorkDispatch } from '@/api/wms'
import { mapGetters } from 'vuex'
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
	computed: {
		...mapGetters(['dictMap'])
	},
	watch: {},
	created() {
		this.searchOption1 = {
			saveName: 'AssignSendList',
			saveShow: false,
			// saveDefault: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				defaultSearchLength: 6,
				searchInputGroup: [
					{ key: 'warehouseId', value: '', showType: '1' },
					{ key: 'workDispatchNo', value: '', showType: '2' },
					{ key: 'dispatchType', value: '', showType: '3' },
					{ key: 'createdTime', value: '', showType: '4' },
					{ key: 'inboundNo', value: '', showType: '5' },
					{ key: 'outboundNo', value: '', showType: '5' },
					{ key: 'custId', value: '', showType: '6' }
				],
				filterGroups: {
					warehouseId: { label: '仓库名称', type: 'remoteSelect', showType: '1', remoteSelectList: [], remoteMethod: (name, item) => this.getWarehouseOptions(name, item), visibleChange: (name, item) => this.getWarehouseOptions(name, item) },
					workDispatchNo: { label: '作业单号', type: 'input', showType: '2' },
					dispatchType: { label: '作业单类型', type: 'select', showType: '3', propInDict: 'wmsDispatchType' },
					createdTime: { label: '派工时间区间', type: 'daterange', showType: '4', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
					inboundNo: { label: '入库号', type: 'input', showType: '5' },
					outboundNo: { label: '出库号', type: 'input', showType: '5' },
					custId: { label: '客户名称', type: 'remoteSelect', multiple: true, showType: '6', remoteSelectList: [], remoteMethod: (name, item) => this.getCustomerOptions(name, item), visibleChange: (name, item) => this.getCustomerOptions(name, item) }
				}
			}
		}
		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
        	{
					label: '详情',
					type: 'text',
          show: true,
          action: 'Detail'
				},
				{
					label: '修改',
					type: 'text',
					action: 'Modify',
					style: {
						color: '#E9851F'
					},
          showFn: row => {
            return !['completed'].includes(row.dispatchStatus)
          }
				},
				{
					label: '删除',
					type: 'text',
					action: 'Delete',
          showFn: row => {
            return !['completed'].includes(row.dispatchStatus)
          }
				}
			],
			width: 120
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
			isNew: true,
      pageSize: 20
		})
		this.option1 = Object.assign({}, this.option, {
			disableFixedIndex0: true,
			id: 'option1',
			$name: 'AssignSendList',
			data: [],
			tips: {
				text: '',
				show: false
			},
      index: {
        show: true
      },
			selection: { show: true, fixed: true},
			operationBtns,
			pagination,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      }
		})
		let columns = [
			{
				prop: 'workDispatchNo',
				label: '作业单号',
				type: 'text',
				width: 128
			},

			{
				prop: 'cityName',
				label: '城市',
				type: 'text',
				width: 100
			},
			{
				prop: 'warehouseName',
				label: '仓库名称',
				type: 'text',
				width: 200
			},
			{
				prop: 'dispatchTime',
				label: '派工时间',
				type: 'text',
				width: 150
			},

			{
				prop: 'custName',
				label: '客户名称',
				type: 'text',
				width: 200
			},

			{
				prop: 'workOrderNo',
				label: '客户入仓单号',
				type: 'text',
				width: 150
			},
			{
				prop: 'dispatchType',
				label: '作业单类型',
				type: 'select',
				propInDict: 'wmsDispatchType',
				width: 120
			},

			{
				prop: 'inboundNo',
				label: '入库单号',
				type: 'text',
				width: 160
			},
			{
				prop: 'outboundNo',
				label: '出库单号',
				type: 'text',
				width: 160
			},

			{
				prop: 'workQuantity',
				label: '数量',
				type: 'text',
				width: 100
			},
			{
				prop: 'workVolume',
				label: '体积(CBM)',
				type: 'text',
				width: 100
			},
			{
				prop: 'workWeight',
				label: '重量(KGS)',
				type: 'text',
				width: 100
			},
			{
				prop: 'workTeamName',
				label: '作业班组',
				type: 'text',
				width: 130
			},
			{
				prop: 'workTeamMembers',
				label: '班组成员',
				type: 'text',
				width: 130
			},
			{
				prop: 'workRequirement',
				label: '作业要求',
				type: 'text',
				width: 130
			},
			{
				prop: 'dispatchStatus',
				label: '状态',
				type: 'select',
				width: 130,
				propInDict: 'wmsDispatchStatus'
			},
			{
				prop: 'createdName',
				label: '创建人',
				type: 'text',
				width: 130
			},
			{
				prop: 'createdTime',
				label: '创建时间',
				type: 'text',
				width: 130
			}
		]
		this.option1.columns = columns
    this.selfColumnsBase = columns
	},
	activated() {
		this.refreshListPage()
	},
	methods: {
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
			// warehouseList({ warehouseName: name }).then(res => {
			// 	item.remoteSelectList = res.data.map(item => {
			// 		return { ...item, label: item.warehouseName, value: item.wmsWarehouseId }
			// 	})
			// })
		},
		// 删除
		handleDelete(row) {
			this.$confirm('是否删除已选出入库派工单?', '', {
				confirmButtonText: '删除',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let dispatchIds = [row.workDispatchId]
					workDispatchRemove({ dispatchIds }).then(() => {
						this.$message.success('删除成功!')
						this.refreshListPage()
					})
				})
				.catch(() => {})
		},
		// 完工
		handleOn() {
			if (this.multipleSelection1.length === 0) return this.$message.error('请先勾选数据！')
      let dispatchIds = this.multipleSelection1.map(item => item.workDispatchId)
      this.validComplete(dispatchIds)
			
		},
    // 校验完工
    validComplete (dispatchIds) {
      checkWorkDispatch ({ dispatchIds }).then(({ code, data }) => {
        if (code === 0) {
          if (data.length) {
            for (let i = 0; i < data.length; i++) {
              const item = data[i];
              if (['tallyman_only'].includes(item.checkResult)) { //只有理货员
                return this.$confirm(`作业单号为【${item.dispatchNo}】的作业派工只有理货员信息，无其他作业人员信息，确认完工吗？`, "提示", {
                  confirmButtonText: "确认",
                  cancelButtonText: "取消",
                  type: "warning"
                }).then(() => {
                  this.workDispatchCompleteApi(dispatchIds)
                }).catch((err) => {
                });
                // return this.$message.error(`当前${item.dispatchNo}的作业无理货员或无作业人员信息，请补充后再完工！`)
              }
              if (['tallyman_not_present'].includes(item.checkResult)) { //没有理货员
                return this.$message({
                  type: 'error',
                  message: `作业单号为【${item.dispatchNo}】的作业无理货员信息，请补充后再完工！`,
                  showClose: true
                })
              }
              if (['nobody'].includes(item.checkResult)) { //没有理货员，没有作业人员
                return this.$message({
                  type: 'error',
                  message: `选中的${item.dispatchNo}作业既无理货员又无作业人员信息，请补充后再完工！`,
                  showClose: true
                })
              }
            }
          } else {
            this.workDispatchCompleteApi(dispatchIds)
          }
        }
      }).catch(() => {})
    },
    /**
     * @description: 调用完工接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-26 16:42:23
     */
    workDispatchCompleteApi (dispatchIds) {
      this.$confirm('是否完工已选作业派工？', '', {
				confirmButtonText: '完工',
				cancelButtonText: '取消',
				type: 'warning',
			})
				.then(() => {         
					workDispatchComplete({ dispatchIds }).then(() => {
            this.refreshListPage()
            this.$message.success('操作成功！')
          })
					
				})
				.catch(() => {})
    },
		// 新增
		toAdd() {
			this.$router.push({ path: '/wms/assign/sendDetail', query: { type: 'add' } })
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
      data.columns = this.customColumnsKeys
			this.loading = true
			workDispatchQueryPage(data)
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
            this.option1.data = this.option1.data.map(item => {
              return {
                ...item,
                _checkDisabled: item.dispatchStatus === 'completed'
              }
            })
					}
				})
				.finally(() => {
					this.loading = false
				})
		},
    // 详情
    handleDetail (row) {
      this.$router.push({ path: '/wms/assign/sendDetail', query: { type: 'detail', dispatchId: row.workDispatchId } })
    },
		// 修改
		handleModify(row) {
			this.$router.push({ path: '/wms/assign/sendDetail', query: { type: 'modify', dispatchId: row.workDispatchId } })
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
	.el-input--mini .el-input__icon {
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
