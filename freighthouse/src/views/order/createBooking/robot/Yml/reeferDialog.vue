<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
     <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="Min Temp." prop="minTemp">
          <el-input size="mini" v-model="form.minTemp"></el-input>
        </el-form-item>
        <el-form-item label="Transport Temp." prop="transportTemp">
          <el-input size="mini" v-model="form.transportTemp"></el-input>
        </el-form-item>
        <el-form-item label="Max Temp." prop="maxTemp">
          <el-input size="mini" v-model="form.maxTemp"></el-input>
        </el-form-item>
        <el-form-item label="Temp. Unit" prop="tempUnit"> 
          <el-select style="width:100%;" filterable clearable size="mini" v-model="form.tempUnit" placeholder="">
            <el-option
              v-for="item in tempUnitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Genset" prop="genset"> 
          <el-select style="width:100%;"  filterable clearable size="mini" v-model="form.genset" placeholder="">
            <el-option
              v-for="item in gensetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Humidity" prop="humidity">
          <el-input size="mini" v-model="form.humidity"></el-input>
        </el-form-item>
        <el-form-item label="Air Exchange Setting" prop="airFlow"> 
          <el-select style="width:100%;" filterable clearable size="mini" v-model="form.airFlow" placeholder="">
            <el-option
              v-for="item in airFlowOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Ventilation" prop="ventilation"> 
          <el-select style="width:100%;" filterable clearable size="mini" v-model="form.ventilation" placeholder="">
            <el-option
              v-for="item in ventilationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
     </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
export default {
  props: {
    dialogReeferOptions: {
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
				title: 'Reefer',
				show: true,
				size: 'medium',
        width: '800px'
			},
      form: {
        minTemp: '',
        transportTemp: '',
        maxTemp: '',
        tempUnit: '',
        genset: '',
        humidity: '',
        airFlow: '',
        ventilation: '',
      },
      rules: {},
      tempUnitOptions: [], // ai_yml_temp_unit
      gensetOptions: [], // ai_yml_genset
      airFlowOptions: [], // ai_yml_air_flow
      ventilationOptions: [], // ai_yml_ventilation 
    }
  },
  methods: {
    init() {
      for (let key in this.form) {
        if (this.dialogReeferOptions.options[key]) {
          this.form[key] = this.dialogReeferOptions.options[key]
        }
      }
    },
    getDictAllData() {
      const source1 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_yml_temp_unit'
      )[0]
      this.tempUnitOptions = source1.dictItems.map((item) => {
        const { descpt, itemCode } = item
        return {
          label: descpt,
          value: itemCode,
        }
      })
      const source2 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_yml_genset'
      )[0]
      this.gensetOptions = source2.dictItems.map((item) => {
        const { descpt, itemCode } = item
        return {
          label: descpt,
          value: itemCode,
        }
      })
      const source3 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_yml_air_flow'
      )[0]
      this.airFlowOptions = source3.dictItems.map((item) => {
        const { descpt, itemCode } = item
        return {
          label: descpt,
          value: itemCode,
        }
      })
      const source4 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_yml_ventilation'
      )[0]
      this.ventilationOptions = source4.dictItems.map((item) => {
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