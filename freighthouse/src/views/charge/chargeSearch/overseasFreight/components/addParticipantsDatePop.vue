<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="custNoUpdataForm" id="addParticipantsDatePop" :rules="rules" :model="createItem" label-width="70px" label-position="top">
      <el-form-item label="Participant Type" :show-message="false">
        <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.participantsType" size="mini" placeholder="Please select" style="width: 100%">
          <el-option v-for="(item, index) in participantsTypeList" :label="item.label" :value="item.value" :key="index"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="selectType==='joint'" label="Name" prop="participantIdList" :show-message="false">
        <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.participantIdList" multiple collapse-tags filterable size="mini" clearable placeholder="Please select" style="width: 100%">
          <el-option v-for="(item, index) in employeeListAll" :disabled="userId===item.employeeId" :label="item.label" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>

      <el-form-item v-if="selectType==='enquiry'" label="Name" prop="participantId" :show-message="false">
        <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.participantId" remote @change="changeParticipantAll" filterable size="mini" clearable placeholder="Please select" style="width: 100%">
          <el-option v-for="(item, index) in employeeListAll" :disabled="userId===item.employeeId" :label="item.label" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>

      <el-form-item v-if="selectType==='quote'" label="Name" prop="participantId" :show-message="false">
        <el-select no-match-text="No matching data" no-data-text="No data" loading-text="Loading" v-model="createItem.participantId" remote @change="changeParticipant" filterable size="mini" clearable placeholder="Please select" style="width: 100%">
          <el-option v-for="(item, index) in employeeList" :disabled="userId===item.employeeId" :label="item.label" :value="item.employeeId" :key="index"> </el-option>
        </el-select>
      </el-form-item>

    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index-en.vue'
import { baseEmployeeListName } from '@/api/base'
import { unique } from '@/utils/index'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      selectType: '',
      employeeListAll: [],
      employeeList: [],
      participantsTypeList: [
        {
          label: 'Inquirer',
          value: 'enquiry'
        },
        {
          label: 'Quoter',
          value: 'quote'
        },
        {
          label: 'Collaborator',
          value: 'joint'
        }
      ],
      dialogConfig: {
        title: 'Change participant',
        show: true,
        size: 'medium',
        width: '400px'
      },
      createItem: {
        participantId: '',
        participantName: '',
        participantsType: '',
        participantIdList: []
      },
      rules: {
        participantId: [
          {
            required: true,
            message: '请选择姓名',
            trigger: 'change'
          }
        ],
        participantIdList: [
          {
            required: true,
            message: '请选择姓名',
            trigger: 'change'
          }
        ]
      }
    }
  },
  props: {
    participantType: {
      type: String,
      default: ''
    },
    quotationNumber: {
      type: String,
      default: ''
    }
  },
  created() {
    this.getEmployeeNameAll()
    this.getEmployeeName()
    this.createItem.participantsType = this.participantType
    if (!this.quotationNumber && this.participantType === 'enquiry') {
      this.participantsTypeList = [
        {
          label: 'Inquirer',
          value: 'enquiry'
        },
        {
          label: 'Quoter',
          value: 'quote'
        },
        {
          label: 'Collaborator',
          value: 'joint'
        }
      ]
    } else if (!this.quotationNumber && this.participantType === 'quote') {
      this.participantsTypeList = [
        {
          label: 'Quoter',
          value: 'quote'
        },
        {
          label: 'Collaborator',
          value: 'joint'
        }
      ]
    } else {
      if (this.participantType === 'enquiry') {
        this.participantsTypeList = [
          {
            label: 'Inquirer',
            value: 'enquiry'
          },
          {
            label: 'Collaborator',
            value: 'joint'
          }
        ]
      } else {
        this.participantsTypeList = [
          {
            label: 'Quoter',
            value: 'quote'
          },
          {
            label: 'Collaborator',
            value: 'joint'
          }
        ]
      }
    }
  },
  mounted() {},
  computed: {
    ...mapState({
      userId: (state) => state.user.userId
    }),
    participantsDisabled() {
      if (!this.quotationNumber && this.participantType === 'enquiry') {
        return false
      } else {
        return true
      }
    }
  },
  watch: {
    'createItem.participantsType': function (val) {
      this.createItem.participantId = ''
      this.createItem.participantName = ''
      this.createItem.participantIdList = []

      setTimeout(() => {
        this.selectType = val
      }, 0)
    }
  },
  components: {
    BaseDialog
  },
  methods: {
    getEmployeeNameAll() {
      // 询价人可以选择所有人
      let data = {
        name: '',
        roleCode: ''
      }
      baseEmployeeListName(data).then((res) => {
        let data = res.data.filter((el) => el.status === 'on')
        this.employeeListAll = data.map((ele) => {
          let label = `${ele.cname} (${ele.ename}-${ele.deptName})`
          if (!ele.ename) {
            label = `${ele.cname} (${ele.deptName})`
          }
          return Object.assign(ele, {
            label: label
          })
        })
      })
    },
    changeParticipant(val) {
      this.createItem.participantName = this.employeeList.find(
        (el) => el.employeeId === val
      ).cname
    },
    changeParticipantAll(val) {
      this.createItem.participantName = this.employeeListAll.find(
        (el) => el.employeeId === val
      ).cname
    },
    getEmployeeName(val) {
      let data1 = {
        name: '',
        roleCode: 'ecs'
      }
      let data2 = {
        name: '',
        roleCode: 'epricing'
      }
      Promise.all([
        baseEmployeeListName(data1),
        baseEmployeeListName(data2)
      ]).then((res) => {
        let arr1 = Array.isArray(res[0].data)
          ? res[0].data.filter((el) => el.status === 'on')
          : []
        let arr2 = Array.isArray(res[1].data)
          ? res[1].data.filter((el) => el.status === 'on')
          : []
        let data = unique([...arr1, ...arr2], 'employeeId')
        this.employeeList = data.map((ele) => {
          let label = `${ele.cname} (${ele.ename}-${ele.deptName})`
          if (!ele.ename) {
            label = `${ele.cname} (${ele.deptName})`
          }
          return Object.assign(ele, {
            label: label
          })
        })
      })
    },
    close(action, value) {
      this.$emit('close', action, value)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.custNoUpdataForm.validate((valid) => {
          if (valid) {
            let msg =
              'After changing the participant, you will no longer be able to view this inquiry record, are you sure you want to change it?'
            if (
              this.participantType === 'enquiry' &&
              this.createItem.participantsType === 'quote'
            ) {
              msg =
                'After changing the quoter, the original quoter will no longer be able to view this inquiry record, are you sure you want to change it?'
            }
            if (this.createItem.participantsType === 'joint') {
              msg = 'New collaborators can see the current inquiry information, are you sure you want to add them?'
            }
            this.$confirm(`${msg}`, 'Tips', {
              confirmButtonText: 'OK',
              cancelButtonText: 'Cancel',
              type: 'warning'
            })
              .then(() => {
                this.close('Confirm', this.createItem)
              })
              .catch(() => {
                // this.close('Cancel')
              })
          } else {
            this.$msgErrClose('Please fill in the fields in the red box as required!')
            console.log('error submit!!')
            return false
          }
        })
      } else {
        this.close('Cancel')
      }
    }
  }
}
</script>

<style lang="scss">
#addParticipantsDatePop {
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-form-item {
    margin-bottom: 4px;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 20px;
  }
}
</style>
