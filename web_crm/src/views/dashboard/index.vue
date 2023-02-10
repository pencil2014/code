<template>
	<div>
		<div class="message-cont dashboard-message-cont">
			<el-tabs type="card" v-model="activityKey" @tab-click="handleClick" class="pl20 msg-tabs">
				<el-tab-pane v-for="item in noticeMenu" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
			</el-tabs>
			<component ref="notice" :is="activityKey" :noticeTypeOptions="noticeTypeOptions"></component>
		</div>
		<el-dialog class="dashboard-sys-update" title="系统更新" :visible.sync="open" :lock-scroll="true" width="780px">
			<div class="ql-editor update-image-wrap" v-html="contentHtml">
				图文信息
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button size="mini" @click="cancel">关闭</el-button>
			</div>
		</el-dialog>
		<div class="clear-jumproute-fromto-list" @dblclick="clearJumpRoute">reset back</div>
	</div>
</template>

<script>
import Msg from './components/msg'
import Todo from './components/todo'
import MsgSys from './components/msgSys'
import Update from './components/update'
import { noticeMsgUpgrade } from '@/api/msg'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
	components: {
		Msg,
		Todo,
		MsgSys,
		Update
	},
	data() {
		return {
			contentHtml: '',
			open: false,
			timer: null,
			noticeMenu: [
				{
					key: 'Todo',
					value: '待办事项'
				},
				{
					key: 'Msg',
					value: '业务通知'
				},
				// {
				// 	key: 'MsgSys',
				// 	value: '系统通知'
				// }
				{
					key: 'Update',
					value: '系统更新'
				}
			],
			activityKey: 'Todo',
			noticeTypeOptions: {
				UPDATE: '系统更新',
				MSG: '业务通知',
				TODO: '待办事项',
				MSG_SYS: '系统通知'
			}
		}
	},
	mounted() {
		this.activityKey = localStorage.noticeActivityKey || 'Todo'
		this.timer = setInterval(() => {
			this.$refs.notice.getList()
		}, 60000)
		this.handleUpdate()
	},
	destroyed() {
		localStorage.noticeActivityKey = this.activityKey
		clearInterval(this.timer)
		this.timer = null
	},

	methods: {
		cancel() {
			this.open = false
		},
		async handleUpdate() {
			let { data } = await noticeMsgUpgrade()
			let updateId = localStorage.updateId
			let oid = data && data.oid
			if (oid && oid != updateId) {
				this.contentHtml = data.noticeContent
				this.open = true
				localStorage.updateId = oid
			} else {
				this.open = false
			}
		},
		handleClick(tab, event) {
			localStorage.noticeActivityKey = this.activityKey
		},
		clearJumpRoute() {
			this.$store.commit('finance/setSaveJumpRouteWhenRf', false)
			localStorage.removeItem('jumpRouteFromToListStr')
			location.reload()
		}
	}
}
</script>
<style lang="scss">
.dashboard-sys-update {
	.el-dialog__body {
		max-height: 50vh;
		.update-image-wrap {
			img {
				max-width: 100%;
			}
		}
	}
}

.dashboard-message-cont {
	.click-tip {
		margin-top: 4px;
		color: #ddd;
	}
	.cell.el-tooltip {
		overflow: hidden;
	}
	.todo-notice-title {
		cursor: pointer;
	}
	.todo-notice-title:hover {
		color: #3e80f5;
		cursor: pointer;
	}
	.notice-priority-high {
		color: #cd4130;
	}
	.notice-priority-middle {
		color: #edb534;
	}
	.notice-priority-low {
		color: #4a4a4a;
	}
	.msg-op-btn-del {
		color: #cd4130;
	}
	.el-tabs__header {
		margin-bottom: 8px !important;
	}
}
.dashboard-batch-btns {
	margin-bottom: 4px;
}
.dashboard-no-read-row {
	font-weight: 700;
}
.dashboard-new-msg {
	display: inline-block;
	background: linear-gradient(225deg, #f9aa39 0%, #ff8431 31%, #fa5e2c 100%);
	border-radius: 2px;
	color: #fff;
	padding: 0px 2px;
	line-height: 10px;
	height: 13px;
}
.dashboard-msg-header {
	color: #222;
}
.msg-detail {
	color: #4a4a4a;
}
.msg-detail .el-form-item__label {
	color: #4a4a4a;
	font-weight: 700;
}
</style>
<style lang="scss" scoped>
.message-cont {
	background-color: #fff;
	margin: 10px 10px 0;
}
.clear-jumproute-fromto-list {
	width: 60px;
	height: 14px;
	position: fixed;
	left: 144px;
	bottom: 0px;
	opacity: 0;
	background: #000;
	line-height: 14px;
	text-align: center;
	color: #fff;
	&:hover {
		opacity: 0.06;
	}
}
</style>
