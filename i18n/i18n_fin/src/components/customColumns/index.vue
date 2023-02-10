<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback" ref="baseDialog" class="custom-columns-dialog">
		<el-transfer
			class="transferCont"
			v-model="customColumns"
			:target-order="'push'"
			ref="transfer"
			id="transfer"
			filterable
			:filter-placeholder="$t('OrderFee.plsInput')"
			:titles="titles"
			:button-texts="[$t('OrderFee.joinLeft'), $t('OrderFee.joinRight')]"
			:data="columnsBaseAddKey"
			:props="$attrs.props || { key: 'key', label: 'label' }"
			:left-default-checked="hasCheckedWHLeftData"
			@left-check-change="handleWHLeftChange"
			:right-default-checked="hasCheckedWHRightData"
			@right-check-change="handleWHRightChange"
			@change="transferChange"
		>
			<!-- :data="columnsBase" -->
			<el-button type="primary" class="transfer-footer" size="mini" @click="handleSetTop" slot="right-footer">{{$t('OrderFee.oneKeyTop')}}</el-button>
			<span slot="right-footer" class="transfer-footer-tip">{{$t('OrderFee.supportDragSort')}}</span>
			<div slot-scope="{ option }" class="transfer-list-label">
				{{ option.label }}
				<img class="icon-toTop" :src="require('@/assets/icon_toTop.png')" @click.prevent="handleToTop(option)" :title="$t('OrderFee.moveTop')" />
				<img class="icon-up" :src="require('@/assets/icon_up.png')" @click.prevent="handleUp(option)" :title="$t('OrderFee.moveUp')" />
				<img class="icon-down" :src="require('@/assets/icon_down.png')" @click.prevent="handleBottom(option)" :title="$t('OrderFee.moveDown')" />
			</div>
		</el-transfer>
		<!-- 模板名称浮窗 -->
		<el-popover popper-class="search-template-popover" placement="bottom" width="240" v-model="popVisible" @show="showPopver">
			<div class="flex">
				<span class="span-text">{{$t('OrderFee.templateName')}}</span>
				<el-input type="text" size="mini" maxlength="32" show-word-limit v-model="templateName" :placeholder="$t('OrderFee.plsInput')" class="temp-input" style="width: 164px"> </el-input>
			</div>
			<div style="text-align: right; margin: 8px 0 0">
				<el-button size="mini" type="default" @click="handleCancel" class="ui-mini-btn">{{$t('OrderFee.cancel')}}</el-button>
				<el-button type="primary" size="mini" @click="handleSaveTemplate" class="ui-mini-btn">{{$t('OrderFee.confirm')}}</el-button>
			</div>
			<el-button v-if="!hideTemp && showModel" type="primary" class="custom-template-save-btn" slot="reference">{{$t('OrderFee.save')}}</el-button><!-- 模板保存 -->
		</el-popover>
		<div v-if="!hideTemp && showModel" class="custom-dash-line"></div>
		<div v-if="!hideTemp && showModel" class="custom-template-list">
			<span class="custom-template-title">{{$t('OrderFee.headerTemps')}}:</span>
			<div class="custom-template-content">
				<el-tag size="mini" v-for="tag in tags" :key="tag.oid" @close="handleClose(tag)" @click="handleClickTag(tag)" closable>
					{{ tag.tempName }}
				</el-tag>
			</div>
		</div>
	</BaseDialog>
</template>

<script>
import Sortable from 'sortablejs'
import BaseDialog from '@/components/Base/Dialog/index'
import { listColumnConfigTempList, listColumnConfigSave, listColumnConfigTempDelete } from '@/api/base'
import { mapState } from 'vuex'

export default {
	data() {
		return {
			tags: [],
			popVisible: false,
			templateName: '',
			dialogConfig: {
				title: this.title ? this.title : this.$t('OrderFee.customHeader'), // '自定义表头',
				show: true,
				width: '820px',
				btns: [
					{ label: this.$t('OrderFee.confirm'), action: 'Confirm', type: 'primary' },
        	{ label: this.$t('OrderFee.cancel'), action: 'Cancel' },
				]
			},
			titles: this.columnsTitle ? this.columnsTitle : [this.$t('OrderFee.headerLibrary'), this.$t('OrderFee.customHeader')], // ['可选表头库', '自定义表头'],
			// 自定义表头
			customColumns: JSON.parse(JSON.stringify(this.configColumns)),
			shiftKey: false,
			firstWHLeftLocation: -1, //数据左边起始值
			lastWHLeftLocation: -1, //数据左边终止值
			hasCheckedWHLeftData: [], //数据左边选中的数据
			firstWHRightLocation: -1, //数据右边起始值
			lastWHRightLocation: -1, //数据右边终止值
			hasCheckedWHRightData: [] //数据右边选中的数据
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
    showModel: {
      type: Boolean,
      default: true
    },
	},
	created() {
		console.log(this.customColumns)
		this.getTemplateList()
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
			userId: state => state.user.userId
		}),
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
		},
		hideTemp() {
			let modules = ['/finance', '/crm', '/baseData', '/companyResource']
			let routes = []
			let path = this.$route.path
			let name = this.$route.name
			let isHideModule = modules.some(item => {
				return path.startsWith(item)
			})
			let isHideRoute = routes.some(item => {
				return name === item
			})
			if (isHideModule || isHideRoute) {
				return true
			} else {
				return false
			}
		}
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getTemplateList() {
			listColumnConfigTempList({
				employeeId: this.userId,
				scenesCode: this.$route.name
			}).then(res => {
				if (res.data) {
					this.tags = res.data
				} else {
					this.tags = []
				}
			})
		},
		handleClickTag(tag) {
			console.log('🚀 ~ tag', tag)
			this.customColumns = tag.columnList
		},
		handleClose(tag) {
			listColumnConfigTempDelete({ oid: tag.oid }).then(() => {
				this.getTemplateList()
			})
		},
		showPopver() {
			this.templateName = ''
		},
		// 取消关闭elpopover
		handleCancel() {
			this.popVisible = false
		},
		// 保存模板
		handleSaveTemplate() {
			console.log('🚀 ~ this.templateName', this.templateName)
			console.log(this.customColumns)
			if (!this.templateName) return this.$message.error(this.$t('OrderFee.tempNameNotEmpty')) // 模板名称不能为空!
			listColumnConfigSave({
				employeeId: this.userId,
				scenesCode: this.$route.name,
				columnList: this.customColumns,
				tempName: this.templateName
			}).then(() => {
				this.getTemplateList()
				this.popVisible = false
			})
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
			// _this.hasCheckedWHLeftData = _this.commonChangeFuc(
			//   key,
			//   key1,
			//   _this.hasCheckedWHLeftData,
			//   _this.firstWHLeftLocation,
			//   _this.lastWHLeftLocation,
			//   _this.columnsBase,
			//   "key"
			// );
			// console.log(_this.hasCheckedWHLeftData);
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
			var _this = this
			var cFlag = false //取消勾选
			for (var i = 0; i < key.length; i++) {
				if (key[i] == key1[0]) {
					cFlag = true //选中
				}
			}
			if (cFlag) {
				if (key.length == 1) {
					firstLocation = 0
					hasCheckedData.push(key[0])
				} else if (key.length > 1) {
					let arr = []
					// 当前有选中数据 并且 按住shift
					if (_this.shiftKey) {
						// if (isRight) {
						for (let i = 0; i < arrList.length; i++) {
							let item = value ? arrList[i][value] : arrList[i]
							if (item == key[key.length - 2]) {
								firstLocation = i
							}
							if (item == key1[0]) {
								lastLocation = i
							}
						}
						if (firstLocation != -1 && lastLocation != -1) {
							if (firstLocation < lastLocation) {
								for (var k = 0; k < arrList.length; k++) {
									let item = value ? arrList[k][value] : arrList[k]

									if (k >= firstLocation && k <= lastLocation) {
										hasCheckedData.push(item)
									}
								}
							} else if (firstLocation > lastLocation) {
								for (var k = 0; k < arrList.length; k++) {
									if (k >= lastLocation && k <= firstLocation) {
										hasCheckedData.push(item)
									}
								}
							}
						}
					} else {
						//不再按shift
						hasCheckedData.push(key1[0])
					}
				}
			} else {
				//取消选中的
				hasCheckedData = []
				for (var i = 0; i < key.length; i++) {
					if (key[i] != key1[0]) {
						hasCheckedData.push(key[i])
					}
				}
			}
			// 去重
			hasCheckedData = new Set(hasCheckedData)
			hasCheckedData = Array.from(hasCheckedData)
			return hasCheckedData
		},
		close(action, value) {
			this.$emit('close', action, value)
		},

		validate() {
			return true
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				if (this.validate() !== true) return
				this.handleCustomColumns(done)
			} else {
				this.close('Cancel')
			}
		},
		// 确定提交
		handleCustomColumns(done) {
			console.log('自定义表头提交', this.customColumns)
			if (!this.customColumns.length) {
				return this.$message.error(this.$t('OrderFee.plsCustomizeHeader')) // 请选择自定义表头
			}
			done()
			// 财务模块所有列表，左侧如果有禁用选项，提交时自动移入右侧
			if (this.$route.path.slice(1, 8) === 'finance') {
				let leftData = this.columnsBaseAddKey.filter(item => !this.customColumns.includes(item.prop))
				let leftDisableData = leftData.filter(item => item.disabled)
				this.customColumns.unshift(...leftDisableData.map(item => item.prop))
			}
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
	// padding: 0 50px;
  .el-button{
    padding: 1px 7px;
    height: 24px;
  }
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
	// padding: 8px 15px;
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
}
</style>
