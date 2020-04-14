<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
        <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
            <Form-item label="教材名" prop="tb_name" class="col-md-4 col-sm-6">
                <Input v-model="search_field.tb_name" placeholder="请输入教材名"></Input>
            </Form-item>
            <Form-item label="出版机构" prop="tb_org_name" class="col-md-4 col-sm-6">
                <Input v-model="search_field.tb_org_name" placeholder="请输入出版机构"></Input>
            </Form-item>
        </Form>
        <Row class="basic">
            <Col span="24" class="mt-2 mb-2">
                <Button class="ml-2" type="primary" size="small" icon="ios-search" @click="search">查询</Button>
                <Button class="ml-2" type="primary" size="small" icon="refresh" @click="resetSearch">重置</Button>
                <Button class="ml-2" type="primary" size="small" icon="plus" @click="addInfo">添加教材</Button>
            </Col>
        </Row>
        
        <div class="content-body">
            <Table 
                v-loading="'textbooks'" 
                :page-size="pageSize" 
                :page="pageIndex"   
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
            <div class="clearfix">
                <Page 
                    class="pull-right mt-2"
                    size="small"
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
        <div slot="footer">
            <Button type="ghost" @click="close">关闭</Button>
        </div>
	</Modal>
</template>

<script>
	import moment  		from 'moment'
	import util 		from '@/libs/util'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import grid 		from '@/libs/grid.mixin'
    import modal 		from '@/libs/modal.mixin'
	
	export default{
		mixins: [ common,globals,grid,modal ],
		data () {
            var vm = this;
			return {
                rest_api:'textbooks',
				search_field: {
	                tb_name: '',
                    tb_org_name: '',
	            },
				column_keys: {
					tb_name: {
						title: '教材名',
						show: true,
					},
                    tb_org_name: {
                        title: '出版机构',
                        show: true
                    },
                    section: {
                        title: '章节',
                        show: true,
                        width: 150
                    },
				},
				column_render: {
					section(h,params) {
                        return h('Button',{
                            props: {
                                icon: 'eye',
                                size: 'small'
                            },
                            on: {
                                click: function() {
                                    vm.showSectionModal(params.row);
                                }
                            }
                        })
                    }
                },
                operation_keys: {
                    edit: {
                        title: '编辑',
                        type: 'edit'
                    },
                    section: {
                        title: '章节管理',
                        type: 'ios-list-outline'
                    },
                    delete: {
                        title: '删除',
                        type: 'trash-a'
                    }
                },
				operation_func: {
					edit(params) {
						this.edit(params.row)
					},
					section(params) {
						this.sectionList(params.row)
					},
					delete(params) {
						this.delete(params.row)
					},
				}
			}
		},
		mounted () {			
			this.init_data()
		},
		methods: {
            sectionList(row) {
                this.$Modal.open('system/basic/textbook/section-list-modal.vue',{
                    on: {
                        'on-success': () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('tb_id',row.tb_id)
                    .show('章节管理【'+row.tb_name+'】')
                })
            },
            showSectionModal(row) {
                this.$Modal.open('system/basic/textbook/section-view-modal.vue',{
                    on: {
                        'on-success': () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('tb_name',row.tb_name)
                    .set('tb_id',row.tb_id)
                    .show('查看章节【'+row.tb_name+'】')
                })
            },
            edit(row) {
                this.$Modal.open('system/basic/textbook/info-modal.vue',{
                    on: {
                        'on-success': () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    modal
                    .set('info',row)
                    .show('编辑教材【'+row.tb_name+'】','edit')
                })
            },
            delete(row) {
                var vm = this;
                this.$Modal.confirm({
                    content: '确认删除教材'+row.tb_name+'？',
                    onOk() {
                        vm.$http.delete('textbooks/'+row.tb_id)
                        .then(res => {
                            vm.$Message.success('删除成功');
                            vm.init_data();
                        },res => {
                            vm.$Message.error(res.body.message)
                        })
                    }
                })
            },
            addInfo() {
                this.$Modal.open('system/basic/textbook/info-modal.vue',{
                    on: {
                        'on-success': () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    modal.show('添加教材','add')
                })
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for (let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day') {
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
                }
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
            },
            cancel() {
                this.close();
            }
		}
	}
	
</script>

<style>
</style>