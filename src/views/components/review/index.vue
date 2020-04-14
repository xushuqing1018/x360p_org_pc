<template>
	<Modal v-drag-modal v-model="modal$.show" :width="800" :mask-closable="false">		
		<div slot="header">
			<span>{{modal$.title}}</span>	
			<ButtonGroup class="ml-3" size="small">			
				<Button :type="tab==1?'primary':'ghost'" @click="tab=1">按授课记录课评</Button>
				<Button :type="tab==2?'primary':'ghost'" @click="tab=2">自由课评</Button>
			</ButtonGroup>			
		</div>
		<div class="styleTplModal" ref="modalDiv">
			<template>
				<div v-if="tab==1">
					<Button type="ghost" icon="android-arrow-dropdown" @click="chooseAttendance" v-if="!fixedObject">选择授课记录</Button>
					<Button type="primary" icon="reply" v-if="showBackTrans" @click="backTranslate">撤销翻译</Button>
					<Form :label-width="80">
						<Row>
							<Col span="8">
								<FormItem label="授课时间：" class="mb-0">
									{{reviewDate}}
								</FormItem>
							</Col>
							<Col span="10">
								<FormItem label="授课对象：" class="mb-0">
									{{reviewObject}}
								</FormItem>
							</Col>
							<Col span="6">
								<FormItem :label="label_teach_teacher+'：'" class="mb-0">
									{{post.eid|ename('-')}}
								</FormItem>
							</Col>
						</Row>
					</Form>
					<review-attendance ref="attendance" @on-selected="setInfo"></review-attendance>
				</div>
				<review-custom ref="custom" :post="post" @on-deal-student="setPostByCustom" v-else></review-custom>
				<review-content ref="content" :mode="modal$.action" :post="post" @on-change-review="changeReview"></review-content>
			</template>
		</div>
		<div slot="footer">
			<div class="pull-left">
				<Checkbox v-model="post.is_late_send" :true-value="1" :false-value="0" style="line-height: 32px;" class="mb-0 ml-0">定时发送</Checkbox>
				<DatePicker 
					v-if="post.is_late_send" 
					@on-change="timeChange" 
					class="ml-3" 
					:options="options" 
					type="datetime" 
					placeholder="请选择时间" 
					style="width: 200px">
				</DatePicker>
			</div>
			
			<Button type="ghost" :disabled="saving" @click="close">关闭</Button>	
			<Button type="ghost":loading="saving" @click="ok(1)">存为草稿</Button>			
			<Button type="primary" :loading="saving" @click="ok(0)">{{isAddFtContent?'翻译并发送':'发送'}}</Button>
		</div>
		
	</Modal>
</template>

<script>
	import Vue from 'vue'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import review from './review.mixin'
	
	import ReviewContent from './content.vue'
	import ReviewAttendance from './review-attendance.vue'
	import reviewCustom from './review-custom.vue'
	
	const emptyObject = {
		rvw_id: 0,							//课评id		
		is_late_send: 0,					//是否定时发送消息
		int_day: '',						//考勤日期
		int_start_hour: '',					//开始时间
		int_end_hour: '',					//结束时间
		eid: 0,								//上课老师id
		rts_id: 0,							//点评模板id
		bid: 0,								//校区id
		lesson_type: 0,						//课程类型：0:班课，1:1对1,2:1对多
		cid: 0,								//班级id
		sid: 0,								//一对一学员id
		sids: [],							//一对多学员id
		lid: 0,								//课程id
		sj_id: 0,							//科目id
		catt_id: 0,							//考勤id
		ca_id: 0,							//排课id
		content: {
				// lesson_content: '',			//上课内容
				// lesson_after_task: '',		//课后作业
				// next_task: ''				//下次课内容
		},		
		review_file: [],					//点评附件					
		review_student: [					//点评学员
			// {
			// 	sid: 0,						//学员id
			// 	detail: '',					//点评内容
			// 	score: 0					//分数
			// }
		],
		is_draft: 0,						//是否是草稿
		send_time: 0,						//定时发送时间
		review_style: 0,					//课评模板类型
		review_tpl_setting: {}				//匹配到的课评模板		
	}

	export default{
		mixins: [ common,modal,review ],
		components: {
			reviewCustom,
			ReviewContent,
			ReviewAttendance
		},
		props: {
			fixedObject: {
				type: Boolean,
				default: false
			},
			cattId: {
				type: [Number,String],
				default: 0
			},
			draft: {
				type: Object,
				default(){
					return {}
				}
			},
			classAttendance: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data () {
			return {
				post: util.copy(emptyObject),
				tab: 1,
				options: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
				},
				frvw_id: 0,
				catt_id: 0,
				isAddFtContent: false,
				showBackTrans: false,
				info:{},
				students: [],
				emptyCurrentStudent: {
					honor: {
						index: 0,
						content: ''
					},
					weak0: {},
					weak1: {},
					weak2: {},
					weak3: {},
					weak4: {}
				}
			}
		},
		watch: {
			'modal$.show': function(v) {
				if(v) {
					if(this.frvw_id) {
						this.showFtContent() //从外教端
					}
					if(this.cattId) {
						this.get_class_attenadance(this.cattId) //从排课表
					}
					else if(!_.isEmpty(this.draft)) {			//从草稿
						this.setPostByReviewDraft(this.draft)
					}
					else if(!_.isEmpty(this.classAttendance)) {	//从授课记录
						this.setPostByAttendance(this.classAttendance)
					}
				}
			},
			'tab': function(v) {
				this.post = util.copy(emptyObject)
				this.$refs.content.setCurrentStudent(this.emptyCurrentStudent)
			}
		},
		computed: {
			
		},
		methods: {
			changeReview(row) {
				this.post.review_tpl_setting = row
				this.post.review_style = row.review_style
				this.post.rts_id = row.rts_id
				this.$refs.content.setCurrentStudent(this.emptyCurrentStudent)
				this.deal_students(this.students)
				this.setContent()
			},
			timeChange (val) {
				this.post.send_time = new Date(val).getTime() / 1000
			},
			chooseAttendance () {
				this.$refs.attendance.show('选择授课记录','add')
			},
			/*外教端相关*/
			showFtContent() {
				this.$rest('ft_reviews')
				.get({
					width: 'class_attendance',
					frvw_id: this.frvw_id
				})
				.success(res => {
					let list = res.list
					if(list.length) {
						let ft = list[0]
						this.info = util.copy(ft.class_attendance)
						this.showBackTransBtn(ft)
						this.addFtContent(ft)
					}
				})
			},
			addFtContent(data) {
				this.isAddFtContent = true
				if(data.sent_status==0) {
					this.changeFtStatus(1,this.eid$)
				}
				if(data.review&&data.review.is_draft==1) {
					this.setPostByReviewDraft(data.review) // 如果外教端保存了草稿直接取草稿
				}
				else {
					this.setPostByFtReview(data) // 没有草稿根据ft_review构造
				}
			},
			setPostByFtReview(row) {
				this.post.catt_id 			= row.catt_id
				this.post.bid 				= this.bid$
				this.post.cid 				= row.cid
				this.post.lid 				= row.lid
				this.post.eid 				= row.eid
				this.post.sj_id 			= row.sj_id
				this.post.ca_id				= row.ca_id
				this.post.int_day 			= row.int_day
				this.post.lesson_type 		= row.lesson_type
				this.post.int_end_hour 		= row.int_end_hour
				this.post.int_start_hour 	= row.int_start_hour
				this.post.rts_id 			= row.rts_id
				this.post.content 	        = row.content
				this.post.review_file 	    = row.ft_review_file
				this.post.review_student 	= row.ft_review_student

				this.getCTpl().then(() => {
					this.post.review_student.forEach(s => {
						if(s.student) {
							s._student_name = s.student.student_name
							s._nick_name = s.student.nick_name
							s._photo_url = s.student.photo_url
						}
						if(s.review_style==1) {			//外教端暂不支持专业课评模板
							for(let i in s.detail) {
								s[i] = s.detail[i]
							}
						}
					})
					this.setContentFirstStudent()
				})
			},
			showBackTransBtn(data) {
				if(data.trans_eid == 0) {
					this.showBackTrans = true
				}
				else {
					if(data.trans_eid == this.eid$) {
						this.showBackTrans = true
					}
				}
			},
			backTranslate() {
				this.confirm('撤销翻译后，翻译状态将变成未翻译，并取消指定翻译人，如果有草稿，草稿也会一并删除，确定撤销吗？')
				.then(() => {
					this.changeFtStatus(0,0)
				})
			},
			changeFtStatus(status,eid) {
				this.$http.post('ft_reviews/sent_status',{
					sent_status: status,
					id: this.frvw_id,
					trans_eid: eid
				})
				.then(res => {
					if(status==1) {
						this.$Message.success('请填写翻译内容')
						this.$emit('on-success')
					}
					else if(status==0) {
						this.$Message.success('撤销成功')
						this.$emit('on-success')
						this.close()
					}
				},res => {
					this.$Message.error(res.body.message)
				})
			},
			/*根据外部条件设置post参数，外教端不从这里*/
			setInfo (row) {
				if(this.catt_id > 0 && this.catt_id == row.catt_id){
					return
				}
				this.catt_id = row.catt_id;
				this.info = util.copy(row)
				if(row.review&&row.review.is_draft) {
					this.setPostByReviewDraft(row.review)
				}
				else{
					this.setPostByAttendance(row)
				}
			},
			/*根据考勤设置参数*/
			setPostByAttendance (row) {
				this.post = util.copy(emptyObject)
				if(!_.isEmpty(row)){
					//按考勤记录点评
					this.post.catt_id 			= row.catt_id
					this.post.bid 				= this.bid$
					this.post.cid 				= row.cid
					this.post.lid 				= row.lid
					this.post.eid 				= row.eid
					this.post.sj_id 			= row.sj_id
					this.post.ca_id				= row.ca_id
					this.post.int_day 			= row.int_day
					this.post.lesson_type 		= row.lesson_type
					this.post.int_end_hour 		= row.int_end_hour
					this.post.int_start_hour 	= row.int_start_hour
					this.post.rts_id 			= this.getTplId(row)

					this.getCTpl().then(() => {
						this.setContent()
						this.get_students()
					})
				}
			},
			/*自由课评*/
			setPostByCustom(students) {
				this.students = students
				this.setContent()
				this.deal_students(students)
			},
			/*获取草稿*/
			setPostByReviewDraft(data) {
				let review = util.copy(data)
				this.catt_id = data.catt_id
				review.review_student.forEach(s => {
					if(s.student) {
						s._student_name = s.student.student_name
						s._nick_name = s.student.nick_name
						s._photo_url = s.student.photo_url
					}
					if(s.review_style==1) {
						let detailObj = util.copy(s.detail)
						for(let i in detailObj) {
							s[i] = detailObj[i]
						}
					}
				})
				this.post = review
				this.post.is_late_send = 0
				this.students = review.review_student
				this.setContentFirstStudent()
			},
			/*获取点评学员*/
			get_students () {
				this.ready = false
				this.$rest('student_attendances')
				.get({
					catt_id:this.post.catt_id,
					pagesize:1000
				})
				.success(res => {
					this.students = res.list
					this.deal_students(res.list)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			/*构造参数review_students*/
			deal_students (data,isCustom = false) {
				if(data && data.length>0){

					// this.post.review_student = [];
					var array = [];

					data.forEach((d,index)=>{								
						let obj = {}
						
						if(isCustom) {				
							obj.sid = d.sid,
							obj._student_name = d._student_name
							obj._nick_name = d._nick_name
							obj._photo_url = d._photo_url
						}
						else {
							if(d.student){						
								obj.sid = d.student.sid,
								obj._student_name = d.student.student_name
								obj._nick_name = d.student.nick_name
								obj._photo_url = d.student.photo_url
							}
						}

						if(!this.isProReview) {
							obj.detail = this.currentTpl.setting.student_detail.default?this.currentTpl.setting.student_detail.default.tpl:''
							for(let s in this.scores){
								obj[s] = this.scores[s].value
							}
						}
						else {
							obj.detail = this.currentTpl.setting.student_fields.honor[0].teacher_say_tpl[0].content
							obj.honor = {
								index: 0,
								content: this.currentTpl.setting.student_fields.honor[0].desc[0].content
							}
							for(let s in this.styleScores){
								obj[s] = this.styleScores[s].value
							}
							for(let s in this.weeks){
								obj[s] = {
									value: 0,
									desc: ''
								}
							}
						}
						
						if(d.is_leave==1){
							//排除请假学员
							obj.is_leave = 1
							obj.$delete = true						
						}
						else {
							obj.is_leave = 0
							obj.$delete = false
						}

						array.push(obj)
					})
					this.$set(this.post,"review_student",array)
					this.setContentFirstStudent()
				}
			},
			/*设置默认第一个选中学员*/
			setContentFirstStudent() {
				let postStudent = this.studentList('post')
				if(postStudent.length) {
					this.$refs.content.setCurrentStudent(postStudent[0])
				}
			},
			/*发送/草稿*/
			ok (is_draft=0) {				
				let params = util.copy(this.post)
				let succMsg = ''
				let method = 'post'
				let $rest = this.$rest('reviews')
				if(is_draft) {
					succMsg = '草稿保存成功'
					params.is_draft = 1
				}
				else {
					if(this.isAddFtContent) {
						succMsg = '翻译并发送成功'
					}
					else {
						succMsg = '点评并发送成功'
					}
					params.is_draft = 0
				}

				params.review_student = params.review_student.filter(s=>!s.$delete)
				if(params.review_student.length==0){
					this.$Message.error('无可点评学员')
					return
				}
				params.frvw_id = this.frvw_id

				if(params.rts_id == -1) {
					params.rts_id = 0
				}
				if(params.rvw_id) {
					method = 'put'
					$rest = $rest.add_url_param(params.rvw_id)
				}
				$rest[method](params)
				.success(data=>{
					this.$Message.success(succMsg)
					this.$emit('on-success')
					this.close()
				})
				.error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'点评失败'
					})
				})
			},
			get_class_attenadance(catt_id) {
				this.$rest('class_attendances')
				.get({
					with:'cls,course_arrange,ft_review',
					catt_id:catt_id
				})
				.success(res => {
					if(res.list.length > 0) {
						this.setPostByAttendance(res.list[0])	
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		}
	}
</script>

<style scoped>
.styleTplModal {
	max-height: 660px;
	overflow: auto;
	overflow-x: hidden;
	padding-right: 10px;
}
</style>