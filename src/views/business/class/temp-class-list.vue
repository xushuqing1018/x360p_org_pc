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
            	<Form-item label="开班日期" prop="start_lesson_time" class="col-md-3 col-sm-6">
                    <date-range-picker 
                        v-model="search_field.start_lesson_time" 
                        @on-change="search" 
                        label="选择日期" 
                        placement="bottom"
                        style="width:100%">
                    </date-range-picker>
                </Form-item>
                <Form-item label="班级名称" prop="class_name" class="col-md-3 col-sm-6">
                    <Input v-model="search_field.class_name" placeholder="请输入"  @keyup.native.enter="init_data"></Input>
                </Form-item>
              
                <Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
                    <select-employee :rid="1" v-model="search_field.teach_eid" clearable></select-employee>
                </Form-item>             
                <Form-item label="科目" prop="sj_id" class="col-md-3 col-sm-6">
                    <Select v-model="search_field.sj_id">
                        <Option :value="0">不限</Option>
                        <Option :value="item.sj_id" v-for="item in subjects">{{item.subject_name}}</Option>
                    </Select>
                </Form-item>              
               
            </Form>
            <Row class="basic">
                <Col span="24" class="mt-2">
                    <Button-group>
                        <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>     
                        <!--<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>-->
                    </Button-group>
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>

                    <export-button res="classes" :params="params"></export-button>
                    
                    <Button class="ml-3" size="small" icon="ios-clock-outline" type="ghost" @click="appoitmentRecord">约课记录</Button>
                    
                    <div class="pull-right">
                        <per-scope per="class.checkAll" @on-change="perScopeChange"></per-scope>
                    </div>
                </Col>
            </Row>                
        </div>
        <div class="box box-result">
            <div class="toolbar">
                <Button type="primary" @click="classAdd" icon="plus" v-per="'class.add'">创建班级</Button>
                <!--<import-button res="classes" name="班级" @on-import-finish="init_data" v-per="'class.add'"></import-button>-->
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
    import util,{_} from '@/libs/util'
    import common from '@/libs/common.mixin'
    import grid from '@/libs/grid.mixin'
    import globals from '@/libs/globals.mixin'
    import directive from '@/libs/directive.mixin'
   
    import selectEmployee from 'c%/SelectEmployee.vue'
    import selectLesson from 'c%/SelectLesson.vue'
    import dateRangePicker from 'c%/DateRangePicker.vue'
//  import ImportButton from 'c%/ImportButton.vue'

    import ExportButton from 'c%/ExportButton.vue'
    import ClassName from 'c%/ClassName.vue'
    
    Vue.component('class-name',ClassName)
    const CLASS_SCHEDULES_URL = 'classes/%s/schedules'
    const NOT_FOUND_TEXT = '没有找到符合条件的班级，请选择升级到新班级'
    export default {
        name:'classList',
        mixins:[common,grid,directive,globals],
        components: {
            selectLesson,
            selectEmployee,
            dateRangePicker,
//          ImportButton,

            ExportButton
        },
        data() {
            return {
                mode:'table',
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
                search_field: {
                    cid: 0,
                    class_name: '',
                    year: 0,                    
                    season: '',
                    teach_eid: 0,
                    cr_id: 0,
                    sj_id: 0,
                    start_lesson_time: [],  
                    end_lesson_time: []
                },
                column_keys:{
                    class_name:{
                        title:'班级名称',
                        sortable:'custom',
                        show:true
                    },
                    bid:{
                        title:'校区',
                        sortable:'custom',
                        show:true,
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
                    plan_student_nums: {
                    	title: '预招人数',
                    	show: true
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
                    arrange_times:{
                        title:'授课情况',
                        sortable:'custom',
                        show:false
                    },
                    start_lesson_time: {
                    	title: '开课日期',
                    	show: true
                    },
                    end_lesson_time: {
                    	title: '结课日期',
                    	show: true
                    }
                },
                column_render: {                    
                    class_name (h,params) {
                    	let tag = h('Tag',{
                    		props: {
                    			color: 'blue'
                    		}
                    	},'补课班')
                    	
                    	if(params.row.class_type == 2){
                    		tag = h('Tag',{
                    			props: {
                    				color: '#EF6AFF'
                    			}
                    		},'活动班')
                    	}
                    	
                        return h('div',[
                        	tag,
	                        h('class-name',{
	                           props: {
                                    name: params.row.class_name,
                                    detailAction: 1,
                                    cid: params.row.cid
                                }
	                        })
                        ])
                    },
                    plan_student_nums (h,params) {
                    	return h('span',params.row.plan_student_nums||'不限')
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
                    lesson_time(h,params){
                        let text = util.sprintf('%s',
                                    moment(params.row.start_lesson_time).format('YYYY-MM-DD')
                                    )
                        return h(
                                'span',
                                text
                                )
                    },
                    arrange_times(h,params){                     
                        return h('span',params.row.arrange_times+'次')
                    },
                    end_lesson_time (h,params) {
                    	let classes = 'text-success',
                    		now_day = parseInt(moment(new Date()).format('YYYYMMDD')),
                    		end_lesson_time = parseInt(moment(params.row.end_lesson_time).format('YYYYMMDD'))
                    	
                    	if(now_day > end_lesson_time){
                    		classes = 'text-danger'	
                    	}                    	
                    	
                    	return h('span',{
	                    		'class': classes
	                    	},params.row.end_lesson_time)
                    }
                },
                operation_keys: {
	            	edit: {
	            		title: '编辑',
	            		type: 'edit',
                        per: 'temp.edit'
	            	},
	            	qrcode: {
	            		title: '生成二维码',
	            		type: 'qr-scanner',
                        per: 'temp.scanner',
	            		condition: "row.class_type==1&&parseInt(row.end_lesson_time.replace(/-/g,'')) >= "+ parseInt(moment(new Date()).format('YYYYMMDD'))
	            	},
                    delete: {
                        title: '删除班级',
                        type: 'ios-trash',
                        per: 'temp.delete'
                    }
	            },
	            operation_func: {
	            	edit (params) {
	            		this.editInfo(params.row)
	            	},
	            	qrcode (params) {
	            		this.showQR(params.row)
	            	},
                    delete (params) {
                        this.deleteTemp(params.row)
                    }
	            }
            }           
        },
        watch: {
            'type_class':function(val) {
                this.init_data()
            }
        },
        created(){
            if(!this.enable_grade){
                delete this.column_keys['grade']
            }
        },
        methods: {
        	appoitmentRecord () {
        		this.$Modal.open('business/class/appointment-arrange.vue@modal',)
        		.then(modal=>{
        			modal.show('约课记录')
        		})
        	},
        	showQR (row) {
        		this.$Modal.open('business/class/temp-qr-modal.vue')
        		.then(modal=>{
                    modal
                    .set('cid',row.cid)
                    .show('班级二维码')
                })
        	},
            deleteTemp (row) {
                this.confirm(util.sprintf('您确定要删除临时班【%s】吗?',row.class_name))
                .then(()=>{
                    this.$rest('classes')
                    .delete(row.cid)
                    .success(res => {
                        this.$Message.success('删除成功')
                        this.init_data()
                    })
                    .error(res => {
                        this.error(res.body.message)
                    })
                })
            },
            perScopeChange(value) {
                this.type_class = value
            },
            classDetail (cid) {
                this.$router.push({path:'/business/class/'+cid})
            },
            classAdd(){
                this.$Modal.open('business/class/temp-info-modal.vue',{
                    on:{
                        save:()=>{
                            this.refresh_data()
                        }
                    }
                }).then(modal=>{
                    modal.show('创建班级')
                })
            },          
            editInfo (row) {
            	this.$Modal.open('business/class/temp-info-modal.vue',{
                    on:{
                        save:()=>{
                            this.refresh_data()
                        }
                    }
                }).then(modal=>{
                    modal
                    .set('info',row)
                    .show('编辑班级','edit')
                })
            },
            refresh_data(Obj) {               
                this.init_data()
            },
            resetSearch () {
                this.$form('ref_search').reset()
                this.init_data()
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
                    }
                    else{
                        if(property&&property!=-1){
                            params[o] = property    
                        }       
                    }                                   
                }
                if(this.type_class == 'my') {
                    params.my = true                    
                    params.teach_eid = this.eid$
                }
                params.class_type = '[>,0]'
                params.with = 'schedules'
                params.is_demo = 0
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