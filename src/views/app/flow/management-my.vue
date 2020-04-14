<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="100" class="filter-form row">
				<Form-item label="流程标题名称" class="col-sm-3" prop="flow_title">
					<Input v-model="search_field.flow_title" placeholder="请输入流程标题名称"></Input>
				</Form-item>
				<Form-item label="发起校区" class="col-sm-3" prop="start_bid">
					<select-branch v-model="search_field.start_bid" placeholder="请选择发起校区"></select-branch>
				</Form-item>
			</Form>
			<Row class="basic">
                <Col span="24" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
					
                	<CheckboxGroup class="ml-3" style="display: inline-block;" v-model="search_field.flow_result">
                		<Checkbox class="mb-0" label="0">待审批</Checkbox>
                		<Checkbox class="mb-0" label="1,2,3">已审批</Checkbox>
                	</CheckboxGroup>       
					<div class="pull-right">
                        <per-scope per="flow.all" :show-my="true" @on-change="perScopeChange"></per-scope>
                    </div>    		
                </Col>
           </Row>	
		</div>		
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
		            <Table 
		            	ref="tableExcel"
		            	v-loading="'flow'" 
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
    import SelectEmployee from 'c%/SelectEmployee.vue'
    import SelectBranch from 'c%/SelectBranch.vue'

    const flow_result_title = {0:'待审批',1:'审批通过待下一步审批',2:'被驳回',3:'已完成'}
    const flow_result_color = {0:'default',1:'blue',2:'red',3:'green'}
    const is_finish_title = {0:'未结束',1:'已结束'}
    const is_finish_color = {0:'default',1:'green'}
		
	export default{
		mixins: [ grid, common, globals ],
		components: {
            SelectEmployee,
            SelectBranch
		},
		data () {
			return {
				rest_api: 'flows',
				pk: 'fid',				
				search_field: {
                    flow_title: '',
                    flow_result: [],
                    start_bid:0,
                    start_eid:0
				},
				column_keys: {
					flow_title: {
						title: '流程标题',
						show: true
					},
					flow_desc: {
						title: '流程描述',
						show: true
					},
					ft_name: {
						title: '流程类型',
						show: true
					},
					start_eid: {
						title: '发起人',
						show: true
                    },
                    create_time: {
						title: '发起时间',
						show: true
					},
					flow_step: {
						title: '流程当前步骤',
						show: true
					},
					is_finish: {
						title: '流程是否结束',
						show: true
					},
					flow_result: {
						title: '流程状态',
						show: true
					}
				},
				column_render: {
					ft_name (h,params) {
						return h('span',params.row.flow_type.ft_name)   
					},
					start_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.start_eid))    
					},
					is_finish(h,params){
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:is_finish_color[params.row.is_finish]
								}
							},
							is_finish_title[params.row.is_finish]
						)
						let result = [tag]
						return h('div',result)
					},
					flow_result (h,params) {
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:flow_result_color[params.row.flow_result]
								}
							},
							flow_result_title[params.row.flow_result]
						)
						let result = [tag]
						return h('div',result)
					}
                },
                operation_keys: {
                    view: {
						title: '查看详情',
						type: 'eye'		
					},
					edit: {
						title: '编辑',
                        type: 'edit',
                        condition: 'row.flow_result == 0'
					},
					delete: {
						title: '删除',
                        type: 'ios-trash',
                        condition: 'row.flow_result == 0'
					}
				},
				operation_func: {
                    view (params) {
						this.viewInfo(params.row)
					},
					edit (params) {
						this.editInfo(params.row)
					},
					delete (params) {
						this.deleteInfo(params.row)
					}
				}
			}
		},		
		mounted () {
            this.search_field.start_eid = this.eid$
		},
		methods: {
			perScopeChange(value) {
				this.$emit('on-check',value)
			},
			resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if (o=='flow_result'){
                        if(property.length>0){
                            params[o] = util.sprintf('[In,%s]',property.join(','))
                        }
                    }
                    else{
                        if(property&&property!=-1){
                            params[o] = property    
                        }       
					}                                     
				}
				params.with = 'flow_steps,flow_type'
            },
            viewInfo (row) {
				this.$Modal.open('app/flow/view-flow-info-modal.vue',{
                    props:{
                        fid:row.fid
                    },
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('查看流程详情')
				})
            },
			editInfo (row) {
				this.$Modal.open('app/flow/flow-info-modal.vue',{
                    props:{
                        ft_id:row.ft_id,
                        flow_check_eid:row.flow_steps[0].check_eid
                    },
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set("info",row).show('编辑流程','edit')
				})
            },
            deleteInfo (row){
				this.$Modal.confirm({
					content: `确认要删除【${row.flow_title}】流程吗？`,
					onOk: ()=> {
						this.$http.delete('flows/' + row.fid)
						.then(res => {
							this.$Message.success('删除成功');
							this.init_data();
						},res => {
							this.error(res.body.message);
						})
					}
				})
			}
		}
	}
</script>

<style>
</style>