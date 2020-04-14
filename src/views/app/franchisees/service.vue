<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="加盟商" prop="fc_id" class="col-md-3 col-sm-6">
					<select-franchisee v-model="search_field.fc_id"></select-franchisee>
				</Form-item>
				<Form-item label="完成日期" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day" 
						@on-change="search" 
						label="选择完成日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>					
				</Form-item>
				<Form-item label="完成员工" prop="eid" class="col-md-3 col-sm-6">
					<select-employee v-model="search_field.eid" clearable></select-employee>
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
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                	<export-button res="franchisee_service_records" :params="params"></export-button>
                	<import-button res="franchisee_service_records" name="督导服务" @on-import-finish="init_data"></import-button>
					<div class="pull-right">
                        <per-scope per="franchisee.allService" @on-change="type_service = $event"></per-scope>
                   	</div>
	            </Col>
	        </Row>         
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<Button type="primary" icon="plus" @click="addService">添加服务记录</Button>
				<Badge :count="new_apply_nums" class="ml-2" v-if="new_apply_nums>0">
                	<Button type="ghost" @click="applyHistory" icon="ios-recording-outline">服务申请记录</Button>
                </Badge>
                <Button type="ghost" class="ml-2" icon="ios-recording-outline" @click="applyHistory" v-else>服务申请记录</Button>
	            <filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
				<div class="content-body">
			        <Table 
				        v-loading="'franchisee_service_records'" 
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
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectFranchisee from 'c%/SelectFranchisee.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import DateRangePicker from 'c%/DateRangePicker.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import ImportButton from 'c%/ImportButton.vue'

	export default {
		mixins: [grid,modal,common,globals],
		components: {
			SelectEmployee,
			SelectFranchisee,
			DateRangePicker,
			ExportButton,
			ImportButton
		},
		data() {
			return {
				rest_api: 'franchisee_service_records/all_records',
				pk: 'fsr_id',
				type_service: '',
				search_field: {
					fc_service_did: -1,
					fc_id: 0,
					eid: 0,
					int_day: []
				},
				new_apply_nums: 0,
				column_keys: {
					franchisee: {
						title: '加盟商'
					},
					fc_service_did: {
						title: '服务类型'
					},
					content: {
						title: '服务内容',
						width: 500
					},
					eid: {
						title: '服务员工'
					},
					int_day: {
						title: '完成时间'
					}
				},
				column_render: {
					franchisee(h,params) {
						return h('span',params.row.franchisee.org_name)
					},
					fc_service_did(h,params) {
						return h('span',this.$filter('dict_title')(params.row.fc_service_did,'fc_service'))
					},
					apply(h,params) {
						let result = [],
							apply = params.row.service_apply
						if(apply) {
							result.push(h('p',`标题: ${apply.title}`))
							result.push(h('p',`申请人: ${apply.apply_eid}`))
							result.push(h('p',`备注: ${apply.remark||'-'}`))
							return h('div',result)
						}else{
							return h('div','-')
						}
						
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
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid||'-'))
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit'
					},
					view: {
						title: '附件',
						type: 'document',
						condition: 'row.franchisee_service_record_file.length>0'
					},
					del: {
						title: '删除',
						type: 'ios-trash'
					}
				},
				operation_func: {
					edit(params) {
						this.$Modal.open('app/franchisees/service/info-modal.vue',{
							on: {
								save: () => {
									this.init_data()
								}
							}
						})
						.then(modal => {
							modal
							.set('info',params.row)
							.show('编辑服务记录','edit')
						})
					},
					view(params) {
						this.viewFiles(params.row)
					},
					del(params) {
						this.confirm()
						.then(() => {
							this.rest_api = 'franchisee_service_records'
							this.delete(params.row)
						})
					}
				}
			}
		},
		mounted() {
			this.get_new_apply()
		},
		watch: {
			'type_service': function (val) {
				this.init_data()
			}
		},
		methods: {
			addService() {
				this.$Modal.open('app/franchisees/service/info-modal.vue',{
					on: {
						save: () => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.show('添加服务记录','add')
				})
			},
			applyHistory() {
				this.$Modal.open('app/franchisees/service/receive-apply-modal.vue',{
					on: {
						save:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('服务申请记录')
				})
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
			get_new_apply() {
				this.$rest('franchisee_service_applys/get_new_apply_nums')
				.get()
				.success(res => {
					this.new_apply_nums = res
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			hook_get_param (params) {
				this.rest_api = 'franchisee_service_records/all_records';
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
				params.with = 'franchisee,franchisee_service_record_file'

				if(this.type_service=='my') {
					params.eid = this.eid$
				}
			}
		}
	}
</script>