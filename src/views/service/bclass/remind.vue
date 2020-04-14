<template>
	<div class="schedule-grid c-grid">
		<div class="box">	
			<RadioGroup v-model="remind_days_before" type="button" @on-change="init_data" v-if="caId==0">
		        <Radio :label="0">今天</Radio>
		        <Radio :label="1">明天</Radio>
		        <Radio :label="2">后天</Radio>
		        <Radio :label="3">大后天</Radio>
		    </RadioGroup>
		    <Button class="ml-2" type="primary" @click="send" icon="paper-airplane" v-per="'remind.push'">推送课前提醒</Button>
			<Checkbox v-model="select_all" @on-change="selectAll">全选</Checkbox>
			<span class="reminded-grid"></span>已推送
		    <div class="pull-right m-t-5">
		    	<per-scope per="arrange.checkAll" @on-change="perScopeChange"></per-scope>
			</div>
			<Button class="pull-right m-t-5 mr-4" type="ghost" @click="remindPlan" icon="ios-gear-outline" v-per="'remind.plan'">自动推送计划</Button>
		</div>
		<div class="schedule-grid-main mt-2 box">
			<Spin fix v-if="loading">
            	<Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            	<div>正在加载数据...</div>
            </Spin>
			<div class="schedule-condition" :style="{border: 0,boxShadow: 'none',height: height+'px'}">
				<Row class="schedule-condition-head">
					<Col 
						span="8" 
						class="teacher" 
						:class="view_type==1?'current':''"
						@click.native="viewType(1)">
						上课{{'老师'|translate}}
					</Col>
					<Col 
						span="8" 
						class="classroom" 
						:class="view_type==2?'current':''"
						@click.native="viewType(2)">
						上课教室
					</Col>
					<Col 
						span="8" 
						class="section remind" 
						:class="view_type==3?'current':''"
						@click.native="viewType(3)">
						上课时段
					</Col>
				</Row>
				<div class="schedule-condition-list">
					<div 
						:class="[current_condition_key==key?'current':'','schedule-condition-item']" 
						v-for="(value,key) in format_data"
						@click="selectItem(key)">
						<template v-if="view_type==1">
							<Row type="flex" justify="center" align="middle">
								<Col span="12" class="text-right">
									<letter-avatar
										size="32"
										:src="getPhotoUrl(key)"
										:name="$filter('ename')(key)"
										:rounded="true"
										style="width:auto;">
									</letter-avatar>
								</Col>
								<Col span="12">
									<span class="item-name">{{key|ename}}</span>
								</Col>
							</Row>
						</template>
						<template v-if="view_type==2">
							<Row type="flex" justify="center" align="middle" style="height:100%;">
								<Col span="10" class="text-right">
									<Icon type="ios-home" size="16"></Icon>
								</Col>
								<Col span="14" style="padding-top:2px;">
									<span class="item-name">{{key|classroom_name('未知')}}</span>
								</Col>
							</Row>
						</template>
						<template v-if="view_type==3">
							<div class="section-wrap">
								<span class="item-name">{{key}}</span>
							</div>
						</template>
						<span class="arrange-nums">{{value.length}}</span>
					</div>
					<div v-if="data.length==0" class="text-center empty mt-4"><Icon type="ios-information"></Icon> 没有排课</div>
				</div>
			</div>
			<div :class="['schedule-arranges',data.length==0?'empty-img':'']" :style="{border: 0,boxShadow: 'none',height: (height-15)+'px'}">
				<div class="schedule-arranges-list">
					<Row class="schedule-arranges-item" v-for="item in orderBy(data_by_condition,'int_start_hour')">
						<Col span="6" :class="['info',item.is_attendance==1?'part-attended':item.is_attendance==2?'is-attended':'']">
							<div :class="['info-section',is_current_section(item)]">{{getFormatSection(item)}}</div>
							<div class="info-ename">
								<Icon type="person" size="14"></Icon>
								{{item.teach_eid|ename}}
								<Checkbox v-model="item.is_push_teacher"></Checkbox>
							</div>
							<div class="info-room">
								<Icon type="ios-home" size="14"></Icon>
								{{item.cr_id|classroom_name('未知')}}
							</div>
						</Col>
						<Col span="18" class="students">
							<div class="class-name remind" v-if="item.course_name">
								<Checkbox v-model="item.$checked" @on-change="toggleSelectAll">{{item.course_name}}</Checkbox>
							</div>
							<div class="student-box" v-for="student in item.students">
								<Poptip trigger="hover" v-if="student.course_remind_log.length>0" placement="right" transfer>
									<div slot="content">
										<Timeline>
									        <TimelineItem v-for="(c,cIndex) in student.course_remind_log">{{c.create_time}}</TimelineItem>
									    </Timeline>
									</div>
									<Checkbox v-model="student.$checked" @on-change="toggleSelectOne" class="text-success">{{student.student_name}}</Checkbox>
							    </Poptip>
							    <Checkbox v-model="student.$checked" @on-change="toggleSelectOne"v-else>{{student.student_name}}</Checkbox>
							</div>
							<div class="lesson-type">{{getLessonType(item)}}</div>
						</Col>
					</Row>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'

	function getCurrentYear(){
		return util.int(moment().format('YYYY'))
	}
	function getFormatDate() {
		return moment().format('YYYY - MM - DD')
	}
	function getCurrentWeek(){
		return util.int(util.get_date_week_no(new Date()))
	}
	
	function getCurrentDate(){
		return (new Date())
	}

	const DC = {}

	export default {
		mixins: [common,globals,grid],
		props: {
			height: {
				type: Number,
				default: util.get_client_height() - 285
			},
			caId: {
				type: Number,
				default: 0
			}
		},
		components: {
			LetterAvatar
		},
		data() {
			return {
				rest_api: 'course_arranges/students',
				currentDate:new Date(),
				view_type: 1,
				current_condition_key: '',
				remind_days_before: 1,
				select_all: false,
				type_arrange: ''
			}
		},
		created() {
			this.remind_days_before = this.$store.state.gvars.configs.params.remind_before_course.days_before
		},
		watch: {
			'currentDate':function(date) {
				this.$emit('date-change',date)
				this.init_data()
			},
			'view_type':function(val) {
				this.current_condition_key = ''
			},
			'type_arrange':function(val) {
				this.init_data()
			}
		},
		methods: {
			remindPlan() {
				this.$Modal.open('service/bclass/remind/remind-plan.vue@modal')
				.then(modal => {
					modal.show('课前提醒计划')
				})
			},
			send() {
				if(this.post_param.length===0){
					this.$Message.error('请先选择学员')
					return
				}
				this.$rest('course_arranges/remind_course')
				.post({data:this.post_param})
				.success(res=>{
					let data = res.data
					if(data.length == 0) {
						this.$Message.success('发送成功')
					}else{
						let content = ''
						data.forEach(item => {
							content += `<p>${item.student.student_name}推送失败，${item.msg}</p>`
						})
						this.$Modal.warning({
                            title: '提示',
                            content: content
                        });
					}
					this.$emit('on-success')
					this.init_data()
				})
				.error(response=>{
					this.$Notice.erorr({
						title: '发送失败',
						desc: response.body.message||'发送失败'
					})
				})
			},
			perScopeChange(value) {
	            this.type_arrange = value
	        },
			selectAll(value) {
				this.data.forEach(d=>{
					d.$checked = value
					d.is_push_teacher = value
					d.students.forEach(s=>{
						s.$checked = value
					})
				})
			},
			toggleSelectAll(value) {
				this.data.forEach(d=>{
					d.is_push_teacher = d.$checked
					if(d.students.length>0){
						d.students.forEach(s=>{
							s.$checked = d.$checked
						})
					}
				})
				this.refreshCheckAll()
			},
			toggleSelectOne(value) {
				this.data.forEach(d=>{
					if(d.students.length>0){
						d.$checked = d.students.filter(s=>s.$checked).length == d.students.length
					}
				})
				this.refreshCheckAll()
			},
			refreshCheckAll() {
				if(this.data.length == this.data.filter(d=>d.$checked==true).length) {
					this.select_all = true
				}else{
					this.select_all = false
				}
			},
			viewType(val) {
				this.view_type = val
			},
			selectItem(key) {
				if(this.current_condition_key == key) {
					this.current_condition_key = ''
				}else{
					this.current_condition_key = key
				}
			},
			hook_get_param (params) {
				if(this.caId) {
					params.ca_id = this.caId
				}else{
					params.int_day = moment(new Date()).add(this.remind_days_before,'days').format('YYYYMMDD')
				}
				if(this.type_arrange=='my'){
					params.teach_eid = this.eid$
				}
			},
			getPhotoUrl(eid) {
				let teacher = this.$store.state.gvars['employees'].find(item=>item.eid == eid)
				if(teacher) {
					return teacher.photo_url
				}else{
					return 'http://s1.xiao360.com/common_img/avatar.jpg'
				}
			},
			deal_data(data) {
				data.forEach(d=>{
					d.$checked = false
					d.is_push_teacher = false
					if(d.students.length>0){
						d.students.forEach(s=>{
							s.$checked = false
						})							
					}
				})
				data = data.filter(item => {
					return item.is_cancel == 0
				})
				return data
			},
			getEname(eid) {
				return this.$filter('ename')(eid)
			},
			formatSection(data) {
				return util.sprintf('%s~%s',this.$filter('int_hour')(data.int_start_hour),
					this.$filter('int_hour')(data.int_end_hour))
			},
			getLessonType(data) {
				let result = ''
				if(data.lesson_type===0){
					if(data.is_trial===1||data.is_makeup===1){
						result = data.is_trial===1?'试':'补'
					}else{
						if(data.one_class!=null){
							result = '班'
						}	
					}	
				}else{
					if(data.lesson_type===1) {
						result = '一'
					}
					if(data.lesson_type===2) {
						result = '多'
					}
					if(data.lesson_type===3) {
						result = '研学'
					}
				}
				return result
			},
			getFormatSection(item) {
				return util.sprintf('%s -- %s',this.$filter('int_hour')(item.int_start_hour),
							this.$filter('int_hour')(item.int_end_hour))
			},
			is_current_section(item) {
				let date = new Date(),
					hour = date.getHours(),
					minute = date.getMinutes(),
					int_hour = hour*100+minute
				if(item.int_start_hour<=int_hour
					&&item.int_end_hour>=int_hour
					&&date.toLocaleDateString()==this.currentDate.toLocaleDateString()) return 'current'
				return ''
			},
		},
		computed: {
			is_current() {
				return moment(this.currentDate).format('YYYY - MM - DD') == getFormatDate()
			},
			maxHeight1() {
				return util.get_client_height() - 285
			},
			maxHeight2() {
				return util.get_client_height() - 300
			},
			format_data() {
				let arranges = {}
				if(this.data.length > 0) {
					switch(this.view_type) {
						case 1:
							this.data.forEach(d=>{
								if(!arranges[d.teach_eid]) {
									arranges[d.teach_eid] = []
								}
								arranges[d.teach_eid].push(d)
							})
							break;
						case 2:
							this.data.forEach(d=>{
								if(!arranges[d.cr_id]) {
									arranges[d.cr_id] = []
								}
								arranges[d.cr_id].push(d)
							})
							break;
						case 3:
							this.orderBy(this.data,'int_start_hour').forEach(d=>{
								const section = this.getFormatSection(d)
								if(!arranges[section]) {
									arranges[section] = []
								}
								arranges[section].push(d)
							})
							break;
					}
				}
				return arranges
			},
			data_by_condition() {
				if(this.current_condition_key=='') {
					return this.data
				}else{
					return this.format_data[this.current_condition_key]
				}
			},
			post_param() {
				let param = []
				this.data.forEach(d=>{
					if(d.students.length>0){
						let students = d.students.filter(s=>s.$checked)
							
						if(students.length>0){
							let obj = {
								ca_id: 	d.ca_id,
								sids: [],
								is_push_teacher: d.is_push_teacher
							}
							
							students.forEach(s=>{
								obj.sids.push(s.sid)
							})
							param.push(obj)
						}
					}
				})
				return param
			}
		}
	}
</script>
<style lang="less">
	.reminded-grid  {
		display: inline-block;
		height: 12px;
		width: 12px;
		overflow: hidden;
		vertical-align: middle;
		margin-bottom: 2px;
		background: #4dbd74;
	}
</style>
