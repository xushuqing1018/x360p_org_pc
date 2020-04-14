<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :mask-closable="false" :width="900">
		<div class="mb-3">
			<Form ref="ref_search" :model="search_field" :label-width="80" class="filter-form row">
				<Form-item class="col-md-4 mb-1" label="选择外教" prop="eid">
					<select-employee v-model="search_field.eid" :rid='1'></select-employee>
				</Form-item>
				<Form-item class="col-md-4 mb-1" label="选择日期" prop="int_day">
					<date-range-picker 
						v-model="search_field.int_day"
						@on-change="search"
						label="选择翻译日期" 
						placement="bottom"
						style="width:100%">
					</date-range-picker>
					<!-- <DatePicker type="daterange" placeholder="选择翻译日期" v-model="search_field.int_day" style="width: 200px"></DatePicker> -->
				</Form-item>
			</Form>
			<Button size="small" type="primary" icon="ios-search" @click="search" style="margin-left: 10px;">搜索</Button>
			<Button size="small" type="primary" icon="refresh" @click="resetSearch">重置</Button>
			<export-button res="ft_reviews" size="small" :params="params"></export-button>
			<Button style="margin-left:10px" size="small" icon="paper-airplane" @click="wxPush">微信推送</Button>
		</div>
		
		<div class="content">
			
			<div class="content-body">
	            <Table 
	            	:loading="loading"
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
	        <div class="content-footer">	        	
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
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import moment from 'moment'
	import SelectEmployee from 'c%/SelectEmployee.vue'
	import ExportButton from 'c%/ExportButton.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	
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
			SelectEmployee,
			ExportButton,
			dateRangePicker
		},
		data () {
			var vm = this;
			return {
				rest_api: 'ft_reviews/cc',
				search_field: {
					eid: 0,
					int_day: []
				},
				column_keys: {
					ename: {
                        title: '外教名',
                        show: true
                    },
                    has_written: {
                        title: '已写报告数',
                        show: true
                    },
                    has_translate: {
                        title: '已翻译数',
                        show: true
                    },
                    not_written: {
                        title: '未写报告数',
                        show: true
                    },
                    not_translate: {
                        title: '未翻译数',
                        show: true
                    }
				},
				column_render: {
					ename(h, params) {
                        return h('span',params.row.employee.ename)
                    },
					not_translate(h, params) {
						if(params.row.not_translate == 0) {
							return h('span',0)
						}
                        return h('a',{
							on: {
								click: () => {
									vm.ftReview();
								}
							}
						},params.row.not_translate)
                    },
				},
			}
		},
		created() {
			let today_str = moment().format('YYYY-MM-DD');
			this.search_field.int_day = [today_str, today_str];
		},
		watch: {
			'modal$.show': function (val) {
				if(val){
					this.init_data()
				}
			}
		},
		methods: {
			wxPush() {
				this.$Modal.open('app/ft/wxpush-modal.vue',{
                    on:{
                        save: (e)=>{
                        }
                    }
                }).then(modal=>{
                    modal.show('微信推送翻译情况')
                })
			},
			ftReview() {
				this.$Modal.open('app/ft/ft-review.vue@modal',{
                    props:{
                    },
                    on:{
                        save: (e)=>{
                        }
                    }
                }).then(modal=>{
                    modal.show('外教报告')
                })
			},
			resetSearch () {
				this.$refs['ref_search'].resetFields()
				this.search()
			},
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				
                params.is_public = 1;
                params.with = 'employee';
				
				for(let o in search_obj) {
					let property = search_obj[o]				
					if(o == 'int_day') {
						if(property) {
							if(property[0]) {
								params['start_day'] = property[0];
								params['end_day'] = property[1];
							}
						}
					}
					else {
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			}
		}
	}
</script>

<style>
</style>