<template>
	<Card dis-hover :bordered="false">
		<div class="row" v-if="arrange&&post">
			<div class="col-sm-3">
				<div class="pull-left mt-2">
					<letterAvatar 
						v-if="post.teach_eid>0"
        				:title="teacher.name"
        				size='55' 
        				:src="teacher.avatar" 
        				:name="teacher.name" 
        				:rounded=true>
        			</letterAvatar>
				</div>
				<div class="pull-left ml-2 mt-2">
					<p class="mb-2">{{teacher.name}}</p>
					<!--添加考勤且可考勤人数大于0时显示-->
					<Button :disabled="action!='add'" type="primary" size="small" @click="changeTeacher">更换{{'老师'|translate}}</Button>
				</div>					
			</div>
			<div class="col-sm-4">
				<p class="mb-2">授课对象：{{getAttendanceName}}</p>
				<p class="mb-2">授课时间：{{arrange.int_day|int_date}} {{arrange.int_start_hour|int_hour}} ~ {{arrange.int_end_hour|int_hour}}</p>
				<p class="mb-2" v-if="arrange.second_eids.length">助教：{{arrange.second_eids|enames}}</p>
				<p class="mb-2">
					<span v-if="enable_grade && arrange.grade>0">年级：{{arrange.grade|dict_title('grade')}}</span>
					<span v-if="arrange.sj_id > 0">科目：{{arrange.sj_id|subject_name}}</span>
				</p>
				<p class="mb-2" v-if="enable_tbs">授课内容：{{course_content}}</p>
								
			</div>
			<div class="col-sm-5">
				<Tag color="green" v-if="arrange.is_online==1">线上课</Tag>
				<Input 
					:rows="3" 
					type="textarea" 
					v-model="post.lesson_remark"
					class="x-ivu-textarea" 
					placeholder="备注：可以对本节课的内容或者下一次课的内容做简要说明">
				</Input>
			</div>
		</div>
		<Alert v-if="notArrivedIntDay" type="error" show-icon>
			当前时间未到考勤时间，请您 
			<code>{{allowAttendTime}}</code> 
			后再考勤!
		</Alert>
		<Alert v-if="!allowHistoryReg" type="error" show-icon>
			<span v-if="!allow_reg_history">系统不允许登记历史考勤，如需要请联系管理员</span>
			<span v-else-if="reg_history_pass_days > 0">系统允许登记历史{{reg_history_pass_days}}天的考勤，该考勤日期已是历史第{{diffRegDays}}天</span>
			<span v-else-if="reg_history_pass_months > 0">
				系统允许登记{{map_history_pass_months[reg_history_pass_months]}}的历史考勤，该考勤月份已是历史第{{diffRegMonths}}个月
			</span>
		</Alert>
		<select-employee ref="employee" v-model="post.teach_eid" :rid="1" style="display: none"></select-employee>
	</Card>	
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import letterAvatar from 'c%/LetterAvatar.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins: [ common,globals ],
		components: {
			letterAvatar,
			SelectEmployee
		},
		props: {
			action: {
				type: String,
				default: 'add'
			},
			arrange: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			post: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			allowAttendTime:{ 
				type: String,
				default: ()=>{
					return ''
				}
			},
			notArrivedIntDay: {
				type: Boolean,
				default: false
			},
			allowHistoryReg: {
				type: Boolean,
				default: true
			},
			diffRegDays: {
				type: Number,
				default: 0
			},
			diffRegMonths: {
				type: Number,
				default: 0
			}
		},
		computed: {
			getAttendanceName () {
				let arrange = this.arrange,
					mapTitle = {1:'一对一',2:'一对多'},
					result = ''
				if(arrange.lesson_type===0){					
					result = arrange.one_class!=null?arrange.one_class.class_name:arrange.name					
				}else{					
					result = mapTitle[arrange.lesson_type]										
				}
				
				return result
			},
			teacher () {
				let teacher = {
					avatar: '',
					name: '请选择'
				}
				
				if(this.arrange.teach_eid > 0){					
					let temp_obj = this.$store.state.gvars.employees.find(e=>e.eid===this.post.teach_eid)					
					if(temp_obj){
						teacher.avatar = temp_obj.photo_url			
						teacher.name = temp_obj.ename
					}					
				}
				return teacher
			},
			course_content () {
				let result = '-'
                let book = this.arrange.textbook
                let section = this.arrange.textbook_section
                if(book) {
                    result = book.tb_name
                }
                if(section) {
                    result += `  第${section.sort}章${section.section_title}`
                }
                return result
			}
		},
		methods: {
			changeTeacher () {
				this.$r('employee').openModal()
			}
		}
	}
</script>

<style>
</style>