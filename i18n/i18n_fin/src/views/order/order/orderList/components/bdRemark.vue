<template>
	<div>
		<el-input type="text" size="mini" v-model="param.bdRemark" placeholder="请输入" @focus.stop="handleClickBdRemark"></el-input>
		<!-- <div class="column-text" v-else>{{param.bdRemark}}</div> -->
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
export default {
	data() {
		return {
		}
	},
	props: ['param', 'item'],
	created() {
	},

	mounted() {},
	computed: {
		...mapState({
      dictMap: (state) => state.dict.dictMap,
			roles: (state) => state.user.roles,
			userId: (state) => state.user.userId,
			currRole: state => state.order.currRole
    }),
	},
	watch: {},
	components: {
	},
	methods: {
		// 打开弹窗
		handleClickBdRemark() {
			this.item.method(this.param)
		}
	}
}
</script>

<style lang="scss">

</style>
