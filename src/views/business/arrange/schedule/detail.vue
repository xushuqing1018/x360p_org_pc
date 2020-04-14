<style lang="less">
	.arrange-detail-modal {
		.info-item>label{
			width: 80px;
			text-align: right;
		}
		.student-item {
			padding-bottom: .5rem;
			padding-top: .5rem;
			border-bottom: 1px solid #eee;
			&:last-child {
				border-bottom: 0;
			}
			&:first-child {
				padding-top: 0;
			}
			.ivu-progress .ivu-progress-outer {
				width: 90%;
			}
		}
		.ivu-card-body {
			max-height: 320px;
			overflow: auto;
		}
	}
</style>
<template>
	<Modal v-drag-modal 
	v-model="modal$.show" 
	:title="modal$.title" 
	:mask-closable="false" 
	width="600" 
	class="arrange-detail-modal">
		<template v-if="!is_empty">
			<ul>
				<li class="info-item" v-if="hasMultiBranch"><label>上课校区：</label>
					{{data.bid|branch_name}}
				</li>
				<li class="info-item"><label>上课时间：</label>
				{{data.int_day|int_date}}   {{data.int_start_hour|int_hour}}~{{data.int_end_hour|int_hour}}
				
				<Tag color="red" v-if="data.is_cancel == 1">已取消</Tag>
				<Tag :color="attend(data.is_attendance,'color')" v-else>{{attend(data.is_attendance,'label')}}</Tag>

				</li>
				<li class="info-item"><label>上课{{'老师'|translate}}：</label>
				{{data.teach_eid|ename}}</li>
				<li class="info-item"><label>上课对象：</label>
				{{teachObject(data)}}</li>
				<li class="info-item" v-if="data.tb_id&&data.tbs_id"><label>授课内容：</label>
				{{course_content}}</li>
				<li class="info-item"><label>课程科目：</label>
					{{data.lid|lesson_name}}/ {{data.sj_id|subject_name}}
					<Dropdown trigger="click" class="pull-right" placement="bottom-end">
						<Button type="primary" size="small">
							操作 <Icon type="arrow-down-b"></Icon>
						</Button>
						<DropdownMenu slot="list">
							<template v-if="from=='schedule'&&data.is_attendance>0">
								<DropdownItem @click.native="viewComments" v-if="data.review" v-per="'schedule.viewreview'">
									<Icon type="eye"></Icon> 查看课评
								</DropdownItem>
								<DropdownItem @click.native="addComments" v-if="!data.review&&data.class_attendance" v-per="'schedule.addreview'">
									<Icon type="plus"></Icon> 添加课评
								</DropdownItem>
							</template>
							<template v-if="data.is_attendance==0">
								<Dropdown placement="right-start">
									<DropdownItem>
					                    调整
					                    <Icon type="ios-arrow-right"></Icon>
					                </DropdownItem>
									<DropdownMenu slot="list">
										<DropdownItem @click.native="arrangeChange('time',data)" v-per="'schedule.changearrange'">
											<Icon type="ios-clock"></Icon> 调整时间
										</DropdownItem>
							            <DropdownItem @click.native="arrangeChange('teacher',data)" v-per="'schedule.changearrange'">
							            	<Icon type="person"></Icon> 更换{{'老师'|translate}}
							            </DropdownItem>
							            <DropdownItem @click.native="arrangeChange('ss',data)" v-per="'schedule.changearrange'">
							            	<Icon type="person-stalker"></Icon> 更换{{'助教'|translate}}
							            </DropdownItem>
							            <DropdownItem @click.native="arrangeChange('room',data)" v-per="'schedule.changearrange'">
							            	<Icon type="ios-home"></Icon> 更换教室
							            </DropdownItem>
					            	</DropdownMenu>
					            </Dropdown>
					            <DropdownItem @click.native="delayArrange(data)" v-per="'arrange.add'">
									<Icon type="ios-copy"></Icon> 顺延排课
								</DropdownItem>
					            <DropdownItem @click.native="cancelArrange(data)" v-if="data.is_cancel == 0" v-per="'arrange.cancel'">
									<Icon type="ios-close"></Icon> 取消排课
								</DropdownItem>
								<DropdownItem @click.native="deleteArrange" v-per="'schedule.deletearrange'">
									<Icon type="ios-trash"></Icon> 删除排课
								</DropdownItem>
								<DropdownItem @click.native="regAttendance(data)" v-per="'dashboard.attendance'">
									<Icon type="ios-calendar"></Icon> 登记考勤
								</DropdownItem>
								<!--
								todo:
								<DropdownItem @click.native="addOneStudent(data)" v-if="show_add_menu">
									<Icon type="ios-plus"></Icon> 添加学员
								</DropdownItem>
							-->
							</template>
						</DropdownMenu>
					</Dropdown>
				</li>
			</ul>
			<Card dis-hover class="mt-2">
				<div slot="title">上课学员</div>
				<template v-if="data.students.length>0">
					<Row 
						type="flex" 
						justify="center" 
						align="middle" 
						class="student-item" 
						v-for="item in data.students"
						>
						<template v-if="item.sid > 0">
							<Col span="6">
								<letter-avatar
									size="80"
									:name="item.student.student_name"
									:src="item.student.photo_url"
									:rounded="true"
									@click.native.stop="picturePreview(item.student.photo_url)">
								</letter-avatar>
							</Col>
							<Col span="18">
								<p>
									<avatar-and-name 
									:show-avatar="false"
									:src="item.student.photo_url" 
									:name="item.student.student_name" 
									:nickname="item.student.nick_name"
									:sex="item.student.sex"
									:detail-action="2"
									:sid="item.student.sid">						
									</avatar-and-name>
								</p>
								<Row>
									<Col span="8">
										<span>剩余课时/总课时：</span>
									</Col>
									<Col span="16">
										<Progress
											:percent="100*(item.student.student_lesson.remain_lesson_hours/item.student.student_lesson.lesson_hours)" 
											:storkeWidth="5">
											{{item.student.student_lesson.remain_lesson_hours}}/{{item.student.student_lesson.lesson_hours}}
										</Progress>
									</Col>
								</Row>
							</Col>
						</template>
						<template v-if="item.cu_id > 0">
							<Col span="6">
								<letter-avatar
									size="80"
									:name="item.customer.name"
									:rounded="true">
								</letter-avatar>
							</Col>
							<Col span="18">
								<p>{{item.customer.name}}&nbsp;<Tag color="yellow">试</Tag></p>
							</Col>
						</template>
					</Row>
				</template>
				<p v-else class="text-center">没有学员...</p>
			</Card>
		</template>
		<template v-else>
			<div class="ivu-spin-fix">
				<div class="ivu-spin-main">
					<span class="ivu-spin-dot"></span>
				</div>
			</div>
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	    
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import LetterAvatar from 'c%/LetterAvatar.vue'
	

	export default {
		mixins: [modal,common,globals],
		components: {
			LetterAvatar
			
		},
		props: {
			from: {
				type: String,
				default: 'grid'
			}
		},
		data() {
			return {
				ca_id: 0,
				data: {}
			}
		},
		computed: {
			is_empty() {
				return _.isEmpty(this.data)
			},
			course_content() {
				let result = ''
				let textbook = this.data.textbook
				let section = this.data.textbook_section
				if(textbook) {
					result = textbook.tb_name
				}
				if(section) {
					result += `第${section.sort}章：${section.section_title}`
				}
				return result
			},
			show_add_menu(){
				if(
					this.data.lesson_type == 2 && 
					(
					this.data.student_limit == 0 || 
					this.data.students.length < this.data.student_limit
					)
				){
					return true
				}
				return false
			}
		},
		methods: {
			init_data() {
				if(this.ca_id==0) return
				this.$rest('course_arranges').add_url_param(this.ca_id)
				.get({
					with:'students,one_class,review,class_attendance,textbook,textbook_section'
				})
				.success(res=>{
					this.data = res
				})
				.error(res=>{
					this.$Message.error(res.body.message)
				})
			},
			attend(v,type) {
				let map = {
						0:{color:'#2d8cf0',label:'未考勤'},
						1:{color:'#5cadff',label:'部分考勤'},
						2:{color:'#19be6b',label:'已考勤'}
					}
				return type=='label'?map[v].label:map[v].color
			},
			remain_lesson_hours(data) {
				return util.sprintf('剩余课次/总课次：%s/%s',data.student_lesson_remain_hours,data.student_lesson_hours)
			},
			teachObject(data) {
				let result = ''
				
				if(data.lesson_type===0){
					if(data.is_trial===1||data.is_makeup===1){
						result = data.name
					}else{
						if(data.one_class!=null){
							result = data.one_class.class_name
						}	
					}	
				}else{
					let students = data.students
					if(data.students.length>0){
						data.students.forEach((s,i)=>{
							if(i<3){
								result += s.student.student_name+','
							}
						})
					}
					result = result.substring(0,result.length-1)
					if(data.students.length>3){
						result += '等'
					}
				}
							
				return result
			},
			deleteArrange() {
				if(this.data.is_attendance!==0) return
				this.confirm('您确定要删除这条排课信息吗?')
	            .then(()=>{
	                this.$rest('course_arranges')
	                .delete(this.data.ca_id)
	                .success(res=>{
	                	this.$Message.success('删除成功')
	                	this.$emit('on-success')
	                	this.close()
	                })
	                .error(res=>{
	                	this.error(res.body.message)
	                })
	            })      
			},
			viewComments() {
				this.$rest('reviews')
				.get({
					rvw_id: this.data.review.rvw_id,
					with: 'review_tpl_setting'
				})
				.success(res => {
					if(res.list.length > 0) {
						this.$Modal.open('components/ReviewModal.vue@modal',{
							props: {
								currentTplProp: res.list[0].review_tpl_setting
							}
						})
						.then(modal => {
							modal
							.set('scene', 'view')
							.set('post', util.copy(res.list[0]))
							.show('课评详情','view')
						})
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			addComments() {
				this.$Modal.open('components/review/index.vue@modal',{
					props: {
						'catt-id': this.data.class_attendance.catt_id,
						'fixed-object': true
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.show('添加课评')
				})
			},
			arrangeChange(type,data) {
				let map_title = {
					'time':'调整上课时间', 
					'teacher':'更换上课'+this.$filter('translate')('老师'),
					'ss':'更换'+this.$filter('translate')('助教'),
					'room':'更换上课教室'},
					title = map_title[type]

				this.$Modal.open('business/class/arrange/change-info-modal.vue',{
					on:{
						'on-ok':(obj) => {
							this.changeOk(obj)
						}
					}
				})
				.then(modal => {
					modal
					.set('type',type)
					.set('data',[util.copy(this.data)])
					.set('copyData',[util.copy(this.data)])
					.set('info',this.data)
					.show(title,'add')
				})
			},
			changeOk (obj) {				
				let params = this.initPostData(obj)
				
				if(params.length){
					this.$rest('course_arranges/update_course').post(params)
					.success(data=>{
						this.$Message.success('调课成功')
						this.$emit('on-success')
						this.close()
					}).error(response=>{
						this.error(response.body.message||'调课失败~','调课操作提示')
						
					})
				}else{
					this.$Message.error('请先选择排课')
					return
				}
			},
			initPostData (obj) {
				let post_data = util.copy(obj),
					result = [],
					ca_ids = [this.data.ca_id]
				
				if(ca_ids.length&&post_data.length){
					ca_ids.forEach(c=>{
						let obj = post_data.find(p=>p.ca_id==c)
						result.push(obj)						
					})
				}
				return result
			},
			regAttendance(item) {
				let class_name = this.setTitle(item),				
					title = util.sprintf('登记考勤【%s】',class_name)
					
				if(item.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',class_name)
				}
				
				if(item.class_attendance){
					item.lesson_remark = item.class_attendance.lesson_remark 
				}
				
				this.$Modal.open('business/attendance/attendance/index.vue@modal',{
					on: {
						'on-success': ()=>{
							this.init_data()
							this.$emit('on-success')
						}
					}
				})
				.then(modal=>{
					modal.set('arrange',item)
					.set('ca_id',item.ca_id)
					.show(title)
				})
			},
			setTitle (item) {
				let result = '',
					mapTitle = {1:'一对一',2:'一对多'}
				
				if(item.lesson_type===0){
					if(item.is_trial===1||item.is_makeup===1){
						result = item.name
					}else{
						if(item.one_class!=null){
							result = item.one_class.class_name
						}	
					}	
				}else{
					result = mapTitle[item.lesson_type]
				}
							
				return result
			},
			cancelArrange(arrange){
	            this.$Modal.open('business/arrange/cancel-arrange-modal.vue',{
	                on:{
	                    'on-success':()=>{
	                        this.init_data()
	                    }
	                }
	            })
	            .then(modal=>{
	                modal.set('info',arrange)
	                .show('取消排课','add')
	            })
	        },
	        addOneStudent(arrange){

	        },
	        delayArrange(arrange){
	        	this.$Modal.open('business/arrange/calendar/delay-arrange.vue@modal',{
	        		props: {
	        			'arrange':arrange
	        		},
	        		on: {
	        			'on-success':() => {
	        				this.$emit('on-success')
	        			}
	        		}
	        	})
	        	.then(modal => {
	        		modal.show('顺延排课')
	        	})
	        }
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.init_data()
				}
			}
		}
	}
</script>