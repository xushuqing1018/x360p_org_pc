<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="100" class="filter-form row">
				<Form-item label="流程类型名称" class="col-sm-3" prop="ft_name">
					<Input v-model="search_field.ft_name" placeholder="请输入流程类型名称"></Input>
				</Form-item>
				<!--	
				<Form-item label="是否系统流程" class="col-sm-3" prop="is_system">
					<Select v-model="search_field.is_system" placeholder="请选择">
				        <Option value="1">是</Option>
						<Option value="0">否</Option>
				    </Select>
				</Form-item>
				-->
				<Form-item label="流程步骤类型" class="col-sm-3" prop="flow_step_type">
					<Select v-model="search_field.flow_step_type" placeholder="请选择">
				        <Option value="0">自由流程</Option>
						<Option value="1">固定流程</Option>
				    </Select>
				</Form-item>
				<Form-item label="发起限制" class="col-sm-3" prop="limit_type">
					<Select v-model="search_field.limit_type" placeholder="请选择">
				        <Option value="0">无限制</Option>
						<Option value="1">按角色</Option>
						<Option value="2">按部门</Option>
						<Option value="10">指定员工</Option>
				    </Select>
				</Form-item>		
			</Form>
			<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">                	
                	<Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
                    </Button-group>
                	<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>               		
                </Col>
           </Row>	
		</div>		
		<div class="box box-result">
			<div class="toolbar">
				<Button class="ml-2" type="primary" icon="plus" @click="addInfo" v-per="'flow.type'">添加</Button>
			</div>
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
    
    const flow_step_type_title = {0:'自由流程',1:'固定流程'}
    const limit_type_title = {0:'无限制',1:'按角色',2:'按部门',10:'指定员工'}
		
	export default{
		mixins: [ grid, common, globals ],
		data () {
			return {
				rest_api: 'flow_types?with=flow_type_step',
				pk: 'ft_id',				
				search_field: {
					ft_name: '',
					is_system: 0,
					flow_step_type: 0,
					limit_type: 0
				},
				column_keys: {
					ft_name: {
						title: '流程类型名称',
						show: true
					},
					ft_desc: {
						title: '流程描述',
						show: true
					},
					/*
					is_system: {
						title: '是否系统流程',
						show: true
					},
					*/
					flow_step_type: {
						title: '流程步骤类型',
						show: true
					},
					limit_type: {
						title: '发起限制',
						show: true
					}
				},
				column_render: {
                    is_system(h,params) {
						let tag =  h('Tag',{
								props:{
									type:'border',
									color:params.row.is_system == 1 ? 'blue' : 'default'
								}
							},
							params.row.is_system == 1 ? '是' : '否'
						)
						let result = [tag]
						return h('div',result)
                    },
                    flow_step_type(h,params) {
						return h('span',flow_step_type_title[params.row.flow_step_type])
                    },
                    limit_type(h,params) {
						return h('span',limit_type_title[params.row.limit_type])
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						condition: 'row.flow_type_step.length == 0'
					},
					initStep: {
						title: '设置流程步骤',
						type: 'plus',
						condition: 'row.flow_step_type == 1'
					},
					delete: {
						title: '删除',
						type: 'ios-trash'
					}
				},
				operation_func: {
					edit (params) {
						this.editInfo(params.row)
					},
					initStep (params) {
						this.initStepInfo(params.row)
					},
					delete (params) {
						this.deleteInfo(params.row)
					}
				}
			}
		},		
		mounted () {
			this.init_data()
		},
		methods: {
			editInfo (row) {
                row.limit_type = row.limit_type + ''
                row.flow_step_type = row.flow_step_type + ''
				row.is_system = row.is_system == 1

				this.$Modal.open('app/flow/type-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.set('info',row)
					.show('编辑流程类型','edit')
				})
			},
			initStepInfo (row){
				this.$Modal.open('app/flow/type-step-info-modal.vue',{
					props:{
                        ft_id:row.ft_id
                    },
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('设置流程类型步骤')
				})
			},
			deleteInfo (row){
				this.$Modal.confirm({
					content: `确认要删除【${row.ft_name}】流程吗？`,
					onOk: ()=> {
						this.$http.delete('flow_types/' + row.ft_id)
						.then(res => {
							this.$Message.success('删除成功');
							this.init_data();
						},res => {
							this.error(res.body.message);
						})
					}
				})
			},
			resetSearch () {
                this.$r('ref_search').resetFields()
                this.init_data()
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property&&property!=-1){
                        params[o] = property    
                    }                                    
                }
			},
			addInfo () {
				this.$Modal.open('app/flow/type-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加流程类型','add')
				})
			}
		}
	}
</script>