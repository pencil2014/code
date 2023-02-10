<template>
  <div class="edit-container order-book fullWrap" id="trackList" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
            <div class="tabs-container">
                <TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
                <div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />
                    <div class="flex1 component-main-cont">
                        <div class="service-container">
                            <CustInfo :orderInfo="orderInfo" :returnDisabled="formSubmiting" />
                            
                            <div class="component-cont table-com-layout" v-if="createItem.ship">
								<div class="cnList-row">
									<div class="ft14">航程跟踪</div>
									<div v-if="!disabledStatus">
										<el-button type="primary" :disabled="saveBtnDisabled" size="mini" @click="handleSave" >保存</el-button>
									</div>
								</div>
                                <div class="finance-one-service-fee">
                                    <div class="finance-table-container">
                                        <div class="money-box">
                                            <div class="money-box-left">
                                                <div class="money-title">开船</div>
                                                <div class="money-total flex-total" >
                                                    <div class="title-key">大船预计开船时间：{{createItem.ship.etdTime || ''}}</div>
                                                    <div class="title-key">大船实际开船时间：{{createItem.ship.tdTime || ''}}</div>
                                                </div>
                                            </div>
                                            <div class="money-box-right">
                                                <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">{{showTable1 ? '收起' : '查看详情'}}<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button>
                                            </div>
                                        </div>
                                        <div class="table-list-data" v-show="showTable1">
                                            <el-table fit :data="tableData1" border>
                                                <el-table-column
                                                    align="center"
                                                    prop="shipCarrierName"
                                                    label="船公司">
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="vessel"
                                                    label="大船船名" >
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="voyage"
                                                    label="大船航次" >
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="openDate"
                                                    label="开仓/港时间" >
                                                    <template slot-scope="{row}">
                                                        <elDatePickerLimit :disabled="disabledStatus" size="mini" v-model="row.openDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="cyCutOff"
                                                    label="大船截关时间" >
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="etdTime"
                                                    label="大船预计开船时间" >
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="tdTime"
                                                    label="大船实际开船时间" >
                                                </el-table-column>
                                            </el-table>
                                        </div>
                                    
                                    </div>
                                </div>
                                 <div class="finance-one-service-fee" v-if="tableData2.length">
                                    <div class="finance-table-container">
                                        <div class="money-box">
                                            <div class="money-box-left">
                                                <div class="money-title">中转港</div>
                                            </div>
                                            <div class="money-box-right">
                                                <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">{{showTable2 ? '收起' : '查看详情'}}<i :class="{'el-icon-arrow-up': showTable2, 'el-icon-arrow-down': !showTable2}"></i></el-button>
                                            </div>
                                        </div>
                                        <div class="table-list-data" v-show="showTable2">
                                            <el-table :data="tableData2" border>
                                                <el-table-column
                                                    align="center"
                                                    prop="transitPortName"
                                                    label="中转港" >
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="transitVessel"
                                                    label="船名" >
                                                    <template slot-scope="{row}">
                                                        <el-input :disabled="disabledStatus" clearable v-model="row.transitVessel" placeholder="请输入"></el-input>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="transitVoyage"
                                                    label="航次" >
                                                     <template slot-scope="{row}">
                                                        <el-input :disabled="disabledStatus" clearable v-model="row.transitVoyage" placeholder="请输入"></el-input>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="transitEtdDate"
                                                    label="中转港预计开船时间" >
                                                    <template slot-scope="{row}">
                                                        <elDatePickerLimit :disabled="disabledStatus" size="mini" v-model="row.transitEtdDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="transitTdDate"
                                                    label="中转港实际开船时间" >
                                                     <template slot-scope="{row}">
                                                        <elDatePickerLimit noCanFuture :disabled="disabledStatus" size="mini" v-model="row.transitTdDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </div>
                                    
                                    </div>
                                </div>
                                 <div class="finance-one-service-fee" v-show="tableData3.length">
                                    <div class="finance-table-container">
                                        <div class="money-box">
                                            <div class="money-box-left">
                                                <div class="money-title">目的港</div>
                                                <div class="money-total flex-total">
                                                    <div class="title-key">预计到港时间：{{createItem.ship.etaTime}}</div>
                                                    <div class="title-key">实际到港时间：{{createItem.ship.taTime}}</div>
                                                </div>
                                            </div>
                                            <div class="money-box-right">
                                                <el-button type="text" class="collapse-btn" @click="handleCollapse('Table3')" size="mini">{{showTable3 ? '收起' : '查看详情'}}<i :class="{'el-icon-arrow-up': showTable3, 'el-icon-arrow-down': !showTable3}"></i></el-button>
                                            </div>
                                        </div>
                                        <div class="time-date-picker-class" v-show="showTable3">
                                            <div class="time-key">
                                               <span>预计到港时间：</span>
                                               <elDatePickerLimit :field="'etaTime'" :disabled="disabledStatus" style="width: 150px;" size="mini" v-model="createItem.ship.etaTime" type="date"  clearable placeholder="请选择" value-format="yyyy-MM-dd" />
                                            </div>
                                             <div class="time-key">
                                               <span>实际到港时间：</span>
                                               <elDatePickerLimit noCanFuture :field="'taTime'" :disabled="disabledStatus"  style="width: 150px;" size="mini" v-model="createItem.ship.taTime" type="date"  clearable placeholder="请选择" value-format="yyyy-MM-dd" />
                                            </div>
                                        </div>
                                        <div class="table-list-data" v-show="showTable3">
                                            <el-table :data="tableData3" border>
                                                <el-table-column
                                                    align="center"
                                                    prop="cn"
                                                    label="柜号" >
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="podTakeDate"
                                                    label="目的港提货时间" >
                                                    <template slot-scope="{row}">
                                                        <elDatePickerLimit :disabled="disabledStatus" size="mini" v-model="row.podTakeDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    prop="podReturnDate"
                                                    label="目的港还空柜时间" >
                                                     <template slot-scope="{row}">
                                                        <elDatePickerLimit noCanFuture :disabled="disabledStatus" size="mini" v-model="row.podReturnDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </div>
                                    
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  </div>
</template>

<script>
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, orderContainerList, saveTrackInfo } from '@/api/order/list'
import { mapState } from 'vuex'
export default {
    mixins: [orderMixin, routerMixin],
   	components: {
		TopNav,
        LeftNav,
        CustInfo
	},
    data() {
        return {
            oQuery: this.$route.query,
            activityKey: 'TrackList',
            formSubmiting: false,
            showTable1: false,
            tableData1: [],
            showTable2: false,
            tableData2: [],
            showTable3: false,
            tableData3: [],
            createItem: {},
            shipCarrierOptions: [],
            transitNum: 4,
            saveBtnDisabled: false
        }
    },
    created() {
         this.getOrderInfo()
         orderInfo({ orderNo: this.oQuery.orderNo }).then(res => {
			this.createItem = res.data
            this.tableData1 = this.createItem.ship? [{...this.createItem.ship}] : []
            this.tableData2 = this.getTableDataMethod(this.createItem.ship)
            console.log('中转港数据', this.tableData2)
            this.getshipCarrierOptions()
		 })
         this.getOrderContainerList()
	},
    computed: {
        ...mapState({
			ordDetRole: state => state.order.orderList.ordDetRole
		}),
        disabledStatus() {
			return this.ordDetRole !== 'op' || this.$route.query.jointNo // 角色非操作不能编辑，协同单不能编辑
		}
    },
    methods: {
        handleCollapse(val) {
          this['show' + val] = !this['show' + val]
        },
        getshipCarrierOptions() {
            // 获取船公司
            if(this.createItem.ship && this.createItem.ship.shipCarrierCode) {
               this.$store.dispatch('dict/baseShippingCarrierList', { name: this.createItem.ship.shipCarrierCode, state: 'valid' }).then(data => {
                    this.shipCarrierOptions = data
                    this.tableData1[0].shipCarrierName = (this.shipCarrierOptions && this.shipCarrierOptions[0].value)
                    console.log('船公司', this.shipCarrierOptions)
               })
            }
			
		},
        getshipCarrierName(key) {
           let obj = this.shipCarrierOptions.find(item => {
               return item.key === key
           })
           return (obj && obj.value) || ''
        },
        getTableDataMethod(ship) {
           let arr = []
           for(var i = 1; i < this.transitNum; i++) {
               let strId = this.getStrId(i)
               if(ship['transitPortCode' + strId]) {
                   arr.push({
                       keyId: i,
                       transitPortName: ship['transitPortName' + strId],
                       transitEtdDate: ship['transitEtdDate' + strId],
                       transitTdDate: ship['transitTdDate' + strId],
                       transitVessel: ship['transitVessel' + strId],
                       transitVoyage: ship['transitVoyage' + strId]
                   })
               }
           }
           return arr
        },
        getStrId(i) {
           return i === 1 ? '' : ((i - 1) + '')
        },
        getOrderContainerList() {
           orderContainerList({ orderNo: this.oQuery.orderNo }).then(res => {
               if(res.data && res.data.length) {
                    this.tableData3 = (res.data || []).map(item => {
                        item.cn = item.cn || '-'
                        return item
                    })
                    console.log('集装箱信息', this.tableData3)
               }
           })
        },
        getTransitData() {
           let obj = {}
           if(this.tableData2.length) {
               let strId = ''
               this.tableData2.forEach((item, index)=> {
                   strId = this.getStrId(index+1)
                   obj['transitEtdDate' + strId] = item.transitEtdDate
                   obj['transitTdDate' + strId] = item.transitTdDate
                   obj['transitVessel' + strId] = item.transitVessel
                   obj['transitVoyage' + strId] = item.transitVoyage
               })
           }
           return obj
        },
        getContainersData() {
            let arr = []
            if(this.tableData3.length) {
              this.tableData3.forEach(item => {
                  arr.push({
                      containerId: item.oid,
                      podTakeDate: item.podTakeDate,
                      podReturnDate: item.podReturnDate
                  })
              })
            }
            return arr
        },
        handleSave() {
            this.saveBtnDisabled = true
            let transitData = this.getTransitData()
            let containers = this.getContainersData()
            let data = {
                orderNo: this.oQuery.orderNo,
                openDate: this.tableData1[0].openDate,
                etaTime: this.createItem.ship.etaTime,
                taTime: this.createItem.ship.taTime,
                ...transitData,
                containers
            }
            saveTrackInfo(data)
            .then(res => {
                this.saveBtnDisabled = false
                this.$message.success('保存成功')
                this.getOrderInfo()
            })
            .catch(() => {
                this.saveBtnDisabled = false
            })
        }
    }
}
</script>

<style lang="scss">
@import '../../less/index.scss';
  #trackList {
      .detail-container {
          display: flex;
      }
      .cnList-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        line-height: 20px;
        height: 20px;
      }
      .flex-total {
          display: flex;
          .title-key + .title-key {
              margin-left: 10px;
          }
      }
      .table-list-data {
          margin: 10px;
      }
      .time-date-picker-class {
          display: flex;
          margin: 10px 10px 0;
          .time-key + .time-key {
              margin-left: 10px;
          }
      }
  }
</style>