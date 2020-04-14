<template>
	<td>
		<Poptip trigger="hover" :title="tipTitle" placement="right" v-if="arrange">
			<div 
			 class="cell-info"
			 :class="{
			 	'cell-arranged':arrange.is_attendance == 0,
			 	'cell-attendanced':arrange.is_attendance > 0,
			 	'cell-absence':is_absence,
			 	'cell-leave':is_leave
			 }"
			 @click="viewArrange"
			>
			
			{{arrange.students[0].student.student_name}}
			</div>
			<div slot="content" class="cell-poptip-content">
				<div>
					<Icon type="android-bookmark"></Icon>
					<span>{{arrange.lid|lesson_name}}</span>
					<span v-if="arrange.textbook_section"><第{{arrange.textbook_section.sort}}章{{arrange.textbook_section.section_title}}></span>
					<template v-else>
						<span>/</span>
						<span>{{arrange.sj_id|subject_name}}</span>
					</template>
				</div>
				<div>
					<Icon type="ios-person"></Icon>
					<span>{{arrange.teach_eid|ename('未知')}}</span>&nbsp;
					<Icon type="home"></Icon>
					<span>{{arrange.cr_id|classroom_name('未知')}}</span>
				</div>
				<div v-if="arrange.is_attendance > 0">
					<span>已考勤</span>
					<span v-if="is_absence">，缺勤未请假</span>
					<span v-if="is_leave">，请假</span>
				</div>
			</div>
		</Poptip>
		
		<div class="cell-empty" @click="addArrange" v-else>
			<Icon type="ios-plus-empty"></Icon>
		</div>
	</td>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	export default {
		mixins: [common,globals],
		props: {
			ts:{
				type:Object,
				default(){
					return {}
				}
			},
			arranges:{
				type:Array,
				default(){
					return []
				}
			},
			teacher:{
				type:Object,
				default(){
					return {}
				}
			},
			date: {
				type: Date
			}
		},
		data() {
			return {
				
			}
		},
		computed:{
			arrange(){
				let arrange = null
				
				for(let i=0;i<this.arranges.length;i++){
					if(
						this.arranges[i].teach_eid == this.teacher.eid 
						&& util.int(this.arranges[i].int_start_hour) == util.int(util.format_int_hour(this.ts.int_start_hour))
						 && util.int(this.arranges[i].int_end_hour) == util.int(util.format_int_hour(this.ts.int_end_hour))
					){
						arrange = this.arranges[i]
					break
					}
				}
				
				if(arrange){
					if(!arrange.students || arrange.students.length == 0){
						arrange = null
					}
				}
				return arrange
			},
			int_day(){
				return moment(this.date).format('YYYYMMDD')
			},
			tipTitle(){
				return this.arrange.int_day + ' ' + this.arrange.int_start_hour + '~'+this.arrange.int_end_hour
			},
			is_absence(){
				if(this.arrange){
					if(this.arrange.students[0].is_in == 0 && this.arrange.students[0].is_leave == 0){
						return true
					}
				}
				return false
			},
			is_leave(){
				if(this.arrange){
					if(this.arrange.students[0].is_in == 0 && this.arrange.students[0].is_leave == 1){
						return true
					}
				}
				return false
			}
		},
		methods: {
		   addArrange(){
		   		let input = {
		   			teach_eid:this.teacher.eid,
		   			ts_array:[],
		   			int_day:moment(this.date).format('YYYY-MM-DD'),
		   			cr_id:0,
		   			lesson_type:1
		   		}
		   		input.ts_array.push(this.ts.int_start_hour)
			    input.ts_array.push(this.ts.int_end_hour)
		   		this.$emit('on-add-arrange',input)
		   },
		   viewArrange(){
		   		this.$emit('on-view-arrange',this.arrange)
		   }
		}
	}
</script>