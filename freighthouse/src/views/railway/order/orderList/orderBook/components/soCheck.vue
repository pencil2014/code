<template>
	<div class="soCheck-cont">
		<div class="row">
			<div class="tit">SO核对</div>
			<div class="operate-btns">
				<el-button type="primary" size="mini" class="ml10" @click="handleSoCheck('y')">正确</el-button>
				<el-button type="danger" size="mini" class="ml10" @click="handleSoCheck('n')">错误</el-button>
				<el-button type="default" size="mini" class="ml10" @click="handleCancel">返回</el-button>
			</div>
		</div>
		<div class="soCheck-info">
			<div class="list-info">
				<div class="detail" style="height: 624px; overflow-y: auto;">
					<div class="tit">订单信息</div>
					<div class="info-row">
						<div class="item">SO: {{$route.query.so}}</div>
						<div class="item">箱型箱量: {{$route.query.containerInfo}}</div>
					</div>
					<div class="info-row barge">
						<template v-if="orderInfoData.barge">
							<div class="item">驳船收货地: {{orderInfoData.barge.porPortName}}</div>
							<div class="item">驳船截关时间: {{orderInfoData.barge.cyCutOff}}</div>
							<div class="item full">驳船预计开船时间: {{orderInfoData.barge.etdTime}}</div>
						</template>
						<div class="item">大船起运港: {{orderInfoData.ship.polPortName}}</div>
						<div class="item">大船截关时间: {{orderInfoData.ship.cyCutOff}}</div>
						<div class="item full">大船预计开船时间: {{orderInfoData.ship.etdTime}}</div>
						<div class="item">中转港: {{orderInfoData.ship.transitPortName}}</div>
						<div class="item">卸货港: {{orderInfoData.ship.unloadingPortName}}</div>
						<div class="item full">目的地: {{orderInfoData.ship.podPortName}}</div>
						<div class="item">国家: {{countryName}}</div>
					</div>
					<div class="info-row">
						<div class="item">中文品名: {{cname}}</div>
						<div class="item">英文品名: {{ename}}</div>
						<div class="item">重量合计: {{containerTotal.weight}}KGS</div>
					</div>
					<div class="info-row barge">
						<div class="item full">船公司: {{orderInfoData.ship.shipCarrierCode}}</div>
						<div class="item">合约号: {{orderInfoData.ship.contractNo}}</div>
						<div class="item">价格有效期: {{orderInfoData.ship.chargeEffectiveDate}}</div>
						<div class="item" v-if="orderInfoData.barge">驳船中转方式: {{getTransitWay(orderInfoData.barge)}}</div>
						<div class="item">付款方式: {{orderInfoData.payMode | payModeFilter}}</div>
					</div>
					<div class="info-row">
						<div class="item">委托备注: {{orderInfoData.intrustRemark}}</div>
					</div>
					<div class="info-row">
						<div class="item">审单备注: {{orderInfoData.auditRemark}}</div>
					</div>
				</div>
			</div>
			<div class="list-info">
				<div class="detail" style="height: 624px">
					<div class="tit">SO信息</div>
					<iframe
						:src="$route.query.soFileUrl"
						id="soFrame"
						frameborder="0"
						width="100%"
						height="600px"
						scrolling="auto"
					></iframe>
				</div>
			</div>
			<div class="list-info" v-if="fileBookUrl">
				<div class="detail" style="height: 624px">
					<div class="tit">托书信息</div>
					<iframe
						:src="fileBookUrl"
						id="fileBookFrame"
						frameborder="0"
						width="100%"
						height="600px"
						scrolling="auto"
					></iframe>
				</div>
			</div>
		</div>
	</div>
	
	
</template>

<script>
import { mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { orderInfo, orderJointInfo, orderFileBookList, soCheck } from '@/api/order/list'
import { getDictLabel } from '@/utils/tools'

export default {
	mixins: [orderMixin],
	filters: {
		payModeFilter(payMode) {
			return getDictLabel('payMode', payMode)
		}
	},
	props: {
	},
	data() {
		return {
			// soFileUrl: 'http://lstest.com/file/onlinePreview?url=http%3A%2F%2Flstest.com%2Fbase%2Finternal%2Ffile%2Fpreview%2F082e2b6c394e435f9525dd2a2de0b784%2F082e2b6c394e435f9525dd2a2de0b784.pdf',
			fileBookUrl: '',
			orderInfoData: {
				barge: {},
				ship: {},
				transport: {},
				soContainerList: [],
				cargoList: []
			},
			countryName: '',
			cname: '',
			ename: ''
		}
	},
	async created() {
		// 获取订单详情
		let { orderNo, jointNo } = this.$route.query
		let fn = jointNo ? orderJointInfo : orderInfo
		let dataQuery = jointNo ? { jointNo } : { orderNo }
		let {data} = await fn(dataQuery)
		this.orderInfoData = data
		// 获取目的港国家
		if (this.orderInfoData.ship.podPortCode) {
			this.$store.dispatch('dict/basePortListByCodes', { portCodes: this.orderInfoData.ship.podPortCode }).then(data => {
				let portItem = data.find(item => item.portCode === this.orderInfoData.ship.podPortCode)
				this.countryName = portItem ? portItem.countryName : ''
			})
		}
		// 中文品名，英文品名合并
		let {cargoList} = data
		cargoList.map((item, index) => {
			this.cname += index ? `,${item.cname}` : item.cname
			this.ename += index ? `,${item.ename}` : item.ename
		})
		this.getFileBook()
	},
	mounted() {
	},
	computed: {
		// 箱型箱量统计
		containerTotal() {
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			let { soContainerList } = this.orderInfoData
			soContainerList.forEach(item => {
				item.containerList.forEach(o => {
					weight += o.weight && o.containerNum ? Number(o.weight) * Number(o.containerNum) : 0
					volume += o.volume && o.containerNum ? Number(o.volume) * Number(o.containerNum) : 0
					weight = parseFloat(weight.toFixed(10))
					volume = parseFloat(volume.toFixed(10))
					containerArr.push({
						containerType: o.containerType ? o.containerType : '',
						containerNum: o.containerNum ? o.containerNum : ''
					})
				})
			})
			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			let containerTypeArr = [...new Set(containerArr.map(item => item.containerType))]
			containerTypeArr.forEach(item => {
				let arr = containerArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.containerNum), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})
			mergeArr.forEach((item, index) => {
				const firstText = index > 0 ? '+' : ''
				if (item.containerType || item.containerNum) {
					container += firstText + `${item.containerType} * ${item.containerNum}`
				}
			})
			return {
				weight: weight,
				volume: volume,
				container: container
			}
		}
	},
	components: {},
	methods: {
		// 驳船中转方式
		getTransitWay(data) {
			let result = ''
			if (!data) return ''
			if (data.transitWay) {
				result = getDictLabel('transferMode', data.transitWay)
			}
			return result
		},
		// 附件
		getFileBook() {
			orderFileBookList({ orderNo: this.$route.query.orderNo }).then(res => {
				let { data } = res
				if (!data) {
					this.fileBookUrl = ''
				}
				if (data && data.length) {
					this.fileBookUrl = this.getFileUrl(data[0])
				}
			})
		},
		// 获取so附件url
		getFileUrl(row) {
			let { fileNo, fileName } = row
			if (!fileNo || !fileName) return
			let nameArr = fileName.split('.')
			let name = nameArr[nameArr.length - 1]
			name = name.toLowerCase()
			let fileUrl = `${window.location.origin}/base/fileView/preview/${fileNo}/${fileNo}.${name}`
			// let href = `${window.location.origin}/file/onlinePreview?url=${encodeURIComponent(fileUrl)}`
			return fileUrl
		},
		// 取消返回放舱详情
		handleCancel() {
			this.$store.dispatch('tagsView/delView', this.$route)
			this.$router.push({
				name: 'OrderBook',
				params: {
					orderNo: this.$route.query.orderNo
				},
				query: this.$route.query
			})
		},
		handleSoCheck(type) {
			let msg = type === 'y' ? '核对正确' : '核对错误'
			this.$confirm(`是否确认${msg}?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				soCheck({
					orderNo: this.$route.query.orderNo,
					checkResult: type,
					so: this.$route.query.so
				}).then(res => {
					this.$message({
						type: 'success',
						message: `${msg}成功`
					})
				})
			}).catch(err => {
				console.log('err')
			})
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
.soCheck-cont{
	background-color: #fff;
	margin: 10px 10px 10px 14px;
	overflow: hidden;
}
.soCheck-cont .row{
	height: 24px;
	padding: 2px 8px;
	line-height: 20px;
	border-bottom: 1px solid #e9e9e9;
	display: flex;
	justify-content: space-between;
}
.soCheck-cont .row .tit{
	font-size: 12px;
}
.soCheck-cont .row .operate-btns .el-button--mini{
	height: 20px;
	line-height: 16px;
	padding: 0 5px;
}
.soCheck-cont .soCheck-info{
	width: 100%;
	padding-left: 24px;
	margin: 24px 0;
	overflow-x: auto;
	overflow-y: hidden;
}
.soCheck-cont .soCheck-info .list-info{
	width: 33.33%;
	padding-right: 24px;
	float: left;
	display: inline-block;
}
.soCheck-cont .soCheck-info .list-info .detail {
	border-radius: 2px;
	border: 1px solid #D9D9D9;
	width: 100%;
}
.soCheck-cont .soCheck-info .list-info .detail .tit {
	font-size: 12px;
	font-weight: bold;
	height: 24px;
	line-height: 24px;
	background: #F8F9FD;
	border-radius: 2px 2px 0px 0px;
	padding: 0 10px;
}
.soCheck-cont .soCheck-info .list-info .detail .info-row{
	margin: 0 10px;
	border-bottom: 1px solid #e9e9e9;
	padding: 6px 0;
	overflow: hidden;
}
.soCheck-cont .soCheck-info .list-info .detail .info-row .item{
	line-height: 20px;
	width: 100%;
	white-space: normal;
	word-break: break-all;
}
.soCheck-cont .soCheck-info .list-info .detail .info-row .item.full{
	line-height: 20px;
	width: 100%;
}
.soCheck-cont .soCheck-info .list-info .detail .info-row.barge .item{
	width: 50%;
	float: left;
	display: inline-block;
}
.soCheck-cont .soCheck-info .list-info .detail .info-row.barge .item.full{
	width: 100%;
}
#soFrame {
	
}
</style>
