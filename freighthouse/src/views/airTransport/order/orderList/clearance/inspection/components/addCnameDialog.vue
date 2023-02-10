<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form id="addCnameDialog" ref="form" :rules="rules" :model="formData">
       <FormItem v-for="(ele, index) in inputItem" :key="index" :item="ele" :form="formData" />
    </el-form>
  </BaseDialog>
</template>

<script>
import store from '@/store'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import {cargoSave} from '@/api/order/list'
import {cargoHscodeList} from '@/api/base'

export default {
  data() {
    return {
      selectCargo:{},  // 选中列
      dialogConfig: {
          title: '添加品名',
          show: true,
          size: 'medium',
      },
      formData: {
        cname: "",
        ename: "",
        hscode: "",
        type: "",
        mark: ""
      },
      inputItem: [
        {label: "中文品名", key: "cname", prop: "cname", type: "input", inputType: "text" },
        {label: "英文品名", key: "ename", type: "input", inputType: "text" },
        {label: "海关编码", key: "hscode", prop: "hscode", type: "select", options: [], filterable: true, clearable: true, remote: true, 
          remoteMethod: (queryString, item) => {
            this.queryCargoHscode(queryString, item)
          }, change: (val, item) => {
            if (!val) {
              item.options = []
              this.formData.type = ''
            } else {
              let subItem = item.options.find(ele => ele.value === val)
              this.formData.type = subItem.className
            }
          }
        },
        {label: "货品类型", key: "type", prop: "type", type: "input",
          // filterable:true,
          // remote: true,
          // options: [],
          // remoteMethod: (queryString, item) => {
          //   this.getCommodityTypeCodeOptions(queryString, item)
          // }
        },
        {label: "唛头", key: "mark", prop: "mark", type: "input", inputType: "text" },
      ],
      rules: {
        cname: [
          { required: true, message: '中文品名不能为空', trigger: 'blur' },
        ],
        hscode: [
          { required: true, message: '海关编码不能为空', trigger: 'blur' },
        ],
        // type: [
        //   { required: true, message: '货品类型不能为空', trigger: 'blur' },
        // ],
        mark: [
          { required: true, message: '唛头不能为空', trigger: 'blur' },
        ],
      },
    }
  },
  props: {
    chapterNameList: {
      type: Array,
      default: () => {[]}
    }
  },
  created() {
    
  },
  components: {
    BaseDialog,
    FormItem
  },
  methods: {
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.form.validate((valid) => {
          if (valid) {
            cargoSave(this.formData).then(res => {
              this.$emit("handleConfirm", res.data)
              this.close('Confirm')
            })
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      } else {
        this.close('Cancel')
      }
    },
    // hscode模糊查询
    queryCargoHscode(queryString, item) {
      cargoHscodeList({keyword: queryString}).then((response) => {
        item.options = response.data.map(item => {
          return Object.assign(item, {
            label: item.cargoDesc,
            value: item.hscode
          })
        })
      });
    },
    // 获取货品类型
    getCommodityTypeCodeOptions(queryString, item) {
      if(queryString) {
        this.$store.dispatch('dict/queryCommodityTypeCodeOptions', queryString).then(res => {
          item.options = res
        })
      }
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
  }
};
</script>

<style lang="scss">
.dialog-layout .row-tit {
    border-bottom: unset !important;
}
#addCnameDialog {
  padding: 0 40px;
}

</style>
