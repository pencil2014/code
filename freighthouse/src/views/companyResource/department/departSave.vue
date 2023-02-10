<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="700px"
    @close="dialogClose"
  >
    <el-form
      :model="createItem"
      :rules="rules"
      ref="createItemForm"
      @keyup.enter.native="submitForm('createItemForm')"
      label-width="120px"
      label-suffix=":"
      v-loading="dataFormLoading"
    >
    <el-row>
      <el-form-item label="组织类别" prop="deptType">
        <el-select
          style="width:540px"
          size="mini"
          v-model="createItem.deptType"
          :disabled="createItem.deptId!==''"
          @change="deptTypeChange"
        >
          <el-option
            v-for="(o, key) in dictMap['deptType'] "
            :key="key"
            :label="$t(`dict.deptType.${o.value}`)"
            :value="o.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-row>
      <!-- <el-form-item label="公司全称" v-if="createItem.deptType==='branch_company'" prop="companyName">
        <el-input
          style="width:80%"
          size="mini"
          placeholder="请输入公司名字全称"
          v-model="createItem.companyName"
        ></el-input>
      </el-form-item> -->
      <el-row  v-if="createItem.deptType==='branch_company'">
         <el-col :span="12"  >
            <el-form-item label="国家"  prop="countryCname">
              <el-autocomplete
              style="width:210px"
                size="mini"
                v-model="createItem.countryCname"
                :fetch-suggestions="
                  (queryString, cb) => {
                    countryQuery(queryString, cb);
                  }
                "
                placeholder="请选择国家"
                highlight-first-item
                @change="
                  (value) => {
                    countrySelect(value);
                  }
                "
                @select="
                  (value) => {
                    countrySelect(value);
                  }
                "
              >
                <template slot-scope="{ item }">
                  <div class="name">{{ item.cname }}</div>
                </template>
              </el-autocomplete>
            </el-form-item>
         </el-col>
         <el-col :span="12">
          <el-form-item label="城市" prop="cityCname">
              <el-autocomplete
                size="mini"
                style="width:210px"
                v-model="createItem.cityCname"
                :fetch-suggestions="
                  (queryString, cb) => {
                    cityQuery(queryString, '', cb);
                  }
                "
                placeholder="请选择城市"
                highlight-first-item
                @change="
                  (value) => {
                    citySelect(value, '');
                  }
                "
                @select="
                  (value) => {
                    citySelect(value, '');
                  }
                "
              >
                <template slot-scope="{ item }">
                  <div class="name">{{ item.cname }}</div>
                </template>
              </el-autocomplete>
            </el-form-item>
         </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
        <el-form-item label="组织中文简称" prop="deptCname">
          <el-input  size="mini" v-model="createItem.deptCname"></el-input>
        </el-form-item>
        </el-col>
         <el-col :span="12">
        <el-form-item label="组织英文名称" prop="deptEname">
          <el-input  size="mini" v-model="createItem.deptEname"></el-input>
        </el-form-item>
         </el-col>
      </el-row>
      <el-row>
         <el-col :span="12">
            <el-form-item label="组织中文全称" prop="deptFullCname">
              <el-input size="mini" placeholder="请输入组织中文全称" v-model="createItem.deptFullCname"></el-input>
            </el-form-item>
         </el-col>
         <el-col :span="12">
            <el-form-item label="组织英文全称" prop="deptFullEname">
              <el-input  size="mini" v-model="createItem.deptFullEname"></el-input>
            </el-form-item>
         </el-col>
      </el-row>
       <el-row>
         <el-col :span="12">
          <el-form-item label="上级组织" prop="parentCodes">
            <el-cascader
              :disabled="createItem.deptId!=''"
              filterable
              size="mini"
              style="width:210px"
              :options="departmentList"
              v-model="createItem.parentCodes"
              @change="handleChange"
              :props="cascaderProps"
              placeholder="请选择上级组织"
              change-on-select
              expandTrigger="click"
            ></el-cascader>
          </el-form-item>
         </el-col>
         <el-col :span="12">
          <el-form-item label="财务代码" prop="finCode">
            <el-input size="mini" v-model="createItem.finCode" ></el-input>
          </el-form-item>
         </el-col>
       </el-row>
        <el-row>
           <el-col :span="12">
             <el-form-item label="是否海外公司" v-if="createItem.deptType==='branch_company'" prop="isAbroad">
              <el-select  style="width:210px" size="mini" v-model="createItem.isAbroad">
                <el-option
                  v-for="(o, key) in dictMap['yesNo'] "
                  :key="key"
                  :label="$t(`dict.yesNo.${o.value}`)"
                  :value="o.value"
                ></el-option>
              </el-select>
            </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="城市代码简称"
                v-if="createItem.deptType==='branch_company'"
                prop="cityShortCode"
              >
                <el-input
                  :disabled="createItem.deptId!=''"
                  size="mini"
                  placeholder="分公司城市代码简称,用于生成财务编号前缀"
                  v-model="createItem.cityShortCode"
                ></el-input>
              </el-form-item>
            </el-col>
      </el-row>
       <el-row>
          <el-col :span="12">
              <el-form-item label="是否独立核算" prop="selfSettle"    v-if="createItem.deptType==='branch_company'">
                <el-select  style="width:210px"  size="mini" v-model="createItem.selfSettle">
                  <el-option
                    v-for="(o, key) in dictMap['yesNo'] "
                    :key="key"
                    :label="$t(`dict.yesNo.${o.value}`)"
                    :value="o.value"
                  ></el-option>
                </el-select>
              </el-form-item>
         </el-col>
          <el-col :span="12">
                 <el-form-item label="结算分公司" prop="unitName" v-if="createItem.selfSettle==='no'&&createItem.deptType==='branch_company'">
                  <el-autocomplete
                    size="mini"
                    clearable
                    style="width:210px"
                    v-model="createItem.unitName"
                    :fetch-suggestions="settleSearchAsync"
                    placeholder="请选择结算分公司"
                    @select="handleSelect($event)"
                    @change="handleSelect($event)"
                  >
                    <template slot-scope="{ item }">
                      <div class="name">{{ item.unitName }}</div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="是否委托协同" v-if="createItem.deptType==='department'" prop="isAbroad">
              <el-select  style="width:210px" size="mini" v-model="createItem.selfSettle">
                <el-option
                  v-for="(o, key) in dictMap['yesNo'] "
                  :key="key"
                  :label="$t(`dict.yesNo.${o.value}`)"
                  :value="o.value"
                ></el-option>
              </el-select>
            </el-form-item>
            </el-col>
            <el-col :span="12">
                 <el-form-item label="结算分公司" prop="unitName" v-if="createItem.deptId&&createItem.deptType==='department'">
                  <el-autocomplete
                    size="mini"
                    style="width:210px"
                    clearable
                    v-model="createItem.unitName"
                    :fetch-suggestions="settleSearchAsync"
                    disabled
                    placeholder="请选择结算分公司"
                    @select="handleSelect($event)"
                    @change="handleSelect($event)"
                  >
                    <template slot-scope="{ item }">
                      <div class="name">{{ item.unitName}}</div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                  <el-form-item label="是否有效" prop="state">
                  <el-select   style="width:210px" size="mini" v-model="createItem.state">
                    <el-option
                      v-for="(o, key) in dictMap['state'] "
                      :key="key"
                      :label="$t(`dict.state.${o.value}`)"
                      :value="o.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
            </el-col>
              <el-col :span="12">
                <el-form-item label="是否公共部门"  prop="isPublic">
                   <el-select  style="width:100%" size="mini"  v-model="createItem.isPublic" >
                    <el-option v-for="(o, key) in dictMap['yesNo'] "
                        :key="key"
                        :label="$t(`dict.yesNo.${o.value}`)"
                        :value="o.value">
                      </el-option>
                    </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="createItem.deptType === 'department'">
                <el-form-item label="是否可录费用"  prop="isExpenseEntry">
                   <el-select  style="width:100%" size="mini"  v-model="createItem.isExpenseEntry" >
                    <el-option v-for="(o, key) in dictMap['yesNo'] "
                        :key="key"
                        :label="$t(`dict.yesNo.${o.value}`)"
                        :value="o.value">
                      </el-option>
                    </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="公共员工" prop="publicEmpNo">
                  <el-select filterable remote clearable
                      style="width:100%" size="mini" v-model="createItem.publicEmpNo" placeholder="请选择员工"  
                      :remote-method="getPublicEmpNameList"
                      :visible-change="(val)=>{if(!val){getPublicEmpNameList(val)}}"
                       @change="getPublicEmpNameChange"
                    >
                    <el-option v-for="o in employeeOptions"
                      :key="o.employeeNo"
                      :label="o.cname+'  ('+o.employeeNo+')'"
                      :value="o.employeeNo">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12"  v-if="createItem.deptType === 'department'">
                <el-form-item label="部门类型" prop="deptSubType">
                  <el-select  style="width:100%" size="mini"  v-model="createItem.deptSubType" >
                    <el-option v-for="(o, key) in dictMap['deptSubType'] "
                      :key="key"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负责人" prop="managerId">
                  <el-select filterable remote clearable
                    style="width:100%" size="mini"  v-model="createItem.managerId" placeholder="请选择航负责人" 
                    :remote-method="getEmployeeList"
                    @change="managerNameChange"
                      >
                      <el-option v-for="o in managerList"
                      :key="o.employeeId"
                      :label="o.cname+'  ('+o.employeeNo+')'"
                      :value="o.employeeId">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <!-- added on 2022-5-11 -->
              <el-col :span="12" v-if="createItem.deptType === 'department'">
                <el-form-item label="负责范围" prop="dutyScope">
                  <el-select clearable style="width:100%" size="mini"  v-model="createItem.dutyScope" placeholder="请选择负责范围">
                    <el-option v-for="(o, key) in dictMap['dutyScope'] "
                      :key="key"
                      :label="o.label"
                      :value="o.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
       </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm('createItemForm')">确定</el-button>
      <el-button size="mini" @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { departmentTreeList, departmentSave, settleUnitSelectList, employeeSelectlist } from '@/api/companyResource'
import {
  countrySelectList,
  citySelectList,
} from "@/api/base";
export default {
  name: 'departSave',
  data() {
    return {
      managerList:[],
      employeeOptions:[],
      filterText: '',
      //弹框标题
      title: '',
      //弹框开关
      visible: false,
      dataFormLoading: false,
      finCodeDisabled:false,
      parentCodes: [],
      departmentList: [],
      menuList: [],
      roleList: [],
      cascaderProps: {
        children: 'childList',
        label: 'deptCname',
        value: 'deptCode',
      },
      createItem: {
        deptId: '',
        deptType: '',
        deptCname: '',
        deptEname: '',
        parentCodes: [],
        finCode: '',
        selfSettle: '',
        parentCode: '',
        state: 'valid',
        settleCompanyCode: '',
        unitName: '',
        isAbroad: 'no',
        cityShortCode: '',
        // companyName: '',
        deptFullCname: '',
        deptFullEname: '',
        countryCname:'中国',
        countryCode:'CN',
        cityCname:'',
        cityCode:'',
        isPublic:'no',
        isExpenseEntry:'',
        publicEmpNo:'',
        publicEmpName:'',
        managerId:'',
        managerName:'',
        deptSubType:'',
        dutyScope: ''
      },
      rules: {
        // companyName: [{ required: true, message: '公司名字全称不能为空', trigger: 'blur,change' }],
        deptFullCname : [{ required: true, message: '组织中文全称不能为空', trigger: 'blur,change' }],
        deptCname: [{ required: true, message: '部门中文名称不能为空', trigger: 'blur,change' }],
        finCode: [{ required: true, message: '财务代码不能为空', trigger: 'blur,change' }],
        parentCodes: [{ required: true, message: '上级组织不能为空', trigger: 'blur,change' }],
        deptType: [{ required: true, message: '组织类别不能为空', trigger: 'blur,change' }],
        unitName: [{ required: true, message: '结算单位不能为空', trigger: 'blur,change' }],
        cityShortCode: [{ required: true, message: '城市代码简称不能为空', trigger: 'blur,change' }],
      },
      loading: false,
    }
  },
  // table基础组件
  components: {},
  created() {},
  mounted() {},
  computed: {
    ...mapGetters(['userId', 'dictMap']),
  },

  methods: {
    init(row) {
      this.title = '新增'
      this.finCodeDisabled = false
      if (row) {
        this.title = '编辑'
        this.finCodeDisabled = true
        for (var p in this.createItem) {
          this.createItem[p] = row[p]
        }
        this.handlerParentCodes()
        if(this.title === '编辑'){
          this.getPublicEmpNameList(this.createItem.publicEmpName)
          this.getEmployeeList(this.createItem.managerName)
        }
      }
      if(this.title === '新增'){
        this.getPublicEmpNameList(this.createItem.publicEmpName)
      }
      this.visible = true
      this.loanBasicData()
    },
    handlerParentCodes() {
      this.createItem.parentCodes = []
      let codeLevel = this.createItem.parentCode.length / 3
      for (var i = 0; i < codeLevel; i++) {
        this.createItem.parentCodes.push(this.createItem.parentCode.substring(0, (i + 1) * 3))
      }
    },
    //清空数据
    dialogClose() {
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        deptId: '',
        deptType: '',
        deptCname: '',
        deptEname: '',
        parentCodes: [],
        finCode: '',
        selfSettle: '',
        parentCode: '',
        state: 'valid',
        settleCompanyCode: '',
        unitName: '',
        isAbroad: 'no',
        cityShortCode: '',
        // companyName: '',
        deptFullCname: '',
        deptFullEname: '',
        countryCname:'中国',
        countryCode:'CN',
        cityCname:'',
        cityCode:'',
        isPublic:'no',
        isExpenseEntry:'',
        publicEmpNo:'',
        publicEmpName:'',
        managerId:'',
        managerName:'',
        deptSubType:'dept'
      })
    },
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList = this.getTreeData(res.data)
      })
    },
    //清空独立结算信息
    deptTypeChange(val){
        this.createItem.selfSettle="no"
        this.createItem.settleCompanyCode=""
        this.createItem.unitName=""
      console.log(val);
      if(val !== 'department'){
        this.createItem.isExpenseEntry = ''
        this.createItem.deptSubType=""
      }else{
        this.createItem.deptSubType="dept"
      }
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].childList.length) {
          // children若为空数组，则将children设为undefined
          data[i].childList = undefined
        } else {
          this.getTreeData(data[i].childList)
        }
      }
      return data
    },
    handleChange(value) {
      this.createItem.parentCode = value[value.length - 1]
    },
    // 取消按钮
    cancel() {
      this.visible = false
    },
    //保存按钮操作
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid&&this.dataValid()) {
          departmentSave(this.createItem).then((res) => {
            this.$message({ message: '恭喜你，保存成功', type: 'success' })
            this.visible = false
            this.$emit('refreshDataList')
          })
        } else {
          return false
        }
      })
    },
    //员工下拉
    getPublicEmpNameList(queryString){
      let addSysUserFlag=this.title === '编辑'?"":"true"
      employeeSelectlist({name:queryString,addSysUserFlag:addSysUserFlag,isPublic:'yes'}).then(res=>{
        this.employeeOptions = res.data
      })
    },
    dataValid(){
      // if(this.createItem.deptType==='branch_company'&&!this.createItem.deptFullCname){
      //      this.$message({ message: '组织中文全称不能为空', type: 'error' })
      //      return false
      // }
      return true
    },
    //默认30条
    settleSearchAsync(queryString, cb) {
      let params = {}
      Object.assign(params, {
        name: queryString,
        size: 30,
        unitTypes: 'company',
      })
      settleUnitSelectList(params).then((data) => {
        cb(data.data)
      })
    },
    handleSelect(row) {
      this.createItem.unitName = row.unitName
      this.createItem.settleCompanyCode = row.unitCode
    },

 
   countryQuery(queryString, cb) {
      let params = {};
      Object.assign(params, {
        countryCode: queryString,
        state: "valid",
      });
      countrySelectList(params).then((response) => {
        cb(response.data);
      });
    },
    cityQuery(queryString, type, cb) {
      if (this.createItem.countryCode || type === "query") {
        let params = {};
        Object.assign(params, {
          countryCode: type === "query" ? "" : this.createItem.countryCode,
          cityCode: queryString,
          state: "valid",
        });
        citySelectList(params).then((response) => {
          cb(response.data);
        });
      }
    },
    citySelect(val, type) {
      if (type === "query") {
        this.queryForm.cityName = val.cname;
        this.queryForm.cityCode = val.cityCode;
      } else {
        this.createItem.cityCname = val.cname;
        this.createItem.cityCode = val.cityCode;
      }
    },
    countrySelect(val) {
      this.createItem.countryCname = val.cname;
      this.createItem.countryCode = val.countryCode;
      this.createItem.cityCode = "";
      this.createItem.cityCname = "";
    },
    getEmployeeList(queryString){
      employeeSelectlist({name:queryString,roleCodes:''}).then(res=>{
        this.managerList = res.data
      })
    },
    managerNameChange(val){
      console.log(val);
      this.managerList.forEach(item=> {
        if(item.employeeId === val){
          this.createItem.managerName = item.cname
        }
      })
      if(!val){
        this.getEmployeeList('')
      }
    },
    getPublicEmpNameChange(val){
      console.log(val);
      // this.employeeOptions.forEach(item=> {
      //   if(item.employeeId === val){
      //     this.createItem.managerName = item.cname
      //   }
      // })
      if(!val){
        this.getEmployeeList('')
      }
    }
  },
}
</script>
<style  lang="scss" scoped>
// components/Base组件
.menu {
  .filter-containe {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    font-size: 12px;
    color: #333;
    align-items: baseline;
    flex-wrap: wrap;
    .filter {
      display: flex;
      // flex: 1;
      flex-direction: row;
      justify-content: flex-start;
      flex-wrap: wrap;
    }
    .filter-item {
      display: inline-block;
      vertical-align: middle;
    }
  }

  .input-container-dialog {
    float: left;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin: 10px 0 20px;
    margin-right: 25px;

    span.filter-txt {
      min-width: 80px;
      text-align: right;
    }
  }
  .el-dialog__header {
    background: #2d3a5d;
    padding: 10px 20px 10px;
    span {
      padding: 10px;
      color: #fff;
      font-size: 12px;
    }
    .el-dialog__headerbtn {
      top: 15px;
    }
  }
  .el-table th > .cell {
    color: #222222;
  }
  .el-tag {
    background-color: #fff;
    color: #4a4a4a;
    border-style: none;
  }
  .dialog-add {
    margin-top: 16px;
    .el-button {
      border: 1px dashed #dcdfe6;
    }
  }
  .input-width {
    width: 150px;
  }
  .m-t-8 {
    margin-top: 8px;
  }
  .el-input__prefix {
    line-height: 28px;
    color: #000000;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }
}
.payment-advance {
  color: #fff;
  padding: 6px 16px;
  line-height: 150%;
}

.operation-btns-box {
  padding-left: 10px;
}
.parentWrap {
  margin-left: 12px;
  padding-bottom: 10px;
  .text {
    font-size: 14px;
  }
}

.el-cascader-panel .el-radio {
  z-index: 10;
  width: 99%;
  height: 99%;
  position: absolute;
  top: 10px;
  right: -12px;
}
.el-cascader-panel .el-radio__input {
  visibility: hidden;
}
.el-cascader-panel .el-cascader-node__postfix {
  top: 10px;
}
</style>