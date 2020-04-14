<template>
    <div class="c-grid">
        <div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
                <Form-item label="介绍学员" prop="referer_sid" class="col-md-3 col-sm-6">
                    <select-student v-model="search_field.referer_sid" :clearable="true"></select-student>
                </Form-item>
                <Form-item label="介绍日期" prop="referer_int_day" class="col-md-3 col-sm-6">
                    <date-range-picker 
                        :value="search_field.referer_int_day" 
                        @on-change="search_field.referer_int_day=$event" 
                        label="请选择日期范围" 
                        placement="bottom"
                        style="width:100%">
                    </date-range-picker>
                </Form-item>
                
                <!-- <Form-item label="归属员工" prop="charge_eid" class="col-md-3 col-sm-6">
                    <select-employee v-model="search_field.charge_eid" :clearable="true"></select-employee>
                </Form-item> -->
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
                <Button type="primary" @click="addInfo" icon="plus" style="margin-left:10px;">补充</Button>
                <filter-column :keys="column_keys"></filter-column>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading="'student_referers'"
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
    import SelectStudent  from 'c%/SelectStudent.vue' 
    import selectClass from 'c%/SelectClass.vue'
    import ExportButton from 'c%/ExportButton.vue'
    export default {
    	mixins:[common,grid,globals],
    	components: {
    		DateRangePicker,
            SelectEmployee,
            SelectStudent,
            selectClass,
            ExportButton
    	},
    	data () {
            var vm = this;
			return {
                rest_api:'student_referers',
				search_field: {
	                referer_sid: 0,
                    referer_int_day: [],
                    charge_eid: 0
	            },
				column_keys: {
                    referer_sid: {
                        title: '介绍学员',
                        show: true
                    },
					sid: {
						title: '被介绍学员',
						show: true
					},
                    referer_int_day: {
                        title: '介绍日期',
                        show: true
                    },
                    referer_teacher_eids: {
                        title: '归属老师',
                        show: true
                    },
                    referer_edu_eid: {
                        title: '归属学管师',
                        show: true
                    },
                    referer_cc_eid: {
                        title: '归属咨询师',
                        show: true
                    }
				},
				column_render: {
					sid(h,params) {
                        return h('span',params.row.student_name)
                    },
					referer_sid(h,params) {
                        return h('span',params.row.referer_student_name)
                    },
					referer_int_day(h,params) {
                        return h('span',vm.$options.filters.int_date(params.row.referer_int_day))
                    },
					referer_teacher_eids(h,params) {
                        var str = params.row.referer_teacher_eids.length == 0?'-':'';
                        params.row.referer_teacher_eids.forEach(item => {
                            str = str + vm.$options.filters.ename(item) + ",";
                        })
                        str = str.substr(0,str.length-1)
                        return h('span',str)
                    },
					referer_edu_eid(h,params) {
                        return h('span',params.row.referer_edu_eid?vm.$options.filters.ename(params.row.referer_edu_eid):'-')
                    },
					referer_cc_eid(h,params) {
                        return h('span',params.row.referer_cc_eid?vm.$options.filters.ename(params.row.referer_cc_eid):'-')
                    },
                },
                operation_keys: {
                    delete: {
                        title: '删除',
                        type: 'trash-a'
                    }
                },
				operation_func: {
					delete(params) {
						this.delete(params)
					}				
				}
			}
		},
		mounted () {			
			this.init_data()
		},
		methods: {
            addInfo() {
                this.$Modal.open('business/order/referer/info-modal.vue',{
                    on: {
                        'on-ok': e => {
                            this.init_data()
                        }
                    }
                })
                .then(modal => {
                    modal.show('添加转介绍记录')
                })
            },
            delete(params) {
                var vm = this;
                this.$Modal.confirm({
                    content:'确定删除该转介绍记录？',
                    onOk: function() {
                        vm.$http.delete('student_referers/'+params.row.sr_id)
                        .then(res => {
                            vm.$Message.success('删除成功')
                            vm.init_data();
                        },res => {
                            vm.$Message.error(res.body.message)
                        })
                    }
                })
            },
			hook_get_param (params) {
				let search_obj = util.copy(this.search_field)
				for (let o in search_obj) {
					let property = search_obj[o]
					if(o=='referer_int_day') {
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