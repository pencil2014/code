<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback" ref="baseDialog" class="custom-columns-dialog">
	  <el-tabs v-if="isManager" v-model="activeName" @tab-click="handleClick">
			<el-tab-pane label="个人表头" name="person"></el-tab-pane>
			<el-tab-pane label="部门表头" name="dept"></el-tab-pane>
		</el-tabs>
		<el-transfer
			class="transferCont"
			v-model="customColumns"
			:target-order="'push'"
			ref="transfer"
			id="transfer"
			filterable
			filter-placeholder="请输入"
			:titles="titles"
			:button-texts="['加入左侧', '加入右侧']"
			:data="columnsBaseAddKey"
			:props="$attrs.props || { key: 'key', label: 'label' }"
			:left-default-checked="hasCheckedWHLeftData"
			@left-check-change="handleWHLeftChange"
			:right-default-checked="hasCheckedWHRightData"
			@right-check-change="handleWHRightChange"
			@change="transferChange"
		>
			<!-- :data="columnsBase" -->
			<el-button type="primary" class="transfer-footer" size="mini" @click="handleSetTop" slot="right-footer">一键置顶</el-button>
			<span slot="right-footer" class="transfer-footer-tip">表头支持拖动排序</span>
			<div slot-scope="{ option }" class="transfer-list-label">
				{{ option.label }}
				<img class="icon-toTop" :src="require('@/assets/icon_toTop.png')" @click.prevent="handleToTop(option)" title="置顶" />
				<img class="icon-up" :src="require('@/assets/icon_up.png')" @click.prevent="handleUp(option)" title="往上移" />
				<img class="icon-down" :src="require('@/assets/icon_down.png')" @click.prevent="handleBottom(option)" title="往下移" />
			</div>
		</el-transfer>
	</BaseDialog>
</template>

<script>
import Sortable from 'sortablejs'
import BaseDialog from '@/components/Base/Dialog/index'
import { listColumnConfigDeptConfig, listColumnConfigDeptSave } from '@/api/base'
import { mapState } from 'vuex'

export default {
	data() {
		return {
			dialogConfig: {
				title: this.title ? this.title : '自定义表头',
				show: true,
				width: '820px',
				btns: [
					{ label: '确定', action: 'Confirm', type: 'primary' },
          { label: '取消', action: 'Cancel' },
				]
			},
			titles: this.columnsTitle ? this.columnsTitle : ['可选表头库', '自定义表头'],
			// 自定义表头
			customColumns: [],
			transitionCustomColumns: [],
			personCustomColumns: JSON.parse(JSON.stringify(this.configColumns)),
			shiftKey: false,
			firstWHLeftLocation: -1, //数据左边起始值
			lastWHLeftLocation: -1, //数据左边终止值
			hasCheckedWHLeftData: [], //数据左边选中的数据
			firstWHRightLocation: -1, //数据右边起始值
			lastWHRightLocation: -1, //数据右边终止值
			hasCheckedWHRightData: [], //数据右边选中的数据
			activeName: 'person',
			deptCustomColumns: []
		}
	},
	props: {
		configColumns: {
			type: Array,
			default: () => []
		},
		columnsBase: {
			type: Array,
			defalut: () => []
		},
		title: {
			type: String,
			default: ''
		},
		columnsTitle: {
			type: Array,
			defalut: () => []
		},
		scenesCode: {
			type: String,
			default: ''
		},
	},
	created() {
		this.customColumns = JSON.parse(JSON.stringify(this.personCustomColumns))
	},
	mounted() {
		this.$nextTick(() => {
			window.addEventListener('keydown', e => {
				if (e.keyCode === 16 && e.shiftKey) {
					this.shiftKey = true
				}
			})
			window.addEventListener('keyup', e => {
				this.shiftKey = false
			})

			let el = this.$refs.transfer.$el.querySelectorAll('.el-checkbox-group')[1]
			console.log(el)

			new Sortable(el, {
				forceFallback: false,
				// 禁止拖动禁止项，首项一般为固定在左侧，不调换位置比较好
				// filter:'.is-disabled',
				onUpdate: event => {
					let box = this.$refs.transfer.$el.querySelectorAll('.el-checkbox-group')[1]
					let nums = this.$refs.transfer.$el.querySelectorAll('.el-checkbox-group')[1].childNodes.length
					console.log(nums, event.newIndex)
					if (event.newIndex >= nums) {
						return
					}
					let newIndex = event.newIndex
					let oldIndex = event.oldIndex
					let $label = box.children[newIndex]
					let $oldLabel = box.children[oldIndex]
					box.removeChild($label)
					if (newIndex < oldIndex) {
						box.insertBefore($label, $oldLabel)
					} else {
						box.insertBefore($label, $oldLabel.nextSibling)
					}
					let item = this.customColumns.splice(oldIndex, 1)
					this.customColumns.splice(newIndex, 0, item[0])
				}
				// 未能阻止可拖动元素与不可拖动元素互换位置，待解决
				// onMove: (event, originalEvent)=>{
				//   console.log(originalEvent?.target?.parentNode?.className?.indexOf('is-disabled')>-1);
				//   if(originalEvent?.target?.parentNode?.className?.indexOf('is-disabled')>-1) return false
				// }
			})
		})
	},
	computed: {
		...mapState({
			userId: state => state.user.userId,
			userInfo: state => state.user.userInfo,
			roles: state => state.user.roles
		}),
		isManager() {
      return this.roles.includes('manager')
    },
		// 组件外层会有v-if判断，此计算属性只会显示时触发一次，验证订单模块未发现异常
		// 财务模块利用prop值，不是利用key值，上下移动时利用key值，判断无key值，则将prop值赋值给key
		columnsBaseAddKey() {
			return this.columnsBase
				.filter(item => !item.customColumnHide)
				.map(item => {
					let obj = {}
					if (!item.key) {
						if (!item.prop) console.log('`````````表格配置项需添加key或prop', item)
						obj.key = item.prop
					}
					return { ...item, ...obj }
				})
		}
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		handleClick(tab, event) {
			this.transitionCustomColumns = JSON.parse(JSON.stringify(this.customColumns))
			if (this.activeName === 'dept') {
				this.dialogConfig.btns = [
					{ label: '保存部门模板', action: 'DeptConfirm', type: 'primary' },
          { label: '取消', action: 'Cancel' },
				]
				this.personCustomColumns = JSON.parse(JSON.stringify(this.transitionCustomColumns))
				if (this.deptCustomColumns.length) {
					this.customColumns = JSON.parse(JSON.stringify(this.deptCustomColumns))
				} else {
          listColumnConfigDeptConfig({
						scenesCode: this.scenesCode,
						deptCode: this.userInfo.deptCode
					})
					.then(res => {
						if (res.data && res.data.columnList && res.data.columnList.length) {
							this.deptCustomColumns = res.data.columnList || []
							this.customColumns = JSON.parse(JSON.stringify(res.data.columnList))
						} else {
							this.customColumns = JSON.parse(JSON.stringify(this.personCustomColumns))
						}
					})
				}
			} else {
				this.dialogConfig.btns = [
					{ label: '确定', action: 'Confirm', type: 'primary' },
          { label: '取消', action: 'Cancel' },
				]
				this.deptCustomColumns = JSON.parse(JSON.stringify(this.transitionCustomColumns))
				this.customColumns = JSON.parse(JSON.stringify(this.personCustomColumns))
			}
		},
		// 单个置顶
		handleToTop(option) {
			// if (option.disabled) return
			// console.log('置顶', option)
			// console.log(this.customColumns)
			let oldIndex = this.customColumns.indexOf(option.key)
			if (oldIndex === 0) return
			let item = this.customColumns.splice(oldIndex, 1)
			this.customColumns.splice(0, 0, item[0])
		},
		// 往上移一格
		handleUp(option) {
			// if (option.disabled) return
			console.log('向上移一格', option)
			// console.log(this.customColumns)
			let oldIndex = this.customColumns.indexOf(option.key)
			if (oldIndex === 0) return
			let item = this.customColumns.splice(oldIndex, 1)
			this.customColumns.splice(oldIndex - 1, 0, item[0])
		},
		// 往下移一格
		handleBottom(option) {
			// if (option.disabled) return
			// console.log('向下移一格')
			// console.log(this.customColumns)
			let oldIndex = this.customColumns.indexOf(option.key)
			let item = this.customColumns.splice(oldIndex, 1)
			this.customColumns.splice(oldIndex + 1, 0, item[0])
		},
		// 置顶按钮
		handleSetTop() {
			let filterColumns = this.customColumns.filter(item => !this.hasCheckedWHRightData.includes(item))
			this.customColumns = this.hasCheckedWHRightData.concat(filterColumns)
		},
		transferChange(a) {
			console.log('转移了的方向', a)
			var _this = this
			_this.hasCheckedWHRightData = []
			_this.hasCheckedWHLeftData = []
		},
		// 数据左侧列表元素被用户选中 / 取消选中时触发
		handleWHLeftChange(key, key1) {
			var _this = this
			console.log(_this.hasCheckedWHLeftData)
		},
		// 数据右侧列表元素被用户选中 / 取消选中时触发
		handleWHRightChange(key, key1) {
			var _this = this
			console.log(_this.hasCheckedWHRightData)
			_this.hasCheckedWHRightData = _this.commonChangeFuc(key || [], key1, _this.hasCheckedWHRightData, _this.firstWHRightLocation, _this.lastWHRightLocation, _this.customColumns, false)
			console.log(_this.hasCheckedWHRightData)
		},
		// 公共按住shift 多选  有复选框，shift不再使用
    // key的顺序是选择的顺序，要处理为显示的顺序，即customColumns中的顺序
		commonChangeFuc(key, key1, hasCheckedData, firstLocation, lastLocation, arrList, value) {
      return arrList.filter(item => key.find(v => v === item))
		},
		close(action, value) {
			this.$emit('close', action, value)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.handleCustomColumns(done)
			} else if (action === 'DeptConfirm') {
        listColumnConfigDeptSave({
					scenesCode: this.scenesCode,
					columnList: this.customColumns,
					deptCode: this.userInfo.deptCode
				})
				.then(res => {
					this.$message.success('部门表头保存成功')
				})
			} else {
				this.close('Cancel')
			}
		},
		// 确定提交
		handleCustomColumns(done) {
			console.log('自定义表头提交', this.customColumns)
			if (!this.customColumns.length) {
				return this.$message.error('请选择我的跟进项')
			}
			done()
			this.close('Confirm', this.customColumns)
		}
	}
}
</script>

<style lang="scss">
.transferCont {
	margin: 0 auto;
	text-align: center;
	margin-bottom: 18px;
}
.transferCont .el-transfer-panel__header {
	height: 30px;
	line-height: 30px;
	padding-left: 10px;
}
.transferCont .el-transfer-panel {
	overflow: visible;
	width: 218px;
	text-align: left;
}
.transferCont .el-transfer-panel__body {
	height: 285px;
}
.transferCont .el-transfer-panel__list .el-checkbox {
	margin-right: 0;
}
.transferCont .el-transfer-panel__list .el-checkbox {
	.icon-up,
	.icon-down,
	.icon-toTop {
		display: none;
	}
}
.transferCont .el-transfer-panel__list .el-checkbox:hover {
	background-color: #f4f7ff;
}
// .transferCont div:nth-child(3) .el-transfer-panel__list .el-checkbox{
//   cursor: move;
// }
.transferCont div:nth-child(3) .el-transfer-panel__list .el-checkbox:hover {
	.icon-up,
	.icon-down,
	.icon-toTop {
		color: #3e80f5;
		display: inline-block;
	}
}
.transferCont .el-transfer-panel__list.is-filterable {
	height: 245px;
}
.transferCont .el-transfer-panel__filter {
	margin: 10px;
}
.transferCont .el-transfer-panel .el-transfer-panel__header .el-checkbox {
	line-height: 30px;
}
.transferCont .el-transfer-panel .el-transfer-panel__header .el-checkbox .el-checkbox__label {
	font-size: 14px;
}
.transferCont .el-transfer-panel__filter .el-input__inner {
	border-radius: 4px;
	height: 20px;
	line-height: 20px;
}
.transferCont .el-transfer-panel__filter .el-input__prefix {
	left: 0;
	line-height: 20px;
}
.transferCont .el-transfer-panel__filter.el-input--prefix .el-input__inner {
	padding-left: 30px;
}
.transferCont .el-transfer-panel__item {
	padding-left: 10px;
	height: 28px;
	line-height: 28px;
}
.transferCont .el-transfer-panel__item.el-checkbox .el-checkbox__label {
	line-height: 28px;
}
.el-checkbox__label {
	font-size: 12px;
}
.transferCont .el-checkbox__input.is-disabled + span.el-checkbox__label {
	cursor: pointer;
}
.transferCont .el-transfer__buttons {
	padding: 0 50px;
}
.transferCont .el-transfer__button {
	// width: 72px;
	// height: 31px;
	// line-height: 31px;
	// display: block;
	// background-color: none;
	// border-color: none;
	// border: none;
	// padding: 0;
	// font-size: 12px;
	padding: 8px 15px;
}
// .transferCont {
//   .el-button + .el-button {
//     margin-left: 0;
//   }
// }
.transferCont .el-transfer-panel .el-transfer-panel__footer {
	bottom: -29px;
	height: 30px;
}
.transferCont .transfer-footer {
	margin: 3px 0 0 0;
}
.transferCont .transfer-footer-tip {
	font-size: 12px;
	line-height: 16px;
	color: #888;
	text-align: right;
	float: right;
	// display: block;
	margin: 3px 0 0 0;
}
.transferCont .transfer-list-label {
	position: relative;
	img {
		position: absolute;
		line-height: 12px;
		height: 12px;
		width: 12px;
		top: 8px;
		z-index: 8;
	}
	.icon-toTop {
		right: 45px;
	}
	.icon-up {
		right: 25px;
	}
	.icon-down {
		right: 5px;
	}
}
.custom-columns-dialog .el-dialog__body {
	padding: 30px 20px;
	position: relative;
	.custom-template-save-btn {
		position: absolute;
		top: 215px;
		left: 417px;
		padding: 8px 28px 8px 16px;
	}
	.custom-dash-line {
		border-top: 1px dashed #dcdfe6;
		margin: 30px 14px 0 11px;
	}
	.custom-template-list {
		margin: 10px 14px 0 11px;
		.custom-template-title {
			margin-bottom: 10px;
			display: inline-block;
			font-size: 14px;
			font-weight: 400;
		}
		.custom-template-content {
			.el-tag {
				margin-right: 10px;
				cursor: pointer;
			}
		}
	}
	.el-input--small .el-input__icon {
		line-height: 20px;
	}
}
</style>
