<template>
	<div class="attend-chart-contanier" :style="{height: '400px'}">
		<div id="attendChart" :style="{width: '300px', height: '300px'}"></div>
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
		name: 'attendTrendChart',
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
				attendChart: null,
			}
		},
		mounted() {
			this.resizeChart()
			this.attendChart = echarts.init(document.getElementById('attendChart'))
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
		                data:[{name:'近七日出勤率'}]
		            },
					tooltip: {
				        trigger: 'axis',
				        formatter: '{b}<br/>出勤率：{c}%'
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
						axisLabel: {
							formatter: '{value} %'
						}
					},
					series: [{
						name: '近七日出勤率',
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
					}]
				}
			}
		},
		methods: {
			drawLine() {
				this.attendChart.setOption(this.options)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('attend-chart-contanier')[0]
				let attendChart = document.getElementById('attendChart')
				if(chartContainer){
					attendChart.style.width = chartContainer.offsetWidth + 'px'
					attendChart.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.attendChart.resize()
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
				handler: function() {
					this.drawLine()
				},
				deep: true
			},
			"$store.state.is_siderbar_min": {
				handler: function() {
					this.resizeChart()
					this.attendChart.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.attendChart.resize()
				},
				deep: true
			},
			'$store.state.app.theme': function() {
				this.drawLine()
			}
		}
	}
</script>