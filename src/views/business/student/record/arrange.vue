<template>
    
	<div class="c-grid" style="padding:0">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="班级名称" prop="cid" class="col-md-3 col-sm-6">	        		
					<select-class v-model="search_field.cid" clearable></select-class>
				</Form-item>
				<Form-item label="上课时间" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker v-model="search_field.int_day" @on-change="init_data" label="选择日期" placement="bottom" style="width:100%"></date-range-picker>
				</Form-item>
				<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
					<select-lesson v-model="search_field.lid" clearable></select-lesson>
				</Form-item>
				<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
					<select-employee :rid="1" v-model="search_field.teach_eid" clearable></select-employee>
				</Form-item>
				<template v-if="searchExpand">
						<Form-item label="助教" prop="second_eid" class="col-md-3 col-sm-6">
							<select-employee :rid="2" v-model="search_field.second_eid" clearable></select-employee>
						</Form-item>
						<Form-item label="教室" prop="cr_id" class="col-md-3 col-sm-6">
							<Select v-model="search_field.cr_id">
								<Option :value="0">不限</Option>
								<Option v-for="(item,index) in classrooms" :key="index" :value="item.cr_id">{{item.room_name}}</Option>
							</Select>
						</Form-item>
						<Form-item label="期段" prop="season" class="col-md-3 col-sm-6">
							<Select v-model="search_field.season">
								<Option :value="0">不限</Option>
								<Option v-for="(item,index) in dicts('season')" :value="item.name" :key="index">{{item.title}}</Option>
							</Select>
						</Form-item>
				</template>
			</Form>
			<Row class="basic">
					<Col span="24" class="mt-2" style="margin-left:0px;">
						<Button-group>
									<Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
									<Button type="primary" :icon="toggleSearchIcon" @click="toggleSearch"></Button>
							</Button-group>
						<Button type="primary" icon="refresh" @click="resetSearch">重置</Button>  
						<export-button res="course_arranges" :params="params"></export-button>
					</Col>
			</Row>
		</div>

		<div class="box box-result" style="box-shadow:none">
			<div class="toolbar">
				<filter-column :keys="column_keys"></filter-column>
	    	</div>
			<div class="content">
		        <div class="content-body">
		            <Table 
		            v-loading.like="'course_arranges'" 
		            ref="tableExcel"
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
		                <Page 
		                size="small"
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
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import grid from '@/libs/grid.mixin'

	import selectClass from 'c%/SelectClass.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
    import dateRangePicker from 'c%/DateRangePicker.vue'  
    import selectLesson from 'c%/SelectLesson.vue'
    import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [common,globals,grid],
		components: {
			selectClass,
			selectLesson,
	    	selectEmployee,
	        dateRangePicker,
	        ExportButton
		},
		props: {
			sid:{
				type: [Number,String],
				default: 0
			}
		},
		data () {
			return {
				// rest_api: 'course_arranges?sid='+this.$route.params.id,
				rest_api: 'course_arranges',
				search_field: {
	            	cid: 0,
	            	int_day: [],
	            	sj_id: 0,
	            	cr_id: 0,
	            	teach_eid: 0,
	            	second_eid: 0,
	            	season: 0,
	            	is_attendance: [0,1],       
	            	lesson_type: [0,1,2],
	            }, 
				id: this.sid > 0?this.sid:this.$route.params.id,
				
				column_keys:{            	
	                bid:{
	                    title:'校区',
	                    sortable:'custom',
	                    show:true,
	                },
	                int_day:{
	                	title:'日期',
	                	sortable:'custom',
	                	show:true
	                },				
	                time_section:{
	                	title:'时段',
	               		show:true
	                },
	                teach_eid:{
	                    title:this.$filter('translate')('老师'),
	                    sortable:'custom',
	                    show:true,
	                },
	                second_eid:{
	                    title:'助教',
	                    sortable:'custom',
	                    show:false,
					},
					sj_id:{
						title:'科目',
						sortable:'custom',
						show:false,
					},
	                teach_object:{
	                    title:'授课对象',
	                    show:true
	                },
	                tbs: {
	                    title: '授课内容',
	                    show: true,
	                    width: 200
	                },
	                cr_id:{
	                    title:'教室',
	                    sortable:'custom',
	                    show:true
	                },
	                is_attendance:{
	                	title:'考勤',
	                	sortable:'custom',
	                	show:true
	                },
	                create_time: {
	                    title: '创建时间',
	                    show: false,
	                },
	                create_employee: {
	                    title: '创建人',
	                    show: false
	                }
	            },
	            column_render: {
					is_attendance(h,params){
						let map_tag =  {
								0:{color:'default',label: '未考勤'},
								1:{color:'yellow',label: '部分考勤'},
								2:{color:'green',label: '已考勤'}
							},
							tag = map_tag[params.row.is_attendance]
						if(params.row.is_cancel == 1){
							tag.color='red'
							tag.label='已取消'
							return h('div',[
								h('Tag',{props:{color:tag.color}},tag.label),
								h('p','原因:'+params.row.reason)
								])
						}
						var vm = this;
						return h('Tag',{
							props:{
								color: tag.color
							},
							nativeOn: {
								click:() => {
									this.showAttendModal(params.row)
								}
							}
						},tag.label)
					},
	                tbs (h,params) {
	                    let result = '-'
	                    let book = params.row.textbook
	                    let section = params.row.textbook_section
	                    if(book) {
	                        result = book.tb_name
	                    }
	                    if(section) {
	                        result += `：第${section.sort}章${section.section_title}`
	                    }
	                    return h('span',result)
	                },
	                create_employee(h,params) {
	                    return h('span',params.row.create_employee?params.row.create_employee.ename:'-')
	                }
	            },
            }
		},
		created(){
	        if(!this.enable_tbs){
	            delete this.column_keys['tbs']
	        }
	    },
		mounted () {
			this.init_data()
		},
		computed: {
			classrooms () {
				return this.$store.state.gvars.classrooms.filter(c=>c.bid==this.bid$)
			}
		},
		methods: {
			showAttendModal (item) {	
				let	title = util.sprintf('登记考勤【%s】',item.course_name)
				if(item.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',item.course_name)
				}
				
				this.$Modal.open('business/attendance/attendance/index.vue@modal',{
	                on:{
	                    'on-success':()=>{
	                        this.init_data()
	                        this.$emit('on-success')
	                    }
	                }
				})
				.then(modal=>{
					modal.set('arrange',item)
					.set('ca_id',item.ca_id)
					.show(title)
				})
			},
			hook_get_param (params) {
				params.with = 'students,one_class,textbook,textbook_section,create_employee'
				params.sid = this.id

				let search_obj = util.copy(this.search_field)
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}												
					}else if (o=='is_attendance'){
						if(property.length == 1){
	                        if(property[0] == 1) {
	                            params[o] = '[in,1,2]'
	                        }else if(property[0] == 0) {
	                            params[o] = '[in,0]'
	                        }
						}
					}else if(o=='lesson_type'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[In,%s]',property.join(','))
						}	
					}
					else{
						if(property&&property!='-1'){
							params[o] = property
						}
					}
				}				
			}
		}
	}
</script>
