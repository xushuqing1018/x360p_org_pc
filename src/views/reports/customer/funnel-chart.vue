<template>
	<div class="funnel-chart-contanier" :style="{height: '350px'}">
		<div id="funnelChart" :style="{width: '300px', height: '300px'}"></div>
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
				default: () => {
					return {}
				}
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
				funnelChart: null,
				chart_data: {}
			}
		},
		mounted() {
			this.resizeChart()
			this.funnelChart = echarts.init(document.getElementById('funnelChart'))
			this.drawLine()
			window.addEventListener('resize',()=>{
				this.throttle(this.resizeHandler, window)
			})
		},
		methods: {
			drawLine() {
				const option = {
					tooltip : {
				        trigger: 'axis',
				        axisPointer : {
				            type : 'shadow'
				        },
				        formatter: '{b}<br/>人次数：{c}'
				    },
				    grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
					xAxis: {
						type: 'value'
					},
					yAxis: {
						type: 'category',
						data: this.chart_data.legend
					},
					series: [{
						name: '',
						type: 'bar',
						barWidth: 30,
						data: this.chart_data.data
					}]
				}
				this.funnelChart.setOption(option)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('funnel-chart-contanier')[0]
				let funnelChart = document.getElementById('funnelChart')
				if(chartContainer){
					funnelChart.style.width = chartContainer.offsetWidth + 'px'
					funnelChart.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.funnelChart.resize()
			},
			throttle(method, context) {
				clearTimeout(method.tId)
				method.tId = setTimeout(function() {
					method.call(context)
				}, 200)
			},
			set(key,value){
                this.$set(this,key,value)
	        },
		},
		watch: {
			chart_data: {
				handler: function() {
					this.drawLine()
				},
				deep: true
			},
			"$store.state.is_siderbar_min": {
				handler: function() {
					this.resizeChart()
					this.funnelChart.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.funnelChart.resize()
				},
				deep: true
			},
			'loading': {
				handler: function(val) {
					if(val) {
						this.funnelChart.showLoading('default', 
							{
								text:'正在加载数据',
								color: '#c23531',
						 	 	textColor: '#000',
						  		maskColor: 'rgba(255, 255, 255, 0.8)',
						  		zlevel: 0
						  	}
					  	)
					}else{
						this.funnelChart.hideLoading()
					}
				}
			}
		}
	}
</script>