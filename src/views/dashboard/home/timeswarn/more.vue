<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">
		<template v-if="modal$.show">
	        <div class="cast-record clearfix">
	        	<div class="p-2">
					<Table 
			        	v-loading.like="'class_times_warn'" 
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
					class_name: {
						title: '班级',
						show: true,
					},
					ename: {
						title: this.$filter('translate')('老师'),
						show: 'true'
					},
					lesson_name: {
						title: '课程',
						show: true
					},
					lesson_time: {
						title: '剩余课次',
						show: true
					}
				},
				column_render: {
					lesson_name(h, params) {
						return h('span',this.$filter('lesson_name')(params.row.lid))
					},
					lesson_time(h, params) {
						return h('span', params.row.lesson_times - params.row.arrange_times)
					},
					ename(h, params) {
						let ename = '-'
						if(params.row.teach_eid>0) {
							ename = this.$filter('ename')(params.row.teach_eid)
						}
						if(params.row.eid>0) {
							ename = this.$filter('ename')(params.row.eid)
						}
						return h('span',ename)
					},
					arrange_times(h,params) {
						return h('span',params.row.arrange_times)
					}
				}
			}
		},
		created() {
			if(this.teacher_times_warn) {
				this.column_keys = {
					ename: {
						title: this.$filter('translate')('老师'),
						show: true
					},
					arrange_times: {
						title: '剩余课次',
						show: true
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
				if(this.teacher_times_warn) {
					this.rest_api = 'dashboard/teacher_times_warn'
				} else {
					this.rest_api = 'dashboard/class_times_warn'
				}
				this.init_data()
				return this
			}
		},
	}
</script>
<style lang="less">
	.cast-record {
		.ivu-btn {
			padding: 2px 7px;
		}
	}
</style>