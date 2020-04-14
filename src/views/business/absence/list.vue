<template>
	<div class="c-grid">
		<div class="box box-query">
			<Form ref="ref_search" :model="search_field" :label-width="70" class="filter-form row">
				<Form-item label="学员姓名" prop="sid" class="col-md-3 col-sm-6">
					<select-student v-model="search_field.sid" clearable></select-student>
				</Form-item>
				<Form-item label="上课时间" prop="int_day" class="col-md-3 col-sm-6">
					<date-range-picker 
						v-model="search_field.int_day"
						@on-change="init_data"
						style="width:100%">
					</date-range-picker>
				</Form-item>
				<Form-item :label="label_teacher" prop="teach_eid" class="col-md-3 col-sm-6">
					<select-employee :rid="1" v-model="search_field.teach_eid"></select-employee>
				</Form-item>
				<Form-item label="课程" prop="lid" class="col-md-3 col-sm-6">
					<select-lesson v-model="search_field.lid" clearable></select-lesson>
				</Form-item>	
				<template v-if="searchExpand">
					<Form-item label="班级" prop="cid" class="col-md-3 col-sm-6">
						<select-class v-model="search_field.cid"></select-class>
					</Form-item>
					<Form-item label="是否请假" prop="is_leave" class="col-md-3 col-sm-6">
						<Select v-model="search_field.is_leave">
							<Option :value="-1">不限</Option>
							<Option :value="0">未请假</Option>
							<Option :value="1">已请假</Option>
						</Select>
					</Form-item>
					<Form-item label="扣课时" prop="is_consume" class="col-md-3 col-sm-6">
						<Select v-model="search_field.is_consume">
							<Option :value="-1">不限</Option>
							<Option :value="0">未扣</Option>
							<Option :value="1">已扣</Option>
						</Select>
					</Form-item>
					<Form-item label="缺勤原因" prop="remark" class="col-md-3 col-sm-6">
						<Input v-model="search_field.remark" placeholder="请输入缺勤原因"></Input>
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

                	<export-button res="student_absences" :params="params" v-per="'absence.export'"></export-button>


                	<RadioGroup v-model="search_field.status" class="ml-3">
                		<Radio :label="0" class="m-0">				            
				            <span>未安排补课</span>
				        </Radio>
				        <Radio :label="1" class="m-0">				            
				            <span>已安排补课</span>
				        </Radio>
				        <Radio :label="2" class="m-0">				            
				            <span>已补课</span>
				        </Radio>
			        </RadioGroup>
                </Col>
           </Row>			
		</div>
		<div class="box box-result">
			<div class="toolbar">	
				<Button type="primary" @click="makeup" icon="plus">批量补课</Button>				
				<filter-column :keys="column_keys"></filter-column>
			</div>
			<div class="content">
				<div class="content-body">
		            <Table 
		            	@on-selection-change="selectedChange"
		            	v-loading.like="'student_absences'"
		            	ref="tableExcel"
		            	:data="data" 
		            	:stripe="true" 
		            	:page="pageIndex" 
		            	:columns="columns" 
		            	:show-header="true" 
		            	:page-size="pageSize" 
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
		                	@on-page-size-change="pagesize">
		                </Page>
		            </div>
		        </div>
			</div>
		</div>
		<make-up-modal ref="makeup" @on-success="makeupSuccess"></make-up-modal>
	</div>
</template>

<script>
	import util,{_} from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	import makeUpModal from '../makeup/info-modal.vue'
	import selectClass from 'c%/SelectClass.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import selectStudent from 'c%/SelectStudent.vue'
	import selectEmployee from 'c%/SelectEmployee.vue'
	import dateRangePicker from 'c%/DateRangePicker.vue'	

	import ExportButton from 'c%/ExportButton.vue'
	
	export default{
		mixins: [grid,common,globals],
		components: {
			makeUpModal,
			selectClass,
			selectStudent,
			selectEmployee,
			dateRangePicker,
			SelectLesson,
			ExportButton
		},
		data () {
			return {
				rest_api: 'student_absences',
				pk: 'sa_id',
				search_field: {
					sid: 0,
					cid: 0,
					is_leave: -1,
					status: 0,
					int_day: [],
					lid: 0,
					is_consume:-1,
					remark:'',
					teach_eid: 0					
				},
				selectedData: {},
				column_keys:{
					checkboxs: {
						type: 'selection',
                        width: 60,
                        align: 'center',
                        show: true
					},
					sid: {
						title: '学员姓名',
						show: true
					},
					lid: {
						title: '课程/班级',
						show: true
					},
					bid:{
						title:'校区',
						show: false
					},
					pj_id:{
						title:'项目',
						show: false
					},
					int_day: {
						title: '缺课时间',
						sortable: 'custom',
						show: true
					},
					eid: {
						title: '上课'+this.$filter('translate')('老师'),
						show: true
					},
					is_leave: {
						title: '是否请假',
						show: true
					},
					is_consume: {
						title: '扣课时',
						show: true
					},
					remark: {
						title: '缺勤原因',
						show: true
					},		
					status: {
						title: '补课安排',
						show: true
					},
					operate: {
						title: '操作',
						show: false,
						width: 80
					}
				},
				column_render: {					
					sid (h,params) {
						return h('span',params.row.student.student_name)
					},
					lid (h,params) {
						let result = '',
							map_type = {
								0:{label:'班课',color:'blue'},
								1:{label:'一对一',color:'green'},
								2:{label:'一对多',color:'yellow'}
							},
							obj = map_type[params.row.lesson_type],
							tag = h('Tag',{
								props: {
									type: 'border',
									color: obj.color
								}
							},obj.label)						
						
						if(params.row.cid>0){
							result = params.row.one_class.class_name
						}else{
							result = this.$filter('lesson_name')(params.row.lid)
						}				
						
						return h('span',[tag,result])
					},
					eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.eid))
					},
					int_day (h,params) {
						return h('span',
							util.sprintf('%s %s',
								this.$filter('int_date')(params.row.int_day),
								this.$filter('int_hour')(params.row.int_start_hour)
							))
					},
					is_leave (h,params) {
						let	map = {0:'未请假',1:'已请假'},
							result = map[params.row.is_leave]
						return h('span',result)
					},
					is_consume (h,params) {
						let map = { 0: '未扣', 1: '已扣' },
							map_color = { 0: 'text-danger', 1: 'text-success' }
						
						return h('span',
								{'class':map_color[params.row.is_consume]},
								map[params.row.is_consume]
								)
					},
					remark (h,params) {
						return h('span',params.row.remark||'—')
					},
					status (h,params) {
						let map = {0:'未补课',1:'已安排',2:'已补课'},
							map_class = {0:'text-danger',1:'text-info',2:'text-success'}
						let children = []
						children.push(h('span',
									{'class':map_class[params.row.status]},
									map[params.row.status]
								))
						if(params.row.makeup){
							let makeup_text = util.sprintf("%s %s",
								this.$filter('int_date')(params.row.makeup.int_day),
								this.$filter('int_hour')(params.row.makeup.int_start_hour)
								)
							children.push(h('p',makeup_text))
						}
						return h('div',children)
					},
					operate (h,params){
						return h('Button',{
							props: {
								type: 'ghost',
								shape: 'circle',
								icon: 'ios-trash'
							},
							attrs: {
								title: '撤销'
							},
							on: {
								click: ()=>{
									this.doCancel(params.row)
								}
							}
						})
					}
				}
			}
		},
		watch: {
			'search_field.status': function (val) {				
				this.column_keys.checkboxs.show = val===0
				this.column_keys.operate.show = val===1
				this.init_data()
			}
		},
		created(){
	        if(!this.enable_project){
	        	delete this.column_keys['pj_id']
	        }
		},
		mounted () {
			this.init_data()
		},
		computed: {
			selected () {
				let list = this.selectedData,
					result = []
					
				if(!_.isEmpty(list)){
					for(let i in list){
						result = result.concat(list[i])
					}				
				}
					
				return result
			}
		},
		methods: {			
			makeupSuccess () {
				this.init_data()
				this.selectedData = {}
			},
			doCancel (row) {
				let tip = util.sprintf('确定撤销【%s】的补课安排吗？',row.student.student_name)
				this.confirm(tip)
				.then(()=>{
					this.$rest('student_absences/'+row.sa_id+'/docancel')
					.post()
					.success(data=>{
						this.$Message.success('撤销成功！')
						this.init_data()
					}).error(response=>{
						this.$Notice.error({
							title: '失败',
							desc: response.body.message||'撤销失败'
						})
					})
				})
			},
			selectedChange (data) {
				this.$set(this.selectedData,this.pageIndex,data)
			},
			makeup () {
				if(this.check()){
					let [sa_ids,sids,student_names]= [[],[],'']
						
					if(this.selected.length>0){
						this.selected.forEach(d=>{
							if(sids.indexOf(d.student.sid)===-1){
								sids.push(d.student.sid)
								sa_ids.push(d.sa_id)	
							}else{
								student_names += util.sprintf('【%s】,',d.student.student_name)
							}
									
						})
					}
					student_names = student_names.substring(0,student_names.length-1)
					
					if(student_names){
						this.$Message.error(student_names+'学员重复！')
						return false
					}
					let params = {
						sa_ids: sa_ids,
						slv_ids: []
					}
					
					this.$r('makeup')
					.set('params',params)
					.set('selected',this.selected)
					.show('补课安排','add')
				}
			},
			check () {				
				let data = this.selected,
					err = [],
					lids = []
					if(!this.allow_different_lesson_makeup){
						if(data.length>0){
							data.forEach((d,index)=>{
								lids.push(d.lid)
								if(index>0&&d.lid!=data[index-1].lid){
									err.push(d)		
								}
							})
						}
					}
				
				if(err.length>0){
					let desc = ''
					err.forEach(e=>{
						desc += e.student.student_name+','
					})
					desc = desc.substring(0,desc.length-1)
					desc += '与其它学员课程不同，不能同时补课'
					this.$Notice.warning({
						title: '提示',
						desc: desc
					})
					return false
				}
				return true
			},
			hook_get_param (params) {
				params.with = 'student,one_class'
				let search_obj = util.copy(this.search_field)
//				params.is_consume = 0
				for(let o in search_obj) {
					let property = search_obj[o]
					if(o=='int_day'){
						if(property!=','&&property.length>0){
							params[o] = util.sprintf('[Between,%s]',property.join(','))
						}
					}else if(o=='is_leave' || o == 'is_consume'){
						if(property!=-1){
							params[o] = property	
						}
					}else if(o == 'remark'){
						if(property != ''){
							params[o] = property
						}
					}else{
						if(o=='status'||(property&&property!=-1)){
							params[o] = property	
						}
					}									
				}
			},
			deal_data (data) {
				let list = data.list
				
				if(this.selected.length>0&&list.length>0){
					
					list.forEach(l=>{
						if(this.selected.findIndex(s=>s.sa_id==l.sa_id)>-1){
							this.$set(l,'_checked',true)
						}
					})
					
				}
				
				return list
			},
			resetSearch () {
				this.$form('ref_search').reset()
				this.init_data()
			},
		}
	}
	
</script>
