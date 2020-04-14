<template>
	<div class="overview-chart-contanier" :style="{height: '300px'}">
		<div id="overview" :style="{width: '300px', height: '300px'}"></div>
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

	import globals from '@/libs/globals.mixin'
	import util from '@/libs/util'

	const emptyData = {
		x:[],
		customer:[],
		order:[]
	}

	export default {
		mixins: [globals],
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
				overview: null,
				sub_data: util.copy(emptyData)
			}
		},
		mounted() {
			this.resizeChart()
			this.overview = echarts.init(document.getElementById('overview'))
			this.drawLine()
			window.addEventListener('resize',()=>{
				this.throttle(this.resizeHandler, window)
			})
		},
		methods: {
			drawLine() {
				const option = {
					legend: {
		                data:['意向客户数','报名数']
		            },
		            grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
					tooltip : {
				        trigger: 'axis'
				    },
					yAxis: {
						type: 'value'
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						data: this.sub_data.x
					},
					series: [
						{
							name: '意向客户数',
							type: 'line',
							smooth: true,
							data: this.sub_data.customer
						},
						{
							name: '报名数',
							type: 'line',
							smooth: true,
							data: this.sub_data.order
						}
					]
				}
				this.overview.setOption(option)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('overview-chart-contanier')[0]
				let overviewChart = document.getElementById('overview')
				if(chartContainer){
					overviewChart.style.width = chartContainer.offsetWidth + 'px'
					overviewChart.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.overview.resize()
			},
			throttle(method, context) {
				clearTimeout(method.tId)
				method.tId = setTimeout(function() {
					method.call(context)
				}, 200)
			},
			splitData(data) {
				this.sub_data = util.copy(emptyData)
				data.forEach(item => {
					this.sub_data.x.push(this.$filter('branch_name')(item.bid))
					this.sub_data.customer.push(item.sum_customer_num)
					this.sub_data.order.push(item.sum_order_num)
				})
			}
		},
		watch: {
			data: {
				handler: function() {
					this.splitData(this.data)
					this.drawLine()
				},
				deep: true
			},
			"$store.state.is_siderbar_min": {
				handler: function() {
					this.resizeChart()
					this.overview.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.overview.resize()
				},
				deep: true
			},
			'loading': {
				handler: function(val) {
					if(val) {
						this.overview.showLoading('default', 
							{
								text:'正在加载数据',
								color: '#c23531',
						 	 	textColor: '#000',
						  		maskColor: 'rgba(255, 255, 255, 0.8)',
						  		zlevel: 0
						  	}
					  	)
					}else{
						this.overview.hideLoading()
					}
				}
			}
		}
	}
</script>