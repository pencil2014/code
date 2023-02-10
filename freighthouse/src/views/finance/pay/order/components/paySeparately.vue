<template>
   <el-dialog
    class=""
    :title="'拆分付款'"
    :visible.sync="paySeparatelyDialog"
    :before-close="cancel"
    width="700px">
        <el-form :model="paySeparatelyForm" ref="paySeparatelyForm" :inline="true" label-width="120px" size="mini">
            <el-form-item label="结算单位" prop="recvCorpName" >
                <el-input disabled v-model="paySeparatelyForm.recvCorpName"></el-input>
            </el-form-item>
            <el-form-item label="金额" prop="applyAmt" >
                <el-input disabled v-model="paySeparatelyForm.applyAmt"></el-input>
            </el-form-item>
            <el-form-item label="币种" prop="currency" >
                <el-input disabled v-model="paySeparatelyForm.currency"></el-input>
            </el-form-item>
            <el-form-item label="付款方式" prop="payWay" >
                <el-input disabled v-model="paySeparatelyForm.payWay"></el-input>
            </el-form-item>
            <el-form-item label="预付款余额" prop="prepayAccountBalance" v-show="paySeparatelyForm.orderType === '预付抵账' ">
                <el-input disabled v-model="paySeparatelyForm.prepayAccountBalance"></el-input>
            </el-form-item>
            <el-form-item label="剩余可拆分金额" prop="applyAmt" >
                <el-input disabled v-model="paySeparatelyForm.applyAmt"></el-input>
            </el-form-item>
            <el-form-item v-for="(item,index) in splitPayOrderList" :key="index" label="拆分金额" prop="applyAmt" :rules="{required: true, message: '拆分金额不能为空', trigger: 'change'}" >
                <el-input v-model="item.applyAmt" :maxlength="16" v-lsNumber="{value:'number', obj:item, key:'applyAmt'}" ></el-input>
                <i
                    v-if="item.delete"
                    class="el-icon el-icon-close"
                    style="position: absolute;top: 5px;right: 6px;font-size: 12px;color: #C0C4CC;width: 12px;line: height 20px;cursor:pointer;"
                    @click="deleteApplyAmt(item,index)"
                ></i>
                <i
                    v-if="item.showClose"
                    class="el-icon el-icon-circle-plus-outline"
                    style="position: absolute;top: 2px;right: -20px; font-size: 18px;color: #C0C4CC;width: 16px;line: height 20px;cursor:pointer;"
                    @click="addApplyAmt(item,index)"
                ></i>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="paySeparatelySubmit" size="mini">申请</el-button>
            <el-button @click="cancel" size="mini">取消</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { orderSplitPayOrder } from '@/api/fin/pay'
export default {
    name:"PaySeparately",
    mixins: [mixin,routerMixin],
    props:{
        paySeparatelyForm: {
            type: Object,
            default: () => ({})
        },
        paySeparatelyDialog:{
            type:Boolean,
            default:false
        }
    
    },
    data(){
        return {
            splitPayOrderList :[
                {applyAmt:""},
                {applyAmt:"",showClose:true}
            ]
        }
    },
    methods:{
        cancel(isBreak){
            this.$emit('close-pay-separately-dialog',false ,isBreak)  //第一参数返回不刷新，第二参数刷新列表
            this.$refs.paySeparatelyForm.resetFields()
            this.splitPayOrderList = [
                {applyAmt:""},
                {applyAmt:"",showClose:true}
            ]
        },
        paySeparatelySubmit(){
            let splitPayOrderList = this.splitPayOrderList
            let sumAmt = 0 
            for (let i = 0; i < splitPayOrderList.length; i++) {
                if(splitPayOrderList[i].applyAmt == ''){
                    return this.$msgErrClose('拆分金额不能为空!')
                }
                if (!this.validateMoney(splitPayOrderList[i].applyAmt,{positive:true})) {
                    return
                }
                sumAmt += Number(splitPayOrderList[i].applyAmt)
            }
            if(sumAmt > this.paySeparatelyForm.applyAmt){
                return this.$msgErrClose('拆分金额总和不能大于剩余可拆分金额!')
            }
            let data = {
                payOrderNo:this.paySeparatelyForm.payOrderNo,
                splitPayOrderList:this.splitPayOrderList,
            }
            orderSplitPayOrder(data).then(res=>{
                if(res.code === 0 ){
                    this.cancel(true)
                    this.$msgSucClose('拆分成功！')
                }
            })
        },
        addApplyAmt(item,index){
            this.splitPayOrderList[index].delete = false
            this.splitPayOrderList.push({applyAmt:"",showClose:true,delete:true})
            return item.showClose = false
        },
        deleteApplyAmt(item,index){
            this.splitPayOrderList.splice(index,1)
            this.splitPayOrderList[index-1].showClose = true
            if(this.splitPayOrderList.length === 2){
                return
            }
            this.splitPayOrderList[index-1].delete = true
        }
    },
    
}
</script>

<style lang="scss" scoped>
    .el-icon{
        position: absolute;
        top: 6px;
    }
</style>