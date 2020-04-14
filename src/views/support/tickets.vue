<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="完成日期" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="search" 
						label="选择完成日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
				<Form-item label="服务类型" prop="fc_service_did" class="col-md-3 col-sm-6">
					<Select v-model="search_field.fc_service_did">
						<Option :value="-1">不限</Option>
						<Option v-for="item in dicts('fc_service')" :value="item.did">{{item.title}}</Option>
					</Select>
				</Form-item>
			</Form>
			<Row class="basic">
	            <Col span="24" class="mt-2">
	            	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>  
                    </Button-group>
                	<Button type="primary" icon="ios-refresh" @click="resetSearch">重置</Button>
                	<export-button res="franchisee_service_applys" :params="params"></export-button>
					<div class="pull-right">
                        <per-scope per="franchisee.allService" @on-change="type_service = $event"></per-scope>
                   	</div>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="addTicket">添加工单</Button>
	            <filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
				<div class="content-body">
			        <Table 
				        v-loading.like="'franchisee_service_applys'" 
				        :page-size="pageSize" 
				        :page="pageIndex" 	
				        :stripe="true" 
				        :show-header="true" 
				        :data="data" 
				        :columns="columns" 
				        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
				        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
				        @on-sort-change="sortChange"
				        > 
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
				            @on-page-size-change="pagesize"
			           		>
			            </Page>
			        </div>
			    </div>  
		    </div>
	    </div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectFranchisee from 'c%/SelectFranchisee.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import ImportButton from 'c%/ImportButton.vue'

	export default {
		mixins: [grid,common,globals],
		components: {
			SelectEmployee,
			SelectFranchisee,
			DateRangePicker,
			ExportButton,
			ImportButton
		},
		data() {
			return {
				rest_api: 'franchisee_service_applys',
				pk: 'fsa_id',
				type_service: '',
				search_field: {
					fc_service_did: -1,
					fc_id: 0,
					service_eid: 0,
					int_day: []
				},
				new_apply_nums: 0,
				column_keys: {
					title: {
						title: '标题',
						fixed: 'left',
						width: 280
					},
					status: {
						title: '状态',
						width: 120
					},
					fc_service_did: {
						title: '服务类型',
						width: 120
					},
					apply_eid: {
						title: '申请人',
						width: 180
					},
					service_employee_name: {
						title: '督导',
						width: 150
					},
					service_fee: {
						title: '服务费用',
						width: 120
					},
					read_time: {
						title: '阅读时间',
						width: 220
					},
					receive_time: {
						title: '接受时间',
						width: 180
					},
					finish_time: {
						title: '完成时间',
						width: 180
					},
					remark: {
						title: '备注',
						width: 250
					}
				},
				column_render: {
					title(h,params) {
						let title = h('a',{
							class: 'text-info',
							on: {
								click:() => {
									this.ticketDetail(params.row)
								}
							}
						},params.row.title)
						let badge = h('Badge',{
							props: {
								count: params.row.unread
							}
						})
						return h('div',[title,badge])
					},
					apply_eid(h,params) {
						return h('span',this.$filter('ename')(params.row.apply_eid))
					},
					fc_service_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.fc_service_did,'fc_service'))
					},
					service_fee(h,params) {
						let icon = this.label_currency
						return h('span',[icon,params.row.service_fee])
					},
					receive_time(h,params) {
						if(params.row.receive_time!=0) {
							return h('span',params.row.receive_time)
						}
						return h('span','-')
					},
					read_time(h,params) {
						if(params.row.is_read) {
							return h('span',{class:'text-success'},params.row.read_time+ ' '+ params.row.read_employee_name+'已读')
						}else{
							return h('span',{class:'text-danger'},'未读')
						}
					},
					finish_time(h,params) {
						let result = '-'
						if(params.row.int_day!=0) {
							result = params.row.int_day
							if(params.row.int_hour!=0) {
								result = result+' '+params.row.int_hour
							}
						}
						return h('span',result)
					},
					status(h,params) {
						let	status = params.row.status
						let map = {0:['待服务','text-danger'],1:['已受理',''],2:['处理中',''],3:['已完成','text-success']}
						return h('span',{
							class:map[status][1]
						},map[status][0])
					}
				},
				operation_keys: {
					detail: {
						title: '详情',
						type: 'ios-eye'
					}
				},
				operation_func: {
					detail(params) {
						this.ticketDetail(params.row)
					}
				}
			}
		},
		mounted() {
			
		},
		watch: {
			'type_service': function (val) {
				this.init_data()
			}
		},
		methods: {
			addTicket() {
				this.$Modal.open('app/franchisees/service/apply-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('提交工单','add')
				})
			},
			readApply(row) {
				this.$rest('franchisee_service_applys').add_url_param(row.fsa_id,'read')
				.post({
					read_eid: this.eid$
				})
				.success(res => {
					this.$router.push({path: `/support/tickets/${row.fsa_id}`})
				})
				.error(res => {
					this.error(res.message)
				})
			},
			ticketDetail(row) {
				this.readApply(row)
			},
			perScopeChange(v) {
				this.type_service = v
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else{
						if(property!=''&&property!==-1){
							params[o] = property	
						}		
					}									
				}
				params.with = 'franchisee'

				if(this.type_service=='my') {
					params.service_eid = this.eid$
				}
			}
		}
	}
</script>