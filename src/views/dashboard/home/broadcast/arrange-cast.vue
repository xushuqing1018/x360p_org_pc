<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="900" :mask-closable="false">
		<template v-if="modal$.show">
			<div>
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
					<Form-item label="公告标题" prop="title" class="col-sm-4">
						<Input v-model="search_field.title" @on-enter="search" clearable placeholder="请输入公告标题"></Input>
					</Form-item>
					<Form-item label="公告类型" prop="type" class="col-sm-4">
			            <Select v-model="search_field.type" @on-change="search" clearable>
			            	<Option :value="0">不限</Option>
			            	<Option :value="1">内部</Option>
			            	<Option :value="2">外部</Option>
			            </Select>
					</Form-item>
				</Form>
		    </div>
	        <div class="cast-record clearfix">
	        	<div class="p-2">
		        	<Button class="mb-2" type="primary" icon="plus" size="small" @click="add" v-per="'broadcast.add'">添加</Button>
					<Table 
			        	v-loading.like="'broadcasts'" 
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
		<cast-detail ref="detailModal"></cast-detail>
	</Modal>
</template>

<script>
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import util from '@/libs/util'
	import CastDetail from './cast-detail'
	export default{
		mixins: [grid,common,modal],
		components: {
			CastDetail
		},
		data () {
			return {
				rest_api: '',
                pk:'bc_id',
                showIndex: false,
				search_field: {
					title: '',
					type: 0
				},
				column_keys: {
					title: {
						title: '标题',
						show: true,
					},
					type: {
						title: '类型',
						show: true,
						width: 100
					},
					push: {
						title: '已读/推送',
						show: true,
						width: 120,
					},
					create_time: {
						title: '发布时间',
						show: true,
						width: 180
					},
					user: {
						title: '发布人',
						show: true,
						width: 100
					}
				},
				column_render: {
					title(h, params) {
						return h('span',{
							attrs: {
								class: 'text-info cursor'
							},
							on: {
								click: ()=>{
									this.editInfo(params.row)
								}
							}
						},params.row.title)
					},
					push(h,params) {
						let push = params.row.broadcast_push,
							total = push.length,
							read = push.filter(i => i.read_time).length
						return h('span',`${read}/${total}`)
					},
					type(h,params) {
						let map = {1:'内部',2:'外部'}
						return h('span',map[params.row.type])
					},
					user(h, params) {
						return h('span',params.row.user.name)
					}
				},
				operation_keys: {
					edit: {
						title: '查看',
						type: 'edit',
						per: 'broadcast.edit'
					},
					copy: {
						title: '复制',
						type: 'ios-copy',
						per: 'broadcast.copy'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'broadcast.delete'
					}
				},
				operation_func: {
					edit (params) {
                        this.editInfo(params.row)
                    },
                    copy (params) {
                    	this.copyInfo(params.row)
                    },
                    delete (params) {                       
                        this.confirm('您确定要删除该公告吗?')
                        .then(()=>{
                            this.delete(params.row).then((response) => {
                                this.$Message.success('删除成功')
                                this.$emit('on-success')
                            })
                        })
                        .catch(() => {
                            
                        })
                    },
                    push (params) {                       
                        this.$http.post('broadcasts/push_broadcast',{
							bc_id: params.row.bc_id
						})
						.then(res => {
							this.$Message.success('推送成功')
                            this.$emit('on-success')
						},res => {
							this.error(res.body.message)
						})
                    }
				},
			}
		},
		methods: {
			cancel () {
				this.close()
			},
			add(){
                this.$Modal.open('dashboard/home/broadcast/info-modal.vue',{
                	on:{
                		'save':() => {
                			this.init_data()
                		}
                	}
                })
                .then(modal => {
                	modal.show('添加公告')
                })
            },
            copyInfo(row) {
            	this.$Modal.open('dashboard/home/broadcast/info-modal.vue',{
            		props: {
            			id: row.bc_id
            		},
                	on:{
                		'save':() => {
                			this.init_data()
                		}
                	}
                })
                .then(modal => {
                	modal.show('添加公告','copy')
                })
            },
            editInfo(row){
            	this.$Modal.open('dashboard/home/broadcast/edit-modal.vue',{
                	props: {
                		id: row.bc_id
                	},
                	on:{
                		'save':() => {
                			this.init_data()
                		}
                	}
                })
                .then(modal => {
                	modal.show(util.sprintf('查看公告【%s】',row.title),'edit')
                })
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(property){
						params[o] = property
					}
				}
				params.with = 'broadcast_push,user'
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
				this.rest_api = 'broadcasts'
				this.init_data()
				return this
			}
		}	
	}
</script>
<style lang="less">
	.cast-record {
		.ivu-btn {
			padding: 2px 7px;
		}
	}
</style>