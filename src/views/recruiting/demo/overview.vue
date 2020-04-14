<template>
	<div class="module-view order-view">
		<div class="row">
			<div class="col-md-4 col-sm-6 pr-0">
				<div class="count-container">
					<p>招生中</p>
					<div class="count-bg">
						<count-up
							id-name="total-enrolment-num"
							:end-val="total_enrolment_num"
							:transform="false"
							color="#3399FF">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 col-sm-6 pr-0">
				<div class="count-container">
					<p>开课中</p>
					<div class="count-bg">
						<count-up
							id-name="total-started-num"
							:end-val="total_started_num"
							:transform="false"
							color="#00CC66">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 col-sm-6">
				<div class="count-container">
					<p>已结课</p>
					<div class="count-bg">
						<count-up
							id-name="total-ended-num"
							:end-val="total_ended_num"
							:transform="false"
							color="#EA4E4E">
						</count-up>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-8 pr-0">
				<div class="count-container" style="height: 410px">
					<p>体验课学员</p>
					<ve-line 
						:loading="loading"
						:data="demoStudentData"
						:data-empty="demoStudentData.rows.length==0"  
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="demoStudentDataChartSettings">
					</ve-line>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>体验课总人数</p>
					<div class="count-bg">
						<count-up
							id-name="total-student-num"
							:end-val="total_student_num"
							:transform="false"
							color="#3399FF">
						</count-up>
					</div>
				</div>
				<div class="count-container">
					<p>体验课总金额</p>
					<div class="count-bg">
						<count-up
							id-name="total-amount"
							:end-val="total_amount"
							:transform="false"
							color="#FCA727">
						</count-up>
					</div>
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
				this.demoStudentData.rows = res.demo_student_num_list
				this.total_enrolment_num = res.total_enrolment_num
				this.total_started_num = res.total_started_num
				this.total_student_num = res.total_student_num
				this.total_ended_num = res.total_ended_num
				this.total_amount = res.total_amount
			}
		},
		data() {
			this.extend = {
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
			this.demoStudentDataChartSettings = {
				labelMap: {
					day: '日期',
					demo_student_num: '人数'
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
				rest_api: 'overview/demo',
				total_student_num: 0,
				total_started_num: 0,
				total_enrolment_num: 0,
				total_ended_num: 0,
				total_amount: 0,
				demoStudentData: {
					columns: ['day','demo_student_num'],
					rows: []
				}
			}
		}
	}
</script>