<template>
  <div class="allInfo">
    <div class="module">
      <div class="item cust-info">
         <div class="title">客户信息</div>
         <div class="content">
            <div class="value">
              <div class="key">客户名称：</div> 
              <div class="key-value">{{ custName }}</div>
            </div>
            <div class="value">
              <div class="key">客户委托号：</div> 
              <div class="key-value">{{ orderInfo.custIntrustNo }}</div>
            </div>
            <div class="value">
              <div class="key">发货单位：</div> 
              <el-tooltip class="key-value" v-if="shipperCustName" effect="dark" :content="shipperCustName" placement="top">
                 <div class=""> {{ shipperCustName }}</div>
              </el-tooltip>
              <div class="key-value" v-else></div>
            </div>
         </div>
      </div>
      <div class="item express-info">
         <div class="title">货运信息</div>
         <div class="content">
            <div class="value">
              <div class="key">运输条款：</div> 
              <div class="key-value">{{ transport.transportTerm }}</div>
            </div>
            <div class="value">
              <div class="key">付款方式：</div> 
              <div class="key-value">{{ orderInfo.payMode | getDictLabelFilter('payMode') }}</div>
            </div>
            <div class="value">
              <div class="key">免用免堆：</div> 
              <el-tooltip class="key-value" v-if="ship.freetimeSys" effect="dark" :content="ship.freetimeSys" placement="top">
                 <div class=""> {{ ship.freetimeSys }}</div>
              </el-tooltip>
              <div class="key-value" v-else></div> 
            </div>
            <div class="value">
              <div class="key">合约号：</div> 
              <el-tooltip class="key-value" v-if="ship.contractNo" effect="dark" :content="ship.contractNo" placement="top">
                 <div class=""> {{ ship.contractNo }}</div>
              </el-tooltip>
              <div class="key-value" v-else></div> 
            </div>
         </div>
      </div>
      
      <div class="item goods-info">
        <div class="title">货物信息</div>
        <div class="content">
           <div class="content-item-more">
            <div class="key">箱型箱量：</div>
            <el-tooltip class="key-value" v-if="containerTotal.container" effect="dark" :content="containerTotal.container" placement="top">
              <div class="">{{ containerTotal.container }}</div>
            </el-tooltip>
            <div class="key-value" v-else></div>
           </div>
           <div class="content-item">
            <div class="key">总件数：</div>
            <div class="key-value">{{ containerTotal.quantity }}</div>
           </div>
           <div class="content-item-more marginTop8">
             <div class="key">总重量：</div>
             <div class="key-value">{{ containerTotal.weight }}KGS</div>
           </div>
           <div class="content-item marginTop8">
             <div class="key">总体积：</div>
             <div class="key-value">{{ containerTotal.volume }}CBM</div>
           </div>
        </div>
        <div class="table-class">
          <el-table
            :data="hsArr"
            border
            max-height="115"
            style="width: 100%">
            <el-table-column
              prop="hscode"
              label="HS code">
              <template slot-scope="{row}">
                <el-tooltip class="table-column-large" v-if="row.hscode" effect="dark" :content="row.hscode" placement="top">
                  <div class=""> {{ row.hscode }}</div>
                </el-tooltip>
                <div class="table-column-large" v-else></div>
              </template>
            </el-table-column>
            <el-table-column
              prop="cname"
              label="中文品名">
              <template slot-scope="{row}">
                <el-tooltip class="table-column-large" v-if="row.cname" effect="dark" :content="row.cname" placement="top">
                  <div class=""> {{ row.cname }}</div>
                </el-tooltip>
                <div class="table-column-large" v-else></div>
              </template>
            </el-table-column>
            <el-table-column
              prop="ename"
              label="英文品名">
              <template slot-scope="{row}">
                <el-tooltip class="table-column-large" v-if="row.ename" effect="dark" :content="row.ename" placement="top">
                  <div class=""> {{ row.ename }}</div>
                </el-tooltip>
                <div class="table-column-large" v-else></div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="item remark-info">
         <div class="title">备注信息</div>
         <div class="content">
            <div class="value">
              <div class="key">委托备注：</div> 
              <el-tooltip class="key-value" v-if="orderInfo.intrustRemark" effect="dark" :content="orderInfo.intrustRemark" placement="top">
                 <div class=""> {{ orderInfo.intrustRemark }}</div>
              </el-tooltip>
              <div class="key-value" v-else></div> 
            </div>
            <div class="value">
              <div class="key">审单备注：</div> 
              <el-tooltip class="key-value" v-if="orderInfo.auditRemark" effect="dark" :content="orderInfo.auditRemark" placement="top">
                 <div class=""> {{ orderInfo.auditRemark }}</div>
              </el-tooltip>
              <div class="key-value" v-else></div> 
            </div>
            <div class="value">
              <div class="key">订舱备注：</div> 
              <el-tooltip class="key-value" v-if="bkgRemark" effect="dark" :content="bkgRemark" placement="top">
                 <div class=""> {{ bkgRemark }}</div>
              </el-tooltip>
              <div class="key-value" v-else></div> 
            </div>
            <div class="value">
              <div class="key">订单备注：</div> 
              <el-tooltip class="key-value" v-if="orderInfo.bdRemark" effect="dark" :content="orderInfo.bdRemark" placement="top">
                 <div class=""> {{ orderInfo.bdRemark }}</div>
              </el-tooltip>
              <div class="key-value" v-else></div> 
            </div>
            <div class="value">
              <div class="key">个人备注：</div>
              <el-tooltip class="key-value key-value-large" v-if="remark" effect="dark" :content="remark" placement="top">
                 <div class="">{{ remark }}</div>
              </el-tooltip>
              <el-popover
                placement="bottom"
                width="500"
                v-model="visible">
                <el-input v-model="resRemark" maxlength="500" show-word-limit  placeholder="请输入" type="textarea" size="mini"></el-input>
                <div style="text-align: right; margin-top: 20px;">
                  <el-button type="primary" size="mini" @click="saveRemark">保存</el-button>
                  <el-button size="mini" type="default" @click="visible = false">取消</el-button>
                </div>
                <img slot="reference"  class="edit-img" :src="require('@/views/opPlan/images/edit.png')" alt="">
              </el-popover>
            </div>
         </div>
      </div>
      
    </div>
    <div class="logistics">
      <!-- <div class="title">物流信息</div> -->
      <div class="content">
        <div class="item">
          <div class="key">发件人：</div>
          <div class="value">
               <el-input v-model="transport.shipper" placeholder="" type="textarea" disabled size="mini"></el-input> 
          </div>
        </div>
        <div class="item">
          <div class="key">收件人：</div>
          <div class="value">
               <el-input v-model="transport.consignee" placeholder="" type="textarea" disabled size="mini"></el-input>
          </div>
        </div>
        <div class="item">
          <div class="key">通知人1：</div>
          <div class="value">
               <el-input v-model="transport.notify1" placeholder="" type="textarea" disabled size="mini"></el-input>
          </div>
        </div>
        <div class="item">
          <div class="key">通知人2：</div>
          <div class="value">
               <el-input v-model="transport.notify2" placeholder="" type="textarea" disabled size="mini"></el-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRemarkInfo, saveRemarkInfo } from '@/api/order/opPlan.js'
export default {
   props: {
     orderInfo: {
       type: Object,
       default: () => {
         return {}
       }
     }
   },
   computed: {
    ship() {
      return this.orderInfo.ship || {}
    },
     custName() {
       return this.$route.query.jointNo ? this.orderInfo.compDeptName : this.orderInfo.custName
     },
     cargoList() {
        return (this.orderInfo.cargoList|| [])
     },
     shipperCustName() {
        let arr = []
        this.cargoList.forEach(item => {
          if (item.shipperCustName) {
            arr.push(item.shipperCustName)
          }
        })
        return arr.join(',')
     },
     hsArr() {
       return this.cargoList.filter(item => {
          return item.hscode || item.cname || item.ename
       })
     },
    containerTotal() {
			return this.getContainerTotal(this.orderInfo.soContainerList || [])
		},
    transport() {
      return this.orderInfo.transport || {}
    }
   },
   data() {
    return {
      resRemark: '',
      remark: '',
      bkgRemark: '',
      visible: false,
    }
   },
   created() {
      this.getRemark()
   },
   methods: {
      getRemark() {
        getRemarkInfo({orderNo: this.$route.query.orderNo})
        .then(res => {
          this.resRemark = (res.data && res.data.personRemark && res.data.personRemark.remark) || ''
          this.remark = this.resRemark
          this.bkgRemark = (res.data && res.data.bkgRemark && res.data.bkgRemark.bkgRemark) || ''
        })
      },
      saveRemark() {
        saveRemarkInfo({orderNo: this.$route.query.orderNo, remark: this.resRemark})
        .then(res => {
          this.visible = false
          this.$message.success('修改成功')
          this.getRemark()
        })
        .catch(() => {
          this.visible = false
        })
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
   }
}
</script>

<style lang="scss" scoped>
.allInfo {
  background-color: #ffffff;
  // padding: 10px 16px;
  // margin-top: 8px;
  margin-bottom: 8px;
  
  .module {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    .marginTop8 {
      margin-top: 8px;
    }
    .item {
      width: 49.5%;
      height: 190px;
      margin-top: 10px;
      border: 1px solid #D9D9D9;
      .title {
        color: #222222;
        height: 27px;
        padding: 8px 16px;
        font-weight: bold;
      }
      .content {
        padding: 8px 16px;
        .value {
          .key-value {
            overflow: hidden;
            display: -webkit-box;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
          .content-key {
            width: 80px;
          }
        }
      }
    }
    .edit-img {
      width: 12px !important;
      height: 12px;
      cursor: pointer;
      margin-left: 5px;
    }
    .cust-info {
      background-image: url('../images/cust.png');
      background-repeat: no-repeat;
      background-position: 100% 100%;
      height: 160px;
      .title {
        background-color: #EFF4FD;
      }
      .value+.value {
        margin-top: 8px;
      }
      .value {
        display: flex;
        justify-content: center;
        .key {
          width: 72px;
          text-align: right;
        }
        .key-value {
          width: calc(100% - 75px);
        }
      }
    }
    .remark-info {
      background-image: url('../images/remark.png');
      background-repeat: no-repeat;
      background-position: 100% 100%;
      /deep/.el-textarea__inner {
        background-color: #fefcf5;
        border-color: #feefc0;
      }
      .title {
        background-color: #FDF8E8;
      }
      .value+.value {
        margin-top: 8px;
      }
      .value {
        display: flex;
        .key {
          width: 60px;
        }
        .key-value {
          max-width: calc(100% - 65px);
        }
        .key-value-large {
          max-width: calc(100% - 82px);
        }
      }
    }
    .goods-info {
      background-image: url('../images/goods.png');
      background-repeat: no-repeat;
      background-position: 100% 100%;
      .title {
        background-color: #EAF1E8;
      }
      .content {
        display: flex;
        flex-wrap: wrap;
        .content-item-more {
          width: 65%;
          display: flex;
          justify-content: center;
          .key {
            width:  60px;
            text-align: right;
          }
          .key-value {
            width: calc(100% - 60px);
            overflow: hidden;
            display: -webkit-box;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
        }
        .content-item {
          width: 35%;
          display: flex;
          justify-content: center;
           .key {
            width:  60px;
            text-align: right;
          }
          .key-value {
            width: calc(100% - 60px);
            overflow: hidden;
            display: -webkit-box;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
        }
      }
      .table-class {
        padding: 0 10px;
        .table-column-large {
            overflow: hidden;
            display: -webkit-box;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
        }
        /deep/.el-table {
          th {
            //  background-color: #D3E3CE !important;
          }
          tbody tr {
            // background: #f6f9f5 !important;
          }
        }
      }
      .value+.value {
        margin-top: 10px;
      }
    }
    .express-info {
      background-image: url('../images/express.png');
      background-repeat: no-repeat;
      background-position: 100% 100%;
      height: 160px;
      .title {
        background-color: #FFF0EA;
      }
      .value+.value {
        margin-top: 8px;
      }
      .value {
        display: flex;
        justify-content: center;
        .key {
          width: 60px;
          text-align: right;
        }
        .key-value {
          width: calc(100% - 60px);
          overflow: hidden;
          display: -webkit-box;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
      }
    }
  }
  .logistics {
    // margin-top: 16px;
    .title {
      color: #222222;
      font-weight: bold;
    }
    .content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      // margin-top: 10px;
      .item {
        width: 49.5%;
        display: flex;
        margin-top: 10px;
        .key {
          width: 56px;
        }
        .value {
          flex: 1;
          line-height: 15px;
        }
      }
    }
  }
 
}
</style>