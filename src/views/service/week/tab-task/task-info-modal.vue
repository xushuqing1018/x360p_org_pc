<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="600" :mask-closable="false">
		<Form v-if="modal$.show" :model="info" :rules="rules" :label-width="80" ref="form">
            <RadioGroup v-model="type" class="mb-3" type="button">
        			<Radio :label="2">班级服务</Radio>
        			<Radio :label="1">个性服务</Radio>
    			</RadioGroup>
			<Form-item label="服务对象" v-if="modal$.action=='add'" prop="fwdx_id">
				<select-class v-model="info.cid" v-if="type==2"></select-class>
				<select-student v-model="info.sid" v-if="type==1"></select-student>
			</Form-item>
			<Form-item label="服务类型" prop="st_did" v-help="'服务类型请在「系统」「数据字典」设置'" v-if="!is_query_did">
				<Select v-model="info.st_did" v-if="modal$.action=='add'">
					<Option :value="item.did" v-for="item in service_type">{{item.title}}</Option>
				</Select>
				<template v-else>
					<span v-if="info.cid > 0">{{info.st_did|dict_title('class_service_type')}}</span>
					<span v-else>{{info.st_did|dict_title('student_service_type')}}</span>
				</template>
			</Form-item>
			<Form-item label="完成日期" prop="int_day">
				<DatePicker v-if="modal$.action=='add'" 
				:value="now_time"
				@on-change="timeChange" 
				type="datetime" 
				format="yyyy-MM-dd HH:mm" 
				placeholder="请选择" 
				style="width: 200px">
				
				</DatePicker>
				<span v-else>{{item.int_day|int_date}} {{item.int_hour|int_hour}}</span>
			</Form-item>
			<Form-item label="服务内容" prop="content">
				<Input type="textarea" v-model="info.content" placeholder="请输入服务内容" :autosize="{minRows: 3,maxRows: 4}"></Input>
			</Form-item>
			<Form-item label="相关附件" prop="service_record_file">
				<file-upload v-model="info.service_record_file">
					相关附件
				</file-upload>
			</Form-item>
			<Form-item label="完成人员" prop="eid">
				<select-employee v-model="info.eid"></select-employee>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import FileUpload from 'c%/ReviewUpload.vue'
	import SelectClass from 'c%/SelectClass'
	import SelectStudent from 'c%/SelectStudent'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	const emptyObject = {
		sid: 0,
		cu_id: 0,
		cid: 0,
		object_type: 2,
		st_did: 0,
		int_day: '',
		int_hour: '',
		is_push: true,
		rel_id: 0,
		url: '',
		content: '',
		eid: 0,
		student_nums: 0,
		service_record_file: [],
		fwdx_id:0
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			FileUpload,
			SelectClass,
			SelectStudent,
			SelectEmployee
		},
		props: {
			intDay: {
				type: [Number,String],
				default: ''
			}
		},
		data () {
			return {
                type:2,
				name: '',
				now_time:'',
				info: util.copy(emptyObject),
				rules: {
					int_day: [
						{ required:true, message: '请选择完成时间', trigger:'change' }
					],
					st_did: [
						{ required:true, type:'number', min:1, message: '请选择服务类型', trigger:'change' }
					],
					fwdx_id: [
						{ required:true, type:'number', min:1, message: '请选择服务对象', trigger:'change' }
					]
				},
				is_query_did: false
			}
		},
		watch: {
			'modal$.show':function(v) {
				if(v&&this.modal$.action=='add') {
					this.info.eid = this.eid$
					this.info.sid = this.sid
					this.info.cid = this.cid
					this.info.object_type = this.type
					if(this.intDay) {
						let hs = moment().format('HH:mm')
						this.now_time = this.intDay + ' '+hs
						this.format_time(this.now_time)
					}else{
						this.lazy_init_day()
					}
				}
			},
			'type':function(){
				if (this.type == 1) {
					this.info.cid = 0
				}else{
					this.info.sid = 0
				}
				this.info.fwdx_id = 0
			}
		},
		computed:{
			service_type(){
				if(this.type == 1){
					return this.dicts('student_service_type')
				}
				return this.dicts('class_service_type')
			}
		},
		methods: {
			format_time(val) {
				this.info.int_day = util.format_int_day(val.substring(0,10))
				this.info.int_hour = util.format_int_hour(val.substring(11,16))
			},
			onModalOpen(query){
				if(query.did !== undefined) {
					this.info.st_did = Number(query.did)
					this.is_query_did = true
				}
			},
			lazy_init_day(){
				setTimeout(()=>{
					if(this.modal$.action == 'add'){
						this.now_time = moment().format('YYYY-MM-DD HH:mm')
						this.info.int_day = util.format_int_day(this.now_time.substr(0,10))
						this.info.int_hour = util.format_int_hour(this.now_time.substr(11,5))
						
					}
				},1000)
			},
			timeChange (val) {
				if(val){
					this.info.int_day = util.format_int_day(val.substr(0,10))
					this.info.int_hour = util.format_int_hour(val.substr(11,5))					
				}
			},
			ok () {			
				if(this.info.cid > 0){
					this.info.fwdx_id = this.info.cid
				}
				if(this.info.sid > 0){
					this.info.fwdx_id = this.info.sid
				}
				
				this.$form('form').check().then(()=>{					
					this.$rest('service_records').post(this.info)
					.success(data=>{
						this.$Message.success('添加成功！')
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'添加失败~')
					})
				})
			}
		}
	}
</script>

<style>
</style>