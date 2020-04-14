<style lang="less">
@border-color: #F4F5F9;
.service-register {
	.service-object {
		.ivu-card-body {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 10px 16px 16px;
		}
		.edu,
		.teach {
			flex: 0 0 90px;
			text-align: center;
		}
		.first-info,
		.second-info {
			flex: 1;
			>p {
				display: flex;
				>label {
					flex: 0 0 80px;
				}
				>span {
					flex: 1;
				}
			}
		}
	}
	.service {
		.ivu-tabs-nav-wrap {
			background: #eff4f8;
		}
		.ivu-tabs-nav .ivu-tabs-tab {
			padding: 10px 28px;
		}
		.personality,
		.classes {
			position: relative;
			text-align: center;
			>span {
				position: absolute;
				top: 7px;
				left: 10px;
			}
			table {
				width: 100%;
				th,td {
					font-weight: normal;
					padding: 8px 10px;
					border: 1px solid @border-color;
					>label {
						margin-bottom: 0!important;
					}
					.ivu-btn-circle.ivu-btn-icon-only.ivu-btn-small {
						width: 20px;
						height: 20px;
					}
				}
				td.complete-td {
					position: relative;
					.operate-btn {
						position: absolute;
						right: 5px;
					}
				}
			}
			.student-wrapper {
				display: flex;
				height: 120px;
				border: 1px solid @border-color;
				.pre-btn,
				.next-btn {
					width: 30px;
					display: flex;
					justify-content: center;
					align-items: center;
					cursor: pointer;
					&:hover {
						background: #f8f8f9;
					}
				}
				.pre-btn {
					border-right: 1px solid @border-color;
				}
				.next-btn {
					border-left: 1px solid @border-color;
				}
				.student-container {
					flex: 1;
					overflow: hidden;
				}
				.student-list {
					display: flex;
					flex-direction: row;
					will-change: transform;
					transition: transform .3s ease-in-out;
					align-items: center;
					.student {
						width: 12.5%;
						display: inline-block;
						text-align: center;
						flex-shrink: 0;
						position: relative;
						cursor: pointer;
						.ivu-rate {
							display: block;
							font-size: 14px;
							margin-bottom: 6px;
							.ivu-rate-star {
								margin-right: 0px;
							}
						}
						.name {
							display: block;
						    width: 100%;
						    margin-top: 6px;
						    overflow: hidden;
						    white-space: nowrap;
						    text-overflow: ellipsis;
						}
						.ivu-icon-close-circled {
							position: absolute;
							right: 14px;
						    top: 22px;
						    font-size: 18px;
						    color: #ed3f14;
						    opacity: 1;
						    cursor: pointer;
						}
						&.active {
							background: #DDEEFF !important; 
						}
						&:hover {
							background: #e2e9f1;
						}
						.ivu-tabs-ink-bar {
							width: 88px;
							height: 3px;
							bottom: -2px;
						}
					}
				}
			}
		}
	}
}
</style>
<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="800">
		<div class="service-register">
			<Card dis-hover :bordered="false" class="service-object">
				<div class="edu" v-if="attendance.one_class.edu_eid">
					<letter-avatar 
        				size="55"
        				:src="attendance.one_class.edu_photo" 
        				:name="$filter('ename')(attendance.one_class.edu_eid)" 
        				:rounded="true">
        			</letter-avatar>
        			<p>{{attendance.one_class.edu_eid|ename}}</p>
        			<p>{{label_eduer}}</p>
				</div>
				<div class="teach" style="margin-right: 30px;">
					<letter-avatar 
        				size="55"
        				:src="attendance.one_class.teach_photo" 
        				:name="$filter('ename')(attendance.one_class.teach_eid)" 
        				:rounded="true">
        			</letter-avatar>
        			<p>{{attendance.one_class.teach_eid|ename}}</p>
        			<p>{{label_teacher}}</p>
				</div>
				<div class="first-info">
					<p>
						<label>所属校区：</label>
						<span>{{attendance.one_class.bid|branch_name}}</span>
					</p>
					<p>
						<label>默认教室：</label>
						<span>{{attendance.one_class.cr_id|classroom_name}}</span>
					</p>
					<p>
						<label>开课日期：</label>
						<span>{{attendance.one_class.start_lesson_time}}</span>
					</p>
					<p>
						<label>满班率：</label>
						<span>
							<Progress 
								:strokeWidth="8" 
								:percent="attendance.one_class.nums_rate*100" 
								style="width: 80%;">
								{{attendance.one_class.student_nums+'/'+attendance.one_class.plan_student_nums}}
							</Progress>
						</span>
					</p>
				</div>
				<div class="second-info">
					<p>
						<label>授课对象：</label>
						<span>{{attendance.course_name}}</span>
					</p>
					<p>
						<label>授课时间：</label>
						<span>{{attendance.int_day|int_date}}&nbsp;
								{{attendance.int_start_hour|int_hour}}~{{attendance.int_end_hour|int_hour}}
						</span>
					</p>
					<p>
						<label>科目：</label>
						<span>{{attendance.one_class.sj_id|subject_name}}</span>
					</p>
					<p>
						<label>课程进度：</label>
						<span>
							<Progress 
								:strokeWidth="8" 
								:percent="attendance.one_class.attendance_times/attendance.one_class.arrange_times*100" 
								style="width: 80%;">
								{{attendance.one_class.attendance_times+'/'+attendance.one_class.arrange_times}}
							</Progress>
						</span>
					</p>
				</div>
			</Card>
			<div class="service">
				<Tabs>
					<TabPane label="课堂">
						<div class="classes">
							<span>班级服务</span>
							<RadioGroup v-model="classroom_time" type="button">
								<Radio label="before">课前</Radio>
								<Radio label="in">课中</Radio>
								<Radio label="after">课后</Radio>
							</RadioGroup>
							<table class="mt-4">
								<thead>
									<tr>
										<th>服务类型</th>
										<th>完成情况</th>
										<th>备注</th>
										<th>附件</th>
									</tr>
								</thead>
								<tbody>
									<template v-for="(value,key) in service_standard_data.classroom" v-if="key == classroom_time">
										<tr v-for="item in value" v-if="item.object == 0">
											<td>{{item.title}}</td>
											<td class="complete-td">
												<Checkbox 
													v-model="item.is_complete" 
													:readonly="item.finish">
												</Checkbox>
												<Button 
													class="operate-btn"
													type="primary" 
													size="small" 
													shape="circle" 
													icon="ios-arrow-right"
													title="立即操作"
													v-if="item.system==0">
												</Button>
											</td>
											<td>
												<Input 
													v-model="item.remark" 
													placeholder="请输入备注" 
													style="width: 350px">
												</Input>
											</td>
											<td>
												<Badge :dot="item.file.length>0">
													<Icon type="document" size="18"></Icon>
												</Badge>
											</td>
										</tr>
									</template>
								</tbody>
							</table>
						</div>
						<p class="text-center m-3">
							<a class="text-info" @click="show_all=!show_all">
								{{show_all?'收起':'展开个性服务'}}
								<Icon :type="show_all?'chevron-up':'chevron-down'"></Icon>
							</a>
						</p>
						<div class="personality" v-if="show_all">
							<span>个性服务</span>
							<RadioGroup v-model="current_star" type="button" size="small">
								<Radio :label="item.value" v-for="item in filter_stars">{{item.text}}</Radio>
							</RadioGroup>
							<div class="student-wrapper mt-2">
								<div class="pre-btn" @click="prevPageStudent">
									<Icon type="chevron-left"></Icon>
								</div>
								<div class="student-container">
									<div class="student-list" :style="{transform: 'translateX(-'+(page-1)*100+'%) translateZ(0px)'}">
										<div 
											:class="[
												'student',
												{'active': currentSid == item.student.sid}
											]" 
											v-for="item in attendance.students"
											@click="currentSid = item.student.sid">
											<Rate :value="item.student.service_level" :count="service_level_config" disabled></Rate>
											<letter-avatar
												size="60"
												rounded
												:src="item.student.photo_url"
												:name="item.student.student_name">
											</letter-avatar>
											<div class="ivu-tabs-ink-bar" v-if="currentSid==item.student.sid"></div>
											<span class="name">{{item.student.student_name}}</span>
											<Icon type="close-circled" @click.native.stop="delStudent(item.student)"></Icon>
										</div>
									</div>
								</div>
								<div class="next-btn" @click="nextPageStudent">
									<Icon type="chevron-right"></Icon>
								</div>
							</div>
							<table class="mt-2">
								<thead>
									<tr>
										<th>服务类型</th>
										<th>完成情况</th>
										<th>备注</th>
										<th>附件</th>
									</tr>
								</thead>
								<tbody>
									<template v-for="(value,key) in service_standard_data.classroom" v-if="key == classroom_time">
										<tr v-for="item in value" v-if="item.object == 1">
											<td>{{item.title}}</td>
											<td class="complete-td">
												<Checkbox 
													v-model="item.is_complete" 
													:readonly="item.finish">
												</Checkbox>
												<Button 
													class="operate-btn"
													type="primary" 
													size="small" 
													shape="circle" 
													icon="ios-arrow-right"
													title="立即操作"
													v-if="item.system==0">
												</Button>
											</td>
											<td>
												<Input 
													v-model="item.remark" 
													placeholder="请输入备注" 
													style="width: 350px">
												</Input>
											</td>
											<td>
												<Badge :dot="item.file.length>0">
													<Icon type="document" size="18"></Icon>
												</Badge>
											</td>
										</tr>
									</template>
								</tbody>
							</table>
						</div>
					</TabPane>
					<TabPane label="学期">
						
					</TabPane>
				</Tabs>
			</div>
			
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	import LetterAvatar from 'c%/LetterAvatar.vue' 
	export default {
		mixins: [modal,common,globals],
		props: {
			arrange: {
				type: Object,
				default:() => {
					return {}
				}
			}
		},
		components: {
			LetterAvatar
		},
		data() {
			return {
				show_all: false,
				current_star: 'all',
				currentSid: 1,
				page: 1,
				attendance: {
					int_day: 20180822,
					int_start_hour: 1915,
					int_end_hour: 2000,
					course_name: '少儿英语班周日周二8点',
					one_class: {
						bid: 2,
						cr_id: 1,
						sj_id: 1,
						arrange_times: 10,
						attendance_times: 2,
						lesson_times: 10,
						end_lesson_time: '2018-10-18',
						start_lesson_time: '2018-09-20',
						plan_student_nums: 16,
						student_nums: 9,
						nums_rate: 0.58,
						edu_eid: 10004,
						edu_photo: '',
						teach_eid: 10005,
						teach_photo: ''
					},
					students: []
				},
				loading:false,
				term: 'first',
				classroom_time: 'after',
				service_standard_data: {
					classroom: {
						after: [
							{
								enable: 1,
								name: 'review',
								need_attach: 0,
								object: 0,
								service_level:0,
								rids: [1], 
								system: 1,
								title: '课评',
								remark: '',
								finish:false,
								file: []
							},
							{
								enable: 1,
								name: 'homework',
								need_attach: 0,
								object: 0,
								service_level:0,
								rids: [1], 
								system: 1,
								title: '作业',
								remark: '',
								finish: false,
								file: []
							},
							{
								enable: 1,
								name: 'did_1014',
								need_attach: 1,
								object: 1,
								service_level:4,
								rids: [1,2], 
								system: 0,
								title: '体验课服务',
								remark: '',
								finish: false,
								file: []
							}
						],
						before: [],
						in: []
					},
					term: {
						first: [
							{
								enable: 1,
								name: 'did_236',
								need_attach: 1,
								object: 1,
								service_level:0,
								rids: [11], 
								system: 0,
								title: '学情服务',
								remark: '',
								finish:false,
								file: []
							},
							{
								enable: 1,
								name: 'did_1012',
								need_attach: 1,
								object: 0,
								service_level:0,
								rids: [1,2], 
								system: 0,
								title: '备课服务',
								remark: '',
								finish: false,
								file: []
							}
						],
						last: [],
						middle: []
					}
				}
			}
		},
		computed: {
			filter_stars() {
				let ret = [],
					number_text = ['0','一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
				for(let i=0;i<=this.service_level_config;i++) {
					ret.push({
						value: i,
						text: number_text[i] + '星'
					})
				}
				ret.push({
					value: 'all',
					text: '全部'
				})
				return ret
			}
		},
		mounted() {

		},
		methods: {
			onModalOpen() {
				this.attendance = this.arrange
				// this.init_service_standard()
			},
			prevPageStudent() {
				if(this.page > 1) {
					this.page-- 
				}
			},
			init_service_standard() {
				this.$rest('configs?cfg_name=service_standard')
				.get()
				.success(res => {
					this.service_standard_data = res.cfg_value
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			nextPageStudent() {
				if(this.page*8 < this.student_list.length) {
					this.page++
				}
			},
			delStudent() {

			},
			ok() {

			}
		}
	}
</script>