<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="900">
		<div class="c-grid">
			<Form :label-width="70" class="filter-form row" ref="ref_search" :model="search_field">
				<Form-item label="分类名称" class="col-sm-4" prop="cate_name">
					<Input v-model="search_field.cate_name" placeholder="请输入分类名称"></Input>
				</Form-item>
				<div class="col-sm-8">
					<Button class="ml-2" type="primary" icon="search" @click="search" size="small">查询</Button>
					<Button class="ml-2" type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
				</div>
			</Form>
			<div class="box box-result">
				<div class="toolbar">
					<Button type="primary" icon="plus" @click="addInfo" size="small">添加分类</Button>
				</div>
				<div class="content">
					<div class="content-body">
						<Table  
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
				</div>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="closeModel">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    
	export default {
		mixins: [grid,modal,common,globals],
		data() {
			return {
                rest_api: 'product_cates?order_field=sort&order_sort=asc',
				search_field: {
					cate_name: ''
				},
				column_keys: {
					cate_name: {
						title: '分类名称',
						show: true
					},
					icon_img: {
						title: '分类图标',
						show: true
					},
					is_show: {
						title: '是否显示',
						show: true
					},
					remark: {
						title: '描述',
                        show: true,
                        width:300
					}
				},
				column_render: {
					icon_img(h,params){
                        if (params.row.icon_img != '') {
							return h('img',{
								attrs:{
									src: params.row.icon_img,
									width:60,
									height:60
                                },
                                style:{
                                    padding:'10px'
                                },
								on: {
									click:()=>{
										this.picturePreview(params.row.icon_img)
									}
								}
							})
						}
                    },
                    is_show(h,params){
                        return h('span',params.row.is_show == 1 ? '是' : '否')
                    }
                },
                operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit'
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
					delete (params) {
						this.deleteInfo(params.row)
					}
				}
			}
        },
		mounted() {
			this.init_data()
		},
		methods: {
			hook_get_param(params) {
				let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property&&property!=-1){
                        params[o] = property    
                    }                                    
				}
            },
            addInfo(){
                this.$Modal.open('business/order/online/product-cate-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.show('添加产品分类','add')
				})
            },
            editInfo(row){
                this.$Modal.open('business/order/online/product-cate-info-modal.vue',{
					on:{
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
				.then(modal=>{
					modal.set('info',row).show('编辑产品分类','edit')
				})
            },
            deleteInfo(row){
                this.$Modal.confirm({
					content: `确认要删除【${row.cate_name}】产品分类吗？`,
					onOk: ()=> {
						this.$http.delete('product_cates/' + row.pc_id)
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
            closeModel(){
                this.$emit('on-success')
				this.close()
            }
		}
	}
</script>