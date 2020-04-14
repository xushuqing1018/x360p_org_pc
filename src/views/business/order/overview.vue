<template>
	<div class="module-view order-view">
		<div class="row">
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>已付款订单数</p>
					<div class="count-bg">
						<count-up
							id-name="count-orders"
							:end-val="paid_order_num"
							:transform="false"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>已付款金额<span v-if="refund_amount"> (含退款￥{{refund_amount}})</span></p>
					<div class="count-bg">
						<count-up
							id-name="count-amount"
							icon-type="social-yen"
							:end-val="paid_order_amount"
							:transform="false"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>未付款订单数</p>
					<div class="count-bg">
						<count-up
							id-name="count-unpay-orders"
							:end-val="unpaid_order_num"
							:transform="false"
							color="#FCA727">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6">
				<div class="count-container">
					<p>未付款金额</p>
					<div class="count-bg">
						<count-up
							id-name="count-unpay-amount"
							icon-type="social-yen"
							:end-val="unpaid_order_amount"
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
					<p>新增订单数</p>
					<ve-line 
						:loading="loading"
						:data="orderData" 
						:data-empty="orderData.rows.length==0"
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="orderDataChartSettings">
					</ve-line>
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
				this.paid_order_amount = res.paid_order_amount
				this.paid_order_num = res.paid_order_num
				this.unpaid_order_amount = res.unpaid_order_amount
				this.unpaid_order_num = res.unpaid_order_num
				this.refund_amount = res.refund_amount
				this.orderData.rows = res.order_list
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
			this.orderDataChartSettings = {
				labelMap: {
					day: '日期',
					order_num: '订单数'
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
				rest_api: 'overview/order',
				paid_order_amount: 0,
				paid_order_num: 0,
				unpaid_order_amount: 0,
				unpaid_order_num: 0,
				refund_amount: 0,
				orderData: {
					columns: ['day','order_num'],
					rows: []
				}
			}
		}
	}
</script>