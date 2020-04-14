<template>
	<div class="stu-chart-container" :style="{height: '400px'}">
		<div id="stuChart" :style="{width: '300px', height: '300px'}"></div>
	</div>
</template>

<script>
	//引入基本模板
	let echarts = require('echarts/lib/echarts')
	// 引入折线图图组件
	require('echarts/lib/chart/line')
	// 引入提示框和title组件
	require('echarts/lib/component/tooltip')
	require('echarts/lib/component/legend')
	require('echarts/lib/component/markLine')
	require('echarts/lib/component/markPoint')

	import common from '@/libs/common.mixin'
	export default {
		name: 'studentTrendChart',
		mixins: [common],
		props: {
			xData: {
				type: Array,
				require: true
			},
			yData: {
				type: Array,
				require: true
			}
		},
		data() {
			return {
				stuChart: null,
			}
		},
		mounted() {
			this.resizeChart()
			this.stuChart = echarts.init(document.getElementById('stuChart'))
			this.drawLine()
			window.addEventListener('resize',()=>{
				this.throttle(this.resizeHandler, window)
			})
		},
		computed: {
			options() {
				return {
					title: '',
					legend: {
		                data:['近七日报名人次']
		            },
					tooltip: {
				        trigger: 'axis',
				        formatter: '{b}<br/>报名人次：{c}人'
				    },
					xAxis: {
						type: 'category',
						splitLine: {
							show: false
						},
						boundaryGap: false,
						data: this.xData
					},
					yAxis: {
						type: 'value',
						splitLine: {
							show: false
						},
					},
					series: [
                        {
                            name: '近七日报名人次',
                            type: 'line',
                            smooth:true,
							itemStyle: {normal: {color: this.theme_color}},
							lineStyle: {normal: {
								width:0,//折线宽度
								color:this.theme_color,//折线颜色
								width:2
							}},
                            areaStyle: {normal: {color: this.theme_color}},
                            data: this.yData,
                            markPoint: {
                                data: [
                                    {type: 'max', name: '最大值'},
                                    {type: 'min', name: '最小值'}
                                ]
                            },
                            markLine: {
                                data: [
                                    {type: 'average', name: '平均值'}
								]
							}
                        }
					]
				}
			}
		},
		methods: {
			drawLine() {
				this.stuChart.setOption(this.options)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('stu-chart-container')[0]
				let stuChart = document.getElementById('stuChart')
				if(chartContainer){
					stuChart.style.width = chartContainer.offsetWidth + 'px'
					stuChart.style.height = chartContainer.offsetHeight + 'px'	
				}				
			},
			resizeHandler() {
				this.resizeChart()
				this.stuChart.resize()
			},
			throttle(method, context) {
				clearTimeout(method.tId)
				method.tId = setTimeout(function() {
					method.call(context)
				}, 200)
			}
		},
		watch: {
			xData: {
				handler: function(val, oldVal) {
					this.drawLine()
				},
				deep: true
			},
			"$store.state.is_siderbar_min": {
				handler: function() {
					this.resizeChart()
					this.stuChart.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.stuChart.resize()
				},
				deep: true
			},
			'$store.state.app.theme': function() {
				this.drawLine()
			}
		}
	}
</script>