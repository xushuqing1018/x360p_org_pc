<template>
	<Modal v-drag-modal :mask-closable="false" width="600" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="100" :model="info" :rules="rules" class="arrange-info px-4">
				<template v-if="allow_empty_teachobj">
					<Form-item :label="'授课类型'" prop="lesson_type">					
						<RadioGroup v-model="info.lesson_type" type="button" size="small">
							<Radio :label="2" v-if="allowType2">1对多</Radio>
						    <Radio :label="1" v-if="allowType1">1对1</Radio>
						    <Radio :label="0" v-if="allowType0">班级</Radio>      
						</RadioGroup>
					</Form-item>
					<Form-item label="满编人数" v-if="info.lesson_type==2">
						<InputNumber v-model="info.student_limit" :min="1"></InputNumber>
					</Form-item>
				</template>
				<Form-item :label="'授课对象'" prop="obj" v-if="!hideTeachObject">					
					<template v-if="modal$.action=='add'&&(empty_fixed||objectFixed.cr_id||objectFixed.teach_eid)">
						<select-object 
							ref="object" 
							clearable
							:allow-lesson-type="selectAllowLessonTypes"
							@on-selected="setTeachObject" 
							@on-clear="clearSelected"
							>
						</select-object>
					</template>
					<template v-else>
						<Tag color="green" v-if="objName">{{objName}}</Tag>
						<template v-if="info.lesson_type > 0">
							<Tag v-for="item in info.students">
								{{modal$.action=='add'?item.student_name:item.student.student_name}}
							</Tag>
						</template>
						<Tag v-else-if="info.lesson_type==0" >{{info.one_class?info.one_class.class_name:classInfo.class_name}}</Tag>
					</template>
				</Form-item>
				
				<Form-item prop="lesson" label="授课课程" class="ivu-form-item-required" v-if="showLesson">
					<select-lesson 
						v-model="info.lid" 
						clearable 
						placeholder="请选择课程" 
						@selected="lessonChange"
						:disabled="selectLessonDisabled"
						:allow-type="info.lesson_type==2?[2]:[1]"
						:condition="{lesson_type:info.lesson_type==2?[2]:[1]}"
						>
					</select-lesson>
				</Form-item>
				<Form-item prop="int_day" label="上课日期">
					<span v-if="!empty_fixed&&objectFixed.int_day &&objectFixed.int_day!==''">
						{{info.int_day}}
					</span>
		            <Date-picker 
			            v-else
		            	:disabled="disabled"
			            type="date"
			            :show-week-numbers="true"
			            :value="format_day(info.int_day)"
			            @on-change="info.int_day = $event"
			            format="yyyy-MM-dd"
			            placeholder="选择日期"
			            :options="int_day_option"
						:show-week-label="true"
			            >
		            </Date-picker>
				</Form-item>
				<Form-item prop="ts_array" label="上课时间">
					<span v-if="!empty_fixed&&objectFixed.ts_array&&objectFixed.ts_array.length>0">
						{{info.int_start_hour}} ~ {{info.int_end_hour}}
					</span>
					<select-time-section 
						v-else
						clearable
						:value="ts_array" 
						:date="info.int_day" 
						@on-change="changeTimeSection"
						placeholder="请选择上课时间段">
					</select-time-section>
				</Form-item>
				<Form-item prop="tb_id" label="授课内容" v-help="'选择了授课内容只能单次排课'" v-if="enable_tbs">
					<Row>
						<Col span="11">
							<select-textbook 
								v-model="info.tb_id" 
								placeholder="请选择教材" 
								@selected="selectTb"
								:disabled="disabled"
								>
							</select-textbook>
						</Col>
						<Col span="11" offset="2">
							<Select v-model="info.tbs_id" :disabled="disabled" placeholder="请选择章节">
								<Option 
									:value="item.tbs_id" 
									v-for="item in sectionData" 
									:key="item.sort"
									>
									{{item.section_title}}
								</Option>
							</Select>
						</Col>
					</Row>
				</Form-item>
				<Form-item prop="consume_source_type" label="课消来源" v-help="info.consume_source_type==1?'考勤时扣课时':'考勤时直接扣电子钱包余额'" v-if="enable_money_consume">
					<RadioGroup type="button" v-model="info.consume_source_type">
						<Radio :label="1">课时</Radio>
						<Radio :label="2">电子钱包</Radio>
					</RadioGroup>
					<div class="mt-2">
						<template v-if="info.consume_source_type == 1">						
							<InputNumber v-model="info.consume_lesson_hour" style="width:60px"></InputNumber>
							<span class="ml-2">课时</span>
						</template>
						<template v-else>
							<InputNumber v-model="info.consume_lesson_amount" style="width:60px"></InputNumber>
							<span class="ml-2">元</span>
						</template>
						
						<Checkbox class="ml-3" v-model="info.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
						<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
						<Checkbox v-model="info.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
					</div>
				</Form-item>
				<Form-item prop="consume_lesson_hour" label="扣课时" v-help="'选择授课对象后在选择时段课时数会自动计算出来'" v-else>											
					<InputNumber v-model="info.consume_lesson_hour" style="width:60px"></InputNumber>
					<span class="ml-2">课时</span>					
					
					<Checkbox class="ml-3" v-model="info.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
					<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
					<Checkbox v-model="info.ignore_student_cc" :true-value="1" :false-value="0">忽略学员冲突</Checkbox>
				</Form-item>
				<Form-item prop="teach_eid" label="教师">
					<span v-if="!empty_fixed&&objectFixed.teach_eid > 0">
						{{info.teach_eid|ename}}
					</span>
					<x-select-employee
						v-else
						:disabled="disabled" 
						v-model="info.teach_eid" 
						clearable
						:rid="1"
						:limit-per="select_teacher_limit" 
						:startDate="info.int_day"
						:int-hours="[info.int_start_hour,info.int_end_hour]"
						>
					</x-select-employee>
				</Form-item>
				<Form-item prop="edu_eid" label="助教">
					<select-employee 
						:disabled="disabled" 
						v-model="info.second_eids" 
						clearable 
						:rid="2" 
						:limit-per="select_teacher_limit" 
						>
					</select-employee>
				</Form-item>
				<Form-item prop="sj_id" label="科目" v-if="subjects.length">
					<Select v-model="info.sj_id">
						<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
					</Select>
				</Form-item>
				<Form-item label="年级" prop="grade" v-if="filter_grades.length > 0">
        			<Select v-model="info.grade" placeholder="">
						<Option :value="item.name" v-for="item in filter_grades">{{item.title}}</Option>
					</Select>
        		</Form-item>
				<Form-item :class="{'custom-form-item-required':info.lesson_type!==1}" label="教室">
					<span v-if="!empty_fixed&&objectFixed.cr_id>0">
						{{info.cr_id|classroom_name}}
					</span>
					<select-class-room 
						v-else
						:disabled="disabled" 
						v-model="info.cr_id">
					</select-class-room>
				</Form-item>			
				<template v-if="showLoopOption">
					<Form-item label="循环次数">
						<div class="row">
							<div class="col-sm-8">
								<Input 
								v-model="info.loop_times"
								@keyup.native="validNumber"
								:disabled="info.tb_id>0"
								>
							        <span slot="prepend">同时段按周循环排</span>
							        <span slot="append">次</span>
							    </Input>
							</div>
							<div class="col-sm-2 ml-2">
					    		<Button size="small" @click="pre_loop_arranges">预排</Button>
					    	</div>
					   </div>
				    </Form-item>
				    <Form-item prop="loop_type" label="循环方式">
						<RadioGroup v-model="info.loop_type" type="button">
							<Radio label="0">每周循环</Radio>
							<Radio label="1">单周循环</Radio>
							<Radio label="2">双周循环</Radio>
						</RadioGroup>
					</Form-item>
				</template>
				<Form-item prop="is_bk_open" label="开启预约" v-if="enable_bk">
					<i-switch v-model="info.is_bk_open" :true-value="1" :false-value="0"></i-switch>
				</Form-item>
			</Form>
		</template>
		<loop-arrange-modal :data="info" ref="loop_arranges" :week-type="info.loop_type"></loop-arrange-modal>
		<div slot="footer">
			<span v-if="modal$.action == 'add'">
				<Checkbox class="ml-3" v-model="show_loop" :true-value="1" :false-value="0">
					循环排多次
				</Checkbox>
			</span>
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="save" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
const INFO_NAME = '排课'
const INFO_PK_ID = 'ca_id'
const INFO_URL   = 'course_arranges'
const emptyObject = {	
	cid: 0,
	lesson_type:-1,
	lid:0,
	name:'',
	_class_name:'',
	sj_id:0,
	grade:0,
	is_attendance:0,
	consume_source_type: 1,	
	consume_lesson_hour: 0,
	consume_lesson_amount: 0,
	int_day:'',
	int_start_hour:'',
	int_end_hour:'',
	teach_eid:0,
	second_eid:0,
	second_eids: [],
	is_trial: 0,
	cr_id:0,
	isloop:1,
	loop_times:1,
	loop_arranges:[],
	students:[],
	is_demo:0,
	loop_type: '0',
	ignore_class_cc: 0,
	ignore_class_ec: 0,
	ignore_student_cc:0,
	tb_id:0,
	tbs_id:0,
	is_bk_open: 0,
	student_limit: 3
}

import util,{_} from '@/libs/util'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectClassRoom from 'c%/SelectClassRoom'
import selectEmployee from 'c%/SelectEmployee.vue'
import XSelectEmployee from 'c%/XSelectEmployee.vue'
import selectClass from 'c%/SelectClass.vue'
import SelectTimeSection from 'c%/SelectTimeSection.vue'
import SelectObject from 'c%/review/review-object.vue'
import loopArrangeModal from '../../arrange/loop-arrange-modal.vue'
import SelectTextbook from 'c%/SelectTextbook.vue'
import SelectLesson from 'c%/SelectLesson.vue'

export default{
	name:'ArrangeInfoModal',
	mixins:[modal,common,globals],
	props:{
		arrranges:{
			type:Array,
			default(){
				return []
			}
		},
		objectFixed: {
			type: Object,
			default() {
				return {}
			}
		},
		hideTeachObject:{
			type: Boolean,
			default: false
		}
	},
	components: {
		selectClass,
		SelectObject,
		selectEmployee,
		SelectClassRoom,
		SelectTimeSection,
		loopArrangeModal,
		XSelectEmployee,
		SelectTextbook,
		SelectLesson
	},
	data () {
		return {
			allowLessonType:[0,1,2],
			info: util.copy(emptyObject),
			consume_type: 0,
			classInfo: {
				cid: 0,
				lid: 0,
				class_name: ''
			},
			objName: '',
			mapStudentList: {},
			rules: {
				obj: [
					{required:true, type:'string',message:'请选择授课对象',trigger:'blur'}
				],
				int_day:[
					{required:true, type:'string',message:'请选择日期',trigger:'change'}
				],
				ts_array:[
					{required:true, type:'array',message:'请选择上课时间',trigger:'change'}
				],				
				teach_eid: [
					{ required: true, type:'number', message:'请选择'+this.$filter('translate')('老师'), trigger: 'change' }
				],			
				cr_id: [
					{ required: true, type: 'number', message: '请选择教室', trigger: 'change' }
				]
			},
			ts_array: [],
			show_loop:false,
			empty_fixed: true,
			sectionData: [] 	// 教材章节
		}
	},
	watch: {
		'modal$.show':{
            handler:function(val){
            	if(val){
            		if(this.modal$.action == 'add') {
            			this.empty_fixed = _.isEmpty(this.objectFixed)
            			// 根据props的objectFixed是否为空做不同的处理
            			if(this.empty_fixed) {
	            			this.info = util.copy(emptyObject)
							this.classInfo.cid = 0
							this.objName = ''
							this.info.loop_type = '0'
							this.ts_array.splice(0)
	            		}else{
	            			this.setInfoByObjectFixed()
						}
						this.info.student_limit = this.$store.state.gvars.configs.params.course_arrange.multi_lesson_limit_student
            		}
            		this.objName = this.setObjName(this.info.lesson_type)
            		if(this.info.consume_lesson_hour>0){
            			this.consume_type = 1
            		}
            		this.info.ignore_class_cc = this.ignore_class_cc
					this.info.ignore_class_ec = this.ignore_class_ec
					this.info.ignore_student_cc = this.ignore_student_cc
					if(this.modal$.action=='edit' && this.info.tb_id > 0) {
						this.get_textbook_section()
					}
					if(this.enable_bk) {
						// this.info.is_bk_open = 1
					}
					if(this.allow_empty_teachobj && this.info.lesson_type == -1) {
						this.allowLessonType.splice(0,1)
						this.info.lesson_type = 2

					}
					
        		}
            }
       },
       //排课更改循环次数、教室、教师、排课对象时要更新loop_arranges中信息
       'info.loop_times': function (val) {			
			this.info.isloop = (val==0?0:1)
			this.loopArrange()
		},
		'info.teach_eid': function (val) {
			this.loopArrange()
		},
		'info.cr_id': function (val) {
			this.loopArrange()
		},
		'info.cid': function (val) {
			this.loopArrange()
		},
		'info.students': function (val) {
			this.loopArrange()
		},
		'info.lid':function(val){
			if(this.enable_grade){
				if(this.info.lesson_type > 0 && this.info.lid > 0){
					let lesson = this.getLessonObj(this.info.lid)
					this.info.grade = lesson.fit_grade_start
				}else{
					this.info.grade = 0
				}
			}
		},
		'info.loop_type': function (val) {
			this.loopArrange()
		},
		show_loop(val){
			if(!val){
				this.info.loop_times = 1
			}
		},
		'info.lesson_type': function(v) {
			if(v==1) {
				this.info.student_limit = 1
			}
		}
    },
	computed:{	
		showLesson(){
			return this.allow_empty_teachobj && this.info.cid == 0
		},
		showLoopOption(){
			return this.modal$.action == 'add' && this.show_loop
		},
        disabled () {
        	return this.info.is_attendance>0
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
		ignore_student_cc() {
			return 0
		},
		selectAllowLessonTypes(){
			return this.allowLessonType
		},
		allowType0(){
        	
        	return this.allowLessonType.indexOf(0) !== -1
        },
        allowType1(){
        	
        	return this.allowLessonType.indexOf(1) !== -1
        },
        allowType2(){
        	
        	return this.allowLessonType.indexOf(2) !== -1
        },
        selectLessonDisabled() {
        	if(this.objectFixed.lid){
        		return true
        	}
        	return false
        }
	},
	created () {
		if(this.allow_empty_teachobj){
			delete this.rules['obj']
		}
		if(this.allow_empty_cc){
			delete this.rules['cr_id']
		}
	},
	methods:{
		consumeTypeChange (val) {
			this.info.consume_lesson_hour = val==1?1:0
		},
		loopArrange () {
			if(this.isloop&&this.info.loop_times){
				this.$r('loop_arranges').pre_loop_arranges()				
			}
		},
		pre_loop_arranges(){
			this.$r('loop_arranges')
			.show('排课预览','add')	
		},
		validNumber(e){
			this.info.loop_times = util.int(this.info.loop_times.toString().replace(/[^\d]+/g,''))
			this.checkLoopTimes()
		},
		checkLoopTimes(){
			let remain_times = 0
			let arr_times = []
			if(this.lesson_type == 0){
				remain_times = this.info._remain_arrange_times
			}else if(this.lesson_type == 1){
				remain_times = this.info.students[0]._remain_arrange_times
			}else{
				this.info.students.forEach(s=>{
					arr_times.push(s._remain_arrange_times)
				})
				remain_times = Math.max.apply(null,arr_times)
			}
			if(remain_times > 1 && this.info.loop_times > remain_times -1){
				this.data_loop_times = remain_times -1
			}
		},
		save () {
			let [method,uri,msg] = this.modal$.action=='add'?['post','course_arranges','排课成功']:['put','course_arranges/'+this.info.ca_id,'调课成功']
			this.check()
			.then(()=>{
				this.$rest(uri)
				[method](this.info)
				.success(response=>{
					this.$Message.success(msg)
					this.$emit('save')
					this.close()
				})
				.error(response=>{
					this.error(response.body.message);
				})
			})
		},
		check () {
			let info = this.info
			return new Promise((resolve,reject)=>{
				if(this.info.lesson_type==-1 && !this.allow_empty_teachobj){
					this.$Message.error('请选择授课对象')
					reject()
					return
				}
				if(this.info.lid==0 && this.info.cid ==0 && !this.allow_empty_teachobj) {
					this.$Message.error('请选择授课课程')
					reject()
					return
				}
				if(this.info.int_day==''){
					this.$Message.error('请选择上课日期')
					reject()
					return
				}
				if(this.info.int_start_hour==''||this.info.int_end_hour==''){					
					this.$Message.error('请选择上课时间')
					reject()
					return
				}
				if(this.info.teach_eid==0){
					this.$Message.error('请选择上课'+this.$filter('translate')('老师'))
					reject()
					return
				}
				if(!this.allow_empty_cc){
					if(this.info.cr_id==0&&this.info.lesson_type!=1){
						this.$Message.error('请选择上课教室')
						reject()
						return
					}
				}
				if(this.enable_tbs) {
					if(this.info.tb_id>0&&this.info.loop_times>1) {
						this.$Message.error('选择了授课内容只能单次排课')
						reject()
						return
					}
					if(this.info.tb_id>0&&this.info.tbs_id==0) {
						this.$Message.error('请选择授课章节')
						reject()
						return
					}
				}
				resolve()
			})
		},
		clearSelected() {
			this.info.lesson_type = -1
			this.info.lid = 0
			this.info.sj_id = 0
			this.info.cid = 0
			this.info._class_name = ''
			this.info.students.splice(0)
			if(!this.objectFixed.teach_eid) {
				this.info.teach_eid = 0
			}
		},
		delStudent (row) {
			let index = this.info.students.indexOf(row)
			if(index > -1){
				this.info.students.splice(index,1)
			}
			if(this.info.students.length===0){
				this.objName = ''
			}
		},
		delClass () {
			this.info.cid = 0
			this.info._class_name = ''
			this.info.lesson_type = -1
			this.objName = ''
		},
		setTeachObject (selected) {
			let ids = selected.ids
			this.info.lesson_type = selected.type	
			if(!_.isEmpty(selected.map_ids)){
				switch (selected.type){
					case 0:
						// 教师固定则选择班级时不能再根据班级的上课老师设置教师
						if(!this.objectFixed.teach_eid) {
							this.info.eid = selected.map_ids[ids[0]].teach_eid
							this.info.teach_eid = selected.map_ids[ids[0]].teach_eid
						}else{
							if(selected.map_ids[ids[0]].teach_eid!==this.objectFixed.teach_eid) {
								this.$Message.info('你选的班级的上课教师与当前排课教师不一致')
							}
						}
						// 教室固定则选择班级时不能再根据班级的上课教室设置教室
						if(!this.objectFixed.cr_id) {
							this.info.cr_id = selected.map_ids[ids[0]].cr_id
						}else{
							if(selected.map_ids[ids[0]].cr_id!==this.objectFixed.cr_id) {
								this.$Message.info('你选的班级的上课教室与当前排课教室不一致')
							}
						}
						this.info.cid = selected.info.cid
						this.info.lid = selected.info.lid
						this.info.sj_id = selected.info.sj_id
						this.info.sid = 0 
						this.info.sids = 0
						this.info._class_name = selected.info.class_name
						this.info.second_eids = selected.info.second_eids
						
						//若开启 考勤扣余额配置，则选择班级时默认取班级的consume_source_type
						if(this.enable_money_consume) {
							this.info.consume_source_type = selected.info.consume_source_type							
						}
						
						this.mapStudentList = {}
						break;
					case 1:
					case 2:
						this.info.cid = 0
						this.info.lid = selected.map_ids[ids[0]].lid
						this.setStudents(ids,selected.map_ids)
						break;
				}
				this.objName = this.setObjName(selected.type)
				let lesson = this.$store.state.gvars.lessons.find(item=>item.lid==this.info.lid)
				if(lesson) {
					this.info.sj_id = lesson.is_package==1?lesson.sj_ids[0]:lesson.sj_id
				}
				
				if(this.info.int_start_hour!=''){
					this.getConsumeHour()					
				}
			}
		},
		setInfoByObjectFixed() {
			let class_item = this.objectFixed.class_item,
				student_lesson = this.objectFixed.student_lesson_item,
				cr_id = this.objectFixed.cr_id,
				eid = this.objectFixed.teach_eid
			if(this.objectFixed.int_day){
				this.info.int_day = this.objectFixed.int_day
			}
			if(this.objectFixed.ts_array){
				this.ts_array = this.objectFixed.ts_array
				this.changeTimeSection(this.objectFixed.ts_array)
			}
			if(this.objectFixed.lid){
				this.info.lid = this.objectFixed.lid
			}
			
			if(class_item) {
				this.info.cid = class_item.cid
				this.info.lid = class_item.lid
				this.info.sj_id = class_item.sj_id
				this.info.cr_id = class_item.cr_id
				this.info.lesson_type = 0
				this.info.teach_eid = class_item.teach_eid
				this.info._class_name = class_item.class_name
				this.classInfo.class_name = class_item.class_name
				this.classInfo.cid = class_item.cid
			}
			if(student_lesson) {
				this.info.lesson_type = 1
				this.info.lid = student_lesson.lid
				this.info.students = [
					{student_name:student_lesson.student.student_name,sid:student_lesson.sid}
				]
			}
			if(cr_id) {
				this.info.cr_id = cr_id
			}
			if(eid) {
				this.info.teach_eid = eid
			}
			let lesson = this.$store.state.gvars.lessons.find(item=>item.lid==this.info.lid)
			if(lesson) {
				this.info.sj_id = lesson.is_package==1?lesson.sj_ids[0]:lesson.sj_id
			}
			if(!_.isUndefined(this.objectFixed.lesson_type)){
				this.info.lesson_type = this.objectFixed.lesson_type
				this.allowLessonType.splice(0,this.allowLessonType.length,this.objectFixed.lesson_type)
			}
			if(this.info.int_start_hour!='' && this.info.lesson_type >0 && this.info.lid > 0){
				this.getConsumeHour()					
			}
		},
		setInfoByTeachObject(teachObject){
			this.$r('object').setTeachObject(teachObject)
		},
		setObjName (type) {
			let map_name = {0:'班',1:'一',2:'多'}
			return map_name[type]||''
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
		selectObject () {
			this.$r('object').show('选择授课对象','add')
			return this
		},	
		cancel () {
			this.info = util.copy(emptyObject)
			this.close()
		},		
		changeTimeSection(event) {
			if(event.length) {
				this.info.int_start_hour = event[0]
				this.info.int_end_hour   = event[1]
				
				if(this.info.cid>0||this.info.lid>0){
					this.getConsumeHour()					
				}
				
			}else{
				this.info.int_start_hour = ''
				this.info.int_end_hour   = ''
			}
		},
		getConsumeHour () {
			let params = {
				cid: this.info.cid,
				int_start_hour: this.info.int_start_hour,
				int_end_hour: this.info.int_end_hour
			}
			
			if(this.info.cid==0){
				delete params.cid
				params.lid = this.info.lid
			}
			
			this.$rest('course_arranges/consume_lesson_hour').get(params)
			.success(data=>{
				this.info.consume_lesson_hour = data.consume_lesson_hour
			}).error(response=>{
				this.$Message.error(response.body.message||'获取扣课时数失败~')
			})
		},
		selectTb() {
			this.info.tbs_id = 0
			this.sectionData = []
			this.get_textbook_section()
		},
		get_textbook_section() {
			this.$http.get('textbook_sections',{
				params: {
					tb_id: this.info.tb_id,
					pagesize:1000
				}
			})
			.then(res => {
				var list = res.body.data.list;
				list.sort((a,b) => {
                    return a.sort - b.sort
                })
				this.sectionData = list;
			},res => {
				this.$Message.error(res.body.message)
			})
		},
		lessonChange(selected) {
			this.info.sj_id = selected.sj_id
		}
	}
}
</script>
<style type="text/css">
	.arrange-info .ivu-form-item {
		margin-bottom: 5px;
	}
</style>