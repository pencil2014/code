<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
     <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="class" prop="classCode">
          <el-input size="mini" v-model="form.classCode"></el-input>
        </el-form-item>
        <el-form-item label="IMDG UN No." prop="imdgUnNo">
          <el-input size="mini" v-model="form.imdgUnNo"></el-input>
        </el-form-item>
        <el-form-item label="Packing Group" prop="packingeGroup">
          <el-select style="width:100%;" size="mini" filterable clearable v-model="form.packingeGroup" placeholder="">
            <el-option
              v-for="item in packingeGroupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Flash Point" prop="flashPoint">
          <el-input size="mini" v-model="form.flashPoint"></el-input>
        </el-form-item>
        <el-form-item label="Emergency Phone" prop="contact.telPhone">
          <el-input size="mini" v-model="form.contact.telPhone"></el-input>
        </el-form-item>
        <el-form-item label="Proper Shipping Name" prop="contact.name">
          <el-input size="mini" v-model="form.contact.name"></el-input>
        </el-form-item>
     </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
  props: {
    dialogDangerousOptions: {
      type: Object,
      default: () => {
        return {}
      }
    },
    shipCarrierCode: {
      type: String,
      default: ''
    },
    dictAll: {
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  components: {
    BaseDialog,
  },
  created() {
    this.init()
    this.getDictAllData()
  },
  data() {
    return {
      dialogConfig: {
				title: 'Dangerous',
				show: true,
				size: 'medium',
        width: '800px'
			},
      form: {
        classCode: '',
        imdgUnNo: '',
        packingeGroup: '',
        flashPoint: '',
        contact: {
          telPhone: '',
          name: '',
        }
      },
      rules: {},
      packingeGroupOptions: [], // ai_yml_packing_group
    }
  },
  methods: {
    init() {
      for (let key in this.form) {
        if (this.dialogDangerousOptions.options[key]) {
          this.form[key] = this.dialogDangerousOptions.options[key]
        }
      }
    },
    getDictAllData() {
      const source = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_yml_packing_group'
      )[0]
      this.packingeGroupOptions = source.dictItems.map((item) => {
        const { descpt, itemCode } = item
        return {
          label: descpt,
          value: itemCode,
        }
      })
    },
    close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.form)
			} else {
				this.close('Cancel')
			}
		}
  }
}
</script>

<style>

</style>