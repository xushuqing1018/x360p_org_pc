<style scoped>
.title {
	font-weight: bold;
	font-size: 15px;
	line-height: 30px;
}
</style>

<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="900">
		<span class="title">
			<Icon style="position: relative" type="ios-list-outline" /> 上课记录
		</span>
		<div class="content">
			<div class="content-body">
	            <Table 
	            	v-loading.like="'class_attendances'"
	            	class="customer-list"
	            	:page="pageIndex" 
	            	:page-size="pageSize" 
	            	:stripe="true" 
	            	:show-header="true" 
	            	:data="data" 
	            	:columns="columns" 
	            	:no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	            	:no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"
	            	@on-sort-change="sortChange"> 
	            </Table>
	        </div>
	        <div class="content-footer" style="margin-top: 10px;">	        	
	             <div class="pagenation text-right">
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
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	
	export default{
		mixins: [ grid, modal, globals, common ],
		props: {
			parent$:{
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		components: {
			SelectEmployee
		},
		data () {
			return {
				rest_api: 'class_attendances/0/ft_review',
				column_keys: {
                    ename: {
                        title: '上课老师',
                        show: true
					},
					course_name: {
                        title: '课程名',
                        show: true
                    },
                    int_day: {
                        title: '上课日期',
                        show: true
                    },
                    int_hour: {
                        title: '上课时段',
                        show: true
                    }
				},
				column_render: {
					ename(h, params) {
                        return h('span', this.$filter('ename')(params.row.eid))
                    },
					int_day(h, params) {
                        return h('span', moment(params.row.int_day+'', 'YYYYMMDD').format('YYYY-MM-DD'))
                    },
					int_hour(h, params) {
                        return h('span', this.$filter('int_hour')(params.row.int_start_hour)+'-'+this.$filter('int_hour')(params.row.int_end_hour))
                    },
                    
				},
				// operation_keys: {
				// 	push: {
                //         title: '提醒老师填写',
                //         type: 'paper-airplane'
                //     }
				// },
				// operation_func: {
				// 	push(params){
                //         this.$http.delete('ft_employees/'+params.row.fe_id)
				// 		.then(function(res) {
				// 			this.$Message.success('删除成功');
				// 			this.init_data();
				// 		},function(body) {
				// 			this.$Notice.error({
				// 				title: '失败',
				// 				desc: body.message||'删除失败'
				// 			})
				// 		})
                //     },
				// }
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.init_data()					
				}
			}
		},
		methods: {
			hook_get_param (params) {
                params.with = 'ft_review';
			}
		}
	}
</script>

<style>
</style>