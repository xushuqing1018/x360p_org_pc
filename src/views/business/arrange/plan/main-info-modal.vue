<template>
	<Modal v-drag-modal v-model="modal$.show" :mask-closable="false" :title="modal$.title" width="700">
		<Form :label-width="100">
			<Form-item label="计划名称" class="mb-2 ivu-form-item-required">
				<Input v-model="info.name" placeholder="请输入计划名称" style="width: 440px;"></Input>
			</Form-item>
			<Form-item label="计划类型" class="mb-2 ivu-form-item-required" v-help="type_help">
				<RadioGroup v-model="info.schedule_type" type="button" @on-change="changeScheduleType">
					<Radio :label="0" :disabled="modal$.action=='edit'">按授课对象</Radio>
					<Radio :label="1" :disabled="modal$.action=='edit'">按老师</Radio>
					<Radio :label="2" :disabled="modal$.action=='edit'" v-if="enable_type2_bk">按科目</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="授课对象" class="mb-2 custom-form-item-required" v-if="info.schedule_type==0">
				<select-object 
		            ref="object" 
		            mode="arrange" 
		            clearable
		            @on-selected="setTeachObject" 
		            @on-clear="clearSelected"
		            style="width: 440px;"
		            v-if="modal$.action=='add'"
		            >
	            </select-object>
	            <span v-else>{{info._object_name}}</span>
			</Form-item>
			<template v-else>
				<Form-item :label="label_teach_teacher" class="mb-2 custom-form-item-required" v-if="info.schedule_type==1">
					<select-employee 
						v-model="info.eid" 
						:rid="1" 
						:limit-per="false" 
						clearable 
						style="width: 440px;"
						v-if="modal$.action=='add'"
						>
					</select-employee>
					<span v-else>{{info._object_name}}</span>
				</Form-item>
				<Form-item label="授课科目" class="mb-2 custom-form-item-required" v-if="info.schedule_type==2">
					<select-subject 
						v-model="info.sj_id" 
						clearable 
						style="width: 440px;"
						v-if="modal$.action=='add'"
						>
					</select-subject>
					<span v-else>{{info.sj_id|subject_name}}</span>
				</Form-item>
				<Row>
					<Col span="12">
						<Form-item label="授课类型" class="mb-2 custom-form-item-required">
							<RadioGroup v-model="info.lesson_type" type="button" @on-change="changeLessonType">
								<Radio :label="1" :disabled="modal$.action=='edit'">一对一</Radio>
								<Radio :label="2" :disabled="modal$.action=='edit'">一对多</Radio>
							</RadioGroup>
						</Form-item>
					</Col>
					<Col span="12">
						<Form-item label="授课人数" class="mb-2 custom-form-item-required">
							<InputNumber v-model="info.student_limit" :min="1" :max="info.lesson_type==1?1:Infinity"></InputNumber>
						</Form-item>
					</Col>
				</Row>
			</template>
			<Form-item label="开始日期" class="mb-2 custom-form-item-required">
				<date-picker 
					:value="info.start_int_day" 
					@on-change="info.start_int_day = $event" 
					format="yyyy-MM-dd"
					style="width: 220px;"
					>
				</date-picker>
			</Form-item>
			<Form-item label="结束方式" class="mb-2 custom-form-item-required">
				<Select v-model="info.end_type" style="width:220px">
					<!--<Option value="0">不结束</Option>-->
					<Option :value="0">按结束日期</Option>
					<Option :value="1" :disabled="info.schedule_type==1">按排课次数</Option>
				</Select>
				<date-picker 
					:options="disabledEndDate" 
					:value="info.end_int_day" 
					@on-change="info.end_int_day = $event" 
					format="yyyy-MM-dd" 
					v-if="info.end_type==0"
					style="width: 220px;"
					>
				</date-picker>
				<template v-else>
					<InputNumber v-model="info.arrange_times" :min="1" :step="1"></InputNumber>
					<span class="ml-3">次</span>
				</template>
			</Form-item>
			<Form-item label="计划详情" class="mb-2 custom-form-item-required">
				<Button 
					type="primary" 
					size="small"
					:icon="info.schedules.length>0?'edit':'plus'" 
					@click="makePlan">
					{{info.schedules.length>0?'编辑':'制定'}}
				</Button>
				<schedules-table 
					:schedule-type="info.schedule_type" 
					:lesson-type="info.lesson_type" 
					:list="info.schedules" 
					v-if="info.schedules.length>0"
					>
				</schedules-table>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="primary" @click="submitAndPreview" v-if="info.schedules.length&&info.schedule_type==0">保存并预览排课</Button>
			<Button type="primary" @click="submit">保存计划</Button>
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectSubject from 'c%/SelectSubject.vue'
	import SelectObject from 'c%/review/review-object.vue'
	import SchedulesTable from './schedules-table.vue'

	const emptyObject = {
		name: "",
		week_days: [1],
		schedule_type: 0,
		lesson_type: -1,
		student_limit: 1,
		cid: 0,
		lid: 0,
		sj_id: 0,
		sid: 0,
		sids: [],
		eid: 0,
		cr_id: 0,
		second_eids: [],
		start_int_day: moment().format('YYYY-MM-DD'),
		end_int_day: moment().add(7,'days').format('YYYY-MM-DD'),
		arrange_times: 1,
		end_type: 0,
		schedules: [],
		consume_lesson_hour: 1,
		consume_lesson_amount: 0,
		consume_source_type: 1,
		students: [],
		_class_name: '',
		_sj_ids: [],
		is_bk_open: 0,
		int_hour_map: {
			0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[]
		}
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee,
			SelectSubject,
			SelectObject,
			SchedulesTable
		},
		data() {
			return {
				info: {
					schedules:[]
				}
			}
		},
		computed: {
			disabledEndDate () {
				let start_date = new Date(this.info.start_int_day).getTime()
				return { 
					disabledDate (date) {
                    	return date && date.valueOf() < start_date - 86400000;
                	}
				}
			},
			type_help() {
				let msg = '按老师用于约课端约课'
				if(this.enable_type2_bk) {
					msg += ',按科目用于学习管家一对多活动课'
				}
				return msg
			}
		},
		watch: {
			'modal$.show':function(v) {
				if(v&&this.modal$.action=='add') {
					this.info = util.copy(emptyObject)
				}
			}
		},
		methods: {
			check () {
				if(this.info.name === '') {
					this.$Message.error('请填写计划名称')
					return false
				}
				if(this.info.schedule_type==0) {
					if(
						this.info.cid==0 
						&& this.info.sid == 0 
						&& this.info.sids.length == 0
					){
						this.$Message.error('请先选择授课对象!')
						return false
					}
				}else{
					if(this.info.schedule_type == 1 && this.info.eid==0) {
						this.$Message.error('请先选择'+this.label_teach_teacher)
						return false
					}
				}
				if(this.info.schedules.length==0) {
					this.$Message.error('计划详情不能为空')
					return false
				}
				return true
			},
			preview (data) {
				this.$rest('class_schedule_mains').add_url_param(data,'dopreview')
				.post()
				.success(res =>{
					let arranges = res.data
					if(arranges.length==0) {
						this.error('当前规律的排课次数为0 ，请您重新制定计划')
					}else{
						this.showPreviewModal(arranges)
					}
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			showPreviewModal(data) {
				this.$Modal.open('business/arrange/plan/arrange-preview-modal.vue',{
					props: {
						list: data
					},
					on: {
						'on-success': () => {
							this.$emit('on-success')
							this.close()
						}
					}
				})
				.then(modal => {
					modal.show(util.sprintf('排课预览【%s】',this.setTitle()))
				})
			},
			submitAndPreview () {
				if(!this.check()) return
				this.save()
				.then(data => {
					this.preview(data)
				})
			},
			submit () {
				if(!this.check()) return
				this.save()
				.then(data => {
					this.close()
				})
			},
			save () {
				return new Promise((resolve,reject) => {
					let method = this.modal$.action == 'add'?'post':'put'
					let msg = this.modal$.action == 'add'?'保存成功':'编辑成功'
	                let $rest  = this.$rest('class_schedule_mains')
	                if(this.modal$.action != 'add'){
	                    $rest.add_url_param(this.info.csm_id)
                    }
					$rest
					[method](this.info)
					.success(res => {
						resolve(res.data.csm_id)
						this.info.csm_id = res.data.csm_id
						this.modal$.action= 'edit'
						this.$Message.success(msg)
						this.$emit('on-success')
					})
					.error(res => {
						this.error(res.body.message)
						reject()
					})
				})
				
			},
			saveAndGen () {

			},
			changeLessonType (v) {
				if(v==1) {
					this.info.student_limit = 1
				}
			},
			changeScheduleType (v) {
				this.info.schedules = []
				this.info.eid = 0
				this.info.end_type = 0
				if(v==0) {
					this.info.lesson_type = -1
				}else{
					this.clearSelected()
					this.info.lesson_type = v==1?1:2
					this.info.student_limit = v==1?1:10
				}
			},
			makePlan () {
				if(this.info.schedule_type==0) {
					if(
						this.info.cid==0 
						&& this.info.sid == 0 
						&& this.info.sids.length == 0
					){
						this.$Message.error('请先选择授课对象!')
						return
					}
				}

				else if(this.info.schedule_type==1){
					if(this.info.eid==0) {
						this.$Message.error('请先选择'+this.label_teach_teacher)
						return
					}
				}
				else {
					if(this.info.sj_id==0) {
						this.$Message.error('请先选择科目')
						return
					}
				}
				let title = this.info.schedules.length>0?'编辑':'制定'
				this.$Modal.open('business/arrange/plan/info-modal.vue',{
					props: {
						info: this.info
					}
				})
				.then(modal => {
					modal.show(util.sprintf('%s计划【%s】',title,this.setTitle()))
				})
			},
			setTeachObject (selected) {
				let ids = selected.ids
				this.info.lesson_type = selected.type
				this.info.schedules = []
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
							this.info.eid = selected.info.teach_eid
							this.info.second_eids = selected.info.second_eids
							this.info.cr_id = selected.info.cr_id
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
				}
			},
			clearSelected() {
				this.info.lesson_type = -1
				this.info.lid = 0
				this.info.sj_id = 0
				this.info.cid = 0
				this.info._class_name = ''
				this.info._sj_ids = []
				this.info.eid = 0
				this.info.second_eids = []
			},
			setStudents (ids,map_ids) {
				this.info.students = []
				if(ids.length){
					let obj = map_ids[ids[0]]
					if(obj) {
						this.info._sj_ids = obj.sj_ids
						if(obj.sj_ids.length) {
							this.info.sj_id = obj.sj_ids[0]
						} 
					}
					if(this)
					ids.forEach(i=>{
						this.info.students.push(map_ids[i].student.student_name)
					})
				}
			},
			setTitle () {
				let result = ''
				if(this.modal$.action=='add') {
					if(this.info.schedule_type==0) {
						if(this.info.lesson_type==0) {
							result = this.info._class_name
						}else{
							result = this.info.students.join(',')
						}
					}else{
						result = this.$filter('ename')(this.info.eid)
					}
				}else{
					result = this.info._object_name
				}
				return result || this.info.name
			}
		}
	}
</script>