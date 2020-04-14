<template>
    <div>
    	<div class="box box-query">
    		<div class="row">
				<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form col-md-3 col-sm-6">
					<Form-item label="时间段" prop="int_day">
						<date-range-picker 
							:value="search_field.int_day" 
							@on-change="search_field.int_day=$event" 
							:clearable="false"
							label="请选择时间段" 
							placement="bottom"
							style="width:100%">
						</date-range-picker>					
					</Form-item>
				</Form>
				<div class="mt-2 col-md-3 col-sm-6">
	                <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
	                <Button type="primary" icon="refresh" @click="resetSearch" class="ml-1">重置</Button>
	            	<Button type="primary" icon="ios-download-outline" v-per="'reports.export'" class="ml-1" @click="exportExcel('转介绍统计')">导出</Button>
	           </div>
           </div>			
		</div>
		<div class="box box-result">
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
			</div>
	        <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading.like="'report_customers'" 
                    ref="tableExcel"
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    > 
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
                        @on-page-size-change="pagesize"
                        >
                        </Page>
                    </div>
                </div>
            </div>
	    </div>
	    <detail-modal ref="detail"></detail-modal>
    </div>
</template>
<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import dateRangePicker from 'c%/DateRangePicker.vue'
	import DetailModal from './intro-detail.vue'

	export default {
		mixins: [grid,common,globals],
		components: {
			dateRangePicker,
			DetailModal
		},
		data() {
			return {
				rest_api: 'report_customers?group=referer_sid',
				search_field: {
					int_day: util.recent_month_range(1),
				},
				column_keys: {
					student_name: {
						title: '介绍人',
						show: true
					},
					sno: {
						title: '学号',
						show: true
					},
					first_tel: {
						title: '联系电话',
						show: true
					},
					status: {
						title: '状态',
						show: true
					},
					subtotal: {
						title: '转介绍人数',
						show: true
					},
					operation: {
						title: '操作',
						show: true
					}
				},
				column_render: {
					student_name(h,params) {
						return h('span',params.row.referer_student.student_name)
					},
					sno(h,params) {
						return h('span',params.row.referer_student.sno)
					},
					first_tel(h,params) {
						return h('span',params.row.referer_student.first_tel)
					},
					operation(h,param) {
						return h('Button',{
                            props: {
                                type: 'ghost',
                                shape: 'circle',
                                size: 'small',
                                icon: 'eye'
                            },
                            attrs: {
                            	title: '查看明细'
                            },
                            on: {
                                click: ()=>{
                                    this.showDetail(param.row)
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
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params['start_date'] = property[0]
							params['end_date']   = property[1]
						}												
					}else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
				}
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			getNumsRate(item) {
				let total = 0
				this.data.forEach(i => {
					total += i.subtotal
				})
				return (util.div(item.subtotal,total)*100).toFixed(2)+'%'
			},
			getTransferRate(item) {
				return (util.div(item.transfer_nums,item.subtotal)*100).toFixed(2)+'%'
			},
			showDetail(row) {
				this.$r('detail')
				.set('referer_sid',row.referer_sid)
				.set('int_day',this.search_field.int_day)
				.show('转介绍详情','list')
			}
		}
	}
</script>