<template>
	<div>
		<el-alert type="warning" :closable="true" class="orange changeStyle book-alert">
			<template slot="title">
				<i class="tag-change">改</i>
				<span class="txt">
					<template v-if="isPricing">该船信息已修改，请及时审批。</template>
					<template v-if="isBkg">该船信息已修改，请及时修改SO信息并放舱。</template>
					<el-popover placement="top" width="680" trigger="click" class="changeShip" v-model="changeShipVisible">
						<ChangeInfo ref="changeInfo" :hisData="hisData" :newData="newData" />
						<div class="operate-group-popover">
							<el-button type="default" size="mini" class="btn-close-popover" @click="changeShipVisible = false">
								关闭
							</el-button>
						</div>
						<em slot="reference" class="info">修改详情</em>
					</el-popover>
					<template v-if="isPricing">
						<el-button 
							type="danger" 
							size="mini" 
							class="btn-refuse ml10" 
							@click="handleRefuse" 
							v-if="['submit', 'book_refuse'].includes(bookDetailForm.portModifyInfo.bkgStatus)"
						>拒绝</el-button>
					</template>
					<template v-if="isBkg">
						<el-button 
							type="danger" 
							size="mini" 
							class="btn-refuse ml10"
							@click="handleRefuse" 
							v-if="!['refuse', 'book_refuse', 'book_release'].includes(bookDetailForm.portModifyInfo.bkgStatus) && !['break', 'cancel'].includes(bookDetailForm.orderStatus)"
						>拒绝</el-button>
					</template>
				</span>
			</template>
		</el-alert>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseDialog :params="bookDetailForm.portModifyInfo" :isChange="isChange" @close="refusePopClose" />
		</div>
	</div>
</template>
<script>
import ChangeInfo from '../changeInfo'
import RefuseDialog from '../refuseDialog'
export default {
	data() {
		return {
			changeShipVisible: false,
			// 拒绝弹窗
			refusePopShow: false,
		}
	},
	props: {
		newData: {
      type: Object,
      default: () => ({})
    },
    hisData: {
      type: Object,
      default: () => ({})
		},
		bookDetailForm: {
			type: Object,
			default: () => ({})
		},
		isChange: {
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
		ChangeInfo,
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
