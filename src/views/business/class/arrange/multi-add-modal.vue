<template>
	<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" v-drag-modal :width="800">
		<Form ref="form" :label-width="100" :model="info" :rules="rules" v-if="modal$.show">
			<Row>
				<Col span="12">
					<Form-item :label="allow_empty_teachobj?'授课类型':'授课对象'" prop="obj">
						<template v-if="is_empty">
							<RadioGroup v-model="info.lesson_type" type="button" v-if="allow_empty_teachobj">
								<Radio :label="2">一对多</Radio>
								<Radio :label="1">一对一</Radio>
							</RadioGroup>
				            <select-object 
					            ref="object" 
					            mode="arrange" 
					            clearable
					            @on-selected="setTeachObject" 
					            @on-clear="clearSelected"
					            v-else
					            >
				            </select-object>
			            </template>       
			            <span v-else>{{info._class_name}}</span> 
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="满编人数" v-if="allow_empty_teachobj&&info.lesson_type==2">
						<InputNumber v-model="info.student_limit" :min="1"></InputNumber>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item prop="lesson" label="授课课程" class="ivu-form-item-required" v-if="allow_empty_teachobj">
						<select-lesson 
							v-model="info.lid" 
							clearable 
							placeholder="请选择课程" 
							@selected="lessonChange"
							:allow-type="info.lesson_type==2?[2]:[1]"
							:condition="{lesson_type:info.lesson_type==2?[2]:[1]}"
							>
						</select-lesson>
					</Form-item>
				</Col>
			</Row>	
			<Row>
				<Col span="12">
					<Form-item prop="sj_id" label="科目" v-if="subjects.length">
						<Select v-model="info.sj_id">
							<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
						</Select>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="年级" prop="grade" v-if="filter_grades.length > 0">
		    			<Select v-model="info.grade" placeholder="">
							<Option :value="item.name" v-for="item in filter_grades">{{item.title}}</Option>
						</Select>
		    		</Form-item>
				</Col>
			</Row>
			
			<Form-item label="排课冲突" v-help="'是否忽略排课时老师、教室冲突'">
				<Checkbox v-model="info.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
				<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				<Checkbox v-model="info.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
			</Form-item>
			
			<Form-item label="上课时段">
				<schedule-table ref="schedule" v-model="info.schedule" :info="info" @on-success="handleSuccess"></schedule-table>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>			
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'	
	import SelectObject from 'c%/review/review-object.vue'
	import ScheduleTable from './schedule-table.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	
	const emptyObject = {	
		cid: 0,
		lesson_type: -1,
		lid:0,
		sid: 0,
		sids: [],
		name:'',
		_class_name:'',
		sj_id:0,
		grade:0,
		loop_arranges:[],
		schedule: [],
		students:[],
		ignore_class_cc: 0,
		ignore_class_ec: 0,
		ignore_student_cc:0,
		student_limit: 3
	}
	
	export default{
		mixins:[ common, modal, globals ],
		components: {
			SelectObject,
			ScheduleTable,
			SelectLesson
		},
		props: {
			cls: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data () {
			return {
				info: util.copy(emptyObject),				
				// objName: '',
				mapStudentList: {},
				rules: {
					obj: [
						{required:true, type:'string',message:'请选择授课对象',trigger:'blur'}
					]					
				}
			}
		},
		computed:{	
			ignore_class_cc () {
				let result = 0
				
				if(this.$store.state.gvars.configs.params.course_arrange){
					result = this.$store.state.gvars.configs.params.course_arrange.ignore_class_cc
				}
				
				return result
			},
			ignore_class_ec () {
				let result = 0
				
				if(this.$store.state.gvars.configs.params.course_arrange){
					result = this.$store.state.gvars.configs.params.course_arrange.ignore_class_ec
				}
				
				return result
			},
			ignore_student_cc(){
				return 0
			},
	        subjects () {
	        	let lid = this.info.lid,
	        		lessons = this.$store.state.gvars.lessons,
	        		subjects = this.$store.state.gvars.subjects,
	        		sj_ids = []
	        		
	        		if(lid > 0){
	        			let obj = lessons.find(l=>l.lid==lid)
	        			if(obj){        				
	        				sj_ids = obj.sj_ids
	        			}
	        		}
	        		
	        	return subjects.filter(s=>sj_ids.indexOf(s.sj_id)>-1)        	
	        },
	        filter_grades(){
	        	let empty = []
	        	if(!this.enable_grade || this.info.lesson_type == 0 || this.info.lid == 0){
	        		return empty
	        	}
	        	let lesson = this.getLessonObj(this.info.lid)
	
	        	return this.grades.filter(item=>{
	        		if(item.name >= lesson.fit_grade_start && item.name <= lesson.fit_grade_end){
	        			return true
	        		}
	        		return false
	        	})
	
	        },
	        int_day_option() {
	        	let allow_passed = this.$store.state.gvars.configs.params.course_arrange.allow_passed_arrange
	        	let disabledDate = {}
	        	if(!allow_passed) {
	        		disabledDate = {
	        			disabledDate: function(date) {
	        				return date.valueOf() < Date.now() - 86400000
	        			}
	    			}
	        	}
	        	return disabledDate
	        },
	        is_empty() {
	        	return _.isEmpty(this.cls)
	        }
		},
		mounted () {
			this.info.ignore_class_cc = this.ignore_class_cc
			this.info.ignore_class_ec = this.ignore_class_ec
			this.info.ignore_student_cc = this.ignore_student_cc
		},
		methods: {
			onModalOpen() {
				if(!this.is_empty) {
					this.info.lesson_type = 0
					this.info.cid = this.cls.cid
					this.info.lid = this.cls.lid
					this.info.sj_id = this.cls.sj_id
					this.info.sid = 0
					this.info.sids = []
					this.info.students = []
					this.info._class_name = this.cls.class_name
					this.info.teach_eid = this.cls.teach_eid
					this.info.second_eid = this.cls.second_eid
					this.info.second_eids = this.cls.second_eids
					let lesson = this.$store.state.gvars.lessons.find(item=>item.lid==this.info.lid)
					if(lesson) {
						this.info.sj_id = lesson.is_package==1?lesson.sj_ids[0]:lesson.sj_id
					}
				}
				if(this.allow_empty_teachobj) {
					this.info.lesson_type = 2
				}
			},
			handleSuccess () {
				this.$emit('on-success')
				this.close()
			},
			ok () {
				if(this.allow_empty_teachobj) {
					if(this.info.lid==0) {
						this.$Message.error('请选择授课课程')
						return
					}
				}
				else {
					if(
						this.info.cid==0 
						&& this.info.sid == 0 
						&& this.info.sids.length == 0
					){
						this.$Message.error('请先选择授课对象!')
						return
					}
				}
				
				if(!this.info.schedule || this.info.schedule.length == 0) {
					this.$Message.error('请先添加排课规律！')
					return
				}
				if(this.allow_empty_teachobj) {
					this.info.schedule.forEach(s => {
						s.list.forEach(sl => {
							if(this.info.lesson_type == 2) {
								sl.student_limit = this.info.student_limit
							}
							else {
								sl.student_limit = 1
							}
						})
					})
				}
				this.$refs.schedule.loopCheck()
			},
			setTeachObject (selected) {
				let ids = selected.ids
				this.info.lesson_type = selected.type
				
				if(!_.isEmpty(selected.map_ids)){
					switch (selected.type){
						case 0:
							this.info.cid = selected.info.cid
							this.info.lid = selected.info.lid
							this.info.sj_id = selected.info.sj_id
							this.info.sid = 0
							this.info.sids = []
							this.info.students = []
							this.info._class_name = selected.info.class_name
							this.info.teach_eid = selected.info.teach_eid
							this.info.second_eid = selected.info.second_eid
							this.info.second_eids = selected.info.second_eids
							this.mapStudentList = {}
							break;
						case 1:
						case 2:
							this.info.cid = 0
							this.info.sid = selected.type==1?ids[0]:0
							this.info.sids = selected.type==2?ids:[]
							this.info.lid = selected.map_ids[ids[0]].lid
							this.setStudents(ids,selected.map_ids)
							break;
					}
					let lesson = this.$store.state.gvars.lessons.find(item=>item.lid==this.info.lid)
					if(lesson) {
						this.info.sj_id = lesson.is_package==1?lesson.sj_ids[0]:lesson.sj_id
					}					
					
				}
			},
			clearSelected() {
				this.info.lesson_type = -1
				this.info.lid = 0
				this.info.sj_id = 0
				this.info.cid = 0
				this.info._class_name = ''
				this.info.students.splice(0)
			},
			setStudents (ids,map_ids) {
				this.info.students = []
				if(ids.length){
					ids.forEach(i=>{
						let obj = util.copy(map_ids[i])
						obj.student_name = map_ids[i].student.student_name
						this.info.students.push(obj)
					})
				}
			},
			lessonChange(selected) {
				this.info.sj_id = selected.sj_id
			}
		}
	}
	
</script>

<style>
</style>