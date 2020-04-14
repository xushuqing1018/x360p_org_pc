<template>
	<div class="module-view order-view">
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>累计课评次数</p>
					<div class="count-bg">
						<count-up
							id-name="review-num"
							:end-val="review_num"
							:transform="false"
							color="#00CC66">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>累计学员回访次数</p>
					<div class="count-bg">
						<count-up
							id-name="visit-num"
							:end-val="return_visit_num"
							:transform="false"
							color="#FCA727">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>累计回访有效次数</p>
					<div class="count-bg">
						<count-up
							id-name="visit-efficient"
							:end-val="is_connect_num"
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
					<p>作品/作业次数</p>
					<ve-line 
						height="380px"
						:loading="loading"
						:data="workData"
						:data-empty="workData.rows.length==0"  
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="workDataChartSettings">
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
				this.workData.rows = res.homework_num_list
				this.return_visit_num = res.return_visit_num
				this.review_num = res.review_num
				this.is_connect_num = res.is_connect_num
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
			this.workDataChartSettings = {
				labelMap: {
					day: '日期',
					artwork_num: '作品数',
					homework_num: '作业数'
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
				rest_api: 'overview/after_class_service',
				review_num: 0,
				return_visit_num: 0,
				is_connect_num: 0,
				workData: {
					columns: ['day','artwork_num','homework_num'],
					rows: []
				}
			}
		}
	}
</script>