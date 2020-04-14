<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="900" :mask-closable="false">
		<template v-if="modal$.show">
			<arrange 
				:arrange="arrange" 
				:post="post" 
				:action="modal$.action" 
				:allow-attend-time="allowAttendTime" 
				:not-arrived-int-day="not_arrived_int_day"
				:allow-history-reg="allow_history_reg"
				:diff-reg-days="diff_reg_days"
				:diff-reg-months="diff_reg_months"
				>
			</arrange>
			<list 
				:loading="loading"
				:post="post" 
				:arrange="arrange" 
				:lesson-type="arrange.lesson_type" 
				:delay-arrange="delay_arrange"
				@add-student="addStudent" 
				@on-refresh="refresh" 
				@on-success="initStudent(true)" 
				:ca-id="ca_id">
			</list>
		</template>
		<div slot="footer">
			<div class="pull-left text-info">
				<Checkbox v-model="post.is_push">
					以微信形式给家长发送上课签到信息(家长需关注公众号)
				</Checkbox>
			</div>
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving" :disabled="disabledOK">确定</Button>
		</div>
		<add-students-modal :list="post.students" ref="addStudents" @on-success="initStudent(true)"></add-students-modal>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import List from './list.vue'
	import Arrange from './arrange.vue'
	import AddStudentsModal from './add-students-modal.vue'
	
	const emptyObject = {
		lesson_type: 0,
		teach_eid: 0,
		lesson_remark: '',					
		students: [],
		consume_source_type: 1,
		consume_lesson_hour: 0,
		consume_lesson_amount: 0,
		is_push: false
	}
	
	export default{
		mixins: [ modal, common ],
		components: {
			List,
			Arrange,
			AddStudentsModal,
		},
		data () {
			return {
				post: util.copy(emptyObject),
				arrange: {},
				ca_id: 0,
				class_attendance: {},
				loading: false,
				delay_arrange: {
					is_delay: false,
					int_day: '',
					int_start_hour: '',
					int_end_hour: '',
					last_arrange_day: ''
				}
			}
		},
		computed:{
			disabledOK () {
				if(this.loading){
					return true
				}
				if(this.not_arrived_int_day){
					return true
				}
				if(this.diff_reg_days > 0 && !this.allow_history_reg){
					return true
				}
				return false
			},
			allow_debt_att () {
				let result = false
				if(this.$store.state.gvars.configs.params){
					result = this.$store.state.gvars.configs.params.class_attendance.allow_debt_att
				}
				return result
			},
			reg_att_before_min () {
				let result = 10
				
				if(this.$store.state.gvars.configs.params){
					result = this.$store.state.gvars.configs.params.class_attendance.reg_att_before_min
				}
				
				return result 
			},
			allowAttendTime () {
				return moment(this.$filter('int_date')(this.arrange.int_day) 
						+ ' '
						+ this.$filter('int_hour')(this.arrange.int_start_hour)).subtract(this.reg_att_before_min,'m').format('YYYY-MM-DD HH:mm')
			},
			not_arrived_int_day (){
				let now_time = moment(new Date()).format('YYYY-MM-DD HH:mm'),
					attend_time = this.allowAttendTime,
					result = moment(now_time).isBefore(attend_time)
			
				return result
			},
			diff_reg_days() {
				let int_day_string = this.$filter('int_date')(this.arrange.int_day),
					now_day_string = moment().format('YYYY-MM-DD'),
					diffDays = moment(now_day_string).diff(int_day_string,'days')
				return diffDays
			},
			diff_reg_months () {
				let int_month_string = this.$filter('int_date')(this.arrange.int_day).substring(0,7),
					now_month_string = moment().format('YYYY-MM'),
					diffMonths = moment(now_month_string).diff(int_month_string,'months')
				return diffMonths
			},
			allow_history_reg() {
				let	allow = true
				if(this.diff_reg_days > 0) {
					if(this.allow_reg_history) {
						if(this.reg_history_pass_days > 0) {
							if(this.diff_reg_days > this.reg_history_pass_days) {
								allow = false
							}
						}else{
							if(
								(this.reg_history_pass_months == 1
									&& this.diff_reg_months >= 1)
								||(this.reg_history_pass_months == 2 
									&& this.diff_reg_months >= 2)
								||(this.reg_history_pass_months == 3 
									&& this.diff_reg_months >= 3)
							) {
								allow = false
							}
						}
					}else{
						allow = false
					}
				}
				return allow
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {		
					this.post = util.copy(emptyObject)		
					this.initStudent()
					if(!_.isEmpty(this.class_attendance)){
						//上课老师以考勤记录为准
						this.post.teach_eid = this.class_attendance.eid						
					}else{
						this.post.teach_eid = this.arrange.teach_eid
					}
					this.post.consume_source_type = this.arrange.consume_source_type||1
					this.post.consume_lesson_hour = this.arrange.consume_lesson_hour||0
					this.post.consume_lesson_amount = this.arrange.consume_lesson_amount||0
					this.post.lesson_remark = this.arrange.lesson_remark||''
					if(util.today_int_day() == this.arrange.int_day){
						this.post.is_push = true
					}
				}
			},
			'delay_arrange': {
				handler: function(delay) {
					if(delay.is_delay) {
						if(delay.int_day) {
							this.post.append_arrange = {
								int_day: delay.int_day,
								int_start_hour: this.$filter('int_hour')(this.arrange.int_start_hour),
								int_end_hour: this.$filter('int_hour')(this.arrange.int_end_hour)
							}
						}
					}else{
						delete this.post.append_arrange
					}
				},
				deep: true
			},
			'arrange': function() {
				this.delay_arrange.is_delay = false
			}
		},
		methods: {
			onModalOpen(query){
				if(query.ca_id !== undefined) {
					this.ca_id = query.ca_id
				}
			},
			ok () {
				this.$rest('course_arranges')
				.add_url_param(this.ca_id,'regatts')
				.post(this.post)
				.success(res=>{
					this.$Message.success('考勤成功！')
					this.$emit('on-success',res.data.catt_id)
					this.close()
				}).error(response=>{
					this.error(response.body.message||'考勤失败~')
				})
			},
			refresh () {
				this.initStudent(false,true)
			},
			initStudent (emit,refresh) {
				let refresh_param = {} 
				if(refresh){
					refresh_param = {
						refresh: true
					}
				}
				this.loading = true
				
				this.$rest('course_arranges')
				.add_url_param(this.ca_id,'attobjects')				
				.get(refresh_param)
				.success(data=>{
					let consume_lesson_hour = Number(this.post.consume_lesson_hour),
						consume_lesson_amount = Number(this.post.consume_lesson_amount),
						consume_source_type	= this.post.consume_source_type,
						student_remain_lesson_hours = 0
						
					this.post.students = data
					this.post.students.forEach((item,index,array)=>{
						array[index].is_reset = false;
						array[index].reset_val = 0;
						if(!this.allow_debt_att){
							if(!_.isEmpty(item.student)){
								if(item.student.student_lesson){
									student_remain_lesson_hours = item.student.student_lesson.remain_lesson_hours
								}else{
									return
								}
								

								if(item.is_makeup == 0) {
									//考勤方式为按时间以外
									//课消方式为扣课时且学员剩余课时小于扣课时数
									if(item.student.student_lesson.price_type != 3){
										if(consume_source_type == 1
											&& student_remain_lesson_hours < consume_lesson_hour
											) 
										{
											item._disabled = true
											item._disabled_consume = true
											return
										}
									}else{
										if(item.student.student_lesson.is_expired || item.student.student_lesson.remain_days == 0){
											item._disabled = true
											item._disabled_consume = true
											return
										}
									}
								}
							}							
							
						}		
						//课消方式为扣电子钱包且学员余额小于扣电子钱包金额
						if(item.student
							&& (
								consume_source_type == 2
								&& Number(item.student.money) < consume_lesson_amount
							)
						){
							
							item._disabled = true
							return
						}

						if(item.is_leave == 1){
							item._disabled = true
							if(this.regatt_default_consume&&item.is_attendance==0) {
								item.is_consume = 1
							}
						}else{
							item._disabled = false
						}
					})
					if(emit){
						this.$emit('on-success')
					}
					this.loading = false
				}).error(response=>{
					this.loading = false
					this.error(response.body.message||'获取学员失败~')
				})
			},
			addStudent () {
				this.$refs.addStudents
				.set('ca_id',this.ca_id)
				.set('cid',this.arrange.cid||0)
				.set('lid',this.arrange.lid)
				.set('sj_id',this.arrange.sj_id)
				.show('添加学员','add')
			}
		}
	}
	
</script>

<style>
</style>