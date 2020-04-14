<template>
	<div class="from-chart-contanier" :style="{height: '300px'}">
		<div id="fromChart" :style="{width: '300px', height: '300px'}"></div>
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
		name: 'attendTrendChart',
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
				fromChart: null,
			}
		},
		mounted() {
			this.resizeChart()
			this.fromChart = echarts.init(document.getElementById('fromChart'))
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
				        formatter: "{b}<br/>客户数量：{c}"
				    },
				    grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
				    xAxis : [
				        {
				            type : 'category',
				            data : this.data.y,
				            axisTick: {
				                alignWithLabel: true
				            }
				        }
				    ],
				    yAxis : [
				        {
				            type : 'value',
				            minInterval: 1
				        }
				    ],
				    series : [
				        {
				            name:'',
				            type:'bar',
				            barWidth: 30,
				            data:this.data.x
				        }
				    ]
				}
				this.fromChart.setOption(option)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('from-chart-contanier')[0]
				let fromChart = document.getElementById('fromChart')
				if(chartContainer){
					fromChart.style.width = chartContainer.offsetWidth + 'px'
					fromChart.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.fromChart.resize()
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
					this.fromChart.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.fromChart.resize()
				},
				deep: true
			},
			'loading': {
				handler: function(val) {
					if(val) {
						this.fromChart.showLoading('default', 
							{
								text:'正在加载数据',
								color: '#c23531',
						 	 	textColor: '#000',
						  		maskColor: 'rgba(255, 255, 255, 0.8)',
						  		zlevel: 0
						  	}
					  	)
					}else{
						this.fromChart.hideLoading()
					}
				}
			}
		}
	}
</script>