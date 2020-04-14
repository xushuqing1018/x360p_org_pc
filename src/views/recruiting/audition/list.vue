<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form mt-3 row">
                <Form-item label="校区" prop="bid" class="col-md-3 col-sm-6">
					<select-branch v-model="search_field.bid" placeholder="请选择校区"></select-branch>
				</Form-item>
				<Form-item label="学员姓名" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.student_name" placeholder="请输入学员姓名"></Input>
				</Form-item>
				<Form-item label="学员状态" prop="is_formal_student" class="col-md-3 col-sm-6">
					<Select v-model="search_field.is_formal_student">
						<Option :value="-1">不限</Option>
						<Option :value="1">正式</Option>
						<Option :value="0">意向</Option>
					</Select>
				</Form-item>
				<Form-item label="试听类型" prop="listen_type" class="col-md-3 col-sm-6">
					<Select v-model="search_field.listen_type">
						<Option :value="-1">不限</Option>
						<Option :value="0">跟班试听</Option>
						<Option :value="1">排课试听</Option>
					</Select>
				</Form-item>
				<Form-item :label="label_teacher" prop="eid" class="col-md-3 col-sm-6">
					<select-employee :rid="1" v-model="search_field.eid" clearable></select-employee>
				</Form-item>
				<template v-if="searchExpand">					
					<Form-item label="选择课程" prop="lid" class="col-md-3 col-sm-6">
						<select-lesson v-model="search_field.lid" clearable></select-lesson>
					</Form-item>
					<Form-item label="选择班级" prop="cid" class="col-md-3 col-sm-6" v-if="enable_lesson_type0">
						<select-class v-model="search_field.cid" clearable></select-class>
					</Form-item>
					<Form-item label="试听日期" prop="int_day" class="col-md-3 col-sm-6">
						<date-range-picker v-model="search_field.int_day" @on-change="search" label="选择日期" placement="bottom" style="width: 100%">
						</date-range-picker>
					</Form-item>
					<Form-item label="试听状态" prop="attendance_status" class="col-md-3 col-sm-6">
						<Select v-model="search_field.attendance_status">
							<Option :value="1">已试听</Option>
							<Option :value="2">缺勤</Option>
							<Option :value="3">待试听</Option>
						</Select>
					</Form-item>
					<Form-item label="试听课名称" prop="name" class="col-md-3 col-sm-6">
						<Input v-model.trim="search_field.name" placeholder="请输入"></Input>
					</Form-item>
					<FormItem label="责任人" class="col-md-3 col-sm-6" prop="follow_eid">                    
	                   <select-employee v-model="search_field.follow_eid" clearable></select-employee>
	                </FormItem>
					<FormItem label="创建人" class="col-md-3 col-sm-6" prop="create_uid">                    
	                   <select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
	                </FormItem>
				</template>
			</Form>
			<Row class="basic">
                <Col span="24" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-3" type="primary" @click="search" icon="ios-search">查询</Button>     
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                	<export-button res="trial_listen_arranges" :params="params"></export-button>
                </Col>
           </Row>			
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" @click="addAudition" icon="plus" v-per="'aslist.add'">试听安排</Button>				
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	v-loading.like="'trial_listen_arranges'" 
		            	ref="tableExcel"
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
		            </Table>
		        </div>
		        <div class="content-footer">
		            <div class="pagenation">
		                <Page 
		                	transfer
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
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import selectClass from 'c%/SelectClass.vue'
	import selectLesson from 'c%/SelectLesson.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
    import SelectBranch from 'c%/SelectBranch.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,globals,common],
		components: {
			selectClass,
			selectLesson,
			selectEmployee,
			dateRangePicker,
            SelectBranch,
			ExportButton
		},
		data () {
			return {
				rest_api: 'trial_listen_arranges',
				pk: 'tla_id',
				search_field: {
					student_name: '',
					eid: 0,
					lid: 0,
					cid: 0,
					listen_type: -1,
					int_day: [],
					is_formal_student: -1,
					attendance_status: -1,
					create_uid: 0,
					follow_eid: 0,
                    name: '',
                    bid: 0
				},
				column_keys: {
                    bid: {
						title: '校区',
						show: true
					},
					name: {
						title: '学员姓名',
						show: true
					},
					age: {
						title: '年龄',
						show: false
					},
					sex: {
						title: '性别',
						show: false
					},
					mobile: {
						title: '手机号码',
						show: true
					},
					cid: {
						title: '试听课名称',
						show: true
					},
					listen_type: {
						title: '试听类型',
						show: true
					},
					eid: {
						title: '上课'+this.$filter('translate')('老师'),
						show: true
					},
					cr_id: {
						title: '上课教室',
						show: true
					},
					int_day: {
						title: '试听日期',
						show: true,
						sortable:'custom'
					},
					int_hour: {
						title: '上课时间',
						show: true
					},
					attendance_status: {
						title: '试听状态',
						show: true,
						sortable:'custom'
					},
					follow_eid: {
						title: '责任人',
						show: true,
						sortable:'custom'
					},
					create_uid: {
						title: '创建人',
						show: true,
						sortable:'custom'
					},
					from_did_name: {
						title: '招生来源',
						show: true,
					},
					market_channel_name: {
						title: '市场渠道',
						show: true,
					},		
				},
				column_render: {
					name (h,params) {
						let [name,color,tag] = ['','green','正式']
						
						if(params.row.student==null||_.isEmpty(params.row.student)){
							color = 'blue'
							tag = '意向'
							if(params.row.customer) {
								name = params.row.customer.name
							}
						}else {
							name = params.row.student.student_name
						}
						
						return h('div',[							
							h('Tag',{
								'class': 'mr-2',
								props: {
									type: 'border',
									color: color
								}
							},tag),
							h('span',util.sprintf('%s',name))
						])
					},
					age (h,params) {
						let age = ''
						if(params.row.student==null||_.isEmpty(params.row.student)){
							if(params.row.customer) {
								age = params.row.customer.birth_time
							}
						}else {
							age = params.row.student.birth_time
						}
						return h('span',util.age(age))
					},
					sex (h,params) {
						let sex = ''
						if(params.row.student==null||_.isEmpty(params.row.student)){
							if(params.row.customer) {
								sex = params.row.customer.sex
							}
						}else {
							sex = params.row.student.sex
						}
						return h('span',this.$filter('sex')(sex))
					},
					mobile (h,params) {
						let mobile = ''
						if(params.row.student==null||_.isEmpty(params.row.student)){
							if(params.row.customer) {
								mobile = params.row.customer.first_tel
							}
						}else {
							mobile = params.row.student.first_tel
						}
						return h('span',mobile)
					},
					cid (h,params) {
						let class_name = ''
						if(params.row.cid>0){
							class_name = params.row.one_class.class_name
						}else{
							if(!_.isEmpty(params.row.course)){
								class_name = params.row.course.name
							}
						}						
						
						return h('span',class_name)
					},
					listen_type (h,params) {
						let map_type = {0: '跟班试听',1: '排课试听'}
						return h('span',util.sprintf('%s',map_type[params.row.listen_type]))
					},
					eid (h,params) {
						return h('span',this.$filter('ename')(params.row.eid,'-'))
					},
					int_day (h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					},
					int_hour (h,params) {
						let start_hour = this.$filter('int_hour')(params.row.int_start_hour)
						let end_hour = this.$filter('int_hour')(params.row.int_end_hour)
						return h('span',util.sprintf('%s--%s',start_hour,end_hour))
					},
					attendance_status (h,params) {
						let row = params.row,
							result = '',
							classes = 'text-success',
							html = []
						if(row.is_attendance===1){
							if(row.attendance_status===1){
								result = '已试听'
							}else{
								classes = 'text-danger'
								result = '缺勤'
							}
						}else{
							classes = 'text-primary'
							result = '待试听'
						}
						
						html.push(h('span',{ 'class':classes },result))
						
						if(row.is_attendance == 1 && row.remark){
							html.push(h('p',`备注：${row.remark}`))
						}
						
						return h('div',html)
					},
					cr_id (h,params) {
						let classroom = ''
						if(params.row.course) {
							classroom = this.$filter('classroom_name')(params.row.course.cr_id,'未知')
						}
						return h('span',classroom)
					},
					follow_eid (h,params) {
						let result = '-'
						if(params.row.customer) {
							result = this.$filter('ename')(params.row.customer.follow_eid,'-')
						}
						return h('span',result)
					},
					create_uid (h,params) {
						return h('span',params.row.employee?params.row.employee.ename:'-')
					}
				},
				operation_keys: {
					complete: {
						title: '登记试听',
						type: 'card',
						per: 'aslist.complete',
						condition: 'row.is_attendance == 0'
					},
					del: {
						title: '删除试听',
						type: 'ios-trash',
						per: 'aslist.delete',
						condition: 'row.is_attendance == 0'
					},
					undo: {
						title: '撤销试听',
						type: 'reply',
						per: 'aslist.undo',
						condition: 'row.is_attendance == 1'
					},
					signup: {
						title: '报名',
						type: 'android-person-add',
						per: 'aslist.signup'
					}
				},
				operation_func: {
					complete (params) {
						this.completeInfo(params.row)
					},
					del (params) {
						this.del(params.row)
					},
					undo (params) {
						this.undoTrial(params.row)
					},
					signup (params) {
						this.signup(params.row)
					}
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			completeInfo (row) {
				this.$Modal.open('recruiting/audition/complete-modal.vue',{
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				}).then(modal=>{
					modal
					.set('id',row.tla_id)
					.show('登记试听','add')
				})
			},
			hook_get_param (params) {				
				params.int_day = util.get_date_query(this.search_field.int_day)
				params.with = 'employee'
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if(o=='listen_type'||o=='is_student'){
							if(property!=-1){
								params[o] = property	
							}
					}
					else if(o=='is_formal_student'){
						if(property==1) {
							params['sid'] = '[>,0]'
						}
						else if(property==0){
							params['sid'] = 0
						}
					}
					else if(o=='attendance_status'){
						if(property==1) {
							params.is_attendance = 1;
							params.attendance_status = 1;
						}
						else if(property==2) {
							params.is_attendance = 1;
							params.attendance_status = 0;
						}
						else if(property==3){
							params.is_attendance = 0;
						}
					}else if(o=='bid'){
						if(property==0) {
							params['bid'] = -1
						}
						else{
							params['bid'] = property
						}
					}
					else{
						if(property){
							params[o] = property								
						}							
					}									
				}
			},
			addAudition () {
				this.$Modal.open('recruiting/audition/info-modal.vue',{
					on: {
						'on-save-success': () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('添加试听安排')
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
			},
			del (row) {
				let name = '',tip = '',
				day = this.$filter('int_date')(row.int_day),
				start_hour = this.$filter('int_hour')(row.int_start_hour),
				end_hour = this.$filter('int_hour')(row.int_end_hour)
				
				if(!_.isEmpty(row.customer)){
					name = row.customer.name
				}
				if(!_.isEmpty(row.student)){
					name = row.student.student_name
				}				
				
				tip = util.sprintf('确定取消【%s】 %s 日 %s--%s 的视听安排吗？',name,day,start_hour,end_hour)
				let	params = {
						ca_id: row.ca_id,
						list: [
							{
								sid: row.sid,
								cu_id: row.cu_id
							}
						]
					}
				
				this.confirm(tip)
				.then(()=>{					
					this.$rest('course_arrange_students/delete_student')
					.post(params)
					.success(data=>{
						this.$Message.success('移除成功！')
						this.init_data()
					}).error(response=>{
						this.error(response.body.message||'操作失败~')
					})
				})
			},
			signup (row) {
				let params = {}
				
				if(row.sid > 0){
					params = {sid: row.sid}
					this.$router.push({name:'dashboard_payment',params:params})
				}else if(row.cu_id > 0){
					params = {cu_id: row.cu_id}
					this.$router.push({name: 'dashboard_signup',params: params})
				}
			},
			undoTrial (row) {
				let name = ''
				if(!_.isEmpty(row.customer)){
					name = row.customer.name
				}
				if(!_.isEmpty(row.student)){
					name = row.student.student_name
				}
				this.confirm(util.sprintf('确定撤销【%s】的试听状态，恢复到待试听状态？',name))
				.then(() => {
					this.$rest('trial_listen_arranges').add_url_param(row.tla_id,'docancel')
					.post()
					.success(res => {
						this.$Message.success('撤销成功')
						this.init_data()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			}
		}		
	}
</script>
