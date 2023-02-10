<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div v-if="selectedCheckbox.length" style="height:30px"></div>
    <DefaultTableComp ref="defaultTableComp" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" @handleMuti="handleMuti"></DefaultTableComp>
    <!-- <div class="select-record-cargos">已选择{{ selectedCheckbox.length }}条记录{{defaultSelectIds}}</div> -->
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import DefaultTableComp from '../../../../components/defaultTableComp'
import { handleData } from '../../../../js/handleData'
import { airCargoList } from '@/api/airTransport/order'

export default {
  data() {
    return {
      selectedCheckbox: [],
      oQuery: this.$route.query,
      dialogConfig: {
        title: '关联货物信息',
        show: true,
        size: 'medium',
        width: '80%',
        btns: [
          { label: '关联', action: 'Confirm', type: 'primary' },
          { label: '取消', action: 'Cancel' }
        ]
      },
      tableInfo: {},
      // 表格配置项
      tableConfig: {
        style: {
          height: '100%'
        },
        tableIndex: {
          show: false
        },
        options: {
          // 是否支持解锁列表修改,默认锁定列表不可更改
          lockState: true,
          // 是否支持列表项选中功能
          mutiSelect: true,
          // 多选框状态判断 {false不可选, true可选}
          checkSelectable: ({ oid }) => {
            return this.setSelectable(oid)
          }
        },
        columns: handleData.containerColumn, //  表格显示的表头
        list: [],
        // 操作按钮组
        operationBtns: { show: false },
        // 操作提示
        tips: {
          text: '',
          show: false
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
    declarationId: '',
    defaultSelectIds: {
      type: Array,
      default: () => {
        ;[]
      }
    },
    disabledCargos: {
      type: Array,
      default: () => {
        ;[]
      }
    }
  },
  created() {
    this.getContainerList()
  },
  mounted() {},
  computed: {},
  watch: {},
  components: {
    BaseDialog,
    DefaultTableComp
  },
  methods: {
    setSelectable(id) {
      let disabledCargoList = this.disabledCargos.filter((ele) => !this.defaultSelectIds.includes(ele.cargoId))
      console.log(disabledCargoList)
      console.log(this.defaultSelectIds)
      let list = disabledCargoList.filter((ele) => ele.cargoId === id)
      if (list.length) {
        return false
      } else {
        return true
      }
    },
    handleMuti(arr) {
      this.selectedCheckbox = arr
    },
    getContainerList() {
      // let self = this
      // airCustomsListCargo({ oid: this.declarationId || '' }).then(res => {
      // 	console.log("🚀 ~ self.tableConfig.list", self.tableConfig.list)
      // 	self.tableConfig.list = [...res.data].map(item => {

      // 		if (self.defaultSelectIds.includes(item.cargoId)) {
      // 			item.selected = 'Y'
      // 		} else {
      // 			item.selected = 'N'
      // 		}
      // 		return item
      // 	})
      // })
      airCargoList({
        orderNo: this.$route.query.orderNo
        // orderNo: 'S2020105280001'
      }).then((res) => {
        // this.cargoData = res.data.blCargos
        // this.relateDataTotal = this.cargoData.length
        // this.dialogCargoVisible = true
        this.tableConfig.list = res.data.actualCargos
        this.tableConfig.pagination.total = this.tableConfig.list.length
        for (let i = 0; i < this.tableConfig.list.length; i++) {
          console.log(this.tableConfig.list[i])
          if (this.defaultSelectIds.includes(this.tableConfig.list[i].oid)) {
            this.$set(this.tableConfig.list[i], 'selected', 'Y')
          }
        }
      })
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if (this.$refs.defaultTableComp.selectedCheckbox.length === 0) {
          this.$message.error('至少选择一条货物信息')
        } else {
          this.$emit(
            'addContainerFun',
            this.$refs.defaultTableComp.selectedCheckbox
          )
          this.close('Confirm')
        }
      } else {
        this.close('Cancel')
      }
    },
    tableClick() {},
    close(action, value, type) {
      this.$emit('close', action, value, type)
    }
  }
}
</script>

<style lang="scss">
.select-record-cargos {
  position: absolute;
  left: 40px;
  bottom: 50px;
  font-size: 12px;
}
</style>
