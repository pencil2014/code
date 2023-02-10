<template>
	<div class="operate-group">
		<template>
			<el-button
				size="mini"
				v-for="(item, key) in operationBtns.data.slice(0, getLen())"
				:id="item.id ? item.id + scope.$index : ''"
				v-show="displayOperationBtn(item, scope.row, key)"
				:disabled="typeof item.disabled === 'function' ? item.disabled(item, scope.row) : item.disabled"
				:key="key"
				:type="item.type || 'text'"
				:class="item.className || ''"
				@click.native.stop="handleOperate(scope, item, operationBtns, $event)"
			>
				{{ item.label }}
			</el-button>
		</template>

		<template v-if="operationBtns.data.length > getLen()">
			<el-dropdown size="mini" @command="handleOperateDrop">
				<span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item v-for="(item, index) in operationBtns.data.slice(getLen())" :disabled="displayDropBtn(item, scope.row)" :key="index" :command="[scope, item, operationBtns]">
						{{ item.label }}
					</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</template>
	</div>
</template>

<script>
import Config from '@/components/Base/config'
export default {
	name: 'OperationBtn',
	data() {
		return {}
	},
	props: {
		operationBtns: {
			type: Object,
			default: () => ({})
		},
		scope: {
			type: Object,
			default: () => ({})
		},
		callback: {
			type: Function,
			default: () => ({})
		}
	},
	mounted() {},
	components: {},
	computed: {},
	methods: {
		// 显示操作按钮 {操作}
		displayOperationBtn(item, row, key) {
			let { show } = item
			if (typeof show === 'function') {
				return show(item, row)
			}
			return show === false ? false : true
		},

		// 操作回调 {操作}
		handleOperate({ $index, row }, item, { callback = () => {} }, $event) {
			let { action } = item
			callback(action, $index, row, item, $event)
		},

		// 更多按钮 {操作}
		displayDropBtn(item, row) {
			let { show } = item
			if (typeof show === 'function') {
				return !show(item, row)
			}
			return show === false ? true : false
		},

		// 更多按钮 操作回调 {操作}
		handleOperateDrop(params) {
			let scope = params[0]
			let item = params[1]
			let { callback = () => {} } = params[2]
			let { action } = item
			callback(action, scope.$index, scope.row, item)
		},

		getLen() {
			let { len = Config.defeatTableOperationBtnsLen } = this.operationBtns
			return len
		}
	}
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
