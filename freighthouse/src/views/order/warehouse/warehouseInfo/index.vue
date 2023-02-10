<template>
	<div class="app-container">
		<div class="search-container">
			<div class="filter-container">
				<div class="input-container container-search-warehouse">
					<span class="filter-txt">仓库名称：</span>
					<el-input size="mini" placeholder="请输入" v-model="tableQuery.warehouseName" clearable></el-input>
				</div>
				<div class="input-container container-search-warehouse">
					<span class="filter-txt">仓库联系人：</span>
					<el-input size="mini" placeholder="请输入" v-model="tableQuery.contact" clearable></el-input>
				</div>
				<div class="input-container container-search-warehouse">
					<span class="filter-txt">供应商：</span>
					<el-form>
						<supplierSelect paramCategory="category" paramValue="ware_house" :supplierId.sync="tableQuery.supplierId" />
					</el-form>
				</div>

				<div class="input-container container-search-warehouse searchOper-btns-box">
					<el-button size="mini" type="primary" ref="btnQuery" @click="handleSearch">
						搜索
						<!-- <span><i class="el-icon-search"></i>搜索</span> -->
					</el-button>
					<el-button size="mini" type="default" ref="btnRefresh" @click="handleReset" plain><span>重置</span></el-button>
				</div>
			</div>
		</div>
		<div class="table-container table-com-layout">
			<div class="warehouse-table-filter">
				<div class="table-filter-left">
					<el-button @click="handleAdd" type="primary" size="mini">新建</el-button>
				</div>
				<div class="table-filter-right">
					<el-radio-group v-model="tableQuery.status" size="mini" @change="handleSearchByStatus">
						<el-radio-button size="mini" v-for="(item, index) in statusOptions" :key="index" :label="index">{{ item }}</el-radio-button>
					</el-radio-group>
				</div>
			</div>
			<el-table class="warehouse-info-table" fit :data="tableData" style="width: 100%">
				<el-table-column prop="warehouseName" label="仓库名称" align="left"> </el-table-column>
				<el-table-column prop="warehouseAddress" label="仓库地址" align="left"> </el-table-column>
				<el-table-column prop="supplierName" label="仓库供应商" align="left"></el-table-column>
				<el-table-column width="120" prop="rentFreePeriod" label="仓库免租期( 天 )" align="left"></el-table-column>
				<el-table-column prop="contact" label="仓库联系人" align="left"> </el-table-column>
				<el-table-column prop="contactPhone" label="仓库联系人电话" align="left"> </el-table-column>
				<el-table-column prop="fax" label="传真" align="left"> </el-table-column>
				<el-table-column prop="email" label="邮箱" align="left"> </el-table-column>
				<el-table-column prop="remark" show-overflow-tooltip label="备注信息" align="left"> </el-table-column>
				<el-table-column prop="receiptTime" label="收货时间" align="left">
					<template slot-scope="scope">
						{{ scope.row.receiptTime | receiptTimeFilter }}
					</template>
				</el-table-column>
				<el-table-column label="路线图" align="left">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button v-if="scope.row.mapFileNo" @click="handleClickMap(scope.row)" type="text" size="mini">路线</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="仓位图" align="left">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button v-if="scope.row.fileNo" @click="handleClick(scope.row, 'pic')" type="text" size="mini">图纸</el-button>
						</div>
					</template>
				</el-table-column>
				<el-table-column fixed="right" label="操作" width="120" align="left">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleUpdateState(scope.row, 'effect')" type="text" size="mini" v-if="scope.row.status === 'no_effect'">生效</el-button>
							<el-button style="color: #f00" @click="handleUpdateState(scope.row, 'no_effect')" type="text" size="mini" v-if="scope.row.status === 'effect'">失效</el-button>
							<el-button @click="toDetail(scope.row)" type="text" size="mini">详情</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="base-el-pagination">
				<div class="pagination-container">
					<!-- <el-pagination
						size="mini"
						background
						@size-change="handleSizeChange"
						@current-change="handleCurrentChange"
						:current-page.sync="tableQuery.currPage"
						:page-size="tableQuery.pageSize"
						:total="tableQuery.totalCount"
						:page-sizes="[10, 20, 50]"
						:pager-count="5"
						layout="total, prev, pager, next, jumper, sizes"
						style="margin-top: 10px;"
					>
					</el-pagination> -->
					<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
				</div>
			</div>
			<el-dialog :visible.sync="dialogVisible" class="imgViewDialog">
				<img width="100%" :src="alertImgSrc" alt="" />
			</el-dialog>
			<!-- <transition name="fade">
      <div id="alertImg" @click.prevent="showAlertImg=!showAlertImg" v-show="showAlertImg">
        <i class="el-icon-close"></i>
        <img :src="alertImgSrc">
      </div>
    </transition> -->
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { deleteAlert } from '@/utils/tools'
import { warehouseHandleData } from '../js/handleData'
import searchTableUtil from '@/utils/searchTableUtil'
import BaseDialog from '@/components/Base/Dialog/index'
import Search from '@/components/Base/Search/index'
import { warehouseList, warehouseDelete, updateStatus } from '@/api/order/warehouse'
// import Pagination from '@/components/Base/Table/pagination'
import Pagination from '@/components/Base/Table/newPagination'
import supplierSelect from '@/components/Form/supplierSelectSearch'

const defaultTableQuery = {
	ascColumns: [],
	descColumns: ['createdTime'],
	warehouseName: '',
	contact: '',
	status: 'all',
	supplierId: ''
}
const defaultPage = {
	pageSize: -1,
	currPage: 1,
	totalCount: null
}

export default {
	filters: {
		receiptTimeFilter(time) {
			if (!time) return ''
			let begin = JSON.parse(time).begin
			let end = JSON.parse(time).end
			return `${begin}-${end}`
		}
	},
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
				}
			},
			btnList: [{ label: '新建', type: 'Add' }],
			freeSoList: [],
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			tableData: [], // table数据
			showAlertImg: false, // 显示图纸弹窗图片
			alertImgSrc: '', // 图纸弹窗图片地址
			dialogVisible: false,
			warehouseOptions: [],
			statusOptions: {
				all: '全部',
				effect: '生效',
				no_effect: '失效'
			}
		}
	},
	created() {
		this.init()
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	destroyed() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	components: {
		BaseDialog,
		Search,
		Pagination,
		supplierSelect
	},
	methods: {
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleClickMap(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.mapFileNo, fileName: row.mapFileName })
		},
		//跳转到详情
		toDetail(row) {
			this.$router.push({ path: 'edit', query: { whId: row.whId } })
		},
		visibleChange(val) {
			if (val) this.wareHouseSearch('')
		},
		remoteMethod(val) {
			this.wareHouseSearch(val)
		},
		handleChangeWarehouse(val) {},
		wareHouseSearch(queryString) {
			let data = {
				currPage: 1,
				pageSize: 50,
				warehouseName: queryString
			}
			warehouseList(data).then(res => {
				let list = res.data.list
				this.warehouseOptions = list.map(item => {
					return {
						value: item.whId,
						label: item.warehouseName
					}
				})
			})
		},
		init() {
			this.getList()
		},
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
		//tab切换
		handleSearchByStatus(status) {
			this.tableQuery.status = status
			this.tableQuery.currPage = 1
			this.getList()
		},
		getList() {
			let query = { ...this.tableQuery }
			if (query.status === 'all') delete query.status
			delete query.totalCount
			warehouseList(query).then(res => {
				this.tableData = [...res.data.list]
				this.tableQuery.totalCount = res.data.totalCount
				this.tableQuery.currPage = res.data.currPage
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
				this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
				this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
				this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
			})
		},
		// 新建
		handleAdd() {
			this.$router.push({
				path: 'add'
			})
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (!this.validCheck()) return false
				this.handleCreateSo(done)
			} else {
				this.close('Cancel')
			}
		},
		handleSearch() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		handleReset() {
			this.tableQuery = Object.assign({}, defaultTableQuery, defaultPage)
			this.getList()
		},
		handleClick(row, type) {
			if (type == 'pic') {
				this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
			} else if (type == 'delete') {
				deleteAlert(this, warehouseDelete, { whId: row.whId }, this.deleteCallback)
			}
		},
		deleteCallback() {
			let totalPage = Math.ceil((this.tableQuery.totalCount - 1) / this.tableQuery.pageSize)
			let currPage = this.tableQuery.currPage > totalPage ? totalPage : this.tableQuery.currPage
			this.tableQuery.currPage = currPage < 1 ? 1 : currPage
			this.getList()
		},
		// 分页
		handleSizeChange(val) {
			// this.tableQuery.pageSize = val
			this.getList()
		},
		handleCurrentChange(val) {
			// this.tableQuery.currPage = val
			this.getList()
		},
		// 生效，失效
		handleUpdateState(row, status) {
			let text = status === 'effect' ? '生效' : '失效'
			this.$confirm(`是否确认修改状态为${text}?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				lockScroll: 'true',
				type: 'warning'
			})
				.then(() => {
					return updateStatus({ whId: row.whId, status: status })
				})
				.then(() => {
					this.$message({ message: '修改状态成功', type: 'success' })
					this.tableQuery.currPage = 1
					this.getList()
				})
				.catch(() => {})
		}
	}
}
</script>

<style lang="scss">
.container-search-warehouse {
	justify-content: flex-start;
	.el-form {
		height: 20px;
		line-height: 20px;
	}
}
.warehouse-table-filter {
	display: flex;
	height: 28px;
	justify-content: space-between;
	font-size: 12px;
	// margin-bottom: 10px;
	.table-filter-left {
		display: flex;
		height: 28px;
	}
	.table-filter-right {
		display: flex;
		height: 20px;
		.el-radio-button--mini .el-radio-button__inner {
			padding: 3px 8px;
			height: 20px;
		}
	}
}
.warehouse-info-table {
	.cell.el-tooltip {
		overflow: hidden !important;
	}
}
.warehouse-pagination {
	display: flex;
	justify-content: space-between;
}
.create-form .el-col {
	padding-bottom: 20px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
	width: auto;
}
.filter-container {
	margin-bottom: 10px;
}
#alertImg {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.4);
	z-index: 111111;
	padding: 20px;
	display: flex;
	overflow-y: auto;
	img {
		margin: auto;
	}
	i {
		position: fixed;
		right: 40px;
		top: 20px;
		color: white;
		font-size: 38px;
		cursor: pointer;
	}
}
.imgViewDialog {
	.el-dialog__header {
		padding: 0;
	}
}
.table-com-layout {
	.el-table th,
	.el-table td,
	.el-table__body td {
		height: 30px;
		border-bottom: 1px solid #e9e9e9;
	}
}
.searchOper-btns-box {
	width: auto;
	margin-left: auto;
	margin-right: 0px;
	.dropdown {
		margin-left: 10px;
	}
	.el-button--mini {
		height: 20px;
		padding: 0px 8px;
	}
}
</style>
