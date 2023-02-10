<template>
    <div class="order-no-box-workassign">
        <el-button class="finance-btn" size="mini" type="text">查看参与人</el-button>
        <div class="fee-order-work-assign" style="top: 35px" v-if="workAssignShow">
          <Worker
            ref="activityKey"
            :orderIsJoint="orderIsJoint"
            :jointOrderWorkOptions="jointOrderWorkOptions"
            :orderWorkOptions="orderWorkOptions"
            :obdDeptCode="obdDeptCode"
            :createItem="{...bookDetailForm, reqType: 'add'}"
            :workAssignHeight="workAssignHeight"
            :soList="bkgSoList"
          ></Worker>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { jointWork, jointAuditWork } from '@/api/order/list'
import Worker from './pricingWorker'
export default {
   props: {
     obdDeptCode: {
      type: String,
      default: ''
    },
    jointOrderWorkOptions: {
      type: Array,
      default: () => []
    },
    orderIsJoint: {
      type: String,
      default: ''
    },
    bookDetailForm: {
      type: Object,
      default: () => ({})
    },
    orderWorkOptions: {
      type: Array,
      default: () => ([])
    },
    workAssignHeight: {
      type: Number,
      default: 0
    },
    bkgSoList: {
      type: Array,
      default: () => ([])
    }
   },
   data() {
       return {
         workAssignShow: false
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
  },
  created() {},
  computed: {
   
 },
 components: {
    Worker
  },
  watch: {
   
  },
  methods: {
      
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