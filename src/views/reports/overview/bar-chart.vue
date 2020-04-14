<template>
	<div class="overview-chart-contanier" :style="{height: '300px'}">
		<div id="overviewChart" :style="{width: '300px', height: '300px'}"></div>
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

	import globals from '@/libs/globals.mixin'
	import util from '@/libs/util'

	const emptyData = {
		x:[],
		customer:[],
		order:[],
		lesson_hour:[],
		money_consume:[],
		income:[],
		arrearage:[],
		refund:[],
		outlay:[]
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
				overviewChart: null,
				sub_data: util.copy(emptyData)
			}
		},
		mounted() {
			this.resizeChart()
			this.overviewChart = echarts.init(document.getElementById('overviewChart'))
			this.drawLine()
			window.addEventListener('resize',()=>{
				this.throttle(this.resizeHandler, window)
			})
		},
		methods: {
			drawLine() {
				const option = {
					legend: {
		                data:['收款合计','欠款合计','退款合计','支出合计']
		            },
		            grid: {
				        left: '3%',
				        right: '4%',
				        bottom: '3%',
				        containLabel: true
				    },
					tooltip : {
				        trigger: 'axis',
				        axisPointer : {
				            type : 'shadow'
				        }
				    },
					yAxis: {
						type: 'value'
					},
					xAxis: {
						type: 'category',
						data: this.sub_data.x
					},
					series: [
						{
							name: '收款合计',
							type: 'bar',
							data: this.sub_data.income
						},
						{
							name: '欠款合计',
							type: 'bar',
							data: this.sub_data.arrearage
						},
						{
							name: '退款合计',
							type: 'bar',
							data: this.sub_data.refund
						},
						{
							name: '支出合计',
							type: 'bar',
							data: this.sub_data.outlay
						}
					]
				}
				this.overviewChart.setOption(option)
			},
			resizeChart() {
				let chartContainer = document.getElementsByClassName('overview-chart-contanier')[0]
				let overviewChart = document.getElementById('overviewChart')
				if(chartContainer){
					overviewChart.style.width = chartContainer.offsetWidth + 'px'
					overviewChart.style.height = chartContainer.offsetHeight + 'px'
				}
			},
			resizeHandler() {
				this.resizeChart()
				this.overviewChart.resize()
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
					this.sub_data.income.push(item.sum_income_total)
					this.sub_data.arrearage.push(item.current_arrearage_total)
					this.sub_data.refund.push(item.sum_refund_total)
					this.sub_data.outlay.push(item.sum_outlay_total)
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
					this.overviewChart.resize()
				},
				deep: true
			},
			"$store.state.is_aside_min": {
				handler: function() {
					this.resizeChart()
					this.overviewChart.resize()
				},
				deep: true
			},
			'loading': {
				handler: function(val) {
					if(val) {
						this.overviewChart.showLoading('default', 
							{
								text:'正在加载数据',
								color: '#c23531',
						 	 	textColor: '#000',
						  		maskColor: 'rgba(255, 255, 255, 0.8)',
						  		zlevel: 0
						  	}
					  	)
					}else{
						this.overviewChart.hideLoading()
					}
				}
			}
		}
	}
</script>