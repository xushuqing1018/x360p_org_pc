<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :label-width="70" class="filter-form row">
				<Form-item :label="label_eduer+'：'" class="col-md-3 col-sm-6">
					<select-employee 
						v-model="search_field.eid" 
						:rid="4" 
						clearable
						:disabled="!perCheckAllStudent">
					</select-employee>
				</Form-item>
				<Form-item label="学员：" class="col-md-3 col-sm-6" v-if="perCheckAllStudent">
					<select-student
						clearable
						v-model="search_field.sid">
					</select-student>
				</Form-item>
			</Form>
			<Row class="mt-2">
				<Col span="24">
				`	<Button 
						type="primary" 
						icon="ios-search" 
						size="large" 
						@click="init_data">
						查询
					</Button>
					<Button 
						type="primary" 
						icon="plus" 
						size="large" 
						@click="addStudent" 
						v-per="'assign.add'" 
						:disabled="!perCheckAllStudent">
						分配学员
					</Button>
					<Button 
						type="primary" 
						icon="android-cancel" 
						size="large" 
						@click="cancelCurrentTeacher" 
						v-per="'assign.cancel'">
						批量取消分配
					</Button>
					<Button 
						type="primary" 
						icon="shuffle" 
						size="large" 
						@click="batchAdjust" 
						v-per="'assign.batch'">
						批量调整
					</Button>
				</Col>
			</Row>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
					<div class="ivu-table-wrapper" v-loading="'employee_students'">
						<table class="table-list">
							<thead>
								<tr>
									<th width="60">
										<div class="ivu-table-cell">
											<Checkbox 
												v-model="select_all" 
												@on-change="toggleSelectAll($event)">
											</Checkbox>
										</div>
									</th>
									<th><div class="ivu-table-cell">学员</div></th>
									<th><div class="ivu-table-cell">学号</div></th>
									<th><div class="ivu-table-cell">电话</div></th>
									<th><div class="ivu-table-cell">性别</div></th>
									<th><div class="ivu-table-cell">年龄</div></th>
									<th><div class="ivu-table-cell">状态</div></th>
									<th><div class="ivu-table-cell">{{label_eduer}}</div></th>
									<th><div class="ivu-table-cell">分配时间</div></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in data">
									<td>
										<div class="ivu-table-cell">
											<Checkbox 
												v-model="item.$selected" 
												@on-change="toggleSelectOne($event,item)">
											</Checkbox>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<avatar-and-name 
												:src="item.student.photo_url" 
												:name="item.student.student_name"
												:detail-action="2"
												:sid="item.student.sid">
											</avatar-and-name>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{item.student.sno}}</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{item.student.first_tel}}</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{item.student.sex|sex}}</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{getAge(item.student.birth_time)}}</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{item.student.status|s_status}}</div>
									</td>
									<td>
										<div class="ivu-table-cell text-success">{{item.eid|ename}}</div>
									</td>
									<td>
										<div class="ivu-table-cell">{{item.create_time|moment('YYYY-MM-DD')}}</div>
									</td>
								</tr>
								<tr v-if="data.length==0">
									<td colspan="9" class="text-center">
										<div class="ivu-table-cell">没有数据</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="content-footer">
					<div class="pagenation">
		                <Page 
		                	:total="total" 
		                	:current="pageIndex" 
		                	:show-sizer="true" 
		                	:page-size="pageSize" 
		                	:show-total="true" 
		                	@on-change="pagenation" 
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>		
				</div>
			</div>
		</div>
		<add-student-modal 
			ref="add_student" 
			:eid="search_field.eid" 
			@on-success="init_data">
		</add-student-modal>
		<batch-student-modal 
			ref="batch_student" 
			:sids="sIds" 
			@on-success="init_data">
		</batch-student-modal>
	</div>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import AddStudentModal from './assign-teacher/add-student-modal.vue'
	import BatchStudentModal from './assign-teacher/batch-student-modal.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import AvatarAndName from 'c%/AvatarAndName.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
			SelectEmployee,
			SelectStudent,
			AddStudentModal,
			AvatarAndName,
			BatchStudentModal
		},
		data() {
			return {
				search_field: {
					eid: 0,
					sid: 0,
				},
				sIds: [],
				rest_api: 'employee_students',
				select_all: false,
				es_ids: [] 
			}
		},
		watch: {
			'search_field.eid':function(id) {
				this.pagenation(1)
			},
			'search_field.sid':function(id) {
				this.pagenation(1)
			}
		},
		mounted() {
			if(this.perCheckAllStudent) {
				this.init_data()
			}else{
				if(this.four_in_rids) {
					this.search_field.eid = this.eid$
					this.init_data()
				}
			}
		},
		computed: {
			four_in_rids () {
				let employee = this.$store.state.user.info.employee
	        	if(!_.isEmpty(employee)){
	        		return employee.rids.indexOf(4) > -1
	        	}
	   			return false
	   		},
		},
		methods: {
			addStudent() {
				if(this.search_field.eid == 0) {
					this.$Message.error('请先选择学管师')
					return false
				}
				this.$r('add_student').show(util.sprintf('分配学员【%s】',this.$filter('ename')(this.search_field.eid)))
			},
			cancelCurrentTeacher() {
				if(this.sIds.length == 0) {
					this.$Message.error('请先勾选要操作的学员')
					return false
				}
				this.confirm('确认取消选中学员的学管师吗？')
				.then(() => {
					this.$rest('employee_students/delete_employee_student')
					.post({
						es_ids: this.es_ids
					})
					.success(res => {
						this.$Message.success('取消成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			},
			batchAdjust() {
				if(this.sIds.length == 0) {
					this.$Message.error('请先勾选要操作的学员')
					return false
				}
				this.$r('batch_student').show('批量调整').set('es_ids', this.es_ids)
			},
			toggleSelectOne(event,item) {
				if(event) {
					this.sIds.push(item.sid)
					this.es_ids.push(item.es_id)
				}else{
					let index = this.sIds.indexOf(item.sid)
					let esidIndex = this.es_ids.indexOf(item.es_id)
					this.sIds.splice(index,1)
					this.es_ids.splice(esidIndex,1)
				}
				this.select_all = this.data.every(this.checkSelectAll)
			},
			toggleSelectAll(event) {
				this.data.forEach(item => {
					let index = this.sIds.indexOf(item.sid)
					let esidIndex = this.es_ids.indexOf(item.es_id)
					if(event) {
						if(index < 0) {
							this.sIds.push(item.sid)
							item.$selected = true
						}
						if(esidIndex < 0) {
							this.es_ids.push(item.es_id)
						}						
					}else{
						if(index > -1) {
							this.sIds.splice(index,1)
							item.$selected = false
						}
						if(esidIndex > -1) {
							this.es_ids.splice(esidIndex,1)
						}	
					}
				})
			},
			hook_get_param(param) {
				param.with = 'student'
				if(this.search_field.eid > 0) {
					param.eid = this.search_field.eid
				}
				if(this.search_field.sid > 0) {
					param.sid = this.search_field.sid
				}
			},
			deal_data(data) {
				this.refreshData(data.list)
				return data.list
			},
			checkSelectAll(item, index, arr) {
	            if(this.sIds.indexOf(item.sid) !== -1) {
	                return true
	            } else {
	                return false
	            }
	        },
	        refreshData(data) {
	        	this.sIds.splice(0)
	            data.forEach((item) => {
	                item.$selected = false
	            })
	            this.select_all = false
	        },
		}
	}
</script>
