<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-Item label="学员姓名" class="col-md-3 mb-0" prop="sid">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-Item>
				<Form-Item label="回访效果" class="col-md-3 mb-0" prop="is_connect">
					<Select v-model="search_field.is_connect">
						<Option :value="-1">不限</Option>
						<Option :value="0">无效</Option>
						<Option :value="1">有效</Option>
					</Select>
				</Form-Item>
				<Form-item label="回访时间" class="col-md-3 mb-0" prop="create_time">
					<date-range-picker 
						v-model="search_field.create_time" 
						@on-change="search" 
						label="选择日期" 
						placement="bottom" 
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="学员状态" prop="status" class="col-md-3 col-sm-6">
					<Select v-model="search_field.status">
						<Option v-for="(value,key) in ss_map" :value="key" :key="key">{{value.text}}</Option>
					</Select>
				</Form-item>
				
				<template v-if="searchExpand&&type_visit=='all'">
					<Form-Item label="回访方式" class="col-md-3 mb-0" prop="followup_did">
						<Select v-model="search_field.followup_did">
							<Option :value="0">不限</Option>
							<Option v-for="item in dicts('followup')" :value="item.did">{{item.title}}</Option>
						</Select>
					</Form-Item>
					<Form-Item label="回访人" class="col-md-3 mb-0" prop="create_uid" v-if="type_visit=='all'">
						<select-employee v-model="search_field.create_uid" mode="user" clearable></select-employee>
					</Form-Item>
				</template>			
			</Form>
			
			<Row class="basic">
	            <Col span="24" class="mt-2" style="margin-left: 0">
	            	<Button-group>
                        <Button type="primary" @click="search" icon="ios-search">查询</Button>     
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"  v-if="type_visit=='all'"></Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<!-- <Button type="primary" @click="exportExcel('回访记录')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button> -->

                	<export-button res="visits" :params="params" v-per="'visit.export'"></export-button>
                	<div class="pull-right">
                        <per-scope per="visit.all" @on-change="perScopeChange"></per-scope>
                   	</div>
	            </Col>
	        </Row>
		</div>
		
		<div class="box box-result">
			<div class="toolbar">
	            <Button type="primary" @click="addInfo()" icon="plus" v-per="'visit.add'">添加回访</Button>
	            <!--<Button type="error" :disabled="ht_ids.length==0" @click="multiDel" icon="ios-trash">批量删除</Button>-->
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 
		            	v-loading="'student_return_visits'" 
		            	ref="tableExcel"
		            	:page="pageIndex" 
		            	:page-size="pageSize" 
		            	:stripe="true" 
		            	:show-header="true" 
		            	:data="data" 
		            	:columns="columns" 
		            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
		            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
		            	@on-sort-change="sortChange"> 
		            </Table>
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
		<preview-file ref="preview" :list="currentFile.student_return_visit_attachment"></preview-file>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import PreviewFile from 'c%/PreviewFile.vue'
	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins:[ grid,common,globals],
		components: {
			PreviewFile,
			SelectEmployee,
			SelectStudent,
			DateRangePicker,
			ExportButton,
		},
		data () {
			return {
				rest_api: 'student_return_visits',
				pk: 'srv_id',
				tab: '1',		
				type_visit: '',
				currentFile: {},
				search_field: {
					create_time: [],
					followup_did: 0,
					is_connect: -1,
					sid: 0,
					create_uid: 0,
					status: 0
				},
				column_keys: {
					sname: {
						title: '姓名',
						show: true,
						width: 150
					},
					is_connect: {
						title: '是否有效',
						show: true,
						width: 130
					},
					followup_did: {
						title: '回访方式',
						show: true,
						width: 130
					},
					int_day: {
						title: '回访日期',
						sortable:'custom',
						show: true,
						width: 130
					},
					eid: {
						title: '回访人',
						show: false,
						width: 130
					},
					content: {
						title: '回访内容',
						show: true
					},
					attachment: {
						title: '附件',
						show: true,
						width: 120
					},
					create_time: {
						title: '登记时间',
						show: true,
						width: 160
					},
					assist: {
						title: '需要协助',
						show: false,
						width: 120
					},
					s_eid: {
						title: '学管师',
						show: false,
						width: 120
					},
					school_id: {
						title: '公立学校',
						show: false,
						width: 120
					},
				},
				column_render: {
					assist(h,params) {
						let task = params.row.service_task
						if(params.row.need_assist&&task) {
							return h('Tooltip',{
								class:'assist-tip'
							},[
								h('span',{
									class: 'text-info cursor'
								},params.row.assist_status?'是,已协助':'是'),
								h('div',{
									slot:'content'
								},[
									h('p','协助人:'+this.$filter('ename')(task.own_eid)),
									h('p','备注:'+task.remark)
								])
							])
						}
						else{
							return h('span','否')
						}
					},
					sname(h,param) {
						let name = h('span',param.row.student.student_name)
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:this.ss_map[param.row.student.status].color
								}
							},
							this.ss_map[param.row.student.status].text
						)
						return h('div',[name,' ',tag])
					},
					is_connect(h,params) {
						let map = {0:'无效',1:'有效'}						
						return h('span',map[params.row.is_connect]) 
					},
					followup_did (h,params) {
						return h('span',this.labelDicts(params.row.followup_did,'followup'))
					},
					eid (h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					s_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.student.eid))
					},
					school_id (h,params) {
						return h('span',this.school_name(params.row.student.school_id))
					},
					attachment (h,params) {
						if(params.row.student_return_visit_attachment.length>0){
							return h('Button',{
								props: {
									type: 'ghost',
									icon: 'eye',
									size: 'small'
								},
								on: {
									click: ()=>{
										this.currentFile = params.row
										this.previewFile()
									}
								}
							})
						}else{
							return h('span','-')
						}
					}
				},
				operation_keys: {
					add: {
						title: '回访',
						type: 'plus',
						per: 'visit.add'
					},
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'visit.edit'
					},
					del: {
						title: '删除',
						type: 'ios-trash',
						per: 'visit.delete'
					}
				},
				operation_func:{
					add (param) {
						this.addInfo(param.row)
					},
					edit(param) {
						this.editInfo(param.row)
					},
					del (params) {
						this.delInfo(params.row)
					}
				}
			}
		},
		watch: {
			'type_visit': function (val) {
				this.column_keys.eid.show = val==1
				this.init_data()
			}
		},
		methods: {		
			previewFile () {
				this.$refs.preview.show('回访附件','add')
			},
			school_name (id) {
				let public_schools_array = this.$store.state.gvars.public_schools,
					school_name = ''
				public_schools_array.forEach(item => {
					if(item.ps_id === id){
						school_name	= item.school_name
					}
				})
				return school_name
			},
			perScopeChange(value) {
	            this.type_visit = value
	        },
	        editInfo (row) {
	        	let title = util.sprintf('编辑【%s】回访',row.student.student_name)
				let info = util.copy(row)
				info.int_day = this.$filter('int_date')(row.int_day)
				this.$Modal.open('service/aclass/visit/info-modal.vue',{
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',info)
					.set('sid',info.student.sid)
					.show(title,'edit')
				})
	        },
			addInfo (row,tab) {
				let title = '添加回访'
				tab = tab || 'info'
				
				if(row){
					title = util.sprintf('添加【%s】回访',row.student.student_name)
					
					this.$Modal.open('service/aclass/visit/info-modal.vue',{
						on: {
							'on-success':() => {
								this.init_data()
							}
						}
					})
					.then(modal => {
						modal
						.set('sid',row.student.sid)
						.set('tab',tab)
						.show(title,'add')
					})
				}else{
					this.$Modal.open('service/aclass/visit/info-modal.vue',{
						on: {
							'on-success':() => {
								this.init_data()
							}
						}
					})
					.then(modal => {
						modal
						.set('sid',0)
						.show(title,'add')
					})
				}
				
			},
			delInfo (row) {
				let tip = util.sprintf('确定删除学员【%s】 【%s】 的回访记录吗？',
							row.student.student_name,
							this.$filter('int_date')(row.int_day))
				
				this.confirm(tip)
				.then(()=>{
					this.delete(row)	
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
				params.with = 'student,student_return_visit_attachment,service_task'
				
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}
					else if(o=='is_connect'){
						if(property!=-1){
							params[o] = property
						}
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
				if(this.type_visit=='my'){
					params.eid = this.eid$
				}
			},
			
		}
	}
</script>

<style>
	.assist-tip .ivu-tooltip-inner{
		max-width: 250px;
		white-space: normal;
	}
</style>