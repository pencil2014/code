<template>
	<vxe-column type="checkbox"
		:resizable="true"
		:fixed="options.mutiSelectFixed ? 'left' : 'left'"
		width="36"
		v-if="options.mutiSelect || false" 
		:selectable="checkSelectable">
	</vxe-column>
</template>

<script>
export default {
	name: 'MutiSelect',
	data() {
		return {
		}
	},
	props: {
		options: {
			type: Object,
			default: () => ({})
		}
	},
	mounted() {
	},
	components: {
	},
	computed: {
	},
	methods: {
		checkSelectable(row) {
			let {checkSelectable} = this.options
			if (checkSelectable) {
				return checkSelectable(row)
			}
			return false;
		}
	}
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
