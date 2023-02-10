<template>
  <div class="order-info-top" v-if="headerInfoShow">
    <div class="header-info">
        <div class="item" :class="{'last-item': index === headerList.length - 1}" v-for="(item,index) in headerList" :key="index">
          <div class="key">{{keyMethod(item.label)}}</div>
          <template v-if="item.value && topOrderInfo[item.value]">
              <el-tooltip  :content="topOrderInfo[item.value]" placement="bottom-start" :visible-arrow="false" effect="dark">
                  <div class="value">{{topOrderInfo[item.value]}}</div>
              </el-tooltip>
          </template>
          <div v-else class="value"></div>
        </div>
        <div class="align-right">
          <span class="btn" @click="show">
            {{isShow?'收起':'展开'}}
            <i :class="{'el-icon-arrow-up': isShow, 'el-icon-arrow-down': !isShow}"></i>
          </span>
        </div>
    </div>
    <div class="container-info" v-show="isShow">
        <div class="item" v-for="(item, index) in containerList" :key="index">
          <div class="key">{{keyMethod(item.label)}}</div>
          <template v-if="valueMethod(item)">
             <el-tooltip :content="valueMethod(item)" placement="bottom-start" :visible-arrow="false" effect="dark">
               <div class="value">{{valueMethod(item)}}</div>
             </el-tooltip>
          </template>
           <div v-else class="value"></div>
        </div>
    </div>
    <div class="line-box"></div>
  </div>
</template>

<script>
import { mainOrderTop } from '@/api/order/list.js'
import { airCargoList } from '@/api/airTransport/order-import'
import { orderInfo as railOrderInfo } from '@/api/railway/list'
import { getDictLabel } from '@/utils/tools'
import { orderCustInfo } from '@/api/order/list' 
import { baseBusinessServiceList,baseBusinessList } from '@/api/base' 
export default {
  props: {
    orderInfo: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
   data() {
     return {
       businessBroad: '',
       isShow: false,
       topOrderInfo: {},
       railOrderInfo: {},
       shipHeaderZX: [ // 海运整箱头部需要展示的字段
          { label: 'SO号', value: 'so' },
          { label: 'MBL', value: 'mbl' },
          { label: 'HBL', value: 'hbl' },
       ],
       shipContainerZX: [ // 海运整箱展示的字段
          { label: '大船起运港', value: 'polPortName'},
          { label: '中转港', value: 'transitPortName'},
          { label: '卸货港', value: 'unloadingPortName'},
          { label: '目的地', value: 'podPortName'},
          { label: '驳船收货地', value: 'porPortName'},
          { label: '船公司', value: 'shipCarrierCode'},
          { label: '大船船名', value: 'vessel'},
          { label: '大船航次', value: 'voyage'},
          { label: '大船预计开船时间', value: 'etdTime'},
          { label: '大船截关时间', value: 'cyCutOff'},
          { label: '箱型箱量', value: 'container'},
          { label: '总件数', value: 'quantity', unit: '件', show0: true},
          { label: '总重量', value: 'weight', unit: 'KGS', show0: true},
          { label: '总体积', value: 'volume', unit: 'CBM', show0: true},
          { label: '客户结算方式', value: 'settleMode', showValue: ''},
       ],
       shipHeaderPX: [ // 海运拼箱头部需要展示的字段
         { label: '入舱单号', value: 'po' },
         { label: 'MBL', value: 'mbl' },
         { label: 'HBL', value: 'hbl' },
       ],
       shipContainerPX: [ // 海运拼箱展示的字段
          { label: '起运港', value: 'polPortName'},
          { label: '卸货港', value: 'unloadingPortName'},
          { label: '目的地', value: 'podPortName'},
          { label: '装货地', value: 'receiptPlaceName'},
          { label: '大船预计开船时间', value: 'etdTime'},
          { label: '箱型箱量', value: 'container'},
          { label: '总件数', value: 'quantity', unit: '件', show0: true},
          { label: '总重量', value: 'weight', unit: 'KGS', show0: true},
          { label: '总体积', value: 'volume', unit: 'CBM', show0: true},
          { label: '客户结算方式', value: 'settleMode', showValue: ''},
       ],
       shipHeaderBulkRo: [ // 海运散杂滚装头部需要展示的字段
          { label: 'MBL', value: 'mbl' },
          { label: 'HBL', value: 'hbl' },
       ],
       shipContainerBulkRo: [ // 海运散杂滚装展示的字段
          { label: '大船起运港', value: 'polPortName'},
          { label: '中转港', value: 'transitPortName'},
          { label: '卸货港', value: 'unloadingPortName'},
          { label: '目的地', value: 'podPortName'},
          { label: '船公司', value: 'shipCarrierCode'},
          { label: '大船船名', value: 'vessel'},
          { label: '大船航次', value: 'voyage'},
          { label: '大船截关时间', value: 'cyCutOff'},
          { label: '总件数', value: 'quantity', unit: '件', show0: true},
          { label: '总重量', value: 'weight', unit: 'KGS', show0: true},
          { label: '总体积', value: 'volume', unit: 'CBM', show0: true},
       ],
       airHeaderList: [ // 空运头部需要展示的字段
          { label: '主单号', value: 'mbl'},
          { label: '分单号', value: 'hbl'},
       ],
       ariContainerList: [ // 空运需要展示的字段
          { label: '起运港', value: 'polPortCode'},
          { label: '目的地', value: 'podPortCode'},
          { label: '航空公司', value: 'airLine'},
          { label: '运输条款', value: 'transportTerm'},
          { label: '预计件数', value: 'totalQuantity', unit: '件', show0: true},
          { label: '预计毛重', value: 'totalWeight', unit: 'KGS', show0: true},
          { label: '预计体积', value: 'totalVolume', unit: 'CBM', show0: true},
          { label: '预计计费重量', value: 'chargeWeight', unit: 'KGS', show0: true},
          { label: '制单计数', value: 'bltotalQuantity', unit: '件', show0: true},
          { label: '制单毛重', value: 'bltotalWeight', unit: 'KGS', show0: true},
          { label: '制单体积', value: 'bltotalVolume', unit: 'CBM', show0: true},
          { label: '制单计费重量', value: 'blchargeWeight', unit: 'KGS', show0: true},
          { label: '客户类型', value: 'custClass',showValue:''},
          { label: '服务类型', value: 'serviceType',showValue:''},
          { label: '服务项', value: 'serviceList',showValue:''},
          { label: '客户结算方式', value: 'settleMode', showValue: ''},
       ],
       railHeaderList: [ // 铁路头部展示字段
          { label: 'MBL', value: 'mbl'},
          { label: 'HBL', value: 'hbl'},
       ],
       railContainerList: [ // 铁路需要展示的字段
          { label: '收货地', value: 'porPortName'},
          { label: '起运站', value: 'polPortName'},
          { label: '目的站', value: 'podPortName'},
          { label: '最终目的地', value: 'finalPodPortName'},
          { label: '预计发车时间', value: 'etdTime'},
          { label: '箱型箱量', value: 'container'},
          { label: '总件数', value: 'quantity', unit: '件', show0: true},
          { label: '总重量', value: 'weight', unit: 'KGS', show0: true},
          { label: '总体积', value: 'volume', unit: 'CBM', show0: true},
          { label: '客户结算方式', value: 'settleMode', showValue: ''},
       ]
     }
   },
   computed: {
     isShip() {
       return !this.businessBroad || this.businessBroad.includes('ship')
     },
     isAir() {
       return this.businessBroad.includes('air')
     },
     isRail() {
       return this.businessBroad.includes('rail')
     },
     isZX() {
       // 整箱
       return ['st01', 'st15', 'st02', 'st16', 'st17', 'st09', 'st10'].includes(this.orderInfo.serviceType)
     },
     isPX() {
       // 拼箱
       return ['st03', 'st18', 'st04', 'st19', 'st11', 'st12'].includes(this.orderInfo.serviceType)
     },
     // 海外仓或是报关单
     isOverseaWh() {
       return ['ship_oversea_wh', 'ship_customs','ship_export_customs','ship_import_customs'].includes(this.orderInfo.businessType)
     },
     // 散杂滚装
     isBulkRo() {
       return this.orderInfo.businessType === 'ship_bulk_ro'
     },
     // 顶部基础信息显示
     headerInfoShow() {
       return !this.isOverseaWh
     },
     headerList() {
       if(this.isShip) {
         if(this.isZX) {
           return this.shipHeaderZX
         } else if(this.isPX) {
           return this.shipHeaderPX
         } else if (this.isBulkRo) {
           return this.shipHeaderBulkRo
         } else {
           return []
         }
       } else if(this.isAir) {
         return this.airHeaderList
       } else if(this.isRail) {
         return this.railHeaderList
       } else {
         return []
       }
     },
     containerList() {
        if(this.isShip) {
          if(this.isZX) {
            return this.shipContainerZX
          } else if(this.isPX) {
            return this.shipContainerPX
          } else if (this.isBulkRo) {
            return this.shipContainerBulkRo
          }
        } else if(this.isAir) {
          return this.ariContainerList
        } else if(this.isRail) {
          return this.railContainerList
        } else {
          return []
        }
     }
   },
   created() {
     this.businessBroad = this.$route.query.businessBroad || ''
     this.getMainOrderTop()
     this.initData()
     if(this.isAir){
       this.getAirServiceList()
       this.getBaseBusinessList()
     }
     this.getCustType()
     
   },
   methods: {
     getCustType() {
      //  客户信息
      orderCustInfo({ orderNo: this.$route.query.orderNo }).then((res) => {
        if(this.isShip) {
          if(this.isZX){
            for(let i=0;i<this.shipContainerZX.length;i++){
              if(this.shipContainerZX[i].value==='settleMode'){
                let str= getDictLabel('settleCycle', res.data.settleMode)
                this.$set(this.shipContainerZX[i],'showValue',str)
              }
            }
          }else{
            for(let i=0;i<this.shipContainerPX.length;i++){
              if(this.shipContainerPX[i].value==='settleMode'){
                let str= getDictLabel('settleCycle', res.data.settleMode)
                this.$set(this.shipContainerPX[i],'showValue',str)
              }
            }
          }
           
        } else if(this.isAir) {
          for(let i=0;i<this.ariContainerList.length;i++){
            if(this.ariContainerList[i].value==='settleMode'){
              let str= getDictLabel('settleCycle', res.data.settleMode)
              this.$set(this.ariContainerList[i],'showValue',str)
            }
            if(this.ariContainerList[i].value==='custClass'){
              let str= getDictLabel('customerClass', res.data.custClass.toLowerCase())
              this.$set(this.ariContainerList[i],'showValue',str)
            }
          }
        } else if(this.isRail) {
          for(let i=0;i<this.railContainerList.length;i++){
            if(this.railContainerList[i].value==='settleMode'){
              let str= getDictLabel('settleCycle', res.data.settleMode)
              this.$set(this.railContainerList[i],'showValue',str)
            }
          }
        }
      })
    },
    getAirServiceList(){
      // 获取空运服务类型
      let params={
        businessType:this.orderInfo.businessType,
        serviceType:this.orderInfo.serviceType
      }
      baseBusinessServiceList(params).then(res=>{
        let serviceList=[]
        let arr=res.data || []
        for(let i=0;i<arr.length;i++){
          if(this.orderInfo.serviceList.includes(arr[i].serviceCode)){
            serviceList.push(arr[i].serviceName)
          }
        }
        for(let i=0;i<this.ariContainerList.length;i++){
          if(this.ariContainerList[i].value==='serviceList'){
            this.$set(this.ariContainerList[i],'showValue',serviceList.join(','))
          }
        }
      })
    },
    getBaseBusinessList(){
      // 业务类型
      baseBusinessList().then(res=>{
        let arr=res.data || []
        let item=arr.find(el=>el.businessType===this.orderInfo.businessType)
        if(item){
          let businessTypeName = item.name
          let serviceTypeList= item.serviceTypeList
          let serviceItem=serviceTypeList.find(el=>el.serviceType===this.orderInfo.serviceType).name
          for(let i=0;i<this.ariContainerList.length;i++){
            if(this.ariContainerList[i].value==='serviceType'){
              this.$set(this.ariContainerList[i],'showValue',`${businessTypeName}-${serviceItem}`)
            }
          }
        }
      })
    },
     getMainOrderTop() {
       mainOrderTop({orderNo: this.$route.query.orderNo})
       .then(res => {
         this.topOrderInfo = res.data
       })
     },
     show() {
       this.isShow = !this.isShow
       this.$emit('handleOrderInfoTop', this.isShow)
     },
      keyMethod(val) {
      if(val) {
        return val + '：'
      } else {
        ''
      }
    },
    valueMethod(item) {
      if(item.value) {
        if(item.showValue){
          return item.showValue
        }
        if(this.isShip && this.orderInfo.ship) {
           return (this.orderInfo[item.value] || this.orderInfo.ship[item.value] || (item.show0 ? 0 : '')) + (item.unit || '')
        } else if(this.isAir) {
          if(item.showValue){
            return item.showValue
          }
          if(item.value==='transportTerm'){
            console.log(this.orderInfo.transport)
            if(this.orderInfo.transport){
              return getDictLabel('airTransportTerm', this.orderInfo.transport.transportTerm)
            }else{
               return ''
            }
          }
          if(this.orderInfo.cargoStat){
            return (this.orderInfo[item.value] ||  this.orderInfo.cargoStat[item.value] || (item.show0 ? 0 : '')) + (item.unit || '')
          }else{
            return ''
          }
        } else if(this.isRail && this.railOrderInfo.rail) {
          return (this.railOrderInfo[item.value] || this.railOrderInfo.rail[item.value] || (item.show0 ? 0 : '')) + (item.unit || '')
        }
      } else {
        return ''
      }
    },
    initData() {
      if(this.isShip && this.isZX) {
          const containerTotal = this.getContainerTotal(this.orderInfo.soContainerList)
          let obj = { 
              porPortCode: this.orderInfo.barge ? this.orderInfo.barge.porPortCode : '', 
              porPortName: this.orderInfo.barge ? this.orderInfo.barge.porPortName : '' 
          }
          Object.assign(this.orderInfo,
            containerTotal,
            // 驳船信息
           obj)
      } else if (this.isShip && this.isBulkRo) {
        let containerTotal = this.getBulkRoContainerTotal(this.orderInfo.cargoList)
        Object.assign(this.orderInfo, containerTotal)
      } else if(this.isAir) {
        airCargoList({orderNo: this.$route.query.orderNo})
        .then(res => {
          if(res.data && res.data.blCargoStat) {
            let blCargoStat = res.data.blCargoStat
            Object.assign(this.orderInfo.cargoStat, {
              bltotalQuantity: blCargoStat.totalQuantity || 0,
              bltotalWeight: blCargoStat.totalWeight || 0,
              bltotalVolume: blCargoStat.totalVolume || 0,
              blchargeWeight: blCargoStat.chargeWeight || 0,
            })
          }
        })
      } else if(this.isRail) {
        railOrderInfo({orderNo: this.$route.query.orderNo})
        .then(res => {
           this.railOrderInfo = res.data
           const containerTotal = this.getRailcontainerTotal(this.railOrderInfo)
           console.log('containerTotal', containerTotal)
           Object.assign(this.railOrderInfo, containerTotal)
        })
      }
    },
    getContainerTotal(soContainerList) {
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			soContainerList.forEach(item => {
				item.containerList.forEach(o => {
					quantity += o.quantity && o.containerNum ? Number(o.quantity) * Number(o.containerNum) : 0
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
				quantity: quantity,
				weight: weight,
				volume: volume,
				container: container
			}
		},
    getRailcontainerTotal(info) {
      let { containerList, shipperList} = info
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			containerList.forEach(o => {
				quantity += o.quantity ? Number(o.quantity) : 0
				weight += o.weight ? Number(o.weight) : 0
				volume += o.volume ? Number(o.volume) : 0
				weight = parseFloat(weight.toFixed(10))
				volume = parseFloat(volume.toFixed(10))
				containerArr.push({
					containerType: o.containerType ? o.containerType : '',
					containerNum: 1
				})
			})

			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			// const containerTypeArr = [...new Set(containerArr.map(item => item.containerType))]
			const containerTypeArr = containerArr.map(item => item.containerType)

			containerTypeArr.forEach(item => {
				const arr = containerArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.containerNum), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})
			mergeArr.forEach((item, index) => {
				const firstText = index > 0 ? '+' : ''
				if (item.containerType && !container.includes(item.containerType)) {
					// container += firstText + `${item.containerType}`
					container += firstText + `${item.containerType} * ${item.containerNum}`
				}
			})
      if(quantity || weight || volume) {
         return {
          quantity: quantity,
          weight: weight,
          volume: volume,
          container: container
        }
      } else {
        let quantityTotal = shipperList.reduce((sum, cur) => {
					return sum + Number(cur.quantity)
				}, 0)
				let weightTotal = shipperList.reduce((sum, cur) => {
					return sum + Number(cur.weight)
				}, 0)
				let volumeTotal = shipperList.reduce((sum, cur) => {
					return sum + Number(cur.volume)
				}, 0)
        return {
           quantity: quantityTotal,
           weight: weightTotal,
           volume: volumeTotal,
           container: container
        }
      }
			
    },
    getBulkRoContainerTotal(cargoList) {
      let quantity = 0
			let weight = 0
			let volume = 0
			let feeWeight = 0
			cargoList.forEach(o => {
        quantity += o.quantity ? Number(o.quantity) : 0
        weight += o.weight ? Number(o.weight) : 0
				volume += o.volume ? Number(o.volume) : 0
				feeWeight += o.feeWeight ? Number(o.feeWeight) : 0
        weight = parseFloat(weight.toFixed(10))
				volume = parseFloat(volume.toFixed(10))
				feeWeight = parseFloat(feeWeight.toFixed(10))
      })
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				feeWeight: feeWeight
			}
    }
   }
}
</script>

<style lang="scss" scoped>
.order-info-top {
  .header-info {
    display: flex;
    padding: 5px 14px;
    background-color: #fff;
    .item {
      width: 25%;
      display: flex;
      .key {
        width: 110px;
        text-align: right;
      }
      .value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .last-item {
      flex: 1;
    }
    .align-right {
      width: 45px;
      text-align: right;
      .btn {
        cursor: pointer;
      }
    }
  }
  .container-info {
    background-color: #fff;
    display: flex;
    flex-wrap: wrap;
    border-top: 2px solid #F6F7F9;
    padding: 10px 14px;
    .item {
      width: 25%;
      margin-top: 4px;
      display: flex;
      .key {
        width: 110px;
        text-align: right;
      }
      .value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .line-box {
    height: 5px;
    background-color: #F6F7F9;
  }
}
</style>