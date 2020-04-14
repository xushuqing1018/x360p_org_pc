<template>
    <div>
        <div class="box box-query">
            <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
                <Form-item label="班级名称" prop="class_name" class="col-md-3 col-sm-6">
                	<Input v-model="search_field.class_name" placeholder="请输入" @keyup.native.enter="init_data"></Input>
                </Form-item>
                <Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
                    <select-employee :rid="1" v-model="search_field.teach_eid" clearable></select-employee>
                </Form-item>
                <Form-item label="选择课程" prop="lid" class="col-md-3 col-sm-6">
                    <select-lesson v-model="search_field.lid" clearable></select-lesson>
                </Form-item>
                <Form-item label="开班日期" prop="start_lesson_time" class="col-md-3 col-sm-6">
                    <date-range-picker 
                        v-model="search_field.start_lesson_time" 
                        @on-change="search" 
                        label="选择日期" 
                        placement="bottom"
                        style="width:100%">
                    </date-range-picker>
                </Form-item>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2">
                    <Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>     
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

                    <CheckboxGroup v-model="search_field.status" class="ml-3" style="display: inline-block;">
                        <Checkbox :label="0">
                            <span>招生中</span>
                        </Checkbox>
                        <Checkbox :label="1">
                            <span>开课中</span>
                        </Checkbox>
                        <Checkbox :label="2">
                            <span>已结课</span>
                        </Checkbox>
                    </CheckboxGroup>
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
                    v-loading="'classes'" 
                    :page-size="pageSize" 
                    :page="pageIndex" 
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
                        <Page :total="total" 
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
    import moment from 'moment'
    import util,{_} from '@/libs/util'
    import common from '@/libs/common.mixin'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import selectEmployee from 'c%/SelectEmployee.vue'
    import selectLesson from 'c%/SelectLesson.vue'
    import dateRangePicker from 'c%/DateRangePicker.vue'

    export default {
        mixins:[common,grid,globals],
        components: {
            selectLesson,
            selectEmployee,
            dateRangePicker
        },
        data() {
            return {
                rest_api: 'classes',
                search_field: {
                    class_name: '',
                    teach_eid: 0,
                    start_lesson_time: [],  
                    status: [0,1]
                },
                column_keys:{
                    class_name:{
                        title:'班级名称',
                        show:true
                    },
                    status: {
                        title:'状态',
                        show:true
                    },
                    teach_eid:{
                        title:this.$filter('translate')('老师'),
                        show:true,
                    },
                    lid:{
                        title:'所属课程',
                        show:true,
                    },
                    cr_id:{
                        title: '教室',
                        show: true
                    },
                    schedules: {
                        title: '计划详情',
                        show: true,
                    },
                    start_lesson_time:{
                        title:'开始日期',
                        show:true
                    },
                    lesson_times: {
                        title: '排课次数',
                        show: true
                    }
                },
                operation_keys: {
                	arrange: {
                		title: '生成排课',
                		type: 'plus',
                		per: 'class.arrange'
                	}
                },
                operation_func: {
                	arrange(params) {
                		this.$Modal.open('business/class/arrange-set-modal.vue',{
                			on: {
                				'on-success':() => {
                					this.init_data()
                				}
                			}
                		})
                		.then(modal => {
                			modal.set('info',params.row)
                			.show(util.sprintf('编辑班级的排课计划【%s】',params.row.class_name),'edit')
                		})
                	}
                },
                column_render: {
                    lid(h,params){
                        let s = ''
                        if(params.row.lid == 0){
                            s = '-'
                        }else{
                            s = this.$filter('lesson_name')(params.row.lid)
                        }
                        return h('span',s)
                    },
                    status(h,params) {
                        let map_status = {0:{text:'招生中',color:'green'},1:{text:'开课中',color:'blue'},2:{text:'已结课',color:'default'}}
                        return h('Tag',{
                                props:{
                                    type:'border',
                                    color:map_status[params.row.status].color
                                }
                            },
                            map_status[params.row.status].text
                        )
                    },
                    start_lesson_time(h,params){
                        let text = '-',
                            start = params.row.start_lesson_time
                        if(start != 0) {
                            text = start
                        }
                        return h('span',text)
                    },
                    schedules(h,params) {
                        let schedules = this.orderBy(params.row.schedules,'week_day')
                        let l = schedules.length
                        let ps = []
                        if(l) {
                            schedules.forEach((s,sIndex) => {
                                let p = []
                                let day = this.$filter('week_day_text')(s.week_day)
                                if(sIndex>0&&schedules[sIndex].week_day==schedules[sIndex-1].week_day) {
                                    day = ''
                                }
                                p.push(h('span',{
                                    style: {
                                        width: '30px',
                                        display: 'inline-block'
                                    }
                                },day))
                                p.push(h('span',s.int_start_hour+'~'+s.int_end_hour))
                                ps.push(h('p',{
                                    style: {
                                        padding: '3px'
                                    }
                                },p))
                            })
                            return h('div',{
                                style: {
                                    paddingTop: '5px',
                                    paddingBottom: '5px'
                                }
                            },ps)
                        }else{
                            return h('span','暂无上课时段~')
                        }
                    }
                }
            }
        },
        mounted() {
            this.init_data()
        },
        methods: {
            resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
            },
            hook_get_param (params) {
                let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='start_lesson_time'){
                        if(property!=','&&property.length>0){
                            params[o] = util.sprintf('[Between,%s]',property.join(','))
                        }                                               
                    }else if (o=='status'){
                        if(property.length>0){
                            params[o] = util.sprintf('[In,%s]',property.join(','))
                        }
                    }else{
                        if(property&&property!=-1){
                            params[o] = property    
                        }       
                    }                                   
                }
                params.class_type = 0
                params.is_demo = 0
                params.with = 'schedules'
            }
        },
        computed: { 
            years () {
                let year_start = parseInt(moment(new Date()).format('YYYY')) - 6
                let result = []
                for (var index = 0; index < 10; index++) {
                    result.push(year_start+index)
                }               
                return result
            },
            subjects () {
                return this.$store.state.gvars.subjects
            }
        }
    }
</script>