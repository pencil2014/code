<template>
	<span>
		委托单位变更：
		<span size="mini" @click.stop="toDetail(param.orgCustName)" class="custLink">{{ param.orgCustName }}</span>
		修改为 
		<span size="mini" @click.stop="toDetail(param.custName)" class="custLink">{{ param.custName }}</span>
	</span>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	props: ['param', 'item'],
	created() {
	},

	mounted() {},
	computed: {},
	watch: {
	},
	components: {},
	methods: {
		toDetail(name) {
			this.item.method(this.param, name)
		}
	}
}
</script>

<style lang="scss" scoped>
.custLink{
	color: #1890ff;
	cursor: pointer;
}
</style>
