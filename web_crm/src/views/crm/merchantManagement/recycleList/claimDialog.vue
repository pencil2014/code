<template>
  <el-dialog title="认领" :visible.sync="claimOption.show" append-to-body width="440px" class="recycle-form">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="mini">
      <el-form-item label="维护人" prop="userName">
        <el-input type="text"  v-model="form.userName" placeholder="请输入" :disabled='true'></el-input>
      </el-form-item>
      <el-form-item label="维护人类型" prop="maintainerType">
        <el-select v-model="form.maintainerType" placeholder="请选择" filterable clearable remote>
          <el-option v-for="item in maintainerTypeList" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="新旧模式" prop="bdServiceMode">
        <el-select v-model="form.bdServiceMode" placeholder="请选择" filterable clearable remote >
          <el-option v-for="item in bdServiceMode" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item> -->
      <div v-if="relationList.length>0">
        <div v-for="(item,index) in relationList" :key="index" class="relation_list">{{item}}</div>
        <div class="goon">以上客户认领时会绑定认领,是否确认继续认领?</div>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
			<el-button type="primary"  @click="submit" size="mini">提交</el-button>
			<el-button size="mini" @click="cancle">取消</el-button>
		</div>
  </el-dialog>
</template>
<script>
import { mapState } from 'vuex'
import RECYCLE from '@/api/crm/recycle'
import { getValueByKey } from '@/api/base'
export default {
  props: {
    claimOption: {
      type: Object,
      default: () => ({}),
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
        // bdServiceMode: '',
        maintainerType:'',
        bdEmployeeId:'',
        userName:'',
      },
      rules:{
        maintainerType: {
          required: true, message: '维护人类型不能为空', trigger: 'change'
        },
        // bdServiceMode: {
        //   required: true, message: '新旧模式不能为空', trigger: 'change'
        // }
      },
      // bdServiceMode: [
      //   {label: '新模式', value: 'new'},
      //   {label: '旧模式', value: 'old'}
      // ],
      maintainerTypeList:[
        {label: '潜在维护人', value: 'potential'}
      ],
    }
  },
  computed: {
    ...mapState({
      userId: (state) => state.user.userInfo.sysUserId,
      userName: (state) => state.user.userInfo.userName,
    })
  },
  created () {
    this.form.bdEmployeeId = this.userId
    this.form.userName = this.userName
    this.form.chinaPeer = this.claimOption.chinaPeer
    this.form.isSowoll = this.claimOption.isSowoll
    if(this.claimOption.isSowoll){//我是独立sowoll
      if(this.claimOption.chinaPeer === 'yes'){//国内同行
        this.maintainerTypeList = [
          {label: '线上维护人', value: 'online'},
        ]
        this.form.maintainerType = 'online'
      }else{//非国内同行
        this.maintainerTypeList = [
          {label: '潜在维护人', value: 'potential'},
        ]
        this.form.maintainerType = 'potential'
      }
    }else{//除开sowoll其他人
      if(this.claimOption.chinaPeer === 'yes'){//国内同行
        this.maintainerTypeList = [
          {label: '线上维护人', value: 'online'},
          {label: '潜在维护人', value: 'potential'},
        ]
      }else{
        this.maintainerTypeList = [
          {label: '潜在维护人', value: 'potential'},
        ]
        this.form.maintainerType = 'potential'
      }
    }
    this.getRelationList()
  },
  methods: {

    //查询一下客户的关联公司
    getRelationList(){
      RECYCLE.claimOrAssignValid({custids:this.custId}).then(res => {
        let list = res.data
        list.forEach(item => {
          this.relationList.push('"'+ item.names +'"为"' + item.name+'"的关联同一家公司')
        });
      })
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