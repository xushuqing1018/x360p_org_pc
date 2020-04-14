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
				&.cancel{
					background: #eee;
					color:#888;
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
			:arranges="arranges"
			:teach-object="teachObject"
			:section-object="item"
			:conditions="conditions"
			@on-refresh="refreshData">
		</section-cell>
		<div class="arrange-time-section-cell" @click.stop="addCourseArrange" v-if="!enable_time_section">
			<div class="unarrange-cell text-center">
				<span><Icon type="ios-plus-empty"></Icon></span>
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
			arranges:{
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

			}
		},
		computed: {
			date_int_day(){
				return util.int(moment(this.date).format('YYYYMMDD'))
			},
			object_fixed() {
				let obj = {
					int_day: '',
				}
				obj.int_day = moment(this.date).format('YYYY-MM-DD')
				
				switch(this.view) {
					case 'teacher':
						obj.teach_eid = this.teachObject.eid;
						break;
					case 'classroom':
						obj.cr_id = this.teachObject.cr_id;
						break;
					case 'class':
						obj.class_item = this.teachObject;
						break;
					case 'one-to-one':
						obj.student_lesson_item = this.teachObject;
						break;
				}
				return obj
			},
			// 某个期段某一天的上课时间段
			dateTimeSectionsBySeason(){
				let time_sections = []
				let week_day = util.get_week_day(this.date)
				let season   = this.conditions.season
				let season_time_sections = []
				let ts_map = {}
				if(this.enable_time_section){
					season_time_sections = this.get_time_sections(week_day,season)
					if(season_time_sections.length > 0){
						season_time_sections.forEach(ts=>{
							ts_map[ts.int_start_hour+'-'+ts.int_end_hour] = 1
						})
					}
				}
				//获取不在期段时间表里面的排课时间段
				let unreg_time_sections = []
				if(this.arranges.length > 0){
					let int_day = this.date_int_day
					let view = this.view
					let enable_time_section = this.enable_time_section
					let to = this.teachObject
					this.arranges.forEach(item=>{
						if(!enable_time_section){
							if(view == 'teacher'){
								if(to.eid != item.teach_eid){
									return
								}
							}else if(view == 'classroom'){
								if(to.cr_id != item.cr_id){
									return
								}
							}else if(view == 'class'){
								if(to.cid != item.cid){
									return
								}
							}else if(view == 'one-to-one'){
								if(item.lesson_type != 1){
									return 
								}else if(item.students && item.students.length > 0 && to.sid != item.students[0].sid){
									return
								}
							}
						}
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
			refreshData() {
				this.$emit('on-refresh')
			},
			day_arranges(section) {
				return this.arranges.filter(item => moment(this.date).format('YYYYMMDD') == item.int_day
								&&section.int_start_hour == this.$filter('int_hour')(item.int_start_hour)
									&&section.int_end_hour == this.$filter('int_hour')(item.int_end_hour))
			},
			addCourseArrange() {
				let fixObject = this.object_fixed
				
				this.$Modal.open('business/class/arrange/info-modal.vue',{
	                on: {
	                    save: () => {
	                        this.refreshData()
	                    }
	                },
	                props:{
	                	objectFixed:fixObject
	                }
	            })
	            .then(modal => {
	                modal.show('创建排课','add')
	            })
			}
		}
	}
</script>