<template>
	<div class="module-view customer-view">
		<div class="row">
			<div class="col-md-8 pr-0">
				<div class="count-container">
					<p>日课时扣除数</p>
					<ve-line 
						height="320px"
						:loading="loading"
						:data="consumeHourData" 
						:data-empty="consumeHourData.rows.length==0"
						:extend="extend1" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="hourChartSettings">
					</ve-line>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>总消耗课时数</p>
					<div class="count-bg count-noarrive">
						<count-up
							id-name="student_nums"
							:end-val="total_lesson_hours"
							:transform="false"
							color="#E14E4E">
						</count-up>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-8 pr-0">
				<div class="count-container">
					<p>日课时金额</p>
					<ve-line 
						height="320px"
						:loading="loading"
						:data="consumeAmountData" 
						:data-empty="consumeAmountData.rows.length==0"
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="amountChartSettings">
					</ve-line>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>总课时金额</p>
					<div class="count-bg" style="color: #FCA727">
						{{label_currency}}&nbsp;{{total_lesson_amount_list}}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import 'echarts/lib/component/markLine'
  	import 'echarts/lib/component/markPoint'
	import CountUp from 'c%/CountUp.vue'
	import VeLine from 'v-charts/lib/line.common'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [grid,common],
		components: {
			CountUp,
			VeLine
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				res = this.transformDate(res)
				this.total_lesson_hours = res.total_lesson_hours
				this.total_lesson_amount_list = res.total_lesson_amount_list
				this.consumeHourData.rows = res.lesson_hours_list
				this.consumeAmountData.rows = res.lesson_amount_list
			}
		},
		data() {
			this.extend1 = {
				color: ['#E14E4E'],
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				},
				legend: {
					show: false
				},
				series: {
					areaStyle: {
						normal: {
							color: {
								type: 'linear',
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [
									{offset: 0,color: '#E14E4E'},
									{offset: 1,color: '#f1c2c2'}
								],
								globalCoord: false
							},
							opacity: 0.5
						}
					}
				}
			}
			this.extend = {
				color: ['#00CCCB'],
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				},
				legend: {
					show: false
				},
				series: {
					areaStyle: {
						normal: {
							color: {
								type: 'linear',
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [
									{offset: 0,color: '#00CCCB'},
									{offset: 1,color: '#a7eaea'}
								],
								globalCoord: false
							},
							opacity: 0.5
						}
					}
				}
			}
			this.hourChartSettings = {
				labelMap: {
					day: '日期',
					lesson_hours: '扣课时数'
				}
			}
			this.amountChartSettings = {
				labelMap: {
					day: '日期',
					lesson_amount: '课时金额'
				}
			}
			this.markLine = {
		        data: [
		          	{
		            	name: '平均线',
		            	type: 'average'
		          	}
		        ]
	      	}
	      	this.markPoint = {
	        	data: [
		          	{
		            	name: '最大值',
		            	type: 'max'
		          	}
	        	]
	      	}
			return {
				rest_api: 'overview/student_lesson_hour',
				total_lesson_hours: 0,
				total_lesson_amount_list: 0,
				consumeHourData: {
					columns: ['day','lesson_hours'],
					rows: []
				},
				consumeAmountData: {
					columns: ['day','lesson_amount'],
					rows: []
				}
			}
		}
	}
</script>