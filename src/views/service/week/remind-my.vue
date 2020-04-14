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
                    <div class="pull-right">
                        <per-scope per="service_week.all" :show-my="true" @on-change="perScopeChange"></per-scope>
                    </div> 
                </Col>
          	</Row>
		</div>
		<div class="box box-result">
	        <div class="content">
	        	<div class="content-body">
		            <table class="modal-table">
	            		<thead>
	            			<tr>
	            				<th><div class="ivu-table-cell">#</div></th>
	            				<th><div class="ivu-table-cell">服务规则名称</div></th>
								<th><div class="ivu-table-cell">服务对象</div></th>
								<th><div class="ivu-table-cell">服务类型</div></th>
	            				<th width="500"><div class="ivu-table-cell">服务标准</div></th>
								<th width="100"><div class="ivu-table-cell">匹配对象</div></th>
	            			</tr>
	            		</thead>
	            		<tbody>
	            			<tr v-for="(item,index) in data" :key="index">
	            				<td><div class="ivu-table-cell">{{index + 1 + (pageIndex - 1) * pageSize}}</div></td>
	            				<td><div class="ivu-table-cell">{{item.rule_name}}</div></td>
								<td><div class="ivu-table-cell">{{item.teach_object_type | teach_object_type}}</div></td>
								<td><div class="ivu-table-cell">{{item.st_did | dict_title(item.teach_object_type == 0 ? 'class_service_type' : 'student_service_type')}}</div></td>
								<td><div class="ivu-table-cell">{{item.remark}}</div></td>
								<td>
									<div v-if="item.service_object && item.service_object.length != 0">
										<Badge :count="item.service_object.length">
    									    <Poptip placement="left" width="400" trigger="hover">
    										    <Button>匹配对象</Button>
												<div class="api" slot="content" style="max-height:300px;overflow: auto;">
													<table class="modal-table">
														<thead>
	            											<tr>
																<th><div class="ivu-table-cell">#</div></th>
	            												<th><div class="ivu-table-cell">服务对象</div></th>
																<th><div class="ivu-table-cell">已上课</div></th>
																<th><div class="ivu-table-cell">需服务</div></th>
																<th><div class="ivu-table-cell">已服务</div></th>
	            												<th><div class="ivu-table-cell">操作</div></th>
	            											</tr>
	            										</thead>
														<tbody>
															<tr v-for="(v,i) in item.service_object" :key="i" style="height:50px;">
																<th><div class="ivu-table-cell">{{i + 1}}</div></th>
																<th><div class="ivu-table-cell">{{item.teach_object_type == 0 ? v.class_name : v.student_name}}</div></th>
																<th><div class="ivu-table-cell">{{v.attendance_times}}次</div></th>
																<th><div class="ivu-table-cell">{{v.need_do_times}}次</div></th>
																<th><div class="ivu-table-cell">{{v.did_times}}次</div></th>
																<th>
																	<div class="ivu-table-cell">
																		<Button class="ml-2" type="default" icon="plus"  @click="record(item,v)">记录</Button>
																	</div>
																</th>
															</tr>
														</tbody>
													</table>
												</div>
    										</Poptip>
    									</Badge>
									</div>
									<div v-else>
										暂无服务对象
									</div>
								</td>
	            			</tr>
	            			<tr v-if="data.length == 0">
	            				<td colspan="6" align="center"><div class="ivu-table-cell">没有数据</div></td>
	            			</tr>
	            		</tbody>
	            	</table>
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
				rest_api: 'service_tasks/service_reminds',
				pk: 'rsr_id',
				search_field: {
					rule_name: '',
                    teach_object_type: 0,
                    eid:0
				}
			}
		},
		filters: {
            teach_object_type: function (value) {
                return teach_object_type_title[value]
			}
        },
        mounted () {
			this.init_data()
		},
		methods: {
            perScopeChange(value) {
				this.$emit('on-check',value)
			},
			record(item,v) {
				this.$Modal.open('service/service/record-modal.vue',{
					props: {
						cid: item.teach_object_type == 0 ? v.cid : 0,
						sid: item.teach_object_type == 1 ? v.sid : 0,
						st_did: item.st_did,
						type: item.teach_object_type == 0 ? 2 : 1
					},
					on:{
						'on-success':()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal
					.show('添加服务记录','add')
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
				params.eid = this.eid$
	        },
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
	}
</script>