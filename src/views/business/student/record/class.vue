<template>
	<div>
		<Card dis-hover class="mt-2" style="margin:15px 0;">
			<div slot="title">
				<Form class="row">
					<Form-item  class="mb-0 col-sm-11">
						<Icon type="person"></Icon>
						学员当前所在班级
					</Form-item>
					<Form-item  class="mb-0 col-sm-1" v-if="data.length == 0">
						<Button type="primary" icon="plus" style="margin-left:5px;" size="small" @click="doAssignStudent">分班</Button>
					</Form-item>									
				</Form>					
			</div>
			<table class="modal-table">
				<thead>
					<tr>
						<th>
							<div class="ivu-table-cell">班级名称</div>
						</th>
						<th>
							<div class="ivu-table-cell">入班日期</div>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in student" :key="index">
						<td>
							<div class="ivu-table-cell">{{item.one_class.class_name}}</div>
						</td>
						<td>
							<div class="ivu-table-cell">{{item.in_time.slice(0, 11)}}</div>
						</td>
					</tr>
					<tr v-if="data.length==0">
						<td colspan="4">
							<div class="ivu-table-cell text-center">没有数据</div>
						</td>
					</tr>
				</tbody>
			</table>
		</Card>
		<Card dis-hover>
			<div slot="title">
				<Icon type="person"></Icon>
				分班记录
			</div>
			<table class="modal-table">
				<thead>
					<tr>
						<th>
							<div class="ivu-table-cell">班级名称</div>
						</th>
						<th>
							<div class="ivu-table-cell">出入班时间</div>
						</th>
						<th>
							<div class="ivu-table-cell">操作类型</div>
						</th>
						<th>
							<div class="ivu-table-cell">经办人</div>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item, index) in data" :key="index">
						<td>
							<div class="ivu-table-cell"><class-name :name="item.class_name" :cid="item.cid" :detail-action="2"/></div>
						</td>
						<td>
							<div class="ivu-table-cell">{{item.op_time}}</div>
						</td>
						<td>
							<div class="ivu-table-cell">{{map_event_type[item.op_type]}}</div>
						</td>
						<td>
							<div class="ivu-table-cell">{{item.create_uid}}</div>
						</td>
					</tr>
					<tr v-if="data.length==0">
						<td colspan="4">
							<div class="ivu-table-cell text-center">没有数据</div>
						</td>
					</tr>
				</tbody>
			</table>
		</Card>
		<!-- <div class="mt-3 text-right">
		            <Page 
		            	:total="total" 
		            	:current="pageIndex" 
		            	:show-sizer="true" 
		            	:page-size="pageSize" 
		            	:show-total="true" 
		            	@on-change="pagenation" 
		            	@on-page-size-change="pagesize">
		            </Page>
		        </div> -->
	</div>
</template>
<script>
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ClassName from 'c%/ClassName.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
           ClassName
		},
		props: {
			sid: {
				type: [Number,String],
				default:0
			}	
		},
		data() {
			return {
				rest_api: 'class_students/assign_class_logs',
				map_event_type: {1:'入班',2:'出班'},
				id: this.sid > 0?this.sid:this.$route.params.id,
				student:[],
				student_name:"",
			}
		},
		mounted() {
			this.init_data()
			this.init_students()
		},
		methods: {
			hook_get_param(params) {
				params.sid = this.id
			},
			init_students() {
				let url = `students/${this.id}/classes?with=student`
        this.$rest(url)
          .get()
          .success((response)=>{
						this.student = response.list
						this.student_name = response.list[0].student.student_name
          })
          .error((response)=>{
            this.error(response.body.message)
        })			
			},
			doAssignStudent(item) {
				this.$Modal.open('business/student/record/assign-student-modal.vue',{
					props: {
						'class-info': item.one_class,
						sid: this.id,
						student_name: this.student_name
					},
					on: {
						'on-success': () => {
								this.init_data()
								this.init_students()
						}
					}
				})
        .then(modal=>{
        	modal.show('选择分班学员','add')
        })
			},
		}
	}
</script>