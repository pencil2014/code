<template>
    <div class="order-no-box-workassign">
        <el-button class="finance-btn" size="mini" type="text">查看参与人</el-button>
        <div class="fee-order-work-assign" :style="{'top': topPx}" v-if="workAssignShow">
          <Worker
            ref="activityKey"
            :createItem="createItem"
            v-if="createItem.orderNo || rail"
            :orderStatus="createItem.orderStatus"
            :serviceList="createItem.serviceList"
            :jointAuditWorkData="jointAuditWorkData"
            :jointWorkData="jointWorkData"
            :orderWorkOptions="orderWorkOptions"
          ></Worker>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { jointWork, jointAuditWork } from '@/api/order/list'
import Worker from '@/views/finance/orderFee/orderFee/components/components/worker'
export default {
   props: {
     options: {
       type: Object,
       default: () => {
         return {}
       }
     },
     topPx: {
       type: String,
       default: '25px'
     }
   },
   data() {
       return {
         workAssignShow: false,
         jointWorkData: [],
         orderWorkOptions: [],
         jointAuditWorkData: {},
         createItem: {},
         rail: false
       }
   },
   mounted() {
    	let FinOrderFee = document.querySelector('#app')
	  	FinOrderFee && FinOrderFee.addEventListener('click', (e) => {
        if (e.target.innerText === '查看参与人') {
          e.stopPropagation()
          return this.workAssignShow = !this.workAssignShow
        }
        let WorkAssign = document.querySelector('.fee-order-work-assign')
        if (!e.path.includes(WorkAssign)) {
          e.stopPropagation()
          this.workAssignShow = false
        }
      })
      this.getJointWork()
      this.getJointAuditWork()
  },
  created() {},
  computed: {
    ...mapState({
        orderInfo: (state) => state.order.orderInfoDataObj,
        airOrderInfo: (state) => state.airTransport.airOrderInfo,
        railwayOrderInfo: (state) => state.railway.orderInfoDataObj
    })
 },
 components: {
    Worker
  },
  watch: {
    'workAssignShow'(val) {
        if(val) {
            let path = this.$route.path
            if(this.options && this.options.workAssign) {
                this.createItem = Object.assign({}, this.options)
            } else if(path && path.includes('airTransport')) {
                this.createItem = Object.assign({}, this.airOrderInfo)
            } else if(path &&path.includes('railway')) {
                this.createItem = Object.assign({}, this.railwayOrderInfo)
                this.rail = true
            } else {
                this.createItem = Object.assign({}, this.orderInfo)
            }
            console.log('参与人弹框 createItem ：', this.createItem)
            this.orderWorkOptions = this.createItem.workAssign.map(item => {
                if (item.employeeId == 0) {
                item.employeeName = ''
                }
                return Object.assign(item, { show: true })
            })
         }
    }
  },
  methods: {
        // 获取订舱协助审核人
		getJointAuditWork() {
			jointAuditWork({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.jointAuditWorkData = res.data
			})
		},
    // 获取协同岗位分配
		getJointWork() {
			jointWork({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.jointWorkData = res.data
                console.log('jointWorkData：', this.jointWorkData)
			})
		},
  }
}
</script>

<style lang="scss" scoped>
.order-no-box-workassign {
	position: absolute;
	right: 20px;
	top: 20%;
	z-index: 2000;
	button {
		background: #fff;
	}
  /deep/.item-label {
    text-align: left !important;
     span {
        font-size: 12px !important;
     }
  } 
  /deep/.joint-work-row {
    text-align: left !important;
  }
}
.fee-order-work-assign {
	position: absolute;
	right: -20px;
	top: 25px;
	width: 148px;
	max-height: calc(100vh - 65px);
	overflow-y: auto;
	background: #FFFFFF;
	box-shadow: 0px 4px 10px 0px #E9E9E9;
	border: 1px solid #D9D9D9;
	border-radius: 3px;
	padding: 5px 0 6px;
	/deep/.work-cont {
		overflow-y: initial !important;
	}
}
</style>