<style lang="less">
	.cell-wrap {
		position: relative;
		padding: 4px;
		cursor: pointer;
		&.arranged {
			background: #50a8ff;
			color: #fff;
		}
		&.attendanced {
			background: #19be6b;
			color: #fff;
		}
		&.part-attendanced {
			background: #ff9900;
			color: #fff;
		}
		&.cancel{
			color:#888;
			background:#eee;
		}
		.review {
			position: absolute;
			right: -6px;
			top: -6px;
			width: 22px;
			height: 22px;
		    border-radius: 0 0 0 18px;
		    border: 1px solid #fff;
		    border-top: 0;
		    border-right: 0;
			padding: 5px;
			color: #fff;
			line-height: 13px;
			&.absence {
				color: #ed4014;
				border-color: #ed4014;
			}
		}
		.lesson-type {
		    width: 18px;
		    height: 14px;
		    background: #fff;
		    color: #657180;
		    padding: 2px 4px;
		}
	}
	.day1-cell-wrap {
		padding: 6px;
		font-size: 12px;
		.students {
			margin-top: 4px;
		}
		.course-name {
			position: relative;
			margin-bottom: 5px;
			&:after {
				position: absolute;
				content: ' ';
				display: block;
				bottom: -3px;
				left: 0;
				right: 0;
				border-bottom: 1px solid #d7dde4;
				transform: scaleY(0.5);
			}
		}
		.ivu-poptip, .ivu-poptip-rel {
			display: block;
		}
		.ivu-poptip .ivu-poptip-popper {
			color: #657180;
		}
	}
</style>
<template>
	<div :class="['cell-wrap',background_color]" class='day1-cell-wrap' @click.stop="showDetail">
		<Poptip trigger="hover" title="学员" placement="bottom">
			<div slot="content">
				<div v-for="item in students" :key="item.sid">
					<p v-if="item.student">
						<span class="grade" v-if="show_student_grade">{{item.student.school_grade|dict_title('grade','-')}}</span>
						<span>{{item.student.student_name}}</span>
						<span class="pull-right" v-if="item.student.student_lesson">
							{{Number(item.student.student_lesson.remain_lesson_hours)}} / {{Number(item.student.student_lesson.lesson_hours)}}
						</span>
					</p>
					<p v-if="item.customer">{{item.customer.name}}</p>
				</div>
				<p v-if="students.length==0">没有学员</p>
			</div>
			<div @mouseenter="getCourseStudents">
				<div class="int_hour" v-if="view!=='section'">
					<span>{{data.int_start_hour|int_hour}} ~ {{data.int_end_hour|int_hour}}</span>
				</div>
				<div class="course-name">
					<span><span v-if="data.lesson_type==0">{{data.lid|lesson_name}} / </span>{{data.course_name}}</span>
					<span v-if="allow_empty_teachobj" style="margin-left: 10px;">{{getStudentLimitRate(data)}}</span>
					<span class="pull-right">{{tagName}}</span>
				</div>
				<div v-if="data.textbook_section">
					第{{data.textbook_section.sort}}章{{data.textbook_section.section_title}}
				</div>
				<div class="teacher">
					<Icon type="ios-person"></Icon>
					<span>{{data.teach_eid|ename}}</span>
				</div>
				<div class="classroom">
					<Icon type="home"></Icon>
					<span>{{data.cr_id|classroom_name('未知')}}</span>
				</div>
				<div class="branch" v-if="hasMultiBranch && bid$ != data.bid">
					<Icon type="location"></Icon>
					<span>{{data.bid|branch_name}}</span>
				</div>
				<div class="students" v-if="data.students">
					<p v-for="item in data.students" :key="item.sid">
						<Icon type="university"></Icon>
						<span class="grade" v-if="show_student_grade">{{item.school_grade|dict_title('grade','-')}}</span>
						<span>{{item.student_name}}</span>
					</p>
				</div>
				<div class="review" v-if="data.review&&absence_text===''">评</div>
				<div class="review absence" v-if="absence_text">{{absence_text}}</div>
			</div>
		</Poptip>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [common,globals],
		props: {
			data: {
				type: Object,
				default:() => {
					return {}
				}
			},
			view: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				tagName: '',
				students: []
			}
		},
		mounted() {
			this.teachObject(this.data)
		},
		computed: {
			background_color() {
				if(this.data.is_cancel == 1){
					return 'cancel'
				}
				switch(this.data.is_attendance) {
					case 0:
						return 'arranged';
					case 1:
						return 'part-attendanced';
					case 2: 
						return 'attendanced'
				}
			},
			absence_text() {
				if(this.data.lesson_type==1) {
					if(this.data.student_leave_count > 0) {
						return '假'
					}
					if(this.data.student_absence_count > 0) {
						return '缺'
					}
					return ''
				}
				return ''
			}
		},
		methods: {
			showDetail() {
				this.$Modal.open('business/arrange/schedule/detail.vue@modal',{
					props: {
						from:'schedule'
					},
					on: {
						'on-success':()=>{
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal.vuec
					.set('ca_id',this.data.ca_id)
					.show('排课详情','view')
				})
			},
			getCourseStudents() {
				this.$rest('course_arranges').add_url_param(this.data.ca_id)
				.get({
					with:'students'
				})
				.success(res=>{
					this.students = res.students
				})
				.error(res=>{
					this.$Message.error(res.body.message)
				})
			},
			refreshData() {
				this.$emit('on-refresh')
			},
			formatSection(data) {
				return util.sprintf('%s~%s',this.$filter('int_hour')(data.int_start_hour),
					this.$filter('int_hour')(data.int_end_hour))
			},
			getStudentLimitRate(data) {
				if(data.lesson_type == 0) {
					return ''
				}
				else {
					return data.students.length + '/' + data.student_limit
				}
			},
			teachObject(data) {
				let result = ''
				
				if(data.lesson_type===0){
					if(data.is_trial===1||data.is_makeup===1){
						result = data.name
						this.tagName = data.is_trial===1?'试':'补'
					}else{
						if(data.one_class!=null){
							result = data.one_class.class_name
							this.tagName = '班'
						}	
					}	
				}else{
					let students = data.students
					if(data.lesson_type===1) {
						this.tagName = '一'
					}
					if(data.lesson_type===2) {
						this.tagName = '多'
					}
					if(data.lesson_type===3) {
						this.tagName = '研学'
					}
					if(data.students.length>0){
						data.students.forEach((s,i)=>{
							if(i<3){
								result += s.student_name+','
							}
						})
					}
					result = result.substring(0,result.length-1)
					if(data.students.length>3){
						result += '等'
					}
				}
							
				return result
			}
		}
	}
</script>