<style lang="less">
	td .ivu-tooltip-inner {
	    white-space: pre-wrap;
	}
</style>
<template>
	<Modal v-drag-modal :mask-closable="false" width="800" v-model="modal$.show" :title="modal$.title">
		<Button type="primary" icon="refresh" size="small" class="mb-2" @click="init_data">刷新</Button>
		<Table 
            v-loading="'sms_historys'" 
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
        <div class="text-right mt-4">
            <Page 
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

	export default {
		mixins: [grid,modal,common],
		data() {
			return {
				rest_api: 'messages?mgh_id=[gt,0]',
				column_keys: {
					name: {
						title: '姓名',
						width: 100
					},
					content: {
						title: '内容'
					},
					create_employee_name: {
						title: '发送人',
						width: 120
					},
					create_time: {
						title: '时间',
						width: 160,
						sortable: 'custom',
					}
				},
				column_render: {
					content(h,params) {
						let content = params.row.title + params.row.content
						let error = params.row.error

						if(error) {
							return h('span',{
								style: {
									color: '#ef0101'
								}
							},'发送失败'+error)
						}

						if(content.length > 20) {
							return h('Tooltip',{
								props: {
									placement: 'bottom',
									content: content
								}
							},content.substring(0,20)+'...')
						}else{
							return h('span',content)
						}
					}
				}
			}
		},
		mounted() {
			this.init_data()
		}
	}
</script>