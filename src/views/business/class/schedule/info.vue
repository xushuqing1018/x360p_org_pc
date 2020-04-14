<style lang="less">
@import '~@/style/mixin.less';
.schedule-modal{
	position:absolute;
	z-index:21;
	top:90px;
	width:560px;
	background:#fff;
	.rounded(5px);
	.drop-shadow();
}
table.class-list{
	margin-top:10px;
}
.table-list-wrap{
	max-height:400px;
	overflow-y:auto;
}
</style>
<template>
<div class="schedule-modal" v-show="modal$.show" v-drag-modal="{hs:'.modal-header'}">
	<div class="modal-header">
		{{headerText}}
	</div>
	<template v-if="modal$.show">
		<template v-if="modal$.action == 'add'">
			<div class="modal-body">
				<Row>
					<Col span="16">
						<div class="schedule-type">
							<ButtonGroup>
						        <Button @click="info.$new = true" :type="info.$new == true?'primary':'ghost'">新建班级</Button>
						        <Button @click="info.$new = false" :type="info.$new != true?'primary':'ghost'">已排班级</Button>
						    </ButtonGroup> 
					    </div>
				    </Col>
				    <Col span="8">
				    	<div class="condition-filter" v-if="!info.$new">
		                	<Input size="small" v-model="key.classes" icon="search" placeholder="输入班级名称过滤"></Input>
		                </div>
		                <div class="condition-filter" v-else>
							<Checkbox v-model="isAutoClassName">自动班级命名</Checkbox>
		                </div>
				    </Col>
			    </Row>
			    <div class="m-t" 
			    v-if="info.$new == true"
			    >
			    	<schedule-form 
			    	ref="formAdd" 
			    	:label-width="80" 
			    	:data="info" 
			    	:rules="addRules"
			    	@on-select-lesson="lessonSelected"
			    	>
			    	</schedule-form>
			    </div>
			    <schedule-classes-list
			    	:info="info"
			    	:data="scheduleClasses"
			    	:page-size="10"
			    	v-else
			    >
			    </schedule-classes-list>
			</div>
			<div class="modal-footer">
				<Button type="ghost" :disabled="saving" @click="cancel">取消</Button>
				<Button type="primary" :loading="saving" @click="save">确定</Button>
			</div>
		</template>
		<template v-else>
			<div class="modal-body">
				<Row>
					<Col span="16">
						<div class="schedule-type">
							<ButtonGroup>
						        <Button @click="schedule.tab = 'basic'" :type="schedule.tab == 'basic'?'primary':'ghost'">基本信息</Button>
						        <Button @click="schedule.tab = 'arranges'" :type="schedule.tab =='arranges' ?'primary':'ghost'">排课详情</Button>
						        <Button @click="schedule.tab = 'students'" :type="schedule.tab == 'students' ?'primary':'ghost'">学员列表</Button>
						    </ButtonGroup> 
					    </div>
				    </Col>
				    <Col span="8">
				    	<Button v-if="schedule.tab == 'arranges'" :loading="schedule.saving" class="pull-right" type="primary" size="small" @click="createClassArranges(schedule.data.cid)">生成排课</Button>
				    	
				    </Col>
			    </Row>
				<div class="m-t" v-if="schedule.tab == 'basic'">
					<schedule-form 
					:label-width="80" 
					:data="schedule.data" 
					:rules="addRules"
					@on-select-lesson="lessonSelected"
					ref="formEdit" 
					>
			    	</schedule-form>
				</div>
				<class-students-list 
				ref="studentList"
				:class-info="schedule.data"
				@assignStudent="assignStudent" 
				v-if="schedule.tab == 'students'"
				>
				</class-students-list>
				<class-arranges-list
				:class-info="schedule.data"
				v-if="schedule.tab == 'arranges'"
				>
				</class-arranges-list>
			</div>
			<div class="modal-footer">
				<Button class="pull-left" type="error" @click="deleteSchedule" :disabled="schedule.tab != 'basic' || saving">删除</Button>	
				<Button type="ghost" @click="cancel" :disabled="saving">取消</Button>
				<Button type="primary" @click="editSave" :disabled="schedule.tab != 'basic' || saving">确定</Button>
			</div>
		</template>	
	</template>
</div>
</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import modal  from '@/libs/modal.mixin'
import scheduleForm from './form.vue'
import scheduleClassesList from './classes-list.vue'
import classStudentsList from '../students-list.vue'
import classArrangesList from '../arranges-list.vue'

const CACHE = {}
export default {
	name:'scheduleInfo',
	mixins:[common,globals,modal],
	components:{
		scheduleForm,
		scheduleClassesList,
		classStudentsList,
		classArrangesList
	},
	props:{
		bid:{
			type:Number,
			default:0
		},
		year:{
			type:Number,
			default:0
		},
		season:{
			type:String,
			default:'Q',
			validator(value){
				return oneOf(value,['C','S','Q','H','A'])
			}
		},
		lid:{
			type:Number,
			default:0
		},
		teachEid:{
			type:Number,
			default:0
		},
		crId:{
			type:Number,
			default:0
		},
		sjId:{
			type:Number,
			default:0
		},
		schedules:{
			type:Array,
			default(){
				return []
			}
		}
	},
	data(){
		return {
			isAutoClassName:false,
			ts:{
				week_day:0,
				int_start_hour:'',
				int_end_hour:''
			},
			info:{
				$new:true,
				cid:0,
				week_day:0,
				int_start_hour:'',
				int_end_hour:'',
				lid:0,
				sj_id:0,
				sj_ids:[],
				teach_eid:0,
				second_eid:0,
				edu_eid:0,
				cr_id:0,
				class_name:'',
				class_no:'',
				year:0,
				season:'',
				start_lesson_time:'',
				lesson_times:0,
				plan_student_nums:0
			},
			schedule:{
				tab:'basic',
				saving:false,
				data:{}
			},
			key:{
				lessons:'',
				teachers:'',
				classrooms:'',
				classes:'',
				students:''
			},
			addRules:{
				lid: [
					{ required: true, type:'number', message:'请选择所属课程', trigger: 'change' }
				],
				class_name: [
					{ required: true, message:'请输入班级名称', trigger: 'blur' }
				],
				lesson_times:[
					{required:true,type:'number',message:'请输入课次',trigger:'blur'}
				],
				teach_eid: [
					{ required: true, type:'number', message:'请选择'+this.$filter('translate')('老师'), trigger: 'change' }
				],			
				plan_student_nums: [
					{ required: true,type:'number', message: '请输入计划招生数', trigger: 'blur' }
				],
				lesson_start_time:[
					{ required: true, message: '开课时段不能为空', trigger: 'blur' }

				],
				lesson_end_time:[
					{ required: true, message: '结课时段不能为空', trigger: 'blur' }
				]
			}

		}
	},
	methods:{
		//添加时调用
		setTs(ts){
			this.ts = ts
			if(this.modal$.action == 'add'){
				this.info.week_day 		 = ts.week_day
				this.info.int_start_hour = ts.int_start_hour
				this.info.int_end_hour   = ts.int_end_hour
			}
			return this
		},
		//编辑时调用
		setSchedule(cs){
			this.lessonSelected(cs.classes)
			this.$nextTick(()=>{
				this.schedule.data = util.copy(cs.classes)
				this.schedule.data.schedule = util.dataPart(cs,['csd_id','week_day','int_start_hour','int_end_hour'])
			})
			return this
		},
		lessonSelected(lesson){
			this.$emit('on-select-lesson',lesson.lid)
		},
		setInfoData(key,value,action){
			if(action == 'add'){
				this.info[key] = value
				if(key == 'lid'){
					let lesson = this.getLessonObj(value)
					this.info.lesson_times = lesson.chapter_nums
					if(lesson.sj_id != 0){
						this.info.sj_id = lesson.sj_id
					}else{
						this.info.sj_id = lesson.sj_ids[0]
					}
					this.autoClassName()
				}else if(key == 'cr_id'){
					this.$r('formAdd').inputPlanStudentNums(value)
				}
			}else{
				this.schedule.data[key] = value
				if(key == 'lid'){
					let lesson = this.getLessonObj(value)
					this.schedule.data.lesson_times = lesson.chapter_nums
					if(lesson.sj_id != 0){
						this.schedule.data.sj_id = lesson.sj_id
					}else{
						this.schedule.data.sj_id = lesson.sj_ids[0]
					}
					this.autoClassName()
				}else if(key == 'cr_id'){
					this.$r('formEdit').inputPlanStudentNums(value)
				}
			}
		},
		//自动命名	
		autoClassName(){
			
			let format = '%s%s%s%s%s'
			let format2 = '%s%s%s-%s-%s'
			let lesson_name,lesson_no,year,season,season_name,week_day,week_day_text,ts_text
			let class_name,class_no
			if(this.modal$.action == 'add'){
				lesson_name = this.info.lid == 0?'':this.$filter('lesson_name')(this.info.lid)
				lesson_no   = this.info.lid == 0 ?'':this.$filter('lesson_no')(this.info.lid)
				year        = this.year
				season      = this.season
				season_name = this.$filter('season_name')(this.season)
				week_day    = this.info.week_day
				week_day_text = this.$filter('week_day_text')(this.info.week_day)
				ts_text = util.sprintf('%s~%s',this.info.int_start_hour,this.info.int_end_hour)

				class_name = util.sprintf(format,
					lesson_name,
					year,
					season_name,
					week_day_text,
					ts_text
					)

				year  = this.year.toString().substr(2,2)
				ts_text = util.sprintf('%s%s',
					this.$filter('format_int_hour')(this.info.int_start_hour),
					this.$filter('format_int_hour')(this.info.int_end_hour)
					)
				class_no = util.sprintf(format2,
					lesson_no,
					year,
					season,
					week_day,
					ts_text
					)

				if(this.isAutoClassName){
					this.info.class_name = class_name
					this.info.class_no   = class_no
				}else{
					if(this.info.class_name == class_name){
						this.info.class_name = ''
						this.info.class_no   = ''
					}
				}
			}
		},
		cancel () {
			if(this.modal$.action == 'add'){
				if(this.info.$new){
					this.$refs['formAdd'].reset()		
				}		
			}else{
				if(!!this.$refs['formEdit']) {
					this.$refs['formEdit'].reset()	
				}
			}
			this.close()
		},
		save(){
			let post_data
			if(this.info.$new == true){

				if(!this.validateSchedule(this.info)){
					return false
				}

				this.$r('formAdd').check().then(form=>{
					//创建新班级
					post_data = util.dataPart(this.info)
					post_data.bid 	 = this.bid
					post_data.season = this.season
					post_data.year   = this.year

					post_data.int_start_hour = post_data.int_start_hour.replace(/[^\d]/g,'')
					post_data.int_end_hour   = post_data.int_end_hour.replace(/[^\d]/g,'')

					this.$rest('class_schedules').post(post_data)
					.success(response=>{
						this.$Message.success('创建排班成功!')
						this.$emit('on-add-schedule-success')
						this.cancel()
					})
					.error(response=>{
						this.$Notice.error({
		                    title: '创建排班失败',
		                    desc: response.body.message
		                })
					})
				})
				
			}else{
				post_data = util.dataPart(this.info,['cid','int_start_hour','int_end_hour','week_day'])
				if(post_data.cid == 0){
					this.$Message.error('请选择已排班级!')
					return false
				}
				post_data.bid 	 = this.bid
				post_data.season = this.season
				post_data.year   = this.year
				post_data.int_start_hour = post_data.int_start_hour.replace(/[^\d]/g,'')
				post_data.int_end_hour   = post_data.int_end_hour.replace(/[^\d]/g,'')

				this.$rest('class_schedules').post(post_data)
				.success(response=>{
					this.$Message.success('创建排班成功!')
					this.$emit('on-add-schedule-success')
					this.cancel()
				})
				.error(response=>{
					this.$Notice.error({
	                    title: '创建排班失败',
	                    desc: response.body.message
	                })
				})
			}
		},
		editSave(){
			let put_data
			put_data = util.dataPart(this.schedule.data,['cid','cr_id',
				'lid','teach_eid','edu_eid','class_name','class_no',
				'lesson_times','start_lesson_time','plan_student_nums'])
			put_data.csd_id = this.schedule.data.schedule.csd_id

			if(!this.validateSchedule(put_data)){
				return false
			}
			
			this.$rest('class_schedules').add_url_param(put_data.csd_id).put(put_data)
			.success(response=>{
				this.$Message.success('修改排班成功!')
				this.$emit('on-add-schedule-success')
				this.cancel()
			})
			.error(response=>{
				this.$Notice.error({
                    title: '修改排班失败',
                    desc: response.body.message
                })
			})
		},
	
		
		deleteSchedule(){
			this.$Modal.confirm({
                title: '确认操作',
                content: '<p>您确认要删除'+this.schedule.data.class_name+'的排班吗?</p>',
                onOk: () => {
                    this.doDeleteSchedule()
                }
            });
		},
		doDeleteSchedule(){
			this.$rest('class_schedules').delete(this.schedule.data.schedule.csd_id)
			.success(response=>{
				this.$Message.success('删除排班成功!')
				this.close()
				this.$emit('on-delete-schedule-success')
			})
			.error(response=>{
				this.$Notice.error({
                    title: '删除排班失败',
                    desc: response.body.message
                })
			})
		},
		assignStudent(max){
			this.$Modal.open('business/class/assign-student.vue@modal',{
				props: {
					'class-info': this.schedule.data,
					max: this.max
				},
				on: {
					'on-success': () => {
						this.refreshStudentList()
					}
				}
			})
            .then(modal=>{
                modal.show('选择分班学员','add')
            })
		},
		validateSchedule(data){
			if(data.lid == 0){
				this.$Message.error('请选择课程!')
				return false
			}
			if(data.class_name === ''){
				this.$Message.error('请输入班级名称!')
				return false
			}
			if(data.teach_eid == 0){
				this.$Message.error('请选择'+this.$filter('translate')('老师')+'!')
				return false
			}
			if(data.cr_id == 0){
				this.$Message.error('请选择教室!')
				return false
			}
			if(!/^\d+$/.test(data.plan_student_nums)){
				this.$Message.error('请输入正确的预招人数!')
				return false
			}
			if(data.plan_student_nums.toString() == '0'){
				this.$Message.error('预招人数不能为0!')
				return false
			}
			if(!/^\d+$/.test(data.lesson_times)){
				this.$Message.error('请输入正确的课次!')
				return false
			}
			if(data.lesson_times.toString() == '0'){
				this.$Message.error('课次数不能为0')
				return false
			}
			return true
		},
		refreshStudentList() {
			this.$r('studentList').refreshData()
			this.$emit('on-success')
		}
	},
	computed:{
		headerText(){
			let ts = this.ts
			return util.sprintf("%s %s年%s %s %s ~ %s",
			this.modal$.title,
			this.year,
			this.$filter('season_name')(this.season),
			this.$filter('week_day_text')(ts.week_day),
			ts.int_start_hour,
			ts.int_end_hour
			)
		},
		scheduleClasses(){
			let classes = {}
			let total  = 0
			this.schedules.forEach(s=>{
				if(!/^\s*$/.test(this.key.classes)){
					if(s.classes.class_name.indexOf(this.key.classes) === -1){
						return
					}
				}
				if(classes[s.cid]){
					classes[s.cid].schedules.push({
						week_day:s.week_day,
						int_start_hour:s.int_start_hour,
						int_end_hour:s.int_end_hour
					})
					total ++
				}else{
					classes[s.cid] = util.dataPart(s.classes)
					classes[s.cid].schedules = []
					classes[s.cid].schedules.push({
						week_day:s.week_day,
						int_start_hour:s.int_start_hour,
						int_end_hour:s.int_end_hour
					})
				}
			})
			classes.length = total
			console.log('scheduleClasses')
			console.log(classes)
			return classes
		}
	},
	watch:{
		lid(value){
			this.info.lid = value
		},
		teachEid(value){
			this.info.teach_eid = value
		},
		crId(value){
			this.info.cr_id = value
		},
		sjId(value){
			this.info.sj_id = value
		},
		year(value){
			this.info.year  = value
		},
		season(value){
			this.info.season = value
		},
		isAutoClassName(value){
			this.autoClassName()
		}
	}
}
</script>