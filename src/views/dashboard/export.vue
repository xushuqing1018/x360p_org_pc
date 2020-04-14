<template>
	<div class="c-grid">
		<div class="box box-result">
			<Button type="primary" icon="refresh" class="mb-2" size="small" @click="init_data">刷新</Button>
			<div class="content">
				<div class="content-body"> 
					<Table
						v-loading="'data_exports'"
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default{
		mixins: [grid,common,globals],
		data() {
			return {
				rest_api: 'data_exports',
				pk: 'de_id',
				column_keys: {
					title: {
						title: '文件标题'
					},
					create_time: {
						title: '导出时间'
					},
					file_url: {
						title: '文件地址'
					},
					operation: {
						title: '操作',
						width: 100
					}
				},
				column_render: {
					file_url(h,params) {
						let pre = this.$store.state.user.info.product_url
						let url = util.sprintf('%s/%s',pre,params.row.file_url)
						if(params.row.file_url) {
							return h('a',{
								attrs: {
									title: '点击下载',
									href: url
								}
							},url)
						}
						return h('span',{
							class: 'text-info'
						},'文件过大正在下载，请稍后刷新...')
					},
					operation(h,params) {
						return h('Button',{
							props: {
								type: 'text',
								icon: 'ios-trash'
							},
							attrs: {
								title: '删除'
							},
							on: {
								click: () => {
									this.delete(params.row)
								}
							}
						})
					}
				}
			}
		},
		mounted() {
			this.init_data()
		}
	}
</script>