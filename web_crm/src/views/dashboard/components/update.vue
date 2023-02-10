<template>
	<div class="edit-row update-wrap">
		<div class="">
			<div class="msg-form-bd">
				<el-table class="dashboard-table-wrap" header-row-class-name="dashboard-msg-header" @selection-change="handleSelectionChange" :data="tableList" ref="msgSysTableLayout">
					<el-table-column width="50" align="center" label="">
						<template slot-scope="scope">
							<span v-if="new Date(scope.row.noticeTime).toLocaleDateString() === new Date().toLocaleDateString()" class="dashboard-new-msg">new</span>
						</template>
					</el-table-column>
					<el-table-column prop="noticeTitle" align="left" show-overflow-tooltip="" label="通知标题">
						<template slot-scope="scope">
							<span class="todo-notice-title" @click="handleDetail(scope.row)">{{ scope.row.noticeTitle }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="noticeTime" align="center" label="通知时间"></el-table-column>
					<el-table-column label="操作" width="90" align="center" fixed="right">
						<template slot-scope="scope">
							<el-button class="msg-op-btn" @click="handleDetail(scope.row)" type="text" size="mini">详情</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="pagenation-cont">
					<Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" ref="msgTableFooter" />
				</div>
			</div>
		</div>

		<el-dialog class="dashboard-sys-update" title="系统更新" :visible.sync="open" :lock-scroll="true" width="780px">
			<div class="ql-editor update-image-wrap" v-html="contentHtml">
				图文信息
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="cancel">关闭</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import store from '@/store'
import { noticeWebsiteList, noticeWebsiteRead, noticeWebsiteDelete } from '@/api/msg'
import { getDictLabel } from '@/utils/tools'
import Pagination from '@/components/Base/Table/pagination'
import noticeMixin from './noticeMixin'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

const defaultTableQuery = {
	pageSize: -1,
	currPage: 1,
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [{ column: 'noticeType', type: 'eq', value: 'MSG_UPGRADE' }]
}
export default {
	mixins: [noticeMixin],
	data() {
		return {
			contentHtml: '',
			selectRows: [],
			tableHeight: 400,
			tableList: [],
			open: false,
			total: 0,
			tableQuery: Object.assign({}, defaultTableQuery),
			detail: {},
			tableConfig: {
				// 分页
				pagination: {
					show: true,
					total: 0
				}
			}
		}
	},
	created() {
		this.getList()
	},
	mounted() {
		// DOM加载完成后计算表格高度
		this.$nextTick(() => {
			this.dynamicHeight()
		})
	},

	props: {
		noticeTypeOptions: {
			type: Object,
			default: () => ({})
		}
	},
	// table基础组件
	components: {
		Pagination
	},
	filters: {},
	methods: {
		handleSelectionChange(val) {
			this.selectRows = val
		},
		// cellClassName({ row, column, rowIndex, columnIndex }) {
		// 	if (columnIndex === 2 &&row.viewStatus && row.viewStatus.toUpperCase() === 'N') {
		// 		return 'dashboard-no-read-row'
		// 	}
		// 	return ''
		// },
		//批量已读
		handleBatchRead() {
			if (this.selectRows.length === 0) return this.$message.warning('请选择要批量已读的数据!')
			let oids = this.selectRows.map(item => item.oid)
			noticeWebsiteRead({ oids }).then(res => {
				this.$message.success('批量已读成功!')
				this.getList()
			})
		},
		//批量删除
		handleBatchDelete() {
			if (this.selectRows.length === 0) return this.$message.warning('请选择要批量删除的数据!')
			this.$confirm('是否确认删除?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let oids = this.selectRows.map(item => item.oid)
				noticeWebsiteDelete({ oids }).then(res => {
					this.$message.success('批量删除成功!')
					if (oids.length === this.tableQuery.pageSize || oids.length === this.tableList.length % this.tableQuery.pageSize) this.tableQuery.currPage--

					this.getList()
				})
			})
		},
		//删除
		handleDelete(row) {
			this.$confirm('是否确认删除?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				noticeWebsiteDelete({ oids: [row.oid] }).then(res => {
					this.$message.success('删除成功!')
					this.getList()
				})
			})
		},
		async dynamicHeight(value) {
			let { msgSysTableLayout, msgTableFooter } = this.$refs
			let height = document.documentElement.clientHeight || document.body.offsetHeight

			let table = msgSysTableLayout.$el.getBoundingClientRect()
			let footer = msgTableFooter.$el.getBoundingClientRect()
			this.tableHeight = height - table.top - footer.height - 20 // 表格高度=文档高度-表格距顶部距离-表格分页-容器padding间距
		},
		async getList() {
			let res = await noticeWebsiteList(this.tableQuery)
			this.tableList = res.data.list
			this.tableConfig.pagination.total = res.data.totalCount
			this.tableQuery.pageSize = res.data.pageSize
		},
		handleDetail(row) {
			// let oids = [row.oid]
			// noticeWebsiteRead({ oids }).then(res => {
			// 	this.getList()
			// })
			this.contentHtml = row.noticeContent
			this.detail = row
			this.open = true
		},
		cancel() {
			this.open = false
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange() {
			this.getList()
		}
	}
}
</script>

<style lang="scss">
.dashboard-sys-update {
	.el-dialog__body {
		// max-height: 50vh;
		.update-image-wrap {
			img {
				max-width: 100%;
			}
		}
	}
}

.msg-form-bd {
	padding: 0 10px;
	.msg-op-btn.el-button--mini {
		padding: 0;
	}
}
.msg-detail .el-form-item {
	margin-bottom: 0;
}
.msg-detail .el-form-item__label {
	color: #999;
}
.msg-detail .el-form-item__content {
	font-size: 12px;
}
.msg-detail .el-form-item__content .content-link a {
	color: #3e80f5;
	text-decoration: underline;
}
.content-link a {
	color: #3e80f5;
	text-decoration: underline;
}

.msg-form-bd .pagenation-cont {
	text-align: right;
	margin-top: 8px;
}
</style>
