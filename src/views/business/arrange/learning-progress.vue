<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<div class="content-body">
	        <Table 
		        v-loading="'student_lessons'" 
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
			<Button type="text" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'

	export default {
		mixins:[globals,common,grid,modal],
		props: {
			slId: Number
		},
		data() {
			return {
				rest_api: 'student_lessons',
				showIndex: false,
				column_keys: {
					int_day: {
						title:'上课日期',
						show:true
					},
					int_hour:{
						title:'上课时段',
						show:true
					},
					eid:{
						title:'上课老师',
						show:true
					},
					tbs: {
						title:'授课内容',
						width: 180,
						show:true
					}
				},
				column_render: {
					int_day(h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					},
					int_hour(h,params) {
						return h('span',`${this.$filter('int_hour')(params.row.int_start_hour)}
							~
							${this.$filter('int_hour')(params.row.int_end_hour)}`)
					},
					eid(h,params) {
						return h('span',this.$filter('ename')(params.row.eid))
					},
					tbs(h,params) {
						let result = '-'
						let tbs = params.row.textbook_section
	                    if(tbs) {
	                        result = `${tbs.tb_name}：第${tbs.sort}章${tbs.section_title}`
	                    }
						return h('span',result)
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				this.rest_api = `student_lessons/${this.slId}/textbook_section`
				this.init_data()
			}
		}
	}
</script>