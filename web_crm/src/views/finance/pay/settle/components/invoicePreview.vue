<template>
  <el-dialog :title="'预览发票'" 
    :visible.sync="invoicePreviewOpne" 
    :before-close="cancel" 
    :close-on-click-modal="false"
    width="1000px">
        <iframe v-if="invoicePreviewOpne" class="" height="500" width="100%" :src="completeTask"  style="border:none">
           
        </iframe>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" v-if="checkAuth('InvoicePaymentList', 'btn-financeReceive') && copyType  === 'electronic' && receiveState === 'no'" @click="financeReceive" size="mini">签收发票</el-button>
            <el-button @click="cancel" size="mini">取消</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { info,receive } from '@/api/fin/invoicePayment'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
    mixins: [mixin],
    props: {
        invoicePreviewOpne: {
          type: Boolean,
          default: false
        },
        invoicePreviewForm: {
          type: Object,
          default: () => ({})
        },
    },
    data(){
        return {
            completeTask:"",
            copyType:'',
            receiveState:"",
        }
    },
    methods:{
        cancel(isBreak){
            this.$emit('close-dialog-visible-invoicePreview',false ,isBreak)
        },
        getInfo(){
          if(this.invoicePreviewForm.fileNo){
            this.copyType = this.invoicePreviewForm.copyType
            this.receiveState = this.invoicePreviewForm.receiveState
            // 打标记方便后面改回来,  nameToSowollForViewImg
            // this.completeTask = `/base/fileView/preview/${this.invoicePreviewForm.fileNo}/${this.invoicePreviewForm.fileName}`
            this.completeTask = `/base/fileView/preview/${this.invoicePreviewForm.fileNo}/sowoll`
            return
          }
            let data = {
                invoicePaymentId : this.invoicePreviewForm.invoicePaymentId
            }
            console.log(data);
            info(data).then(res=>{
                console.log(res);
                this.copyType = res.data.copyType
                this.receiveState = res.data.receiveState
                // 打标记方便后面改回来,  nameToSowollForViewImg
                // this.completeTask = `/base/fileView/preview/${res.data.fileNo}/${res.data.fileName}`
                this.completeTask = `/base/fileView/preview/${res.data.fileNo}/sowoll`
            })
        },
        // 财务已收
        financeReceive() {
            let invoicePaymentId = this.invoicePreviewForm.invoicePaymentId

            this.$confirm('是否标记财务已收？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.receiveConfirm(invoicePaymentId)
            }).catch(()=>{})
        },
        // 财务已收确认按钮
        receiveConfirm(invoicePaymentId) {
            let data = {
                invoicePaymentIds: [invoicePaymentId],
            }
            receive(data).then(() => {
                this.$message({
                message: '标记已收成功！',
                type: 'success',
                showClose: true,
                })
                this.cancel(true)
            })
        },
    },
    watch:{
        invoicePreviewOpne(val){
            clearTimeout(this.timer2)
            this.timer2 = setTimeout(() => {
                if(val){
                    this.getInfo()
                }
            },100)
           
        }
    },
}
</script>

<style lang="scss" scoped>
        #sidenav-container {
            display: none;
        }
        #toolbar {
            display: none;
        }
</style>