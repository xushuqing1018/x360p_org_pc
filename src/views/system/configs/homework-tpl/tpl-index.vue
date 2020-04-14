<template>
	<div class="c-grid">
        	<div class="action-bar" style="width:100%;">
            <Button type="primary" size="small" icon="plus" @click="addInfo" style="margin-left:10px;">添加</Button>
            <span class="search-box">
				<Input class="pull-right" style="width:360px" v-model="params.search_value" :placeholder="'请输入模板名称'" icon="ios-search" @keyup.native="searchData()"></Input>
            </span>
        </div>
        <div class="content">
			<div class="content-body">
            	<Table :columns="columns" :show-header="true" :data="data" :page="pageIndex" :page-size="pageSize"></Table>
			</div>
			<div class="mt-3 pagenation text-right">
            	<Page
            	    :total="total"
            	    :current="pageIndex"
            	    :page-size="pageSize"
            	    :show-total="true"
					:show-sizer="false" 
            	    @on-change="pagenation"
					@on-page-size-change="pagesize"
            	    >
            	</Page>
			</div>
        </div>
	</div>
</template>

<script>	
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'
	
	export default{
		mixins: [common,grid],
		data () {
			return {
				rest_api: 'homework_task_tpl_settings',
				data: [],
				currentIndex: 0,
				action: 'list',
				params:{
	                search_field:'name',
	                search_value:'',
	                order_field:'name',
	                order_sort:'ASC'
	            },
            	column_keys: {
            	    name: {
            	        title: '模板名称',
            	        show:true
            	    },
            	    operation: {
            	        title: '操作',
            	        show: true,
            	        width: 150
            	    }
            	},
            	column_render: {
            	    operation (h,params) {
            	        let UpdateElement = h('Button', {
            	            props: {
            	                type: 'ghost',
            	                shape: 'circle',
            	                icon: 'edit',
            	                size: 'small'
            	            },
            	            attrs: {
            	                title: '编辑'
            	            },
            	            on: {
            	                click: () => {
            	                    this.$Modal.open('system/configs/homework-tpl/tpl-content.vue@modal',{
            	                        on: {
            	                            'on-success':() => {
            	                                this.init_data()
            	                            }
            	                        }
            	                    })
            	                    .then(modal => {
            	                        modal.set('htts_id',params.row.htts_id).show('编辑作业模板','edit')
            	                    })
            	                }
            	            }
            	        });
            	        let DeleteElement = h('Button', {
            	            props: {
            	                type: 'ghost',
            	                shape: 'circle',
            	                icon: 'ios-trash',
            	                size: 'small'
            	            },
            	            attrs: {
            	                title: '删除'
            	            },
            	            on: {
            	                click: () => {
            	                    this.$Modal.confirm({
            	                        content: `确认删除模板【${params.row.name}】`,
            	                        onOk: () => {
            	                            this.deleteItem(params.row);
            	                        }
            	                    })
            	                }
            	            },
            	            style: {
            	                marginLeft: '10px'
            	            }
            	        });
            	        let CopyElement = h('Button', {
            	            props: {
            	                type: 'ghost',
            	                shape: 'circle',
            	                icon: 'ios-copy',
            	                size: 'small'
            	            },
            	            attrs: {
            	                title: '复制'
            	            },
            	            on: {
            	                click: () => {
            	                    this.$Modal.confirm({
            	                        content: `复制模板【${params.row.name}】，这将新增一个该模板的副本`,
            	                        onOk: () => {
											this.copyItem(params.index)
            	                        }
            	                    })
            	                }
            	            },
            	            style: {
            	                marginLeft: '10px'
            	            }
            	        });
            	        return h('span', [UpdateElement,DeleteElement, CopyElement])
            	    }
            	}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			addInfo() {
            	this.$Modal.open('system/configs/homework-tpl/tpl-content.vue@modal',{
        	        on: {
        	            'on-success':() => {
        	                this.init_data()
        	            }
        	        }
        	    })
        	    .then(modal => {
        	        modal.show('添加作业模板','add')
        	    })
        	},
			deleteItem(row) {
				this.$rest('homework_task_tpl_settings')
				.delete(row.htts_id)
				.success(data=>{
					this.$Message.success('删除成功！')
					this.init_data();
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			copyItem(index) {
				let copyData = util.copy(this.data[index]);
				let	[method,uri,msg] = ['post','homework_task_tpl_settings','复制模板成功'];
				
				let formatData = {
					name: copyData.name + ' - 副本',
					setting: copyData.setting
				}
				this.$rest(uri)[method](formatData)
				.success(data=>{
					this.$Message.success(msg)
					this.init_data();
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'操作失败'
					})
				})
			},
			searchData() {
				this.pageIndex = 1;
				this.params.search_field = 'name';
				this.init_data();
			},
			addSuccess () {
				this.init_data()
			}
		}
	}
</script>

<style scoped>
	.action-bar {
	    margin-bottom: 10px;
	}

	.search-box {
	    float: right;
	    margin-right: 5px;
	}
</style>