import {mapState} from 'vuex'
export const mixin = {
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.airTransport.orderList.ordDetRole,
			serviceList: state => state.airTransport.serviceList,
			roles: (state) => state.user.roles,
      airOrderInfo:(state) => state.airTransport.airOrderInfo ||{}
    }),
		viewState() {
			return this.$route.query.action === 'view' && !this.isOp
		},
		jointState() {
			return this.$route.query.source === 'jointList' ? true : false
		},
		isOp() {
      return this.ordDetRole === 'op'
    },
    isBd() {
      return this.ordDetRole === 'bd'
    },
    isPricing() {
      return this.roles.includes('pricing')
    },
  },
  methods: {
    
  }
}