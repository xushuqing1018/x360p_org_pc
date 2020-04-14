<template>
    <div>
        <div class="box box-query">
            <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
                <Form-item label="时间段" prop="int_day" class="col-md-3 col-sm-6">
                    <date-range-picker
                            :value="search_field.int_day"
                            @on-change="search_field.int_day=$event"
                            :clearable="false"
                            label="请选择时间段"
                            placement="bottom"
                            style="width:100%">
                    </date-range-picker>
                </Form-item>
                <Form-item label="学管师" prop="eid" class="col-md-3 col-sm-6">
                    <select-employee :rid="4" v-model="search_field.eid" clearable :placeholder="label_choose_teacher"></select-employee>
                </Form-item>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                <Button class="ml-2" type="primary" icon="ios-search" @click="search">查询</Button>
                <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                <Button type="primary" icon="refresh" class="ml-1" :loading="saving" @click="refresh">刷新统计</Button>
                <export-button res="report_attendance_by_learningeids" :params="params"></export-button>
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
                            v-loading.like="'report_attendances'"
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
    import SelectEmployee from 'c%/SelectEmployee.vue'
    import ExportButton from 'c%/ExportButton.vue'
    export default {
        mixins: [grid,common,globals],
        components: {
            dateRangePicker,
            SelectEmployee,
            ExportButton
        },
        data() {
            return {
                rest_api: 'report_attendance_by_learningeids',
                search_field: {
                    int_day: util.recent_month_range(1),
                    eid: 0
                },
                column_keys: {
                    eid: {
                        title: '学管师',
                        show: true,
                    },
                    attendance_nums: {
                        title: '上课次数',
                        show: true,
                        sortable:'custom'
                    },
                    should_attendance_nums: {
                        title: '应到人次数',
                        show: true,
                        sortable:'custom'
                    },
                    actual_attendance_nums: {
                        title: '实到人次数',
                        show: false,
                        sortable:'custom'
                    },
                    attendance_charge_nums: {
                        title: '出勤计费次数',
                        show: true,
                        sortable:'custom'
                    },
                    attendance_uncharge_nums: {
                        title: '出勤未计费次数',
                        show: true,
                        sortable:'custom'
                    },
                    in_rate: {
                        title: '出勤率',
                        show:true,
                        sortable:'custom'
                    },
                    unattendance_charge_nums: {
                        title: '缺勤计费次数',
                        show: true,
                        sortable:'custom'
                    },
                    unattendance_uncharge_nums: {
                        title: '缺勤未计费次数',
                        show: true,
                        sortable:'custom'
                    },
                    out_rate: {
                        title: '缺勤率',
                        show:true,
                        sortable:'custom'
                    }
                },
                column_render: {
                    eid(h, params) {
                        return h('span',this.$filter('ename')(params.row.eid))
                    },
                    in_rate(h, params) {
                        if(params.row.should_attendance_nums == 0){
                            return h('span','0.00%');
                        }else {
                            return h('span', (util.div(params.row.actual_attendance_nums, params.row.should_attendance_nums) * 100).toFixed(2) + '%')
                        }
                    },
                    out_rate(h, params) {
                        let total_out = util.sub(params.row.should_attendance_nums, params.row.actual_attendance_nums)
                        if(params.row.should_attendance_nums == 0){
                            return h('span','0.00%');
                        }else {
                            return h('span', (util.div(total_out, params.row.should_attendance_nums) * 100).toFixed(2) + '%')
                        }
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

                if(this.isRefresh){
                    params.refresh = 1
                }
                this.isRefresh = false
            },
            resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
            },
            refresh () {
                this.isRefresh = true
                this.init_data()
            },
        },
        computed: {


        }
    }
</script>