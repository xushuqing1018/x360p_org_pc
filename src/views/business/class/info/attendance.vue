<template>
	<div class="c-grid">
		<div class="toolbar">	
			<Button type="primary" @click="openAttendance" icon="plus">登记考勤</Button>
		</div>
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
		            <Table 		            	
		            	v-loading.like="'class_attendances'" 
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
		                	transfer
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
    	<attendance-modal ref="attendanceModal" @on-success="init_data"></attendance-modal>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import attendanceModal from 'v%/business/attendance/attendance/index.vue' 
	
	export default{
		mixins: [grid,common,globals],
		props: {
			cid: {
				type: [String,Number],
				default: ()=>{
					return 0
				}
			},
			className: String
		},
		components: {			
			attendanceModal
		},
		data () {
			return {
				rest_api: 'class_attendances?with=cls,course_arrange&cid='+this.cid,
				pk: 'catt_id',
				column_keys: {
					cid: {
						title: '班级',
						show: true
					},
					lid: {
						title: '课程',
						show: true
					},
					class_student_nums: {
						title: '班级人数',
						show: true
					},
					need_nums: {
						title: '应到人数',
						show: true
					},
					in_nums: {
						title: '实到人数',
						show: true
					},
					sj_id: {
						title: '科目',
						show: true
					},
					eid: {
						title: this.$filter('translate')('老师'),
						show: true
					},
					second_eid: {
						title: '助教',
						show: false
					},
					int_day: {
						title: '考勤日期',
						show: true
					},
					time_section: {
						title: '上课时段',
						show: true
					},						
					lesson_remark: {
						title: '排课备注',
						show: true
					},			
					attendance: {
						title: '考勤详情',
						show: true
					},			
				},
				column_render: {					
					cid (h,params) {
						return h('span',params.row.cls.class_name)
					},
					attendance (h,params) {
						return h('a', {
							class: 'text-info',
							on: {
								click: () => {
									this.attendance_record(params.row)
								}
							}
						},'详情')
					},
					eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.eid))
					},
					second_eid (h,params) {
						return h('span',this.$filter('employee_name')(params.row.second_eid)||'未设置')
					},
					int_day (h,params) {
						return h('span',this.$filter('int_date')(params.row.int_day))
					},
					time_section (h,params) {
						return h('span',
							util.sprintf('%s--%s',
								this.$filter('int_hour')(params.row.int_start_hour),
								this.$filter('int_hour')(params.row.int_end_hour)))
					},
					lesson_remark (h,params) {
						return h('span',params.row.lesson_remark||'-')
					}
				},
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			openAttendance() {
				this.$Modal.open('business/attendance/attendance-list.vue@modal',{
					props: {
						'search-params':{
							cid: this.cid
						}
					},
					on: {
						'on-success': ()=>{
							this.init_data()
						}
					}
				})
                .then(modal=>{
                    modal.vuec.set('mode','view')
                    .show(`按排课登记考勤【${this.className}】`,'add')
                })
			},
			attendance_record (row) {
				let title = this.setTitle(row),
					arrange = util.copy(row.course_arrange||{})
					arrange.one_class = row.cls||{}
				
				arrange.lesson_remark = row.lesson_remark
				this.$Modal.open('business/attendance/attendance/index.vue@modal?ca_id='+row.ca_id)
				.then(modal=>{
					
					modal.set('arrange',arrange)
					.set('class_attendance',row)
					.show('查看考勤【'+title+'】','record')
				})
			},
			setTitle (row) {
				let title = '',
					mapTitle = {1:'一对一',2:'一对多'}
					
				if(row.lesson_type>0){
					title = mapTitle[row.lesson_type]						
				}else{
					if(row.ca_id>0&&row.course_arrange!=null){
						if(row.course_arrange.is_trial===1){
							title = row.course_arrange.name
						}else{
							if(row.cls!=null){
								title = row.cls.class_name
							}
						}
					}else{
						title = '班课自由考勤'
					}
				}
				return title
			},
		}
	}
	
</script>
