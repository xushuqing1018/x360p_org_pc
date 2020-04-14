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
                	<Button type="primary" icon="md-refresh" @click="resetSearch">重置</Button>
                	<export-button res="franchisee_service_records" :params="params"></export-button>
					<!-- <div class="pull-right">
                        <per-scope per="franchisee.allService" @on-change="type_service = $event"></per-scope>
                   	</div> -->
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
	            <filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
				<div class="content-body">
			        <Table 
				        v-loading.like="'franchisee_service_records'" 
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
				rest_api: 'franchisee_service_records',
				pk: 'fsr_id',
				type_service: '',
				search_field: {
					fc_service_did: -1,
					fc_id: 0,
					eid: 0,
					int_day: []
				},
				column_keys: {
					content: {
						title: '服务内容',
						width: 500
					},
					fc_service_did: {
						title: '服务类型'
					},
					employee_name: {
						title: '服务督导'
					},
					int_day: {
						title: '服务时间'
					},
					is_need_reply: {
						title: '需要回复'
					},
					is_read: {
						title: '阅读时间'
					}
				},
				column_render: {
					content(h,params) {
						let content = h('a',{
							class: params.row.is_need_reply?'text-info':'',
							on: {
								click:() => {
									if(params.row.is_need_reply) {
										this.serviceDetail(params.row)
									}
								}
							}
						},params.row.content)
						let badge = h('Badge',{
							props: {
								count: params.row.unread
							}
						})
						return h('div',[content,badge])
					},
					fc_service_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.fc_service_did,'fc_service'))
					},
					int_day(h,params) {
						let result = '-'
						if(params.row.int_day!=0) {
							result = params.row.int_day
							if(params.row.int_hour!=0) {
								result = result+' '+params.row.int_hour
							}
						}
						return h('span',result)
					},
					is_show_to_fc(h,params) {
						return h('span',params.row.is_show_to_fc?'是':'否')
					},
					is_need_reply(h,params) {
						return h('span',params.row.is_need_reply?'是':'否')
					},
					is_read(h,params) {
						if(params.row.is_read) {
							return h('span',{class:'text-success'},params.row.read_time+' '+this.$filter('ename')(params.row.read_fc_eid)+'已读')
						}else{
							return h('span',{class:'text-danger'},'未读')
						}
					}
				},
				operation_keys: {
					detail: {
						title: '详情',
						type: 'ios-eye',
						condition: 'row.is_need_reply==1'
					},
					view: {
						title: '附件',
						type: 'document',
						condition: 'row.franchisee_service_record_file.length>0'
					}
				},
				operation_func: {
					detail(params) {
						this.serviceDetail(params.row)
					},
					view(params) {
						this.viewFiles(params.row)
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		watch: {
			'type_service': function (val) {
				this.init_data()
			}
		},
		methods: {
			serviceDetail(row) {
				this.readApply(row)
			},
			viewFiles(row) {
				this.$Modal.open('components/PreviewFile.vue@modal',{
					props: {
						list: row.franchisee_service_record_file
					}
				})
				.then(modal => {
					modal
					.show(util.sprintf('查看服务附件'))
				})
			},
			readApply(row) {
				this.$rest('franchisee_service_records').add_url_param(row.fsr_id,'read')
				.post({
					read_eid: this.eid$
				})
				.success(res => {
					this.$router.push({path: `/support/services/${row.fsr_id}`})
				})
				.error(res => {
					this.error(res.message)
				})
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
					params.eid = this.eid$
				}
			}
		}
	}
</script>