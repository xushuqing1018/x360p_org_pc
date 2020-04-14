<template>
	<div class="byBid-chart1-contanier" :style="{height: '300px'}">
		<div id="byBidChart1" :style="{width: '300px', height: '300px'}"></div>
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
				byBidChart1: null,
			}
		},
		mounted() {
			this.resizeChart()
			this.byBidChart1 = echarts.init(document.getElementById('byBidChart1'))
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
				        formatter: '{b}<br/>总人数：{c}'
				    },
				    grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
					yAxis: {
						type: 'value',
						minInterval: 1
					},
					xAxis: {
						type: 'category',
						data: this.data.y
					},
					series: [{
						name: '',
						type: 'bar',
						barWidth: 30,
						data: this.data.x
					}]
				}
				this.byBidChart1.setOption(option)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('byBid-chart1-contanier')[0]
				let byBidChart1 = document.getElementById('byBidChart1')
				if(chartContainer){
					byBidChart1.style.width = chartContainer.offsetWidth + 'px'
					byBidChart1.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.byBidChart1.resize()
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
					this.byBidChart1.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.byBidChart1.resize()
				},
				deep: true
			},
			'loading': {
				handler: function(val) {
					if(val) {
						this.byBidChart1.showLoading('default', 
							{
								text:'正在加载数据',
								color: '#c23531',
						 	 	textColor: '#000',
						  		maskColor: 'rgba(255, 255, 255, 0.8)',
						  		zlevel: 0
						  	}
					  	)
					}else{
						this.byBidChart1.hideLoading()
					}
				}
			}
		}
	}
</script>