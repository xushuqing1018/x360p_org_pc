<style lang="less">
    .ivu-progress{
        .ivu-progress-outer{
            .ivu-progress-inner{
                overflow: hidden;
            }
        }
    }
</style>
<template>
    <div class="c-grid">
        <div class="box box-query">
            <Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
                <Form-item label="班级名称" prop="class_name" class="col-md-3 col-sm-6">
                	<Input v-model="search_field.class_name" placeholder="请输入" @keyup.native.enter="init_data"></Input>
                </Form-item>
                <Form-item label="年份" prop="year" class="col-md-3 col-sm-6">
                    <Select v-model="search_field.year">
                        <Option :value="0">不限</Option>
                        <Option :value="item" v-for="item in years">{{item}}</Option>
                    </Select>
                </Form-item>
                <Form-item label="期段" prop="season" class="col-md-3 col-sm-6">
                    <Select v-model="search_field.season">
                        <Option :value="0">不限</Option>
                        <Option :value="item.name" v-for="item in dicts('season')">{{item.title}}</Option>
                    </Select>
                </Form-item>
                <Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
                    <select-employee :rid="1" v-model="search_field.teach_eid" clearable></select-employee>
                </Form-item>
                <template v-if="searchExpand">                  
                    <Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
                        <Select v-model="search_field.sj_id">
                            <Option :value="0">不限</Option>
                            <Option :value="item.sj_id" v-for="item in subjects">{{item.subject_name}}</Option>
                        </Select>
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
                    <Form-item label="结课日期" prop="end_lesson_time" class="col-md-3 col-sm-6">
                        <date-range-picker 
                            v-model="search_field.end_lesson_time" 
                            @on-change="search" 
                            label="选择日期" 
                            placement="bottom"
                            style="width:100%">
                        </date-range-picker>
                    </Form-item>
                    <Form-item label="线上线下" prop="is_online" class="col-md-3 col-sm-6" v-if="enable_online_lesson">
                        <Select v-model="search_field.is_online">
                            <Option :value="-1">不限</Option>
                            <Option :value="1">线上课</Option>
                            <Option :value="0">线下课</Option>
                        </Select>
                    </Form-item>
                </template>
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2">
                    <Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>     
                        <Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
                    </Button-group>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

                    <export-button res="classes" :params="params"></export-button>

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
                    <div class="pull-right">
                        <per-scope per="class.checkAll" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
            </Row>                
        </div>
        <div class="box box-result">
            <div class="toolbar">
                <Button type="primary" @click="classAdd" icon="plus" v-per="'class.add'">创建班级</Button>
                <import-button res="classes" name="班级" @on-import-finish="init_data" v-per="'class.add'"></import-button>
                <filter-column :keys="column_keys"></filter-column>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table 
                    ref="tableExcel"
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
    import Vue from 'vue'
    import moment from 'moment'
    import util from '@/libs/util'
    import {_} from '@/libs/util'
    import common from '@/libs/common.mixin'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import directive from '@/libs/directive.mixin'
   
    import selectEmployee from 'c%/SelectEmployee.vue'
    import selectLesson from 'c%/SelectLesson.vue'
    import dateRangePicker from 'c%/DateRangePicker.vue'
    import studentUpList from './up/student-up-list.vue'
    import upConfirmModal from './up/up-confirm-modal.vue'
    import OperationItems from './operation-items.vue'
    import ImportButton from 'c%/ImportButton.vue'
    import ClassName from 'c%/ClassName.vue'
    import EmployeeName from 'c%/EmployeeName.vue'
    import TagLabel from 'c%/TagLabel.vue'

    import ExportButton from 'c%/ExportButton.vue'
    
    const CLASS_SCHEDULES_URL = 'classes/%s/schedules'
    Vue.component('operation-class-items',OperationItems)
    Vue.component('class-name',ClassName)
    Vue.component('employee-name',EmployeeName)
    export default {
        name:'classList',
        mixins:[common,grid,directive,globals],
        components: {
            selectLesson,
            selectEmployee,
            dateRangePicker,
            studentUpList,
            upConfirmModal,
            ImportButton,
            ExportButton
        },
        data() {
            var vm = this;
            return {
                rest_api: 'classes',
                type_class: '',
                res_name: '班级',
                pk: 'cid',
                datakey:'classes',
                classes: {},
                modalshow: false,
                modal_class_students: false,
                course_arrange_list: [], 
                editClass:{},
                showIndex: false,
                tag_id:0,
                search_field: {
                    cid: 0,
                    class_name: '',
                    year: 0,                    
                    season: '',
                    teach_eid: 0,
                    cr_id: 0,
                    sj_id: 0,
                    start_lesson_time: [],  
                    end_lesson_time: [], 
                    status: [0,1],		//已结课班级默认不显示
                    is_online:-1
                },
                column_keys:{
                    operate: {
                        title: '操作',
                        width: 80,
                        disabled:true
                    },
                    index: {
                        type: 'index',
                        title:'#',
                        width: 60,
                        align: 'center'
                    },
                    class_name:{
                        title:'班级名称',
                        sortable:'custom',
                        show:true,
                        width: 200
                    },
                    bid:{
                        title:'校区',
                        sortable:'custom',
                        show:true,
                    },
                    pj_id:{
                        title:'项目',
                        show:false
                    },
                    teach_eid:{
                        title:this.$filter('translate')('老师'),
                        sortable:'custom',
                        show:true,
                    },
                    second_eids: {
                    	title: this.$filter('translate')('助教'),
                    	show: false
                    },
                    edu_eid:{
                        title:this.$filter('translate')('学管师'),
                        show:false
                    },
                    cr_id:{
                        title:'默认教室',
                        sortable:'custom',
                        show:true
                    },
                    student_nums:{
                        title:'人数',
                        sortable:'custom',
                        show:false
                    },
                    status: {
                        title:'状态',
                        sortable:'custom',
                        show:true
                    },
                    sj_id:{
                        title:'科目',
                        sortable:'custom',
                        show:true
                    },
                    grade:{
                        title:'年级',
                        sortable:'custom',
                        show:true
                    },
                    lid:{
                        title:'所属课程',
                        sortable:'custom',
                        show:true,
                    },
                    year:{
                        title:'年份',
                        sortable:'custom',
                        show:false
                    },
                    season:{
                        title:'期段',
                        sortable:'custom',
                        show:false
                    },
                    nums_rate:{
                        title:'满班率',
                        sortable:'custom',
                        show:true
                    },
                    lesson_times:{
                        title:'排课情况',
                        sortable:'custom',
                        show:true
                    },
                    schedules: {
                        title: '上课时间',
                        show: true,
                        width: 150
                    },
                    attendance_times:{
                        title:'授课情况',
                        sortable:'custom',
                        show:false
                    },
                    start_lesson_time:{
                        title:'开课日期',
                        show:true
                    },
                    end_lesson_time:{
                        title:'结课日期',
                        show:false
                    },
                    is_online:{
                        title:'线上课',
                        show:false
                    },
                    unit_price:{
                        title:'课时单价',
                        show:false
                    },
                    per_lesson_hour_minutes:{
                        title:'单课时分钟',
                        show:false
                    },
                    consume_lesson_hour:{
                        title:'单次消耗课时',
                        show:false
                    }
                },
                column_render: {
                    operate (h,params) {
                        let operate = [
                                    h('operation-class-items',{
                                        props: {
                                            info: params.row,
                                            refs: this.$refs,
                                            listObj: this
                                        },
                                        on: {
                                            success: () => {
                                                this.init_data()
                                            },
                                            updateUp: (up) => {
                                                this.updateUp(up)
                                            }
                                        }
                                    },
                                    [
                                        h('Button',{
                                            props: {
                                                type:'primary',
                                                size: 'small'
                                            }
                                        },[
                                            '操作  ',
                                            h('Icon',{
                                                props: {
                                                    type: 'arrow-down-b'
                                                }
                                            })
                                        ])
                                    ])
                                ]
                        return h('div',operate)
                    },
                    class_name (h,params) {
                        let classNameElement = h('class-name',{
                            on: {
                                click:() => {
                                    this.classDetail(params.row.cid)
                                }
                            },
                            props: {
                                name: params.row.class_name,
                                detailAction: 1,
                                cid: params.row.cid
                            }
                        })
                        return h('span',[
                            classNameElement,
                            h(TagLabel, {
                                props: {
                                    list: params.row.tags,
                                    type: 2,
                                    id: params.row.cid,
                                    objName: params.row.class_name
                                },
                                style: {
                                    marginLeft: '5px'
                                },
                                on: {
                                    update: () => {
                                        this.init_data()
                                    }
                                }
                            })
                        ])
                    },
                    teach_eid (h,params) {
                        return h('employee-name',{
                            props: {
                                name: vm.$filter('ename')(params.row.teach_eid),
                                detailAction: 2,
                                showAvatar: false,
                                eid: params.row.teach_eid
                            }
                        })
                    },
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
                    end_lesson_time(h,params){
                        let text = '-',
                            end = params.row.end_lesson_time
                        if(end != 0) {
                            text = end
                        }
                        return h('span',text)
                    },
                    nums_rate(h,params){
                        let rate = (params.row.student_nums/params.row.plan_student_nums)*100,//params.row.nums_rate,
                            text = util.sprintf('%s/%s',
                                    params.row.student_nums,
                                    params.row.plan_student_nums
                                    )
                        return h(
                                    'Progress',
                                    {
                                        props:{
                                            strokeWidth:5,
                                            percent: rate
                                        }
                                    },
                                    [
                                    h('span',text)
                                    ]
                                )
                    },
                    lesson_times (h,params){
                        let rate = (params.row.arrange_times / params.row.lesson_times)*100,
                            text = util.sprintf('%s/%s',
                                        params.row.arrange_times,
                                        params.row.lesson_times
                                        )
                     
                        return h(
                                    'Progress',
                                    {
                                        props:{
                                            strokeWidth:5,
                                            percent: rate
                                        }
                                    },
                                    [
                                    h('span',text)
                                    ]
                                )
                    },
                    attendance_times(h,params){                     
                        return h('span',params.row.attendance_times+'次')
                    },
                    is_online(h,params){
                        let t = '否'
                        if(params.row.is_online == 1){
                            t = '是'
                        }
                        return h('span',t)
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
        watch: {
            'type_class':function(val) {
                let tag_id = this.$route.query.tag_id
                if(tag_id) {
                    this.tag_id = tag_id
                }
                this.init_data()
            },
            '$route'(to,from) {
                this.tag_id = to.query.tag_id
                this.init_data()
            }
        },
        created(){
            if(!this.enable_grade){
                delete this.column_keys['grade']
            }
            if(!this.enable_online_lesson){
                delete this.column_keys['is_demo']
            }
            if(!this.enable_project){
                delete this.column_keys['project']
            }
        },
        mounted() {
            this.replaceSearchField()
        },
        beforeDestroy() {
            this.setStateSearchDetail(false)
        },
        methods: {
            perScopeChange(value) {
                this.type_class = value
            },
            classDetail (cid) {
                this.setStateSearchInfo()
                this.$router.push({path:'/business/class/'+cid})
            },
            classAdd(){
                this.$Modal.open('business/class/info-modal.vue',{
                    on:{
                        save:()=>{
                            this.init_data()
                        }
                    }
                }).then(modal=>{
                    modal.show('创建班级')
                })
            },
            resetSearch () {
                if(this.tag_id > 0) {
                    this.$router.replace('/business/class/list')
                }else{
                    this.$form('ref_search').reset()
                    this.init_data()
                }
            },
            hook_get_param (params) {
                let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(o=='start_lesson_time'||o=='end_lesson_time'){
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
                if(this.type_class == 'my') {
                    params.my = true
                    params.teach_eid = this.eid$
                }
                params.class_type = 0
                params.is_demo = 0
                params.with = 'schedules'
                if(this.tag_id > 0) {
                    params.tag_id = this.tag_id
                }
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