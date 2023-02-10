<template>
	<div class="edit-container order-book fullWrap" id="siBlList">
		<div class="tabs-container" id="blContainer" @scroll="handleScroll">
			<BlList :saveBarFixed="saveBarFixed" :saveBarFixedStyle="saveBarFixedStyle" ref="blList"/>
		</div>
	</div>
</template>
<script>
// import store from '@/store'
import { mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo } from '@/api/order/list'
import BlList from '../../orderBook/components/bl'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			oQuery: this.$route.query,
			saveBarFixed: false,
			saveBarFixedStyle: {},
			blInfoHeight: 0,
			navHeight: 40,
			siTabHeight: 40,
			mtLineHeight: 24
		}
	},
	created() {
		this.getOrderInfo()
	},
	mounted() {
		console.log('🚀 ~ this.serviceInfoList', this.serviceInfoList)
		console.log('🚀 ~ this.serviceList', this.serviceList)
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
	},

	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {
		sidebar() {
      return this.$store.state.app.sidebar
    }
	},
	watch: {
		'sidebar.opened': {
			handler(newVal) {
				if (Object.keys(this.saveBarFixedStyle).length) {
					this.saveBarFixedStyle.left = newVal ? '160px' : '45px'
				}
			}
		}
	},
	components: {
		BlList,
	},
	methods: {
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let siContDom = document.querySelector("#siContainer")
			let blTableCont = document.querySelector("#blTableCont")
			let alertHeight = document.getElementById('alertCont').offsetHeight
			let siOrderTopHeight = document.getElementById('siOrderTop').offsetHeight
			let siStatusHeight = document.getElementById('siStatusCont').offsetHeight
			let scrollTop  = siContDom.scrollTop
			// let offsetTop = saveBarDom.offsetTop
			let blTableContHeight = blTableCont.offsetHeight
			let h = blTableContHeight+alertHeight+siOrderTopHeight+siStatusHeight+this.siTabHeight+this.mtLineHeight
			// let blTableContWidth = blTableCont.offsetWidth
			console.log('blTableContHeight', h, scrollTop)
			if (scrollTop > h) {
				this.saveBarFixed = true
				this.saveBarFixedStyle = {
					left: this.sidebar.opened ? '160px' : '45px',
					top: '30px',
					// width: blTableContWidth + 'px'
					right: '176px'
				}
			} else {
				this.saveBarFixed = false
				this.saveBarFixedStyle = {}
			}
		}
	}
}
</script>

<style lang="scss">
@import '../../../less/index.scss';
// .containerList-cont {
// 	overflow-y: auto;
// }
// .cnDetail-form {
// 	.special-item {
// 		.el-form-item__content {
// 			margin-top: 20px;
// 		}
// 	}
// }
// #siBlList .service-container .edit-row {
// 	margin-top: 8px !important;
// }
// #siBlList .service-container .edit-row .edit-container.so {
// 	padding: 10px;
// }
// #siBlList .component-main-cont{
// 	width: 100%;
// }
#siBlList .tabs-container{
	// overflow-y: auto;
}
#siBlList .edit-container.so{
	padding: 10px;
}
</style>
