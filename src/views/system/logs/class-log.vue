<template>
    <div>
        <div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
                <Form-item label="日期范围" prop="create_time" class="col-md-3 col-sm-6">
                    <date-range-picker 
                        :value="search_field.create_time" 
                        @on-change="search_field.create_time=$event" 
                        label="请选择日期范围" 
                        placement="bottom"
                        style="width:100%">
                    </date-range-picker>
                </Form-item>
                <Form-item label="操作用户" prop="create_uid" class="col-md-3 col-sm-6">
                    <select-employee mode="user" v-model="search_field.create_uid" :clearable="true"></select-employee>
                </Form-item>
                <Form-item label="操作类型" prop="event_type" class="col-md-3 col-sm-6">
                    <Select v-model="search_field.event_type">
                        <Option v-for="(value,key) in op_types" :value="key" :key="key">{{ value }}</Option>
                    </Select>
                </Form-item>
                <Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">	        		
	        		<select-class v-model="search_field.cid" clearable></select-class>
	        	</Form-item>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">  
                    <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>                   
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                    <export-button res="class_logs" :params="params" :total="total" :max-sync-nums="1000"></export-button>
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
                    v-loading="'class_logs'" 
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
    import selectClass from 'c%/SelectClass.vue'
    import ExportButton from 'c%/ExportButton.vue'
    export default {
    	mixins:[common,grid,globals],
    	components: {
    		DateRangePicker,
            SelectEmployee,
            selectClass,
            ExportButton
    	},
    	data () {
            const op_types = {
                1: '创建班级',
                2: '编辑班级',
                3: '删除班级',
                4: '学员加入班级',
                5: '学员退出班级',
                6: '班级结课',
                7: '班级排课',
                8: '删除班级排课',
                9: '班级升班',
                10: '服务记录',
                11: '服务安排',
                12: '班级考勤',
                13: '导入班级',
                14: '创建计划排课',
                15: '删除计划排课',
                16: '修改班级排课计划',
                17: '撤销班级考勤',
            }
			return {
                rest_api:'class_logs',
                op_types: op_types,
				search_field: {
	                create_uid: 0,
                    create_time: [],
                    cid: 0
	            },
				column_keys: {
					create_uid: {
						title: '操作人',
						show: true
					},
                    bid: {
                        title: '操作校区',
                        show: true
                    },
                    cid: {
                        title: '班级',
                        show: true
                    },
                    event_type: {
                        title: '操作类型',
                        show: true
                    },
					desc: {
						title: '操作内容',
						show: true,
                        width: 350
					},
					create_time: {
						title: '操作时间',
						show: true
					},
                    remark:{
                        title : '备注',
                        show: true,
                        width: 350
                    },
					status:{
						title:'操作状态',
						show:true
					},
				},
				column_render: {
					bid(h,params) {
                        return h('span',this.labelBranch(params.row.bid))
                    },
					status(h,params) {
                        return h('Tag',{
                            props: {
                               color: 'green'
                            }
                        },'成功')
                    },
                },
                op_types: op_types
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