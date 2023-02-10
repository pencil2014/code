<template>
<div class="edit-row box-row surcharge-table">
  <div class="row-tit">
    <span class="tit">附加费</span>
    <div class="row-tit-operate">
      <span class="row-tit-label row-tit-info">
        <SearchFilter :item="templateIdConfig" :tableQuery="createdItem"/>
      </span>
      <el-button type="primary" size="mini" ref="add" @click="handleAddLine">新增</el-button>
    </div>
  </div>
  <div class="row-form">
    <el-table :data="tableData" :max-height="240">
      <el-table-column align="center" label="费用英文" width="150">
        <template slot-scope="scope">
          <el-select
            size="mini" v-model="scope.row.chargeEname" filterable remote reserve-keyword
            placeholder="费用英文"
            :remote-method="feeItemQuerySearch"
            @focus="feeItemQuerySearch('')"
            @change="((value) => feeItemChange(value, scope.row,'01'))"
            >
            <el-option
              v-for="item in feeItemList"
              :key="item.feeCode"
              :label="item.feeEnName"
              :value="item.feeEnName">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
        <el-table-column align="center" label="费用中文" width="150">
          <template slot-scope="scope">
           <el-select
              size="mini" v-model="scope.row.chargeName"  filterable remote reserve-keyword
              placeholder="费用中文"
              :remote-method="feeItemQuerySearch"
              @focus="feeItemQuerySearch('')"
              @change="((value) => feeItemChange(value, scope.row,'02'))"
              >
                <el-option
                  v-for="item in feeItemList"
                  :key="item.feeCode"
                  :label="item.feeName"
                  :value="item.feeName">
                </el-option>
              </el-select>
           </template>
        </el-table-column>
        <el-table-column align="center"  label="付款方式" width="150">
          <template slot-scope="scope">
            <el-select size="mini" v-model="scope.row.payMode" placeholder="请选择">
              <el-option v-for="(o, key) in dictMap['chargePayType']"
                :key="key"
                :label="o.label"
                :value="o.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="计费单位" width="100">
          <template slot-scope="scope">
            <el-select size="mini" v-model="scope.row.rateUnit" placeholder="请选择">
              <el-option v-for="(o, key) in dictMap['rateUnit']"
                :key="key"
                :label="o.label"
                :value="o.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="币别" width="100">
          <template slot-scope="scope">
            <el-select
              size="mini" v-model="scope.row.currency" filterable remote reserve-keyword
              placeholder="币别"
              >
              <el-option
                v-for="item in currencyList"
                :key="item.code"
                :label="item.code"
                :value="item.code">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column align="center" label="金额" v-for="(item,index) in price" :key="index" width="150">
          <template slot-scope="scope">
            <el-input v-if="scope.row.rateUnit == 'container_type'" placeholder="请输入" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"  size="mini" v-model="scope.row[item.value] ">
              <template v-if="scope.row.rateUnit == 'container_type'" slot="prepend">{{item.label}}</template>
            </el-input>
            <el-input v-if="item.label == '20GP:' && scope.row.rateUnit != 'container_type'" placeholder="请输入" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}" size="mini" v-model="scope.row.price">
              <template v-if="scope.row.rateUnit == 'container_type'" slot="prepend">{{item.label}}</template>
            </el-input>
            <span v-if=" item.label != '20GP:'&&scope.row.rateUnit != 'container_type'">
              <span >— —</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注" width="200">
          <template slot-scope="scope">
            <el-input size="mini" v-model="scope.row.remark" placeholder="请输入" maxlength="512"></el-input>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" fixed="right">
          <template slot-scope="scope">
             <el-button @click="handleDelete(scope)" type="text" size="mini">删除</el-button>
           </template>
        </el-table-column>
    </el-table>
  </div>
</div>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import SearchFilter from '@/components/Base/Search/filter'
import {userSurchargeList, userSurchargeInfo, surchargeInfo} from '@/api/charge'
import { baseCurrencyList,baseFeeItemList } from '@/api/base'

export default {
  data() {
    return {
      templateIdConfig: {
        type: 'cascader',
        key: 'templateId',
        label: '附加费模板',
        filterable: true,
        clearable: true,
        style: {
          width: '240px'
        },
        inputBox: {
          "justify-content": "normal"
        },
        data: [],
        itemDataProps: {
          expandTrigger: 'hover' ,
          value:'templateId', 
          label:'templateName'
        },
        change: (value) => {
          let len = value.length
          this.getList(value[len-1])
        },
        value: []
      },
      price:[{label: '20GP:',value: 'priceGp20'}, {label: '40GP:', value: 'priceGp40'},{label: '40HQ:', value: 'priceHq40'},{label: '45HQ:', value: 'priceHq45'}
         ,{label: '20NOR:', value: 'priceNor20'},{label: '40NOR:', value: 'priceNor40'}
      ],
      feeItemList:[],
      currencyList:[],
      tableData: JSON.parse(JSON.stringify(this.surchargeList))
    }
  },
  props: {
    param: {
      type: Object
    },
    createdItem: {
      type: Object,
      default: () => {}
    },
    surchargeList: {
      type: Array,
      default: () => ([])
    }
  },
  created() {
    this.getUserSurchargeList()
    this.getCurrencyList()
  },
  mounted() {
  },
  computed: {
    ...mapGetters([
      'dictMap'
    ])
  },
  watch: {
    surchargeList: {
      handler(newVal) {
        if (newVal) this.tableData = newVal
      },
      deep: true
    }
  },
  components: {
    SearchFilter
  },
  methods: {
    close(action, value) {
      this.$emit('close', action, value)
    },


    // dialogCallback(action, done) {
    //   if (action === 'Confirm') {
    //     if (this.validate() !== true) return
    //     this.handleSurchargeSubmit(done)
    //   } else {
    //     this.close('cancel')
    //   }
    // },

    // 获取模板下拉
    getUserSurchargeList(val) {
      userSurchargeList().then(response => {
        let tempData = this.getTreeData(response.data)
        this.templateIdConfig.data = tempData
      })
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList(queryString) {
      baseCurrencyList(queryString, 'valid', 'charge').then(response => {
        this.currencyList = response.data
      })
    },
      // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString) {
      baseFeeItemList(queryString).then(response => {
        this.feeItemList = response.data
      })
    },
    feeItemChange(value,row,type){
      var item=this.selectChagedFeeItem(value,type);
      if(item){
        row.chargeCode=item.feeCode;
        row.chargeEname=item.feeEnName;
        row.chargeName=item.feeName;
        row.currency=item.currency;
        row.rateUnit=item.feeUnit.toLowerCase();
      }
    },
    selectChagedFeeItem(val,type) {
      var obj = {};
      obj = this.feeItemList.find(function(item) {
        if(type==='01'){
          return item.feeEnName===val;
        }else{
         return item.feeName === val;
        }
      });
      return obj;
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].children.length) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          this.getTreeData(data[i].children)
        }
      }
      return data
    },

    // 获取模板列表
    getList(val) {
      surchargeInfo({templateId: val}).then(response => {
        this.tableData = response.data.surchargeList
      })
    },

    // 增加一行
    handleAddLine() {
      // 添加一行为空的数据
      const rowData = {
        chargeCode:'', 
        chargeEname: '',
        chargeName: '',
        chargeType:"",
        chargeMode:"成本价",
        payMode:"",
        currency:"",
        rateUnit:"",  
        priceGp20:"",
        priceGp40:"",
        priceHq40:"",
        priceHq45:"",
        priceNor20:"",
        priceNor40:"",
        price:"",
        remark: ''
      }
      this.tableData.push(rowData)
      console.log(this.tableData)
    },

    // 删除一行
    handleDelete(scope) {
      this.tableData.splice(scope.$index, 1)
    },

    // 确定提交
    handleSurchargeSubmit(done) {
      if (!this.validate()) return
      done();
      this.close('Confirm', this.tableData)
    }
  }
};
</script>

<style lang="scss">
.mt20 {
  margin-top: 20px;
}
.dialog-add{
  margin-top:16px;
  .el-button {
    border: 1px dashed #DCDFE6;
  }
}

.surcharge-table{
  .el-input__prefix{
    line-height: 28px;
    color:#000000;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }
}
</style>
