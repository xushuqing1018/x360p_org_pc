<style lang="less">
	.course-tooltip.ivu-tooltip {
		width: 100%;
		.ivu-tooltip-rel {
			width: 100%;
		}
	}
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
			right: 0;
			top: 0;
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
				color: red;
				border-color: red;
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

	.day-cell-wrap {
		text-align: center;
		padding: 10px 0px !important;
		font-size: 14px;
	}

	.cell-poptip-content {
		color: #657180;
	}
</style>
<template>
	<div :class="['cell-wrap',background_color]" class='day-cell-wrap' @click.stop="showDetail">
		<Poptip trigger="hover" title="排课详请" placement="right">
			<div>
				<span class="lesson-type">{{tagName}}</span>
				<span>{{teachObject(data)}}</span>
			</div>
			<div slot="content" class="cell-poptip-content">
				<div>
					<Icon type="android-bookmark"></Icon>
					<span>{{data.lid|lesson_name}}</span>
					<span v-if="data.textbook_section"><第{{data.textbook_section.sort}}章{{data.textbook_section.section_title}}></span>
					<template v-else>
						<span>/</span>
						<span>{{data.sj_id|subject_name}}</span>
					</template>
				</div>
				<div>
					<template v-if="view!=='teacher'">
						<Icon type="ios-person"></Icon>
						<span>{{data.teach_eid|ename('未知')}}</span>&nbsp;
					</template>
					<template v-if="view!=='classroom'">
						<Icon type="home"></Icon>
						<span>{{data.cr_id|classroom_name('未知')}}</span>
					</template>
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
				course_students: ''
			}
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
					let ret = [],
						retjoin = ''
					res.students.forEach(s => {
						if(s.sid&&s.student) {
							ret.push(s.student.student_name)
						}
						if(s.cu_id&&s.customer) {
							ret.push(s.customer.name)
						}
					})
					this.course_students = ret.join('，')
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