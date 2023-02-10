<template>
    <el-dialog
    class=""
    :title="'发送水单'"
    :visible.sync="dialogVisibleBankseqFile"
    :before-close="cancel"
    width="450px">
        <el-form 
            :model="bankseqFileData"
            :rules="bankseqFileData"
            ref="bankseqFileData"
            :inline="false"
            size="mini"
            label-width="80px">
            <div v-for="(item,index) in bankseqFileData.contactInfoVoList" :key="index">
                <el-form-item label="联系人姓名" :prop="`contactInfoVoList[${index}].name`" :rules="{ required: true, message: ' ', trigger: 'change' }">
                    <el-autocomplete
                        v-model="item.name"
                        style="width:100%"
                        clearable
                        :fetch-suggestions="(queryString, cb) => {autocomplete1.querySearch && autocomplete1.querySearch(queryString, cb)}"
                        @select="(value) => {autocomplete1.select && autocomplete1.select(value,item)}"
                        @change="(value) => {autocomplete1.change && autocomplete1.change(value,item)}"
                        placeholder="请输入联系人姓名"
                    ></el-autocomplete>
                    <!-- <el-input v-model="item.name"
                    @change="(value) => { autocomplete1.change && autocomplete1.change(value,item)}"
                    placeholder="请输入联系人姓名"></el-input> -->
                </el-form-item>
                <el-form-item label="联系人邮箱" :prop="`contactInfoVoList[${index}].email`" :rules="[{ required: true, message: ' ', trigger: 'change' },]" >
                    <el-autocomplete
                    v-model="item.email"
                    style="width:100%"
                    clearable
                    :fetch-suggestions="(queryString, cb) => {autocomplete.querySearch && autocomplete.querySearch(queryString, cb)}"
                    @select="(value) => {autocomplete.select && autocomplete.select(value,item)}"
                    @change="(value) => {autocomplete.change && autocomplete.change(value,item)}"
                    placeholder="请输入联系人邮箱，多个邮箱用逗号分隔。"
                    ></el-autocomplete>
                </el-form-item> 
                <el-form-item label="水单附件" prop="" >
                   <el-button
                    size="mini"
                    type="text"
                    v-if="item.bankseqFileNo"
                    @click="handleBankseqFileNo(item.bankseqFileNo)"
                    >点击查看</el-button
                  >
                </el-form-item>
                <el-form-item label="系统生成水单" prop="" >
                   <el-button
                    size="mini"
                    type="text"
                    v-if="item.bankseqFileNo"
                    @click="handleBankseqFileNo(item.composeBankseqFileNo)"
                    >点击查看</el-button
                  >
                </el-form-item>
            </div>
        </el-form>
        
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submit" :loading="loading" size="mini">{{ !loading ? '发送' : '发送中...'}}</el-button>
            <el-button @click="cancel" size="mini">取消</el-button>
        </span> 
    </el-dialog>
</template>

<script>
import { queryPayBankseqFileReceiInfo,  sendPayBankseqFile } from '@/api/fin/pay.js'
import { employeeSelectlist } from '@/api/companyResource'
export default {
    props:{
        dialogVisibleBankseqFile: {
            type: Boolean,
            default: false
        },
        bankseqFileData: {
            type: Object,
            default: () => ({})
        },
        bankseqFileList: {
            type: Array,
            default: []
        },
    },
    data(){
        return {
            loading:false,
            emailList:[],
            autocomplete: {
                querySearch: (queryString, cb) => {
                    this.querySearch( queryString , cb)
                },
                select: (optionItem, item) => {
                    console.log(optionItem);
                //    item.name = optionItem.name.trim()
                    
                },
                change: (value,item) => {
                    // 延时150ms获取select中的改变
                    setTimeout(() => {
                        // item.name = undefined; 
                        return
                    }, 150)
                },
            },
            autocomplete1:{
                querySearch: (queryString, cb) => {
                    let data = {
                        "state": "valid",
                        "name": queryString
                    }
                    employeeSelectlist(data).then(res => {
                        console.log(res);
                        let remoteSelectList = res.data.map(item => {
                            return {
                                label: item.email,
                                value:`${item.cname} (${item.email})`
                            }
                        })
                        cb(remoteSelectList)
                    })
                },
                select: (optionItem, item) => {
                    if(optionItem && optionItem.label){
                        this.emailList = [
                            { 
                                label:optionItem.label, 
                                value:optionItem.label,
                            }
                        ]
                        item.email = optionItem.label.trim()
                    }
                    
                },
                change: (value,item) => {
                    // 延时150ms获取select中的改变
                    setTimeout(() => {
                        
                        return
                    }, 150)
                },
            }
        }
    },
    methods:{
        getData(){
            let data = {
                payOrderNoList:this.bankseqFileData.payOrderNoList
            }
            queryPayBankseqFileReceiInfo(data).then(res=>{
                if(res.data && res.data.length){
                     this.bankseqFileList = res.data
                }
            }).catch(err=>{
                this.$emit('bankseqFiletClose', false)
            })
        },
        querySearch(queryString, cb) {
            var restaurants = this.bankseqFileList[0].contactInfoVoList.map(item=> ( { label:item.ename, value:item.email , ...item} ))
            console.log(restaurants);
            var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
            // 调用 callback 返回建议列表的数据
            cb(results.concat(this.emailList));
        },
        createFilter(queryString) {
            return (restaurant) => {
                return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
            };
        },
        submit(){
            this.$refs.bankseqFileData.validate((valid) => {
                if (valid) {
                    // 验证联系人邮箱
                    let str = this.bankseqFileData.contactInfoVoList[0].email.replace(/[\s+,+，+]+/g, ',') //支持中文,号
                    let email = str.split(",");
                    // let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/
                    let reg = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/;
                    for (let i = 0; i < email.length; i++) {
                        if (!reg.test(email[i])) {
                            return this.$msgErrClose('联系人邮箱格式不正确，请重新输入！')
                        }
                    }
                    let data = [{
                        payOrderNo:this.bankseqFileData.contactInfoVoList[0].payOrderNo,
                        contactInfoVoList:this.bankseqFileData.contactInfoVoList.map(item=>{
                            item.email = str
                            return item
                        })
                    }]
                    this.loading = true
                    sendPayBankseqFile(data).then(res=>{
                        this.$msgSucClose('发送水单成功！')
                        this.cancel(true)
                        
                    }).finally(()=>{
                        this.loading = false
                    })
                }
            })
        },
        handleBankseqFileNo(bankseqFileNo) {
            const href = `/base/fileView/preview/${bankseqFileNo}/sowoll`
            window.open(href)
        },
        cancel(isBreak){
            this.$emit('bankseqFiletClose', false, isBreak)
        },

    },
}
</script>

<style>

</style>