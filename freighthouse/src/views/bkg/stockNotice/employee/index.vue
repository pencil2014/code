<template>
	<div class="finance-page">
		<div class="notice-cnt">
			<div class="money-box">
				<div class="money-box-left">
					<el-button
						class="finance-btn"
						size="mini"
						@click="publishNotice"
						type="primary"
						>发布</el-button
					>
				</div>
				<div class="money-box-right"></div>
			</div>
			<FinanceTable :option="option1" />
		</div>
		<el-dialog
			title="消息发布"
			:visible.sync="noticePublishShow"
			class="self-dialog"
			width="1000px"
		>
			<div class="notice-publish-cnt">
				<el-form
					ref="noticePublishForm"
					:model="noticePublishForm"
					label-width="90px"
					size="mini"
					:rules="noticePublishFormRules"
				>
					<el-form-item label="查看航线:" prop="sysLineName">
						<el-select
							v-model="noticePublishForm.sysLineName"
							placeholder="请选择"
						>
							<el-option
								v-for="(op, i) in sysLineNameArr"
								:key="'sysLineName' + i"
								:label="op.label"
								:value="`${op.label},${op.value}`"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="显示时间:" prop="effect">
						<el-date-picker
							v-model="noticePublishForm.effect"
							type="daterange"
							value-format="yyyy-MM-dd HH:mm:ss"
							placeholder="请选择"
						>
						</el-date-picker>
					</el-form-item>
					<el-form-item label="标题:" prop="title">
						<el-input v-model="noticePublishForm.title"></el-input>
					</el-form-item>
					<el-form-item label="发布内容:" prop="content">
						<el-input
							type="textarea"
							placeholder="请输入内容"
							v-model="noticePublishForm.content"
							maxlength="500"
							:autosize="{ minRows: 3, maxRows: 5 }"
							show-word-limit
						>
						</el-input>
					</el-form-item>
				</el-form>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitNotice" size="mini"
					>确认</el-button
				>
				<el-button size="mini" @click="closeNotice">取消</el-button>
			</span>
		</el-dialog>
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
import FinanceTable from "@/views/finance/components/financeTable/financeTable"
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import { messageList, messageAdd, messageOff } from "@/api/bkg/stockApply"
export default {
	components: {
		FinanceTable
	},
	mixins: [mixin, routerMixin],
	data () {
		return {
			option1: {},
			noticePublishShow: false,
			noticePublishForm: {
				sysLineName: '',
				effect: '',
				title: '',
				content: '',
			},
			noticePublishFormRules: {
				sysLineName: [
					{
						required: true,
						message: "查看航线不能为空",
						trigger: "change",
					},
				],
				effect: [
					{
						required: true,
						message: "显示时间不能为空",
						trigger: "change",
					}
				],
				title: [
					{
						required: true,
						message: "标题不能为空",
						trigger: "blur",
					}
				],
				content: [
					{
						required: true,
						message: "内容不能为空",
						trigger: "blur",
					}
				]
			},
			sysLineNameArr: [],
			noticeInformation: false,
			noticeData: {}
		}
	},
	created () {
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			width: 100,
			data: [
				{
					label: "详情",
					type: "text",
					show: true,
					action: "messageInfo",
				},
				{
					label: "下架",
					type: "text",
					// show: true,
					showFn: (row) => {
						return row.status === 'on'
					},
					action: "messageOff",
				}
			],
			fixed: 'right',
			show: true,
			callback: (action, $index, row, option) => {
				if (action === 'messageInfo') {
					this.messageInfo(row)
				} else if (action === 'messageOff') {
					this.messageOff(row)
				}
			},
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
		});
		this.option1 = Object.assign({}, this.option, {
			id: "option1",
			data: [],
			tips: {
				text: "",
				show: false,
			},
			selection: false,
			operationBtns,
			pagination,
		});
		let columns1 = [
			{
				prop: "title",
				label: "标题",
				type: "text",
				width: 200,
			},
			{
				prop: "content",
				label: "发布内容",
				type: "text",
				width: 600,
			},
			{
				prop: "createdName",
				label: "发布人",
				type: "text",
			},
			{
				prop: "effectBeginTime",
				label: "显示时间",
				type: "text",
				width: 120,
				formatter: (row) => {
					return `${row.effectBeginTime.split(' ')[0]} 至 ${row.effectEndTime.split(' ')[0]} `
				}
			},
			{
				prop: "sysLineName",
				label: "查看航线",
				type: "text",
			}
		];
		this.option1.columns = columns1
		this.getData()
	},
	methods: {
		// 消息列表
		getData () {
			let data = {
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				query: []
			}
			messageList(data).then(res => {
				let data = res.data
				this.option1.data = data.list
				this.option1.pagination.currPage = data.currPage
				this.option1.pagination.pageSize = data.pageSize
				this.option1.pagination.totalCount = data.totalCount
			}).catch(() => { })
		},
		// 发布按钮
		publishNotice () {
			this.noticePublishShow = true
		},
		// 发布信息
		submitNotice () {
			this.$refs.noticePublishForm.validate(valid => {
				if (valid) {
					let { sysLineName, effect, content, title } = this.noticePublishForm
					let data = {
						sysLineCode: sysLineName.split(',')[1],
						sysLineName: sysLineName.split(',')[0],
						title,
						content,
						effectBeginTime: effect[0],
						effectEndTime: effect[1]
					}
					messageAdd(data).then(res => {
						if (res.code === 0) {
							this.$message({
								message: '恭喜你，消息发布成功！',
								type: 'success'
							})
						}
            this.$refs.noticePublishForm.resetFields()
            this.noticePublishShow = false
            this.handleCurrentChange(1)
					}).catch(() => {
						this.$message({
							message: '对不起，消息发布失败！',
							type: 'error'
						})
					})
				}
			})
		},
		// 关闭发布弹框
		closeNotice () {
			this.noticePublishShow = false
			this.$refs.noticePublishForm.resetFields()
		},
		// 展示消息详情
		messageInfo (row) {
			this.noticeData = row
			this.noticeInformation = true
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch (queryString) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				this.sysLineNameArr = data.map(item => {
					return {
						label: item.value,
						value: item.key
					}
				})
			})
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
		// 消息下架确认
		messageOff (row) {
			this.$confirm('是否确认要下架该消息？', '提示', {
				confirmButtonText: '确认',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				// 消息下架
				this.messageOffFn(row)
			}).catch(() => { })
		},
		// 消息下架方法
		messageOffFn (row) {
			let data = row.oid
			messageOff(data).then(res => {
				if (res.code === 0) {
					this.$message({
						message: '恭喜你，消息下架成功！',
						type: 'success'
					})
				}
				this.getData()
			}).catch(() => {
				this.$message({
					message: '对不起，消息下架失败！',
					type: 'success'
				})
			})
		}
	},
	filters: {
		formatDate (val) {
			return val ? val.split(' ')[0] : ''
		}
	},
	mounted () {
		this.sysLineQuerySearch()
	}
}
</script>

<style lang="scss" scoped>
.notice-cnt {
	padding-top: 5px;
}
</style>