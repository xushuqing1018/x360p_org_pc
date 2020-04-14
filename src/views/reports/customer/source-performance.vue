<template>
    <div class="c-grid">
        <div class="box box-query">
            <Form ref="search" :model="search_field" :label-width="60" class="filter-form row">
                <FormItem label="招生生源" class="col-md-3 col-sm-6" prop="from_did">
                    <dictionary-from v-model="search_field.did" clearable></dictionary-from>
                </FormItem>
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
                    <export-button res="report_customer_origins" :params="params"></export-button>
                </Col>
            </Row>
        </div>
        <div class="box box-result">
            <div class="content">
                <div class="content-body" style="position: relative;">
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
    import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import common from '@/libs/common.mixin'
    import globals from '@/libs/globals.mixin'
    import ExportButton from 'c%/ExportButton.vue'
    import DateRangePicker from 'c%/DateRangePicker.vue'
    import DictionaryFrom from 'c%/DictionaryFrom.vue'

    export default {
        mixins: [grid, common, globals],
        components: {
            ExportButton,
            DateRangePicker,
            DictionaryFrom,
        },
        data() {
            return {
                rest_api: '',
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

                },
                column_render: {}
            }
        },
        mounted() {

        },
        computed: {},
        methods: {
            search() {
                this.isRefresh = true;
                this.init_data()
            },
            refresh() {
                this.$form('search').reset();
                this.init_data();
            }


        }
    }
</script>

<style>
</style>