<template>
  <el-dialog class="base-dialog"  :title="title" :close-on-click-modal="false" :visible.sync="visible" width="600px" @close="dialogClose">
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
        <el-form-item label="岗位" label-width="100px" prop="deptRoleList">
          <el-select clearable filterable  multiple collapse-tags style="width:100%" size="mini"  v-model="createItem.deptRoleList" >
            <el-option v-for="(o, key) in jobOptions"
              :key="key"
              :label="o.jobCname"
              :value="o.jobCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="createItem.deptRoleList.includes('observer')" label="观察部门" label-width="100px" prop="observeDeptCodes">
          <el-cascader filterable size="mini"  style="width:100%" :options="departmentList" v-model="observeDeptCodes" @change="handleObserveChange" :props="observeCascaderProps" placeholder="请选择观察部门,可多选" change-on-select expandTrigger='click' ></el-cascader>
          <el-input v-show="false"  v-model="createItem.observeDeptCodes" size="mini"></el-input>
        </el-form-item>
        <el-form-item v-if="createItem.deptRoleList.includes('manager')" label="管理部门" label-width="100px" prop="managerDeptCodes">
          <el-cascader filterable size="mini"  style="width:100%" :options="departmentList" v-model="managerDeptCodes" @change="handleManagerChange" :props="observeCascaderProps" placeholder="请选择管理者部门,可多选" change-on-select expandTrigger='click' ></el-cascader>
          <el-input v-show="false"  v-model="createItem.managerDeptCodes" size="mini"></el-input>
        </el-form-item>
        <el-form-item v-if="createItem.deptRoleList.includes('sysline_manager')" label="管理航线" label-width="100px" prop="syslineGroupCodes">
          <el-select clearable filterable  multiple collapse-tags style="width:100%" size="mini"  v-model="createItem.syslineGroupCodes" >
            <el-option v-for="(o, key) in lineGroupList"
              :key="key"
              :label="o.sysLineGroupCname"
              :value="o.sysLineGroupCode">
            </el-option>
          </el-select>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm('createItemForm')">确定</el-button>
      <el-button  size="mini" @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import {departmentTreeList,employeeInfo,jobSelectList,jobSave,getLineGroupList} from '@/api/companyResource'
export default {
  name:"jobSave",
  data() {
    return {
      lineGroupList: [],
      filterText: '',
      //弹框标题
      title:"",
      //弹框开关
      visible:false,
      dataFormLoading: false,
      departmentList:[],
      observeDeptCodes:[],
      managerDeptCodes:[],
      roleList: [],
      jobOptions:[],//员工职务岗位
      cascaderProps: {
        children: 'childList',
        label: 'deptCname',
        value: 'deptCode'
      }, 
      observeCascaderProps: {
        multiple: true,
        children: 'childList',
        label: 'deptCname',
        value: 'deptCode'
      },
      createItem:{
        employeeId:'',
        deptCode:'',
        deptCodes:[],
        deptRoleList:'',
        observeDeptCodes:[],
        managerDeptCodes:[],
        syslineGroupCodes:[]
      },
      rules: {
        deptRoleList:[ { required: true, message: '岗位不能为空', trigger: 'change' }] ,
        observeDeptCodes:[{ required: true, message: '管理部门不能为空', trigger: 'blur' }] ,
        managerDeptCodes:[ { required: true, message: '管理部门不能为空', trigger: 'blur' }],
        syslineGroupCodes:[ { required: true, message: '管理航线不能为空', trigger: 'blur' }]
      },
      loading:false,
    };
  },
   // table基础组件
  components:{
  },
  created() {
  },
  mounted() {
    this.getLineGroupList()
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },

  methods: {
    getLineGroupList(){
      getLineGroupList({pageSize:9999}).then(res=>{
        if(res.code === 0){
          if(res.data&&res.data.list){
            this.lineGroupList = res.data.list
          }
        }
        
      })
    },
    init(row){
      this.title="修改岗位"
      this.visible=true
      this.createItem.employeeId=row.employeeId
      this.createItem.deptRoleList=row.deptRoleList

      let arr=[]
      if(Array.isArray(row.syslineGroups)){
        for(let i=0;i<row.syslineGroups.length;i++){
          arr.push(row.syslineGroups[i].sysLineGroupCode)
        }
      }
      this.createItem.syslineGroupCodes=arr
      this.loanBasicData()
    },
    getObserverDeptCodes(){
        employeeInfo({employeeId:this.createItem.employeeId}).then(res=>{
           if(res.data){
              let obserDeptCodes=res.data.observeDeptCodeList
              this.createItem.observeDeptCodes=res.data.observeDeptCodeList;
              this.observeDeptCodes=[]
              obserDeptCodes.map(item=>{
                  let obserCodes=[]
                  let codeLevel=item.length/3
                  for(var i=0;i<codeLevel;i++){
                      obserCodes.push(item.substring(0,(i+1)*3))
                  }
                  this.observeDeptCodes.push(obserCodes);
              })
              let managerDeptCodes=res.data.managerDeptCodeList
              this.createItem.managerDeptCodes=res.data.managerDeptCodeList;
              this.managerDeptCodes=[]
              managerDeptCodes.map(item=>{
                  let obserCodes=[]
                  let codeLevel=item.length/3
                  for(var i=0;i<codeLevel;i++){
                      obserCodes.push(item.substring(0,(i+1)*3))
                  }
                  this.managerDeptCodes.push(obserCodes);
              })

           }
        })
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        employeeId:'',
        observeDeptCodes:[],
        managerDeptCodes:[],
        deptRoleList:[],
        syslineGroupCodes:[]
      })
      this.observeDeptCodes=[]
      this.managerDeptCodes=[]
    },
    loanBasicData(){
        departmentTreeList({state:'valid'}).then(res=>{
          this.departmentList = this.getTreeData(res.data);
        })
        jobSelectList().then(res=>{
          this.jobOptions = res.data;
        })
        if(this.createItem.deptRoleList.includes('observer')||this.createItem.deptRoleList.includes('manager')){
           this.getObserverDeptCodes();
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
    handleObserveChange(value){
      this.createItem.observeDeptCodes=[];
      value.map(item=>{
        this.createItem.observeDeptCodes.push(item[item.length - 1])
      })
    },

    handleManagerChange(value){
      this.createItem.managerDeptCodes=[];
      value.map(item=>{
        this.createItem.managerDeptCodes.push(item[item.length - 1])
      })
    },
     // 取消按钮
    cancel() {
      this.visible = false;
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
             jobSave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.visible = false
                this.$emit('refreshDataList');
              })
          } else {
            return false;
          }
        });
    },
     
   }
   
}
</script>
<style  lang="scss" scoped>
</style>