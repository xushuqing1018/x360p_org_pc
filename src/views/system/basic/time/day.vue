<style lang="less">
	.day-time-sections {
		.arrange-time-section-cell {
			line-height: 25px;
			margin-bottom: 4px;
			cursor: pointer;
			.unarrange-cell {
				border: 1px solid #eee;
				padding: 0 5px;
				&:hover{
					background-color: #eee;
				}
			}
			.arranged-cell {
				position: relative;
				color: #fff;
				background: #50a8ff;
				padding: 5px;
				line-height: 20px;
				&.attendanced {
					background: #19be6b;
				}
				&.part-attendanced {
					background: #f90;
				}
				.review {
					position: absolute;
					right: 0;
					top: 0;
					width: 22px;
					height: 22px;
				    border-radius: 0 0 0 18px;
				    border: 1px solid #fff;
				    border-top: 0;
				    border-right: 0;
					padding: 5px;
					color: #fff;
					line-height: 13px;
				}
				.lesson-type {
				    width: 18px;
				    height: 14px;
				    background: #fff;
				    color: #657180;
				    padding: 2px 4px;
				}
			}
		}
	}
</style>
<template>
	<div class="day-time-sections">
		<section-cell
			v-for="item in dateTimeSectionsBySeason"
			:view="view"
			:date="date" 
			:day-arranges="day_arranges(item)"
			:teach-object="teachObject"
			:section-object="item"
			:conditions="conditions"
			@on-refresh="refreshData"
			:dateRange="dateRange"
			:bid="bid"
			:teacherRangeData="teacherRangeData">
		</section-cell>
		<section-cell
			v-for="item in customTSList"
			:view="view"
			:date="date" 
			:day-arranges="day_arranges(item)"
			:teach-object="teachObject"
			:section-object="item"
			:conditions="conditions"
			@on-refresh="refreshData"
			:dateRange="dateRange"
			:bid="bid"
			:teacherRangeData="teacherRangeData">
		</section-cell>
		<div class="arrange-time-section-cell" @click.stop="addTimeSection">
			<div class="unarrange-cell" style="text-align: center">
				<span>＋</span>
			</div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import SectionCell from './section-cell.vue'
	export default {
		mixins: [common],
		components: {
			SectionCell
		},
		props: {
			view: {
				type: String,
				default: ''
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
			bid:{
				type:Number,
				default:0
			},
			arranges:{
				type:Array,
				default(){
					return []
				}
			},
			dateRange:{
				type:Array,
				default(){
					return []
				}
			},
			teacherRangeData:{
				type:Array,
				default(){
					return []
				}
			},
			conditions:{
				type:Object,
				default(){
					return {}
				}
			},
			teachObject:{
				type: Object,
				default() {
					return {}
				}
			}
		},
		data() {
			return {
				customTimeSection: {
					int_start_hour: '',
					int_end_hour: ''
				}
			}
		},
		mounted() {
		},
		computed: {
			customTSList() {
				var teacherRangeData = this.teacherRangeData.filter(item => {
					if(item.eid == this.teachObject.eid&&item.int_day == parseInt(moment(this.date).format('YYYYMMDD'))) {
						return true;
					}
					return false;
				})
				var customTSList = [];
				var dateTimeSectionsBySeason = this.dateTimeSectionsBySeason;
				for(var i = 0; i < teacherRangeData.length; i++) {
					var item = teacherRangeData[i];
					var int_start_hour = item.int_start_hour;
					var int_end_hour = item.int_end_hour;
					var none = dateTimeSectionsBySeason.every(item2 => {
						return !(item2.int_start_hour == int_start_hour&&item2.int_end_hour == int_end_hour)
					})
					if(none) {
						customTSList.push(item)
					}
				}
				return customTSList;
			},
			// 某个期段某一天的上课时间段
			dateTimeSectionsBySeason(){
				let time_sections = []
				let week_day = util.get_week_day(this.date)
				let season   = this.conditions.season
				let season_time_sections = this.get_time_sections(week_day,season)
				let ts_map = {}
				if(season_time_sections.length > 0){
					season_time_sections.forEach(ts=>{
						ts_map[ts.int_start_hour+'-'+ts.int_end_hour] = 1
					})
				}
				//获取不在期段时间表里面的排课时间段
				let unreg_time_sections = []
				if(this.arranges.length > 0){
					let int_day = util.int(moment(this.date).format('YYYYMMDD'))
					this.arranges.forEach(item=>{
						if(item.int_day == int_day){
							let key = util.int_hour_to_hour_str(item.int_start_hour)+'-'+util.int_hour_to_hour_str(item.int_end_hour)
							if(!_.isDefined(ts_map[key])){
								unreg_time_sections.push({
									int_start_hour:util.int_hour_to_hour_str(item.int_start_hour),
									int_end_hour:util.int_hour_to_hour_str(item.int_end_hour),
									week_day:week_day
								})
								ts_map[key] = 1
							}
						}
					})
				}

				time_sections = season_time_sections.concat(unreg_time_sections)

				return this.orderBy(time_sections,'int_start_hour')
			}
		},
		methods: {
			addTimeSection() {
				var vm = this;
				this.$Modal.open('system/basic/time/add-time-section.vue@modal',{
					props: {
						info: this.customTimeSection
					},
					on: {
						'on-ok': function() {
							var arrayObj = {
								0: {
									bid: vm.bid,
									eid: vm.teachObject.eid,
									int_day: parseInt(moment(vm.date).format('YYYYMMDD')),
									int_start_hour: parseInt(vm.$filter('format_int_hour')(vm.customTimeSection.int_start_hour)),
									int_end_hour: parseInt(vm.$filter('format_int_hour')(vm.customTimeSection.int_end_hour)),
									week_day: vm.week+1
								}
							};
							vm.$http.post('employee_time_sections',arrayObj)
							.then(res => {
								vm.$Message.success('添加成功')
								vm.refreshData();
							},res => {
								vm.$Message.error(res.body.message)
							})
						}
					}
				})
				.then(modal => {
					modal.show('添加自定义时段')
				})
			},
			refreshData() {
				this.$emit('on-refresh')
			},
			day_arranges(section) {
				return this.arranges.filter(item => moment(this.date).format('YYYYMMDD') == item.int_day
								&&section.int_start_hour == this.$filter('int_hour')(item.int_start_hour)
									&&section.int_end_hour == this.$filter('int_hour')(item.int_end_hour))
			}
		}
	}
</script>