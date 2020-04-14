<template>
	<div class="intention-chart-contanier" :style="{height: '300px'}">
		<div id="intentionChart" :style="{width: '300px', height: '300px'}"></div>
	</div>
</template>

<script>
	//引入基本模板
	let echarts = require('echarts/lib/echarts')
	// 引入折线图图组件
	require('echarts/lib/chart/pie')
	// 引入提示框和title组件
	require('echarts/lib/component/tooltip')
	require('echarts/lib/component/legend')
	require('echarts/lib/component/markLine')
	require('echarts/lib/component/markPoint')
	export default {
		name: 'attendTrendChart',
		props: {
			data: {
				type: Array,
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
				intentionChart: null,
				legend: []
			}
		},
		mounted() {
			this.resizeChart()
			this.intentionChart = echarts.init(document.getElementById('intentionChart'))
			this.drawLine()
			window.addEventListener('resize',()=>{
				this.throttle(this.resizeHandler, window)
			})
		},
		methods: {
			drawLine() {
				const option = {
					tooltip: {
				        trigger: 'item',
				        formatter: "{a}：{b}<br/>客户数量：{c}<br/>比例：{d}%"
				    },
				    legend: {
				        orient: 'vertical',
        				left: 'left',
				        data: this.legend
				    },
					series : [
				        {
				            name: '意向级别',
				            type: 'pie',
				            radius : '55%',
				            center: ['50%', '50%'],
				            data: this.data,
				            itemStyle: {
				                emphasis: {
				                    shadowBlur: 10,
				                    shadowOffsetX: 0,
				                    shadowColor: 'rgba(0, 0, 0, 0.5)'
				                }
				            }
				        }
				    ]
				}
				this.intentionChart.setOption(option)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('intention-chart-contanier')[0]
				let intentionChart = document.getElementById('intentionChart')
				if(chartContainer){
					intentionChart.style.width = chartContainer.offsetWidth + 'px'
					intentionChart.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.intentionChart.resize()
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
					this.data.forEach(item => {
						this.legend.push(item.name)
					})
					this.drawLine()
				},
				deep: true
			},
			"$store.state.is_siderbar_min": {
				handler: function() {
					this.resizeChart()
					this.intentionChart.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.intentionChart.resize()
				},
				deep: true
			},
			'loading': {
				handler: function(val) {
					if(val) {
						this.intentionChart.showLoading('default', 
							{
								text:'正在加载数据',
								color: '#c23531',
						 	 	textColor: '#000',
						  		maskColor: 'rgba(255, 255, 255, 0.8)',
						  		zlevel: 0
						  	}
					  	)
					}else{
						this.intentionChart.hideLoading()
					}
				}
			}
		}
	}
</script>