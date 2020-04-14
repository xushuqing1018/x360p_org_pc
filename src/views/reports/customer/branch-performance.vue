<template>
    <div class="c-grid">
        <div class="box box-query">
            <Form ref="ref_search" :model="search_field" :label-width="60" class="filter-form row">
                <Form-item label="时间段" prop="int_day" class="col-sm-3">
                    <date-range-picker
                            v-model="search_field.int_day"
                            label="请选择时间段"
                            placement="bottom"
                            style="width:100%"
                            @on-change="init_data">
                    </date-range-picker>
                </Form-item>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2" style="margin-left:0px;">
                <Button class="ml-3" type="primary" @click="search" icon="ios-search">查询</Button>
                <Button type="primary" @click="refresh" icon="refresh">刷新</Button>
                <export-button res="report_branch_performances" :params="report_params" v-per="'reports.export'"></export-button>
                </Col>
            </Row>
        </div>
        <div class="box box-result">
            <div class="content">
                <div class="content-body" style="position: relative;">
                    <Table
                            :border="true"
                            :data="filterData"
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
    import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import ExportButton from 'c%/ExportButton.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'

    export default{
        mixins: [ grid, common, globals ],
        components: {
            ExportButton,
            DateRangePicker
        },
        data () {
            return {
                rest_api: 'report_branch_performances',
                mode: 1,
                dpt_id: -1,
                data1: [],
                isRefresh: false,
                autoRefresh: false,
                search_field: {
                    int_day: util.recent_month_range(1),
                },
                column_keys: {
                    bid: {
                        title: '校区',
                        align: 'center',
                        show: true
                    },
                    arrived_nums: {
                        title: '到访数',
                        align: 'center',
                        sortable: 'custom',
                        show: true
                    },
                    new_sign_nums: {
                        title: '新签人数',
                        align: 'center',
                        sortable: 'custom',
                        show: true
                    },
                    new_sign_amount: {
                        title: '新签金额',
                        align: 'center',
                        sortable: 'custom',
                        show: true
                    },
                    sign_rate:{
                        title: '成交率',
                        align: 'center',
                        sortable: 'custom',
                        show: true
                    },
                    renew_sign_nums: {
                        title: '续费人数',
                        align: 'center',
                        sortable: 'custom',
                        show: true
                    },
                    renew_sign_amount: {
                        title: '续费金额',
                        align: 'center',
                        sortable: 'custom',
                        show: true
                    },
                },
                column_render: {
                    bid (h,params) {
                        return h('span',this.$filter('branch_name')(params.row.bid,'-'))
                    },
                    arrived_nums (h,params) {
                        let result = h('span',params.row.arrived_nums)

                        if(parseInt(params.row.arrived_nums) > 0){
                            result = h('span',{
                                'class': 'text-info cursor',
                                on:{
                                    'click': () => {
                                        this.numsDetail(params.row,'arrived_nums')
                                    }
                                }
                            },params.row.arrived_nums)
                        }
                        return result
                    },
                    new_sign_nums (h,params) {
                        let result = h('span',params.row.new_sign_nums)

                        if(parseInt(params.row.new_sign_nums) > 0){
                            result = h('span',{
                                'class': 'text-info cursor',
                                on:{
                                    'click': () => {
                                        this.numsDetail(params.row,'new_nums')
                                    }
                                }
                            },params.row.new_sign_nums)
                        }
                        return result
                    },
                    renew_sign_nums (h,params) {
                        let result = h('span',params.row.renew_sign_nums)

                        if(parseInt(params.row.renew_sign_nums) > 0){
                            result = h('span',{
                                'class': 'text-info cursor',
                                on:{
                                    'click': () => {
                                        this.numsDetail(params.row,'renew_nums')
                                    }
                                }
                            },params.row.renew_sign_nums)
                        }
                        return result
                    },

                
                }
            }
        },
        mounted () {
            this.init_data()
            this.$store.commit('branchMultiMode')
        },
        computed: {
            report_params() {
                let params = {}
                let int_day = this.search_field.int_day
                if(int_day != ',' && int_day.length > 0) {
                    params = {
                        type: this.mode,
                        start_date: int_day[0],
                        end_date: int_day[1]
                    }
                }
                return params
            },
            filterData() {
                if(this.dpt_id == -1) {
                    return this.data
                }
                let company = this.companys.find(item => item.dpt_id == this.dpt_id)
                return this.data.filter(item => company.children.indexOf(item.bid)>-1)
            },
        },
        methods: {
            refresh () {
                this.isRefresh = true

                this.init_data()
            },

            numsDetail(row,type){
                let search_field = this.search_field,
                    rest_api = `report_branch_performances/${row.id}?type=${type}&start_date=${search_field.int_day[0]}&end_date=${search_field.int_day[1]}`
                this.$Modal.open('reports/customer/arrived-detail-modal.vue',{
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

            deal_data(res) {
                this.data = res.list
                this.data1 = res.list1
                this.search_field.int_day = [res.params.start_date,res.params.end_date]
                return res.list
            },
            hook_get_param (params) {
                let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o == 'int_day'){
                        if(property != ',' && property.length > 0){
                            params['start_date'] = property[0]
                            params['end_date']   = property[1]
                        }
                    }else{
                        if(property && property != -1){
                            params[o] = property
                        }
                    }
                }
                if(this.isRefresh){
                    params.refresh = 1
                }
                this.isRefresh = false
                /*delete params['page']
                delete params['pagesize']*/
            },
            resetSearch () {
                this.$form('ref_search').reset()
                this.dpt_id = -1
                this.init_data()
            },
        }
    }
</script>

<style>
</style>