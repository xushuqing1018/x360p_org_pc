<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">
		<template v-if="modal$.show">
			<div class="px-4 py-2">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
					<Form-item label="待办事项" prop="desc" class="col-sm-5">
						<Input v-model="search_field.desc" placeholder="请输入关键字"></Input>
					</Form-item>
					<Form-item label="提醒日期" prop="int_day" class="col-sm-5">
						<DatePicker
							type="date"
					        :value="format_day(search_field.int_day)"
					        @on-change="search_field.int_day = $event"
					        @on-clear="search_field.int_day=''"
				        	>
				    	</DatePicker>
					</Form-item>
				</Form>
				<Row class="basic">
		            <Col span="24" class="mt-2" style="margin-left:0px;">                	
		            	<Button-group>
		                    <Button class="ml-2" type="primary" size="small" @click="search" icon="ios-search">查询</Button>
		                </Button-group>
		            	<Button type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button> 
		            	<Button type="primary" icon="plus" size="small" @click="add" v-per="'backlogs.add'">添加</Button>
		            </Col>
		        </Row>
		    </div>
	        <div class="cast-record clearfix">
	        	<div class="p-2">
					<Table 
			        	v-loading="'backlogs'" 
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
			    <div class="pull-right">
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
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal 	 from '@/libs/modal.mixin'
	import grid 	 from '@/libs/grid.mixin'
	import common 	 from '@/libs/common.mixin'
	import moment 	 from 'moment'
	import util 	 from '@/libs/util'
	
	export default{
		mixins: [grid,common,modal],
		data () {
			return {
				rest_api: 'backlogs',
                pk:'bl_id',
				search_field: {
					desc: '',
					int_day: moment(new Date()).format('YYYYMMDD')
				},
				column_keys: {
					desc: {
						title: '事项明细',
						show: true,
					},
					remind_time: {
						title: '提醒时间',
						show: true
					}
				},
				column_render: {
					desc(h,params) {
                        let status = params.row.status
                        let classes = status == 3 ? 'line-through dark-color' : status == 1 ? 'highlight-color' : ''
                        let spans = [params.row.desc]
                        if(status == 2) {
                        	spans.push(h('Icon',{
                        		props: {
                        			type: 'checkmark'
                        		}
                        	}))
                        }
                        return h('span',{
                        	class: classes
                        },spans)
					},
					remind_time(h, params) {
						return h('span',this.$filter('int_date')(params.row.int_day) + ' ' + params.row.int_hour)
					}
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'backlogs.edit'
					},
					finished: {
						title: '标记完成',
						type: 'checkmark',
						per: 'backlogs.finished',
						condition: 'row.status!==2'
					},
					unfinished: {
						title: '标记待办',
						type: 'log-in',
						per: 'backlogs.unfinished',
						condition: 'row.status==2'
					},
					addLine: {
						title: '标记废弃',
						type: 'close',
						per: 'backlogs.addline',
						condition: 'row.status!==3'
					},
					cancelLine: {
						title: '取消废弃',
						type: 'plus',
						per: 'backlogs.cancelline',
						condition: 'row.status==3'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'backlogs.delete'
					}
				},
				operation_func: {
					edit (params) {
						let info = {}
						for(let key in params.row) {
							if(key == 'int_day') {
								info[key] = this.$filter('int_date')(params.row[key])
							}else{
								info[key] = params.row[key]
							}
						}    
		                this.$Modal.open('dashboard/home/todolist/info-modal.vue',
			                {
			                    on:{
			                        save:()=>{
			                            this.init_data()
			                        }
			                    }
			                }
			            )
			            .then(modal=>{
			                modal.vuec.set('info',info).show('修改事项','edit')
			            })
                    },
                    delete (params) {                       
                        this.confirm('您确定要删除该待办吗?')
                        .then(()=>{
                            this.delete(params.row).then((response) => {
                                this.$emit('on-success')
                            })
                        })
                        .catch(() => {
                            
                        })
                    },
                    finished(params) {
                    	this.operate(params.row,2)
                    },
                    unfinished(params) {
                    	this.operate(params.row,1)
                    },
                    addLine(params) {
                    	this.operate(params.row,3)
                    },
                    cancelLine(params) {
                    	this.operate(params.row,1)
                    }
				},
			}
		},
		methods: {
				add(){
				this.$Modal.open('dashboard/home/todolist/info-modal.vue',{
					on:{
						save:()=>{
							this.refresh()
						}
					}
				})
				.then(modal=>{
					modal.vuec.show('添加事项','add')
				})
                
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property){
						if(o == 'int_day') {
							params[o] = property.replace(/-/g,'')
						}else{
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			},
			refresh() {
				this.init_data()
				this.$emit('on-success')
			},
			init() {
				this.init_data()
				return this
			},
			operate(item,status) {
	            this.$rest('backlogs')
	            .add_url_param(item.bl_id)
	            .put({status:status,desc:item.desc})
	            .success(response => {
	                this.refresh()
	            })
	            .error(response => {
	                this.error(response.body.message)
	            })
	        },
		}	
	}
</script>
<style lang="less">
	.cast-record {
		.ivu-btn {
			padding: 2px 7px;
		}
	}
	.line-through{
        text-decoration: line-through;
    }
    .highlight-color {
        color: #38C4FF;
    }
</style>