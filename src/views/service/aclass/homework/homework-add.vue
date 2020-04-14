<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="650" :mask-closable="false">		
		<template>
			<Form label-position="left">
				<Row>
					<Col span="14">
						<Form-item label="作业对象" :label-width="80" class="mr-4 mb-2">
							<select-object clearable v-model="info" :action="modal$.action" @initHomeWorkTask="initHomeWorkTask" @hideHomeWorkTask="hideHomeWorkTask"></select-object>
						</Form-item>
					</Col>
					<Col span="10">
						<Form-item :label="label_teach_teacher" :label-width="100" class="mb-2">
							<select-employee v-model="info.eid" :rid="1" clearable></select-employee>
						</Form-item>
					</Col>
				</Row>
			</Form>
			<Form label-position="top">		
				<div v-if="isSelectObject" style="float:right;">
					<span>当前模板：{{homework_task_tpl.htts_name||'-'}}</span>
					<a class="text-primary" @click="toggleHomeWorkTaskTpl" v-if="enable_homework_task_tpl">切换</a>
				</div>
				<Form-item label="作业内容" label-position="top" class="mb-2">
					<ueditor 
		        		class="ueditor" 
		        		ref="ueditor" 
		        		v-model="info.content" 
		        		:ueditor-config="ueconfig">
	        		</ueditor>	
				</Form-item>	
			</Form>
			<Form>
				<Form-item>
					<review-upload v-model="info.homework_attachment" ref="upload">
						作业附件
					</review-upload>
				</Form-item>
			</Form>
			<Form label-position="left" :label-width="80">
				<Row>
					<Col span="12">
						<Form-item label="截止日期" class="mr-4 mb-2">
							<DatePicker 
								type="date" 
								:value="info.deadline|int_date" 
								@on-change="timeChange" 
								placeholder="请选择日期"
								style="width: 100%"
								>
							</DatePicker>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="备注" class="">
							<Input v-model="info.remark" placeholder="仅自己可见"></Input>
						</Form-item>
					</Col>
				</Row>
			</Form>
		</template>
		<div slot="footer">
			<Checkbox v-model="info.is_push" class="pull-left mt-2 text-primary">  布置并推送作业</Checkbox>
			
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import Ueditor from 'c%/Ueditor'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	import SelectObject from './select-object.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	const emptyObject = {
		lid: 0,
		ca_id: 0,
		sids: [],
		sid: 0,
		cid: 0,
		eid: 0,
		remark: '',
		is_regular: 0,
		is_push: true,
		deadline: moment(new Date()).add(7,'days').format('YYYYMMDD'),
		content: '',
		homework_attachment: [],
		lesson_type: -1,
		_class_name: ''
	}
	
	export default{
		mixins: [ modal,common,globals ],
		components: {
			Ueditor,
			SelectObject,
			ReviewUpload,
			SelectEmployee
		},
		props: {
			caId:{
				type: Number,
				default: 0
			},
			arrange: {
				type: Object,
				default: ()=> {
					return {}
				}
			}
		},
		data () {
			return {
				info: util.copy(emptyObject),
				ht_id: 0,
				isSelectObject: false,
				homework_task_tpl_name: '',
				homework_task_tpl: {
					htts_id: 0,
					htts_name: ''
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					if(this.modal$.action=='add'){
						this.info = util.copy(emptyObject)
						this.info.eid = this.eid$
						if(!_.isEmpty(this.arrange)) {
							this.setInfoByArrange(this.arrange)
						}
					}else{
						this.initInfo()	
					}
				}
			}
		},		
		methods: {
			initHomeWorkTask (homework_task_tpl){
				this.isSelectObject = true
				this.homework_task_tpl.htts_id = homework_task_tpl.htts_id
				this.homework_task_tpl.htts_name = homework_task_tpl.name
				
				this.homework_task_tpl_setting = JSON.parse(homework_task_tpl.setting)

				if(typeof this.homework_task_tpl_setting.content === 'undefined'){
					this.homework_task_tpl_setting = JSON.parse(JSON.parse(homework_task_tpl.setting))
				}

				this.info.homework_attachment = this.homework_task_tpl_setting.attachements
				this.info.content = this.homework_task_tpl_setting.content
			},
			hideHomeWorkTask (){
				this.isSelectObject = false
			},
			toggleHomeWorkTaskTpl() {
				this.$Modal.open('components/SelectHomeWorkTaskTplModal.vue@modal',{
					props:{
						htts_name: this.homework_task_tpl.htts_name,
						htts_id: this.homework_task_tpl.htts_id
                    },
	                on: {
	                    'on-select':(homework_task_tpl)=>{
							this.initHomeWorkTask(homework_task_tpl)
                        }
	                }
	            })
	            .then(modal => {
	                modal.show('选择作业模板')
	            })
			},
			timeChange (val) {
				this.info.deadline = moment(val).format('YYYYMMDD')
			},
			initInfo () {
				let ht_id = this.ht_id
				if(ht_id){
					this.$rest('homework_tasks/'+ht_id).get()
					.success(data=>{
						this.info = data
					})
				}
			},
			setInfoByArrange(arrange) {
				this.info.ca_id = arrange.ca_id
				this.info.lesson_type = arrange.lesson_type
				this.info.lid = arrange.lid
				this.info.one_class = arrange.one_class
				this.info.students = arrange.students
				this.info.is_regular = arrange.is_regular
				if(arrange.lesson_type==0) {
					this.info.cid = arrange.cid
					this.info.sids = []
				}else{
					this.info.cid = 0
					if(arrange.students.length) {
						if(arrange.lesson_type==1) {
							this.info.sid = arrange.students[0].sid
						}else{
							arrange.students.forEach(s => {
								this.info.sids.push(s.sid)
							})
						}
					}
				}
			},
			ok () {
				let [method,uri,message] = this.modal$.action=='add'?['post','homework_tasks','布置成功']:['put','homework_tasks/'+this.info.ht_id,'修改成功']
				
				if(this.info.lesson_type==-1){
					this.$Message.error('请选择作业对象')
					return
				}
				if(this.info.eid==0) {
					this.$Message.error(this.label_teach_teacher)
					return
				}
				if(/^\s*$/.test(this.info.content)){
					this.$Message.error('请输入作业内容')
					return
				}
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(message)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'布置失败！')
				})
			},
		},
		computed: {	
			ueconfig(){
	            return {
	                toolbars: [
	                    [
	                    'link', 
	                    'inserttable',
	                    'spechars', 
	                    'justifyleft', 
	                    'justifyright', 
	                    'justifycenter', 
	                    'justifyjustify', 
	                    'undo', 
	                    'redo', 
	                    'bold']
	                ],
	                elementPathEnabled: false,
	                wordCount: false,           
	                initialFrameHeight: 300,
	                initialFrameWidth: 620,
	                enableAutoSave: false,
	                autoHeightEnabled: true,
	                zIndex: 2999,
	            }
	        }
		}
	}
</script>

<style scoped>
.ivu-select-dropdown{
    z-index: 10000;
}
</style>