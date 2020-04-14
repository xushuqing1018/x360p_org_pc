<template>
	<Form class="m-t" ref="form" :label-width="labelWidth" :model="data" :rules="rules">
		<FormItem label="授课时间">			
			<DatePicker 
				v-if="mode=='list'&&action=='add'"
				type="date" 
				@on-change="dateChange"
				placeholder="选择日期" 
				style="width: 200px">
			</DatePicker>
			<span v-else>{{data.int_day|int_date}}(周{{data.int_day|int_week}}) {{data.int_start_hour}} ~ {{data.int_end_hour}}</span>
		</FormItem>
		
		<Form-item label="选择时段" v-if="mode=='list'&&action=='add'">
			<Select style="width:200px" @on-change="onChange">
				<Option v-for="item in time_sections" :value="item.int_start_hour+','+item.int_end_hour" :key="item.tsid">
					{{item.int_start_hour}} -- {{item.int_end_hour}}
				</Option>
			</Select>
		</Form-item>
		
    	<FormItem label="授课对象">
    		<drop 
				v-if="mode == 'add'||action=='add'"
	    		class="drop"
	    		:class="{allowed:isDrag('object')}" 
	    		@dragover="dragOverObject"
	    		@drop="dropObject">	    		
	            <template v-if="data.lesson_type == 0 && data.is_trial == 0">
					<Tag type="border" color="blue" v-if="data.cid != 0">班课</Tag>
					<Tag
						v-if="data.cid != 0"
						:closable="action=='add'"
						@on-close="removeClass">
						{{data._class_name}}
					</Tag>
					<Alert show-icon v-if="data.cid == 0">请拖动排课对象到此</Alert>
				</template>
				<template v-else>
					<Tag type="border" color="yellow" v-if="data.is_trial == 1">{{data.name}}</Tag>
					<template v-else>
						<Tag type="border" color="green" v-if="data.lesson_type == 1 && data.students.length>0">1对1</Tag>
						<Tag type="border" color="green" v-if="data.lesson_type == 2 && data.students.length>0">1对多</Tag>
					</template>
					<Tag 
					:closable="action=='add'"
					@on-close="removeStudent(index)"
					v-for="(s,index) in data.students">
					{{s.student_name}}
					</Tag>
					<Alert show-icon v-if="data.students.length == 0">请拖动排课对象到此</Alert>
				</template>
			</drop>
			<div v-else>
				<template v-if="data.lesson_type == 0 && data.is_trial == 0">
					<Tag type="border" color="blue" v-if="data.cid != 0">班课</Tag>
					<Tag v-if="data.cid != 0">{{data._class_name}}</Tag>
					<Alert show-icon v-if="data.cid == 0">错误排课，请删除本次排课后重新排课</Alert>
				</template>
				<template v-else>
					<Tag type="border" color="yellow" v-if="data.is_trial == 1">{{data.name}}</Tag>					
					<template v-else>
						<Tag type="border" color="green" v-if="data.lesson_type == 1">1对1</Tag>
						<Tag type="border" color="green" v-if="data.lesson_type == 2">1对多</Tag>
					</template>
					<Tag v-for="(s,index) in data.students">
						{{s.student.student_name}}
					</Tag>
					<Alert show-icon v-if="data.students.length == 0">暂无排课对象</Alert>
				</template>
			</div>
        </FormItem>
        <FormItem label="授课科目" v-if="isLessonPackage(data.lid)">
        	<drop 
        	class="drop" 
        	:class="{allowed:isDrag('sj_id')}"
        	@dragover="dragOverSubject" 
        	@drop="dropSubject">
        		<span>{{data.sj_id|subject_name('请从排课条件选择科目')}}</span>
        	</drop>
        </FormItem>
        <FormItem :label="label_teach_teacher">
        	<drop 
        	class="drop" 
        	:class="{allowed:isDrag('eid')}"
        	@dragover="dragOverTeacher" 
        	@drop="dropTeacher"
        	style="display: inline-block;"
        	>
        		<Tag 
        		closable 
        		@on-close="data.teach_eid = 0"
        		>{{data.teach_eid|employee_name('从排课条件选择')}}
        		</Tag>
        	</drop>
        	或
        	<select-employee 
        		:rid="1" 
        		size="small" 
        		clearable
        		v-model="data.teach_eid" 
        		style="margin-left: 10px; width: 120px"
        		placeholder="从弹出框选择"
        		@on-selected="checkEmployee"
        		>
    		</select-employee>
        </FormItem>
        <FormItem :label="'授课'+label_secteacher">
        	<select-employee 
        		:rid="2" 
        		size="small" 
        		clearable
        		v-model="data.second_eids" 
        		style="margin-left: 16px; width: 120px"
        		placeholder="从弹出框选择"
        		>
    		</select-employee>
        </FormItem>

        <FormItem label="授课教室">
        	<drop 
        	class="drop"
        	:class="{allowed:isDrag('cr_id')}" 
        	@dragover="dragOverClassroom" 
        	@drop="dropClassroom"
        	style="display: inline-block;"
        	>
        		<Tag
        		closable
        		@on-close="data.cr_id = 0"
        		>
        		{{data.cr_id|classroom_name('从排课条件选择')}}
        		</Tag>
        	</drop>
        	或
        	<select-class-room-two 
        		size="small" 
        		clearable
        		v-model="data.cr_id" 
        		style="margin-left: 10px;width: 120px"
        		placeholder="从弹出框选择"
        		@selected="checkClassroom"
        		>
    		</select-class-room-two>
        </FormItem>
	    
        <Form-item prop="tb_id" label="授课内容" v-help="'选择了授课内容只能单次排课'" v-if="enable_tbs">
			<select-textbook 
				size="small"	
				v-model="data.tb_id" 
				placeholder="请选择教材" 
				@selected="selectTb"
				style="margin: 0 16px;width: 160px"
				>
			</select-textbook>
			<Select v-model="data.tbs_id" size="small" placeholder="请选择章节" style="width: 160px">
				<Option 
					:value="item.tbs_id" 
					v-for="item in sectionData" 
					:key="item.sort"
					>
					第{{item.sort}}章 {{item.section_title}}
				</Option>
			</Select>
		</Form-item>

        <FormItem label="扣课时数">
        	<InputNumber v-model="data.consume_lesson_hour" style="width:60px;margin-left: 15px;"></InputNumber>
			<span class="ml-2">课时</span>
        </FormItem>

	    <FormItem label="循环排课" v-if="mode == 'add'||action=='add'">	    	
			<i-switch v-model="data.isloop" :true-value="1" :false-value="0" :disabled="data.tb_id>0"  style="margin-left: 15px;"></i-switch>
			<RadioGroup v-model="week_type" type="button">
				<Radio label="0">单双周</Radio>
				<Radio label="1">单周</Radio>
				<Radio label="2">双周</Radio>
			</RadioGroup>
			<div class="row" v-if="data.isloop == 1">
				<div class="col-xs-6">
					<Input 
					v-model="data.loop_times"
					@keyup.native="validNumber"
					>
				        <span slot="prepend">同时段按周循环排</span>
				        <span slot="append">次</span>
				    </Input>
				</div>
				<div class="col-xs-4 ml-2">
		    		<Button size="small" @click="pre_loop_arranges">预排</Button>
		    	</div>
		   </div>
	    </FormItem>
	    
	    <loop-arrange-modal :data="data" ref="loop_arranges" :week-type="week_type"></loop-arrange-modal>
	</Form>
</template>
<script>
import Vue from 'vue'
import moment from 'moment'
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import loopArrangeModal from './loop-arrange-modal.vue'
import SelectEmployee from 'c%/SelectEmployee.vue'
import SelectClassRoomTwo from 'c%/SelectClassRoomTwo.vue'
import SelectTextbook from 'c%/SelectTextbook.vue'

export default {
	name:'arrangeForm',
	mixins:[common,globals],
	components:{
		loopArrangeModal,
		SelectEmployee,
		SelectClassRoomTwo,
		SelectTextbook
	},
	props:{
		action:{
			type:String,
			default:'add',
			validator(value){
				return oneOf(value,['add','edit'])
			}	
		},
		labelWidth:{
			type:Number,
			default:80
		},
		refs:{
			type: Object,
			default(){
				return {}
			}
		},
		data:{
			type:Object,
			default(){
				return {
					lesson_type:-1,
					lid:0,
					cid: 0,
					name:'',
					_class_name:'',
					sj_id:0,
					int_day:'',
					int_start_hour:'',
					teach_eid:0,
					second_eids:[],
					second_eid:0,
					cr_id:0,
					isloop:0,
					loop_times:0,
					loop_arranges:[],
					tb_id: 0,
					tbs_id: 0,
					students:[
                    ],
                    consume_lesson_hour: 0
				}
			}
		},
		rules:{
			type:Object,
			default(){
				return {}
			}
		},
		mode:{
			type:String,
			default:'add'
		}
	},
	data () {
		return {			
			week_type: '0',
			sectionData: []
		}
	},
	mounted () {
		if(this.data.tb_id > 0) {
			this.get_textbook_section()
		}
	},
	watch: {
		'data.loop_times': function (val) {			
			this.loopArrange()
		},
		'data.cr_id': function (val) {			
			this.loopArrange()
		},
		'data.teach_eid': function (val) {			
			this.loopArrange()
		},
		'data.students': function (val) {
			this.loopArrange()
		},
		'data.cid': function (val) {
			this.loopArrange()
		},
		week_type: function (val) {
			this.loopArrange()
		}
	},
	methods:{
		checkEmployee(selected) {
			let disable = this.refs.condition.isTeacherDisabled({eid:selected.eid})
			if(disable) {
				this.$nextTick(() => {
					this.data.teach_eid = 0
					this.$Message.error('该时段教师已有排课')
				})
			}
		},
		checkClassroom(selected) {
			let disable = this.refs.condition.isClassRoomDisabled({cr_id:selected.cr_id})
			//console.log(disable)
			if(disable) {
				this.$nextTick(() => {
					this.data.cr_id = 0
					this.$Message.error('该时段教室已有排课')
				})
			}
		},
		loopArrange () {
			if(this.isloop){
				this.$r('loop_arranges').pre_loop_arranges()				
			}
		},
		dateChange (val) {
			if(val){
				this.data.int_day = moment(val).format('YYYYMMDD')
			}
		},
		onChange (val) {
			this.data.int_start_hour = val.split(',')[0]
			this.data.int_end_hour = val.split(',')[1]			
		},
		validNumber(e){
			this.data.loop_times = util.int(this.data.loop_times.toString().replace(/[^\d]+/g,''))
			this.checkLoopTimes()
		},
		checkLoopTimes(){
			let remain_times = 0
			let arr_times = []
			if(this.lesson_type == 0){
				remain_times = this.data._remain_arrange_times
			}else if(this.lesson_type == 1){
				remain_times = this.data.students[0]._remain_arrange_times
			}else{
				this.data.students.forEach(s=>{
					arr_times.push(s._remain_arrange_times)
				})
				remain_times = Math.max.apply(null,arr_times)
			}
			if(remain_times > 1 && this.data.loop_times > remain_times -1){
				this.data_loop_times = remain_times -1
			}
		},
		check(){
			return this.$form('form').check()
		},
		pre_loop_arranges(){
			this.$r('loop_arranges')
			.show('排课预览','add')	
		},
		isLessonPackage(lid){
			let lesson = this.getLessonObj(lid)
			if(!lesson){
				return false
			}
			return lesson.is_package == 1
		},
		isDrag(field){
			return this.$store.state.drag.field === field
		},
		dragOverObject(data){
			if(data.field != 'object'){
				event.dataTransfer.dropEffect = 'none';
			}else{
				if(data.lesson_type == 2 && this.data.students.filter(item=>item.sid == data.value.sid).length > 0){
					event.dataTransfer.dropEffect = 'none';
				}
			}
		},
		dropObject(d){
			this.setTeachObject(d)
		},
		dragOverTeacher(data,event){
			if(data.field != 'eid' || data.disabled){
				event.dataTransfer.dropEffect = 'none';
			}

		},
		dropTeacher(data){
			this.data.teach_eid = data.value
		},
		dragOverClassroom(data,event){
			if(data.field != 'cr_id' || data.disabled){
				event.dataTransfer.dropEffect = 'none';
			}
		},
		dropClassroom(data){
			this.data.cr_id = data.value
		},
		dragOverSubject(data,event){
			if(data.field != 'sj_id'){
				event.dataTransfer.dropEffect = 'none';
			}
			let lesson = this.getLessonObj(this.data.lid)
			if(lesson && lesson.sj_ids.indexOf(data.value) === -1){
				event.dataTransfer.dropEffect = 'none';
			}
		},
		dropSubject(data){
			this.data.sj_id = data.value
		},
		setTeachObject(d){
			let data = d.value
			this.data.lesson_type = d.lesson_type
			if(d.lesson_type == 0){
				this.data.cid         = data.cid
				this.data._class_name = data.class_name
				this.data.sj_id       = data.sj_id
				this.data.is_trial    = 0
				this.data.lid         = data.lid
				this.data._lesson_times = data.lesson_times
				this.data._arrange_times = data.arrange_times
				this.data._remain_arrange_times = util.div(data.lesson_times,data.arrange_times)
				if(this.data.students.length > 0){
					this.data.students.splice(0,this.data.studnets.length)
				}
			}else if(d.lesson_type == 1){
				this.data.cid         = 0
				this.data.is_trial    = 0
				this.data.lid         = data.lid
				this.data.students.splice(0,1)
				this.data.students.push({
					sid:data.sid,
					lid:data.lid,
					student_name:data.student.student_name,
					int_day:this.data.int_day,
					int_start_hour:this.data.int_start_hour,
					int_end_hour:this.data.int_end_hour,
					_lesson_times:data.lesson_times,
					_remain_arrange_times:data.remain_arrange_times,
					_arrange_times:util.div(data.lesson_times,data.remain_arrange_times)
				})
			}else{
				this.data.cid         = 0
				this.data.is_trial    = 0
				this.data.lid         = data.lid
				this.data.students.push({
					sid:data.sid,
					lid:data.lid,
					student_name:data.student.student_name,
					int_day:this.data.int_day,
					int_start_hour:this.data.int_start_hour,
					int_end_hour:this.data.int_end_hour,
					_lesson_times:data.lesson_times,
					_remain_arrange_times:data.remain_arrange_times,
					_arrange_times:util.div(data.lesson_times,data.remain_arrange_times)
				})
			}
			
		},
		removeStudent(index){
			this.data.students.splice(index,1)
		},
		removeClass(){
			this.data.cid = 0
			this.data._class_name = ''
			this.data.lid = 0
			this.data.sj_id = 0
		},
		selectTb() {
			this.data.tbs_id = 0
			this.sectionData = []
			this.get_textbook_section()
		},
		get_textbook_section() {
			this.$http.get('textbook_sections',{
				params: {
					tb_id: this.data.tb_id,
					pagesize: 1000
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
		}
	},
	computed:{
		time_sections () {
			let int_day = moment(this.data.int_day).format('YYYY-MM-DD'),
				season = this.get_season_by_date(util.new_date(int_day)),
				week_day = util.get_week_day(util.new_date(int_day))
				
			return this.get_time_sections(week_day,season)
		}
	}
}
</script>