<template> </template>

<script>
export default {
	data() {
		return {}
	},
	created() {},
	mounted() {},

	computed: {},
	props: {},
	components: {},
	filters: {
		keyNoFilter(val) {
			if (val) {
				let keyNoArr = val.split('_')
				if (keyNoArr.length > 1) {
					return keyNoArr.slice(0, keyNoArr.length - 1).join('，')
				} else {
					return keyNoArr.join()
				}
			}
			return ''
		}
	},
	methods: {}
}
</script>

<style lang="scss">
.dashboard-table-wrap {
	max-height: 400px;
	overflow-y: auto;
}
</style>
