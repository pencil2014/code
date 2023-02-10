export const quantityMixin = {
  data() {
    return {
    }
  },
  mounted() {
  },
  methods: {
		//输入件数大于9999999时候 重新赋值为9999999
		validateQuantity(val, row) {
			const intReg = /^\d+(?=\.{0,1}\d+$|$)/
			if (row[val] && !intReg.test(row[val])) {
				row[val] = ''
				return this.$message.error('请输入正确的件数')
			}
			if (row[val] > 9999999) {
				this.$message.error('最大不能超过9999999!')
				row[val] = 9999999
			}
		},
    validateNum(val, row) {
			const intReg = /^[0-9]\d*$/
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
					case 'feeWeight':
						message = '总计费吨'
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
		// 箱量
		validateContainerNum(item){
			const intReg= /^[0-9]\d*$/
			if (!intReg.test(item.containerNum) && item.containerNum) {
				item.containerNum = ''
				return this.$message.error('请输入数字值')
			}
			if (item.containerNum > 200) {
				item.containerNum = 200
				this.$message.error('最大不能超过200')
			}
		},
		// 箱型箱量件数
		validateQuantityNum(item){
			const intReg= /^\d+(?=\.{0,1}\d+$|$)/
			if (item.quantity && !intReg.test(item.quantity)) {
				item.quantity = ''
				return this.$message.error('请输入正确的件数')
			}
			if (item.quantity > 9999999) {
				item.quantity = 9999999
				this.$message.error('最大不能超过9999999')
			}
		},
		// 特种长宽高
		validateSpecial(item, val){
			if (!item[val]) return
			item[val] = Number(item[val])
			const reg = /^\d+(\.\d+)?$/
			if (!reg.test(item[val])) {
				item[val] = ''
				let message = '数字'
				switch (val) {
					case 'specialLength':
						message = '特种长'
						break
					case 'specialHeight':
						message = '特种高'
						break
					case 'specialWidth':
						message = '特种宽'
						break
					default:
						break
				}
				return this.$message.error('请输入正确的' + message)
			}
			if (item[val] > 999999) {
				item[val] = 999999
				this.$message.error('最大不能超过999999')
			}
			let str =  item[val].toString()
			let pointIndex = str.indexOf('.')
			if (pointIndex !== -1) {
				item[val] = str.substring(0, pointIndex + 3)
			}
		},
		validateVolume(item){
			if (!item.volume) return
			item.volume = Number(item.volume)
			const reg= /^\d+(\.\d+)?$/
			if (!reg.test(item.volume)) {
				item.volume = ''
				return this.$message.error('请输入正确的单柜体积')
			}
			if (item.volume > 100) {
				item.volume = 100
				this.$message.error('最大不能超过100')
			}
			let str =  item.volume.toString()
			let pointIndex = str.indexOf('.')
			if (pointIndex !== -1) {
				item.volume = str.substring(0, pointIndex + 4)
			}
		},
		validateWeight(item){
			if (!item.weight) return
			item.weight = Number(item.weight)
			const reg= /^\d+(\.\d+)?$/
			if (!reg.test(item.weight)) {
				item.weight = ''
				return this.$message.error('请输入正确的单柜重量')
			}
			if (item.weight > 53000) {
				item.weight = 53000
				this.$message.error('最大不能超过53000')
			}
			let str =  item.weight.toString()
			let pointIndex = str.indexOf('.')
			if (pointIndex !== -1) {
				item.weight = str.substring(0, pointIndex + 4)
			}
		},
		validateTemprature(item, val){
			const reg= /^\-?[0-9]\d*\.?\d*$/
			if (!reg.test(item[val]) && item[val]) {
				item[val] = ''
				let message = '温度'
				if (val === 'airMete') message = '通风量'
				return this.$message.error(`请输入正确的${message}`)
			}
		},
  },
}