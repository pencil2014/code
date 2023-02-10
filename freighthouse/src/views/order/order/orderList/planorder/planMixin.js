export const planMixin = {
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
    handleToOrderDetail(row) {
			// this.$router.push({
			// 	name: row.jointNo ? 'JointOrderDetail' : 'OrderDetail',
			// 	params: {
			// 		orderNo: row.orderNo
			// 	},
			// 	query: {
      //     orderNo: row.orderNo,
      //     jointNo: row.jointNo,
			// 		source: 'planOrderList',
			// 		action: ''
			// 	}
      // })
      let routeUrl = this.$router.resolve({
				name: row.jointNo ? 'JointOrderDetail' : 'OrderDetail',
				params: {
					orderNo: row.orderNo,
				},
				query: {
          orderNo: row.orderNo,
          jointNo: row.jointNo,
					source: 'planOrderList',
					action: ''
				}
			})
			window.open(routeUrl.href, '_blank')
    }
  },
}