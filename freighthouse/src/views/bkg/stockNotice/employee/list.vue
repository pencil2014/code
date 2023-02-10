<template>
	<div class="finance-page">
		<div class="bkg-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<el-button class="finance-btn" @click="noticeRead" size="mini"
						>部分已读</el-button
					>
					<el-button
						class="finance-btn"
						@click="noticeReadAll"
						size="mini"
						type="primary"
						>全部已读</el-button
					>
				</div>
				<div class="money-box-right">
					<el-button-group>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(0)"
							size="mini"
							:class="rightFilterBtns[0] ? 'right-filter-btns-effect' : ''"
							>全部</el-button
						>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(1)"
							size="mini"
							:class="rightFilterBtns[1] ? 'right-filter-btns-effect' : ''"
							>未读</el-button
						>
						<el-button
							class="finance-btn"
							@click="rightFilterAction(2)"
							size="mini"
							:class="rightFilterBtns[2] ? 'right-filter-btns-effect' : ''"
							>已读</el-button
						>
					</el-button-group>
				</div>
			</div>
			<FinanceTable :option="option1" @send-multi="sendMulti" />
		</div>
	</div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { noticeList, noticeRead, noticeReadAll, unreadCount } from '@/api/bkg/stockApply'
import { mapMutations } from 'vuex'
export default {
	components: {
		FinanceTable,
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			option1: {},
			rightFilterBtns: [true, false, false],
			multipleSelection: [],
		}
	},
	created () {
		let pagination1 = Object.assign({}, this.option.pagination, {
			show: true,
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1',
			data: [],
			tips: false,
			operationBtns: false,
			pagination: pagination1,
		})
		let columns = [
			{ prop: 'title', label: '标题' },
			{ prop: 'content', label: '通知内容' },
			{
				prop: 'status', label: '状态', formatter: (row) => {
					return row['status'] === 'read' ? '已读' : '未读'
				}
			},
			{ prop: 'createdTime', label: '时间' },
		]
		this.option1.columns = columns
		this.getData()
		// 获取菜单红点
		this.unreadCountFn()
	},
	methods: {
		// 获取数据
		getData (index) {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: [],
			}
			if (index) {
				let status = ['', 'unread', 'read']
				let verifyStatus = status[index]
				data.query.push({ column: 'status', value: verifyStatus, type: 'eq' })
			}
			noticeList(data)
				.then((res) => {
					let data = res.data
					this.option1.data = data.list.map(item => {
						if (item.status === 'read') {
							return Object.assign(item, { _disabled: true })
						} else {
							return Object.assign(item, { _isRefused: true })
						}
					})
					this.option1.pagination.currPage = data.currPage
					this.option1.pagination.pageSize = data.pageSize
					this.option1.pagination.totalCount = data.totalCount
				})
				.catch(() => { })
		},
		// 获取未读数据
		unreadCountFn () {
			unreadCount({}).then(res => {
				let unreadCount = res.data.unreadCount
				if (unreadCount > 0) {
					this.setNoticeNameValue({
						'name': 'BkgNoticeList',
						'value': unreadCount
					})
				}
			}).catch(() => { })
		},
		// 右边筛选操作
		rightFilterAction (index) {
			this.getData(index)
			this.rightFilterBtns = [false, false, false]
			this.$set(this.rightFilterBtns, index, true)
		},
		// 表格选择
		sendMulti (data) {
			this.multipleSelection = data
		},
		// n部分已读
		noticeRead () {
			let len = this.multipleSelection.length
			if (!len) {
				return this.$msgErrClose('请先勾选需要已读的通知！')
			}
			let oids = this.multipleSelection.map(item => {
				return item.oid
			})
			let data = {
				oids
			}
			noticeRead(data).then(res => {
				if (res.code === 0) {
					this.getData()
					this.$msgSucClose('恭喜你，已读成功！')
				}
			}).catch(() => { })
		},
		// 全部已读
		noticeReadAll () {
			this.$confirm('是否确认全部已读?', "警告", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.noticeReadAllFn()
			}).catch((err) => {
			})
		},
		noticeReadAllFn () {
			noticeReadAll({}).then(res => {
				if (res.code === 0) {
					this.getData()
					this.$msgSucClose('恭喜你，全部已读成功')
				}
			}).catch(() => { })
		},
		// 分页方法
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData()
		},
		// 分页方法
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData()
		},
		...mapMutations('notice', ['setNoticeNameValue'])
	}
}
</script>