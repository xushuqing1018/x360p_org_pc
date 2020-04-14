<style lang="less">
	.student-info-page {
		.ivu-card {
			font-size: 12px;
			.ivu-card-head {
				padding: 12px 10px;
				i {
					vertical-align: -1px;
					font-size: 14px;
				}
			}
			.ivu-card-body {
				padding: 10px;
			}
		}
		label {
			margin-bottom: 0 !important;
		}
		.ivu-tabs-tab{
			padding:2px 3px;
			margin-right:2px;
		}
		.ivu-tabs-ink-bar{
			display:none;
		}
		.roll {
			  position: fixed;
    		right: 12px;
    		z-index: 99999;
		}
	}
</style>
<template>
	<div class="c-grid student-info-page">
		<div class="padder-sm row">
			<div class="col-sm-12">
				<Button type="primary" icon="chevron-left" size="small" @click="back" v-if="!$x_in_modal&&!inModal"></Button>
				<Button type="primary" icon="refresh" size="small" @click="refreshData"></Button>
				<operation-items 
					class="roll"
					:info="data" 
					:refs="$refs" 
					sub-placement="left-start" 
					v-if="!$x_in_modal"
					@success="refreshData">
				</operation-items>
			</div>
			<data-ready ref="dr" :cache="false" :data="info_url" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-2">
				<Card dis-hover>
					<img 
						src="http://sp1.xiao360.com/static/ui/pc/suspension.png"
						v-if="data.status == 30" 
						style="position: absolute;top: 20px;right: 20px;z-index: 100" 
					/>
					<div slot="title">
						<Icon type="ios-person"></Icon>
						学员信息
					</div>
					<div class="row" style="align-items:center;justify-content:center;">
						<div class="col-sm-4">
							<div style="align-items:center;justify-content:center;">
								<div class="avatar-wrap">
									<Tooltip placement="top">
			            				<span slot="content">
			            					总课时：{{data.student_lesson_hours}}<br>
			            					消耗课时：{{data.student_lesson_hours-data.student_lesson_remain_hours}}<br>
			            					剩余课时：{{data.student_lesson_remain_hours}}
			            				</span>
				            			<i-circle 
				            			:percent="circlePercent" 
				            			:stroke-width="5" 
				            			:stroke-color="circleColor"
				            			:size="110">
									        <letterAvatar 
												@click.native="picturePreview(data.photo_url)" 
												:name='data.student_name' 
												:src="data.photo_url" 
												size='100' 
												:rounded="true">
											</letterAvatar>
									    </i-circle>			
								    </Tooltip><br>							
									<Button 
										class="mt-2 mb-2" 
										type="ghost" 
										@click="changeAvatar" 
										icon="ios-camera-outline" 
										size="small">更换头像
									</Button>
								</div>
								<div class="profile-wrap">
									<h3 class="text-center">
										{{data.student_name}}										
										<span class="ml-3">{{data.sex|sex}}</span>
									</h3>
									<Form :label-width="110">
										<Form-item label="昵称" class="mb-0">
											{{data.nick_name||'未填写'}}
										</Form-item>
										<Form-item label="生日" class="mb-0">
											<span v-if="data.birth_year>0">{{data.birth_time}}</span>
											<Tag color="blue">{{age}}</Tag>
										</Form-item>
										<Form-item label="账户余额" class="mb-0">
											<Tag color="red">{{label_currency}}
											    {{data.money+Number(data.present_money)}}
											</Tag>
											<Tag @click="moneyDetail" v-if="hasPer('student.wallet')">余额详情</Tag>
										</Form-item>
										<Form-item label="学习/消费积分" class="mb-0">
											<Tag color="blue">{{data.credit}}</Tag>
											<Tag color="blue">{{data.credit2}}</Tag>
											<Tag v-if="hasPer('student.credit')" @click="creditDetail">积分详情</Tag>
										</Form-item>
										<Form-item label="会员等级" class="mb-0" v-if="enable_vip&&data.vip_level>-2">
											<Tag color="blue">{{data.vip_level===-1?'非会员':this.vip_level_config[data.vip_level].name}}</Tag>
										</Form-item>
									</Form>									
								</div>
							</div>
						</div>
						<div class="col-sm-8">
							<Card dis-hover>
								<div slot="title">
									<Icon type="information-circled"></Icon>
									基本信息
								</div>
								<div>
									<Form :label-width="labelWidth" class="row">
										<Form-item label="校区：" class="mb-0 col-sm-4">
											{{data.bid|branch_name}}
										</Form-item>
										<Form-item label="学校：" class="mb-0 col-sm-4" v-if="isEF('school_id','student')">
											{{data.school_id_text||'未设置'}}
										</Form-item>
										<Form-item label="学号：" class="mb-0 col-sm-4" v-if="isEF('sno','student')">
											{{data.sno||'未设置'}}
										</Form-item>
										<Form-item label="身份证号：" class="mb-0 col-sm-4" v-if="isEF('id_card_no','student')">
											{{data.id_card_no||'未设置'}}
										</Form-item>
										<Form-item label="年级：" class="mb-0 col-sm-4" v-if="isEF('school_grade','student')">
											{{school_grade}}
										</Form-item>
										<Form-item label="班级：" class="mb-0 col-sm-4" v-if="isEF('school_class','student')">
											{{data.school_class||'未设置'}}
										</Form-item>
										<Form-item label="卡号：" class="mb-0 col-sm-4">
											{{data.card_no||'未绑定'}}
										</Form-item>
										<Form-item label="市场渠道：" class="mb-0 col-sm-4">
											{{data.mc_name}}
										</Form-item>
										<Form-item label="招生来源：" class="mb-0 col-sm-4">
											{{data.from_did|dict_title('from','-')}}
										</Form-item>
										<Form-item label="休学原因：" class="mb-0 col-sm-4" v-if="data.status == 30">
											{{data.stop_reason||'-'}}
										</Form-item>
                                        <Form-item label="学管师：" class="mb-0 col-sm-4">
											{{data.eid | ename}}
										</Form-item>
										<template v-for="item in option_fields">
											<Form-item 
												:label="item.label+'：'" 
												:class="['mb-0',item.type=='textarea'?'col-sm-12':'col-sm-4']">
												{{item.value}}
											</Form-item>
										</template>
										<Form-item label="标签：" class="mb-0 col-sm-8">
											<Tag 
												type="border" 
												style="margin-right: 5px" 
												:color="item.color" 
												v-for="(item,index) in data.tags" 
												:key="index"
												v-if="is_admin||item.create_uid==uid$">
												{{item.tag_name}}
											</Tag>
											<Button type="ghost" icon="pricetag" size="small" @click="manageTag"></Button>
										</Form-item>
										<Form-item 
										:label="label_cc+':'" 
										class="mb-0 col-sm-4" 
										v-if="data.customer && data.customer.follow_eid > 0">
											{{data.customer.follow_eid|ename('-')}}
										</Form-item>
																		
									</Form>
								</div>
							</Card>
							<Card dis-hover class="mt-2">
								<div slot="title">
									<Icon type="person"></Icon>
									联系人信息
								</div>
								<div>
									<table class="modal-table">
										<thead>
											<th><div class="ivu-table-cell">电话</div></th>
											<th><div class="ivu-table-cell">关系</div></th>
											<th><div class="ivu-table-cell">姓名</div></th>
											<th><div class="ivu-table-cell">学习管家账号</div></th>
											<th><div class="ivu-table-cell">微信绑定</div></th>
											<th><div class="ivu-table-cell">操作</div></th>
										</thead>
										<tr>
											<td><div class="ivu-table-cell">{{data.first_tel}} -【第一联系人】</div></td>
											<td><div class="ivu-table-cell">{{data.first_family_rel|family_rel}}</div></td>
											<td><div class="ivu-table-cell">{{data.first_family_name}}</div></td>
											<td>
												<div class="ivu-table-cell">
													<Tag :color="getStatus('first_uid')?'green':'default'">
														{{getStatus('first_uid')?'已开通':'未开通'}}
													</Tag>
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													<Tag :color="getStatus('first_openid')?'green':'default'">
														{{getStatus('first_openid')?'已绑定':'未绑定'}}
													</Tag>													
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													<Dropdown trigger="click">
														<slot>
															<Button type="primary" size="small">
																操作 <Icon type="arrow-down-b"></Icon>
															</Button>
														</slot>
														<DropdownMenu slot="list" v-per="'student.edit'">
															<DropdownItem @click.native="changeTel('first')">
												            	<Icon type="edit"></Icon>　编辑
												            </DropdownItem>
												            <DropdownItem @click.native="unBind('first')" v-if="getStatus('first_openid')">
												            	<Icon type="close-circled"></Icon>　取消绑定
												            </DropdownItem>
												            <DropdownItem @click.native="bind('first')" v-if="!getStatus('first_openid')">
												            	<Icon type="qr-scanner"></Icon>　绑定微信
												            </DropdownItem>
												            <DropdownItem @click.native="changePwd('first')">
												            	<Icon type="locked"></Icon>　修改密码
												            </DropdownItem>
											            </DropdownMenu>
													</Dropdown>
												</div>
											</td>
										</tr>
										<tr v-if="data.second_tel">
											<td><div class="ivu-table-cell">{{data.second_tel}} -【第二联系人】</div></td>
											<td><div class="ivu-table-cell">{{data.second_family_rel|family_rel}}</div></td>
											<td><div class="ivu-table-cell">{{data.second_family_name}}</div></td>
											<td>
												<div class="ivu-table-cell">
													<Tag :color="getStatus('second_uid')?'green':'default'">
														{{getStatus('second_uid')?'已开通':'未开通'}}
													</Tag>
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													<Tag :color="getStatus('second_openid')?'green':'default'">
														{{getStatus('second_openid')?'已绑定':'未绑定'}}
													</Tag>													
												</div>
											</td>
											<td>
												<div class="ivu-table-cell">
													<Dropdown trigger="click">
														<slot>
															<Button type="primary" size="small">
																操作 <Icon type="arrow-down-b"></Icon>
															</Button>
														</slot>
														<DropdownMenu slot="list" v-per="'student.edit'">
															<DropdownItem @click.native="changeTel('second')">
												            	<Icon type="edit"></Icon>　编辑
												            </DropdownItem>
												            <DropdownItem @click.native="delSecondTel()">
												            	<Icon type="ios-trash"></Icon>　 删除
												            </DropdownItem>
												            <DropdownItem @click.native="unBind('second')" v-if="getStatus('second_openid')">
												            	<Icon type="close-circled"></Icon>　取消绑定
												            </DropdownItem>
												            <DropdownItem @click.native="bind('second')" v-if="!getStatus('second_openid')">
												            	<Icon type="qr-scanner"></Icon>　绑定微信
												            </DropdownItem>
												            <DropdownItem @click.native="changePwd('second')">
												            	<Icon type="locked"></Icon>　修改密码
												            </DropdownItem>
											            </DropdownMenu>
													</Dropdown>
												</div>
											</td>
										</tr>
									</table>
								</div>
							</Card>
						</div>
					</div>
				</Card>
				<Card dis-hover style="margin-top: 10px;">
					<div slot="title">
						<Icon type="ios-person"></Icon>
						当前上课进度
					</div>
						<Form :label-width="labelWidth" class="row">
							<Form-item label="上课进度：" class="mb-0 col-sm-12">
								{{classSchedule.review || "-"}}
							</Form-item>
						</Form>	
				</Card>
			</data-ready>
			<div class="col-sm-12 mt-2" v-if="!inModal">
				<menu-page 
				parent-name="business_student_info" 
				nav-from="router" 
				:min="true" 
				:check-per="true"
				per-prefix="archive"
				sub-class="sub-nav-content"
				></menu-page>
			</div>
			<div class="col-sm-12 mt-2" v-else>
				<Tabs v-model="modalTab">
					<TabPane label="课时记录" name="lesson" v-if="hasPer('archive.lesson')">
						<Lesson v-if="modalTab == 'lesson'" :sid="id" />
					</TabPane>
					<TabPane label="订单记录" name="order" v-if="hasPer('archive.order')">
						<Order v-if="modalTab == 'order'" :sid="id" />
					</TabPane>
					<TabPane label="缴费记录" name="money" v-if="hasPer('archive.money')">
						<iMoney v-if="modalTab == 'money'" :sid="id" />
					</TabPane>
					<TabPane label="分班记录" name="class" v-if="hasPer('archive.class')">
						<Class v-if="modalTab == 'class'" :sid="id" />
					</TabPane>
					<TabPane label="排课记录" name="arrange" v-if="hasPer('archive.arrange')">
						<Arrange v-if="modalTab == 'arrange'" :sid="id" />
					</TabPane>
					<TabPane label="考勤记录" name="attend" v-if="hasPer('archive.attend')">
						<Attend v-if="modalTab == 'attend'" :sid="id" />
					</TabPane>
					<TabPane label="课耗记录" name="hour" v-if="hasPer('archive.hour')">
						<Hour v-if="modalTab == 'hour'" :sid="id" />
					</TabPane>
					<TabPane label="请假记录" name="leave" v-if="hasPer('archive.leave')">
						<LeaveRecord v-if="modalTab == 'leave'" :sid="id" />
					</TabPane>
					<TabPane label="缺勤记录" name="absence" v-if="hasPer('archive.absence')">
						<Absence v-if="modalTab == 'absence'" :sid="id" />
					</TabPane>
					<TabPane label="课评记录" name="review" v-if="hasPer('archive.review')">
						<Review v-if="modalTab == 'review'" :sid="id" />
					</TabPane>
					
					<TabPane label="服务记录" name="service_record" v-if="hasPer('archive.record')">
						<ServiceRecord v-if="modalTab == 'service_record'" :sid="id" />
					</TabPane>
					<TabPane label="服务安排" name="service_task" v-if="hasPer('archive.task')">
						<ServiceTask v-if="modalTab == 'service_task'" :sid="id" />
					</TabPane>
					<TabPane label="回访记录" name="visit" v-if="hasPer('archive.visit')">
						<Visit v-if="modalTab == 'visit'" :sid="id" />
					</TabPane>
					<TabPane label="操作日志" name="log" v-if="hasPer('archive.log')">
						<Log v-if="modalTab == 'log'" :sid="id" />
					</TabPane>
				</Tabs>
			</div>

		</div>
        <credit ref="credit" @on-success="refreshData"></credit>
        <money ref="money" @on-success="refreshData"></money>
	</div>
</template>

<script>
	import moment 		  	from 'moment'	
	import util,{_} 		from '@/libs/util'
	import common 		  	from '@/libs/common.mixin'
	import globals 		  	from '@/libs/globals.mixin'
	import {map}			from '@/router'
	import Vue 				from 'vue'
	import dataReady 	  	from 'c%/DataReady.vue'
	import letterAvatar   	from 'c%/LetterAvatar.vue'
	import operationItems 	from './operation-items.vue'	
	import credit 			from './credit.vue'
	import money 			from './money.vue'
	import MenuPage 		from 'c%/MenuPage.vue'

	import Lesson 			from 'v%/business/student/record/lesson.vue'
	import Order 			from 'v%/business/student/record/order.vue'
	import iMoney 			from 'v%/business/student/record/money.vue'
	import Class 			from 'v%/business/student/record/class.vue'
	import Arrange 			from 'v%/business/student/record/arrange.vue'
	import Attend 			from 'v%/business/student/record/attend.vue'
	import Hour 			from 'v%/business/student/record/hour.vue'
	import LeaveRecord 		from 'v%/business/leave/leave-record.vue'
	import Absence 			from 'v%/business/student/record/absence.vue'
	import Visit 			from 'v%/business/student/record/visit.vue'
	import Review 			from 'v%/business/student/record/review.vue'
	import Log 				from 'v%/business/student/record/log.vue'
	import ServiceRecord 	from 'v%/business/student/record/service-record.vue'
	import ServiceTask		from 'v%/business/student/record/service-task.vue'
	
	export default{
		mixins: [globals,common],
		components: {
			money,
			credit,
			dataReady,
			letterAvatar,
			operationItems,
			MenuPage,
			Lesson,
			Order,
			iMoney,
			Class,
			Arrange,
			Attend,
			Hour,
			LeaveRecord,
			Absence,
			Visit,
			Review,
			Log,
			ServiceRecord,
			ServiceTask
		},
		props: {
			id: {
				type: Number,
				default: 0
			},
			inModal: {
				type: Boolean,
				default: false
			}
		},
		data () {
			return {
				data: {},
				cropper: {},
				tab: 'order',
				modalTab: 'lesson',
				preview_src: '',
				sid: this.$route.params.id,
				classSchedule: {
					review: "",
					textbook: "",
				},				
			}
		},
		watch: {
			'$route.params.id':function(id) {
				this.sid = id
			}
		},
		created() {
			if(this.id == 0) {
				this.sid = this.$route.params.id
			}
			else {
				this.sid = this.id
			}
			this.init_class_schedule()
		},
		beforeRouteEnter(to,from,next) {
			next(vm=>{
				if(from.path !== '/') {
					Vue.localStorage.set('__STUDENT_INFO_FROM__',from.path)
				}
			})
		},
		methods: {
			init_class_schedule() {
				let url = `students/${this.sid}/progress`
        this.$rest(url)
          .get()
          .success((response)=>{
						this.classSchedule = response
          })
          .error((response)=>{
            this.error(response.body.message)
        })				
			},			
			manageTag() {
				this.$Modal.open('components/TagManageModal.vue@modal',{
					props: {
						type: 1,
						id: this.data.sid,
						'obj-name':this.data.student_name
					},
					on: {
						update: () => {
							this.refreshData();
						}
					}
				})
				.then(modal => {
					modal.show()
				})
			},
			handleSuccess (type) {
				
			},
			onModalOpen(query){
				this.sid = query.sid
			},
			moneyDetail () {				
				let data = this.data
				let post = {
					sid: data.sid,
					amount: 0,
					remark: '',
					business_type: 12
				}
				this.$Modal.open('business/student/money@modal',{
					on: {
						'on-success':() => {
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal
					.set('money',data.money)
					.set('sid',data.sid)
					.set('post',post)
					.show(util.sprintf('【%s】的余额变动历史记录',data.student_name),'add')
				})
			},
			creditDetail () {
				let data = this.data
				this.$Modal.open('business/student/credit.vue@modal',{
					on: {
						'on-success':() => {
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal
					.set('sid',data.sid)
					.set('students',[data.student_name])
					.show(util.sprintf('【%s】的积分记录',data.student_name),'add')
				})
			},
			getStatus (field) {
				return this.data[field]
			},
			changeTel (type) {
				this.$Modal.open('business/student/info-mobile-modal.vue',{
					on: {
						'on-success':() => {
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal
					.set('type',type)
					.set('data',this.data)
					.show('编辑联系人','edit')
				})
			},
			delSecondTel () {
				this.confirm('确定要删除第二联系人吗？')
				.then(() => {
					this.$rest('users')
					.delete(this.data['second_uid'])
					.success(res => {
						this.$Message.success('删除成功')
						this.refreshData()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			changePwd (type) {
				let info = {
					account: this.data[type+'_user'].account,
					password: ''
				}
				this.$Modal.open('business/student/info-password.vue@modal',{
					on: {
						'on-success':() => {
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal
					.set('uid',this.data[type+'_uid'])
					.set('info',info)
					.show('修改密码','edit')
				})
			},
			bind (type) {
				let uid = this.data[util.sprintf('%s_%s',type,'uid')]
				this.$rest('users/do_wechat_qrcode')
				.post({
					uid: uid,
					sid: this.data.sid
				})
				.success(res=>{
					this.$Modal.open('business/student/qr-modal.vue')
					.then(modal => {
						
						modal
						.set('uri',res.data.url)
						.show('绑定微信','add')
					})
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'绑定失败'
					})
				})
			},
			unBind (type) {
				let uid = this.data[util.sprintf('%s_%s',type,'uid')]
				this.$rest('users/'+uid+'/dounbind')
				.post()
				.success(data=>{
					this.$Message.success('解绑成功')
					this.refreshData()
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'绑定失败'
					})
				})
			},
			changeAvatar () {
				this.$Modal.open('components/AvatarUpload.vue@modal',{
					on: {
						'on-save-success': () => {
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal
					.set('sid',this.data.sid)
					.show('更换头像','edit')
				})
			},
			back () {
				this.$store.commit('setSearchDetail',true)
				let route_from = Vue.localStorage.get('__STUDENT_INFO_FROM__')
				if(route_from.indexOf('business')>-1) {
					this.$router.push({path:'/business/student/archive'})
				}else if(route_from.indexOf('lostwarn')>-1) {
					this.$router.push({path:'/recruiting/list/lostwarn'})
				}else{
					this.$router.push({path:'/recruiting/list/lost'})
				}
			},
			dataReady (rs) {	
				this.data = rs[0]				
			},
			refresh (rs) {
				this.data = rs.response 
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url[0])
			}
		},
		computed: {
			labelWidth() {
				if(this.inModal) {
					return 80
				}
				else {
					return 120
				}
			},
			option_fields(){
				let fields = []
				let fields_map = {}
				let student_option_fields = this.$store.state.gvars.configs.student_option_fields
				let student_option_value  = this.data.option_fields

				let get_field_value = function(obj,f){
					if(obj && obj[f]){
						return obj[f]
					}
					return ''
				}
				student_option_fields.forEach(f=>{
					if(f.enable == 1){
						let field = {
							label:f.label,
							value:get_field_value(student_option_value,f.name),
							type:f.type
						}
						if(field.type !== 'textarea') {
							fields.unshift(field)
						}else{
							fields.push(field)
						}
					}
				})				

				return fields
			},
			info_url(){
				return ['students/'+this.sid+'?with=first_user.students,second_user.students']
			},
			circlePercent(){
				
				let data = this.data
				
				if(!_.isEmpty(data)){
					return parseFloat( data.student_lesson_remain_hours / data.student_lesson_hours).toFixed(2) * 100					
				}
				return 0
			},
			circleColor(){
				let color = '#2db7f5'
				let percent = this.circlePercent
				let data = this.data
				if(_.isEmpty(data) || data.student_lesson_hours == 0){
					color = '#cccccc'
				}else{
	                if (percent == 100) {
	                    color = '#5cb85c'
	                }else if(percent > 50){
	                	color = '#2db7f5'
	                }else if(percent > 25){
	                	color = '#ff9900'
	                }else{
	                	color = '#ff0000'
	                }
	            }
                return color;
			},
			age() {
				return this.data.birth_year>0?moment(new Date()).format('YYYY') - this.data.birth_year + '岁':'未设置'
			},
			school_grade() {
				return this.data.school_grade == 0 ? '未设置' : this.$filter('dict_title')(this.data.school_grade,'grade')
			}
		}
	}
</script>
