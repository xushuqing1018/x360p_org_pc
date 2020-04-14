<template>
	<Modal v-drag-modal :mask-closable="false" width="550" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="100" :model="info" :rules="rules" class="px-4">
				<Form-item label="试听课名称" prop="name">					
		            <Input 
			            v-model="info.name" 
			            clearable 
			            :disabled="disabled"
			            placeholder="请输入试听课名称">
		            </Input>
				</Form-item>
				<Form-item prop="int_day" label="上课日期">
		            <Date-picker 
	            	:disabled="disabled"
		            type="date"		            
		            :show-week-numbers="true"
		            :value="format_day(info.int_day)"
		            @on-change="info.int_day = $event"
		            format="yyyy-MM-dd"
		            placeholder="选择日期"
		            >		            
		            </Date-picker>
				</Form-item>
				<Form-item prop="ts_array" label="上课时间">
					<select-time-section 
						clearable
						:value="ts_array" 
						:date="info.int_day" 
						@on-change="changeTimeSection"
						placeholder="请选择上课时间段">
					</select-time-section>
				</Form-item>
				<Form-item prop="teach_eid" label="教师">
					<select-employee :disabled="disabled" v-model="info.teach_eid" clearable :rid="1"></select-employee>
				</Form-item>
				<Form-item prop="second_eids" label="助教">
					<select-employee :disabled="disabled" v-model="info.second_eids" clearable :rid="2"></select-employee>
				</Form-item>
				<Form-item prop="sj_id" label="科目">
					<select-subject
						clearable
						:disabled="disabled"
						v-model="info.sj_id"
						placeholder="请选择科目">
					</select-subject>
				</Form-item>
				<Form-item prop="cr_id" label="教室">
					<select-class-room :disabled="disabled" v-model="info.cr_id"></select-class-room>
				</Form-item>
				<Form-item label="忽略冲突" v-if="modal$.action!=='select'">
					<Checkbox v-model="info.ignore_class_cc" :true-value="1" :false-value="0">忽略教室冲突</Checkbox>
					<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师冲突</Checkbox>
				</Form-item>	
				<Form-item prop="student_limit" label="可试听人数">
					<InputNumber v-model="info.student_limit" :step="1" :min="1"></InputNumber>
				</Form-item>
				<template v-if="show_loop">
					<Form-item prop="start_day" label="开始日期">
		        	    <Date-picker 
	            			:disabled="disabled"
							:options="initStartDayOptions"
		        	    	type="date"		            
		        	    	:show-week-numbers="true"
		        	    	:value="format_day(start_day)"
		        	    	@on-change="start_day = $event"
		        	    	format="yyyy-MM-dd"
		        	    	placeholder="选择日期"
		        	    >		            
		        	    </Date-picker>
					</Form-item>
					<Form-item prop="end_day" label="结束日期">
		        	    <Date-picker 
	            			:disabled="disabled"
							:options="initEndDayOptions"
		        	    	type="date"		            
		        	    	:show-week-numbers="true"
		        	    	:value="format_day(end_day)"
		        	    	@on-change="end_day = $event"
		        	    	format="yyyy-MM-dd"
		        	    	placeholder="选择日期"
		        	    >		            
		        	    </Date-picker>
					</Form-item>
				</template>
			</Form>
		</template>
		<div slot="footer">
			<span v-if="modal$.action == 'add' || modal$.action == 'select'">
				<Checkbox class="ml-3" v-model="show_loop" :true-value="1" :false-value="0">
					循环排多次
				</Checkbox>
			</span>
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
const INFO_NAME = '排课'
const INFO_PK_ID = 'ca_id'
const INFO_URL   = 'course_arranges'
const emptyObject = {	
	lesson_type:0,
	lid:0,
	name:'',
	sj_id:0,
	is_attendance:0,
	int_day:'',
	int_start_hour:'',
	int_end_hour:'',
	teach_eid:0,
	second_eid:0,
	second_eids: [],
	is_trial: 1,
	cr_id:0,
	students:[],
	ignore_class_cc:0,
	ignore_class_ec:0,
	student_limit:1
}

import util,{_} from '@/libs/util'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectClassRoom from 'c%/SelectClassRoom'
import SelectEmployee from 'c%/SelectEmployee.vue'
import SelectSubject from 'c%/SelectSubject.vue'
import SelectTimeSection from 'c%/SelectTimeSection.vue'
export default{
	name:'TrialArrangeModal',
	mixins:[modal,common,globals],
	components: {
		SelectEmployee,
		SelectClassRoom,
		SelectSubject,
		SelectTimeSection
	},
	data () {
		return {
			info:util.copy(emptyObject),
			rules: {
				name: [
					{required:true, type:'string',message:'请输入试听课名称',trigger:'change'}
				],
				obj: [
					{required:true, type:'string',message:'请选择日期',trigger:'blur'}
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
				],
				sj_id: [
					{ required: true, type: 'number', message: '请选择科目', trigger: 'change' }
				]
			},
			ts_array: [],
			show_loop:false,
			start_day:'',
			end_day:''
		}
	},
	watch: {
		'modal$.show':{
            handler:function(val){
            	if(val){
            		this.info.ignore_class_cc = this.ignore_class_cc
					this.info.ignore_class_ec = this.ignore_class_ec
        		}
            }
       },
    },
	computed:{		
        disabled () {
        	return this.info.is_attendance>0
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
		initStartDayOptions(){
			let int_day = this.info.int_day
			let options = {
				disabledDate (date) {
					return date.valueOf() <= new Date(int_day)
				}
			}
			return options
		},
		initEndDayOptions(){
			let start_day = this.start_day
			let options = {
				disabledDate (date) {
					return date.valueOf() < new Date(start_day) - 86400000
				}
			}
			return options
		}
	},
	methods:{
		ok () {
			this.check()
			.then(()=>{
				if(this.modal$.action == 'select' || this.modal$.action == 'add'){
					if(this.show_loop){
						if(this.start_day == ''){
							this.$Message.error('请输入开始日期')
							return
						}
						if(this.end_day == ''){
							this.$Message.error('请输入结束日期')
							return
						}
						this.info.start_day = this.start_day
						this.info.end_day = this.end_day
					}
				}
				if(this.modal$.action == 'select') {
					let obj = util.copy(this.info)
					obj.int_day = util.format_int_day(this.info.int_day)
					obj.int_start_hour = util.format_int_hour(this.info.int_start_hour)
					obj.int_end_hour = util.format_int_hour(this.info.int_end_hour)
					if(this.show_loop){
						obj.start_day = util.format_int_day(this.info.start_day)
						obj.end_day = util.format_int_day(this.info.end_day)
					}
					this.$emit('on-save-success',obj)
					this.close()
				}else{
					this.save()
				}
			})
		},
		save () {
			let [method,uri,msg] = this.modal$.action=='add'?
				['post','course_arranges','试听排课成功']:
				['put','course_arranges/'+this.info.ca_id,'试听调课成功']

			this.$rest(uri)
			[method](this.info)
			.success(response=>{
				this.$Message.success(msg)
				this.$emit('save')
				this.close()
			})
			.error(response=>{
				this.error(response.body.message)
			})
			
		},
		check () {
			return new Promise((resolve,reject)=>{
				if(this.info.name===''){
					this.$Message.error('请输入试听课名称')
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
				if(this.info.sj_id==0){
					this.$Message.error('请选择科目')
					reject()
					return
				}
				if(this.info.cr_id==0&&this.info.lesson_type!=1){
					this.$Message.error('请选择上课教室')
					reject()
					return
				}
				resolve()
			})
		},
		cancel () {
			this.info = util.copy(emptyObject)
			this.close()
		},		
		changeTimeSection(event) {
			if(event.length) {
				this.info.int_start_hour = event[0]
				this.info.int_end_hour   = event[1]
			}else{
				this.info.int_start_hour = ''
				this.info.int_end_hour   = ''
			}
		}
	}
}
</script>