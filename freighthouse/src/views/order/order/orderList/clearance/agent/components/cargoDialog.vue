<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" class="cargo-dialog">
    <DefaultTableComp ref="defaultTableComp" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick"></DefaultTableComp>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import DefaultTableComp from '../../../../components/defaultTableComp'
import {handleData} from '../../../../js/handleData'
import {cargoHscodeList, countrySelectList, baseCurrencyList} from '@/api/base'
import {mixin} from '../../mixin'

var defaultTableList = {
    commodityNo: "",
    hscode: "",
    commodityName: "",
    commodityType: "",
    quantity: "",
    quantityUnit: "",
    countryFinal: "",
    unitPrice: "",
    totalPrice: "",
    currency: "USD",
    taxExemption: ""
}
export default {
  mixins: [mixin],
  data() {
    return {
      dialogConfig: {
        title: '货物信息',
        show: true,
        size: 'medium',
        width: '85%'
      },
      tableInfo: {
        title: "",
        titleBtnList: this.noPermit ? [] : [
          {label: "新增货物信息", key: "add", type: 'primary'},
        ]
      },
      // 表格配置项
      tableConfig:{
        style: {},
        tableIndex: {
          show: false
        },
        options: {
          // 是否支持解锁列表修改,默认锁定列表不可更改
          lockState: false,
          // 多选框状态判断 {false不可选, true可选}
          checkSelectable({so}) {
            return so ? true : false;
          },
        },
        columns: handleData.cargoColumn(this.hscodeQuerySearch, this.countryQuerySearch, this.getCurrencyList),  //  表格显示的表头
        list: this.customsCargoList ? JSON.parse(JSON.stringify(this.customsCargoList)) : [],
        // 操作按钮组
        operationBtns: { show: false },
        // 操作提示
        tips: {
          text: '',
          show: false
        },
        // 操作按钮组
        operationBtns: {
          width: 90,
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            let fn = this['handle' + action]
            if (typeof fn !== 'function') return
            this['handle' + action](row, $index)
          },
          data: [
            {
              label: '删除',
              type: 'text',
              show: (item, row) => {
								if (this.noPermit) {
									return false
								} else {
									return true
								}
							},
              action: 'Delete'
            }
          ]
        },
        // 分页
        pagination: {
          show: false,
          total: 0
        }
      }
    }
  },
  props: {
    customsCargoList: {
      type: Array,
      default(){[]}
    },
    noPermit: {
      type: Boolean,
      default: false
    }
    // intrustStatus: {
    //   type: String,
    //   default: ''
    // },
    // isJoint: {
    //   type: Boolean,
    //   default: false
    // },
  },
  created() {
    // console.log('this.isOpTruck', this.isOpTruck)
    if (this.noPermit) {
      this.tableInfo.titleBtnList = []
    } else {
      this.tableInfo.titleBtnList = [{label: "新增货物信息", key: "add", type: 'primary'}]
    }
  },
  mounted() {

  },
  computed: {
      
  },
  watch: {
    dataList(val) {
      console.log(val)
    }
  },
  components: {
    BaseDialog,
    DefaultTableComp
  },
  methods: {
    validate(data) {
      let reg = /^\d+(?=\.{0,1}\d+$|$)/
      let nameValid = data.some(item => !item.commodityName)
      // let quantityValid = data.some(item => !item.quantity)
      let totalPriceValid = data.some(item => item.totalPrice && !reg.test(item.totalPrice))
      if (nameValid) {
				this.$message({ type: 'warning', message: '请填写中文品名' })
				return false
      }
      // if (quantityValid) {
			// 	this.$message({ type: 'warning', message: '请填写正确的件数' })
			// 	return false
      // }
      if (totalPriceValid) {
				this.$message({ type: 'warning', message: '请填写正确的总价' })
				return false
			}
      return true
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (!this.validate(this.tableConfig.list)) return
        this.$emit("addContainerFun", {list:this.tableConfig.list, type:"Cargo"})
        this.close('Confirm')
      } else {
        this.close('Cancel')
      }
    },
    tableClick(type) {
      if(type == "add"){
        this.tableConfig.list.push({...defaultTableList}) 
      }
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    handleDelete(row, index) {
      this.tableConfig.list.splice(index, 1)
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList(queryString, item) {
      baseCurrencyList(queryString).then((res) => {
        item.data = res.data && res.data.map(ele => {
          return {
            label: ele.cnName,
            value: ele.code
          }
        }) || []
      })
    },
    // hscode模糊查询
    hscodeQuerySearch(queryString, item) {
      let data = queryString && queryString !== true?{keyword: queryString}:''
      cargoHscodeList(data).then(res => {
        item.data = res.data && res.data.map((o) => {
          return {
            label: o.cargoDesc,
            value: o.hscode
          }
        }) || []
      })
    },
    // 国家信息模糊查询
    countryQuerySearch(queryString, item) {
      let params = {};
      Object.assign(params, {
        countryCode: queryString,
        state: "valid",
      });
      countrySelectList(params).then((response) => {
        item.data = response.data && response.data.map(o => {
          return {
            label: this.$language=='en'?o.ename:o.cname,
            value: this.$language=='en'?o.ename:o.cname
          }
        }) || []
      });
    },
  }
};
</script>

<style lang="scss">
.dialog-layout .row-tit {
  border-bottom: unset !important;
}
.cargo-dialog .el-input.is-disabled input::placeholder{
  color: transparent !important;
}
.cargo-dialog .default-table .row-tit, .cargo-dialog .default-table .row-table{
  padding: 0 !important;
  margin-top: 0 !important;
}
</style>
