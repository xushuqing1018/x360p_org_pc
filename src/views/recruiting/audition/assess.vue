<template>
    <div class="c-grid">
        <div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
                <Form-item label="评估日期" prop="int_day" class="col-md-3 col-sm-6">
                    <date-picker 
                        :value="search_field.int_day" 
                        @on-change="search_field.int_day=$event" 
                        label="请选择评估日期"
                        placement="bottom"
                        style="width:100%">
                    </date-picker>
                </Form-item>
                <Form-item label="评估老师" prop="eid" class="col-md-3 col-sm-6">
                    <select-employee mode="user" v-model="search_field.eid" :clearable="true"></select-employee>
                </Form-item>
                <Form-item label="评估学员" prop="cid" class="col-md-3 col-sm-6">	        		
	        		<select-student v-model="search_field.cid" clearable></select-student>
	        	</Form-item>
                <Form-item label="评估客户" prop="cu_id" class="col-md-3 col-sm-6">	        		
	        		<select-student v-model="search_field.cu_id" clearable></select-student>
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
                <Button type="primary" @click="addInfo" icon="plus">安排评估</Button> 
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
	import moment 		from 'moment'
	import util 		from '@/libs/util'
    import grid 		from '@/libs/grid.mixin'
    import globals 		from '@/libs/globals.mixin'
    import common 		from '@/libs/common.mixin'
    import SelectEmployee  from 'c%/SelectEmployee.vue' 
    import SelectStudent  from 'c%/SelectStudent.vue'
    import ExportButton from 'c%/ExportButton.vue'

    export default {
    	mixins:[common,grid,globals],
    	components: {
            SelectEmployee,
            ExportButton,
            SelectStudent
    	},
    	data () {
			return {
                rest_api:'evaluates',
				search_field: {
	                eid: 0,
                    int_day: '',
                    cid: 0,
                    cu_id: 0
	            },
				column_keys: {
					eid: {
						title: '评估老师',
						show: true,
					},
                    obj: {
                        title: '评估对象',
                        show: true
                    },
                    int_day: {
                        title: '评估日期',
                        show: true
                    },
                    time: {
                        title: '评估时间',
                        show: true
                    },
					result: {
						title: '评估结果',
                        show: true,
                        width: 450
					},
					result_time: {
						title: '录入时间',
						show: true
					},
					status: {
						title: '状态',
						show: true
					},
				},
				column_render: {
					eid(h,params) {
                        return h('span',params.row.employee.ename)
                    },
					obj(h,params) {
                        if(params.row.cu_id == 0) {
                            return h('p',[h('Tag',params.row.student.student_name),h('Tag',{
                                props: {
                                    color: 'green'
                                }
                            },'学员')])
                        }
                        else {
                            return h('p',[h('Tag',params.row.customer.name),h('Tag',{
                                props: {
                                    color: 'blue'
                                }
                            },'客户')])
                        }
                    },
					int_day(h,params) {
                        return h('span',this.$filter('int_date')(params.row.int_day))
                    },
					time(h,params) {
                        return h('span',this.$filter('int_hour')(params.row.int_start_hour)+'~'+this.$filter('int_hour')(params.row.int_end_hour))
                    },
					result(h,params) {
                        return h('span',params.row.result||'-')
                    },
					result_time(h,params) {
                        return h('span',params.row.result_time?this.$filter('int_date')(params.row.result_time):'-')
                    },
					status(h,params) {
                        if(params.row.result) {
                            return h('Tag',{
                                props: {
                                    color: 'green'
                                }
                            },'已录入')
                        }
                        else {
                            return h('Tag','未录入')
                        }
                    },
                },
                operation_keys: {
                    edit: {
                        title: '编辑',
                        type: 'edit'
                    },
                    delete: {
                        title: '删除',
                        type: 'trash-a'
                    }
                },
				operation_func: {
					edit(params) {
						this.edit(params.row)
					},
					delete(params) {
						this.delete(params.row)
					},
				}
			}
		},
		mounted () {			
			this.init_data()
		},
		methods: {
            edit(row) {
                this.$Modal.open('recruiting/audition/assess-modal.vue',{
                    on: {
                        'on-success': () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    row.int_day = moment(row.int_day+'', "YYYYMMDD").format('YYYY-MM-DD');
                    row.int_start_hour = this.$filter('int_hour')(row.int_start_hour);
                    row.int_end_hour = this.$filter('int_hour')(row.int_end_hour);
                    modal
                    .set('info',row)
                    .show('编辑一对一评估','edit')
                })
            },
            delete(row) {
                var vm = this;
                this.$Modal.confirm({
                    content: '确认删除该一对一评估记录？',
                    onOk() {
                        vm.$http.delete('evaluates/'+row.eva_id)
                        .then(res => {
                            vm.$Message.success('删除成功');
                            vm.init_data();
                        },res => {
                            vm.$Message.error(res.body.message)
                        })
                    }
                })
            },
            addInfo() {
                this.$Modal.open('recruiting/audition/assess-modal.vue',{
                    on: {
                        'on-success': () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    modal.show('安排一对一评估','add')
                })
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for (let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day') {
                        if(property) {
                            params[o] = this.$filter('format_int_day')(property);
                        }
					}else{
						if(property&&property!=-1){
							params[o] = property
						}
					}
                }
                params.with = 'employee,student,customer'
			},
			resetSearch () {
				this.$r('ref_search').resetFields()
				this.init_data()
			}
		}
    }
</script>