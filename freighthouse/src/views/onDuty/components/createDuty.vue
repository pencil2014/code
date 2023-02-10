<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="createDutyForm" :rules="rules" :model="createdItem" label-position="right" label-width="80px" class="create-duty-form">
      <el-form-item label="值班部门" prop="deptCode">
        <el-select v-model="createdItem.deptCode" size="mini" @change="changeDeptCode" filterable clearable placeholder="请选择" style="width: 100%">
          <el-option v-for="(item, index) in deptTypeOptions" :label="item.deptCname" :value="item.deptCode" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="值班时间" prop="time" class="is-required">
        <el-row :gutter="0">
          <el-col style="width:48%">
            <el-form-item label-width="0" prop="dutyTimeBegin">
              <el-date-picker v-model="createdItem.dutyTimeBegin" :picker-options="beginDate(createdItem.dutyTimeBegin,createdItem.dutyTimeEnd)" style="width: 100%" type="datetime" size="mini" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" placeholder="开始时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col style="width:4%">
            <div style="display:flex;justify-content:center;align-items:center;">-</div>
          </el-col>
          <el-col style="width:48%">
            <el-form-item label-width="0" prop="dutyTimeEnd">
              <el-date-picker v-model="createdItem.dutyTimeEnd" :picker-options="endDate(createdItem.dutyTimeBegin,createdItem.dutyTimeEnd)" style="width: 100%" type="datetime" size="mini" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" placeholder="结束时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item v-for="(item,index) in createdItem.employeeList" :key="index" :label="'值班人'+(index+1)" class="is-required">
        <div class="employee-item">
          <div style="width:92%">
            <el-row :gutter="4">
              <el-col :span="6">
                <el-form-item label-width="0" :prop="`employeeList[${index}].employeeId`" :rules="rules.employeeId">
                  <el-select v-model="item.employeeId" placeholder="请选择" filterable clearable size="mini" style="width:100%" @focus="employeeFocus" @change="val => employeeChange(val,index)">
                    <el-option v-for="(o, i) in employeeOptions" :key="i" :label="o.label" :disabled="chosenEmployees.includes(o.value)&&item.employeeId!=o.value" :value="o.value"> </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="0" :prop="`employeeList[${index}].telephone`">
                  <el-input size="mini" placeholder="座机" v-model="item.telephone">
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="0" :prop="`employeeList[${index}].mobileNo`">
                  <el-input size="mini" placeholder="手机" v-model="item.mobileNo">
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="0" :prop="`employeeList[${index}].email`">
                  <el-input size="mini" placeholder="邮箱" v-model="item.email">
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div class="operate">
            <i v-if="index>0" class="el-icon-remove-outline" @click="delEmployee(index)"></i>
            <i class="el-icon-circle-plus-outline" @click="addEmployee"></i>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="值班备注" prop="remark">
        <el-input type="textarea" size="mini" :autosize="{ minRows: 2, maxRows: 6 }" maxlength="512" show-word-limit placeholder="请输入内容" v-model="createdItem.remark">
        </el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { dutyDeptList } from '@/api/duty'
import { baseEmployeeListName } from '@/api/base'
export default {
  data() {
    return {
      pickerOptions: {
        disabledDate(val) {
          return val.getTime() < Date.now() - 3600 * 1000 * 24
        }
      },
      dialogConfig: {
        title: '新增值班',
        show: true,
        size: 'medium',
        width: '800px'
      },
      createdItem: {
        deptCode: '',
        dutyTimeBegin: '',
        dutyTimeEnd: '',
        remark: '',
        employeeList: [
          {
            employeeId: '',
            telephone: '',
            mobileNo: '',
            email: ''
          }
        ]
      },
      deptTypeOptions: [],
      employeeOptions: [],
      rules: {
        deptCode: [{ required: true, message: ' ', trigger: 'change' }],
        dutyTimeBegin: [{ required: true, message: ' ', trigger: 'change' }],
        dutyTimeEnd: [{ required: true, message: ' ', trigger: 'change' }],
        employeeId: [{ required: true, message: ' ', trigger: 'change' }],
        telephone: [{ required: true, message: ' ', trigger: 'change' }],
        mobileNo: [{ required: true, message: ' ', trigger: 'change' }],
        email: [{ required: true, message: ' ', trigger: 'change' }]
      }
    }
  },
  props: {},
  created() {
    this.dutyDeptList()
    // this.getEmployeeName()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap
    }),
    chosenEmployees() {
      let list = this.createdItem.employeeList.reduce((arr, el) => {
        arr.push(el.employeeId)
        return arr
      }, [])
      return list
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    employeeFocus(){
      if(!this.createdItem.deptCode){
        this.$message({
          message: '请先选择值班部门',
          type: 'warning'
        })
      }
    },
    changeDeptCode(val) {
      this.createdItem.employeeList = [
        {
          employeeId: '',
          telephone: '',
          mobileNo: '',
          email: ''
        }
      ]
      if (!val) {
        this.employeeOptions = []
      } else {
        this.getEmployeeName(val)
      }
    },
    beginDate(sTime, eTime) {
      return {
        disabledDate(time) {
          if (eTime) {
            return new Date(eTime).getTime() < time.getTime()
          } else {
            return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
          }
        }
      }
    },
    endDate(sTime, eTime) {
      return {
        disabledDate(time) {
          if (sTime) {
            return new Date(sTime).getTime() > time.getTime()
          } else {
            return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
          }
        }
      }
    },
    employeeChange(val, index) {
      console.log(val, index)
      let findItem = this.employeeOptions.find((el) => val == el.value)
      if (findItem) {
        this.createdItem.employeeList[index].telephone = findItem.telephone
        this.createdItem.employeeList[index].mobileNo = findItem.mobileNo
        this.createdItem.employeeList[index].email = findItem.email
      }
    },
    getEmployeeName(val) {
      let data = {
        deptCode: val
      }
      baseEmployeeListName(data).then((res) => {
        let list = res.data.filter((el) => el.status === 'on')
        this.employeeOptions = list.map((item) => {
          return Object.assign(item, {
            label: this.$language == 'en' ? item.ename : item.cname,
            value: item.employeeId
          })
        })
      })
    },
    dutyDeptList() {
      dutyDeptList().then((res) => {
        this.deptTypeOptions = res.data || []
      })
    },
    addEmployee() {
      this.createdItem.employeeList.push({
        employeeId: '',
        telephone: '',
        mobileNo: '',
        email: ''
      })
    },
    delEmployee(index) {
      console.log(index)
      this.createdItem.employeeList.splice(index, 1)
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.createDutyForm.validate((valid) => {
          if (valid) {
            this.handleCreateDuty(done)
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // 新建订单
    handleCreateDuty(done) {
      done()
      this.close('Confirm', this.createdItem)
    }
  }
}
</script>

<style lang="scss">
.create-duty-form {
  .el-range-editor.el-input__inner {
    padding: 0 10px !important;
  }
  .el-date-editor .el-range-input {
    width: 50% !important;
  }
  .employee-item {
    display: flex;
    .operate {
      width: 8%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 16px;
      i {
        padding: 0 2px;
        cursor: pointer;
      }
      i:hover {
        color: #1890ff;
      }
    }
  }
}
</style>
