<style lang="less">
	@border-color-gray: #e9eaec;
	@border-color-white: #fff;
	.free-time-main {
		.table-freetime-head {
			border:1px solid @border-color-gray;
			width:100%;
			thead{
				th{
					line-height:24px;
					text-align:center;
				}
				th:first-child {
					border-right: 1px solid @border-color-gray;
				}
			}
		}
		.table-freetime-content {
			max-height: 450px;
			overflow: auto;
			overflow-x: hidden;
			.ivu-table-wrapper {
				.loading-wrap {
					width: 100%;
					top: 0;
				}
			}
			.table-freetime {
				border:1px solid @border-color-gray;
				border-top:0;
				border-bottom:0;
				width:100%;
				>tbody {
					>tr:first-child>td:first-child {
						border-bottom: 1px solid @border-color-gray; 
					}
					>tr>td {
						border-bottom: 1px solid @border-color-white;
					}
					.table-free-inner {
						td {
							padding: 4px;
							border: 1px solid @border-color-white;
						}
						tr:first-child>td {
							border-top: 0 !important;
						}
						tr:last-child>td {
							border-bottom: 0 !important;
						}
						tr>td:last-child {
							border-right: 0;
						}
					}
				}
				td {text-align: center;}
				>tr {border-bottom: 1px solid @border-color-gray;
					>td {padding: 6px;}
				}
			}
		}
	}
	
</style>
<template>
	<div class="free-time-main mt-3">
		<table class="table-freetime-head">
			<thead>
				<tr>
					<th width="100px">{{'老师'|translate}}</th>
					<th width="41px"></th>
					<th v-for="(item,index) in week_list">
						{{item.day_text}}<br>
						{{item.text}}
					</th>
				</tr>
			</thead>
		</table>
		<div class="table-freetime-content">
			<div class="ivu-table-wrapper">
				<table class="table-freetime" v-loading.like="'employees'">
					<tr v-if="courseData.length==0">
						<td colspan="8" class="empty">请选择需要查询的老师</td>
					</tr>
					<free-tbody v-for="item in courseData" :data="item" :apn="apn" :type="type" v-else></free-tbody>
				</table>
			</div>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import common from '@/libs/common.mixin'
	import FreeTbody from './tbody-item.vue' 

	export default {
		mixins: [common],
		components: {
			FreeTbody
		},
		props: {
			eids: {
				type: [Number,String,Array],
				default:()=>{
					return []
				}
			},
			date: {
				type: Date
			},
			year:{
				type:Number,
				default:0
			},
			type:{
				type:String,
				default:''
			},
			week:{
				type:Number,
				default:1
			},
			apn:{
				type: Array,
				default:() => {
					return ['a','p','n']
				}
			},
			modal:{
				type: Object,
				default:()=>{
					return {}
				}
			}
		},
		data() {
			return {
				courseData: [],
				timeSectionData: []
			}
		},
		mounted() {
			if(this.eids.length > 0 && this.modal.show) {
				this.getCourseData()
			}
		},
		computed:{
		    week_list(){
				let wd = ['一','二','三','四','五','六','日']
				let ret = []
				let week_dates = util.week_date_array(this.year,this.week)
				week_dates.forEach((dt,index)=>{
					ret.push({
						date:dt,
						week_day:index+1,
						season:this.get_season_by_date(dt),
						int_day:util.int(moment(dt).format('YYYYMMDD')),
						day_text:moment(dt).format('YYYY-MM-DD'),
						text:'周'+wd[index]
					})
				})
				return ret
			},
		},
		methods: {
			getCourseData() {
				let params = {
					date:moment(this.date).format('YYYY-MM-DD'),
					eid:this.eids.join(',')
				}
				this.$rest('employees/1/course')
				.get(params)
				.success(res => {
					let emitParams = {}
					if(this.eids.length > 0) {
						emitParams = params
					}
					this.courseData = res
					this.$emit('on-change-params',emitParams)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			// getTimeSectionData() {
			// 	var vm = this;
			// 	var params = {
			// 		bid: vm.bid$,
			// 		int_day: util.sprintf('[between,%s,%s]',this.week_list[0].day_text,this.week_list[6].day_text),
			// 		eid: this.eids[0]
			// 	}
			// 	this.$http.get('employee_time_sections',{
			// 		params: params
			// 	})
			// 	.then(res => {
			// 		this.timeSectionData = res.body.data.list;
			// 		this.addTimeSectionData();
			// 	},res => {
			// 		this.$Message.error(res.body.message)
			// 	})
			// },
			// addTimeSectionData() {
			// 	var timeSectionData = this.timeSectionData;
			// 	timeSectionData.forEach(item => {
			// 		let range_text = '';
			// 		if(600<=item.int_start_hour<1200) {
			// 			range_text = 'AM';
			// 		}
			// 		else if(1200<=item.int_start_hour<1800) {
			// 			range_text = 'PM';
			// 		}
			// 		else {
			// 			range_text = 'NM'
			// 		}
			// 		var list = this.courseDataOld[0][range_text][item.week_day-1].list;
			// 		for (let index = 0; index < list.length; index++) {
			// 			const item2 = list[index];
			// 			var int_start_hour = this.$filter('format_int_hour')(item.int_start_hour);
			// 			var int_end_hour = this.$filter('format_int_hour')(item.int_end_hour);
			// 			if(item2.int_start_hour==int_start_hour&&item2.int_end_hour==int_end_hour) {
			// 				this.courseDataOld[0][range_text][item.week_day-1].list[index].available = true;
			// 			}
			// 			// else {
			// 			// 	this.courseData[0][range_text][item.week_day-1].list.push({
			// 			// 		int_start_hour: item2.int_start_hour,
			// 			// 		int_end_hour: item2.int_end_hour,
			// 			// 		available: true
			// 			// 	});
			// 			// }
			// 		}
			// 	})
			// 	console.log(this.courseDataOld)
			// 	this.courseData = this.courseDataOld;
			// }
		},
		watch: {
			'eids':function(val) {
				if(val.length > 0 && this.modal.show) {
					this.getCourseData()
				}
			},
			'modal.show':function(val) {
				if(val && this.eids.length > 0) {
					this.getCourseData()
				}
			}
		}
	}
</script>
