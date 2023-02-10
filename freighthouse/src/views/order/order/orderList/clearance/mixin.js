import {mapState} from 'vuex'
export const mixin = {
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceList: state => state.order.serviceList,
			serviceInfoList: state => state.order.serviceInfoList,
			userEditRoles: state => state.order.orderList.userEditRoles,
    }),
    isAc() {
			return this.ordDetRole === 'ac'
		},
    isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpTruck() {
			// return this.ordDetRole === 'op_truck'
			return this.userEditRoles.includes('op_truck')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		viewState() {
			return this.$route.query.action === 'view' && !this.isOp
		},
		jointState() {
			return this.$route.query.source === 'jointList' ? true : false
		}
  },
  methods: {
    validateNum(val, row) {
			const intReg = /^\d+(?=\.{0,1}\d+$|$)/
			if (row[val] && !intReg.test(row[val])) {
				row[val] = ''
				return this.$message.error('请输入正确的件数')
			}
			if (row[val] > 9999999) {
				row[val] = 9999999
				this.$message.error('最大不能超过9999999!')
			}
		},
		validateVolumeWeight(val, row) {
			// 体积重量保存为小数点后3位
			const pReg = /^\d+(\.\d+)?$/
			if (!row[val]) return
			row[val] = Number(row[val])
			if (!pReg.test(row[val])) {
				row[val] = ''
				let message = ''
				switch (val) {
					case 'volume':
						message = '体积'
						break
					case 'weight':
						message = '重量'
						break
				}
				return this.$message.error('请输入正确的' + message)
			}
			if (row[val] > 999999) {
				row[val] = 999999
				this.$message.error('最大不能超过999999!')
			}
			let str = row[val].toString()
			let pointIndex = str.indexOf('.')
			if (pointIndex !== -1) {
				row[val] = str.substring(0, pointIndex + 4)
			}
		},
  }
}