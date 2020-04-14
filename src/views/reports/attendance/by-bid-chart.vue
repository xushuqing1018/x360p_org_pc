<template>
	<div class="byBid-chart-contanier" :style="{height: '300px'}">
		<div id="byBidChart" :style="{width: '300px', height: '300px'}"></div>
	</div>
</template>

<script>
	//引入基本模板
	let echarts = require('echarts/lib/echarts')
	// 引入折线图图组件
	require('echarts/lib/chart/bar')
	// 引入提示框和title组件
	require('echarts/lib/component/tooltip')
	require('echarts/lib/component/legend')
	require('echarts/lib/component/markLine')
	require('echarts/lib/component/markPoint')
	export default {
		props: {
			data: {
				type: Object,
				require: true
			},
			loading: {
				type: Boolean,
				default:()=>{
					return false
				}
			}
		},
		data() {
			return {
				byBidChart: null,
			}
		},
		mounted() {
			this.resizeChart()
			this.byBidChart = echarts.init(document.getElementById('byBidChart'))
			this.drawLine()
			window.addEventListener('resize',()=>{
				this.throttle(this.resizeHandler, window)
			})
		},
		methods: {
			drawLine() {
				const option = {
					legend: {
				        data:['上课次数','应到人次数','出勤人次数','缺勤人次数']
				    },
					tooltip : {
				        trigger: 'axis',
				        axisPointer : {
				            type : 'shadow'
				        }
				    },
				    grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
					yAxis: {
						type: 'value'
					},
					xAxis: {
						type: 'category',
						data: this.data.x
					},
					series: [
						{
							name: '上课次数',
							type: 'bar',
							barWidth: 15,
							data: this.data.classes
						},
						{
							name: '应到人次数',
							type: 'bar',
							barWidth: 15,
							data: this.data.students
						},
						{
							name: '出勤人次数',
							type: 'bar',
							barWidth: 15,
							data: this.data.attendance
						},
						{
							name: '缺勤人次数',
							type: 'bar',
							barWidth: 15,
							data: this.data.absence
						}
					]
				}
				this.byBidChart.setOption(option)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('byBid-chart-contanier')[0]
				let byBidChart = document.getElementById('byBidChart')
				if(chartContainer){
					byBidChart.style.width = chartContainer.offsetWidth + 'px'
					byBidChart.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.byBidChart.resize()
			},
			throttle(method, context) {
				clearTimeout(method.tId)
				method.tId = setTimeout(function() {
					method.call(context)
				}, 200)
			}
		},
		watch: {
			data: {
				handler: function() {
					this.drawLine()
				},
				deep: true
			},
			"$store.state.is_siderbar_min": {
				handler: function() {
					this.resizeChart()
					this.byBidChart.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.byBidChart.resize()
				},
				deep: true
			},
			'loading': {
				handler: function(val) {
					if(val) {
						this.byBidChart.showLoading('default', 
							{
								text:'正在加载数据',
								color: '#c23531',
						 	 	textColor: '#000',
						  		maskColor: 'rgba(255, 255, 255, 0.8)',
						  		zlevel: 0
						  	}
					  	)
					}else{
						this.byBidChart.hideLoading()
					}
				}
			}
		}
	}
</script>