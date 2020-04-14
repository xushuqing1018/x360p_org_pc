<template>
    <div>
        <div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
                <Form-item label="日期范围" prop="create_time" class="col-md-3 col-sm-6">
                    <date-range-picker 
                        v-model="search_field.create_time" 
                        @on-change="init_data" 
                        label="请选择日期范围" 
                        placement="bottom"
                        style="width:100%">
                    </date-range-picker>
                </Form-item>
                <Form-item label="操作用户" prop="uid" class="col-md-3 col-sm-6">
                    <select-employee mode="user" v-model="search_field.uid" :clearable="true"></select-employee>
                </Form-item>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>                   
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    <Button type="primary" icon="ios-download-outline" v-per="'reports.export'" @click="exportExcel('系统日志')">导出</Button>
                </Col>
            </Row>           
        </div>
        <div class="box box-result">
            <div class="toolbar">
                <filter-column :keys="column_keys"></filter-column>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading="'action_logs'" 
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
	import util 		from '@/libs/util'
    import grid 		from '@/libs/grid.mixin'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import SelectEmployee  from 'c%/SelectEmployee.vue'
    
    export default {
    	mixins:[common,grid,globals],
    	components: {
    		DateRangePicker,
            SelectEmployee,
    	},
    	data () {
			return {
				rest_api:'action_logs',
				search_field: {
	                uid: 0,
                    create_time: [],
	            },
				column_keys: {
                    og_id: {
                        title: '机构',
                        show: true,
                        width: 70
                    },
                    uri: {
                        title: '操作路径',
                        show: true
                    },
                    log_params: {
                        title: '参数',
                        show: true,
                        width: 500
                    },
					uid: {
						title: '用户',
						show: true,
					},
					log_desc: {
						title: '日志描述',
                        show: true,
                        width: 300
					},
					ip:{
						title:'IP',
						show:true
                    },
                    create_time: {
						title: '时间',
						show: true
					},
				},
				column_render: {
					log_params(h,params) {
                        if(params.row.log_params.length > 200) {
                            return h('span',params.row.log_params.substr(0,200)+'...')
                        }
                        else {
                            return h('span',params.row.log_params)
                        }
                    },
				}
			}
		},
		mounted () {			
			this.init_data()
		},
		methods: {
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for (let o in search_obj) {
					let property = search_obj[o]
					if(o=='create_time') {
						if(property!=','&&property.length>0) {
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
				}
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
    }
</script>