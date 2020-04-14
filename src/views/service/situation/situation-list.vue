<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学情标题" prop="title" class="col-md-3 col-sm-6">
					<Input v-model="search_field.title" clearable placeholder="请输入标题"></Input>
				</Form-item>
				<Form-item label="创建日期" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="search" 
						placement="right-start" 
						style="width: 100%">
					</date-range-picker>
				</Form-item>
				<Form-item label="正式学员" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="意向客户" prop="cu_id" class="col-md-3 col-sm-6">
					<select-customer v-model="search_field.cu_id" clearable></select-customer>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
                	<div class="pull-right">
                        <per-scope per="student.checkAll" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
			 <div class="toolbar">
	        	<Button type="primary" icon="plus" @click="addStudyStiuation" v-per="'situation.add'">学情服务</Button>
	        	<filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'study_situations'" 
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
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import SelectCustomer from 'c%/SelectCustomer.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	export default {
		mixins: [common,globals,grid],
		components: {
			SelectStudent,
			SelectCustomer,
			DateRangePicker
		},
		data() {
			return {
				rest_api: 'study_situations',
				pk: 'ss_id',
				search_field: {
					title: '',
					sid: 0,
					cu_id: 0,
					int_day: []
				},
				type_situation: '',
				column_keys: {
					title: {
						title: '标题',
						show: true
					},
					service_object: {
						title: '服务对象',
						show: true
					},
					create_time: {
						title: '创建日期',
						show: true,
						sortable: 'custom'
					},
					remark: {
						title: '分析总结',
						show: true
					},
					create_employee_name: {
						title: '创建人',
						show: true
					}
				},
				column_render: {
					title(h,params) {
						return h('a',{
							attrs: {
								class: 'x-a-link text-info'
							},
							on: {
								click: ()=>{
									this.edit(params.row)								
								}
							}							
						},params.row.title)
					},
					service_object(h,params) {
						let name = '-',tag,
							row = params.row
						if(row.sid&&row.student) {
							name = row.student.student_name
							tag = h('Tag',{props: {
								type:'border',
								color:'green'
							}},'正式学员')
						}else if(row.cu_id&&row.customer) {
							name = row.customer.name
							tag = h('Tag',{props: {
								type:'border',
								color:'blue'
							}},'意向客户')
						}
						return h('span',[tag,name])
					},
					create_time(h,params) {
						return h('span',moment(params.row.create_time).format('YYYY-MM-DD'))
					}
				},
				operation_keys: {
					push: {
						title: '推送',
						type: 'paper-airplane'
					},
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'situation.edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'situation.delete'
					}
				},
				operation_func: {
					push(param) {
						this.pushSituation(param.row)
					},
					edit(param) {
						this.edit(param.row)
					},
					delete(param) {
						this.confirm(util.sprintf('确定删除学情记录【%s】吗？',param.row.title))
						.then(() => {
							this.delete(param.row)
						})
					}
				}
			}
		},
		watch: {
			'type_situation': function (val) {
				this.init_data()
			}
		},
		methods: {
			pushSituation(row) {
				let name = ''
				if(row.sid&&row.student) {
					name = row.student.student_name
				}else if(row.cu_id&&row.customer) {
					name = row.customer.name
				}
				this.$rest('study_situations')
				.add_url_param(row.ss_id,'push_preview')
				.post()
				.success(res => {
					this.$Modal.open('service/situation/push-info-modal.vue',{
						on: {
							'on-success':() => {
								this.init_data()
							}
						}
					})
					.then(modal => {
						modal.vuec
						.set('ssId',row.ss_id)
						.set('data',res.data)
						.show('推送学情服务给【'+name+'】家长','view')
					})
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			edit(row) {
				this.$router.push({name: 'dashboard_situation',params:{data:row}})
			},
			addStudyStiuation() {
				this.$router.push({path:'/dashboard/situation'})
			},
			perScopeChange(value) {
	            this.type_situation = value
	        },
	        hook_get_param(params){
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{		
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}
				if(this.type_situation == 'my') {
					params.create_uid = this.eid$
				}
				params.with = 'student,customer,lesson_buy_suit'
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>