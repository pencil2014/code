<template>
    <div>
        <div class="finance-list-container">
            <!-- <FinanceTable :option="option1" /> -->
            <el-table :data="tableData" style="width: 100%;" border id="organizationTable">
                <el-table-column prop="relName" label="公司名称" align="center" width="200" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="relType" label="关联类型" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                      {{getDictLabel('customerRelationshipType',scope.row.relType)}}
                    </template>
                </el-table-column>
                <el-table-column prop="isTheSameCompany" label="是否同一家公司" width="80" align="center" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span v-if="scope.row.isTheSameCompany === 'YES'">是</span>
                    <span v-if="scope.row.isTheSameCompany === 'NO'">否</span>
                  </template>
                </el-table-column>
                <el-table-column prop="reason" label="申请原因"  align="center" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{getDictLabel('customerApplyReason',scope.row.reason)}}
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注"  align="center" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="createdName" label="申请人"  align="center" show-overflow-tooltip>
                </el-table-column>
                 <el-table-column prop="createdTime" label="申请时间" align="center" width="150" show-overflow-tooltip>
                    <template slot-scope="scope">
                      {{scope.row.createdTime}}
                    </template>
                  </el-table-column>
                <el-table-column prop="verifyState" label="审核状态" width="100" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                      {{getDictLabel('verifyState',scope.row.verifyState)}}
                    </template>
                </el-table-column>
                <el-table-column prop="verifyEmployeeName" label="审核人" width="130" align="center" show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="verifyTime" label="审核时间" align="center"  show-overflow-tooltip>
                </el-table-column>
                <el-table-column prop="refuseReason" label="拒绝原因" align="center" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="附件" align="center" show-overflow-tooltip>
                    <template slot-scope="scope" v-if="scope.row.attachments">
                        <div class="file-td" v-for="(item, s) in scope.row.attachments" :key="s">  
                           <div v-for="(i, t) in item.fileList" :key="t" style="height: '20px'">
                                <div class="file-link" @click="downLoad(i.fileName, i.fileNo)">{{i.fileName || ''}}</div>
                           </div>
                        </div>
                    </template>
                </el-table-column> 
                <el-table-column prop="verifyState" label="附件类型" width="100px" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div v-for="(item, k) in scope.row.attachments" :key="k" class="file-td" >
                            <!-- {{item.attachType}} -->
                            <div :style="{ height: `${20 * item.fileList.length}px`, lineHeight: `${20 * item.fileList.length}px` }">{{getDictLabel('customerFileType',item.attachType)}}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="附件有效期" align="center" min-width="160px"  class="file-item-wrap" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div v-for="(item, d) in scope.row.attachments" :key="d" class="file-td" >
                            <div v-if="item.startTime" :style="{ height: `${20 * item.fileList.length}px`, lineHeight: `${20 * item.fileList.length}px`}">{{item.startTime}}-{{item.stopTime}}</div>
                            <div v-else :style="{ height: `${20 * item.fileList.length}px`, lineHeight: `${20 * item.fileList.length}px` }">{{item.isLongTerm && item.isLongTerm === 'YES' ? '长期有效' : '否'}}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="150" fixed="right">
                    <template slot-scope="scope">
                        <span class="operationbtns-wrapper" v-if="isCts && !isBlacklist">
                            <el-button type="text" size="mini" @click.stop="showDialog(true, 'edit',scope.row)">更新附件</el-button>
                        </span>
                        <span class="operationbtns-wrapper" v-if="isCts && !isBlacklist">
                            <el-button type="text" size="mini" @click.stop="showDelDialog(true, scope.row)">解绑</el-button>
                        </span>
                         <span class="operationbtns-wrapper" v-if="scope.row.createdBy == userId && scope.row.verifyState ==='refuse' && !isBlacklist">
                            <el-button type="text" size="mini" @click.stop="showDialog(true, 'reApply',scope.row)">重新提交审核</el-button>
                        </span>
					</template>
                </el-table-column>
            </el-table>
            <el-dialog :title="dialogStatus === 'edit' ? '更新附件':dialogStatus === 'add'?'新增关联关系':'编辑关联关系'" :visible.sync="dialogFormVisible" width="552px" id="customerAdd">
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" size="mini" label-width="90px">
                    <el-form-item label="关联类型" prop="relType">
                        <el-select v-model="ruleForm.relType" placeholder="请选择关联类型" clearable :disabled="dialogStatus === 'edit'" @change='(val)=>changeRelType(val)'>
                            <el-option
                            v-for="item in relTypeList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="公司名称" prop="relCustid">
                        <el-select v-model="ruleForm.relCustid" placeholder="请选择公司名称" clearable :disabled="dialogStatus === 'edit'" filterable :filter-method="(val)=>{ getCustomerList(val,ruleForm.relType)}" @focus="(val)=>{ getCustomerList('',ruleForm.relType)}">
                            <el-option
                            v-for="item in customerList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="是否申请绑定为同一家公司" id="radio-wrap" prop="isTheSameCompany" v-if="isMaintenance === true && !isCts">
                        <el-radio-group v-model="ruleForm.isTheSameCompany" :disabled="dialogStatus === 'edit'">
                            <el-radio
                            v-for="item in sameStatus"
                            :key="item.value"
                            :label="item.value"
                            >
                            {{item.label}}
                            </el-radio>
                        </el-radio-group>
                        <div class="upload-text">如需申请绑定为一家做管理适用公海规则请选择“是”</div>
                    </el-form-item>
                    <el-form-item label="申请原因" prop="reason" v-if="ruleForm.isTheSameCompany === 'YES' && isMaintenance === true && !isCts">
                    <el-select v-model="ruleForm.reason" placeholder="请选择申请原因" clearable :disabled="dialogStatus === 'edit'">
                        <el-option
                        v-for="item in applyList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        ></el-option>
                    </el-select>
                    </el-form-item>
                    <el-form-item label="审核人" prop="verifyEmployeeId" v-if="!isCts">
                        <el-select v-model="ruleForm.verifyEmployeeId" placeholder="请选择审核人" clearable :disabled="dialogStatus === 'edit'">
                            <el-option
                            v-for="item in applyPeopleList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            ></el-option>
                        </el-select>
                        </el-form-item>
                        <el-form-item prop="remark" label="备注" >
                        <el-input
                            placeholder="请输入备注"
                            class="link-textarea"
                            width="674"
                            type="textarea"
                            v-model="ruleForm.remark"
                            :maxlength="512"
                            :disabled="dialogStatus === 'edit'"
                        ></el-input>
                    </el-form-item>
                    <div id="fileContent">
                        <div v-for="(fileItem, index) in ruleForm.attachments" :key="index"  id="fileItem">
                            <div>
                                <el-form-item label="附件类型"  :prop="`attachments.${index}.attachType`" :rules="{
                                    required: true,
                                    message: ' ',
                                    trigger: 'change',
                                }">
                                    <el-select v-model="fileItem.attachType" placeholder="请选择附件类型" clearable >
                                        <el-option
                                        v-for="item in customerFileList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="附件有效期"  required> 
                                   <el-date-picker
                                        v-model="fileItem.date"
                                        type="daterange"
                                        style="width: 200px"
                                        placeholder="附件有效期"
                                        value-format="yyyy-MM-dd"
                                        clearable
                                    ></el-date-picker>
                                    <el-checkbox v-model="fileItem.checked" style="margin-left: 20px;">长期有效</el-checkbox>
                                </el-form-item>
                                <span class="red">*</span>
                                <el-form-item  label="上传附件" id="upload">
                                    <div v-if="ruleForm.reason !== ''">
                                        <div class="upload-text" v-if="ruleForm.reason === 'other'">需上传客户书面申请，声明他们是同一家公司</div>
                                        <div class="upload-text" v-else>需上传天眼查的客户关系证明截图</div>
                                    </div>
                                    <div id="uploadAll">
                                        <el-input v-model="fileItem.fileNo"
                                            style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
                                        ></el-input>
                                        <FinanceUploadEmbed
                                            :upload-api="uploadApi2"
                                            :limit="5"
                                            :width="376"
                                            ref="upload"
                                            :acceptTypes="acceptTypes"
                                            :fileListEdit="fileItem.fileListData"
                                            :defaultFileSize="defaultFileSize"
                                            @send-res-file-list="sendResFileList($event, index)"
                                        />
                                        <div class="btn-box">
                                            <i
                                            class="el-icon-circle-plus"
                                            v-if="index === 0"
                                            @click="addItem()"
                                            ></i>
                                            <i
                                            class="el-icon-remove"
                                            v-else
                                            @click="removeItem(index)"
                                            ></i>
                                        </div>
                                    </div>
                                </el-form-item>
                            </div>
                        <!-- <div><img class="file-upload-img" :src="require('@/assets/icon-upload.png')" /></div> -->
                        </div>
                    </div>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button
                    :loading="btnLoading"
                    @click="submitForm('ruleForm')"
                    size="mini"
                    type="primary"
                    >确定</el-button>
                    <el-button size="mini" @click="showDialog(false)">取 消</el-button>
                </div>
            </el-dialog>
            <el-dialog title="解绑" :visible.sync="dialogDelFormVisible" width="552px">
                <el-form :model="ruleDelForm" :rules="delRules" ref="ruleDelForm" size="mini" label-width="90px">
                    <el-form-item label="公司名称" prop="relName">
						<el-input size="mini" v-model="ruleDelForm.relName" disabled></el-input>
					</el-form-item>
                    <el-form-item label="解绑原因" prop="delReason">
                        <el-select v-model="ruleDelForm.delReason" placeholder="请选择解绑原因" clearable>
                            <el-option
                            v-for="item in relieveReasonList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="delRemark" label="解绑备注">
                        <el-input
                            placeholder="请输入备注"
                            class="link-textarea"
                            width="674"
                            :rows="4"
                            type="textarea"
                            v-model="ruleDelForm.delRemark"
                            :maxlength="512"
                        ></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button
                    :loading="btnLoading"
                    @click="submitDelForm('ruleForm')"
                    size="mini"
                    type="primary"
                    >解绑</el-button>
                    <el-button size="mini" @click="showDelDialog(false)">取 消</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
// import FinanceUploadEmbed from '@/views/crm/components/financeUploadEmbed'
import FinanceUploadEmbed from '@/views/crm/components/financeUpload/financeUploadEmbed' 
import CUSTOMER from '@/api/crm/customer'
import { getValueByKey } from '@/api/base'
import RELATION from '@/api/crm/custRelation'
import CrmDialog from '@/views/crm/components/crmDialog'
import { getDictLabel } from '@/utils/tools'
const defaultForm = {
    oid: '',
    relCustid: '',
    relType: '',
    isTheSameCompany: 'YES',
    reason: '',
    checked: false,
    attachments: [{
        date: [],
        checked: false,
        attachType: '',
        index: 0,
        data:[],
        fileListData: []
    }],
    verifyEmployeeId: '',
    remark: '',
}
export default {
    name: 'relationOrganization',
    props: ['custid', 'RELATION', 'action', 'isSubmit', 'selfData','baseInfo', 'isCts', 'isMaintenance','isBlacklist'],
    components: {
        FinanceTable,
        FinanceUploadEmbed,
        CrmDialog
    },
    data() {
        return {
            getDictLabel: getDictLabel,
            // 母子公司已有公司的custid集合
            custidObj: { [this.custid]: true },
            option1: {},
            tableData: [],
            dialogFormVisible: false,
            dialogDelFormVisible: false,
            customerList: [], //公司名称
            relTypeList: [], // 关联类型
            applyList: [], // 申请原因
            customerFileList: [], // 附件类型
            applyPeopleList: [], // 审核人列表
            relieveReasonList: [], //解绑原因列表
            dialogStatus: 'add',
            checkImageStatus: false,
            spanArr: [],
            uploadApi2: '/base/webapi/file/upload',
            defaultFileSize: 100,
            acceptTypes: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar'],
            uploadItem: {
                acceptTypes: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar'], 
                limit: 5,
                prop: 'fileNo',
                labelWidth: '90px'
            },
            sameStatus: [
                {
                    value: 'YES', 
                    label: '是'
                },
                {
                    value: 'NO', 
                    label: '否'
                },
            ],
            ruleForm: {
                oid: '',
                relCustid: '',
                relType: '',
                isTheSameCompany: 'YES',
                reason: '',
                checked: false,
                attachments: [{
                   date: [],
                   checked: false,
                   attachType: '',
                   index: 0,
                   data:[],
                   fileListData: []
                }],
                verifyEmployeeId: '',
                remark: '',
            },
            rules: {
                relCustid: [{ required: true, message: ' '}],
                relType: [{ required: true, message: ' '}],
                isTheSameCompany: [{ required: true, message: ' ', trigger: 'change' }],
                verifyEmployeeId: [{ required: true, message: ' ', trigger: 'change' }],
                reason: [{ required: true, message: ' ', trigger: 'change' }]
            },
            ruleDelForm: {
                delCustid: '',
                relName: '',             
                delReason: '',
                delRemark: '',
                oid: '',
                custid: ''
            },
            delRules: {
                relName: [{ required: true, message: ' '}],
                delReason: [{ required: true, message: ' ', trigger: 'change' }]
            },
            tableData: []
        }
    },
    computed: {
        ...mapGetters(['dictMap']),
        ...mapState('user', ['userId']),
        isBd() {
            return (this.$store.state.user.roles || []).includes('Bd')
        },
    },
    watch: {
        action(val) {
            if (val != 'organization') return
            this.$emit('update:action', '')
            this.dialogStatus = 'add'
            this.showDialog(true, 'add')
        },
        'ruleForm.isTheSameCompany'(val){
            // “客户关系审核”里，若“是否申请绑定为同一家公司”为“是”，则审核人配置为“骆锦程”；
            // “客户关系审核”里，若“是否申请绑定为同一家公司”为“否”，则审核人配置为“张竹琴”；
            if(val === 'YES'){
                this.getdelayReviewer('relation_verifier')
            }else{
                this.getdelayReviewer('relation_verifier')
            }
        }
    },
    created() {
        let data = this.dictMap['customerRelationshipType']
        let list = []
        if (!this.isCts) {
            list = data.filter(o => o.value !== 'payment')
            this.relTypeList = list
        } else {
            this.relTypeList = data
        }
        this.applyList = this.dictMap['customerApplyReason']
        this.customerFileList = this.dictMap['customerFileType']
        this.relieveReasonList = this.dictMap['relieveReason']
        // this.getCustomerList()

        this.getList()
        this.$forceUpdate()
    },
    activated(){
        //默认为不是一家公司'NO'
        this.getdelayReviewer('relation_verifier')
         this.dialogStatus = 'add'
    },
    mounted() {
        // console.log('isCts',this.isCts)
        // console.log('isMaintenance', this.isMaintenance)
    },
    methods: {
        getList() {
            RELATION.list({ custid: this.custid })
            .then((res) => {
                this.option1.data = res.data
                this.tableData = res.data
                this.$forceUpdate()
            })
        },
        getdelayReviewer(type){
            getValueByKey(type).then(res=>{
                if (res.data && res.data.length) {
                    let list = res.data.split(",")
                    for (let i = 0; i < list.length; i++) {
                        this.applyPeopleList.splice(
                        0,
                        1000,{
                            label:list[1],
                            value:list[0]
                        })
                    }
                    this.ruleForm.verifyEmployeeId = list[0]
                    defaultForm.verifyEmployeeId= list[0]
                }
            })
        },
        //关系类型，主要是选择付款关系的时候
        changeRelType(val){
            this.getCustomerList('',val)
        },
        getCustomerList(val,type) {
            let params = {
                relType: type,
                custid: this.custid
            }
           if (val && val !== '') {
             params.name = val
           }
           CUSTOMER.relationCustomerList(params).then(
                (res) => {
                  this.customerList = res.data
                    .map((v) => ({ ...v, value: v.custid, label: v.name }))
                    .filter((v) => !this.custidObj[v.custid])
                }
              )
        },
        showDialog(flag, type = 'close', row = {}) {
            this.dialogFormVisible = flag
            this.dialogStatus = type
            this.$nextTick(() => {
                this.$refs.ruleForm.resetFields()
            })
            if (type === 'close') {
                this.$nextTick(() => { 
                    // let arr = this.ruleForm.attachments
                    this.ruleForm.attachments.forEach(item => item.data = [])
                    this.$refs.ruleForm.resetFields()
                    let filed = this.$refs.upload 
                    filed.forEach(item=>item.clearFile())
                    this.$forceUpdate()
                })

            }
            if (this.dialogFormVisible) {
                if (type === 'edit' || type === 'reApply') {
                    this.ruleForm.oid = row.oid
                    this.ruleForm.relCustid = row.relCustid,
                    this.ruleForm.relType = row.relType,
                    this.ruleForm.isTheSameCompany = row.isTheSameCompany
                    this.ruleForm.reason = row.reason
                    this.ruleForm.remark = row.remark
                    let fileList = []
                    if (row.attachments.length > 0) {
                        for (let i = 0; i < row.attachments.length; i++) {
                            let obj = {}
                            obj.fileListData = []
                            obj.data = row.attachments[i].fileList
                            for (let j = 0; j < row.attachments[i].fileList.length; j++) {
                                let o = row.attachments[i].fileList[j]
                                let fileItem = {
                                    name: o.fileName,
                                    url: o.filePath,
                                    fileNo:o.fileNo
                                }
                                obj.fileListData.push(fileItem)
                            }
                            obj.attachType = row.attachments[i].attachType
                            obj.oid = row.attachments[i].oid?row.attachments[i].oid:''
                            if (row.attachments[i].isLongTerm && row.attachments[i].isLongTerm === 'YES') {
                                obj.checked = true
                                obj.date = []
                            } else {
                                obj.date = [row.attachments[i].startTime, row.attachments[i].stopTime]
                            }
                            fileList.push(obj)
                        }
                        this.ruleForm.attachments = fileList
                    }
                }else {
                    this.ruleForm = {...defaultForm}
                    this.ruleForm.attachments = []
                    this.ruleForm.attachments = [
                        {
                            date: [],
                            checked: false,
                            attachType: '',
                            index: 0,
                            data:[],
                            fileListData: []
                        }
                    ]
                    // this.$forceUpdate()
                    this.$nextTick(() => {
                        this.$refs.ruleForm.clearValidate()
                    })
                }
            }
        },
        showDelDialog(flag, row = {}) {
            this.dialogDelFormVisible = flag
            this.ruleDelForm.delCustid = row.relCustid
            this.ruleDelForm.relName = row.relName
            this.ruleDelForm.oid = row.oid
            this.ruleDelForm.custid = row.custid
            this.$nextTick(() => {
                this.$refs.ruleDelForm.resetFields()
            })
        },
        handleAdd() {

        },
        addItem() {
            let obj = {
                date: [],
                checked: false,
                attachType: '',
                index: 0,
                data:[]
            }
            this.ruleForm.attachments.push(obj)
        },
        removeItem(index) {
             this.ruleForm.attachments.splice(index, 1)
        },
        submitForm() {
            // return
            this.$refs['ruleForm'].validate((valid) => {
            if (valid) {
                // 附件规则判断
                for (let i = 0; i < this.ruleForm.attachments.length; i++) {
                    let item = this.ruleForm.attachments[i]
                    if (((item.date && item.date.length > 0) || item.checked === true) && item.data.length < 1 ) {
                        return this.$msgErrClose('请上传附件！')
                    }
                    if (item.data.length > 0 && (!(item.date &&  item.date.length > 0) && item.checked === false)) {
                        return this.$msgErrClose('请选择附件有效期！')
                    }
                    if (item.checked === true && (item.date && item.date.length > 0)) {
                        return this.$msgErrClose('附件有效期只能选择一种！')
                    }
                    if (item.attachType !== '' && item.data.length < 1) {
                        return this.$msgErrClose('请上传附件！')
                    }
                    if (item.data.length < 1 && this.ruleForm.isTheSameCompany && this.ruleForm.isTheSameCompany === 'YES') {
                        return this.$msgErrClose('请上传附件！')
                    }
                }
                let { relCustid , relType, isTheSameCompany, reason,  verifyEmployeeId, remark, attachments} = this.ruleForm
                let params = {
                    relCustid,
                    relType,
                    custid: this.custid,
                    remark
                }
                if (this.isMaintenance === true) {
                    params.isTheSameCompany = isTheSameCompany
                    params.verifyEmployeeId = verifyEmployeeId
                }
                if (this.isMaintenance === true && !this.isCts && this.ruleForm.isTheSameCompany === 'YES') {
                    params.reason = reason
                }
                if (attachments.length > 0) {
                    let fileData = []
                    for (let i = 0; i < attachments.length;i++) {
                        if ((attachments[i].date &&  attachments[i].date.length > 0)||  attachments[i].checked === true) {
                            let obj = {}
                            obj.attachType = attachments[i].attachType
                            obj.fileList = attachments[i].data
                            if (attachments[i].date && attachments[i].date.length > 0) {
                                obj.startTime = attachments[i].date[0]
                                obj.stopTime = attachments[i].date[1]
                            } else {
                                obj.isLongTerm = 'YES'
                            }
                            obj.oid = attachments[i].oid?attachments[i].oid:''
                            fileData.push(obj)
                        }
                    }
                    params.attachments = fileData
                } 
                if (this.dialogStatus === 'edit') {
                    params.oid = this.ruleForm.oid
                    RELATION.update(params).then(({ data }) => {
                        this.showDialog(false)
                        this.getList()
                        this.$msgSucClose('更新附件成功！')
                    })
                }else if(this.dialogStatus === 'reApply'){
                    params.oid = this.ruleForm.oid
                    RELATION.submit(params).then(({ data }) => {
                        this.showDialog(false)
                        this.getList()
                        this.$msgSucClose('重新提交审核成功！')
                    })
                } else {
                    RELATION.submit(params).then(({ data }) => {
                        this.showDialog(false)
                        this.getList()
                        this.$msgSucClose('新增关联关系成功！')
                    })
                }
            } else {
                return this.$msgErrClose('请将必填项填写完整！')
            }
            });
        },
        submitDelForm() {
            this.$refs['ruleDelForm'].validate((valid) => {
                if (valid) {
                    let params = {...this.ruleDelForm}
                    delete params.relName
                    RELATION.delete(params).then(({ data }) => {
                        this.showDelDialog(false)
                        this.getList()
                        this.$msgSucClose('解绑成功！')
                    })
                }
            })
        },
        sendFileList(val, item, index) {
            let list = []
            for (let i = 0; i < val.length; i++) {
                let obj = {}
                obj.fileNo = val[i].fileNo
                obj.filePath = val[i].filePath
                obj.fileName = val[i].name
                list.push(obj)
            }
            this.ruleForm.attachments[index].data = list
        },
        downLoad(fileName, fileNo) {
            fileName = fileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
            const href = `/base/fileView/preview/${fileNo}/${fileName}`
            window.open(href)
        },
        sendResFileList(val, index) {
            let list = []
            for (let i = 0; i < val.length; i++) {
                let obj = {}
                obj.fileNo = val[i].fileNo
                obj.filePath = val[i].filePath
                obj.fileName = val[i].name
                list.push(obj)
            }
            this.ruleForm.attachments[index].data = list
        }
    }
}
</script>

<style lang="scss" scoped>
.red{
    color: #ff4949;
    position: absolute;
    left: 50px;
    bottom: 126px;
}
/deep/.finance-el-table .el-button{
  line-height: 20px;
}
/deep/#radio-wrap .el-form-item__label {
    height: 44px !important;
}
/deep/#radio-wrap .el-form-item__content {
    line-height: 44px !important;
}
/deep/ #upload .el-form-item__content {
    width: calc(100% - 90px) !important;
}
/deep/ #customerAdd .el-dialog__body .el-form-item__content > div {
    width: 400px !important;
}
/deep/ #customerAdd .el-dialog__body  .el-form-item__content .el-date-editor--daterange{
    width: 200px !important;
}
#customerAdd #fileItem {
    border-left: 1px solid #dfe6ec;
    border-right: 1px solid #dfe6ec;
    border-bottom: 1px solid #dfe6ec;
    padding-top: 10px;
}
#organizationTable {
    margin-top:20px;
    .file-item.wrap {
       .file-item {
            border-bottom: 1px solid #dfe6ec;
        }
    }
    .file-item.wrap:nth-last-of-type(1) {
        border-bottom:none;
    }
}
/deep/ #organizationTable .cell.el-tooltip {
    text-overflow :ellipsis !important;
    white-space :nowrap !important; 
    overflow : hidden !important; 
    padding:0 !important;
}
/deep/ #organizationTable td {
    text-overflow :ellipsis !important;
    white-space :nowrap !important; 
    overflow : hidden !important; 
    padding: 0 !important;
}
/deep/ #organizationTable td {
    border-right:1px solid #dfe6ec !important;
}
/deep/ #customerAdd #fileContent #fileItem:nth-of-type(1) {
    border-top: 1px solid #dfe6ec;
}
/deep/ #customerAdd #fileItem .el-dialog__body .el-form-item__content > div {
    width: 400px !important;
}
.upload-text {
    color:#ff4949;
}
.btn-box {
    float: left;
}
.file-td {
    border-bottom: 1px solid #dfe6ec;
}
.file-td:nth-last-of-type(1) {
    border:none;
}
.file-link {
  color: #3E80F5 !important;
  cursor: pointer;
  height:20px;
  padding: 0 5px;
  text-overflow :ellipsis !important;
  white-space :nowrap !important; 
  overflow : hidden !important; 
}
#uploadAll{
    width:100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .btn-box {
        width:40px;
        /deep/ .el-icon-circle-plus {
           color: #417f90;
           font-size: 20px;
        }
        /deep/ .el-icon-remove {
            font-size: 20px;
        }
    }
}
::v-deep {
    .el-dialog__body {
      padding: 20px 20px 10px 20px;
      .el-form-item {
        display: flex;
        margin: 0 !important;
        margin-bottom: 4px !important;
        .upload-file-cont {
          width: 100% !important;
        }
      }
      .el-form-item__content {
        margin-left: 0 !important;
        flex: 1 1 auto;
        & > div {
          width: 100%;
        }
      }
    }
    .el-dialog__footer {
      padding: 0 20px 20px;
    }
    .finance-el-table .el-button{
      line-height: 16px;
    }
  }
</style>