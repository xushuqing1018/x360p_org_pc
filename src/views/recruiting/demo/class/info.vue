<template>
	<div class="c-grid">
		<div class="row">
			<div class="col-sm-12">
				<Button type="primary" icon="reply" size="small" @click="back"></Button>
				<Button type="primary" icon="refresh" size="small" @click="refreshAllData"></Button>
				<operation-items class="pull-right" :info="data" :refs="$refs" from="info" @on-success="handleSuccess"></operation-items>	
			</div>	
			<data-ready ref="dr" :data="['classes?cid='+cid]" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-3">
				<Card dis-hover>
					<div slot="title" class="clearfloat">
						<Icon size="24" type="ios-person" style="vertical-align: middle;"></Icon>
						班级信息
					</div>
					<div class="row">
						<div class="col-sm-4">
							<div class="row">
								<div class="avatar-wrap col-sm-5" style="padding-top:30px">
									<letterAvatar 
										@click.native="preview()" 
										:name="data.teach_eid|employee_name" 
										:src="''" 
										size='120' 
										:rounded="true">
									</letterAvatar>									
								</div>
								<div class="profile-wrap col-sm-7" style="padding-top:30px">
									<h3>
										{{data.class_name}}										
									</h3>
									<div class="table-wrap">
										<table>
											<tbody>
												<tr>
													<td>授课{{'老师'|translate}}：</td>
													<td>助教：</td>
												</tr>
												<tr>
													<td>{{data.teach_eid|employee_name}}</td>
													<td>{{data.second_eid>0?$filter('employee_name')(data.second_eid):'未设置'}}</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
						<div class="col-sm-8">
							<Card dis-hover>
								<div slot="title">
									<Icon type="information-circled" style="vertical-align: middle;" size="24"></Icon>
									基础信息
								</div>
								<div>
									<Form :label-width="120" class="row">
										<Form-item label="开班日期：" class="mb-0 col-sm-6">
											{{data.start_lesson_time}}
										</Form-item>
										<Form-item label="所属校区：" class="mb-0 col-sm-6">
											{{data.bid|branch_name}}
										</Form-item>
										<Form-item label="所属课程：" class="mb-0 col-sm-6">
											{{data.lid|lesson_name('--')}}
										</Form-item>
										<Form-item label="招生情况：" class="mb-0 col-sm-6">
											 <Progress :percent="getPercent('student')" :stroke-width="12">
											 	{{data.student_nums}}/{{data.plan_student_nums}}
											 </Progress>											 
										</Form-item>
										<Form-item label="排课情况：" class="mb-0 col-sm-6">
											<Progress :percent="getPercent('arrange')" :stroke-width="12">
												{{data.arrange_times}}/{{data.lesson_times}}
											</Progress>											
										</Form-item>
										<Form-item label="授课情况：" class="mb-0 col-sm-6">
											<Progress :percent="getPercent('attendance')" :stroke-width="12">
												{{data.attendance_times}}/{{data.arrange_times}}
											</Progress>											
										</Form-item>										
									</Form>
								</div>
							</Card>
						</div>
					</div>
				</Card>
			</data-ready>	
			<div class="col-sm-12 mt-3">
				<Card dis-hover>
					<Tabs v-model="tab" v-if="data&&data.class_type!=undefined">
				        <TabPane label="班级学员" name="student" v-if="data.class_type==0">
	        	        	<student v-if="tab=='student'" :class-info="data" ref="student_info" @refreshInfo="refreshData"></student>
				        </TabPane>
				        <!--<TabPane label="缴费记录" name="pay">
				        	<pay v-if="tab=='pay'"></pay>
				        </TabPane>-->
				        <TabPane label="排课情况" name="arrange">
				        	<class-arranges-list
						    	:class-info="data"
						    	ref="arrangesList"
						    	v-if="tab=='arrange'">
					    	</class-arranges-list>
				        </TabPane>
				        <TabPane label="考勤记录" name="attend">
				        	<attendance v-if="tab=='attend'" :cid="data.cid"></attendance>
				        </TabPane>
				        <!--<TabPane label="点评记录" name="comment" icon="chatbubble">
				        	点评记录
				        </TabPane>-->
				        <TabPane label="操作日志" name="log">
				        	<class-log v-if="tab=='log'" :cid="data.cid"></class-log>
				        </TabPane>
				        <TabPane label="服务记录" name="record" v-if="data.class_type==0">
				        	<service-record ref="service_record" v-if="tab=='record'" :cid="data.cid"></service-record>
				        </TabPane>
				        <TabPane label="服务安排" name="task" v-if="data.class_type==0">
				        	<service-task ref="service_task" v-if="tab=='task'" :cid="data.cid"></service-task>
				        </TabPane>
				    </Tabs>
				</Card>
			</div>
		</div>
		<class-info-modal ref="infoModal" @save="refreshData"></class-info-modal>
        <class-students-modal :transfer="true" ref="studentsModal" @on-success="refreshData"></class-students-modal>
        <class-arranges-modal ref="arrangesModal"></class-arranges-modal>
        <charge-set-modal ref="charge_info" @on-success="refreshData"></charge-set-modal>        
	</div>
</template>

<script>
	import util 			 from '@/libs/util'
	import pay 			  	 from 'v%/business/class/info/pay.vue'
	import common 			 from '@/libs/common.mixin'
	import globals 		  	 from '@/libs/globals.mixin'
	import student 		  	 from 'v%/business/class/info/student.vue'
	import dataReady 	  	 from 'c%/dataReady.vue'
	import attendance 	  	 from 'v%/business/class/info/attendance.vue'
	import letterAvatar   	 from 'c%/LetterAvatar.vue'	
	import classArrangesList from 'v%/business/class/arranges-list.vue'
	import classLog 		 from 'v%/business/class/info/log.vue'
	import classInfoModal 	 from 'v%/business/class/info-modal.vue'
    import selectEmployee 	 from 'c%/SelectEmployee.vue'
    import classArrangesModal from 'v%/business/class/arranges-modal.vue'
    import classStudentsModal from 'v%/business/class/students-modal.vue'
    import ChargeSetModal 	 from 'v%/business/class/charge-set-modal.vue'
    import OperationItems  	 from './operation-items.vue'
    import ServiceRecord 	 from 'v%/service/service/record-list.vue'
    import ServiceTask 		 from 'v%/service/service/task-list.vue'
	
	const CLASS_SCHEDULES_URL = 'classes/%s/schedules'
	const NOT_FOUND_TEXT = '没有找到符合条件的班级，请选择升级到新班级'
	
	export default{
		mixins: [common,globals],
		components: {
			pay,
			student,
			dataReady,
			attendance,
			letterAvatar,
			classArrangesList,
			classLog,
			OperationItems,
			ChargeSetModal,
			classStudentsModal,
			classInfoModal,
			classArrangesModal,
			ServiceTask,
			ServiceRecord
		},
		data () {
			return {
				data: {},
				cid: this.$route.params.id,
				tab: 'student'
			}
		},
		mounted () {
			
		},
		methods: {
			handleSuccess (type) {
				if(this.$refs[type]){
					this.$refs[type].init_data()
				}
			},
			editInfo () {
				this.dr().getData(util.sprintf(CLASS_SCHEDULES_URL,this.data.cid))
                .then(response=>{
                	let obj = util.copy(this.data)
                	obj.schedule = response.list
                    this.$refs['infoModal']
					.set('info',obj)
					.show(util.sprintf('编辑班级【%s】',obj.class_name),'edit')
                })				
			},
			getPercent (type) {
				let result = 0,
					data = this.data
				if(type == 'student'){
					result = (data.student_nums/data.plan_student_nums)*100
				}else if(type == 'arrange'){
					result = (data.arrange_times/data.lesson_times)*100
				}else{
					result = (data.attendance_times/data.arrange_times)*100
				}
				
				return result
			},
			back () {
//				this.$router.push({path:'/business/class'})
				this.$router.go(-1)
			},
			dataReady (rs) {				
				this.data = rs[0].list[0]
				
				if(this.data && this.data.class_type==1){
					this.tab = 'arrange'
				}
			},
			refresh (rs) {
				this.data = rs.response.list[0] 
			},
			refreshData () {
				this.$r('dr').refreshData('classes?cid='+this.cid)
			},
			refreshAllData() {
				this.refreshData()
				if(this.tab=='student'){
					this.$refs.student_info.$refs.studentList.refreshData()					
				}
			}	
		}
	}
</script>