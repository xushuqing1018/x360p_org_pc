<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="100" class="filter-form row">
				<Form-item label="服务规则名称" prop="rule_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.rule_name" clearable placeholder="请输入服务规则名称"></Input>
				</Form-item>
				<Form-item label="服务对象" prop="teach_object_type" class="col-md-3 col-sm-6">
					<Select v-model="search_field.teach_object_type">
						<Option value="0">班级</Option>
						<Option value="1">个人</Option>
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
	        	<Button type="primary" icon="plus" @click="addRegularServiceRule">服务规则</Button>
	        </div>
	        <div class="content">
	        	<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'week_regularservicerule'" 
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
    
    const teach_object_type_title = {0:'班级',1:'个人'}
    
	export default {
		mixins: [common,globals,grid],
		data() {
			return {
				rest_api: 'regular_service_rules',
				pk: 'rsr_id',
				search_field: {
					rule_name: '',
					teach_object_type: 0
				},
				column_keys: {
					rule_name: {
						title: '服务规则名称',
						show: true
					},
					teach_object_type: {
						title: '服务对象',
						show: true
					},
					st_did: {
						title: '服务类型',
						show: true,
					},
					lesson_time_no: {
						title: '第几次课要做',
						show: true
					},
					rids: {
						title: '由谁做',
						show: true
                    },
                    remark: {
						title: '服务标准',
                        show: true,
                        width: 400
					}
				},
				column_render: {
					teach_object_type (h,params) {
						return h('span',teach_object_type_title[params.row.teach_object_type])   
                    },
                    st_did (h,params) {
						let label = ''
						if(params.row.teach_object_type == 0){
							label = this.$filter('dict_title')(params.row.st_did,'class_service_type')
						}else{
							label = this.$filter('dict_title')(params.row.st_did,'student_service_type')
						}
						return h('span',label)
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
					}
				},
				operation_func: {
					edit(param) {
						this.editRegularServiceRule(param.row)
					},
					delete(param) {
						this.deleteRegularServiceRule(param.row)
					}
				}
			}
        },
        mounted () {
			this.init_data()
		},
		methods: {
            deleteRegularServiceRule(row){
                this.confirm(util.sprintf('确定删除【%s】服务规则吗？',row.rule_name))
				.then(() => {
					this.$http.delete('regular_service_rules/' + row.rsr_id)
					.then(res => {
						this.$Message.success('删除成功');
						this.init_data();
					},res => {
						this.error(res.body.message);
					})
				})
            },
			editRegularServiceRule(row) {
                row.teach_object_type = row.teach_object_type + ''
				this.$Modal.open('service/week/regular-service-rule-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set("info",row).show('编辑服务规则','edit')
				})
			},
			addRegularServiceRule() {
				this.$Modal.open('service/week/regular-service-rule-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加服务规则','add')
				})
			},
	        hook_get_param(params){
	       		let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property&&property!='-1'){
						params[o] = property
					}
				}
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>