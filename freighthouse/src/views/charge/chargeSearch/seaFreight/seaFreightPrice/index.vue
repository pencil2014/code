<template>
    <div class="seaFreightPrice">
        <div class="components-containe">
            <h1>深圳市长帆国际物流股份有限公司</h1>
            <el-row :gutter="50">
                <el-col :span="6" v-for="(item, index) in 8" :key="index">
                     <footer class="detail"><span>客户委托号：</span><span>上海-墨西哥</span></footer>
                </el-col>
                <el-col :span="6">
                     <footer class="detail"><span>备注：</span><span>6.24号前开船有效</span></footer>
                </el-col>
            </el-row>
            <el-table class="table-data" :data="tableData">
                <el-table-column align="center" label="费用项目" >
                  <template slot-scope="scope">
                     <el-input size="small" v-model="scope.row.chargeCode"></el-input>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="币别" >
                  <template slot-scope="scope">
                    <el-input size="small" style="width:80px" v-model="scope.row.createdBy"></el-input>
                   </template>
                </el-table-column>
                <el-table-column align="center"  label="数量">
                  <template slot-scope="scope">
                      <el-input size="small" style="width:80px" v-model="scope.row.rateUnit"></el-input>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="单价">
                  <template slot-scope="scope">
                     <el-select size="small" style="width:80px" v-model="scope.row.rateUnit" placeholder="请选择">
                       
                     </el-select>
                  </template>
                </el-table-column> 
                <el-table-column align="center" label="合计">
                   <template slot-scope="scope">
                     <el-select size="small" v-model="scope.row.currency" placeholder="请选择">
                       <!-- <el-option
                         v-for="item in currencyList"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"
                         >
                       </el-option> -->
                     </el-select>
                   </template>
                </el-table-column>
                <el-table-column align="center"  label="操作">
                  <template slot-scope="scope">
                     <el-button @click="deleteClickLine(scope)" type="text" size="small">删除</el-button>
                   </template>
                </el-table-column>
            </el-table>

            <div class="dialog-add">
              <el-button style="width:100%" size="small"  @click="handleAddLine"> 
                <i class="el-icon-plus"></i>
                 增加费用
              </el-button>
            </div>
            <div class="price-usd">
                <h3>TOTAL: CNY:1673.00 + USD:1673.00</h3>
            </div>
            <footer class="bottom">
                <p>地址：深圳市罗湖区深南东路文化大厦西座12F</p>
                <p>邮箱：http://www.longsailling.net</p>
                <div class="footer-content">
                    <span>1，此单仅供与贵公司核对费用，非付款凭证。如无疑问，请在三个工作日内确认，如无回应的，默认费用已确认。</span>
                    <span>2，走以下船公司的，按开船日算起收取罚金（含驳船日），请至少在产生罚金的前两天付款并传水单给我司，否则产生的罚金由贵公司承担！</span>
                    <span>3，付款后请在一个月内索取发票，过期视为不开票。发票一经确认开出将不作废发票，否则收取发票重开费RMB100/张。如开票有其他特殊要求的请联系我司财务人员，否则费用名称默认为代理运费。</span>
                </div>
            </footer>
            <div class="btn">
                 <div class="right">
                    <el-button size="small" type="primary" @click="$router.push('/charge/chargeSearch/seaFreighPrice')">
                    <i class="el-icon-sold-out"></i> 输出
                    </el-button>
                    <el-button size="small" @click="handlePrinting">
                        打印
                    </el-button>
                    <el-button size="small" @click="handleBack">
                        取消
                    </el-button>
                 </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            tableData:[
                {
                  chargeCode: '文件费（DOC）',
                  createdBy: 'CNY',
                  rateUnit: '1'
                }, 
                {
                  chargeCode: '设备交接费（EIR）',
                  createdBy: 'CNY',
                  rateUnit: '2'
                }, 
                {
                  chargeCode: '码头费',
                  createdBy: 'USD',
                  rateUnit: '2'
                }, 
                {
                  chargeCode: '封条费',
                  createdBy: 'CNY',
                  rateUnit: '6'
                }, 
            ]
        }
    },
    methods:{
        //删除列表
        deleteClickLine(row){
          let List = this.tableData
          this.tableData = List.filter((item, index) => {
             return index !== row.$index
           })
        },
        //新增一行
        handleAddLine(){
           this.tableData.push({})
        },
        //打印
        handlePrinting(){
          this.$confirm('是否确认打印 ?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            lockScroll: "true",
            type: "warning"
          }).then(function() {
            return 1
          }).then(() => {
            this.$message({message: '恭喜你，打印成功', type: 'success'});
          }).catch(function() {});
        },
        //取消按钮操作、、返回
        handleBack(){
          history.back()
        }
    }
}
</script>

<style lang="scss" >
.seaFreightPrice{
     padding:0 16px;
    .components-containe{
        padding:0px 3%;
        background-color: #fff;
        h1{
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid #D8D8D8;
            color: #222222;
        }
        .detail{
            margin-right: 10px;
            line-height: 180%;
            span{
                color: #4A4A4A;
            }
        }
        .table-data{
            margin-top:20px;
        }
        .dialog-add{
          margin-top:16px;
          .el-button {
            border: 1px dashed #DCDFE6;
          }
        }
        .price-usd{
            position: relative;
            h3{
                position: absolute;
                right: 0;
            }
        }
        .bottom{
            margin-top:90px;
            padding-bottom: 90px;
            >p{
                color:#4A4A4A;
            }
            .footer-content{
                margin-top: 14px;
                span{
                    color:#BFBFBF;
                    display: block;
                    line-height: 150%;
                }
            }
        }
        .btn{
            padding: 16px;
            display: flex;
            .right{
                float: right;
            }
        }
    }
}

</style>