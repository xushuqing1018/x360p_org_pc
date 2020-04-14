<style lang="less">
	.ivu-progress{
		.ivu-progress-outer{
			.ivu-progress-inner{
				overflow: hidden;
			}
		}
	}
    .x-tag-title {
        display: inline-block;
        >span {
            font-weight: bold;
            margin-right: 15px
        }
        >.x-tag {
            height: 28px;
            line-height: 28px;
        }
    }
</style>

<template>
 	<div class="c-grid">
	    <div class="box box-result">
	        <div class="toolbar" style="margin: 10px 0px">
                <p class="x-tag-title">
                    <Tag class="x-tag" :color="tagColor">{{this.tagName}}</Tag>
                    <span>标签的班级列表</span>
                </p>
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
        <class-info-modal :up-info="up_info" ref="infoModal" @save="refresh_data"></class-info-modal>
        <class-students-modal ref="studentsModal" @on-success="init_data"></class-students-modal>
        <class-arranges-modal ref="arrangesModal"></class-arranges-modal>
        <student-up-list ref="ref_up" @on-success="init_data" @up-close="init_up"></student-up-list>
        <up-confirm-modal ref="up_confirm" @up-to-new="newClass" @up-to-old="oldClass"></up-confirm-modal>
        <select-class ref="ref_class" :url="up.url" :notFoundText="up.empty_text" v-model="up.cid" @selected="selectClass" v-show="false"></select-class>
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
    import classInfoModal from '../business/class/info-modal.vue'
    import selectEmployee from 'c%/SelectEmployee.vue'
    import selectLesson from 'c%/SelectLesson.vue'
    import selectClass from 'c%/SelectClass.vue'
    import classArrangesModal from '../business/class/arranges-modal.vue'
    import classStudentsModal from '../business/class/students-modal.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
    import studentUpList from '../business/class/up/student-up-list.vue'
    import upConfirmModal from '../business/class/up/up-confirm-modal.vue'
	
    const CLASS_SCHEDULES_URL = 'classes/%s/schedules'
    const NOT_FOUND_TEXT = '没有找到符合条件的班级，请选择升级到新班级'
    export default {
    	name:'classList',
        mixins:[common,grid,directive,globals],
        components: {
        	selectClass,
        	selectLesson,
            classInfoModal,
            selectEmployee,
            dateRangePicker,
            classArrangesModal,
            classStudentsModal,
            studentUpList,
            upConfirmModal
        },
        props: {
			tagId: {
				type: Number,
				default: 0
			},
			tagName: {
				type: String,
				default: ''
			},
            tagColor: {
                type: String,
                default: ''
            }
		},
        data() {
            return {
                mode:'table',
                rest_api: 'tag_relations',
                res_name: '班级',
                pk: 'cid',
                datakey:'classes',
                classes: {},
                modalshow: false,
                modal_class_students: false,
                course_arrange_list: [], 
                editClass:{},
                up: {   // 升班信息
                    cid: '', 
                    url: '',
                    row: {},
                    empty_text: NOT_FOUND_TEXT
                },
                up_info: {},  // 升级到新班传递的信息
                search_field: {
                    tag_id: 0,
					tag_type: 2
                },
                column_keys:{
                    class_no:{
                        title:'编号',
                        sortable:'custom',
                        show:false
                    },
                    class_name:{
                        title:'班级名称',
                        sortable:'custom',
                        show:true
                    },
                    teach_eid:{
                        title:this.$filter('translate')('老师'),
                        sortable:'custom',
                        show:true,
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
                    lid:{
                        title:'所属课程',
                        sortable:'custom',
                        show:true,
                    },
                    sj_id:{
                        title:'科目',
                        sortable:'custom',
                        show:false
                    },
                    bid:{
                        title:'校区',
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
                    arrange_times:{
                        title:'授课情况',
                        sortable:'custom',
                        show:false
                    },
                    lesson_time:{
                        title:'开课日期',
                        show:true
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
                	class_name (h,params) {
						return h('a',{
							attrs: {
								'class': 'x-a-link text-info'								
							},
							on: {
								click: ()=>{
									this.classDetail(params.row.one_class.cid)						
								}
							}
						},params.row.one_class.class_name)
					},
                    lid(h,params){
                        let s = ''
                        if(params.row.one_class.lid == 0){
                            s = '-'
                        }else{
                            s = this.$filter('lesson_name')(params.row.one_class.lid)
                        }
                        return h('span',s)
                    },
                    status(h,params) {
                        let map_status = {0:{text:'招生中',color:'green'},1:{text:'开课中',color:'blue'},2:{text:'已结课',color:'default'}}
                        return h('Tag',{
                                props:{
                                    type:'border',
                                    color:map_status[params.row.one_class.status].color
                                }
                            },
                            map_status[params.row.one_class.status].text
                        )
                    },
                    lesson_time(h,params){
                        let text = util.sprintf('%s',
                                    moment(params.row.one_class.start_lesson_time).format('YYYY-MM-DD')
                                    )
                        return h(
                                'span',
                                text
                                )
                    },
                    nums_rate(h,params){
                        let rate = (params.row.one_class.student_nums/params.row.one_class.plan_student_nums)*100,//params.row.one_class.nums_rate,
                        	text = util.sprintf('%s/%s',
                                    params.row.one_class.student_nums,
                                    params.row.one_class.plan_student_nums
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
                        let rate = (params.row.one_class.arrange_times / params.row.one_class.lesson_times)*100,
                            text = util.sprintf('%s/%s',
                                        params.row.one_class.arrange_times,
                                        params.row.one_class.lesson_times
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
                    arrange_times(h,params){                     
                        return h('span',params.row.one_class.arrange_times+'次')
                    }
                },
                operation_keys: {
                    edit: {
                        title: '编辑',
                        type: 'edit',
                        per: 'class.edit',
                        condition: 'row.status!=2'
                    },
                    up_grade: {
                        title: '升班',
                        type: 'arrow-up-c',
                        per: 'class.up',
                        condition: 'row.status==1'
                    },
                    close: {
                        title: '结课',
                        type: 'close',
                        per: 'class.close',
                        condition:'row.status==1'
                    },
                    class_student: {
                    	title: '学员管理',
                    	type: 'ios-people',
                        per:'class.students',
                        condition: 'row.status!=2'
                    },
                    arrange: {
                        title: '排课管理',
                        type: "document",
                        per:'class.arrange',
                        condition: 'row.status!=2'
                    },
                    delete: {
                        title: '删除班级',
                        type: 'ios-trash',
                        per: 'class.delete'
                    }
                },
                operation_func:{
                    edit(params){
                        this.dr().getData(util.sprintf(CLASS_SCHEDULES_URL,params.row.one_class.cid))
                        .then(response=>{
                            let info =util.copy(params.row.one_class)
                            info.sj_id = util.int(info.sj_id)
                            info.sg_id = util.int(info.sg_id)
                            info.schedule = response.list
                            this.$r('infoModal')
                            .set('info',info)
                            .show(util.sprintf('编辑班级【%s】',params.row.one_class.class_name),'edit')
                        })
                    },
                    up_grade(params){
                        let remine_times = params.row.one_class.arrange_times - params.row.one_class.attendance_times
                        if(remine_times) {
                            this.confirm(util.sprintf('该班级还有%s次未上课的排课记录，是否强制升班？',remine_times)).then(() => {
                                this.upGrade(params)
                            })
                            .catch(() => {

                            })
                        }else{
                            this.upGrade(params)
                        }
                    },
                    close(params){
                        let remine_times = params.row.one_class.arrange_times - params.row.one_class.attendance_times
                        if(remine_times) {
                            this.confirm(util.sprintf('该班级还有%s次未上课的排课记录，是否强制结课？',remine_times)).then(() => {
                                this.closeGrade(params)
                            })
                            .catch(() => {

                            })
                        }else{
                            this.closeGrade(params)
                        }
                    },
                    class_student(params){
                    	this.$r('studentsModal')
                        .setClassInfo(params.row.one_class)
                        .show(util.sprintf('班级学员【%s】',params.row.one_class.class_name),'list')
                    },
                    arrange(params){
                        this.dr().getData(util.sprintf(CLASS_SCHEDULES_URL,params.row.one_class.cid),false)
                        .then(response=>{
                            params.row.one_class.schedule = response.list
                            this.$r('arrangesModal')
                            .set('classInfo',params.row.one_class)
                            .show(util.sprintf('班级排课【%s】',params.row.one_class.class_name),'list')
                        })      
                    },
                    delete(params){
                        this.confirm(util.sprintf('您确定要删除班级【%s】吗?',params.row.one_class.class_name))
                        .then(()=>{
                            this.delete(params.row.one_class)
                        })       
                    }
                }
            }
        },
        mounted () {
            this.search_field.tag_id = this.tagId;
            this.init_data()
        },
        watch: {
            tagId(val) {
				this.search_field.tag_id = val;
				this.init_data();
			},
        },
		methods: {
            trunMyClass () {
                this.$emit('on-check','my')
            },
            turnGridClass () {
                this.$emit('on-turn-grid','grid')
            },
			classDetail (cid) {
				this.$router.push({path:'/business/class/'+cid})
			},
            classAdd(){
                if(!_.isEmpty(this.up_info)) {
                    for(let key in this.up_info) {
                        delete this.up_info[key]
                    }
                }
                this.$r('infoModal').show('创建班级')
            },
			classSchedule(){
                this.mode = 'schedule'
            },
            listMode(){
                this.mode = 'table'
            },
            upGrade(params) {
                this.up.row = params.row.one_class
                // this.up.url = "search/classes?sj_id=" + params.row.one_class.sj_id
                this.up.url = util.sprintf('classes?sj_id=%s&subject_grade=[>,%s]&with=schedules',params.row.one_class.sj_id,params.row.one_class.subject_grade)
                this.$r('up_confirm')
                .show(util.sprintf('升班【%s】',params.row.one_class.class_name),'confirm')
            },
            newClass() {
                this.up_info.lid = this.up.row.lid
                this.up_info.sj_id = this.up.row.sj_id
                this.up_info.subject_grade = this.up.row.subject_grade + 1
                this.$r('infoModal').show('创建班级')
            },
            refresh_data(Obj) {
                if(this.up.url!=='') {
                    this.up.cid = Obj.data.cid
                    this.selectClass()
                }
                this.init_data()
            },
            oldClass() {
                this.$r('ref_class').openModal()
            },
            selectClass() {
                this.$r('ref_up')
                .set('toCid',this.up.cid)
                .set('classInfo',this.up.row)
                .set('rest_api','classes/'+ this.up.row.cid + '/students?with=student_lesson')
                .getData()
                .show(util.sprintf('升班【%s】',this.up.row.class_name),'up')
            },
            closeGrade(params) {
                this.$r('ref_up')
                .set('classInfo',util.copy(params.row.one_class))
                .set('rest_api','classes/'+ params.row.one_class.cid + '/students?with=student_lesson')
                .getData()
                .show(util.sprintf('结课【%s】',params.row.one_class.class_name),'close')
            },
            // 初始化up
            init_up() {
                this.up.url = ''
            },
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
					}
					else{
						if(property&&property!=-1){
							params[o] = property	
						}		
					}									
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