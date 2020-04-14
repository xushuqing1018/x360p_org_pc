<template>
	<div class="module-view customer-view">
		<div class="row">
			<div class="col-md-8 pr-0">
				<div class="count-container">
					<p>新增学员人数</p>
					<ve-line 
						height="320px"
						:loading="loading"
						:data="student_list" 
						:data-empty="student_list.rows.length==0"
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="studentChartSettings">
					</ve-line>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>学员总人数</p>
					<div class="count-bg count-leave">
						<count-up
							id-name="student_nums"
							:end-val="student_num"
							:transform="false"
							color="#3399FF">
						</count-up>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>学员状态</p>
					<ve-pie 
						height="280px"
						:loading="loading"
						:data="status_list" 
						:data-empty="status_list.rows.length==0" 
						:settings="statusChartSettings">
					</ve-pie>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>剩余总课时</p>
					<div class="count-bg count-noarrive">
						<count-up
							id-name="remain-lesson-hours"
							:end-val="student_lesso_remain_hours"
							:transform="false"
							color="#E14E4E">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>总课时</p>
					<div class="count-bg count-makeup">
						<count-up
							id-name="lesson-hours"
							:end-val="student_lesson_hours"
							:transform="false"
							color="#00CCCB">
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
	import CountUp from 'c%/CountUp.vue'
	import VePie from 'v-charts/lib/pie.common'
	import VeLine from 'v-charts/lib/line.common'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	
	export default {
		mixins: [grid,common],
		components: {
			CountUp,
			VePie,
			VeLine
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				let status_list = []
				res = this.transformDate(res)
				this.student_lesso_remain_hours = res.student_lesso_remain_hours
				this.student_num = res.student_num
				this.student_lesson_hours = res.student_lesson_hours
				res.status_list.forEach(l => {
					status_list.push({
						status: this.$filter('s_status')(l.status),
						nums: l.student_num
					})
				})
				this.status_list.rows = status_list
				this.student_list.rows = res.student_list
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
			this.statusChartSettings = {
				radius: 80,
				offsetY: 160
			}
			this.studentChartSettings = {
				labelMap: {
					day: '日期',
					student_num: '学员人数'
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
				rest_api: 'overview/student',
				student_num: 0,
				student_lesson_hours: 0,
				student_lesso_remain_hours: 0,
				student_list: {
					columns: ['day','student_num'],
					rows: []
				},
				status_list: {
					columns: ['status','nums'],
					rows: []
				}
			}
		}
	}
</script>