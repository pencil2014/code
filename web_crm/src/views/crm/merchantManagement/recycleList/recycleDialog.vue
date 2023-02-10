<template>
  <el-dialog title="分配" :visible.sync="recycleOption.show" append-to-body width="440px" class="recycle-form">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="mini">
      <el-form-item label="分配权限" prop="assignType">
        <el-select v-model="form.assignType" placeholder="请选择" @change="getEmployeeList()" :disabled="!recycleOption.isCts">
          <el-option v-for="item in assignTypeList" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分配维护人" prop="belongEmployeeId">
        <el-select v-model="form.belongEmployeeId" placeholder="请选择" filterable clearable remote :remote-method="getEmployeeList" @change="changeEmployee">
          <el-option v-for="item in employeeList" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维护人类型" prop="maintainerType" v-if="form.assignType == 'bd'">
        <el-select v-model="form.maintainerType" placeholder="请选择" filterable clearable remote >
          <el-option v-for="item in maintainerTypeList" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="新旧模式" prop="bdServiceMode" v-if="form.assignType == 'bd'">
        <el-select v-model="form.bdServiceMode" placeholder="请选择" filterable clearable remote >
          <el-option v-for="item in bdServiceMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item> -->
      <div v-if="relationList.length>0 && form.assignType == 'bd'">
        <div v-for="(item,index) in relationList" :key="index" class="relation_list">{{item}}</div>
        <div class="goon">以上客户分配时会绑定分配,是否确认继续分配?</div>
      </div>

    </el-form>
    <div slot="footer" class="dialog-footer">
			<el-button type="primary"  @click="submit" size="mini">确定</el-button>
			<el-button size="mini" @click="cancle">取消</el-button>
		</div>
  </el-dialog>
</template>

<script>
import { listByRole, listByDeptRole } from '@/api/base'
import RECYCLE from '@/api/crm/recycle'
export default {
  props: {
    recycleOption: {
      type: Object,
      default: () => ({})
    },
    rowDept: {
      type: String,
      default: () => ''
    },
    activeName: {
      type: String,
      default: () => ''
    },
    custId: {
      type: Array,
      default: () => ([])
    },
  },
  data () {
    return {
      relationList:[],
      form: {
        belongEmployeeId: '',
        belongEmployeeName: '',
        belongDeptCode: '',
        belongDeptName: '',
        assignType: '',
        // bdServiceMode:'',
        maintainerType:'',
      },
      rules:{
        assignType: {
          required: true, message: '分配权限不能为空', trigger: 'change'
        },
        belongEmployeeId: {
          required: true, message: '分配维护人不能为空', trigger: 'change'
        },
        // bdServiceMode: {
        //   required: true, message: '新旧模式不能为空', trigger: 'change'
        // },
        maintainerType: {
          required: true, message: '维护人类型不能为空', trigger: 'change'
        },
      },
      assignTypeList: [
        {label: '组长', value: 'manager'},
        {label: '业务员', value: 'bd'}
      ],
      maintainerTypeList:[
        // {label: '潜在维护人', value: 'potential'}
      ],
      employeeList: [],
      // bdServiceMode: [
      //   {label: '新模式', value: 'new'},
      //   {label: '旧模式', value: 'old'}
      // ],
      rowDepts:'',
      activeNames:'',
    }
  },
  created () {
    this.activeNames = this.$route.query.isGroup?this.$route.query.isGroup:this.activeName
    this.form.assignType = this.recycleOption.isCts ? 'manager' : 'bd'
    this.form.shareType = this.recycleOption.shareType
    this.getRelation()
  },
  methods: {
    // 获取名下关联公司
    getRelation(){
      RECYCLE.claimOrAssignValid({custids:this.custId}).then(res => {
        let list = res.data
        list.forEach(item => {
          this.relationList.push('"'+ item.names +'"为"' + item.name+'"的关联同一家公司')
        });
      })
    },
    getEmployeeList (val = '') {
      this.rowDepts = this.$route.query.rowDept?this.$route.query.rowDept:this.rowDept
      let assignType = this.form.assignType
      if (assignType === 'manager') {
        this.relationList = []
        listByDeptRole({
          currPage: 1,
          pageSize: 1000,
          query: [{
            column: 'deptRole',
            type: 'eq',
            value: 'manager'
          },
          {
            column: 'name',
            type: 'like',
            value: val
          }
          ]
        }).then(res => {
          if (res.code === 0) {
            if(this.activeNames === 'department'){
              //部门公海，通过部门code筛选
              const deptList = res.data.list.filter(item => item.deptCode.includes(this.rowDepts))
              this.employeeList = deptList.map(item => {
                return Object.assign({},item, {
                  label: item.cname,
                  value: item.employeeId
                })
              })
            }else{
              this.employeeList = res.data.list.map(item => {
                return Object.assign({},item, {
                  label: item.cname,
                  value: item.employeeId
                })
              })
            }
          }
        }).catch(()=>{})
      }else if (assignType === 'bd') {
        //选择业务员
        let data = {
          currPage: 1,
          pageSize: 1000,
          query: [
            {
              column: 'roleCode',
              type: 'eq',
              value: 'bd,obd'
            },
            {
              column: 'name',
              type: 'like',
              value: val
            }
          ]
        }
        let deptCode = this.$store.state.user.deptCode
        let roles = this.$store.state.user.roles
        let isCts = roles.includes('cts')
        let isManager = roles.includes('manager')
        if(!isCts && isManager && this.activeNames === 'department'){
          //组长分配有新的接口.且在部门公海
          RECYCLE.getEmployeesBydpCode(data).then(res => {
            if (res.code === 0) {
              this.employeeList = res.data.list.map(item => {
                return Object.assign({},item, {
                  label: item.cname,
                  value: item.employeeId
                })
              })
            }
          })

        }else{
          listByRole(data).then(res => {
            if (res.code === 0) {
                  this.employeeList = res.data.list.map(item => {
                    return Object.assign({},item, {
                      label: item.cname,
                      value: item.employeeId
                    })
                  })
            }
          }).catch(() => {})
        }

      } else {
        this.employeeList = []
      }
    },
    changeEmployee (val) {
      let source = this.employeeList.filter(item => item.employeeId === val)[0]
      let { employeeId:belongEmployeeId, cname:belongEmployeeName, deptCode:belongDeptCode, deptCname: belongDeptName } = source
      this.form = Object.assign(this.form, {
        belongEmployeeId,
        belongEmployeeName,
        belongDeptCode,
        belongDeptName
      })
      this.getEmployeeList()
      let bdDeptCode = source.deptCode
      if(this.recycleOption.shareType === 'single'){
        //单个分配
        if(this.activeName === 'group'){//集团公海
          if(this.recycleOption.chinaPeer === 'yes'){ //国内同行
            if(this.recycleOption.sowollId.includes(belongEmployeeId)){//sowoll独立账号
              this.maintainerTypeList = [
                {label: '线上维护人', value: 'online'},
              ]
              this.form.maintainerType = 'online'
            }else{//非sowoll独立账号
              this.maintainerTypeList = [
                {label: '潜在维护人', value: 'potential'},
                {label: '线上维护人', value: 'online'},
              ]
            }
          }else{//非国内同行
            console.log('非国内')
            this.maintainerTypeList = [
              {label: '潜在维护人', value: 'potential'},
            ]
            this.form.maintainerType = 'potential'
          }
        }else{//部门公海
          if(this.recycleOption.departPop === 'yes'){//推广组
            if(bdDeptCode.includes('000040000')){//sowoll公共组
              this.maintainerTypeList = [
                {label: '线上维护人', value: 'online'},
              ]
              this.form.maintainerType = 'online'
            }else{//非公共组其他人
              this.maintainerTypeList = [
                {label: '潜在维护人', value: 'potential'},
                {label: '线上维护人', value: 'online'},
              ]
            }
          }else{//其他部门
            this.maintainerTypeList = [
              {label: '潜在维护人', value: 'potential'},
            ]
            this.form.maintainerType = 'potential'
          }
        }
      }else{//批量分配
          if(this.recycleOption.departPop === 'yes'){//推广组
            if(bdDeptCode.includes('000040000')){//sowoll公共组
              this.maintainerTypeList = [
                {label: '线上维护人', value: 'online'},
              ]
              this.form.maintainerType = 'online'
            }else{//非公共组其他人
              this.maintainerTypeList = [
                {label: '潜在维护人', value: 'potential'},
                {label: '线上维护人', value: 'online'},
              ]
            }
          }else{//其他部门
            this.maintainerTypeList = [
              {label: '潜在维护人', value: 'potential'},
              {label: '线上维护人', value: 'online'},
            ]
          }
      }
    },
    submit () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$emit('submit', this.form)
        }
      })
    },
    cancle(){
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.recycle-form ::v-deep {
  .el-form-item__label {
    height: 20px !important;
    line-height: 20px !important;
  }
  // 不能粗暴的设置.el-form-item__content高度20px, 因为存在多行或者文件上传的情况
  .el-form-item__content {
    line-height: 20px !important;
  }
  input,
  select{
    width: 300px;
  }
  input,
  select,
  .el-input__inner,
  .el-input__icon{
    height: 20px ;
    line-height: 20px !important;
  }
  .el-dialog__body{
    padding: 20px 0 5px;
  }
  .dialog-footer .el-button {
    padding: 0 10px;
    height: 20px;
  }
  .relation_list{
    width: 86%;
    margin:3px auto 0;
  }
  .goon{
    margin-left:7%;
    margin-top:5px;
  }
}
</style>
