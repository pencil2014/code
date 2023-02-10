<template>
<div class="surcharge">
  <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
              附加费名称：
            </span>
            <el-input class="input-width" size="mini" v-model="queryForm.templateName" placeholder="请输入附加费名称"></el-input>
            <span class="filter-txt">
              创建人：
            </span>
            <el-select
              class="input-width"
              size="mini"
              v-model="queryForm.createdBy"
              filterable
              remote
              clearable
              placeholder="请选择"
              :remote-method="createdByFilterMehod"
              @visible-change="createdByVisibleChange"
              @change="handleChangeEmployeeId"
            >
              <el-option v-for="(item, index) in createdByEmployeeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
            </el-select>
            <!-- <el-input class="input-width" size="mini" v-model="queryForm.createdBy" placeholder="请输入创建人"></el-input> -->
          </div>
        </div>
      </div>
      <div class="operation-btns-box" >
        <el-button size="mini"  @click="handleSearch" type="primary">
          <i class="el-icon-search"></i> 搜索
        </el-button>
        <el-button size="mini"  @click="handleReset" plain>
          <!-- <i class="el-icon-refresh"></i> --> 重置 
        </el-button>
      </div>
    </div> 
  </div>
  <div class="surcharge-container m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini"  @click="handleAdd" type="primary">
          <i class="el-icon-plus"></i> 新建
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="tableData" style="margin:10px 0px" ref="surchargeTable" :max-height="tableHeight">
      <el-table-column align="center" prop="templateName" label="附加费名称" ></el-table-column>
      <el-table-column align="center" prop="createdBy" label="创建人" ></el-table-column>
      <el-table-column align="center" prop="createdTime" label="创建时间" type="date"  format='yyyy-MM-dd'></el-table-column>
      <el-table-column align="center" label="费用详情" >
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top" popper-class="black-popover">
            <div>
              <div class="payment-advance"  v-for="(item, index) in scope.row.surchargeList" :key="'item' + index">
                <div class="payment-advance-list">
                  {{item.chargeName}}（{{item.chargeCode}}）：
                  <span v-if="item.rateUnit === 'container_type'">
                    {{item.priceGp20 ? item.priceGp20 : '-'}}/{{item.priceGp40 ? item.priceGp40 : '-'}}/{{item.priceHq40 ? item.priceHq40 : '-'}}/{{item.priceHq45 ? item.priceHq45 : '-'}}/{{item.priceNor20 ? item.priceNor20 : '-'}}/{{item.priceNor40 ? item.priceNor40 : '-'}}
                  </span>
                  <span v-else>{{item.price}} </span>
                  ({{item.currency}})
                </div>
              </div>
            </div>
            <div slot="reference">
              <span size="medium">附加费</span>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="row" label="操作" width="300">
        <template slot-scope="scope">
          <el-button  @click="handleEdit(scope.row)" :disabled=" userId != scope.row.userId" type="text" size="mini" class="orange" >编辑</el-button>
          <el-button @click="handleEdit(scope.row, 'copy')" type="text" size="mini">复制</el-button>
          <el-button @click="handleDelete(scope.row)" :disabled=" userId != scope.row.userId" size="mini" type="text" class="red">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" ref="surchargeTableFooter" />
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="1200px" @open="loadTemplate" @close="dialogClose">
     <el-form ref="surchargeData" :rules="rules" :model="surchargeData" class="surcharge-pop-form">
      <div class="input-container-dialog" >
        <el-form-item label="名称：" label-width="80px" prop="templateName" :show-message="false">
          <el-input style="width:240px" size="mini" v-model="surchargeData.templateName" placeholder="请输入附加费"></el-input>
        </el-form-item>
        <el-form-item label="附加费模板：" label-width="120px" prop="createdBy">
          <el-cascader
            style="width:240px"
            size="mini"
            v-model="surchargeData.createdBy"
            :options="options"
            filterable
            clearable
            placeholder="请选择附加费模板"
            :props="{ expandTrigger: 'hover' ,value:'templateId', label:'templateName'}"
            @change="handleChange">
          </el-cascader>
        </el-form-item>
      </div>
      <el-table :data="surchargeData.surchargeList">
        <el-table-column align="center" label="费用英文" width="150">
            <template slot-scope="scope">
             <el-select
                size="mini" v-model="scope.row.chargeEname"  filterable remote reserve-keyword
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
                 size="mini"  v-model="scope.row.chargeName"  filterable remote reserve-keyword
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
              <el-select size="mini" v-model="scope.row.rateUnit" placeholder="请选择" 
                @change="$set(scope.row,scope.row.rateUnit,$event)"
                 >
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
                size="mini" v-model="scope.row.currency" filterable 
                placeholder="币别"
                 @change="$set(scope.row,scope.row.currency,$event)"
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
            <el-input 
              v-if="scope.row.rateUnit == 'container_type'" placeholder="请输入" size="mini" v-model="scope.row[item.value] ">
              <template v-if="scope.row.rateUnit == 'container_type'" slot="prepend">{{item.label}}</template>
            </el-input>
              <el-input v-if="item.label == '20GP:' && scope.row.rateUnit != 'container_type'" placeholder="请输入" size="mini" v-model="scope.row.price">
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
             <el-button @click="deleteClickLine(scope)" type="text" size="mini">删除</el-button>
           </template>
        </el-table-column>
      </el-table>
      
      <div class="dialog-add">
        <el-button style="width:100%" size="mini"  @click="handleAddLine"> 
          <i class="el-icon-plus"></i>
           新增附加费
        </el-button>
      </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm('surchargeData')"> 
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
</div>
</template>
<script>
import { surchargeList, surchargeAdd, surchargeUpdate, surchargeInfo, surchargeDelete, userSurchargeList } from '@/api/charge'
import { baseCurrencyList,baseFeeItemList, baseEmployeeListName, listByRole } from '@/api/base'
import { mapGetters } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { logger } from 'runjs/lib/common';
import Pagination from '@/components/Base/Table/newPagination'

export default {
  
  name:"surcharge",
  mixins: [mixin, routerMixin],
  data() {
  
    return {
      //弹框标题
      title:"",
      //弹框开关
      open:false,
      // 查询条件
      tableQuery: {
       columns: [],
       query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
       currPage:1,
       pageSize:-1
      },
      queryForm:{
        templateName:"",
        createdBy:""
      },
      feeItemList:[],
      currencyList:[],
      tableData: [],
      //新增修改表单
      surchargeData: {
        templateName:"",
        createdBy:"",
        surchargeList:{}
      },
      line: {
        chargeMode:"",
        chargeType:"",
        chargeCode:"",
        payMode:"",
        currency:"",
        rateUnit:"",
        priceGp20:"",
        priceGp40:"",
        priceHq40:"",
        priceHq45:"",
        priceNor20:"",
        priceNor40:"",
        price:""
      },
      price:[{label: '20GP:',value: 'priceGp20'}, {label: '40GP:', value: 'priceGp40'},{label: '40HQ:', value: 'priceHq40'},{label: '45HQ:', value: 'priceHq45'}
          ,{label: '20NOR:', value: 'priceNor20'}
          ,{label: '40NOR:', value: 'priceNor40'}
      ],
      loading:false,
      templateName:"",
      options: [],
      //附加费模板
      createdBy:'',
      rules: {
        templateName: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      tableConfig: {
        // 分页
          pagination: {
            pageSize: 10,
            show: true,
            total: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            isFirstPage: false,
            isLastPage: false
          }
      },
      tableHeight: 400,
      createdByEmployeeOptions: []
    };
  },
   // table基础组件
  components:{
   Pagination 
  },
  watch: {
    surchargeList: {
      handler(newVal) {
        if (newVal) this.surchargeData.surchargeList = newVal
      },
      deep: true
    }
  },
  created() {
     this.getList()
     this.getCurrencyList()
  },
  mounted() {
    // DOM加载完成后计算表格高度
    this.$nextTick(() => {
      this.dynamicHeight()
    })
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
  methods: {
        // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 分页
    handleSizeChange(val) {
      this.getList()
    },
    handleCurrentChange(val) {
      this.getList()
    },
		createdByFilterMehod(val) {
			this.getEmployeeName(val)
		},
		createdByVisibleChange(val) {
			if (val) {
				this.getEmployeeName()
			}
		},
		// 获取姓名
		getEmployeeName(val) {
			let data = {
        currPage: 1,
        pageSize: 50,
        query: [
          {column: 'roleCode', type: 'eq', value: 'pricing'},
          {column: 'employeeStatus', type: 'eq', value: 'all'},
          {column: 'name', type: 'eq', value: val ? val.replace(/^\s+|\s+$/g, '') : ''}
        ]
        // roleCode: 'pricing',
				// name: val ? val.replace(/^\s+|\s+$/g, '') : ''
			}
			listByRole(data).then(res => {
				this.createdByEmployeeOptions = res.data.list
					.map(item => {
						return Object.assign(item, {
							label: this.$language == 'en' ? item.ename : item.cname,
							value: item.employeeId
						})
					})
			})
		},
		handleChangeEmployeeId(val) {
			let findItem = this.createdByEmployeeOptions.find(item => item.value === val)
			this.queryForm.createdBy = findItem ? findItem.label : ''
		},
    async dynamicHeight(value) {
      let {surchargeTable, surchargeTableFooter} = this.$refs
      let height = document.documentElement.clientHeight || document.body.offsetHeight
      
      let table = surchargeTable.$el.getBoundingClientRect()
      let footer = surchargeTableFooter.$el.getBoundingClientRect()
      this.tableHeight = height - table.top - footer.height - 20 // 表格高度=文档高度-表格距顶部距离-表格分页-容器padding间距
    },
    loadTemplate(){
      //调用附加费模板数据
      userSurchargeList().then(res=>{
        this.options = this.optionsChildren(res.data)
      })
    },
    dialogClose(){
      this.surchargeData.createdBy=null;
      this.$refs["surchargeData"].resetFields();
    },
    optionsChildren(options){
      for (let i = 0; i < options.length; i++) {
        if(options[i].children.length===0){
            options[i].children = undefined
          }else{
            this.optionsChildren(options[i].children)
          }
        }
        return options
    },
    //搜索按钮
    handleSearch(){
      this.tableQuery.currPage = 1;
      this.getList();
    },
    //搜索取消按钮
    handleReset(){
      this.queryForm.templateName = undefined,
      this.queryForm.createdBy = undefined,
      this.handleSearch();
    },
    handleChange(templateId){
       let Id = templateId[templateId.length-1]
       this.handleEdit(Id,'copy');
    },
    //新建按钮操作
    handleAdd(){
      Object.assign(this.surchargeData, {}, {
        templateId:'',
        templateName: '',
        remark: '',
        surchargeList: [{}]
      })
      this.open = true;
      this.title = "附加费模板新增"
    },
    //新增一行
    handleAddLine(){
      this.surchargeData.surchargeList.push({})
    },
    //附加费编辑
    handleEdit(row, type){
      if(type==='copy'){
        this.title = "附加费模板新增"
      }else{
        this.title = "附加费修改"
      }
      const templateId = row.templateId || row
      surchargeInfo({templateId:templateId}).then(res=>{
        this.surchargeData.templateId = res.data.templateId
        this.surchargeData.templateName = res.data.templateName
        this.surchargeData.remark = res.data.remark
        this.surchargeData.surchargeList = res.data.surchargeList
         if (type === 'copy') {
           this.surchargeData.templateId = undefined;
         }
        // Object.assign(this.createdItem, res.data)
        this.open = true
      })
      
    },
    //删除列表
    handleDelete(row){
      const templateId = row.templateId;
      this.$confirm('是否确认删除附加费名称为"' + row.templateName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
        return surchargeDelete({templateId: templateId});
      }).then(() => {
        this.handleSearch();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
    
    getList() {
      this.loading = true;
      //初始化查询参数
      this.initQueryForm()
      surchargeList(this.tableQuery).then(res=>{
        this.tableData = res.data.list

        this.tableQuery.currPage = res.data.currPage
          this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
          this.tableConfig.pagination.isLastPage = res.data.isLastPage
          this.tableConfig.pagination.total = res.data.totalCount
          this.tableQuery.pageSize = res.data.pageSize
        this.loading = false
      })
    },
    initQueryForm(){
      let obj=this.queryForm;
      let query = []
      Object.keys(obj).forEach(function(key){
          if(obj[key]){
             //默认的查询条件组装tableQuery参数
            let tempQuery = {}
              Object.assign(tempQuery, {
                "column": key,
                "type": 'eq',
                "value": obj[key]
              })
              query.push(tempQuery)
          }
      })
      this.tableQuery.query=query;
    },
     // 取消按钮
    cancel() {
      this.open = false;
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid && this.validate()) {
              let surchargeList = this.surchargeData.surchargeList
              let list = []
              surchargeList.forEach(item => {
                  list.push(this.filterMethod(item.price))
                  list.push(this.filterMethod(item.priceGp20))
                  list.push(this.filterMethod(item.priceGp40))
                  list.push(this.filterMethod(item.priceHq40))
                  list.push(this.filterMethod(item.priceHq45))
                  list.push(this.filterMethod(item.priceNor20))
                  list.push(this.filterMethod(item.priceNor40))
              })
              
              let amtSum = list.reduce((prev,curr) => {
                  return prev+curr
              })
              if(amtSum <= 0){
                return this.$message.error('金额必须有一个大于0，否则录入无意义');
              }
              if (this.surchargeData.templateId) {
                surchargeUpdate(this.surchargeData).then(res=>{
                  this.$message({message: '恭喜你，修改成功', type: 'success'});
                  this.open = false
                  this.handleSearch()
                })
              } else {
                surchargeAdd(this.surchargeData).then(res=>{
                  this.$message({message: '恭喜你，增加成功', type: 'success'});
                  this.open = false
                  this.handleSearch()
                })
              }
          } else {
            return false;
          }
        });
    },
    //过滤的输入的方法
    filterMethod(data){
      if(data==='' || data === null || data === undefined){
        return 0
      } else {
        return Number(data)
      }
    },
    validate() {
      let reg = /^\d+(\.\d+)?$/
      let {surchargeList} = this.surchargeData
      let chargeCodeValid = surchargeList.some(item => !item.chargeCode)
      let payModeValid = surchargeList.some(item => !item.payMode)
      let rateUnitValid = surchargeList.some(item => !item.rateUnit)
      let currencyValid = surchargeList.some(item => !item.currency)
      let priceValid = surchargeList.some(item => item.rateUnit !== 'container_type' && (!reg.test(this.filterMethod(item.price)) ))
      let priceValid2 = surchargeList.some(item => item.rateUnit == 'container_type' && (!reg.test(this.filterMethod(item.priceGp20)) || !reg.test(this.filterMethod(item.priceGp40)) 
      || !reg.test(this.filterMethod(item.priceHq40)) || !reg.test(this.filterMethod(item.priceHq45)) || !reg.test(this.filterMethod(item.priceNor20)) 
      || !reg.test(this.filterMethod(item.priceNor40)) ))
      console.log('priceValid2', priceValid, priceValid2)
      if(surchargeList.length == 0){
        this.$message.error('请至少添加一条附加费')
        return false
      }
      if(chargeCodeValid){
        this.$message.error('费用名称不能为空')
        return false
      }
      if(payModeValid){
        this.$message.error('付款方式不能为空')
        return false
      }
      if(rateUnitValid){
        this.$message.error('计费单位不能为空')
        return false
      }
      if(currencyValid){
        this.$message.error('币种不能为空')
        return false
      }
      if(priceValid){
        this.$message.error('请输入正确的金额')
        return false
      }
      if(priceValid2){
        this.$message.error('请输入正确的金额')
        return false
      }
      // let boxValid = values.some(item => !numberReg.test(item.boxNo))
      // let quantityValid = values.some(item => !numberReg.test(item.quantity))
      // let weightValid = values.some(item => !reg.test(item.weight))
      // let volumeValid = values.some(item => !reg.test(item.volume))
      // if (!reg.test(val)) {
      //   this.$message({type: 'error', message: '请输入正确的金额'})
      // }
      // for(let item of this.surchargeData.surchargeList) {
      //   if(!item.chargeCode){
      //     this.$message.warning('费用代码不能为空')
      //     return false
      //   }
      //   if(!item.payMode){
      //       this.$message.warning('付款方式不能为空')
      //         return false
      //   }
      //   if(!item.rateUnit){
      //       this.$message.warning('计费单位不能为空')
      //         return false
      //   }
      //   if(item.rateUnit==='container_type'){
      //     if(!((item.priceGp20&&item.priceGp20.toString().trim())||(item.priceGp40&&item.priceGp40.toString().trim())||(item.priceHq40&&item.priceHq40.toString().trim())
      //     ||(item.priceHq45&&item.priceHq45.toString().trim())||(item.priceNor20&&item.priceNor20.toString().trim())||(item.priceNor40&&item.priceNor40.toString().trim()))){
      //       this.$message.warning('费用金额不能为空')
      //       return false
      //     }
      //   }
      //   if(item.rateUnit!='container_type'){
      //     if(!(item.price&&item.price.toString().trim())){
      //       this.$message.warning('费用金额不能为空')
      //       return false
      //     }
      //   }
        
      //   if(!item.currency){
      //     this.$message.warning('币种不能为空')
      //     return false
      //   }
      // }
      return true
    },
    //删除列表
    deleteClickLine(row){
      let surchargeList = this.surchargeData.surchargeList
      this.surchargeData.surchargeList = surchargeList.filter((item, index) => {
         return index !== row.$index
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
        row.rateUnit =item.feeUnit.toLowerCase()
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
     
    // 字段映射
    fieldMapping(props = {}, item = {}, key = "") {
      if (item[key] || item[key] === 0) return item[key];         // key值为整型0时一样返回0
      return item[props[key]]
    },
   }
   
}
</script>
<style  lang="scss" scoped>
// components/Base组件
  .surcharge{
    padding: 10px 10px 0;
    .components-container{
      padding: 4px 8px 8px 8px;
    }
    .surcharge-container{
      padding: 0 10px;
      background-color: #fff;
      position: relative;
    }
    .filter-containe {
      padding-top: 8px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      font-size: 12px;
      color: #333;
      align-items: baseline;
      flex-wrap: wrap;
      .filter{
        display: flex;
        // flex: 1;
        flex-direction: row;
        justify-content: flex-start;
        flex-wrap: wrap;
        /deep/ .el-input--mini .el-input__inner {
          line-height: 20px;
          height: 20px;
        }
        /deep/ .el-button--mini{
          padding: 2px 5px;
        }
      }
      .filter-item {
        display: inline-block;
        vertical-align: middle;
      }
    }
    .surcharge-pop-form{
      .input-container-dialog {
        float: left;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        margin: 0 0 10px;
        span.filter-txt {
          min-width: 80px;
          text-align: right;
        }
        /deep/.el-form-item__label, /deep/.el-form-item__content, /deep/.el-cascader--mini {
          line-height: 20px;
        }
        /deep/ .el-input--mini .el-input__inner {
          height: 20px;
          line-height: 20px;
        }
        /deep/ .el-input--mini .el-input__icon {
          line-height: 20px;
        }
        /deep/ .el-button--mini{
          padding: 2px 5px;
        }
      }
      /deep/ .el-table{
        .el-input--mini{
          .el-input__inner{
            line-height: 20px;
            height: 20px;
          }
          .el-input__icon{
            line-height: 20px;
          }
        }
      }
    }
    /deep/ .el-table {
      .el-button--mini{
        padding: 2px 5px;
        &.red{
          color: #cd4130;
        }
        &.orange{
          color: #E9851F;
        }
      }
      .el-input--mini{
        .el-input__inner, .el-input__icon{
          line-height: 20px;
          // height: 20px;
        }
      }
    }
    /deep/ .el-table th>.cell{
      color:#222222;
    }
    /deep/ .el-tag {
      background-color: #fff; 
      color: #4A4A4A; 
      border-style: none; 
    }
    .dialog-add{
      margin-top:16px;
      /deep/ .el-button {
        border: 1px dashed #DCDFE6;
      }
    }
    .input-width{
      width:240px;
    }
    .m-t-8{
      margin-top:8px;
    }
    /deep/.el-input__prefix{
      letter-spacing: -1px;
      line-height: 28px;
      color:#999;
    }
    /deep/.el-input--prefix .el-input__inner {
      padding-left: 45px;
    }
    /deep/ .el-input--mini .el-input__icon {
      line-height: 20px;
    }
  }
 .payment-advance{
    color:#fff;
    padding:2px 10px;
    // line-height: 150%;
    /* .payment-advance-list{
    } */
  }
  .operation-btns-box{
    padding-left:10px;
    /deep/ .el-button--mini{
      padding: 2px 5px;
    }
  }
  /deep/ .el-dialog__footer {
    .el-button--mini{
      padding: 2px 5px;
    }
  }
</style>