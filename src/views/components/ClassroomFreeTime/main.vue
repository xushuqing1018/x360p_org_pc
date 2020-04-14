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
					<th width="100px">教室</th>
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
				<table class="table-freetime" v-loading.like="'classrooms'">
					<tr v-if="courseData.length==0">
						<td colspan="8" class="empty">请选择需要查询的教室</td>
					</tr>
					<free-tbody v-for="item in courseData" :data="item" :apn="apn" v-else></free-tbody>
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
			crIds: {
				type: [Number,String,Array],
				default:() => {
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
				courseData: []
			}
		},
		mounted() {
			if(this.crIds.length > 0 && this.modal.show) {
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
					cr_id:this.crIds.join(',')
				}
				this.$rest('classrooms/1/course')
				.get(params)
				.success(res => {
					let emitParams = {}
					if(this.crIds.length > 0) {
						emitParams = params
					}
					this.courseData = res
					this.$emit('on-change-params',emitParams)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		},
		watch: {
			'crIds':function(val) {
				if(val.length > 0 && this.modal.show) {
					this.getCourseData()
				}
			},
			'modal.show':function(val) {
				if(val && this.crIds.length > 0) {
					this.getCourseData()
				}
			}
		}
	}
</script>
