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
				<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">
					<select-class v-model="search_field.cid" clearable></select-class>
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
						<select-lesson :rid="1" v-model="search_field.lid" clearable></select-lesson>
					</Form-item>
					<Form-item label="开班日期" prop="start_lesson_time" class="col-md-3 col-sm-6">
						<date-range-picker v-model="search_field.start_lesson_time" @on-change="search" label="选择日期" placement="bottom">
						</date-range-picker>
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
                	<Button type="primary" @click="exportExcel('班级列表')" icon="ios-download-outline" class="ml-2" v-per="'reports.export'">导出</Button>
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
                    <div class="pull-right mr-4" v-if="perCheckAllClass">
                        <label>权限范围：</label>
                        <ButtonGroup>
                            <Button type="primary" size="large" icon="android-people">我的</Button>
                            <Button type="ghost" size="large" icon="android-person" @click="trunAllArrange">所有</Button>
                        </ButtonGroup>
                    </div>
	            </Col>
	        </Row>                
	    </div>
	    <div class="box box-result">
	        <div class="toolbar">
	            <Button type="primary" @click="classAdd" icon="plus" v-per="'class.add'">创建班级</Button>
	            <filter-column :keys="column_keys"></filter-column>
	        </div>
	        <div class="content">
	            <div class="content-body">
	                <Table 
            		ref="tableExcel"
                    v-loading.like="'classes'" 
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
    import classInfoModal from '../info-modal.vue'
    import selectEmployee from 'c%/SelectEmployee.vue'
    import selectLesson from 'c%/SelectLesson.vue'
    import selectClass from 'c%/SelectClass.vue'
    import classArrangesModal from '../arranges-modal.vue'
    import classStudentsModal from '../students-modal.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'
    import studentUpList from '../up/student-up-list.vue'
    import upConfirmModal from '../up/up-confirm-modal.vue'
	
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
        data() {
            return {
                mode:'table',
                rest_api: 'classes',
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
                	cid: 0,
                	year: 0,                	
                	season: '',
                	teach_eid: 0,
                	cr_id: 0,
                	sj_id: 0,
                	start_lesson_time: [],   
                	status: [0,1,2]
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
                    sj_id:{
                        title:'科目',
                        sortable:'custom',
                        show:true
                    },
                    student_nums:{
                        title:'人数',
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
									this.classDetail(params.row.cid)						
								}
							}
						},params.row.class_name)
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
                    lesson_time(h,params){
                        let text = util.sprintf('%s',
                                    moment(params.row.start_lesson_time).format('YYYY-MM-DD')
                                    )
                        return h(
                                'span',
                                text
                                )
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
                    arrange_times(h,params){                     
                        return h('span',params.row.arrange_times+'次')
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
                        this.dr().getData(util.sprintf(CLASS_SCHEDULES_URL,params.row.cid))
                        .then(response=>{
                            params.row.schedule = response.list
                            this.$r('infoModal')
                            .set('info',params.row)
                            .show(util.sprintf('编辑班级【%s】',params.row.class_name),'edit')
                        })
                    },
                    up_grade(params){
                        let remine_times = params.row.arrange_times - params.row.attendance_times
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
                        let remine_times = params.row.arrange_times - params.row.attendance_times
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
                        .setClassInfo(params.row)
                        .show(util.sprintf('班级学员【%s】',params.row.class_name),'list')
                    },
                    arrange(params){
                        this.dr().getData(util.sprintf(CLASS_SCHEDULES_URL,params.row.cid))
                        .then(response=>{
                            params.row.schedule = response.list
                            this.$r('arrangesModal')
                            .set('classInfo',params.row)
                            .show(util.sprintf('班级排课【%s】',params.row.class_name),'list')
                        })      
                    },
                    delete(params){
                        this.confirm(util.sprintf('您确定要删除班级【%s】吗?',params.row.class_name))
                        .then(()=>{
                            this.delete(params.row)
                            .then((response)=>{
                                this.$Message.success('删除成功!')
                            })
                        })       
                    }
                }
            }
        },
        mounted () {
            this.init_data()			
		},
		methods: {
			trunAllArrange () {
				this.$emit('on-check','all')
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
                this.up.row = params.row
                // this.up.url = "search/classes?sj_id=" + params.row.sj_id
                this.up.url = util.sprintf('classes?sj_id=%s&subject_grade=[>,%s]&with=schedules',params.row.sj_id,params.row.subject_grade)
                this.$r('up_confirm')
                .show(util.sprintf('升班【%s】',params.row.class_name),'confirm')
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
                .set('classInfo',util.copy(params.row))
                .set('rest_api','classes/'+ params.row.cid + '/students?with=student_lesson')
                .getData()
                .show(util.sprintf('结课【%s】',params.row.class_name),'close')
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
				params.my = true
				params.with = 'schedules'
				params.teach_eid = this.eid$
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