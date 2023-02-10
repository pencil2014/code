<template>
	<div>
		<el-alert type="warning" :closable="true" class="orange changeStyle book-alert">
			<template slot="title">
				<i class="tag-change">调</i>
				<span class="txt">
					<template v-if="isPricing">该订单箱型箱量已调整，请及时审批。
						<span v-if="bookDetailForm.containerModifyInfo.containerAddRemark"> 备注：{{ bookDetailForm.containerModifyInfo.containerAddRemark }} </span>
						<el-button type="danger" size="mini" class="btn-refuse ml10" @click="handleRefuse" 
							v-if="['submit', 'book_refuse'].includes(bookDetailForm.containerModifyInfo.bkgStatus)" style="margin-left: 27px"
						>拒绝</el-button>
					</template>
					<template v-if="isBkg">该订单箱型箱量已调整，请及时修改SO信息并放舱。
						<span v-if="bookDetailForm.containerModifyInfo.containerAddRemark"> 备注：{{ bookDetailForm.containerModifyInfo.containerAddRemark }} </span>
						<el-button type="danger" size="mini" class="btn-refuse ml10" @click="handleRefuse" 
							v-if="!['refuse', 'book_refuse', 'book_release'].includes(bookDetailForm.containerModifyInfo.bkgStatus) && !['break', 'cancel'].includes(bookDetailForm.orderStatus)" 
							style="margin-left: 27px"
						>拒绝</el-button>
					</template>
				</span>
			</template>
		</el-alert>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseDialog :params="bookDetailForm.containerModifyInfo" :isAddCont="isAddCont" @close="refusePopClose" />
		</div>
	</div>
</template>
<script>
import RefuseDialog from '../refuseDialog'
export default {
	data() {
		return {
			// 拒绝弹窗
			refusePopShow: false,
		}
	},
	props: {
		bookDetailForm: {
			type: Object,
			default: () => ({})
		},
    isAddCont: {
      type: Boolean,
      default: false
    }
	},
	created() {},
	mounted() {},
	computed: {
		isPricing() {
			return this.$route.query.roles === 'pricing'
		},
		isBkg() {
			return this.$route.query.roles === 'bkg'
		},
	},
	components: {
		RefuseDialog
	},
	watch: {},
	methods: {
		// 拒绝
		handleRefuse() {
			this.refusePopShow = true
		},
		refusePopClose(action) {
			this.refusePopShow = false
			if (action === 'Confirm') {
				this.handleGoBack()
			}
		},
		handleGoBack() {
			window.close()
		},
	}
}
</script>
<style lang="scss"></style>
