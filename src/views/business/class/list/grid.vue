<style lang="less">
@import '~@/style/mixin.less';
.schedule-wrap{
	padding:10px;
	.rounded(5px);
	background:#fff;
	position:relative;

}
</style>
<template>
	<div class="c-grid">
		<div class="schedule-wrap">
			<div class="clearfix">
				<div class="pull-right mb-2">
		            <label>当前模式：</label>
		            <ButtonGroup>
		                <Button type="ghost" size="large" icon="ios-list-outline" @click="turnListClass" style="padding:2px 5px">列表</Button>
		                <Button type="primary" size="large" icon="grid" style="padding:2px 5px">表格</Button>
		            </ButtonGroup>
		        </div>
		    </div>
			<schedule-header 
			:bid="bid$" 
			:year="year"
			:season="season"
			:conditions="conditions" 
			:mode="mode" 
			:action="action"
			@on-year-change="yearChange"
			@on-season-change="seasonChange" 
			ref="header"></schedule-header>
			<schedule-condition 
			:bid="bid$"
			:conditions="conditions"
			:mode="mode"
			:action="action"
			:schedules="schedules"
			:current-time-section="currentTs"
			:edit-lid="editLid"
			@on-select-condition="selectCondition"
			ref="condition">
			</schedule-condition>
			<schedule-main 
				:bid="bid$"
				:year="year"
				:season="season"
				:mode="mode"
				:action="action"
				:conditions="conditions"
				:schedules="schedules"
				:disable-sections="disableSections"
				@on-add-schedule="addSchedule"
				@on-edit-schedule="editSchedule"
				ref="main">
					<schedule-info
					:bid="bid$"
					:year="year"
					:season="season"
					:lid="conditions.lessons.current.id"
					:teach-eid="conditions.teachers.current.id"
					:cr-id="conditions.classrooms.current.id"
					:sj-id="conditions.subjects.current.id"
					:schedules="schedules"
					@on-close="backList"
					@on-add-schedule-success="refreshSchedule"
					@on-delete-schedule-success="refreshSchedule"
					@on-select-lesson="selectLessonModal"
					ref="info">
					</schedule-info>
			</schedule-main>
		</div>
	</div>
</template>
<script>
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import store from '@/store'
import util from '@/libs/util'
import scheduleHeader from '../schedule/header.vue'
import scheduleCondition from '../schedule/condition.vue'
import scheduleMain from '../schedule/main.vue'
import scheduleInfo from '../schedule/info.vue'

const CACHE = {}
export default {
	name:'classSchedule',
	mixins:[common,globals],
	components:{
		scheduleHeader,
		scheduleCondition,
		scheduleMain,
		scheduleInfo
	},
	filters:{
		time_sections(data,week_day){
			return data.filter(d=>d.week_day == week_day)
		},
		lesson_name(lid,empty){
			return store.getters.getMapText(lid,'lessons')||empty
		},
		teacher_name(eid,empty){
			return store.getters.getMapText(eid,'teachers')||empty
		},
		room_name(cr_id,empty){
			return store.getters.getMapText(cr_id,'classrooms')||empty
		},
		assistant_name(eid,empty){
			return store.getters.getMapText(eid,'assistants')||empty
		},
		sex(sex){
			let map_sex = {0:'未确定',1:'男',2:'女'}
			return map_sex[sex]
		}
	},
	created(){
		this.season = util.auto_season()
	},
	data(){
		let current_year = (new Date()).getFullYear()
		return {
			ready:false,
			mode:'view',			//模式查看或编辑 view,edit
			action:'list',			//操作动作 list,add,edit
			loading:false,
			branch_name:'',
			year:current_year,
			season:'',
			base:{
				time_sections:[],
				date:['',''],
				schedules:[],
				week_day_sections:{1:[],2:[],3:[],4:[],5:[],6:[],7:[]}
			},
			currentTs:{},			//当前时间段
			editLid:0,				//当前编辑输入课程ID
			conditions:{
				lessons:{
					name:'lessons',
					text:'课程',
					key:'',
					current:{
						id:0,
						name:''
					},
					list:[]
				},
				subjects:{
					name:'subjects',
					text:'科目',
					key:'',
					current:{
						id:0,
						name:''
					},
					list:[]
				},
				teachers:{
					name:'teachers',
					text:'教师',
					key:'',
					current:{
						id:0,
						name:''
					},
					list:[]
				},
				classrooms:{
					name:'classrooms',
					text:'教室',
					key:'',
					current:{
						id:0,
						name:''
					},
					list:[]
				}
			},
			modal:{
				add:{
					$new:true,
					cid:0,
					week_day:0,
					int_start_hour:'',
					int_end_hour:'',
					lid:0,
					teach_eid:0,
					edu_eid:0,
					cr_id:0,
					class_name:'',
					class_no:'',
					start_lesson_time:'',
					end_lesson_time:'',
					lesson_times:0,
					plan_student_nums:0
				},
				edit:{
					tab:'basic',
					saving:false,
					data:{},
					arranges:[],
					students:[]
				},
				assign_student:{
					show:false,
					title:'分班操作',
					data:{
						in_way:2,
						sids:[],
						in_time:''
					}
				}
			}
		}
	},
	mounted(){
		this.init()
	},
	computed:{
		dataParams(){
			let params = {}
			params.bid = this.bid$
			params.year = this.year
			params.season = this.season
			params.pagesize = 3000
			return params
		},
		schedules(){
			let conditions = this.conditions
			return this.base.schedules.filter(s=>{
				
				if(conditions.lessons.current.id != 0){
					
					if(s.classes.lid != conditions.lessons.current.id){
						return false
					}
				}
				if(conditions.teachers.current.id != 0){
					if(s.classes.teach_eid != conditions.teachers.current.id){
						return false
					}
				}
				if(conditions.subjects.current.id != 0){
					if(s.classes.sj_id != conditions.subjects.current.id){
						return false
					}
				}
				if(conditions.classrooms.current.id != 0){
					if(s.classes.cr_id != conditions.classrooms.current.id){
						return false
					}
				}
				return true
			})
		},
		disableSections(){
			let conditions = this.conditions
			let sections = []
			let get_cr_id = function(s){
				if(s.cr_id){
					return s.cr_id
				}
				return s.classes.cr_id
			}
			let get_teach_eid = function(s){
				if(s.teach_eid){
					return s.teach_eid
				}
				return s.classes.teach_eid
			}
			let sec_key = function(s){
				return [s.week_day,s.int_start_hour,s.int_end_hour].join('-')
			}
			if(conditions.teachers.current.id != 0){
				this.base.schedules.forEach(s=>{
					let teach_eid = get_teach_eid(s)
					if(teach_eid == conditions.teachers.current.id){
						sections.push(sec_key(s))
					}
				})
			}
			if(conditions.classrooms.current.id != 0){
				this.base.schedules.forEach(s=>{
					let cr_id = get_cr_id(s)
					if(cr_id == conditions.classrooms.current.id){
						sections.push(sec_key(s))
					}
				})
			}
			
			return sections
		},
		filterClassStudents(){
			let conditions = this.conditions
			return this.modal.edit.students.filter(s=>{
				if(!/^\s*$/.test(this.key.students) ){
					
					if(s.student_name.indexOf(this.key.students) === -1){
						return false
					}
				}
				return true
			})
		}
	},
	methods:{
		turnListClass () {
            this.$emit('on-turn-list','list')
        },
		init(){
			this.ready = false
			this.init_schedule_data().then(()=>{
				this.ready = true
			})
		},
		init_schedule_data(refresh){
			return new Promise((resolve,reject)=>{
				let need_request = false
				let ck = ['schedules',this.bid$,this.year,this.season].join('-')

				if(refresh === true){
					need_request = true
				}else{
					if(CACHE[ck]){
						this.base.schedules = CACHE[ck]
						resolve(CACHE[ck])
						return
					}else{
						need_request = true
					}
				}
				if(need_request){
					this.loading = true
					this.$rest('class_schedules').get(this.dataParams)
					.success(response=>{
						this.loading = false
						CACHE[ck] = response.list
						this.base.schedules = response.list
						resolve(response.list)
					})
					.error(response=>{
						this.loading = false
						reject(response)
					})
				}
			})		
		},
		refreshSchedule(){
			this.init_schedule_data(true)
		},
		yearChange(year){
			this.year = year
			this.refreshSchedule()
		},
		seasonChange(season){
			this.season = season
			this.refreshSchedule()
		},
		
		selectCondition({item,c}){
			if(this.action == 'list'){
				switch(c){
					case 'lessons':
						this.conditions.lessons.current.id   = item.lid
						this.conditions.lessons.current.name = item.lesson_name
						this.clearSubjectIdNotInLessonSubjectIdScope(item.lid)
						break;
					case 'teachers':
						this.conditions.teachers.current.id   = item.eid
						this.conditions.teachers.current.name = item.ename
						break;
					case 'classrooms':
						this.conditions.classrooms.current.id = item.cr_id
						this.conditions.classrooms.current.name = item.room_name
						break;
					case 'subjects':
						this.conditions.subjects.current.id   = item.sj_id
						this.conditions.subjects.current.name = item.subject_name

						break;
				}
			}
			if(this.action == 'add' && this.conditions[c].current.id == 0){
				switch(c){
					case 'lessons':
						this.$r('info').setInfoData('lid',item.lid,'add')
						this.editLid = item.lid
						break;
					case 'teachers':
						this.$r('info').setInfoData('teach_eid',item.eid,'add')
						break;
					case 'subjects':
						this.$r('info').setInfoData('sj_id',item.sj_id,'add')
						break;
					case 'classrooms':
						this.$r('info').setInfoData('cr_id',item.cr_id,'add')
						break;
				}
			}
			if(this.action == 'edit' && this.conditions[c].current.id == 0){
				switch(c){
					case 'lessons':
						this.$r('info').setInfoData('lid',item.lid,'edit')
						this.editLid = item.lid
						break;
					case 'teachers':
						this.$r('info').setInfoData('teach_eid',item.eid,'edit')
						break;
					case 'subjects':
						this.$r('info').setInfoData('sj_id',item.sj_id,'edit')
						break;
					case 'classrooms':
						this.$r('info').setInfoData('cr_id',item.cr_id,'edit')
						break;
				}
			}
		},
		//清除不在课程科目范围内的科目条件选择
		clearSubjectIdNotInLessonSubjectIdScope(lid){
			if(this.conditions.subjects.current.id == 0){
				return
			}
			let lesson = this.getLessonObj(lid)
			let sj_ids = []
			if(lesson.sj_id != 0){
				sj_ids.push(lesson.sj_id)
			}else{
				for(let i=0,l=lesson.sj_ids.lengh;i<l;i++){
					sj_ids.push(util.int(lesson.sj_ids[i]))
				}
			}
			if(sj_ids.indexOf(this.conditions.subjects.current.id) === -1){
				this.conditions.subjects.current.id = 0
			}
		},
		//添加排班
		addSchedule(ts){
			this.action = 'add'
			this.currentTs = ts
			if(this.conditions.lessons.current.id != 0){
				this.editLid = this.conditions.lessons.current.id
			}
			this.$r('info')
			.show('添加排班')
			.setTs(ts)
		},
		//编辑排班
		editSchedule({data,ts,condition}){
			this.action = 'edit'
			this.$r('info')
			.setSchedule(data)
			.show('编辑排班','edit')
			.setTs(ts)
		},
		backList(){
			this.action = 'list'
			this.editLid = 0
		},		
		saveAddSchedule(){
			let post_data
			if(this.modal.add.$new == true){
				//创建新班级
				post_data = util.dataPart(this.modal.add)
				if(!this.$r('info').validateSchedule(post_data)){
					return false
				}
				post_data.bid = this.branch.id
				post_data.season = this.season
				post_data.year   = this.year
				post_data.int_start_hour = post_data.int_start_hour.replace(/[^\d]/g,'')
				post_data.int_end_hour   = post_data.int_end_hour.replace(/[^\d]/g,'')
			}else{
				post_data = util.dataPart(this.modal.add,['cid','int_start_hour','int_end_hour','week_day'])
				if(post_data.cid == 0){
					this.$Message.error('请选择已排班级!')
					return false
				}
				post_data.bid = this.branch.id
				post_data.season = this.season
				post_data.year   = this.year
				post_data.int_start_hour = post_data.int_start_hour.replace(/[^\d]/g,'')
				post_data.int_end_hour   = post_data.int_end_hour.replace(/[^\d]/g,'')
			}
			this.$rest('class_schedules').post(post_data)
			.success(response=>{
				this.$Message.success('创建排班成功!')
				this.init_data(true)
				this.saveAddBackToList()
			})
			.error(response=>{
				this.$Notice.error({
                    title: '创建排班失败',
                    desc: response.body.message
                })
			})
		},
		
		//创建班级排课记录
		createClassArranges(cid){
			this.modal.edit.saving = true
			this.$rest('course_arranges').post({
				cids:[cid]
			}).success(response=>{
				this.modal.edit.saving = false
				this.get_class_arranges(true)
			})
			.error(response=>{
				this.modal.edit.saving = false
				this.$Notice.error({
                    title: '创建排课记录失败',
                    desc: response.body.message
                })
			})
		},
		//分班学员
		assignStudent(){
			this.modal.assign_student.show  = true
			this.modal.assign_student.title = '分班操作'+ '[' + this.modal.edit.data.class_name + ']'
			this.modal.assign_student.data.in_time = this.$filter('moment')(new Date(),'YYYY-MM-DD')

		},
		//取消分班
		cancelAssignStudent(){
			this.modal.assign_student.show = false
		},
		//执行分班
		doAssignStudent(){
			if(this.modal.assign_student.data.sids.length == 0){
				this.$Message.error('请选择要分班的学员')
				return false
			}

			this.$rest('classes').add_url_param(this.modal.edit.data.cid,'students')
			.post(this.modal.assign_student.data)
			.success(response=>{
				this.$Message.success('分班操作成功')
				this.cancelAssignStudent()
				this.get_class_students(true)
			})
			.error(response=>{
				this.$Notice.error({
					title:'分班操作失败',
					desc:response.body.message
				})
			})
		},
		selectLessonModal(lid) {
			this.$r('info').setInfoData('lid',lid,'add')
			this.editLid = lid
			this.$r('condition').select_condition(this.conditions.lessons)
		}
	},
	watch:{
		'modal.add.$new':function(isnew){
			if(isnew){
				this.modal.add.cid = 0
			}
		},
		'modal.edit.tab':function(tab){
			if(tab == 'arranges'){
				this.get_class_arranges()
			}else if(tab == 'students'){
				this.get_class_students()
			}
		},
		'$store.state.branch.id':{
			handler: function (val) {
				this.init()
			},
			deep: true
		}
	}
}
</script>