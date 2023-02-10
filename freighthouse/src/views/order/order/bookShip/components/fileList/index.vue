<template>
	<div id="bookFileList" v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
		<div class="bookFileList-cont">
			<div class="fileList-tit">
				<div class="tit">附件列表</div>
				<div class="operate-cont">
					<!-- <el-button type="primary" size="mini" @click="handleAdd">新增附件</el-button> -->
				</div>
			</div>
			<div class="bookFileList-table">
				<el-table style="width: 100%" fit highlight-current-row :data="fileList">
					<!-- <el-table-column prop="fileNo" label="附件编号" align="center" width="260px"> </el-table-column> -->
					<el-table-column prop="serviceName" label="业务模块" align="center"> </el-table-column>
					<el-table-column prop="typeName" label="附件类别" align="center"> </el-table-column>
					<el-table-column prop="name" label="附件名称" align="center" show-overflow-tooltip>
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleView(scope.row)" type="text" size="mini">
									<span class="file-name-style">{{ scope.row.name }}</span>
								</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="size" label="附件大小(kb)" align="center" width="100px"> </el-table-column>
					<el-table-column prop="createdName" label="上传人" align="center"> </el-table-column>
					<el-table-column prop="createdTime" label="上传时间" align="center" width="160px"> </el-table-column>
					<el-table-column label="操作" width="100" align="center" fixed="right">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button @click="handleDownload(scope.row)" type="text" size="mini">下载</el-button>
								<!-- <el-button @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button> -->
							</div>
						</template>
					</el-table-column>
				</el-table>
				<div class="bkgFile-pagination">
					<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
				</div>
			</div>
		</div>
		<!-- 上传 -->
		<div v-if="uploadPopShow">
			<FileUpload @close="uploadPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderFileList } from '@/api/order/book/list'
import FileUpload from './fileUpload'
import Pagination from "@/components/Base/Table/newPagination"

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: [],
	query: []
}
const defaultPage = {
	pageSize: -1,
	currPage: 1,
	totalCount: null
}

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			fileList: [],
			uploadPopShow: false,
			tableConfig: {
        // 分页
        pagination: {
					pageSize: 10,
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        },
      },
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage)
		}
	},
	created() {
		this.getFileList()
	},
	mounted() {
	},
	destroyed(){
	},
	computed: {
		isPricing() {
			return this.$route.query.roles === 'pricing'
		},
		isBkg() {
			return this.$route.query.roles === 'bkg'
		},
	},
	components: {
		FileUpload,
		Pagination
	},
	methods: {
		// 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
		// 能预览：MSDS，我司格式托书，客户格式托书，运输鉴定书，货物图片，DG FORM，危包证这几个附件类型的附件
		getFileList() {
			let query = [
				{column: 'orderNo', type: 'eq', value: this.$route.query.orderNo},
				{column: 'typeCode', type: 'in', value: 'ls_booking,cust_booking,no_danger,msds,ysjds,hwtp,dgform,wbz'}
			]
			// 商务增加显示海运账单类型：'dn', 'dn_back', 'dn_back_empty', 'dn_change', 'dn_import_bill', 'dn_local'
			if (this.isPricing) {
				query = [
					{column: 'orderNo', type: 'eq', value: this.$route.query.orderNo},
					{column: 'typeCode', type: 'in', value: 'ls_booking,cust_booking,no_danger,msds,ysjds,hwtp,dgform,wbz,dn,dn_back,dn_back_empty,dn_change,dn_import_bill,dn_local'}
				]
			}
			Object.assign(this.tableQuery, {
				query: query
			})
			this.lsLoading = true
			orderFileList(this.tableQuery).then(res => {
				this.fileList = res.data.list
				this.tableQuery.totalCount = res.data.totalCount
				
				this.tableQuery.currPage = res.data.currPage
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
        this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
			}).finally(() => {
				this.lsLoading = false
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
			this.getFileList()
		},
		handleCurrentChange() {
			this.getFileList()
		},
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.name
					link.click()
				})
		},
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.name })
		},
		// 附件删除
		handleDelete(row) {

		},
		// 新增上传附件
		handleAdd() {
			this.uploadPopShow = true
		},
		// 上传弹窗关闭回调
		uploadPopClose(action) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.getFileList()
			}
		}
	}
}
</script>

<style lang="scss">
#bookFileList{
	.bookFileList-cont{
		margin: 4px 0 0 10px;
		padding: 0;
		background-color: #fff;
		.fileList-tit{
			height: 24px;
			line-height: 20px;
			padding: 2px 10px;
			background-color: #FFFFFF;
			border-radius: 2px 2px 0px 0px;
			border-bottom: 1px solid #e9e9e9;
			display: flex;
			justify-content: space-between;
			.tit{
				font-size: 12px;
				font-weight: bold;
			}
		}
		.bookFileList-table{
			padding: 8px;
			.el-table{
				th{
					height: 24px;
    			padding: 4px 0;
				}
				td{
					padding: 4px 0;
				}
			}
		}
		.bkgFile-pagination{
			text-align: right;
			margin-top: 10px;
			.el-pagination{
				padding: 0;
				span, button, .el-pager li, .el-input{
					font-size: 12px;
				}
				.el-pagination__sizes{
					margin-right: 0;
					.el-input .el-input__inner{
						font-size: 12px;
					}
				}
			}
		}
	}
}
</style>
