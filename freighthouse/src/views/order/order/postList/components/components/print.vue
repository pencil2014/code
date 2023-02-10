<template>
 <div class="print-contont">
    <div class="post-print" >
      <div id="postPrintList">
         <div class="print-table" >
           <div class="title">
             <h1>签收单</h1>
            </div>
           <FinanceTableMass :option="option" />
         </div>
      </div>
      <div class="print-btn-box">
        <el-button
					type="primary"
					size="mini"
					@click="handlePrintFn"
					v-print="handlePrint"

					>打印</el-button
				>
        <el-button size="mini" @click="cancel"
          >返回</el-button
        >
      </div>
    </div>
 </div>
 
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { expressList } from '@/api/order/post'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
  mixins: [routerMixin],
  data() {
    return {
      data: [],
      isPrint: false,
      handlePrint:{
				id: "postPrintList",
				popTitle: '签收单',
				type: "html",
				extraCss: '',
				printCallback: this.printCallbackList
			},
      option: {
        id: 'postPrint', 
        $name: 'postPrintList',
				columns: [],
				data: [],
				disableFixedIndex0:true,
				tips: {
					text: '',
					show: false
				},
				selection: {
					show: false,
					fixed: "left"
				},
				operationBtns: {
					show: false,
					data: []
				},
				rootTipsHide: true,
				showOverflow: false,
        maxHeight: 9999
      },
      columns: [
        {
          prop: 'expressNo',
          label: '快递单号',
          type: 'text',
          forceWidth: 128
        },
        {
          prop: 'receisendType',
          label: '收寄类型',
          type: 'select',
          forceWidth: 70,
          propInDict: 'receisendType'
        },
        {
          prop: 'postType',
          label: '寄单方式',
          type: 'select',
          forceWidth: 70,
          propInDict: 'postType'
        },
        {
          prop: 'expressType',
          label: '快件类型',
          type: 'select',
          forceWidth: 70,
          propInDict: 'expressType'
        },
        {
          prop: 'expressSupplierName',
          label: '快递公司',
          type: 'text',
          forceWidth: 130
        },
        {
          prop: 'postUser',
          label: '寄单人',
          forceWidth: 70,
          type: 'text'
        },
        {
          prop: 'payer',
          label: '付款方',
          type: 'select',
          propInDict: 'expressPayer',
          forceWidth: 125
        },
        {
          prop: 'signTime',
          label: '签收时间',
          type: 'text',
          forceWidth: 76
        },
        {
          prop: 'signUser',
          label: '签收人',
          forceWidth: 70,
          type: 'text'
        },
        {
          prop: 'companyName',
          label: '分公司',
          type: 'text',
          forceWidth: 125
        },
        {
          prop: 'outlineSignUser',
          label: '线下签收人',
          type: 'text',
          forceWidth: 70
        }
      ]
    }
  },
  components: { FinanceTableMass },
  created() {
    let query = {
      ascColumns: [],
      columns: [],
      currPage: 1,
      descColumns: ["createdTime"],
      pageSize: 1000,
      query: [{"column":"universalNo","type":"like","value": JSON.parse(this.$route.query.expressCodeStr)}]
    }
    expressList(query)
    .then(res => {
        this.data = res.data.list
        this.option.columns = this.columns
        this.option.data = this.data
    })
  },
  activated() {
    let query = {
      ascColumns: [],
      columns: [],
      currPage: 1,
      descColumns: ["createdTime"],
      pageSize: 1000,
      query: [{"column":"universalNo","type":"like","value": JSON.parse(this.$route.query.expressCodeStr)}]
    }
    expressList(query)
    .then(res => {
        this.data = res.data.list
        this.option.columns = this.columns
        this.option.data = this.data
    })
  },
  methods: {
    cancel () {
			this.routerBack()
		},
    handlePrintFn(){
			this.isPrint = true
			// console.log(this.infoListArr);
		},
    printCallbackList(){
			this.isPrint = false
		},
  }
}
</script>

<style media="print" lang="scss" scoped>
@media print {
  @page {
    /* size: landscape; */
    size: portrait;
    margin: 1mm 1mm;
  }
}
.print-contont {
  margin: 10px;
  background-color: #fff;
  min-height: calc(100vh - 58px);
}
.post-print {
  width: 1020px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  .print-table {
    margin-top: 40px;
    .title {
      margin: 20px;
      h1 {
        font-size: 16px;
        text-align: center;
      }
    }
  }
  .print-btn-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    vertical-align: middle;
    position: absolute;
    top: 0;
    right: 18px;
    z-index: 999;
    .finance-btn {
      margin-left: 10px;
      min-width: 50px;
      padding: 0 4px;
    }
  }
}
</style>
<style lang="scss">
@media print {
  .title {
    margin: 20px;
    h1 {
      font-size: 16px;
      text-align: center;
    }
  }
  .post-print {
    width: 1004px !important;
  }
  .print-table .vxe-table--header,
  .print-table .vxe-table--body {
    border-collapse: collapse;
    border: none;
    color: #000;
  }
  .print-table table tr td,
  .print-table table tr th {
    border: 1px solid #000;
    color: #000;
  }
  .print-table .ls-vxe-th {
    background-color: none;
    color: #000 !important;
  }
  .print-table .vxe-table--header-wrapper tr .vxe-resizable {
    display: none;
  }
  .vxe-table--render-default.border--default .vxe-body--column,
  .vxe-table--render-default.border--default .vxe-footer--column,
  .vxe-table--render-default.border--default .vxe-header--column,
  .vxe-table--render-default.border--inner .vxe-body--column,
  .vxe-table--render-default.border--inner .vxe-footer--column,
  .vxe-table--render-default.border--inner .vxe-header--column {
    background-image: none;
    background-color: #fff;
  }
  .print-table .finance-table .vxe-table--render-default tr td {
    color: #000;
  }
  .vxe-table--render-default.border--inner .vxe-table--border-line {
    border: none;
  }
  .print-table .vxe-table--header-wrapper {
    position: static;
  }
  .print-table .vxe-table--header-wrapper tr th {
    border-bottom: none;
  }
  .nodata .vxe-table--render-default .vxe-table--body-wrapper{
    border: 1px solid #000;
  }
  .print-table .vxe-table--header, .print-table .vxe-table--body{
    width: 100% !important;
  }
}
</style>