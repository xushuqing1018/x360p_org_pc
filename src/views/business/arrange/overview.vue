<template>
	<div class="module-view">
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p class="clearfix">
						排课数
						<RadioGroup type="button" size="small" v-model="arrange_type" class="pull-right">
							<Radio label="week">本周</Radio>
							<Radio label="month">本月</Radio>
							<Radio label="year">本年</Radio>
						</RadioGroup>
					</p>
					<div class="count-bg count-leave">
						<count-up
							id-name="arrange-num"
							:end-val="arrange"
							:transform="false"
							color="#3399FF">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p class="clearfix">
						扣课时数
						<RadioGroup type="button" size="small" v-model="hours_type" class="pull-right">
							<Radio label="week">本周</Radio>
							<Radio label="month">本月</Radio>
							<Radio label="year">本年</Radio>
						</RadioGroup>
					</p>
					<div class="count-bg count-noarrive">
						<count-up
							id-name="consume-num"
							:end-val="hours"
							:transform="false"
							color="#E14E4E">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p class="clearfix">
						排课类型
						<RadioGroup type="button" size="small" v-model="lesson_type" class="pull-right">
							<Radio label="week">本周</Radio>
							<Radio label="month">本月</Radio>
							<Radio label="year">本年</Radio>
						</RadioGroup>
					</p>
					<ve-pie
						height="250px"
						:loading="loading"
						:data="arrangeTypeData" 
						:data-empty="arrangeTypeData.rows.length==0" 
						:settings="typeChartSettings">
					</ve-pie>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="count-container" style="height: 400px">
					<p>排课次数</p>
					<ve-line 
						height="380px"
						:loading="loading"
						:data="arrangeData"
						:data-empty="arrangeData.rows.length==0"  
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="arrangeDataChartSettings">
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
	import VePie from 'v-charts/lib/pie.common'
	
	export default {
		mixins: [common,grid],
		components: {
			CountUp,
			VeLine,
			VePie
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				res = this.transformDate(res)
				this.arrangeData.rows = res.day_course_arrange_list
				this.year_arrange = res.year_course_arrange_num
				this.month_arrange = res.month_course_arrange_num
				this.arrange = this.week_arrange = res.week_course_arrange_num
				this.year_hours = res.year_lesson_hours
				this.month_hours = res.month_lesson_hours
				this.hours = this.week_hours = res.week_lesson_hours

				const list = ['year_lesson_type_list','month_lesson_type_list','week_lesson_type_list']
				list.forEach(key => {
					this[key].splice(0)
					res[key].forEach(l => {
						let obj = {
							type: this.$filter('lesson_type')(l.lesson_type),
							num: l.course_arrange_num
						}
						this[key].push(obj)
					})
				})
				this.arrangeTypeData.rows = this.week_lesson_type_list
			}
		},
		watch: {
			'arrange_type':function(type) {
				if(type == 'week') {
					this.arrange = this.week_arrange
				}else if(type == 'month') {
					this.arrange = this.month_arrange
				}else{
					this.arrange = this.year_arrange
				}
			},
			'hours_type':function(type) {
				if(type == 'week') {
					this.hours = this.week_hours
				}else if(type == 'month') {
					this.hours = this.month_hours
				}else{
					this.hours = this.year_hours
				}
			},
			'lesson_type':function(type) {
				if(type == 'week') {
					this.arrangeTypeData.rows = this.week_lesson_type_list
				}else if(type == 'month') {
					this.arrangeTypeData.rows = this.month_lesson_type_list
				}else{
					this.arrangeTypeData.rows = this.year_lesson_type_list
				}
			}
		},
		data() {
			this.extend = {
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
			this.arrangeDataChartSettings = {
				labelMap: {
					day: '日期',
					course_arrange_num: '排课数'
				}
			}
			this.typeChartSettings = {
				radius: 80,
				offsetY: 140
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
				rest_api: 'overview/course_arrange',
				arrange_type: 'week',
				lesson_type: 'week',
				hours_type: 'week',
				year_arrange: 0,
				month_arrange: 0,
				week_arrange: 0,
				year_hours: 0,
				month_hours: 0,
				week_hours: 0,
				arrange: 0,
				hours: 0,
				lesson_type_list: [],
				year_lesson_type_list: [],
				month_lesson_type_list: [],
				week_lesson_type_list: [],
				arrangeTypeData: {
					columns: ['type','num'],
					rows: []
				},
				arrangeData: {
					columns: ['day','course_arrange_num'],
					rows: []
				}
			}
		}
	}
</script>