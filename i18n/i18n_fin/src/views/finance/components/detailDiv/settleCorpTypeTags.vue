<template>
  <div class="el-form-item settleCorpType__tags">
    <span v-for="tag in tagsArr" :key="tag.value" :class="[tag.value+'__tag']">{{tag.label}}</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'settleCorpTypeTags',
  props: {
    tags: { type: String, default: '' },
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    tagsArr() {
      console.log(this.tags.split(','))
      let dict = this.dictMap['unitType']
      return this.tags
        .split(',')
        .map((v) => {
          let find = dict.find((item) => item.value === v)
          return find ? { ...find, label: find.label.slice(0, 1) } : ''
        })
        .filter((v) => v)
    },
  },
  data() {
    return {}
  },
  methods: {},
  created() {
    // console.log(this.$attrs)
  },
}
</script>

<style scoped lang="scss">
.settleCorpType__tags {
  width: 100px !important;
  display: inline-block;
  padding: 3px 0;
  vertical-align: middle;
  position: relative;
  left: -10px;
  span {
    display: inline-block;
    width: 14px;
    height: 14px;
    font-size: 12px;
    color: white;
    border-radius: 3px;
    text-align: center;
    line-height: 14px;
    margin-right: 4px;
    // transform: scale(0.6, 0.6);
  }
  .company__tag {
    background-color: #ce5527;
  }
  .customer__tag {
    background-color: #33b18a;
  }
  .dept__tag {
    background-color: #ca3a9b;
  }
  .supplier__tag {
    background-color: #3e80f5;
  }
  .temporary__tag {
    background-color: #5037b2;
  }
}
// company: "分公司"
// customer: "客户"
// dept: "部门"
// supplier: "供应商"
// temporary: "临时客商"
</style>
