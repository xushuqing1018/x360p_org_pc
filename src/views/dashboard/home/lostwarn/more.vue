<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">
		<template v-if="modal$.show">
	        <div class="cast-record clearfix">
	        	<div class="p-2">
					<Table 
			        	v-loading.like="'student_lost_warn'" 
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
			<Button type="ghost" @click="modal$.show=false">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import modal 	 from '@/libs/modal.mixin'
	import grid 	 from '@/libs/grid.mixin'
	import common 	 from '@/libs/common.mixin'
	import globals 	 from '@/libs/globals.mixin'
	import util 	 from '@/libs/util'
	export default{
		mixins: [modal,grid,common,globals],
		data () {
			return {
				rest_api: '',
				column_keys: {
					student_name: {
						title: '姓名',
						show: true,
					},
					ename: {
						title: '学管师',
						show:true
					},
					create_time: {
						title: '入班时间',
						show: true
					},
					lost_day: {
						title: '失联天数',
						show: true
					}
				},
				column_render: {
					ename(h, params) {
						return h('span',params.row.ename?params.row.ename:'-')
					}
				}
			}
		},
		methods: {
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			init() {
				this.rest_api = 'dashboard/student_lost_warn'
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