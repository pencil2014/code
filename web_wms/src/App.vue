<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import store from '@/store'

export default {
	components: {},
	name: 'App',
	data() {
		return {}
	},
	mounted() {},

	methods: {},
	created() {
		store.dispatch('app/setSPartWidth', 0)
		store.dispatch('app/setTPartHeight', 0)
	},
	destroyed() {}
}
</script>
<style>
/* 解决下拉框选项过长 撑满整个屏幕问题 */
.el-select-dropdown__list {
	max-width: 50vw;
}
.notice-wrap .el-notification__group {
	flex: 1;
}
</style>
