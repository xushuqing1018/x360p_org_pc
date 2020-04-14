<template>
	<div style="min-height: 400px;">
		<Form :label-width="70">
			<Form-item label="学员" class="ivu-form-item-required">
				<select-student v-model="info.sid" clearable style="width:200px" @on-clear-all="clearSid"></select-student>
			</Form-item>
			<Form-item label="上课时间" v-if="info.sid>0" class="ivu-form-item-required">
				<date-range-picker v-model="int_day" @on-change="getCourseArrange" style="width:200px"></date-range-picker>
				<div class="list-body-wrap mt-3" v-loading.like="'students'" style="max-height:300px;overflow: auto;">
					<table class="x-modal-table modal-table">
						<thead>
							<th><div class="ivu-table-cell"></div></th>
							<th><div class="ivu-table-cell">上课时间</div></th>		
							<th><div class="ivu-table-cell">课程/班级</div></th>
							<th><div class="ivu-table-cell">上课{{'老师'|translate}}</div></th>
						</thead>			
						<tr v-for="(item,index) in data" :key="index"
							:class="{'table-info':info.ca_ids.indexOf(item.ca_id)>-1}"
							@click="toggleSelected(item)">
							<td>
								<div class="ivu-table-cell">
									<Checkbox 
										readonly
										:value="info.ca_ids.indexOf(item.ca_id)>-1"
										@click="toggleSelected(item)">
									</Checkbox>
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									{{item.int_day|int_date}}　{{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<Tag :color="item.lesson_type==0?'blue':'green'">
										{{item.lesson_type==0?'班':item.lesson_type==1?'一':'多'}}
									</Tag>{{item.course_name}}
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div>
							</td>
						</tr>
						<tr v-if="!data||data.length===0">
							<td colspan="4">
								<div class="ivu-table-cell text-center">{{emptyText}}</div>
							</td>
						</tr>
					</table>
				</div>			
			</Form-item>
			<Form-item label="请假原因" class="ivu-form-item-required">
				<Select v-model="info.leave_type" style="width:200px;">
					<Option :value="-1">请选择</Option>
					<Option 
					v-for="(item,index) in dicts('leave_reason')" 
					:key="index"
					:value="item.did">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="备注">
				<Input type="textarea" v-model="info.reason" :row="3" placeholder="请输入请假备注..."></Input>
			</Form-item>	
			<Form-item label="扣课时">
				<Checkbox v-model="info.is_consume" :true-value="1" :false-value="0">是否扣课时</Checkbox>
				<span style="color:#f60;">注意：如果勾选扣课时并不是立即扣，而是在登记考勤的时候才扣</span>
				<p v-if="leaveNums > -1">
					<table class="table-mini">
						<thead>
							<tr>
								<th>累计请假</th>
								<th>限制请假</th>
								<th>可请假</th>
								<th>限制依据</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><a href="javascript:;" @click="viewLeaveDetail">{{leaveNums}} 次</a></td>
								<th>{{limitLeaveNumsText}}</th>
								<th>{{remainLeaveNums}}</th>
								<td>{{leaveModeText}}</td>
							</tr>
						</tbody>
					</table>
				</p>
			</Form-item>
			<Form-item label="顺延补课" v-if="info.sid&&!!current_arrange&&current_arrange.lesson_type==1">
				<i-switch v-model="show_delay"></i-switch>
			</Form-item>
			<template v-if="show_delay">
				<Form-item :label="delay_title" :label-width="80" class="mb-0">
					<DatePicker 
						:value="info.append_arrange.int_day" 
						@on-change="info.append_arrange.int_day=$event"
						style="width:200px"
						>
					</DatePicker>
				</Form-item>
				<Form-item label="">
					<Tag type="border" color="blue" class="ml-2">基于最后一次排课日期:{{last_day}}</Tag>
					<Button type="primary" size="small" @click="next_day">+1天</Button>
					<Button type="primary" size="small" @click="next_week">+1周</Button>
				</Form-item>
			</template>
		</Form>
	</div>
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectStudent from 'c%/SelectStudent.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			selectStudent,
			dateRangePicker
		},
		props: {
			sid: {
				type: Number,
				default: ()=>{
					return 0
				}
			},
			name: {
				type: String,
				default: ''
			},
			modalLeave: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data () {
			return {
				pk: 'ca_id',
				int_day: util.week_range(),
				info: {
					sid: 0,					
					ca_ids: [],
					reason: '',
					leave_type: -1,
					is_consume:0,
					append_arrange:{
						int_day: '',
						int_start_hour: '',
						int_end_hour: ''
					}
				},
				start_get_leave_count:false,
				leave_count:null,
				leaveNums:-1,
				limitLeaveNums:-1,
				limitLeaveMode:'global',//global,student_lesson,lesson
				last_day: '',
				show_delay: false
			}
		},
		watch:  {
			'info.sid': function (val) {
				if(val) {
					this.recoverInit()

					this.rest_api = 'students/'+val+'/course_arranges?student_leave=1'
					this.init_data()
					this.get_leave_count()
					this.$emit('on-sid-change',this.info.sid)
				}else{
					this.recoverInit()
				}
			},
			'sid': function (val) {
				if(val) {
					this.recoverInit()
					this.rest_api = 'students/'+val+'/course_arranges?student_leave=1'
					this.info.sid = val
					this.init_data()
					this.get_leave_count()
				}else{
					this.recoverInit()
				
				}
			},
			'modalLeave.show': function (val) {
				if(val) {
					if(!this.sid) {
						this.info.sid = 0
					}
					this.int_day = util.week_range()	
					this.reset()
				}
			}
		},
		methods:{
			recoverInit(){
				this.leaveNums = -1
				this.limitLeaveNums = -1
				this.limitMode = 'global'
				this.info.is_consume = 0
			},
			reset () {
				this.info.ca_ids = []
				this.info.reason = ''
				this.info.leave_record = -1
				this.info.is_consume = 0
				this.leaveNums = -1
				this.limitLeaveNums = -1
				this.show_delay = false
			},
			init_leave_record () {
				return new Promise((resolve,recject) => {
					this.$rest('student_leaves')
					.get()
					.success(response=>{
						this.leave_record = response.list
						resolve(response)
					}).error(response=>{
						this.$Notice.error({
							title: '获取数据失败',
							desc: response.body.message||'获取数据失败！'
						})
						recject(response)
					})
				})
			},
			toggleSelected (item) {
				let index = this.info.ca_ids.indexOf(item.ca_id)
				if(index>-1){
					this.info.ca_ids.splice(index,1)
				}else{
					this.info.ca_ids = []
					this.info.ca_ids.push(item.ca_id)
					this.$nextTick(() => {
						if(this.current_arrange.lesson_type==1) {
							this.get_final()
						}
					})
				}
				this.cacuIsConsume()
			},
			hook_get_param (params) {				
				Vue.delete(params,'pagesize')
				Vue.delete(params,'page')
				params.with = 'one_class'
				if(this.int_day.length>0){
					params.int_start_day = this.int_day[0]
					params.int_end_day = this.int_day[1]
				}
			},
			deal_data (rs) {
				return rs.filter(i => _.isEmpty(i.student_leave))		
			},
			ok () {				
				if(!this.info.sid){
					this.$Message.error('请先选择学员')
					return false
				}
				if(!this.info.ca_ids.length){
					this.$Message.error('请先选择排课')
					return false
				}
				if(this.info.leave_type<0){
					this.$Message.error('请先选择请假原因')
					return false
				}
				if(this.show_delay
					&&!!this.current_arrange
					&&this.current_arrange.lesson_type==1
					&&this.info.append_arrange.int_day
				) {
					this.info.append_arrange.int_start_hour = this.$filter('int_hour')(this.current_arrange.int_start_hour)
					this.info.append_arrange.int_end_hour = this.$filter('int_hour')(this.current_arrange.int_end_hour)
				}else{
					delete this.info.append_arrange
				}
				this.$rest('student_leaves')
				.post(this.info)
				.success(data=>{
					this.$Message.success('请假成功！')
					this.init_data()
					this.reset()
				}).error(response=>{
					this.error(response.body.message)
				})
			},
			getCourseArrange () {
				if(this.sid || this.info.sid) {
					this.init_data()
				}else{
					this.$Message.error('请先选择学员')
				}
			},
			clearSid() {
				this.info.sid = 0
			},
			get_leave_count(){
				if(this.start_get_leave_count){
					return
				}
				this.start_get_leave_count = true
				this.$rest('student_leaves')
				.add_url_param(0,'leavecount')
				.get({sid:this.info.sid})
				.success(data=>{
					this.start_get_leave_count = false
					this.leave_count = data
					this.cacuIsConsume()
				})
			},
			get_leave_ca_info(){
				if(this.info.ca_ids.length == 0){
					return false
				}
				if(this.data.length > 0){
					for(let i=0;i<this.data.length;i++){
						if(this.info.ca_ids.indexOf(this.data[i].ca_id) !== -1){
							return this.data[i]
						}
					}
				}

				return false
			},
			getLimitLeave(ca,leave_count){
				let ret = {
					nums:0,
					mode:'global'
				}
				if(ca.student_lesson && ca.student_lesson.sl_id > 0){
					if(_.isDefined(leave_count.student_sl_leave_nums_limit[ca.student_lesson.sl_id])){
						ret.nums = leave_count.student_sl_leave_nums_limit[ca.student_lesson.sl_id]
						ret.mode = 'student_lesson'
					}
				}else if(ca.lid > 0){
					if(_.isDefined(leave_count.student_lesson_leave_nums_limit[ca.lid])){
						ret.nums = leave_count.student_lesson_leave_nums_limit[ca.lid]
						ret.mode = 'student_lesson'
					}else if(_.isDefined(leave_count.lesson_leave_nums_limit[ca.lid])){
						ret.nums = leave_count.lesson_leave_nums_limit[ca.lid];
						ret.mode = 'lesson'
					}
				}else if(ca.cid > 0){
					if(_.isDefined(leave_count.student_class_leave_nums_limit[ca.cid])){
						ret.nums = leave_count.student_class_leave_nums_limit[ca.cid]
						ret.mode = 'student_lesson'
					}else if(ca.sj_id > 0){
						if(_.isDefined(leave_count.student_subject_leave_nums_limit[ca.sj_id])){
							ret.nums = leave_count.student_subject_leave_nums_limit[ca.sj_id]
							ret.mode = 'student_lesson'
						}else if(_.isDefined(leave_count.subject_leave_nums_limit[ca.sj_id])){
							ret.nums = leave_count.subject_leave_nums_limit[ca.sj_id]
							ret.mode = 'lesson'
						}
					}
				}else if(ca.sj_id > 0){
					if(_.isDefined(leave_count.student_subject_leave_nums_limit[ca.sj_id])){
						ret.nums = leave_count.student_subject_leave_nums_limit[ca.sj_id]
						ret.mode = 'student_lesson'
					}else if(_.isDefined(leave_count.subject_leave_nums_limit[ca.sj_id])){
						ret.nums = leave_count.subject_leave_nums_limit[ca.sj_id]
						ret.mode = 'lesson'
					}
				}

				if(ret.mode == 'global'){
					ret.nums = leave_count.global_leave_nums_limit
				}
				
				return ret
			},
			getLimitLeaveNums(ca,leave_count){
				if(ca.student_lesson && ca.student_lesson.sl_id > 0){
					if(typeof leave_count.student_sl_leave_nums_limit[ca.student_lesson.sl_id] != 'undefined'){	
						return leave_count.student_sl_leave_nums_limit[ca.student_lesson.sl_id]
					}
				}else if(ca.lid > 0){
					if(typeof leave_count.student_lesson_leave_nums_limit[ca.lid] != 'undefined'){
						
						return leave_count.student_lesson_leave_nums_limit[ca.lid]
					}
					if(typeof leave_count.lesson_leave_nums_limit[ca.lid] != 'undefined'){
						return leave_count.lesson_leave_nums_limit[ca.lid]
					}
				}else if(ca.cid > 0){
					if(typeof leave_count.student_class_leave_nums_limit[ca.cid] != 'undefined'){
						return leave_count.student_class_leave_nums_limit[ca.cid]
					}
				}
				return leave_count.global_leave_nums_limit
			},
			getLeaveNums(ca,leave_count){
				let leave_nums = 0
				if(leave_count.leave_count.length == 0){
					return leave_nums
				}
				if(!ca){
					leave_count.leave_count.forEach(item=>{
						leave_nums += item.leave_nums
					})
				}else{
					if(
						ca.student_lesson 
						&& ca.student_lesson.sl_id > 0 
						&& _.isDefined(leave_count.sl_leave_count[ca.student_lesson.sl_id])
					){
						leave_nums = leave_count.sl_leave_count[ca.student_lesson.sl_id].leave_nums
					}else{
						if(ca.lid > 0){
							leave_count.leave_count.forEach(item=>{
								if(item.lid == ca.lid){
									leave_nums += item.leave_nums
								}
							})
						}else if(ca.cid > 0){
							leave_count.leave_count.forEach(item=>{
								if(item.cid == ca.cid){
									leave_nums += item.leave_nums
								}
							})
						}
						if(leave_nums == 0){
							leave_count.leave_count.forEach(item=>{
								leave_nums += item.leave_nums
							})
						}
					} 	
				}
				return leave_nums
			},
			cacuIsConsume(){
			
				
				let leave_ca_info = this.get_leave_ca_info()
				
				this.leaveNums = this.getLeaveNums(leave_ca_info,this.leave_count) 
				let leaveLimit  = this.getLimitLeave(leave_ca_info,this.leave_count)
				
				this.limitLeaveNums = leaveLimit.nums
				this.limitLeaveMode = leaveLimit.mode
				
				if(
					this.limitLeaveNums == -2 || 
					(this.limitLeaveNums > 0 && this.leaveNums >= this.limitLeaveNums)
				){
					this.info.is_consume = 1
				}
				
			},
			viewLeaveDetail(){
				this.$emit('on-tab-change','record');
			},
			get_final() {
				this.$rest('course_arranges').add_url_param('get_final_course_arrange')
				.get({
					ca_id: this.info.ca_ids[0],
					sid: this.info.sid
				})
				.success(res => {
					this.last_day = this.$filter('int_date')(res.int_day)
					this.next_day()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			next_day() {
				this.info.append_arrange.int_day = moment(this.last_day).add(1,'days').format('YYYY-MM-DD')
			},
			next_week() {
				this.info.append_arrange.int_day = moment(this.last_day).add(7,'days').format('YYYY-MM-DD')
			}
		},
		computed: {
			emptyText() {
				return this.info.sid==0 ? '请先选择学员':'暂无可请假的排课记录'
			},
			current_arrange () {
				let ca_ids = this.info.ca_ids
				if(ca_ids) {
					return this.data.find(d => d.ca_id==ca_ids[0])
				}else{
					return null
				}
			},
			delay_title () {
				return '顺延到周'+this.$filter('int_week')(this.$filter('format_int_day')(this.info.append_arrange.int_day))
			},
			leaveModeText(){
				let map = {
					global:'按全局',
					student_lesson:'按学员课时',
					lesson:'按课程'
				}
				return map[this.limitLeaveMode]
			},
			limitLeaveNumsText(){
				if(this.limitLeaveNums > 0){
					return this.limitLeaveNums+'次'
				}else if(this.limitLeaveNums == -2){
					return '不允许请假'
				}
				return '无限制'
			},
			remainLeaveNums(){
				if(this.limitLeaveNums > 0){
					if(this.limitLeaveNums > this.leaveNums){
						return util.sub(this.limitLeaveNums,this.leaveNums)+'次'
					}else{
						return '0次'
					}
				}else if(this.limitLeaveNums == -2){
					return '0次'
				}
				return '无限制'
				
			}
		}		
	}
</script>

<style>
	.table-mini{
		border-collapse: collapse;
	}
	.table-mini th,.table-mini td{
		border:1px solid #f2f2f2;
		padding:3px;
	}
</style>