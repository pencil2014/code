<template>
    <div class="table-layout" ref="tableLayout">
        <Table :config="config" :tableQuery="tableQuery" :callback="tableCallback">
            <!-- table单选操作-->
            <template v-slot:MutiSelectSlot>
                <RadioSelect :radioConfig="config.radioConfig" :callback="tableCallback"/>
            </template>

            <!-- 选中之后底部的操作按钮-->
            <template v-slot:selectedBtnSlot>
                <BtnSelected :selectOperates="config.selectOperates" :callback="btnSelectedCallback" />
            </template>
        </Table>
    </div>
</template>

<script>
import Table from './table';
import RadioSelect from './radioSelect';
import BtnSelected from './btnSelected';

export default {
    name: 'TableMuti',
    data() {
        return {
        }
    },
    props: {
        config: {
            type: Object,
            default: () => ({})
        },
        tableQuery: {
            type: Object,
            default: () => ({})
        },
        callback: {
            type: Function,
            default: () => ({})
        }
    },
    mounted() {
        
    },
    components: {
        Table,
        RadioSelect,
        BtnSelected
    },
    computed: {
    },
    methods: {
        // table
        tableCallback(action, data) {

            // 切换分页清空单选的值
            if (['CurrentChange', 'SizeChange'].includes(action)) {
                this.config.radioConfig.value = ''
            }

            let fn = this[`handle${action}`]
            fn && fn(data)
            this.callback(action, data)
        },

        // 底部操作按钮
        btnSelectedCallback(action) {
            this.callback(action, this.config.radioConfig.value);
        },

        // 关联触发 {显示操作按钮、提示选中信息}
        handleRadio(value = '') {
            let {selectOperates, tips} = this.config;
            if (this.config.radioConfig.enableOperates) {
                selectOperates.show = value === '' ? false : true
            }
            Object.assign(this.config, {
                tips: Object.assign({}, {
                    show: true,
                    text: `已选择了(1)条`
                })
            })
        }
    }
}
</script>

<style lang="scss">
@import '../less/table_layout.scss';
</style>
