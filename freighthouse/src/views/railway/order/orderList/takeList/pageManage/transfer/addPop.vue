<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="form" :model="form" label-width="120px" class="add-class">
      <el-form-item label="申请份数：" prop="pages" required :show-message="false">
        <el-input v-model.number="form.pages" size="mini" @blur="numberBlur(form.pages)" clearable></el-input>
      </el-form-item>
      <el-form-item label="审批人：" prop="auditEmployeeId" required  :show-message="false">
        <el-select v-model="form.auditEmployeeId" style="width: 100%;" size="mini" remote filterable :remote-method="receiveRemoteMethod" @change="receiveChange">
          <el-option v-for="(item, index) in receiveList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="收件人：" prop="receiveEmployeeId" required  :show-message="false">
        <el-select v-model="form.receiveEmployeeId"  style="width: 100%;" size="mini" remote filterable :remote-method="auditRemoteMethod" @change="auditChange">
          <el-option v-for="(item, index) in recipientList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="收件人联系方式：" prop="receivePhone" required :show-message="false">
        <el-input v-model="form.receivePhone" size="mini" clearable></el-input>
      </el-form-item>
      <el-form-item label="收件地址：" prop="receiveAddress" required :show-message="false">
        <el-input v-model="form.receiveAddress" size="mini" clearable></el-input>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import {
  baseEmployeeList,
  getEmployeeInfo,
  getTakeEmployee
} from '@/api/base'
import { blPagerTransferApply } from '@/api/railway/blPage'
import { mapState } from 'vuex'
export default {
  components: { BaseDialog },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo
    }),
  },
  data() {
    return {
      dialogConfig: {
				title: '申请提单纸',
				show: true,
				size: 'medium',
				width: '600px'
			},
      receiveList: [],
      recipientList: [],
      form: {
        pages: '',
        auditEmployeeId: '',
        auditEmployeeName: '',
        receiveEmployeeId: '',
        receiveEmployeeName: '',
        receivePhone: '',
        receiveAddress: ''
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      console.log('用户信息：', this.userInfo)
      let { sysUserId, userName, telephone, mobileNo, compCode, companyList } = this.userInfo
      this.form.receiveEmployeeId = sysUserId // 默认为申请人本人
      this.form.receiveEmployeeName = userName
      this.recipientList = [
        {
          label: userName,
          value: sysUserId
        }
      ]
      this.form.receivePhone = telephone || mobileNo || '' // 可根据所选的收件人自动带出该人员的座机号，若无座机号，则自动带出手机号；可手动再修改
      let list = (companyList || []).filter(item => {
        return item.companyCode === compCode
      })
      if (list && list.length) {
        this.form.receiveAddress = list[0].regAddr
      }
      
      
    },
    receiveRemoteMethod(val) {
      let data = val ? val.replace(/^\s+|\s+$/g, '') : ''
			getTakeEmployee(data).then(res => {
				this.receiveList = res.data.map(ele => {
					return { ...ele, label: ele.cname, value: ele.employeeId }
				})
			})
    },
    receiveChange(id) {
      let obj = this.receiveList.find(item => {
        return item.employeeId === id
      })
      this.form.auditEmployeeName = ( obj && obj.label) || ''
    },
    auditRemoteMethod(value) {
      if (value) {
        const data = {
          currPage: 1,
          pageSize: 2000,
          query: [
            { column: 'name', type: 'eq', value },
            { column: 'deptCode', type: 'eq', value: this.userInfo.compCode },
            { column: 'childFlag', type: 'eq', value: 1 },
          ]
        }
        baseEmployeeList(data)
        .then(res => {
            if (res.data.list && res.data.list.length) {
               this.recipientList = res.data.list.map(item => {
                 item['value'] = item.employeeId
                 item['label'] = item.cname
                 return item
               })
            }
        })
      }
      
    },
    auditChange(employeeId) {
      getEmployeeInfo({ employeeId }).then(res => {
        let { cname, telephone, mobileNo } = res.data || {}
        this.form.receivePhone = telephone || mobileNo || ''
        this.form.receiveEmployeeName = cname
      }).catch(() => { })
    },
    numberBlur(val) {
      let reg = /(^[1-9]\d*$)/
      if (!reg.test(val)) {
        this.$message.error('请输入正整数')
        this.form.pages = ''
        return
      }
    },
    close(action, value) {
			this.$emit('close', action, value)
		},
    dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs['form'].validate(valid => {
					if (valid) {
            blPagerTransferApply(this.form)
            .then(res => {
              this.$message.success('申请成功')
              this.close('Confirm')
            })
          }
        })
			} else {
				this.close('Cancel')
			}
		},
  }
}
</script>

<style lang="scss" scoped>
.add-class {
}

</style>