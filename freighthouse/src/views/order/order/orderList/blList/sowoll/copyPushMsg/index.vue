<template>
	<div class="copy-push-cont">
		<img :src="require(`@/views/order/order/images/sw/logo-header.png`)" class="logo-header"/>
		<img :src="require(`@/views/order/order/images/sw/icon-copy-success.png`)" class="icon-success" alt="" v-if="isSuccess">
		<img :src="require(`@/views/order/order/images/sw/icon-copy-fail.png`)" class="icon-fail" alt="" v-else>
		<div class="text">{{text}}</div>
		<div class="bottom">
			<img :src="require(`@/views/order/order/images/sw/logo-footer.png`)" class="logo-footer"/>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'

export default {
	props: {
	},
	data() {
		return {
			text: '',
			isSuccess: false
		}
	},
	async created() {
		this.getCopyConifrm()
	},
	mounted() {
	},
	watch: {
	},
	computed: {
		// ...mapState({
		// 	speciesStrArr: state => state.order.speciesStrArr,
		// }),
	},
	components: {
	},
	methods: {
		getCopyConifrm() {
			let { orderNo, blId, timeStamp, key } = this.$route.query
			let res = this.$store.dispatch('order/getCustBlcopyConfirm', {orderNo,
				blId,
				timeStamp,
				key
			}).then(res => {
				let { data } = res
				if (data.code === 0) {
					this.isSuccess = true
					this.text = 'copy件确认成功'
				} else {
					this.text = data.msg
					this.isSuccess = false
				}
			}).catch(err => {
				console.log(err);
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.copy-push-cont {
	position: relative;
	width: 100%;
	margin: 0 auto;
	height: 100%;
	padding-top: 43px;
	box-sizing: border-box;
	background-image: url('../../../../images/sw/bg.png');
	background-repeat: no-repeat;
	background-position: top right;
	.logo-header{
		width: 88px;
		height: 24px;
		margin: 0 0 0 24px;
		display: block;
	}
	.icon-success{
		width: 111px;
		height: 110px;
		margin: 100px auto 0;
		display: block;
	}
	.icon-fail{
		width: 111px;
		height: 110px;
		margin: 100px auto 0;
		display: block;
	}
	.text {
		text-align: center;
		font-size: 24px;
		color: #222222;
		line-height: 24px;
		margin: 40px auto 0;
		&.fail {
			color: #F25E5E;
		}
	}
	.bottom {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 58px;
		background: #0092A0;
		text-align: center;
		.logo-footer {
			width: 125px;
			height: 34px;
			margin: 12px auto 0;
		}
	}
}
</style>
