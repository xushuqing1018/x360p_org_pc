<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="900">
		<div class="mb-3">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item class="col-md-4 mb-1" label="选择外教" prop="eid">
					<select-employee v-model="search_field.eid" :rid="1"></select-employee>
				</Form-item>
			</Form>
			<Button size="small" type="primary" icon="ios-search" @click="search" style="margin-left: 10px;">搜索</Button>
			<Button size="small" type="primary" icon="refresh" @click="resetSearch">重置</Button>
			<Button size="small" type="primary" icon="plus" @click="addInfo">添加外教</Button>
		</div>
		
		<div class="content">
			
			<div class="content-body">
	            <Table 
	            	v-loading="'customers'"
	            	class="customer-list"
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
	             <div class="pagenation text-right">
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
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins: [ grid, modal, globals, common ],
		props: {
			parent$:{
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		components: {
			SelectEmployee
		},
		data () {
			return {
				rest_api: 'ft_employees',
				search_field: {
					eid: 0,
				},
				column_keys: {
					ename: {
                        title: '姓名',
                        sortable: 'custom',
                        show: true
                    },
                    origin_country: {
                        title: '国籍',
                        show: true
                    },
                    bid: {
                        title: '校区',
                        sortable: 'custom',
                        show: true
                    },
                    mobile: {
                        title: '手机',
                        sortable: 'custom',
                        show: true
                    },
                    email: {
                        title: 'Email',
                        sortable: 'custom',
                        show: true
                    }
				},
				column_render: {
					ename(h, params) {
                        return h('span',params.row.employee.ename)
                    },
					bid(h, params) {
						var branch = '-';
						if(params.row.employee.bid) {
							branch = this.labelBranch(params.row.employee.bid);
						}
                        return h('span',branch)
                    },
					mobile(h, params) {
                        return h('span',params.row.employee.mobile)
                    },
					email(h, params) {
                        return h('span',params.row.employee.email||'-')
                    },
                    
				},
				operation_keys: {
					delete: {
                        title: '删除',
                        type: 'ios-trash',
                        per: 'employees.delete'
                    }
				},
				operation_func: {
					delete(params){
                        this.$http.delete('ft_employees/'+params.row.fe_id)
						.then(function(res) {
							this.$Message.success('删除成功');
							this.init_data();
						},function(body) {
							this.$Notice.error({
								title: '失败',
								desc: body.message||'删除失败'
							})
						})
                    },
				}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.init_data()					
				}
			}
		},
		methods: {
            addInfo() {
                this.$Modal.open('app/ft/info-modal.vue',{
                    props:{
                    },
                    on:{
                        'on-success': () => {
                            this.init_data()
                        }
                    }
                }).then(modal=>{
                    modal.show('添加外教','add')
                })
            },
			resetSearch () {
				this.$refs['ref_search'].resetFields()
				this.search()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
                params.is_public = 1;
                params.with = 'employee';
				
				for(let o in search_obj) {
					let property = search_obj[o]				
				
					if(property&&property!=-1){
						params[o] = property
					}				
				}
			}
		}
	}
</script>

<style>
</style>