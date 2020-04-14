<template>
	<Modal v-drag-modal :mask-closable="false" width="550" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
		<template v-if="modal$.show">
			<Form ref="form" :label-width="100" :model="info" :rules="rules" class="px-4">
				<Form-item label="试听班名称" prop="name">					
		            <Input 
			            v-model="info.name" 
			            clearable 
			            :disabled="disabled"
			            placeholder="请输入试听班名称">
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
			</Form>
		</template>
		<div slot="footer">
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
	students:[]
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
					{required:true, type:'string',message:'请输入试听班名称',trigger:'change'}
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
			ts_array: []
		}
	},
	watch: {
		'modal$.show':{
            handler:function(val){
            	if(val&&this.modal$.action == 'add'){
            		this.info = util.copy(emptyObject)
            		this.ts_array.splice(0,this.ts_array.length)
        		}
            }
       },
    },
	computed:{		
        disabled () {
        	return this.info.is_attendance>0
        }
	},
	methods:{
		ok () {
			if(this.modal$.action == 'select') {
				let obj = util.copy(this.info)
				obj.int_day = util.format_int_day(this.info.int_day)
				obj.int_start_hour = util.format_int_hour(this.info.int_start_hour)
				obj.int_end_hour = util.format_int_hour(this.info.int_end_hour)
				this.$emit('on-save-success',obj)
				this.close()
			}else{
				this.save()
			}
		},
		save () {
			let [method,uri,msg] = this.modal$.action=='add'?
				['post','course_arranges','试听排课成功']:
				['put','course_arranges/'+this.info.ca_id,'试听调课成功']

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
					this.error(response.body.message)
				})
			})
			
		},
		check () {
			return new Promise((resolve,reject)=>{
				if(this.info.name===''){
					this.$Message.error('请输入试听班名称')
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