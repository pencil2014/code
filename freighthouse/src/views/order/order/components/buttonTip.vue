<template>
	<el-tooltip effect="dark" placement="top" :disabled="!btnDisabled" :content="tipContent">
		<div>
			<el-button :type="btnType" size="mini" :class="btnClassName" :disabled="btnDisabled" :loading="loading" @click="handleClick">
				{{btnText}}
				<slot></slot>
			</el-button>
		</div>
	</el-tooltip>
</template>

<script>
import store from '@/store'
export default {
	data() {
		return {
			
		}
	},
	props: ['btnType', 'btnClassName', 'btnText', 'btnDisabled', 'tipContent', 'loading'],
	created() {
		
	},

	mounted() {},
	computed: {
	},
	watch: {
	},
	components: {},
	methods: {
		handleClick() {
			this.$emit('click')
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
