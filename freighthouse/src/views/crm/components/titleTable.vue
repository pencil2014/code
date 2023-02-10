<template>
  <div class="title-table">
    <div class="title-flex">
      <span class="title">{{title}}</span>
      <slot></slot>
    </div>
    <FinanceTable :option="option1" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
export default {
  name: 'titleTable',
  props: ['columns', 'data', 'title', 'operationBtns'],
  components: { FinanceTable },
  watch: {
    columns: {
      handler(val) {
        this.option1.columns = val || []
      },
      immediate: true,
    },
    data: {
      handler(val) {
        this.option1.data = val || []
      },
      immediate: true,
    },
    operationBtns: {
      handler(val) {
        this.option1.operationBtns = val || false
      },
      immediate: true,
    },
    // remove: {
    //   handler(val, old) {
    //     if (val == old) return
    //     if (val) {
    //       this.option1.operationBtns = {
    //         show: true,
    //         data: [{ label: '解绑', showFn: (row) => row.bdEmployeeId != this.userId, action: 'remove' }],
    //         callback: (action, rowIndex, row, option) => {
    //           console.log(action)
    //           row.action = action
    //           this.$emit('emitEvent', row)
    //           // console.log(rowIndex, row)
    //         },
    //       }
    //     } else {
    //       this.option1.operationBtns = false
    //     }
    //   },
    //   immediate: true,
    // },
    // setMain: {
    //   handler(val, old) {
    //     if (val == old) return
    //     if (val) {
    //       this.option1.operationBtns = {
    //         show: true,
    //         data: [{ label: '解绑', showFn: (row) => row.bdEmployeeId != this.userId, action: 'remove' }],
    //         callback: (action, rowIndex, row, option) => {
    //           console.log(action)
    //           row.action = action
    //           this.$emit('emitEvent', row)
    //           // console.log(rowIndex, row)
    //         },
    //       }
    //     } else {
    //       this.option1.operationBtns = false
    //     }
    //   },
    //   immediate: true,
    // },
  },
  computed: {
    // operationBtns(){
    //   if(this.remove){
    //     if(this.setMain && hasMainBd)
    //   }
    // }
  },
  data() {
    return {
      option1: { pagination: false, selection: false, columns: [], data: [] },
      userId: this.$store.state.user.userId,
    }
  },
}
</script>
<style lang="scss"  scoped>
.title-table {
  .title-flex {
    display: flex;
    justify-content: space-between;
    // padding: 0 20px;
    padding: 0 8px;
    .title {
      font-size: 14px;
      font-weight: 600;
      color: #222222;
    }
  }
}
</style>