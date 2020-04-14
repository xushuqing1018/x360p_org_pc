<template>
	<div class="module-view order-view">
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>累计课前提醒</p>
					<div class="count-bg">
						<count-up
							id-name="review-num"
							:end-val="total_remind"
							:transform="false"
							color="#00CC66">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>累计备课次数</p>
					<div class="count-bg">
						<count-up
							id-name="visit-num"
							:end-val="total_prepare"
							:transform="false"
							color="#00CFEB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>累计到离校通知</p>
					<div class="count-bg">
						<count-up
							id-name="visit-efficient"
							:end-val="total_attend"
							:transform="false"
							color="#FCA727">
						</count-up>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container" style="height: 350px">
					<p>课前提醒次数</p>
					<ve-histogram 
						height="320px"
						:loading="loading"
						:data="course_remind" 
						:data-empty="course_remind.rows.length==0" 
						:extend="extend1"
						:settings="courseChartSettings">
					</ve-histogram>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container" style="height: 350px">
					<p>备课次数</p>
					<ve-histogram 
						height="320px"
						:loading="loading"
						:data="course_prepare" 
						:data-empty="course_prepare.rows.length==0" 
						:extend="extend2"
						:settings="courseChartSettings">
					</ve-histogram>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container" style="height: 350px">
					<p>到离校次数</p>
					<ve-histogram 
						height="320px"
						:loading="loading"
						:data="attend_school" 
						:data-empty="attend_school.rows.length==0" 
						:extend="extend3"
						:settings="courseChartSettings">
					</ve-histogram>
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
	import VeHistogram from 'v-charts/lib/histogram.common'
	
	export default {
		mixins: [common,grid],
		components: {
			CountUp,
			VeHistogram
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				res = this.transformDate(res)
				this.total_attend = res.branch_attend_school_times
				this.total_prepare = res.branch_course_prepare
				this.total_remind = res.branch_course_remind
				
				const keys = ['course_remind','course_prepare','attend_school']
				keys.forEach(k => {
					this[k].rows.splice(0)
					for(let i in res[k]) {
						this[k].rows.push({
							type: i=='my'?'我的':'最高',
							num: res[k][i]
						})
					}
				})
			}
		},
		data() {
			this.extend1 = {
				color: ['#00CC66'],
				series: {
					barWidth: '20%'
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
			this.extend2 = {
				color: ['#00CFEB'],
				series: {
					barWidth: '20%'
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
			this.extend3 = {
				color: ['#FCA727'],
				series: {
					barWidth: '20%'
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
			this.courseChartSettings = {
				labelMap: {
					type: '类型',
					num: '次数'
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
				rest_api: 'overview/before_class_service',
				total_attend: 0,
				total_prepare: 0,
				total_remind: 0,
				course_remind: {
					columns: ['type','num'],
					rows: []
				},
				course_prepare: {
					columns: ['type','num'],
					rows: []
				},
				attend_school: {
					columns: ['type','num'],
					rows: []
				}
			}
		}
	}
</script>