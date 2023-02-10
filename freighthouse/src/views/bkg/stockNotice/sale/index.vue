<template>
	<div class="finance-page">
		<div class="notice-list">
			<div
				class="notice-item"
				v-for="(item, index) in noticeList"
				:key="'noticeList' + index"
			>
				<div class="notice-cnt">
					<div class="title">
						{{ item.title }}
					</div>
					<div class="content">{{ item.content }}</div>
				</div>
				<div class="publisher">发布人：{{ item.createdName }}</div>
				<div class="publish-time">
					发布时间：{{ item.effectBeginTime | formatDate }}
				</div>
				<div class="more" @click="showNoticeInfo(item)">更多</div>
			</div>
		</div>
		<div class="notice-list-pagination">
			<div class="pagination-container">
				<el-pagination
					size="mini"
					background
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
					:current-page.sync="pagination.currPage"
					:page-size="pagination.pageSize"
					:total="Number(pagination.totalCount)"
					:page-sizes="[10, 20, 50, 100]"
					:pager-count="5"
					layout="total, prev, pager, next, jumper, sizes"
				></el-pagination>
			</div>
		</div>
		<el-dialog
			title="消息查看"
			:visible.sync="noticeInformation"
			class="self-dialog"
			width="1000px"
		>
			<div class="notice-info">
				<div class="title">{{ noticeData.title }}</div>
				<div class="author-box">
					<span class="author">{{ noticeData.createdName }}</span>
					<span class="time">{{
						noticeData.effectBeginTime | formatDate
					}}</span>
				</div>
				<div class="content">
					{{ noticeData.content }}
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import { messageList } from "@/api/bkg/stockApply"
export default {
	mixins: [mixin, routerMixin],
	data () {
		return {
			noticeList: [],
			pagination: {
				currPage: 1,
				pageSize: 10,
				totalCount: 0
			},
			noticeInformation: false,
			noticeData: {}
		}
	},
	created () {
		this.getData()
	},
	methods: {
		// 消息列表
		getData () {
			let data = {
				currPage: this.pagination.currPage,
				pageSize: this.pagination.pageSize,
				query: []
			}
			messageList(data).then(res => {
				let data = res.data
				this.noticeList = data.list
				this.pagination.currPage = data.currPage
				this.pagination.pageSize = data.pageSize
				this.pagination.totalCount = data.totalCount
			}).catch(() => { })
		},
		// 分页方法
		handleSizeChange (val) {
			this.pagination.pageSize = val
			this.getData()
		},
		// 分页方法
		handleCurrentChange (val) {
			this.pagination.currPage = val
			this.getData()
		},
		// 查看详情
		showNoticeInfo (data) {
			this.noticeData = data
			this.noticeInformation = true
		}
	},
	filters: {
		formatDate (val) {
			return val ? val.split(' ')[0] : ''
		}
	}
}
</script>

<style lang="scss" scoped>
.notice-list {
	padding: 10px;
	.notice-item {
		display: flex;
		padding: 10px 0;
		border-bottom: 1px solid #e9e9e9;
		align-items: center;
		.notice-cnt {
			flex: 1;
			.title {
				font-size: 14px;
				font-weight: 600;
			}
			.content {
				color: #999;
				line-height: 20px;
			}
		}
		.publisher {
			margin-left: 15px;
		}
		.publish-time {
			margin: 0 15px;
		}
		.more {
			text-align: right;
			color: #3e80f5;
			cursor: pointer;
		}
	}
}
</style>