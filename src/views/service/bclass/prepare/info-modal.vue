<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="640">		
		<Form :label-width="80">
			<Form-item label="备课对象">
				<prepare-object 
					v-model="info" 
					:action="modal$.action" 
					@set-arrange-info="setArrangeInfo" 
					@clear-arrange="clearArrange"
					clearable>
				</prepare-object>
			</Form-item>
			<Row>
				<Col span="12">
					<Form-item label="上课日期">
						<DatePicker 
							class="x-dropdown-index"
							:value="format_day(info.int_day)" 
							@on-change="info.int_day = $event" 
							format="yyyy-MM-dd" 
							type="date" 
							placeholder="请选择上课日期"
							style="width:100%"
							:readonly="info.ca_id>0"
							:options="options">
						</DatePicker>
					</Form-item>
				</Col>
				
				<Col span="12">
					<Form-item label="上课时间">
						<select-time-section 
							clearable
							class="x-dropdown-index"
							:value="ts_array" 
							:date="info.int_day" 
							@on-change="changeTimeSection"
							:readonly="info.ca_id>0"
							placeholder="请选择上课时间段">
						</select-time-section>
					</Form-item>
				</Col>
			</Row>
			<Form-item label="备课标题">
				<Input v-model="info.title" placeholder="请输入备课标题"></Input>
			</Form-item>
			<Form-item label="备课科目" v-if="subjects.length>1">
				<Select v-model="info.sj_id" class="x-dropdown-index">
					<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
				</Select>
			</Form-item>
			<Form-item label="备课内容">
				<ueditor 
	        		class="ueditor" 
	        		ref="ueditor" 
	        		v-model="info.content" 
	        		:ueditor-config="ueconfig">
        		</ueditor>
			</Form-item>
			<Form-item label="备课附件">
				<review-upload v-model="info.course_prepare_attachment" ref="upload">
					备课附件
				</review-upload>
			</Form-item>
		</Form>		
		<div slot="footer">
			<div class="pull-left text-primary" v-if="modal$.action=='add'">
				<Checkbox class="mb-0" v-model="info.is_push" :true-value="1" :false-value="0">推送给排课学员</Checkbox>
			</div>
			
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
	import PrepareObject from './prepare-object.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	
	const emptyObject = {
		bid: 0,
		int_day: 0,
		int_start_hour: 0,
		int_end_hour: 0,
		teach_eid: 0,
		lesson_type: -1,
		cid: 0,
		sids: [],
		sid: 0,
		title: '',
		content: '',
		is_push: 1,
		lid: 0,
		sj_id: 0,
		ca_id: 0,		
		course_prepare_attachment: []
	}
	
	export default{
		mixins: [ modal,common,globals ],
		components: {
			Ueditor,
			ReviewUpload,
			PrepareObject,
			SelectTimeSection
		},
		props: {
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
				ts_array: [],
				cp_id: 0,
				options: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                },
			}
		},
		watch: {
			'info.lid': function (val) {
				if(this.subjects.length){
					this.info.sj_id = this.subjects[0].sj_id 
				}
			},
			'modal$.show': function (val) {
				if(val){
					if(this.modal$.action == 'add'){
						this.info = util.copy(emptyObject)
						this.ts_array = []
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
			initInfo () {
				let cp_id = this.cp_id
				if(cp_id){
					this.$rest('course_prepares/'+cp_id).get()
					.success(data=>{
						this.info = data
						this.ts_array = [this.$filter('int_hour')(this.info.int_start_hour),this.$filter('int_hour')(this.info.int_end_hour)]
					})
				}
			},
			clearArrange () {
				this.info.ca_id = 0
				this.info.teach_eid = this.eid$
			},
			setInfoByArrange(arrange) {
				this.setArrangeInfo(arrange)
				this.info.ca_id = arrange.ca_id
				this.info.lesson_type = arrange.lesson_type
				this.info.lid = arrange.lid
				this.info.one_class = arrange.one_class
				this.info.students = arrange.students
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
			setArrangeInfo (arrange) {
				this.info.int_day = arrange.int_day
				this.info.int_start_hour = arrange.int_start_hour
				this.info.int_end_hour = arrange.int_end_hour
				this.info.teach_eid = arrange.teach_eid
				this.info.sj_id = arrange.sj_id
				
				this.ts_array = [this.$filter('int_hour')(arrange.int_start_hour),this.$filter('int_hour')(arrange.int_end_hour)]								
			},
			ok () {
				if(this.check()){
					let params = util.copy(this.info)					
					params.bid = this.bid$
					
					let [uri,method,msg] = this.modal$.action=='add'?['course_prepares','post','添加成功！']:['course_prepares/'+this.info.cp_id,'put','修改成功！']
					
					this.$rest(uri)
					[method](params)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'操作失败')
					})
					
				}
			},
			check () {
				let info = this.info
				if(info.lesson_type==-1){
					this.$Message.error('请选择备课对象')
					return false
				}
				if(!info.int_day){
					this.$Message.error('请选择上课日期')
					return false
				}
				if(!info.int_start_hour||!info.int_end_hour){
					this.$Message.error('请选择上课时间')
					return false
				}
				if(/^\s*$/.test(info.title)){
					this.$Message.error('请输入备课标题')
					return false
				}
				if(/^\s*$/.test(info.content)){
					this.$Message.error('请输入备课内容')
					return false
				}
				
				return true
			},
			dateChange (val) {
				this.info.int_day = moment(val).format('YYYYMMDD')
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
		},
		computed: {
			subjects () {
				let list = this.$store.state.gvars.subjects,
					lessons = this.$store.state.gvars.lessons,
					lid = this.info.lid,
					sj_ids = []
				
					if(lid>0){
						let obj = lessons.find(l=>l.lid==lid)||{}
						if(obj.sj_id>0){
							sj_ids.push(obj.sj_id||0)
						}else{
							sj_ids = obj.sj_ids||[]
						}
					}
					
				return list.filter(item=>sj_ids.indexOf(item.sj_id)>-1)
			},
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
	                initialFrameHeight: 150,
	                initialFrameWidth: 520,
	                enableAutoSave: false,
	                autoHeightEnabled: true,
	                zIndex: 2999,
	            }
	        }
		}
	}
	
</script>

<style lang="less">
	.x-dropdown-index{
		.ivu-select-dropdown,
		.ivu-select-dropdown .section-dropdown{
			z-index: 6000;			
		}
	}
</style>