<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<div class="mb-2">
			<select-gift-cate ref="gift_cate" style="display:inline-block;width:unset" @on-success="init_data">
				<Button type="primary" icon="plus" @click="add" v-per="'cate.add'">礼品分类</Button>
			</select-gift-cate>
		</div>
		<div class="content-body">
	        <Table 
		        v-loading="'credit_gift_cates'" 
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
	        <div class="clearfix mt-2">
	            <Page 
	            	class="pull-right"
	            	size="small"
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
	    <div slot="footer">
	    	<Button type="ghost" @click="close">关闭</Button>
	    </div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import SelectGiftCate from 'c%/SelectGiftCate.vue'
	export default {
		mixins: [grid,modal],
		components: {
			SelectGiftCate
		},
		data() {
			return {
				rest_api: 'credit_gift_cates',
				pk: 'cgc_id',
				search_field: {

				},
				column_keys: {
					cate_name: {
						title: '分类名称',
						show: true
					}
				},
				column_render: {
					
				},
				operation_keys: {
					edit: {
						title: '编辑',
						type: 'edit',
						per: 'cate.edit'
					},
					delete: {
						title: '删除',
						type: 'ios-trash',
						per: 'cate.delete'
					}
				},
				operation_func: {
					edit(params) {
						this.edit(params.row)
					},
					delete(params) {
						this.confirm(util.sprintf('确定删除礼品分类【%s】吗？',params.row.cate_name))
						.then(()=>{
							this.delete(params.row)
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			add() {
				this.$refs.gift_cate.show('新增礼品分类','add')
			},
			edit(row) {
				let title = util.sprintf('编辑礼品分类【%s】',row.cate_name)
				
				this.$refs.gift_cate
				.set('info',row)
				.show(title,'edit')
			}
		},
		computed: {

		}
	}
</script>