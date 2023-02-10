<template>
    <el-dialog :title="'关联发票'" 
    :visible.sync="relevanceOpne" 
    :before-close="cancel" 
    :close-on-click-modal="false"
    width="1350px">
        <FinanceSearch :searchOption="searchOption1" @search="getList" />
        <FinanceTableMass :option="option1" @send-multi="sendMulti" />
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" :loading='loadingSubmit' @click="rejectSubmit" size="mini">关联</el-button>
            <el-button @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { payInfoRelationInvoice } from '@/api/fin/pay/'
import { usableList } from '@/api/fin/invoicePayment'
import { queryPayInfoInvoices } from '@/api/fin/pay'
import { decimalFixed2, dateFormat } from '@/views/finance/utils/finance'
import { mapState } from 'vuex'
export default {
    name:"PayRelationInvoice",
    mixins: [mixin, routerMixin],
    props: {
        relevanceOpne: {
          type: Boolean,
          default: false
        },
        relationInvoiceForm: {
          type: Object,
          default: () => ({})
        },
    },
    data(){
        return {
            //税率列表
            loadingSubmit: false,
            option1:{},
            multipleSelection2: [],
            invoicePaymentList: [],
            searchOption1: {
                columns: [
                    { label: this.$t('FeeList.settleCorp'), prop: 'recvCorpName', type: 'input', disabled:true },
                    { label: this.$t('FeeList.invoiceNo'), prop: 'invoiceNo', type: 'input' },
                    { label: '发票类型', prop: 'invoiceType', type: 'select' },
                    { label: '开票币种', prop: 'currency', type: 'select', propInDict:"validCurrency", multiple:true  },
                    
                ],
                data: {
                    invoiceType: '',
                    currency: '',
                    invoiceNo: '',
                },
            },
        }
    },
    created(){
        const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
        this.option1 = Object.assign({}, this.option, {
            id: 'option1', $name: 'relationInvoicePrepay',
            data: [],
            tips: {
                text: '',
                show: false,
            },
            operationBtns: false,
            listAmtSummary,
            selection:{
                show:true,
                fixed:"left"
            }
        })
        let columns2 = [
            {prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), type: 'text', key: 'invoiceNo'},
            {prop: 'title', label: '发票抬头', type: 'text', width:125, key: 'title'},
            {prop: 'writeoffAmt', label: '已核销金额', type: 'text', key: 'writeoffAmt'},
            {prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt'},
            {prop: 'remainingAmount', label: '剩余可用金额', withd:"100px", type: 'text', key: 'remainingAmount', 
                formatter: ({row}) => {
                    return decimalFixed2(row.amt - row.writeoffAmt - row.lockAmt)
                }
            },
            {prop: 'invoiceType', label: '开票类型', width:125, type: 'select', key: 'invoiceType'},
            {prop: 'currency', label: '开票币种', type: 'select', key: 'currency',disabled: true},
            {prop: 'amt', label: '开票金额', type: 'input', key: 'amt',inputType:"number", maxlength:"16"},
            {prop: 'rate', label: '开票汇率', type: 'text', key: 'rate'},
            {prop: 'taxRate', label: '开票税率', type: 'text', key: 'taxRate'},
            {prop: 'createdName', label: '登记人', type: 'text', key: 'createdName'},
            {prop: 'createdTime', label: '登记时间', width:125, type: 'text', key: 'createdTime'},
        ]
        this.option1.columns = columns2
    },
    methods:{
        //关联发票显示列表
        getList() {
            this.searchOption1.data.currency = this.relationInvoiceForm.currency.split(',')
            this.searchOption1.data.recvCorpName = this.relationInvoiceForm.recvCorpName
            let query = {
                settleCompCode: this.relationInvoiceForm.settleCompCode,
                supplierCorpCode: this.relationInvoiceForm.recvCorpCode,
                supplierAccountNo: this.relationInvoiceForm.supplierAccountNo,
                ...this.searchOption1.data,
            }
            query.currency = query.currency.toString()
            usableList(query).then((res) => {
                this.option1.data = res.data.map((item) => item)
            })
            queryPayInfoInvoices({ payInfoIdList: this.relationInvoiceForm.payInfoId }).then((res) => {
                let list = []
                if(res.data && res.data.length){
                    res.data.forEach((item) => {
                        list.push(item.invoicePayment)
                    })
                }
                
                if(this.invoicePaymentList.length){
                let invoicePaymentList = this.invoicePaymentList.map(item=>{
                    return item.invoiceNo
                })
                let invoiceNo = [...new Set(invoicePaymentList)]
                let invoiceNoList = list.filter((data)=>{
                    return invoiceNo === data.invoiceNo
                })
                console.log(invoiceNoList);
                this.option1.data.push(...invoiceNoList)
                }
                // this.debounceLs(() => {
                //     this.getListAmtSummary(res.data)
                // },1000)
            })
        },
        getListAmtSummary(val) {
            // if (val.length) {
            let realpayAmtTotalList = []
            let balanceTotalList = []
            let list = val
            let currencyList = [...new Set(list.map(item => item.currency))]
            currencyList.forEach(item => {
                let arr = list.filter(keys => keys.currency === item)
                let sum = arr.reduce((a, b) => Number(a) + Number(b.amt), 0)
                if(sum && item){
                realpayAmtTotalList.push({
                    currency: item,
                    amt: Math.round(sum*100)/100
                })
                }
                let sum1 = arr.reduce((a, b) => Number(a) + decimalFixed2(b.amt - b.writeoffAmt - b.lockAmt), 0)
                if(sum1 && item){
                balanceTotalList.push({
                    currency: item,
                    amt: Math.round(sum1*100)/100
                })
                }
                
            })
            console.log(realpayAmtTotalList);
            console.log(balanceTotalList);

            let data = {
                realpayAmtTotalList,
                balanceTotalList
            }
            console.log(data);
            const labelObj = {
                realpayAmtTotalListLabel: '开票金额',
                balanceTotalListLabel: '剩余可用金额'
            }
            const colorObj = {
                realpayAmtTotalListColor: 'red', // 支持red, green, black三种值
                balanceTotalListColor: 'green'
            }
            this.option1.listAmtSummary = Object.assign(
                this.option1.listAmtSummary,
                {
                show: true,
                data,
                labelObj,
                colorObj
                }
            )
            // }
        },
        sendMulti(data, option) {
            this.multipleSelection2 = data
            if(data.length){
                this.getListAmtSummary(data)
            }else{
                this.getListAmtSummary(this.option1.data)
            }

            
        },
        //关联发票
        rejectSubmit() {
            if (!this.multipleSelection2.length) {
                return this.$msgErrClose('请勾选需要关联发票的项！')
            }
            let supplierAccountNoList = this.multipleSelection2.map((item, index) => {
                return item.supplierAccountNo
            })
            let list = []
            for (let i = 0; i < supplierAccountNoList.length; i++) {
                if(supplierAccountNoList[i] !== this.relationInvoiceForm.supplierAccountNo){
                    list.push(supplierAccountNoList[i])
                }
            }
            list =  [...new Set(list)]
            if(list.length){
                this.$confirm('发票销方银行账号与付款申请单收款银行账号不一致，是否确认关联？', this.$t('Common.tips'), {
                confirmButtonText: this.$t('Common.sure'),
                cancelButtonText: this.$t('Common.cancel'),
                type: 'warning'
              }).then(() => {
                this.payInfoRelationInvoice()
              }).catch(() => {         
              })
            }else{
                this.payInfoRelationInvoice()
            }
        },
        payInfoRelationInvoice(){
            let data = {
                payInfoIdList:this.relationInvoiceForm.payInfoId,
                payInfoInvoiceList: this.multipleSelection2.map((item, index) => {
                    return { invoicePaymentId: item.invoicePaymentId, currency:item.currency, oid: item.oid, useSeq: index }
                }),
            }
            this.loadingSubmit = true
            payInfoRelationInvoice(data).then((res) => {
                this.$msgSucClose('关联提交成功！')
                this.cancel(true)
            }).finally(()=>{
                this.loadingSubmit = false
            })
        },
        cancel(isBreak){
            this.$emit('close-dialog-visible-relationInvoice',false ,isBreak)
        }
    },
    watch:{
        relevanceOpne(val){
            clearTimeout(this.timer2)
            this.timer2 = setTimeout(() => {
                if(val){
                    this.getList()
                }
            },500)
           
        }
    },
    components: {
        FinanceTableMass,
        FinanceSearch,
    },
    computed: {
        ...mapState({
            columnsBase: (state) => state.finance.columns.columnsBase2,
        }),
    },
}
</script>

<style>

</style>