<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="dateModifyForm" :rules="rules" :model="createdItem" label-position="right" :label-width="labelWidth">
      <el-checkbox-group v-model="checkedValues" @change="changeValues">
        <el-checkbox v-for="el in options" :label="el.value" :key="el.value">{{el.label}}</el-checkbox>
      </el-checkbox-group>
      <div v-show="checkedValues.length>0" class="divider-line"></div>
      <el-row>
        <el-col :span="8" v-if="checkedValues.includes('vesselAndvoyage')">
          <el-form-item label="大船船名" prop="vessel">
            <el-input v-model="createdItem.vessel" placeholder="请输入大船船名" maxlength="64" clearable style="width:100%"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="checkedValues.includes('vesselAndvoyage')">
          <el-form-item label="大船航次" prop="voyage">
            <el-input v-model="createdItem.voyage" placeholder="请输入大船航次" maxlength="64" clearable  style="width:100%"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="checkedValues.includes('etdTime')">
          <el-form-item label="大船预计开船时间" prop="etdTime">
            <elDatePickerLimit :field="'etdTime'" size="mini" v-model="createdItem.etdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="checkedValues.includes('tdTime')">
          <el-form-item label="大船实际开船时间" prop="tdTime">
            <elDatePickerLimit noCanFuture :field="'tdTime'" size="mini" v-model="createdItem.tdTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="checkedValues.includes('cyCutOff')">
          <el-form-item label="大船截关时间" prop="cyCutOff">
            <elDatePickerLimit :field="'cyCutOff'" size="mini" v-model="createdItem.cyCutOff" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="checkedValues.includes('etaTime')">
          <el-form-item label="预计到港时间" prop="etaTime">
            <elDatePickerLimit size="mini" :field="'etaTime'" v-model="createdItem.etaTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'

const defaultCreate = {
  vessel: '',
  voyage: '',
  etdTime: '',
  tdTime: '',
  cyCutOff: '',
  etaTime: ''
}

export default {
  data() {
    return {
      checkedValues: [],
      options: [
        {
          value: 'vesselAndvoyage',
          label: '大船船名&航次'
        },
        {
          value: 'etdTime',
          label: '大船预计开船时间'
        },
        {
          value: 'tdTime',
          label: '大船实际开船时间'
        },
        {
          value: 'cyCutOff',
          label: '大船截关时间'
        },
        {
          value: 'etaTime',
          label: '预计到港时间'
        }
      ],
      dialogConfig: {
        title: '批量修改',
        show: true,
        size: 'medium',
        width: '1000px'
      },
      createdItem: Object.assign({}, defaultCreate),
      rules: {
        vessel: [{ required: true, message: ' ', trigger: 'change' }],
        voyage: [{ required: true, message: ' ', trigger: 'change' }],
        etdTime: [{ required: true, message: ' ', trigger: 'change' }],
        tdTime: [{ required: true, message: ' ', trigger: 'change' }],
        cyCutOff: [{ required: true, message: ' ', trigger: 'change' }],
        etaTime: [{ required: true, message: ' ', trigger: 'change' }]
      }
    }
  },
  props: {
    selectedCheckbox: {
      type: Array,
      default() {
        return []
      }
    }
  },
  created() {},
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles
    }),
    labelWidth() {
      if (
        this.checkedValues.includes('etdTime') ||
        this.checkedValues.includes('tdTime')
      ) {
        return '120px'
      } else {
        return '90px'
      }
    }
  },
  watch: {},
  components: {
    BaseDialog
  },
  methods: {
    changeValues(value){
      if(!value.includes('vesselAndvoyage')){
        this.createdItem.vessel=''
        this.createdItem.voyage=''
      }
      if(!value.includes('etdTime')){
        this.createdItem.etdTime=''
      }
      if(!value.includes('tdTime')){
        this.createdItem.tdTime=''
      }
      if(!value.includes('cyCutOff')){
        this.createdItem.cyCutOff=''
      }
      if(!value.includes('etaTime')){
        this.createdItem.etaTime=''
      }
      
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.dateModifyForm.validate((valid) => {
          if (valid) {
            if (this.checkedValues.length === 0) {
              this.$message.warning('请选择要修改的内容')
              return
            }
            let orders = []
            for(let i=0;i<this.selectedCheckbox.length;i++){
              orders.push(this.selectedCheckbox[i].orderNo)
            }
            let editItems =[]
            
            for(let i=0;i<this.checkedValues.length;i++){
              if(this.checkedValues[i] === 'vesselAndvoyage'){
                editItems.push('大船船名&航次')
              }
              if(this.checkedValues[i] === 'etdTime'){
                editItems.push('大船预计开船时间')
              }
              if(this.checkedValues[i] === 'tdTime'){
                editItems.push('大船实际开船时间')
              }
              if(this.checkedValues[i] === 'cyCutOff'){
                editItems.push('大船截关时间')
              }
              if(this.checkedValues[i] === 'etaTime'){
                editItems.push('预计到港时间')
              }
            }
            this.$confirm(`是否确定要修改工作号${orders.join(',')}的${editItems.join(',')}吗?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                 this.close('Confirm', this.createdItem)
              })
              .catch(() => {
                
              })
          } else {
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

<style lang="scss" scoped>
.divider-line {
  background-color: #dcdfe6;
  height: 1px;
  width: 100%;
  margin: 12px 0;
}
</style>
