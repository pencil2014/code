<template>
  <el-dialog title="分配" :visible.sync="recycleOption.show" append-to-body width="440px" class="recycle-form">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="mini">
      <el-form-item label="分配权限" prop="assignEmployeeRole">
        <el-select v-model="form.assignEmployeeRole" placeholder="请选择" @change="getEmployeeList()"
         :disabled="recycleOption.assignToEmployeeRole==='group_leader'">
          <el-option v-for="item in assignTypeList" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分配维护人" prop="assignToEmployeeId">
        <el-select v-model="form.assignToEmployeeId" placeholder="请选择" filterable clearable remote :remote-method="getEmployeeList" @change="changeEmployee">
          <el-option v-for="item in employeeList" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
			<el-button type="primary"  @click="submit" size="mini">确定</el-button>
			<el-button size="mini" @click="cancle">取消</el-button>
		</div>
  </el-dialog>
</template>

<script>
import { listByRole, listByDeptRole } from '@/api/base'
// import RECYCLE from '@/api/crm/recycle'
import DIMISSION from '@/api/crm/dimission'
export default {
  props: {
    rowDept: {
      type: String,
      default: () => ''
    },
    recycleOption: {
      type: Object,
      default: () => ({})
    },
    activeName: {
      type: String,
      default: () => ''
    },
    custid: {
      type: [Number, Array],
      default: 'auto'
    },
    oid: {
      type: [Number, Array],
      default: 'auto'
    },
  },
  data () {
    return {
      form: {
        assignToEmployeeId: '',
        assignToEmployeeName: '',
        belongDeptCode: '',
        belongDeptName: '',
        assignEmployeeRole: '',
        oid:this.oid,
        custid:this.custid
      },
      rules:{
        assignEmployeeRole: {
          required: true, message: '分配权限不能为空', trigger: 'change'
        },
        assignToEmployeeId: {
          required: true, message: '分配维护人不能为空', trigger: 'change'
        },
      },
      assignTypeList: [
        {label: '指定组长分配', value: 'group_leader'},
        {label: '业务员', value: 'sales_man'}
      ],
      employeeList: [],
      activeNames:'',
    }
  },
  created () {
    this.activeNames = this.$route.query.isGroup?this.$route.query.isGroup:this.activeName
    console.log('this.recycleOption.assignToEmployeeRole ',this.recycleOption.assignToEmployeeRole )
    this.form.assignEmployeeRole = this.recycleOption.assignToEmployeeRole==='group_leader' ? 'sales_man' : 'group_leader'
  },
  methods: {
    getEmployeeList (val = '') {
      let assignEmployeeRole = this.form.assignEmployeeRole
      let query = []
      // if (assignEmployeeRole === 'group_leader') {
       query = [         
          // {column: 'deptRole',type: 'eq',value: 'manager'},
          {column: 'name',type: 'like', value: val}
        ]
      // }else{
      //    query = [         
      //     {column: 'roleCode',type: 'eq',value: 'bd,obd'},
      //     {column: 'name',type: 'like',value: val}
      //   ]
      // }  
        listByDeptRole({
          currPage: 1,
          pageSize: 1000,
          query
        }).then(res => {
          if (res.code === 0) {
              //通过部门code筛选
              const deptList = res.data.list.filter(item => item.deptCode.includes(this.rowDept))
              this.employeeList = deptList.map(item => {
                return Object.assign({},item, {
                  label: item.cname,
                  value: item.employeeId
                })
              })
          }
        }).catch(()=>{})
    },
    changeEmployee (val) {
      let source = this.employeeList.filter(item => item.employeeId === val)[0]
      let { employeeId:assignToEmployeeId, cname:assignToEmployeeName, deptCode:belongDeptCode, deptCname: belongDeptName } = source
      this.form = Object.assign(this.form, {
        assignToEmployeeId,
        assignToEmployeeName,
        belongDeptCode,
        belongDeptName
      })
      this.getEmployeeList()
      let bdDeptCode = source.deptCode
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
