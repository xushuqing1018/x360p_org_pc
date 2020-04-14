<template>
	<div class="module-view customer-view">
		<div class="row">
			<div class="col-md-6 pr-0">
				<div class="count-container">
					<p>试听/到访次数</p>
					<ve-line 
						height="320px"
						:loading="loading"
						:data="trialVisitData" 
						:data-empty="trialVisitData.rows.length==0" 
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="trialVisitChartSettings">
					</ve-line>
				</div>
			</div>
			<div class="col-md-6">
				<div class="count-container">
					<p>客户人数</p>
					<ve-line 
						height="320px"
						:loading="loading"
						:data="newCustomerData" 
						:data-empty="newCustomerData.rows.length==0" 
						:extend="extend3" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="customerChartSetting">
					</ve-line>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>报名人数</p>
					<ve-line 
						height="320px"
						:loading="loading"
						:data="signupData" 
						:data-empty="signupData.rows.length==0" 
						:extend="extend2" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="signupChartSettings">
					</ve-line>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>客户总人数</p>
					<div class="count-bg count-makeup">
						<count-up
							id-name="drop_nums"
							:end-val="total_customer_num"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>客户来源</p>
					<ve-histogram 
						height="300px"
						:loading="loading"
						:data="fromDidData" 
						:data-empty="fromDidData.rows.length==0" 
						:extend="extend1"
						:settings="fromDidChartSettings">
					</ve-histogram>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import 'echarts/lib/component/markLine'
  	import 'echarts/lib/component/markPoint'
  	import globals from '@/libs/globals.mixin'
  	import common from '@/libs/common.mixin'
  	import grid from '@/libs/grid.mixin'
	import CountUp from 'c%/CountUp.vue'
	import VeLine from 'v-charts/lib/line.common'
	import VeHistogram from 'v-charts/lib/histogram.common'
	
	export default {
		mixins: [globals,common,grid],
		components: {
			CountUp,
			VeLine,
			VeHistogram
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				res = this.transformDate(res)
				this.total_customer_num = res.total_customer_num
				this.newCustomerData.rows = res.customer_num_list
				this.signupData.rows = res.signup_num_list
				this.trialVisitData.rows = res.trial_listen_num_list
				this.fromDidData.rows.splice(0)
				res.from_did_list.forEach(f => {
					let obj = {
						from: this.$filter('dict_title')(f.from_did,'from','其他'),
						customer_num: f.customer_num
					}
					if(f.from_did == 0) {
						this.fromDidData.rows.push(obj)
					}else{
						this.fromDidData.rows.unshift(obj)
					}
				})
			}
		},
		data() {
			this.extend3 = {
				color: ['#00CCCB'],
				legend: {
					show: false
				},
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
			this.extend2 = {
				color: ['#3099e4'],
				legend: {
					show: false
				},
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
									{offset: 0,color: '#3099e4'},
									{offset: 1,color: '#a6cfec'}
								],
								globalCoord: false
							},
							opacity: 0.5
						}
					}
				}
			}
			this.extend1 = {
				color: ['#E14E4E'],
				series: {
					barWidth: '40%'
				},
				legend: {
					show: false
				},
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				}
			}
			this.extend = {
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				}
			}
			this.fromDidChartSettings = {
				labelMap: {
					from: '渠道',
					customer_num: '客户人数'
				}
			}
			this.customerChartSetting = {
				labelMap: {
					date: '日期',
					customer_num: '客户'
				}
			}
			this.signupChartSettings = {
				labelMap: {
					date: '日期',
					signup_num: '报名'
				}
			}
			this.trialVisitChartSettings = {
				labelMap: {
					day: '日期',
					trial_listen_num: '试听',
					visit_num: '到访'
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
				rest_api: 'overview/customer',
				total_customer_num: 1,
				fromDidData: {
					columns: ['from','customer_num'],
					rows: []
				},
				signupData: {
					columns: ['day','signup_num'],
					rows: []
				},
				newCustomerData: {
					columns: ['day','customer_num'],
					rows: []
				},
				trialVisitData: {
					columns: ['day','trial_listen_num','visit_num'],
					rows: []
				}
			}
		}
	}
</script>