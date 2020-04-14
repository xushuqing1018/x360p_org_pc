<style lang="less">
.module-view {
	padding: 10px;
	&.attend-view {
		.count-container {
			height: 300px;
		}
	}
	&.order-view {
		.count-container {
			height: 200px;
			.count-bg {
				height: 80%;
			}
		}
	}
	&.customer-view {
		.count-container {
			height: 320px;
		}
	}
	.count-container {
		height: 300px;
		background: #fff;
		padding:10px;
		margin-bottom:10px;
		border-radius: 5px;
		box-shadow:2px 2px 2px rgba(7,0,1,0.1);
		.count-bg {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 95%;
			text-align: center;
			font-size: 35px;
			font-weight: 700;
		}
		.count-noarrive {
			background: url(../../../img/count-bg-1.png) no-repeat center center;
		}
		.count-makeup {
			background: url(../../../img/count-bg-2.png) no-repeat center center;
		}
		.count-leave {
			background: url(../../../img/count-bg-3.png) no-repeat center center;
		}
		.count-absence {
			background: url(../../../img/count-bg-4.png) no-repeat center center;
		}
	}
}
</style>
<template>
	<div class="module-view attend-view">
		<div class="row">
			<div class="col-md-4 col-sm-12">
				<div class="count-container">
					<p>考勤数据</p>
					<ve-histogram 
						height="300px"
						:loading="loading"
						:data="attendData" 
						:data-empty="attendData.rows.length==0"  
						:settings="attendChartSettings" 
						:extend="extend">
					</ve-histogram>
				</div>
			</div>
			<div class="col-md-4 col-sm-12 px-0">
				<div class="count-container">
					<p>当天未到人数</p>
					<div class="count-bg count-noarrive">
						<count-up
							id-name="count-noarrive"
							:end-val="late_num"
							color="#E14E4E">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 col-sm-12">
				<div class="count-container">
					<p>当天请假人数</p>
					<div class="count-bg count-leave">
						<count-up
							id-name="count-leave"
							:end-val="leave_num"
							color="#3399FF">
						</count-up>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-4 col-sm-12">
				<div class="count-container">
					<p>学员请假原因</p>
					<ve-pie 
						height="270px" 
						:loading="loading"
						:data="leaveData" 
						:data-empty="leaveData.rows.length==0" 
						:settings="leaveDataChartSettings">
					</ve-pie>
				</div>
			</div>
			<div class="col-md-4 col-sm-12 px-0">
				<div class="count-container">
					<p>缺课人数</p>
					<div class="count-bg count-absence">
						<count-up
							id-name="count-absence"
							:end-val="absence_num"
							color="#FCA727">
						</count-up>
					</div>
				</div>
			</div>
			<div class="col-md-4 col-sm-12">
				<div class="count-container">
					<p>补课人数</p>
					<div class="count-bg count-makeup">
						<count-up
							id-name="count-makeup"
							:end-val="makeup_num"
							color="#00CCCB">
						</count-up>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import VeHistogram from 'v-charts/lib/histogram.common'
	import VePie from 'v-charts/lib/pie.common'
	import CountUp from 'c%/CountUp.vue'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [grid,common,globals],
		components: {
			VeHistogram,
			VePie,
			CountUp
		},
		mounted() {
			this.init_data()
		},
		methods: {
			deal_data(res) {
				res = this.transformDate(res)
				this.leave_num = res.leave_num
				this.makeup_num = res.makeup_num
				this.late_num = res.late_num
				this.absence_num = res.absence_num
				this.attendData.rows = res.class_attendance_list
				this.leaveData.rows.splice(0)
				res.leave_type_list.forEach(l => {
					let obj = {
						leave_reason: this.$filter('dict_title')(l.leave_type,'leave_reason','其他'),
						nums: l.leave_num
					}
					if(l.leave_type == 0) {
						this.leaveData.rows.push(obj)
					}else{
						this.leaveData.rows.unshift(obj)
					}
				})
			}
		},
		data() {
			this.extend = {
				series: {
					barWidth: '20%'
				},
				yAxis: {
					splitLine: {
						lineStyle: {
							color: ['#eee']
						}
					}
				}
			}
			this.attendChartSettings = {
				labelMap: {
					day: '日期',
					need_num: '应到人数',
					in_num: '实到人数'
				}
			}
			this.leaveDataChartSettings = {
				radius: 80,
				offsetY: 150
			}
			return {
				rest_api: 'overview/attendance',
				absence_num: 0,
				late_num: 0,
				makeup_num: 0,
				leave_num: 0,
				attendData: {
					columns: ['day','need_num','in_num'],
					rows: []
				},
				leaveData: {
					columns: ['leave_reason','nums'],
					rows: []
				}
			}
		}
	}
</script>