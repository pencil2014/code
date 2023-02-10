<template>
   <el-dialog
    class=""
    :title="'拆分付款'"
    :visible.sync="paySeparatelyDialog"
    :before-close="cancel"
    width="900px">
        <el-form :model="paySeparatelyForm" ref="paySeparatelyForm" :inline="true" label-width="120px" size="mini" class="pay-separately-form">
            <el-form-item label="结算单位" prop="recvCorpName" >
                <el-input disabled v-model="paySeparatelyForm.recvCorpName"></el-input>
            </el-form-item>
            <el-form-item label="金额" prop="applyPayAmt" >
                <el-input disabled v-model="paySeparatelyForm.applyPayAmt"></el-input>
            </el-form-item>
            <el-form-item label="币种" prop="currency" >
                <el-input disabled v-model="paySeparatelyForm.currency"></el-input>
            </el-form-item>
            <el-form-item label="付款方式" prop="payWay" >
                <el-select v-model="paySeparatelyForm.payWay"
                    placeholder="请选择" disabled>
                        <el-option
                        v-for="it in dictMap['payWay']"
                        :key="it.value"
                        :label="it.label"
                        :value="it.value">
                        </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="剩余可拆分金额" prop="applyPayAmt" >
                <el-input disabled v-model="paySeparatelyForm.applyPayAmt"></el-input>
            </el-form-item>
            <div class='finance-pay-form-container'>
                <el-form-item label="付款银行" prop="payBankBranch" >
                    <el-input disabled v-model="paySeparatelyForm.payBankBranch"></el-input>
                </el-form-item>
                <el-form-item label="付款账户名" prop="payAccountName" >
                    <el-input disabled v-model="paySeparatelyForm.payAccountName"></el-input>
                </el-form-item>
                <el-form-item label="付款账号" prop="payAccountNo" >
                    <el-input disabled v-model="paySeparatelyForm.payAccountNo"></el-input>
                </el-form-item>
            </div>
        </el-form>
        <div class="finance-table-container"  v-for="(item,index) in payInfoList" :key="index" style="margin: 6px 14px;">
            <div class="money-box" style="background-color: #E9E9E9;">
                <div class="money-box-left ">
                <div class="money-title">拆分{{index+1}}</div>
                </div>
                <div class="money-box-right">
                    <el-button class="finance-btn" @click="paySeparatelyAdd" v-show="index == 0" size="mini">添加拆分</el-button>
                    <el-button class="finance-btn" @click="paySeparatelyDelete(index)" v-show="index != 0" size="mini">删除拆分</el-button>
                    <el-button
                        type="text"
                        class="collapse-btn"
                        @click="handleCollapse(item.isShowT, index)"
                        size="mini"
                        >
                        收起
                        <i :class="[`el-icon-arrow-up`]"></i>
                    </el-button>
                </div>
            </div>
            <div class="settlement-detail-form-1" v-show="item.isShowT">
                <el-form :model="settlementForm" ref="settlementForm" :inline="true" size="mini" style="padding: 10px 0">
                    <el-form-item label="付款方式" prop="payWay">
                        <el-select v-model="item.payWay"
                            @change="(value, currency, payCompCode,obj) => {select3.change(value, item.currency, item.payCompCode,item) }"
                            placeholder="请选择" >
                                <el-option
                                v-for="it in dictMap['payWay']"
                                :key="it.value"
                                :label="it.label"
                                :value="it.value">
                                </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="item.payWay==='hk_china'" label="手续费扣款方式：" prop="transferFeeDeductWay" :rules="{ required: true, message: ' ', trigger: 'blur' }" style="margin-left:10px;" >
                        <el-select v-model="item.transferFeeDeductWay" placeholder="请选择"
                        >
                            <el-option
                            v-for="it in dictMap['transferFeeDeductWay']"
                            :key="it.value"
                            :label="it.label"
                            :value="it.value">
                            </el-option>
                        </el-select>
                        </el-form-item>
                    <el-form-item label="拆分金额" prop="applyPayAmt">
                        <el-input @input="(value, $index) => {select5.change(value, index) }"  v-model="item.applyPayAmt" v-lsNumber="{value:'number', obj:item, key:'applyPayAmt'}" ></el-input>
                    </el-form-item>
                    <el-form-item label="选择发票" prop="payInvoices">
                        <el-select v-model="item.payInvoices"
                            multiple
                            collapse-tags
                            style="width:160px;"
                            @change="(value, $index) => {select4.change(value, index) }"
                            placeholder="请选择发票" >
                                <el-option
                                v-for="it in payInfoInvoicesList"
                                :key="it.invoiceNo"
                                :label="it.invoiceNo"
                                :value="it.invoiceNo">
                                </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <!-- <el-table
                v-show="item.payWay !== 'cash' && item.payWay !== 'prepay_dedue'"
                :data="[item]"
                style="width: 100%">
                <el-table-column
                    fixed
                    :align="'center'"
                    prop="payCompName"
                    label="所属分公司">
                </el-table-column>
                <el-table-column
                    fixed
                    :align="'center'"
                    prop="payAccountShortName"
                    label="付款银行简称">
                    <template slot-scope="scope">
                        <el-select
                        size="mini"
                        v-model="scope.row.payAccountShortName"
                        :placeholder="'请选择付款银行简称'"
                        highlight-first-item="true"
                        :remote-method="(queryString) => {bankAccountList1(queryString,scope.row)}"
                        @visible-change="(value) => {bankAccountList1(value,scope.row) }"
                        @change="(value) => {select1.change(value,scope.row) }"
                        >
                        <el-option
                            v-for="(optionItem, j) in bankAccountSelectOptions1"
                            :key="'select' + item.prop + j"
                            :label="optionItem.label"
                            :value="optionItem.value"
                        ></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    fixed
                    :align="'center'"
                    prop="payBankName"
                    label="付款银行">
                </el-table-column>
                <el-table-column
                    fixed
                    :align="'center'"
                    prop="payAccountName"
                    label="付款账户名">
                </el-table-column>
                <el-table-column
                    fixed
                    :align="'center'"
                    prop="payAccountNo"
                    label="付款账号">
                </el-table-column>
                </el-table> -->
                <FinanceTableMass
                    :option="item.option1"
                />
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="paySeparatelySubmit" size="mini">提交</el-button>
            <el-button @click="cancel" size="mini">取消</el-button>
        </span> 
    </el-dialog>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryPayApplySettleInfo,splitPayApplySettle } from '@/api/fin/pay/'
import { orderSplitPayOrder } from '@/api/fin/pay'
let defaultCreateQuery = {
    "payCompCode":"",
    "payCompName":"",
    "payWay":"",
    "recvAccountNo":"",
    "recvAccountName":"",
    "recvBankAccountId":"",
    "recvBankCode":"",
    "recvBankName":"",
    "recvCorpCode":"",
    "recvCorpName":"",
    "delayInvoice":"",
    "isShowT":true,
    "payInfoInvoices":[],
    "option1":{}
}
export default {
    name:"PaySeparately",
    mixins: [mixin,routerMixin],
    props:{
        applyNo: {
            type: String,
            default: ''
        },
        paySeparatelyDialog:{
            type:Boolean,
            default:false
        },
    },
    data(){
        return {
            paySeparatelyForm:Object.assign({},defaultCreateQuery),
            payInfoList:[],
            payInfoInvoicesList:[],
            splitPayOrderList :[
                {applyAmt:""},
                {applyAmt:"",showClose:true}
            ],
            settlementForm:{},
            confirmStatus:'',
            bankAccountSelectOptions1:[],
            option1: {},
        }
    },
    created(){
        this.select1= {
            change: (value, row) => {
                let obj = this.bankAccountSelectOptions1.find(item => {
                return item.settleUnitBankAcctId === value
                })
                console.log(row);
                row.payAccountShortName = obj.accountShortName
                row.payBankName = obj.bankName
                row.payAccountNo = obj.accountNo
                row.payAccountName = obj.accountName
                row.payCompName = obj.unitName
                row.payBankBranch = obj.bankBranch
                row.payBankCode = obj.bankCode
                row.payBankAccountId = obj.settleUnitBankAcctId
            }
        }
        this.select3 = {
            change: (value, currency,payCompCode,obj) => {
                let payWay = value
                let hasIntrabranch = ''
                if( payWay === 'intrabranch'){
                    hasIntrabranch = "yes"
                }
                if(payWay === 'cash' || payWay === 'prepay_dedue' || payWay === 'intrabranch'){
                    payWay = ""
                }
                this.$store.dispatch('dict/bankAccountList', { "currency":currency, receipayType: "pay", hasIntrabranch, "unitCode":payCompCode,"countryOrgType":payWay}  ).then(res => {
                let payBank = res && res.length ? {
                    payAccountShortName : res[0].accountShortName,
                    payBankName : res[0].bankName,
                    payAccountNo : res[0].accountNo,
                    payAccountName : res[0].accountName,
                    payCompName : res[0].unitName,
                    payBankBranch : res[0].bankBranch,
                    payBankCode : res[0].bankCode,
                    payBankAccountId : res[0].settleUnitBankAcctId,
                } : {
                    payAccountShortName : "",
                    payBankName : "",
                    payAccountNo : "",
                    payAccountName : "",
                    payCompName : "",
                    payBankBranch : "",
                    payBankCode :"",
                    payBankAccountId :"",
                }
                Object.assign(obj,{},payBank)
                })
            }
        },
        this.select4 = {
            change: (value, index) => {
                // let list = this.payInfoList.map(item=>{
                //     return item.applyPayAmt
                // })
                // let sum = list.reduce((prev, cur)=> {
                //     return Number(prev) + Number(cur);
                // })
                let data =[]
                if(value.length){
                    for (let i = 0; i < value.length; i++) {
                        this.payInfoInvoicesList.forEach(element=>{
                            if(element.invoiceNo == value[i]){
                                data.push(Object.assign({
                                    relevanceAmt:0,
                                    invoiceNo:"",
                                    amt:0,
                                    invoiceType:"",
                                    currency:"",
                                    rate:"",
                                    taxRate:"",
                                    taxAmt:0,
                                    invoiceAmt:0,
                                    lockAmt:0,
                                    writeoffAmt:0,
                                },element))
                            }
                        } )
                    }
                }
                // if(this.paySeparatelyForm.currency === 'USD'){
                //     if(data.length){
                //         let amtList = data.map(item=>{
                //             return item.invoiceAmt + (item.amt - item.writeoffAmt - item.lockAmt)
                //         })
                //         let amtSum = amtList.reduce((prev, cur)=> {
                //             return Number(prev) + Number(cur);
                //         })
                //         let applyPayAmtList = this.payInfoList.map((item,i)=>{
                //             if(i !== index) {
                //                 return item.applyPayAmt
                //             }else{
                //                 return 0
                //             }
                //         })
                //         console.log(applyPayAmtList);
                //         let applyPayAmt = applyPayAmtList.reduce((prev, cur)=> {
                //             return Number(prev) + Number(cur);
                //         })
                //         // console.log(applyPayAmt);

                //         if((this.paySeparatelyForm.applyPayAmt - applyPayAmt) < amtSum){
                //             if(this.payInfoList.length === 1 ){
                //                 this.payInfoList[index].applyPayAmt = this.paySeparatelyForm.applyPayAmt
                //             }else {
                //                 this.payInfoList[index].applyPayAmt = this.paySeparatelyForm.applyPayAmt - applyPayAmt
                //             }
                //         } else {
                //             this.payInfoList[index].applyPayAmt = amtSum
                //         }
                        
                //     }else{
                //         this.payInfoList[index].applyPayAmt = ''
                //     }
                // }
                
                // if(data.length){
                //     let amtList = data.map(item=>{
                //         return item.amt
                //     })
                //     var payInfoInvoicesListAmt = amtList.reduce((prev, cur)=> {
                //         return Number(prev) + Number(cur);
                //     })
                // }
                
                this.payInfoList[index].option1.data = data
                this.relevanceAmtData(value, index)
            }
        },
        this.select5 = {
            change: (value, index) =>{
                clearTimeout(this.timer1)
                this.timer1 = setTimeout(() => {
                    this.relevanceAmtData(value, index)
                }, 800)
                
            }
        }
        this.option1 = Object.assign({}, this.option, {
            id: 'option1', $name: 'splitPayApplySettle1',
            data: [
                ... this.option.data
            ],
            tips: false,
            operationBtns:false,
            index:{
                show:true
            },
            columns:[
                {
                    prop: 'invoiceNo',
                    label: '发票号',
                    type: 'text',
                },
                {
                    prop: 'invoiceType',
                    label: '开票类型',
                    type: 'select',
                    width:100,
                    propInDict:"invoiceType"
                },
                {
                    prop: 'amt',
                    label: '开票金额',
                    type: 'text',
                },
                {
                    prop: 'currency',
                    label: '开票币种',
                    type: 'text',
                },
                {
                    prop: 'rate',
                    label: '开票汇率',
                    type: 'text',
                },
                {
                    prop: 'taxRate',
                    label: '开票税率',
                    type: 'text',
                },
                {
                    prop: 'taxAmt',
                    label: '税额',
                    type: 'text',
                },
                // {
                //     prop: 'remainingAmount',
                //     label: '剩余可用金额',
                //     type: 'text',
                //     formatter: (row, pItem) => {
                //         return row.invoiceAmt + (row.amt - row.writeoffAmt - row.lockAmt)
                //     }
                // },
                {
                    prop: 'relevanceAmt',
                    label: '关联金额',
                    type: 'text',
                    // formatter: (row, pItem) => {
                    //     return row.invoiceAmt + (row.amt - row.writeoffAmt - row.lockAmt)
                    // }
                },
            ]
        })
        // this.option1.columns = columns
    },
    methods:{
        getData(){
            this.payInfoList = []
            let data = {
                "applyNo": this.applyNo
            }
            queryPayApplySettleInfo(data).then(res => {
            if (res.code === 0) {
                this.paySeparatelyForm = res.data.payInfoVo
                let payInfoVo = Object.assign({},defaultCreateQuery)
                this.payInfoList.push(Object.assign(payInfoVo,{},res.data.payInfoVo,{
                    applyPayAmt:"",
                    option1:this.option1
                }))
                let data = []
                res.data.payInfoVo.payInfoInvoices.forEach(item => {
                    Object.assign(item,{},item.invoicePayment)
                    data.push(item)
                })
                this.payInfoInvoicesList = data
                this.payInfoList[0].option1.data = []
            }
            }).catch(err=>{
                this.cancel()
            })
        },
        cancel(isBreak){
            this.$emit('close-pay-separately-dialog',false ,isBreak)  //第一参数返回不刷新，第二参数刷新列表
            this.$refs.paySeparatelyForm.resetFields()
            this.splitPayOrderList = [
                {applyAmt:""},
                {applyAmt:"",showClose:true}
            ]
        },
        paySeparatelySubmit(){
            let sumAmt = 0
            this.payInfoList.filter(item=>{
               sumAmt = new LSnum(item.applyPayAmt).plus(sumAmt).num
            })
            if(sumAmt > this.paySeparatelyForm.applyPayAmt){
                return this.$msgErrClose('拆分金额总和不能大于剩余可拆分金额!')
            }
            let list = []
            this.payInfoList.forEach(item=>{
                list.push({
                    "currency": item.currency,
                    "payAccountNo":item.payAccountNo,
                    "payAccountName":item.payAccountName,
                    "payBankAccountId":item.payBankAccountId,
                    "payBankBranch":item.payBankBranch,
                    "payBankCode":item.payBankCode,
                    "payBankName":item.payBankName,
                    "payWay":item.payWay,
                    "applyPayAmt":item.applyPayAmt,
                    "payInfoInvoices":item.option1.data.filter((it)=>{
                        return {
                            currency:it.currency,
                            invoicePaymentId:it.invoicePaymentId,
                            invoiceNo:it.invoiceNo,
                        }
                    }),
                    "transferFeeDeductWay": item.transferFeeDeductWay
                }) 
            })
            for (let i = 0; i < list.length; i++) {
                if (list[i].applyPayAmt == '' ) {
                    return this.$msgErrClose('拆分金额不能为空或为0!')
                }
                if (list[i].applyPayAmt == 0 ) {
                    return this.$msgErrClose('拆分金额不能为0!')
                }
                if (list[i].payWay==='hk_china' && !list[i].transferFeeDeductWay) {
                    return this.$msgErrClose('请选择手续费扣款方式!')
                }
            }
            let data = {
                "applyNo": this.applyNo,
                "payInfoList":list
            }
            let isInvoice = false
            data.payInfoList.forEach((item,index)=>{
                if(!item.payInfoInvoices.length){
                    isInvoice = true
                }
            })
            if(!this.payInfoInvoicesList.length){
               return this.splitPayApplySettleFn(data)
            }
            if(isInvoice){
                this.$confirm('您有拆分付款未选择发票，请确认是否提交？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.splitPayApplySettleFn(data)
                }).catch(() => {         
                })
            }else{
                this.splitPayApplySettleFn(data)
            }
        },
        splitPayApplySettleFn(data){
            splitPayApplySettle(data).then(res=>{
                if(res.code === 0 ){
                    this.cancel(true)
                    this.$msgSucClose('拆分提交成功！')
                }
            })
        },
        //增加拆分按钮
        paySeparatelyAdd(){
            let data ={
                "payCompCode":"",
                "payCompName":"",
                "payWay":"",
                "recvAccountNo":"",
                "recvAccountName":"",
                "recvBankAccountId":"",
                "recvBankCode":"",
                "recvBankName":"",
                "recvCorpCode":"",
                "recvCorpName":"",
                "delayInvoice":"",
                "payInfoInvoices":[],
                "isShowT":true,
                "option1": Object.assign({}, this.option, {
                    id: 'option2', $name: 'splitPayApplySettle2',
                    data: [
                        ... this.option.data
                    ],
                    tips: false,
                    operationBtns:false,
                    index:{
                        show:true
                    },
                    columns:[
                        {
                            prop: 'invoiceNo',
                            label: '发票号',
                            type: 'text',
                        },
                        {
                            prop: 'invoiceType',
                            label: '开票类型',
                            type: 'select',
                            width:100,
                            propInDict:"invoiceType"
                        },
                        {
                            prop: 'amt',
                            label: '开票金额',
                            type: 'text',
                        },
                        {
                            prop: 'currency',
                            label: '开票币种',
                            type: 'text',
                        },
                        {
                            prop: 'rate',
                            label: '开票汇率',
                            type: 'text',
                        },
                        {
                            prop: 'taxRate',
                            label: '开票税率',
                            type: 'text',
                        },
                        {
                            prop: 'taxAmt',
                            label: '税额',
                            type: 'text',
                        },
                        {
                            prop: 'relevanceAmt',
                            label: '关联金额',
                            type: 'text',
                            // formatter: (row, pItem) => {
                            //     return row.amt - row.writeoffAmt - row.lockAmt
                            // }
                        },
                    ]
                })
            }
            this.payInfoList.push(Object.assign(data,{},this.paySeparatelyForm,{
                applyPayAmt:"",
            }))

        },
        mathRound(num){
            return Math.round(num*100)/100
        },
        //带默认值关联金额
        relevanceAmtData(value, index){
            let data = []
            let applyPayAmt = Number(this.payInfoList[index].applyPayAmt)
            // console.log(applyPayAmt);
            this.payInfoList[index].option1.data.forEach(item => {
                if(applyPayAmt<0){
                    return 
                }
                // 剩余可用金额
                // 除自己的列表所有的发票信息关联金额
                let paySeparatelyAmts = this.paySeparatelyAmt(item.invoiceNo,index)
                // console.log("paySeparatelyAmts"+paySeparatelyAmts);
                let applyPayAmtData = item.invoiceAmt + (item.amt - item.writeoffAmt - item.lockAmt)-paySeparatelyAmts
                let relevanceAmt = 0;
                if(applyPayAmtData > applyPayAmt){
                    //关联金额
                    relevanceAmt = applyPayAmt;
                    data.push( this.mathRound(relevanceAmt));
                    applyPayAmt = this.mathRound(0);
                    return 
                }else{
                    relevanceAmt = applyPayAmtData;
                    data.push(this.mathRound(relevanceAmt))
                    applyPayAmt = this.mathRound(applyPayAmt -  applyPayAmtData)
                }
            })
            
            // console.log(data);
            // 给列表分配关联金额
            let list = []
             this.payInfoList[index].option1.data.forEach((item,j)=>{
                list.push(Object.assign(item, {
                    relevanceAmt:data[j]
                }))
            })
            this.payInfoList[index].option1.data = list
        },
        // 除自己的列表所有的发票信息关联金额
        paySeparatelyAmt(val,index){
            let payInfoList = []
            if(this.payInfoList.length){
                this.payInfoList.forEach((item,j)=>{
                    if(index !== j){
                        item.option1.data.forEach((it,k)=>{
                            payInfoList.push(it)
                        })
                    }
                })
                if(payInfoList.length){
                    let list = payInfoList.map(item=>{
                        if(item.invoiceNo === val){
                            return  Number(item.relevanceAmt)
                        }else{
                            return 0
                        }
                    })
                    let relevanceAmt = list.reduce((prev, cur)=> {
                        return Number(prev) + Number(cur);
                    })
                    return relevanceAmt
                }else{
                    return 0
                }
            }else{
                return 0
            }
        },
        //删除拆分按钮
        paySeparatelyDelete(index){
            this.payInfoList.splice(index,1)
        },
        handleCollapse(isShowT,index) {
            console.log(isShowT);
            console.log(index);
            this.payInfoList[index].isShowT = !isShowT
        },
        //  付款银行简称
        bankAccountList1(queryString,row) {
            let payWay = row.payWay
            let hasIntrabranch = ''
            if( payWay === 'intrabranch'){
                hasIntrabranch = "yes"
            }
            if(payWay === 'cash' || payWay === 'prepay_dedue' || payWay === 'intrabranch'){
                payWay = ""
            }
            this.$store.dispatch('dict/bankAccountList', {queryString, "currency":row.currency, receipayType:"pay", hasIntrabranch, "unitCode":row.payCompCode,"countryOrgType":payWay}  ).then(res => {
                console.log(res);
                let list = res && res.length ? res : []
                this.bankAccountSelectOptions1 = list.map(item => {
                item.value = item.settleUnitBankAcctId
                item.label = item.accountShortName
                return item
                })
            })
        },
    },
    watch: {
        paySeparatelyDialog:{
            handler(val){
                if(val){
                    this.$nextTick(()=>{
                        this.getData()
                    })
                }
            },
            immediate: true
        },
        // 'payInfoList': {
        //     handler(newVal, oldVal) {
        //         console.log(newVal);
        //         console.log(oldVal);
        //         clearTimeout(this.timer1)
        //         this.timer1 = setTimeout(() => {

        //         }, 500)
        //     },
        //     deep: true
        // },
    },
    components: {
        FinanceTableMass
    },
    
}
</script>

<style lang="scss" scoped>
    .el-icon{
        position: absolute;
        top: 6px;
    }
    .pay-separately-form{
        border-bottom: 1px solid #D8D8D8;
    }
    .finance-pay-form-container{
        display: inline-block;
    }
</style>
<style lang="scss" scoped>
.finance-page {
    .pay-separately-form{
        /deep/.el-form-item__content{
            width:147px;
        }
    }
}
    

</style>