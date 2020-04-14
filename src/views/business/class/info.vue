<style scoped>
.class-name {
	margin-left: 45px;
	margin-bottom: 20px;
}
</style>

<template>
	<div class="c-grid info-page">
		<div class="row">
			<div class="col-sm-12">
				<Button type="primary" icon="chevron-left" size="small" @click="back" v-if="!inModal"></Button>
				<Button type="primary" icon="refresh" size="small" @click="refreshAllData"></Button>
				<operation-items class="pull-right" :info="data" :refs="$refs" from="info" @success="handleSuccess"></operation-items>	
			</div>	
			<data-ready ref="dr" :data="['classes?cid='+cid+'&with=schedules']" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-2">
				<Card dis-hover>
					<div slot="title" class="clearfloat">
						<Icon type="ios-home"></Icon>
						{{data.class_name}} - {{data.start_lesson_time}}开班
					</div>
					<div class="row">					
						<Form :label-width="120" class="row">
							<Form-item :label="label_teacher" class="mb-0 col-sm-4">
								{{data.teach_eid|employee_name}}
							</Form-item>
							<Form-item :label="label_secteacher" class="mb-0 col-sm-4">
								{{data.second_eids|enames('-')}}
							</Form-item>
							<Form-item :label="label_eduer" class="mb-0 col-sm-4">
								{{data.edu_eid|ename('-')}}
							</Form-item>
							
							<Form-item label="所属校区：" class="mb-0 col-sm-4">
								{{data.bid|branch_name}}
							</Form-item>
							<Form-item label="所属课程：" class="mb-0 col-sm-4">
								{{data.lid|lesson_name('--')}}
							</Form-item>
							<Form-item label="所属科目：" class="mb-0 col-sm-4">
								{{data.sj_id|subject_name('--')}}
							</Form-item>
							<Form-item label="招生情况：" class="mb-0 col-sm-4">
								<Progress :percent="getPercent('student')" :stroke-width="12">
									{{data.student_nums}}/{{data.plan_student_nums}}
								</Progress>											 
							</Form-item>
							<Form-item label="排课情况：" class="mb-0 col-sm-4">
								<Progress :percent="getPercent('arrange')" :stroke-width="12">
									{{data.arrange_times}}/{{data.lesson_times}}
								</Progress>											
							</Form-item>
							<Form-item label="授课情况：" class="mb-0 col-sm-4">
								<Progress :percent="getPercent('attendance')" :stroke-width="12">
									{{data.attendance_times}}/{{data.arrange_times}}
								</Progress>											
							</Form-item>										
							<Form-item label="标签：" class="mb-0 col-sm-8">
								<Tag type="border" style="margin-right: 5px" :color="item.color" v-for="(item,index) in data.tags" :key="index">{{item.tag_name}}</Tag>
								<Button type="ghost" icon="pricetag" size="small" @click="manageTag"></Button>
							</Form-item>
							<Form-item label="授课进度：" class="mb-0 col-sm-8" v-if="!is_show_teachingRecord">
								<span>课评：{{teachingRecord.review || '-'}}</span>&nbsp;&nbsp;
								<span>课标: {{teachingRecord.textbook || '-'}}</span>
							</Form-item>										
						</Form>
					</div>
				</Card>
			</data-ready>	
			<div class="col-sm-12 mt-2">
				<Card dis-hover>
					<Tabs v-model="tab" v-if="data&&data.class_type!=undefined">
				        <TabPane label="班级学员" name="student" v-if="data.class_type==0">
	        	        	<student v-if="tab=='student'" :setWidth="false" :class-info="data" ref="student_info" @refreshInfo="refreshData"></student>
				        </TabPane>
				        <TabPane label="排课情况" name="arrange">
							<div class="toolbar">
								<Dropdown transfer>
									<Button type="primary" icon="plus">排课</Button>
									<DropdownMenu slot="list">
										<DropdownItem @click.native="addInfo"><Icon type="drag"></Icon> 简单循环排课</DropdownItem>
										<DropdownItem @click.native="multiAdd"><Icon type="ios-infinite"></Icon> 规律循环排课</DropdownItem>
										<DropdownItem @click.native="editClassSchedule"><Icon type="calendar"></Icon> 按计划排课</DropdownItem>
									</DropdownMenu>
								</Dropdown>		
							</div>
				        	<class-arranges-list
						    	:class-info="data"						    	
						    	ref="arrangesList"
						    	v-if="tab=='arrange'">
					    	</class-arranges-list>
				        </TabPane>
				        <TabPane label="考勤记录" name="attend">
				        	<attendance v-if="tab=='attend'" :cid="data.cid" :class-name="data.class_name"></attendance>
				        </TabPane>
				        <TabPane label="课评记录" name="review">
									<Review ref="review" v-if="tab == 'review'" :cid="data.cid" :type="'class'" />
				        </TabPane>
				        <TabPane label="服务记录" name="record" v-if="data.class_type==0">
				        	<service-record ref="service_record" v-if="tab=='record'" :cid="data.cid" :type="2"></service-record>
				        </TabPane>
				        <TabPane label="服务安排" name="task" v-if="data.class_type==0">
				        	<service-task ref="service_task" v-if="tab=='task'" :cid="data.cid" :type="2"></service-task>
				        </TabPane>
						<TabPane label="操作日志" name="log">
				        	<class-log v-if="tab=='log'" :cid="data.cid"></class-log>
				        </TabPane>
				    </Tabs>
				</Card>
			</div>
		</div>
	</div>
</template>

<script>
	import util 			 from '@/libs/util'
	import pay 			  	 from './info/pay.vue'
	import common 			 from '@/libs/common.mixin'
	import globals 		  	 from '@/libs/globals.mixin'
	import student 		  	 from './info/student.vue'
	import dataReady 	  	 from 'c%/dataReady.vue'
	import attendance 	  	 from './info/attendance.vue'
	import letterAvatar   	 from 'c%/LetterAvatar.vue'	
	import classArrangesList from './arranges-list.vue'
	import classLog 		 from './info/log.vue'
    import selectEmployee 	 from 'c%/SelectEmployee.vue'
    import OperationItems  	 from './operation-items.vue'
    import ServiceRecord 	 from 'v%/service/service/record-list.vue'
		import ServiceTask 		 from 'v%/service/service/task-list.vue'
		import Review 			from 'v%/business/student/record/review.vue'
	
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
			ServiceTask,
			ServiceRecord,
			Review
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
				data: {
					second_eids:[]
				},
				cid: 0,
				tab: 'student',
				teachingRecord: {
					review: "",
					textbook: "",
				},
			}
		},
		created() {
			if(this.id == 0) {
				this.cid = this.$route.params.id;
			}
			else {
				this.cid = this.id
			}
			this.init_teaching_record()
		},
		computed: {
			is_show_teachingRecord() {
				return this.teachingRecord.review == "" && this.teachingRecord.textbook == ""
			},
			teacherName() {
				return `授课${this.$filter('translate')('老师')}：`
			},
			teacherName2() {
				return this.$filter('translate')('助教') + '：'
			},
			object_fixed() {
				let obj = {
					int_day: '',
					ts_array: [],
					teach_eid: 0,
					cr_id: 0
				}
				obj.class_item = this.data
				return obj
			}
		},
		methods: {
			init_teaching_record() {
				let url = `classes/${this.cid}/progress`
        this.$rest(url)
          .get()
          .success((response)=>{
						this.teachingRecord = response
          })
          .error((response)=>{
            this.error(response.body.message)
        })				
			},
			editClassSchedule() {
				this.$Modal.open('business/class/arrange-set-modal.vue',{
					on: {
						'save': ()=>{
							this.refreshData()
						},
						'on-success': ()=>{
							this.refreshData()
						}
					}
				})
				.then(modal=>{
					modal.set('info',this.data)
					.show(`编辑班级的排课计划【${this.data.class_name}】`,'edit')
				})
			},
			multiAdd() {
				this.$Modal.open('business/class/arrange/multi-add-modal.vue',{
					on: {
						'on-success': ()=>{
							this.refreshData()
						}
					},
					props: {
						cls: this.data
					}
				})
				.then(modal=>{
					modal.show('规律排课','add')
				})
			},
			addInfo() {
				this.$Modal.open('business/class/arrange/info-modal.vue',{
					props: {
						objectFixed: this.object_fixed
					},
					on: {
						'save':()=>{
							this.refreshData()
						}
					}
				})
				.then(modal => {
					modal.vuec.show('新增排课','add')
				})
			},
			manageTag() {
				this.$Modal.open('components/TagManageModal.vue@modal',{
					props: {
						type: 2,
						id: this.data.cid
					},
					on: {
						update: () => {
							this.refreshData();
						}
					}
				})
				.then(modal => {
					modal.show(`【${this.data.class_name}】标签管理`)
				})
			},
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
				this.$store.commit('setSearchDetail',true)
				this.$router.push({path:'/business/class/list'})
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
			},
			formatSecondEids(ids) {
				let result = []
		        if(ids.length > 0){
		        	ids.forEach(e=>{
		        		result.push(this.$filter('ename')(e,'-'))
		        	})
		        }
		        return result.join(',')
			}	
		}
	}
</script>