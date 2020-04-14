<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="850">
		<Form :label-width="80">
			<Row :gutter="30">
				<Col span="12" class="mpvue-calendar__left">
					<select-object 
						ref="object" 
						clearable
						@on-selected="setTeachObject" 
						@on-clear="clearSelected"
						style="display: none"
						>
					</select-object>
					<Button 
						class="btn-toggle1"
						type="primary" 
						icon="plus" 
						v-if="info.lesson_type==-1"
						@click="toggleObject"
						>
						请选择授课对象
					</Button>
					<template v-else>
						<Form-item label="授课对象" class="mb-1">
							<template v-if="info.lesson_type==0">
								<p>
									<span>班级：</span>
									<span>{{info._class.class_name}}</span>
								</p>
								<p>
									<span>课程：</span>
									<span>{{info.lid|lesson_name}}</span>
									<span v-if="subjects.length==1" style="margin-left: 10px">
										<span>科目：</span>
										<span>{{info.sj_id|subject_name}}</span>
									</span>
								</p>
								<p>
									<span>开课日期：</span>
									<span>{{info._class.start_lesson_time}}</span>
								</p>
								<p>
									<span>排课情况：</span>
									<Progress 
										:percent="info._class.arrange_times/info._class.lesson_times*100"
										style="width: 160px;"
										>
										{{info._class.arrange_times}}/{{info._class.lesson_times}}
									</Progress>
								</p>
							</template>
							<template v-if="info.lesson_type==1">
								<p>学员：{{info.students[0].student_name}}</p>
								<p>
									<span>课程：</span>
									<span>{{info.lid|lesson_name}}</span>
									<span v-if="subjects.length==1" style="margin-left: 10px">
										<span>科目：</span>
										<span>{{info.sj_id|subject_name}}</span>
									</span>
								</p>
								<p>剩余课时：{{Number(info.students[0].remain_lesson_hours)}} / {{Number(info.students[0].lesson_hours)}}</p>
							</template>
							<template v-else>
								<div style="max-height: 120px;overflow: auto;">
									<p v-for="item in info.students">
										<span>{{item.student_name}}：</span>
										<span>{{item.lid|lesson_name}} / {{item.sj_ids[0]|subject_name}}</span>
										<span style="margin-left: 5px;">{{Number(item.remain_lesson_hours)}} / {{Number(item.lesson_hours)}}</span>
									</p>
								</div>
							</template>
							<Button 
								type="text" 
								size="small" 
								class="btn-toggle2" 
								@click="toggleObject" 
								v-if="allowChangeObject"
								>
								切换
							</Button>
						</Form-item>
						<Form-item :label="label_teacher" class="mb-1">
							<select-employee v-model="info.eid" :rid="1" :limit-per="false" clearable style="width:275px"></select-employee>
						</Form-item>
						<Form-item :label="label_secteacher" class="mb-1">
							<select-employee v-model="info.second_eids" :rid="2" :limit-per="false" clearable style="width:275px"></select-employee>
						</Form-item>
						<Form-item label="教室" class="mb-1">
							<select-class-room v-model="info.cr_id" style="width:288px"></select-class-room>
						</Form-item>
						<Form-item label="科目" v-if="subjects.length>1" style="width:275px" class="mb-1">
							<Select v-model="info.sj_id">
								<Option v-for="item in subjects" :value="item.sj_id">{{item.subject_name}}</Option>
							</Select>
						</Form-item>
						<Form-item label="课消来源" v-if="enable_money_consume" class="mb-1">
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
							</div>
						</Form-item>
						<Form-item label="扣课时" v-else class="mb-0">
							<InputNumber v-model="info.consume_lesson_hour" style="width:60px"></InputNumber>
							<span class="ml-2">课时</span>					
						</Form-item>
						<Form-item label="忽略冲突" class="mb-1">
							<Checkbox v-model="info.ignore_class_cc" :true-value="1" :false-value="0">忽略教室</Checkbox>
							<Checkbox v-model="info.ignore_class_ec" :true-value="1" :false-value="0">忽略老师</Checkbox>
							<Checkbox v-model="info.ignore_student_cc" :true-value="1" :false-value="0">忽略学员</Checkbox>
						</Form-item>
					</template>
				</Col>
				<Col span="12">
					<Form-item label="上课时段" class="mb-1">
						<select-time-section 
							clearable
							:value="tsArray" 
							@on-change="changeTimeSection"
							placeholder="请选择上课时段"
							style="width:270px"
							>
						</select-time-section>
					</Form-item>
					<Form-item label="上课日期" class="mb-1">
						<Calendar ref="calendar" now multi @select="select"></Calendar>
					</Form-item>
				</Col>
			</Row>
		</Form>
		<conflict-table 
			:arrange-list="arrangeList"
			v-if="info.lesson_type!=-1" 
			style="max-height: 300px;overflow: auto;"
			>
		</conflict-table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<template v-if="info.lesson_type!=-1&&arrangeList.length">
				<Button type="primary" :loading="saving" @click="checkConfilct">检测冲突</Button>
				<Button type="primary" :loading="saving" @click="ok">确定排课</Button>
			</template>
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
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectTimeSection from 'c%/SelectTimeSection.vue'
	import SelectClassRoom from 'c%/SelectClassRoom'
	import SelectObject from 'c%/review/review-object.vue'
	import Calendar from 'c%/mpvueCalendar/index.vue'
	import ConflictTable from './conflict-table.vue'
	import 'c%/mpvueCalendar/style.css'

	const emptyObject = {
		cid: 0,
		consume_lesson_amount: 0,
		consume_lesson_hour: 0,
		consume_source_type: 1,
		cr_id: 0,
		ignore_class_cc: 0,
		ignore_class_ec: 0,
		ignore_student_cc: 0,
		int_day: '',
		int_end_hour: '',
		int_start_hour: '',
		lesson_type: -1,
		lid: 0,
		second_eids: [],
		sid: 0,
		sids: [],
		sj_id: 0,
		eid: 0,
		_class: {},
		students: [],
	}

	const emptyError = {
		error_fields: [],
		error_message: [],
		is_error: false,
		is_check: false
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectTimeSection,
			SelectObject,
			SelectEmployee,
			SelectLesson,
			SelectClassRoom,
			Calendar,
			ConflictTable
		},
		props: {
			objectFixed: {
				type: [Object,Array],
				default() {
					return {}
				}
			},
			allowChangeObject: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				tsArray: [],
				dateList: [],
				arrangeList: [],
				info: util.copy(emptyObject)
			}
		},
		watch: {
			info: {
				handler(info) {
					for(let f in info) {
						this.arrangeList.forEach(a => {
							if(f!=='int_day') {
								a[f] = info[f]
							}
						})
					}
				},
				deep: true
			}
		},
		mounted() {
			this.info.ignore_class_ec = this.ignore_class_ec
			this.info.ignore_class_cc = this.ignore_class_cc
			this.info.ignore_student_cc = this.ignore_student_cc
			if(!_.isEmpty(this.objectFixed)) {
				this.setInfoByObjectFixed()
			}
		},
		computed: {
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
			}
		},
		methods: {
			ok() {
				this.checkArrangeList()
				.then(() => {
					this.checkConfilctResult()
					.then(data => {
						if(data) {
							this.confirm(data)
							.then(() => {
								this.confirmArrange()
							})
						}else{
							this.confirmArrange()
						}
					})
				})
				.catch(data => {
					this.error(data)
				})
			},
			confirmArrange() {
				this.$rest('course_arranges/law_course_arranges')
				.post(this.arrangeList)
				.success(response=>{
					let data = response.data,
						notice_type = 'success'							
					
					this.$Notice[notice_type]({
						title: '排课结果',
						duration: 6,
						render: h => {
							let desc = []
							if(data && data.success > 0) {
								desc.push(h('p',`${data.success}条排课创建成功`))
							}
							if(data && data.fail > 0){
								desc.push(h('p',`${data.fail}条排课创建失败`))
							}
							return h('div',desc)
						}
					})
					
					this.$emit('on-success')
					this.close()
					
				}).error(response=>{
					this.error(response.body.message)
				})
			},
			checkConfilct() {
				this.checkArrangeList()
				.then(data=>{
					let list = util.copy(this.arrangeList)
					list.forEach(d => {
						d.teach_eid = d.eid
					})
					this.$rest('class_schedule_mains').add_url_param('check_conflict')
					.post(list)
					.success(res => {
						let data = res.data
						data.forEach(d => {
							d.is_check = true
						})
						this.arrangeList = data
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
				.catch(data => {
					this.error(data)
				})
			},
			checkConfilctResult() {
				return new Promise((resolve,reject) => {
					let list = this.orderBy(this.arrangeList,'int_day')
					let index1 = [],index2 = []
					list.forEach((l,i) => {
						if(l.is_check) {
							if(l.is_error) {
								index2.push(i+1)
							}
						}
						else {
							index1.push(i+1)
						}
					})
					if(index1.length) {
						resolve('第'+index1.join(',')+'行未检测冲突，确定直接排课吗?')
					} 
					else {
						if(index2.length) {
							resolve('第'+index2.join(',')+'行有冲突将不生成排课，确定排课吗?')
						} 
					}
					resolve()
				})
			},
			checkArrangeList() {
				return new Promise((resolve,reject) => {
					let list = this.orderBy(this.arrangeList,'int_day')
					let index1 = [],index2 = []
					list.forEach((l,i) => {
						if(l.int_start_hour == '') {
							index1.push(i+1)
						}
						if(l.eid == 0) {
							index2.push(i+1)
						}
					})
					if(index1.length) {
						reject('第'+index1.join(',')+'行的时间段未选择')
					} else {
						if(index2.length) {
							reject('第'+index2.join(',')+'行的老师未选择')
						} else {
							resolve()
						}
					}
				})
			},
			select(v) {
				let ret = []
				v.forEach(i => {
					ret.push(moment(new Date(i)).format('YYYY-MM-DD'))
				})
				let len1 = ret.length
				let len2 = this.dateList.length
				let diff = ''
				if(len1 > len2) {
					for(let i=0;i<len1;i++) {
						if(!this.dateList.includes(ret[i])) {
							diff = ret[i]
							this.getArrangeItem(diff)
							break;
						}
					}
				}
				else if(len1 < len2) {
					for(let i=0;i<len2;i++) {
						if(!ret.includes(this.dateList[i])) {
							diff = this.dateList[i]
							this.delArrangeItem(diff)
							break;
						}
					}
				}
				this.dateList = ret
			},
			getArrangeItem (d) {
				let obj = {}
				let info = util.copy(this.info)
				obj = Object.assign({},info,emptyError,{
					int_day:this.$filter('format_int_day')(d),
					week_day:new Date(d).getDay()
				})
				this.arrangeList.push(obj)
				this.arrangeList = this.orderBy(this.arrangeList,'int_day')
			},
			delArrangeItem (d) {
				let index = this.arrangeList.findIndex(a => this.$filter('int_date')(a.int_day)==d)
				if(index > -1) {
					this.arrangeList.splice(index,1)
					this.delArrangeItem(d)
				}
			},
			toggleObject() {
				this.$refs['object'].openModal()
			},
			clearSelected() {
				this.info.lesson_type = -1
				this.info.lid = 0
				this.info.sj_id = 0
				this.info.cid = 0
				this.info._class = {}
				this.info.students.splice(0)
				if(!this.objectFixed.teach_eid) {
					this.info.eid = 0
				}
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
							this.info.sids = []
							this.info._class = selected.info
							this.info.second_eids = selected.info.second_eids
							
							//若开启 考勤扣余额配置，则选择班级时默认取班级的consume_source_type
							if(this.enable_money_consume) {
								this.info.consume_source_type = selected.info.consume_source_type							
							}
							break;
						case 1:
						case 2:
							this.info.cid = 0
							this.info.sid = selected.type==1?ids[0]:0
							this.info.sids = selected.type==2?ids:[]
							this.info.lid = selected.map_ids[ids[0]].lid
							this.info.sj_id = selected.map_ids[ids[0]].sj_ids[0]
							this.setStudents(ids,selected.map_ids)
							break;
					}
					if(this.info.int_start_hour!=''){
						this.getConsumeHour()					
					}
					this.resetConflictResult()
				}
			},
			resetConflictResult() {
				this.arrangeList.forEach(a => {
					for(let i in emptyError) {
						this.$set(a,i,emptyError[i])
					}
				})
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
			setInfoByObjectFixed() {
				let class_item = this.objectFixed.class_item,
					student_lesson = this.objectFixed.student_lesson,
					cr_id = this.objectFixed.cr_id,
					eid = this.objectFixed.teach_eid
				if(this.objectFixed.int_day){
					this.info.int_day = this.objectFixed.int_day
				}
				if(this.objectFixed.ts_array){
					this.tsArray = this.objectFixed.ts_array
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
					this.info.eid = class_item.teach_eid
					this.info._class = class_item
				}
				if(student_lesson&&student_lesson.length) {
					if(student_lesson.length == 1) {
						this.info.sid = student_lesson[0].sid
					}
					else {
						student_lesson.forEach(sl => {
							this.info.sids.push(sl.sid)
						})
					}
					this.info.lesson_type = student_lesson[0].lesson_type
					this.info.lid = student_lesson[0].lid
					this.info.sj_id = student_lesson[0].sj_ids[0]
					this.info.students = student_lesson
				}
				if(cr_id) {
					this.info.cr_id = cr_id
				}
				if(eid) {
					this.info.eid = eid
				}
				if(this.info.int_start_hour!='' && this.info.lesson_type >0 && this.info.lid > 0){
					this.getConsumeHour()					
				}
			},
		}
	}
</script>
<style lang="less">
	.mpvue-calendar__left {
		position: relative;
		min-height: 345px;
		.btn-toggle1 {
			position: absolute;
			top: 50%;
			left: 50%;
			margin-left: -60px;
			margin-top: -25px;
		}
		.btn-toggle2 {
			position: absolute;
			top: 0;
			right: 0;
		}
		&:after {
			content: ' ';
			position: absolute;
			width: 1px;
			height: 100%;
			top: 0;
			right: 0;
			background: #dddee1;
			transform: scaleX(0.5);
		}
	}
	.mpvue-calendar {
		width: 270px;
		margin: unset;
		min-width: 270px;
		border: 1px solid #eee;
	}
	.mpvue-calendar td {
		height: 35px;
		padding: 3px;
		font-size: 12px;
	}
	.mpvue-calendar td span {
		border-radius: 5px;
		line-height: 30px;
	}
	.mpvue-calendar td.selected span {
		border-radius: 5px;
	}
	.mc-head-box div {
		font-size: 12px;
	}
	.calendar-tools {
		margin-bottom: 10px;
		box-shadow: none;
		border-bottom: 1px solid #eee;
	}
	.mc-body {
		padding-bottom: 0;
	}
	.mc-head {
		margin-bottom: 0;
	}
</style>