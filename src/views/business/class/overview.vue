<template>
	<div class="module-view order-view">
		<div class="row">
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>开课中</p>
					<div class="count-bg">
						<count-up
							id-name="start-class"
							:end-val="start_class"
							:transform="false"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>临时班</p>
					<div class="count-bg">
						<count-up
							id-name="temporary-class"
							:end-val="temporary_class"
							:transform="false"
							color="#3399FF">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6 pr-0">
				<div class="count-container">
					<p>招生中</p>
					<div class="count-bg">
						<count-up
							id-name="recruit-class"
							:end-val="recruit_class"
							:transform="false"
							color="#EA4E4E">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-3 col-sm-6">
				<div class="count-container">
					<p>已结课</p>
					<div class="count-bg">
						<count-up
							id-name="close-class"
							:end-val="close_class"
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
					<p>班级数量</p>
					<ve-line 
						:loading="loading"
						:data="classData"
						:data-empty="classData.rows.length==0"  
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="classDataChartSettings">
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
				this.start_class = res.total_starting_num
				this.temporary_class = res.total_tmp_class_num
				this.recruit_class = res.total_recruiting_num
				this.close_class = res.total_closed_num
				this.classData.rows = res.day_class_list
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
			this.classDataChartSettings = {
				labelMap: {
					day: '月份',
					starting_num: '开课班级',
					tmp_class_num: '临时班级',
					recruiting_num: '招生班级',
					closed_num: '结课班级'
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
				rest_api: 'overview/classes',
				start_class: 0,
				temporary_class: 0,
				recruit_class: 0,
				close_class: 0,
				classData: {
					columns: ['day','starting_num','tmp_class_num','recruiting_num','closed_num'],
					rows: []
				}
			}
		}
	}
</script>