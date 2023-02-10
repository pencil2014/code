<template>
  <div style="padding:0 20px 20px">
    <el-button type="primary" size="mini" @click="change(100)">change(100)</el-button>
    <el-button type="primary" size="mini" @click="change(200)">change(200)</el-button>
    <el-button type="primary" size="mini" @click="change(300)">change(300)</el-button>
    <el-button type="primary" size="mini" @click="change(500)">change(500)</el-button>

    <div ref="echarts" style="height:500px;widht:100%"></div>
  </div>
</template>
<script>
const DATA = {
  name: '深圳市长帆物流有限公司',
  value: 'value',
  type: 'parent',
  children: [
    {
      name: '中航国际有限公司',
      children: [
        {
          name: 'cluster',
          children: [
            { name: '中航国际有限公司', value: 3938 },
            { name: '中航国际有限公司', value: 3812 },
            { name: '中航国际有限公司', value: 6714 },
            { name: '中航国际有限公司', value: 743 },
          ],
        },
        {
          name: '中航国际有限公司',
          children: [
            { name: '中航国际有限公司', value: 3534 },
            { name: '中航国际有限公司', value: 5731 },
            { name: '中航国际有限公司', value: 7840 },
            { name: '中航国际有限公司', value: 5914 },
            { name: '中航国际有限公司', value: 3416 },
          ],
        },
        {
          name: '中航国际有限公司',
          children: [{ name: '中航国际有限公司', value: 7074 }],
        },
      ],
    },
    {
      name: '中航国际有限公司',
      children: [
        { name: '中航国际有限公司', value: 17010 },
        { name: '中航国际有限公司', value: 5842 },
        {
          name: '中航国际有限公司',
          children: [
            { name: 'ArrayInterpolator', value: 1983 },
            { name: 'ColorInterpolator', value: 2047 },
            { name: 'DateInterpolator', value: 1375 },
            { name: 'Interpolator', value: 8746 },
            { name: 'MatrixInterpolator', value: 2202 },
            { name: 'NumberInterpolator', value: 1382 },
            { name: 'ObjectInterpolator', value: 1629 },
            { name: 'PointInterpolator', value: 1675 },
            { name: 'RectangleInterpolator', value: 2042 },
          ],
        },
        { name: 'ISchedulable', value: 1041 },
        { name: 'Parallel', value: 5176 },
        { name: 'Pause', value: 449 },
        { name: 'Scheduler', value: 5593 },
        { name: 'Sequence', value: 5534 },
        { name: 'Transition', value: 9201 },
        { name: 'Transitioner', value: 19975 },
        { name: 'TransitionEvent', value: 1116 },
        { name: 'Tween', value: 6006 },
      ],
    },
    {
      name: 'data',
      children: [
        {
          name: 'converters',
          children: [
            { name: 'Converters', value: 721 },
            { name: 'DelimitedTextConverter', value: 4294 },
            { name: 'GraphMLConverter', value: 9800 },
            { name: 'IDataConverter', value: 1314 },
            { name: 'JSONConverter', value: 2220 },
          ],
        },
        { name: 'DataField', value: 1759 },
        { name: 'DataSchema', value: 2165 },
        { name: 'DataSet', value: 586 },
        { name: 'DataSource', value: 3331 },
        { name: 'DataTable', value: 772 },
        { name: 'DataUtil', value: 3322 },
      ],
    },
  ],
}
Object.keys(DATA).forEach((item) => {})
// import * as echarts from 'echarts'
let echarts
export default {
  name: 'relationParent',
  props: ['custid', 'RELATION'],
  data() {
    return {
      chartDom: null,
      myChart: null,
      option: null,
    }
  },
  created() {
    this.$nextTick(() => this.init())
  },
  methods: {
    init() {
      this.chartDom = this.$refs.echarts
      this.myChart = echarts.init(this.chartDom)
      this.option
      this.myChart.showLoading()
      setTimeout(() => {
        this.myChart.hideLoading()
        this.myChart.setOption(
          (this.option = {
            // tooltip: {
            //   trigger: 'item',
            //   triggerOn: 'mousemove',
            // },
            series: [
              {
                type: 'tree',
                roam: true,
                data: [DATA],
                // itemStyle: {
                //   color: 'red',
                //   borderColor: 'black',
                // },
                label: {
                  // formatter: '{a}: {b}: {c}',
                  formatter(obj) {
                    let data = obj.data
                    return `{bb|${data.value}}{cc|${data.type}}\n{aa|${data.name}}`
                    // return `<p>${data.name}</p>` + `<p>${data.value}</p>` + `<p>${data.type}</p>`
                  },
                  width: 200,
                  height: 50,
                  borderColor: '#3E7FF4',
                  borderWidth: 1,
                  borderRadius: 4,
                  rich: {
                    aa: {
                      width: 200,
                      // height: 50,
                      // backgroundColor: '#3E7FF4',
                      fontSize: 14,
                      color: 'white',
                    },
                    bb: {
                      color: 'blue',
                      position: 'absolute',
                      top: -20,
                    },
                    cc: {
                      color: 'green',
                    },
                  },
                },
                // symbol: 'emptyCircle',
                // orient: 'vertical',
                // expandAndCollapse: true,
                // label: {
                //   position: 'top',
                //   rotate: -90,
                //   verticalAlign: 'middle',
                //   align: 'right',
                //   fontSize: 9,
                // },
                // leaves: {
                //   label: {
                //     position: 'bottom',
                //     rotate: -90,
                //     verticalAlign: 'middle',
                //     align: 'left',
                //   },
                // },
                // animationDurationUpdate: 750,
              },
            ],
          })
        )
      }, 200)
    },
    edit() {
      this.routerPushTab('CustomerDetailBaseEdit')
    },
    change(val) {
      this.$refs.echarts.style.height = val + 'px'
    },
  },
}
</script>