<template>
	<div class="module-view customer-view">
		<div class="row">
			<div class="col-md-8 pr-0">
				<div class="count-container">
					<p>待试听/已试听次数</p>
					<ve-line 
						height="320px"
						:loading="loading"
						:data="trialData" 
						:data-empty="trialData.rows.length==0"  
						:extend="extend" 
						:mark-line="markLine"
						:mark-point="markPoint"
						:settings="trialChartSettings">
					</ve-line>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>试听类型占比</p>
					<ve-pie 
						height="290px"
						:loading="loading"
						:data="trialTypeData" 
						:data-empty="trialTypeData.rows.length==0"  
						:settings="trialTypeChartSettings" 
						>
					</ve-pie>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>待试听总次数</p>
					<div class="count-bg count-noarrive">
						<count-up
							id-name="untrial_nums"
							:end-val="not_attendance_listen_arrange_num"
							:transform="false"
							color="#E14E4E">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 pr-0">
				<div class="count-container">
					<p>已试听总次数</p>
					<div class="count-bg count-makeup">
						<count-up
							id-name="trialed_nums"
							:end-val="attendance_listen_arrange_num"
							:transform="false"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="count-container">
					<p>试听次数占比</p>
					<ve-pie 
						height="290px"
						:loading="loading"
						:data="scTrialData"
						:data-empty="scTrialData.rows.length==0"   
						:extend="extend2" 
						:settings="trialTypeChartSettings" 
						>
					</ve-pie>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import 'echarts/lib/component/markLine'
  	import 'echarts/lib/component/markPoint'
  	import grid from '@/libs/grid.mixin'
  	import common from '@/libs/common.mixin'
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
				this.not_attendance_listen_arrange_num = res.not_attendance_listen_arrange_num
				this.attendance_listen_arrange_num = res.attendance_listen_arrange_num
				this.trialData.rows = res.trial_listen_arrange_list
				this.trialTypeData.rows.splice(0)
				res.listen_type_list.forEach(l => {
					this.trialTypeData.rows.push({
						type: l.listen_type==0?'跟班试听':'开班试听',
						nums: l.trial_listen_arrange_num
					})
				})
				this.scTrialData.rows.splice(0)
				res.listen_object_list.forEach(l => {
					for(let key in l) {
						let type = key.indexOf('student') > -1 ? '学员次数':'客户次数'
						this.scTrialData.rows.push({
							type: type,
							nums: l[key]
						})
					}
				})
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
			this.extend2 = {
				color: ['#fa6e86','#ffb980']
			}
			this.trialChartSettings = {
				labelMap: {
					day: '日期',
					attendance_trial_listen_arrange_num: '已试听',
					not_attendance_listen_arrange_num: '待试听'
				}
			}
			this.trialTypeChartSettings = {
				radius: 80,
				offsetY: 150
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
				rest_api: 'overview/trial_listen_arrange',
				attendance_listen_arrange_num: 0,
				not_attendance_listen_arrange_num: 0,
				trialData: {
					columns: ['day','attendance_trial_listen_arrange_num','not_attendance_listen_arrange_num'],
					rows: []
				},
				trialTypeData: {
					columns: ['type','nums'],
					rows: []
				},
				scTrialData: {
					columns: ['type','nums'],
					rows: []
				}
			}
		}
	}
</script>