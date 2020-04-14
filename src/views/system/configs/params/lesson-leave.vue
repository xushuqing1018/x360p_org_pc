<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<div class="content-body">
	        <Table 
		        v-loading="'lessons'" 
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
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'

	export default {
		mixins:[grid,modal],
		data() {
			return {
				rest_api: 'lessons',
				column_keys: {
					lesson_name: {
						title:'课程',
						show:true
					},
					leave_nums_limit:{
						title:'请假次数限制',
						show:true
					},
					operate:{
						title: ' ',
						width: 80,
						show: true
					}
				},
				column_render: {
					leave_nums_limit(h,params) {
						let result = '全局限制'
						let limit = params.row.leave_nums_limit
						if(limit==0) {
							result = '不限制'
						}else if(limit>0) {
							result = limit+'次'
						}
						return h('span',result)
					},
					operate(h,params) {
						return h('Button',{
							props: {
								type: 'ghost',
								shape: 'circle',
								size: 'small',
								icon: 'edit'
							},
							class: 'ml-2',
							on: {
								click:() => {
									this.editLimit(params.row)
								}
							}
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			editLimit(row) {
				this.$Modal.open('system/configs/params/leave-edit.vue@modal',{
					on: {
						success:() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',row)
					.show('修改请假次数限制')
				})
			}
		}
	}
</script>