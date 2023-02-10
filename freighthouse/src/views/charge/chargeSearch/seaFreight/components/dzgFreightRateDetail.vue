<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div class="dzgfreightrate-detail-tabel">
      <div class="dzgfreightrate-detail-operates">
        <el-button size="mini" type="primary" v-if="connonQueryValue!='11'" @click="handleCreate">生成订单</el-button>
      </div>
      <div style="max-height:60vh;overflow-y:auto;overflow-x:hidden;">
        <el-row :gutter="20">
          <el-col :span="18">
            <el-form ref="dzgfreightrateDetailForm" :model="currentData" label-width="80px" inline label-position="right">
              <el-form-item label="有效日期：">
                <div style="display: flex;align-items: center;">
                  <el-date-picker v-model="currentData.begindate" size="mini" disabled style="width:140px" type="date" placeholder="选择日期">
                  </el-date-picker>
                  <span>~</span>
                  <el-date-picker v-model="currentData.validdate" size="mini" disabled style="width:140px" type="date" placeholder="选择日期">
                  </el-date-picker>
                  <el-select v-model="currentData.validType" size="mini" placeholder="有效类别" style="width:140px;margin-left:10px" disabled>
                    <el-option v-for="item in validTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item label="ALL IN：">
                <el-checkbox v-model="isAllin" size="mini" disabled></el-checkbox>
              </el-form-item>
              <el-form-item label="直达：">
                <el-checkbox v-model="isDirect" size="mini" disabled></el-checkbox>
              </el-form-item>
              <el-divider v-if="bargeQuery&&bargeEntity.recaddressEnname"></el-divider>
              <h5 style="margin-bottom:10px" v-if="bargeQuery&&bargeEntity.recaddressEnname">驳船信息</h5>
              <div style="overflow: hidden;" v-if="bargeQuery&&bargeEntity.recaddressEnname">
                <div style="width:50%;float:left">
                  <el-form-item label="驳船收货地：">
                    <el-input v-model="bargeEntity.recaddressEnname" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="驳船卸货地：">
                    <el-input v-model="bargeEntity.unloadport" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="驳船船期：">
                    <el-input v-model="bargeEntity.cycle" size="mini" disabled style="width:350px"></el-input>
                  </el-form-item>
                </div>
                <div style="width:50%;float:left">
                  <el-form-item label="转运方式：">
                    <el-select v-model="bargeEntity.transtype" size="mini" placeholder="转运方式" style="width:130px" disabled>
                      <el-option v-for="item in transtypeArr" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="驳船航程：">
                    <el-input v-model="bargeEntity.transportDays" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                </div>
              </div>
              <el-divider></el-divider>
              <h5 style="margin-bottom:10px">基本信息</h5>
              <div style="overflow: hidden;">
                <div style="width:50%;float:left">
                  <el-form-item label="起运港：">
                    <el-input v-model="currentData.loadport" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="目的港：">
                    <el-input v-model="currentData.dischargeport" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="船公司：">
                    <el-input v-model="currentData.carrier" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="订舱代理：">
                    <el-input v-model="currentData.quoteorg" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="中转港：">
                    <el-input v-model="currentData.transferport" size="mini" disabled placeholder="中转港" style="width:114px;margin-right:4px"></el-input>
                    <el-input v-model="currentData.transferport2" size="mini" disabled placeholder="中转港2" style="width:114px;margin-right:4px"></el-input>
                    <el-input v-model="currentData.transferport3" size="mini" disabled placeholder="中转港3" style="width:114px"></el-input>
                  </el-form-item>
                  <el-form-item label="船期：">
                    <el-input v-model="mainsVo.cycle" size="mini" disabled type="textarea" style="width:350px"></el-input>
                  </el-form-item>
                </div>
                <div style="width:50%;float:left">
                  <el-form-item label="国家：">
                    <el-input v-model="currentData.country" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="系统航线：">
                    <el-input v-model="currentData.searouteCnname" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="承运人航线：">
                    <el-input v-model="currentData.carrierRoute" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="进港港区：">
                    <el-input v-model="currentData.massaddress" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="中转方式：">
                    <el-select v-model="currentData.inlandTransferMode" size="mini" placeholder="中转方式" style="width:130px" disabled>
                      <!-- <el-option v-for="item in colorArr" :key="item.value" :label="item.label" :value="item.value">
                      </el-option> -->
                    </el-select>
                  </el-form-item>
                  <el-form-item label="中转航程：">
                    <el-input v-model="currentData.transferSailtime" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="拿价人：">
                    <el-input v-model="currentData.priceHolder" size="mini" disabled style="width:130px"></el-input>
                    <el-popover placement="bottom" width="240" trigger="hover">
                      <div>
                        <ul style="font-size:12px">
                          <li>联系人电话：{{employeeInfo.telephone}}</li>
                          <li>联系人手机：{{employeeInfo.mobileNo}}</li>
                          <li>联系人Email：{{employeeInfo.email}}</li>
                          <li>QQ：</li>
                          <li>SKYPE：</li>
                          <li>地址：{{employeeInfo.companyCname}}</li>
                        </ul>
                      </div>
                      <i slot="reference" class="el-icon-postcard dzg-postcard"></i>
                    </el-popover>
                  </el-form-item>
                  <el-form-item label="拿价公司：">
                    <el-input v-model="currentData.priceHolderOrgName" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="航线代码：">
                    <el-input v-model="currentData.searouteCode" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                </div>
              </div>
              <el-divider></el-divider>
              <div class="dzg-tabel-container">
                <el-tabs v-model="activeName" type="card">
                  <el-tab-pane label="标准箱型" name="first">
                    <el-table :data="feeList" border style="width: 100%">
                      <el-table-column prop="feeTypeName" label="箱型" width="">
                      </el-table-column>
                      <el-table-column prop="currency" label="币别" width="">
                      </el-table-column>
                      <el-table-column label="底价" align="center">
                        <el-table-column prop="baseprice1" label="20'GP" width="70">
                        </el-table-column>
                        <el-table-column prop="baseprice2" label="40'GP" width="70">
                        </el-table-column>
                        <el-table-column prop="baseprice3" label="40'HQ" width="70">
                        </el-table-column>
                      </el-table-column>
                      <el-table-column label="成本价" align="center">
                        <el-table-column prop="sellprice1" label="20'GP" width="70">
                        </el-table-column>
                        <el-table-column prop="sellprice2" label="40'GP" width="70">
                        </el-table-column>
                        <el-table-column prop="sellprice3" label="40'HQ" width="70">
                        </el-table-column>
                      </el-table-column>
                      <el-table-column label="标准报价" align="center">
                        <el-table-column prop="internetsellprice1" label="20'GP" width="70">
                        </el-table-column>
                        <el-table-column prop="internetsellprice2" label="40'GP" width="70">
                        </el-table-column>
                        <el-table-column prop="internetsellprice3" label="40'HQ" width="70">
                        </el-table-column>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                  <el-tab-pane label="特殊箱型" name="second">
                    <el-table :data="feeList" style="width: 100%">
                      <el-table-column prop="feeTypeName" label="箱型" width="">
                      </el-table-column>
                      <el-table-column prop="currency" label="币别" width="">
                      </el-table-column>
                      <el-table-column label="底价" align="center">
                        <el-table-column prop="baseprice4" label="45'HQ" width="196">
                        </el-table-column>
                      </el-table-column>
                      <el-table-column label="成本价" align="center">
                        <el-table-column prop="sellprice4" label="45'HQ" width="196">
                        </el-table-column>
                      </el-table-column>
                      <el-table-column label="标准报价" align="center">
                        <el-table-column prop="internetsellprice4" label="45'HQ" width="196">
                        </el-table-column>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                </el-tabs>
                <div v-if="suspendShippingService" class="tabel-popup">
                  停 航
                </div>
              </div>
              <el-divider></el-divider>
              <h5 style="margin-bottom:10px">补充信息</h5>
              <div style="overflow: hidden;">
                <div style="width:50%;float:left">
                  <el-form-item label="提单类型：">
                    <el-input v-model="currentData.billType" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="运输条款：">
                    <el-input v-model="currentData.transitClause" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="佣金：">
                    <el-input v-model="currentData.rakeoff" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="符号：">
                    <el-input v-model="currentData.signflag" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="限重：">
                    <el-input v-model="currentData.volumerange" size="mini" disabled style="width:350px"></el-input>
                  </el-form-item>
                </div>
                <div style="width:50%;float:left">
                  <el-form-item label="出单方式：">
                    <el-input v-model="currentData.sendtype" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="限定货类：">
                    <el-input size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="颜色：">
                    <el-select v-model="currentData.priceColor" size="mini" placeholder="有效类别" style="width:130px" disabled>
                      <el-option v-for="item in colorArr" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="开航日：">
                    <el-input v-model="currentData.sailingDate" size="mini" disabled style="width:130px"></el-input>
                  </el-form-item>
                  <el-form-item label="推荐运价：">
                    <el-checkbox v-model="iscommend" disabled></el-checkbox>
                  </el-form-item>
                  <el-form-item label="预计上涨：">
                    <el-checkbox v-model="expectedRise" disabled></el-checkbox>
                  </el-form-item>
                  <el-form-item label="停航：">
                    <el-checkbox v-model="suspendShippingService" disabled></el-checkbox>
                  </el-form-item>
                  <el-form-item label="发布：">
                    <el-checkbox v-model="ispublish" disabled></el-checkbox>
                  </el-form-item>
                </div>
              </div>
              <el-divider></el-divider>
              <el-form-item label="创建人：">
                <div style="display: flex;align-items: center;">
                  <el-input v-model="currentData.createby" size="mini" disabled style="width:67px"></el-input>
                  <span>~</span>
                  <el-date-picker v-model="currentData.createdate" size="mini" disabled style="width:100px" type="date" placeholder="选择日期">
                  </el-date-picker>
                </div>
              </el-form-item>
              <el-form-item label="维护人：">
                <el-input v-model="currentData.ownerName" size="mini" disabled style="width:67px"></el-input>
              </el-form-item>
              <el-form-item label="上次修改人：">
                <div style="display: flex;align-items: center;">
                  <el-input v-model="currentData.modifyby" size="mini" disabled style="width:67px"></el-input>
                  <span>~</span>
                  <el-date-picker v-model="currentData.modifydate" size="mini" disabled style="width:100px" type="date" placeholder="选择日期">
                  </el-date-picker>
                </div>
              </el-form-item>
              <el-form-item label="发布日期：">
                <el-date-picker v-model="currentData.publishdate" size="mini" disabled style="width:100px" type="date" placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-form>

          </el-col>
          <el-col :span="6">
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">基本港限重</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled>
              </el-input>
            </div>
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">中转港限重</div>
              <el-input type="textarea" :rows="2" placeholder="" v-model="mainsVo.transferportWl" size="mini" disabled>
              </el-input>
            </div>

            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">附加费</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled v-model="currentData.plusfeedesc">
              </el-input>
            </div>
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">附加费说明</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled v-model="currentData.addfee">
              </el-input>
            </div>
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">联系方式</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled v-model="currentData.linkinfo">
              </el-input>
            </div>
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">外部备注</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled v-model="currentData.remark">
              </el-input>
            </div>
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">内部备注</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled v-model="currentData.employeeRemark">
              </el-input>
            </div>
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">免用免堆</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled v-model="currentData.freeTime">
              </el-input>
            </div>
            <div class="dzgfreightrate-detail-remakes-box">
              <div class="dzgfreightrate-detail-remakes-title">收货指引</div>
              <el-input type="textarea" :rows="2" placeholder="" size="mini" disabled v-model="currentData.businessRemark">
              </el-input>
            </div>

          </el-col>
        </el-row>
      </div>
    </div>

  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { getEmployeeInfo } from '@/api/base'
import { dzgPgDetail } from '@/api/charge/route'
export default {
  data() {
    return {
      bargeEntity: {},
      mainsVo: {},
      feeList: [],
      colorArr: [
        { label: '黑色', value: 'black' },
        { label: '蓝色', value: 'blue' },
        { label: '红色', value: 'red' },
        { label: '绿色', value: 'green' }
      ],
      activeName: 'first',
      dialogConfig: {
        title: '海运出口整箱运价明细',
        show: true,
        size: 'medium',
        width: '1250px',
        showBtns: false
      },
      form: {},
      transtypeArr: [
        {
          label: '驳船',
          value: '0'
        }
      ],
      validTypeOptions: [
        {
          label: '开船时间',
          value: 1
        },
        {
          label: '进港时间',
          value: 5
        },
        {
          label: '截关时间',
          value: 3
        },
        {
          label: '还重柜时间',
          value: 4
        }
      ],
      employeeInfo: {}
    }
  },
  props: {
    currentData: {
      // 列表带过来-详情数据
      type: Object,
      default: () => {
        return {}
      }
    },
    // interfaceData: {
    //   // 详情返回-详情数据
    //   type: Object,
    //   default: () => {
    //     return {
    //       mainsVo: {}
    //     }
    //   }
    // },
    connonQueryValue: {
      type: [Number, String],
      default: ''
    },
    bargeQuery: {
      type: Boolean,
      default: false
    }
  },
  created() {},
  mounted() {
    this.getEmployeeInfo(this.currentData.priceHolder) //this.currentData.priceHolder
    this.getDzgPgDetail()
  },
  computed: {
    isAllin() {
      return this.currentData.transferFeeMode == 2
    },
    tabelData() {
      let arr = []
      let obj1 = {
        boxType: '基价',
        currency: this.currentData.currency,
        baseprice1: this.currentData.baseprice1,
        baseprice2: this.currentData.baseprice2,
        baseprice3: this.currentData.baseprice3,
        baseprice4: this.currentData.baseprice4,
        sellprice1: this.currentData.sellprice1,
        sellprice2: this.currentData.sellprice2,
        sellprice3: this.currentData.sellprice3,
        sellprice4: this.currentData.sellprice4,
        internetsellprice1: this.currentData.internetsellprice1,
        internetsellprice2: this.currentData.internetsellprice2,
        internetsellprice3: this.currentData.internetsellprice3,
        internetsellprice4: this.currentData.internetsellprice4
      }
      let obj2 = {
        boxType: '中转价',
        currency: this.currentData.currency,
        baseprice1: this.currentData.transfer_baseprice1,
        baseprice2: this.currentData.transfer_baseprice2,
        baseprice3: this.currentData.transfer_baseprice3,
        baseprice4: this.currentData.transfer_baseprice4,
        sellprice1: this.currentData.transfer_sellprice1,
        sellprice2: this.currentData.transfer_sellprice2,
        sellprice3: this.currentData.transfer_sellprice3,
        sellprice4: this.currentData.transfer_sellprice4,
        internetsellprice1: this.currentData.transfer_internetsellprice1,
        internetsellprice2: this.currentData.transfer_internetsellprice2,
        internetsellprice3: this.currentData.transfer_internetsellprice3,
        internetsellprice4: this.currentData.transfer_internetsellprice4
      }
      let obj3 = {
        boxType: '	合计',
        currency: this.currentData.currency,
        baseprice1: this.sumFn(
          this.currentData.baseprice1,
          this.currentData.transfer_baseprice1
        ),
        baseprice2: this.sumFn(
          this.currentData.baseprice2,
          this.currentData.transfer_baseprice2
        ),
        baseprice3: this.sumFn(
          this.currentData.baseprice3,
          this.currentData.transfer_baseprice3
        ),
        baseprice4: this.sumFn(
          this.currentData.baseprice4,
          this.currentData.transfer_baseprice4
        ),
        sellprice1: this.sumFn(
          this.currentData.sellprice1,
          this.currentData.transfer_sellprice1
        ),
        sellprice2: this.sumFn(
          this.currentData.sellprice2,
          this.currentData.transfer_sellprice2
        ),
        sellprice3: this.sumFn(
          this.currentData.sellprice3,
          this.currentData.transfer_sellprice3
        ),
        sellprice4: this.sumFn(
          this.currentData.sellprice4,
          this.currentData.transfer_sellprice4
        ),
        internetsellprice1: this.sumFn(
          this.currentData.internetsellprice1,
          this.currentData.transfer_internetsellprice1
        ),
        internetsellprice2: this.sumFn(
          this.currentData.internetsellprice2,
          this.currentData.transfer_internetsellprice2
        ),
        internetsellprice3: this.sumFn(
          this.currentData.internetsellprice3,
          this.currentData.transfer_internetsellprice3
        ),
        internetsellprice4: this.sumFn(
          this.currentData.internetsellprice4,
          this.currentData.transfer_internetsellprice4
        )
      }
      arr.push(obj1)
      arr.push(obj2)
      arr.push(obj3)
      return arr
    },
    iscommend() {
      //推荐运价
      return this.currentData.iscommend == 'true'
    },
    expectedRise() {
      //预计上涨
      return this.currentData.expectedRise == 'true'
    },
    ispublish() {
      // 是否发布
      return (
        this.currentData.ispublish == 'true' ||
        this.currentData.ispublish == '已发布'
      )
    },
    suspendShippingService() {
      // 是否停航
      return this.currentData.suspendShippingService === 'true'
    },
    isDirect() {
      // 是否直达
      return !this.currentData.transferport
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    getDzgPgDetail() {
      let params = {
        casenumber: this.currentData.casenumber, // this.currentData.casenumber
        bargeId: this.currentData.bargeId || -1, //this.currentData.bargeId
        connonQueryValue:this.connonQueryValue
      }
      dzgPgDetail(params).then((res) => {
        this.feeList = res.data.feeList || []
        if (res.data && res.data.mainsVo && res.data.mainsVo.bargeENtity) {
          this.bargeEntity = res.data.mainsVo.bargeENtity
          this.mainsVo = res.data.mainsVo
        }
      })
    },
    handleCreate() {
      this.$emit('handleCreate', this.currentData)
    },
    getEmployeeInfo(employeeName) {
      // 联系人信息
      let data = {
        employeeName: employeeName
      }
      getEmployeeInfo(data)
        .then((res) => {
          this.employeeInfo = res.data ? res.data : {}
        })
        .catch(() => {})
    },
    sumFn(a, b) {
      let params1 = a ? a : 0
      let params2 = b ? b : 0
      let sum =
        Number(params1) + Number(params2) > 0
          ? Number(params1) + Number(params2)
          : ''
      return sum
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.createOrderForm.validate((valid) => {
          if (valid) {
            // if(!this.validate()) return
            this.handleCreateOrder(done)
          } else {
            this.$msgErrClose('红框内为必填项，请补充！')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    }
  }
}
</script>

<style lang="scss">
.dzgfreightrate-detail-operates {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.dzgfreightrate-detail-tabel {
  .el-table td {
    border-right: 1px solid #dfe6ec !important;
  }
  .el-table th {
    border-bottom: 1px solid #dfe6ec !important;
  }

  .el-date-editor.el-input.el-input--prefix .el-input__inner {
    padding-left: 20px;
    padding-right: 10px;
  }
  .el-input__prefix {
    left: 0;
  }
  .el-form-item {
    margin-bottom: 4px !important;
  }
}
.dzgfreightrate-detail-remakes-box {
  padding-right: 6px;
  margin-bottom: 6px;
  .dzgfreightrate-detail-remakes-title {
    font-size: 12px;
    margin-bottom: 4px;
  }
}
.dzg-postcard {
  color: #1989fa;
  cursor: pointer;
  font-size: 16px;
  margin-left: 4px;
}
.dzg-tabel-container {
  position: relative;
  .tabel-popup {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba($color: #000000, $alpha: 0.3);
    color: #333;
    font: 700 45px 黑体, 宋体;
  }
}
</style>
