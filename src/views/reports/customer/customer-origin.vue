<template>
	<div>
		<div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
				<Form-item label="时间段" prop="int_day" class="col-sm-3">
					<date-range-picker
							v-model="search_field.int_day"
							label="请选择时间段"
							placement="bottom"
							style="width:100%"
							@on-change="init_data"
					>
					</date-range-picker>
				</Form-item>
    			<FormItem label="招生来源" class="col-md-3 col-sm-6" prop="did">                    
	                <dictionary-from v-model="search_field.did" clearable></dictionary-from>
	            </FormItem>
    		</Form>
    		<Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
	            	<Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="refresh">刷新</Button>
	            	<export-button res="report_customer_origins" :params="params"></export-button>
                </Col>
            </Row>
		</div>
		<div class="box box-result">
	        <div class="content">
                <div class="content-body">
                    <Table
                            :border="true"
                            :data="data"
                            :columns="columns"
                            :show-header="true"
                            @on-sort-change="sortChange"
                    >
                    </Table>
                    <Spin fix v-if="loading">
                        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                        <div><span v-if="branchs.length>10">当前校区过多，</span>正在努力生成报表</div>
                    </Spin>
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
	</div>
</template>
<script>
	import Vue from 'vue'
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ExportButton from 'c%/ExportButton.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import DictionaryFrom 		from 'c%/DictionaryFrom.vue'
	export default {
		mixins: [grid,common,globals],
		components: {
            DateRangePicker,
			ExportButton,
			DictionaryFrom
		},
		data() {
			return {
				rest_api: 'report_customer_origins',
				search_field: {
					did: 0,
					int_day: util.recent_month_range(1),
				},

				column_keys: {
                    from_did_title: {
                        title: '招生来源',
                        align: 'center',
                        show: true
                    },
                    bid: {
                        title: '所属校区',
                        align: 'center',
                        show: true
                    },
                    visit_way:{
                    	title: '上门方式',
                    	align: 'center',
                    	children: [
							{
								title: 'TMK呼出',
								key: 'from_did_711',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									let result = h('span',params.row.from_did_711)
			                        if(parseInt(params.row.from_did_711) > 0){
			                            result = h('span',{
			                                'class': 'text-info cursor',
			                                on:{
			                                    'click': () => {
			                                        this.numsDetail(params.row,'from_did_711')
			                                    }
			                                }
			                            },params.row.from_did_711)
			                        }
			                        return result
								}
							},
							{
								title: '销售呼出',
								key: 'from_did_712',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									let result = h('span',params.row.from_did_712)
			                        if(parseInt(params.row.from_did_712) > 0){
			                            result = h('span',{
			                                'class': 'text-info cursor',
			                                on:{
			                                    'click': () => {
			                                        this.numsDetail(params.row,'from_did_712')
			                                    }
			                                }
			                            },params.row.from_did_712)
			                        }
			                        return result
								}
							},
							{
								title: '呼入',
								key: 'from_did_713',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									let result = h('span',params.row.from_did_713)
			                        if(parseInt(params.row.from_did_713) > 0){
			                            result = h('span',{
			                                'class': 'text-info cursor',
			                                on:{
			                                    'click': () => {
			                                        this.numsDetail(params.row,'from_did_713')
			                                    }
			                                }
			                            },params.row.from_did_713)
			                        }
			                        return result
								}
							},
							{
								title: '直访',
								key: 'from_did_714',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									let result = h('span',params.row.from_did_714)
			                        if(parseInt(params.row.from_did_714) > 0){
			                            result = h('span',{
			                                'class': 'text-info cursor',
			                                on:{
			                                    'click': () => {
			                                        this.numsDetail(params.row,'from_did_714')
			                                    }
			                                }
			                            },params.row.from_did_714)
			                        }
			                        return result
								}
							},
							{
								title: '拉访',
								key: 'from_did_715',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									let result = h('span',params.row.from_did_715)
			                        if(parseInt(params.row.from_did_715) > 0){
			                            result = h('span',{
			                                'class': 'text-info cursor',
			                                on:{
			                                    'click': () => {
			                                        this.numsDetail(params.row,'from_did_715')
			                                    }
			                                }
			                            },params.row.from_did_715)
			                        }
			                        return result
								}
							},
							{
								title: '在线咨询',
								key: 'from_did_716',
								align: 'center',
								sortable: 'custom',
								render:(h,params) => {
									let result = h('span',params.row.from_did_716)
			                        if(parseInt(params.row.from_did_716) > 0){
			                            result = h('span',{
			                                'class': 'text-info cursor',
			                                on:{
			                                    'click': () => {
			                                        this.numsDetail(params.row,'from_did_716')
			                                    }
			                                }
			                            },params.row.from_did_716)
			                        }
			                        return result
								}
							},
					    ]
                    }
                },

                column_render: {
                    bid (h,params) {
                        return h('span',this.$filter('branch_name')(params.row.bid,'-'))
                    },
                }
			}
		},
		mounted() {
			this.init_data()
			this.$store.commit('branchSingleMode')
		},
		computed: {
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

                if(this.isRefresh){
                    params.refresh = 1
                }
                this.isRefresh = false
			},
			numsDetail(row,type){
                let search_field = this.search_field,
                    rest_api = `report_customer_origins/${row.id}?type=${type}&start_date=${search_field.int_day[0]}&end_date=${search_field.int_day[1]}`
                this.$Modal.open('reports/customer/origin-detail-modal.vue',{
                    props: {
                        intDay: search_field.int_day,
                        id: row.id,
                        type: type,
                    }
                })
                .then(modal=>{
                    modal
                        .set('rest_api',rest_api)
                        .show('详情 ')
                })
            },

            refresh () {
                this.isRefresh = true
                this.init_data()
            },
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
			deal_data(data) {
				return data.list
			}
		},

	}
</script>
