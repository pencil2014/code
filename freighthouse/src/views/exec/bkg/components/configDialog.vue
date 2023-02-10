<template>
   <el-dialog :title="title" :visible.sync="dialogVisible.show" :lock-scroll="true" width="600px"   @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
         <el-form-item label="配置名称" label-width="100px" prop="configName">
             <el-input style="width:80%" size="mini" v-model="createItem.configName" ></el-input>
        </el-form-item>
        <el-form-item label="配置值" label-width="100px" prop="configValue">
             <el-input type="textarea" :rows="4" style="width:80%" size="mini" v-model="createItem.configValue" ></el-input>
        </el-form-item>
          <el-form-item label="描述" label-width="100px" prop="configDesc">
             <el-input style="width:80%" size="mini" v-model="createItem.configDesc" ></el-input>
        </el-form-item>
      </el-form>          
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm('createItemForm')"> 
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { configureSave} from "@/api/exec/autobook";

export default {
  name: 'configDialog',
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({}),
    },
   
   
  },
  data() {
    return {
      title:'',
      createItem:{
       id:'',
       configName:'',
       configValue:'',
       configDesc:''
      },
      rules: {
        configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
        configValue: [{ required: true, message: '配置值不能为空', trigger: 'blur' }],
      },
    }
  },
  created() {
  
  },
  methods: {
    init(rowData){
      if(rowData){
        this.title='编辑配置项'
        for (var p in this.createItem) {
          this.createItem[p] = rowData[p]
        }
      }else{
        this.title='新增配置项'
      }
    },
       //清空数据
    dialogClose() {
      this.createItem.id=''
      this.$refs['createItemForm'].resetFields()
    },
    // 取消按钮
    cancel() {
      this.dialogVisible.show= false;
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              configureSave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.dialogVisible.show= false;
                this.$emit('relateSuc')
              })
          } else {
            return false;
          }
        });
    },
   
  },

  computed: {
    ...mapGetters(['dictMap']),
  },
  watch: {
  
  },
}
</script>
<style>
.modifyfee-detail-info {
  margin-top: 10px;
}
.modifyfee-detail-info .el-form-item__label,
.modifyfee-detail-info .el-form-item__content {
  line-height: 28px !important;
}

.modifyfee-detail-info .el-form-item {
  margin-right: 34px;
}
.modifyfee-detail-info .el-date-editor.el-input {
  width: 162px;
}
.modifyfee-detail-info .el-select {
  width: 162px;
}
.modifyfee-detail-info .el-date-editor--daterange.el-input__inner {
  width: 220px;
}

.relate-payinfo-dialog .el-dialog__body {
  height: 500px;
  padding-bottom: 0px;
  overflow: auto;
}
.relate-payinfo-dialog .finance-el-table {
  padding: 14px 0 !important;
}

.relate-payinfo-dialog .tips-abs {
  top: -30px;
}
</style>