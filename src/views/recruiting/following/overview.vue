<template>
	<div class="module-view order-view">
		<div class="row">
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>累计客户数</p>
					<div class="count-bg">
						<count-up
							id-name="count-orders"
							:end-val="customer_num"
							:transform="false"
							color="#3399FF">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>有效沟通次数</p>
					<div class="count-bg">
						<count-up
							id-name="count-amount"
							:end-val="connect_num"
							:transform="false"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>诺到次数</p>
					<div class="count-bg">
						<count-up
							id-name="count-unpay-orders"
							:end-val="promise_num"
							:transform="false"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6">
				<div class="count-container">
					<p>上门次数</p>
					<div class="count-bg">
						<count-up
							id-name="count-unpay-amount"
							:end-val="visit_num"
							:transform="false"
							color="#FCA727">
						</count-up>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="count-container" style="height: 400px">
					<p>诺到/上门客户数</p>
					<ve-line 
						:loading="loading"
						:data="followData"
						:data-empty="followData.rows.length==0"  
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="followDataChartSettings">
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
				this.followData.rows = res.follow_up_list
				this.customer_num = res.customer_num
				this.visit_num = res.visit_num
				this.promise_num = res.promise_num
				this.connect_num = res.connect_num
			}
		},
		data() {
			this.extend = {
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				}
			}
			this.followDataChartSettings = {
				labelMap: {
					day: '日期',
					promise_num: '诺到次数',
					visit_num: '上门次数'
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
				rest_api: 'overview/customer_follow_up',
				customer_num: 0,
				connect_num: 0,
				promise_num: 0,
				visit_num: 0,
				followData: {
					columns: ['day','promise_num','visit_num'],
					rows: []
				}
			}
		}
	}
</script>