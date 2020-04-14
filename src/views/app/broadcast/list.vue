<template>
    <div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="公告标题" prop="title" class="col-sm-4">
					<Input v-model="search_field.title" @on-enter="search" clearable placeholder="请输入公告标题"></Input>
				</Form-item>
				<Form-item label="类型" prop="type" class="col-sm-4">
		            <Select v-model="search_field.type" clearable>
		            	<Option :value="0">不限</Option>
		            	<Option :value="1">员工</Option>
		            	<Option :value="2">学员</Option>
                        <Option :value="3">游客</Option>
		            </Select>
				</Form-item>
                <Form-item label="公告类型" prop="bc_type" class="col-sm-4">
		            <Select v-model="search_field.bc_type" clearable>
						<Option :value="-1">不限</Option>
		            	<Option :value="0" v-if="hasPer('notice.broadcast')">通知</Option>
		            	<Option :value="1" v-if="hasPer('article.broadcast')">文章</Option>
		            	<Option :value="2" v-if="hasPer('video.broadcast')">视频</Option>
                        <Option :value="3" v-if="hasPer('vocie.broadcast')">语音播报</Option>
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
				<Button class="ml-2" type="primary" icon="plus" @click="add">添加</Button>
			</div>
			<div class="content">
				<div class="content-body">
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
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import util from '@/libs/util'
	export default{
		mixins: [grid,common],
		data () {
			return {
				rest_api: 'broadcasts',
                pk:'bc_id',
				search_field: {
					title: '',
                    type: 0,
                    bc_type:-1
                },
                bc_type_data:[],
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
                    bc_type: {
						title: '公告类型',
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
						let map = {1:'员工',2:'学员',3:'游客'}
						return h('span',map[params.row.type])
                    },
                    bc_type(h,params) {
						let map = {0:'通知',1:'文章',2:'视频',3:'语音播报'}
						return h('span',map[params.row.bc_type])
					},
					user(h, params) {
						return h('span',params.row.user.name)
					}
				},
				operation_keys: {
					edit: {
						title: '查看',
						type: 'edit'
					},
					copy: {
						title: '复制',
						type: 'ios-copy'
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
        created(){
            this.check_bc_type()
        },
		mounted () {
            this.init_data()
		},
		methods: {
            check_bc_type(){
                if(this.hasPer('notice.broadcast')){
                    this.bc_type_data.push(0)
                }
                if(this.hasPer('article.broadcast')){
                    this.bc_type_data.push(1)
                }
                if(this.hasPer('video.broadcast')){
                    this.bc_type_data.push(2)
                }
                if(this.hasPer('vocie.broadcast')){
                    this.bc_type_data.push(3)
                }
            },
			cancel () {
				this.close()
			},
			add(){
                this.$Modal.open('app/broadcast/info-modal.vue',{
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
            	this.$Modal.open('app/broadcast/info-modal.vue',{
            		props: {
            			item: row
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
            	this.$Modal.open('app/broadcast/edit-modal.vue',{
                	props: {
                		item: row
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
					if(o == 'bc_type'){
						if(property != -1){
							params[o] = property
						}else{
                            console.log(this.bc_type_data)
                            params[o] = util.sprintf('[In,%s]',this.bc_type_data.join(','))
                        }
					}else{
						if(property){
							params[o] = property
						}
					}
					
				}
				params.with = 'broadcast_push,user,broadcast_file,broadcast_push.student'
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
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