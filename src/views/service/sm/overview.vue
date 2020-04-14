<template>
	<div class="module-view order-view">
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>学员人数</p>
					<div class="count-bg">
						<count-up
							id-name="review-num"
							:end-val="student_num"
							:transform="false"
							color="#3399FF">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>微信绑定数</p>
					<div class="count-bg">
						<count-up
							id-name="visit-num"
							:end-val="bind_wechat_num"
							:transform="false"
							color="#00CC66">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>微信绑定率</p>
					<div class="count-bg">
						<count-up
							id-name="visit-efficient"
							:end-val="bind_wechat_rate"
							:transform="false"
							color="#00CC66">
							<span slot="append">%</span>
						</count-up>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="count-container" style="height: 400px">
					<p>投诉建议数</p>
					<ve-line 
						height="380px"
						:loading="loading"
						:data="adviceData"
						:data-empty="adviceData.rows.length==0"  
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="adviceDataChartSettings">
					</ve-line>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import 'echarts/lib/component/markLine'
  	import 'echarts/lib/component/markPoint'
  	import common from '@/libs/common.mixin'
  	import grid from '@/libs/grid.mixin'
	import CountUp from 'c%/CountUp.vue'
	import VeLine from 'v-charts/lib/line.common'
	
	export default {
		mixins: [common,grid],
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
				this.adviceData.rows = res.advice_num_list
				this.student_num = res.student_num
				this.bind_wechat_rate = res.bind_wechat_rate * 100
				this.bind_wechat_num = res.bind_wechat_num
			}
		},
		data() {
			this.extend = {
				color: ['#FCA727'],
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
									{offset: 0,color: '#FCA727'},
									{offset: 1,color: '#f1d8b4'}
								],
								globalCoord: false
							},
							opacity: 0.5
						}
					}
				}
			}
			this.adviceDataChartSettings = {
				labelMap: {
					day: '日期',
					advice_num	: '数量'
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
				rest_api: 'overview/mobile',
				student_num: 0,
				bind_wechat_num: 0,
				bind_wechat_rate: 0,
				adviceData: {
					columns: ['day','advice_num'],
					rows: []
				}
			}
		}
	}
</script>