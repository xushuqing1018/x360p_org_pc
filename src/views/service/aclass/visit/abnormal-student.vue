<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		<div class="c-grid">		
			<Tabs v-model="tab">
				<TabPane label="请假异常" name="1">				
				</TabPane>
				<TabPane label="考勤异常" name="2">				
				</TabPane>
				<TabPane label="课时预警" name="3">				
				</TabPane>
				<TabPane label="投诉建议" name="4">
				</TabPane>
				<!--<TabPane label="作业异常" name="5">-->				
					<!--<tab-homework :info="config.return_visit" ref="homework"></tab-homework>-->
				<!--</TabPane>-->
				
			</Tabs>
			<div class="box box-query">
				<div class="clearfloat" style="height:32px;line-height: 32px;">					
		    		<div class="pull-left mr-3" v-if="tab==1">
		    			请假		    			
		    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.ask_leave_times" :min="1" v-if="editable"></InputNumber>
		    			<a class="text-primary font-2xl ml-3 mr-3" @click="editable=true" v-else>{{config.return_visit.ask_leave_times}}</a>
		    			次以上的学员
		    		</div>
		    		<div class="pull-left mr-3" v-if="tab==2">
		    			缺勤
		    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.absence_times" :min="1" v-if="editable"></InputNumber>
		    			<a class="text-primary font-2xl ml-3 mr-3" @click="editable=true" v-else>{{config.return_visit.absence_times}}</a>
		    			次以上的学员
		    		</div>
		    		<div class="pull-left mr-3" v-if="tab==3">
		    			<template v-if="config.return_visit.student_lesson_remain_times">
			    			剩余课时小于
			    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.student_lesson_remain_times" :min="0" v-if="editable"></InputNumber>
			    			<a class="text-primary font-2xl ml-3 mr-3" @click="editable=true" v-else>{{config.return_visit.student_lesson_remain_times}}</a>
			    			的学员
		    			</template>
		    			<template v-else>
		    				剩余课时低于
			    			<InputNumber class="ml-3" :value="getRate()" :step="10" :min="0" :max="100" @on-change="setRate" v-if="editable"></InputNumber>
			    			<a class="text-primary font-2xl ml-3 mr-3" @click="editable=true" v-else>{{getRate()}}</a>
			    			<span class="mr-3">%</span>
			    			的学员
		    			</template>
		    			
		    			<Button class="ml-3" type="ghost" icon="arrow-swap" @click="changeLessonConfig" v-if="editable">更换条件</Button>
					</div>	   
		    		<!--<div class="col-md-3" v-if="tab==4">
		    			投诉
		    			<InputNumber class="ml-3 mr-3" v-model="config.return_visit.not_hand_in_homework_times" :min="1" v-if="editable"></InputNumber>
		    			<a class="text-primary ml-3 mr-3" v-else>{{config.return_visit.not_hand_in_homework_times}}</a>
		    			次以上的学员
		    		</div>    -->
		    		<div class="pull-left">
		    			<template v-if="tab!=4">
							<template v-if="editable">
								<Button class="ml-2" type="ghost" icon="checkmark" @click="saveAndInit">确定</Button>
								
								<Button class="ml-2" type="ghost" icon="close" @click="editable=false">取消</Button>
							</template>
						</template>
						
		    			<Button class="ml-2" type="primary" icon="ios-search" @click="init_data">查询</Button>	    			
		    			<Button class="ml-2" type="primary" @click="exportExcel('特别关注学员列表')" icon="ios-download-outline" v-per="'reports.export'">导出</Button>	    			
		    		</div>
		    	</div>
	    	</div>
			
			<div class="box box-result">
				<div class="content">
		            <div class="content-body">
		                <Table 
	            		ref="tableExcel"
	                    v-loading="'classes'" 
	                    :page-size="pageSize" 
	                    :page="pageIndex" 
	                    :stripe="true" 
	                    :highlight-row="true"
	                    :show-header="true" 
	                    :data="data" 
	                    :columns="columns" 
	                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
	                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT"
	                    @on-current-change="currentChange"> 
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
		
		<div slot="footer">
			<span class="pull-left">已选择：
				<span class="text-primary">{{currentStudent.student_name}}</span>
			</span>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>		
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import config from '@/libs/config.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins:[ grid,modal,common,config,globals ],
		components: {
			
		},
		props: {
			sid: {
				type: [String,Number],
				default: 0
			}
		},
		data () {
			return {
				cfg_name: 'params',
				editable: false,
				rest_api: 'student_return_visits/students',
				tab: '1',
				currentStudent: {
					student_name:''
				},
				config: {	
					return_visit: {}
				},
				column_keys: {
					sname: {
						title: '姓名',
						show: true
					},
					lesson_name: {
						title: '课程名称',
						show: true
					},
					count_num: {
						title: '请假次数',
						show: true
					},
					return_visit: {
						title: '回访次数',
						show: true
					},
					first_rel: {
						title: '联系人',
						show: true
					},
					first_tel: {
						title: '手机号',
						show: true
					},					
				},
				column_render: {
					sname(h,param) {
						return h('span',param.row.student.student_name)
					},
					count_num (h,param) {
						let result = h('span',param.row.count_num)
						
						if(this.tab==4){
							result = h('a',{
								'class': 'x-a-link text-primary',
								on:{
									click: ()=>{
										this.showVisit(param.row)
									}
								}
							},param.row.count_num)
						}
						return result
					},
					first_rel (h,param) {
						let rel = param.row.student.first_family_rel,
							rel_text = this.$filter('family_rel')(rel)
							
						return h('Tag',{
									props: {
										type: 'border',
										color: 'green'
									}
								}, rel_text)
					},
					first_tel(h,param) {	
						return h('span',param.row.student.first_tel)
					},
					return_visit(h,param) {						
						return h('span',param.row.student.student_return_visit.length)
					},
				}				
			}
		},
		watch: {
			tab: function (val) {
				let mapTitle = {'1':'请假次数','2':'缺勤次数','3':'剩余课次','4':'投诉次数'}
				
				this.init_data()				
				this.column_keys.count_num.title = mapTitle[val]
				this.editable = false
			},
			'modal$.show': function (val) {
				if(this.sid==0){
					this.currentStudent = { student_name:'' }		
					this.$refs.tableExcel.clearCurrentRow()
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			currentChange (currentRow,oldCurrentRow) {
				if(currentRow&&currentRow.student){
					this.currentStudent = currentRow.student
				}
			},
			showVisit (row) {
				let title = util.sprintf('学员【%s】的投诉记录',row.student.student_name)
				this.$r('visit')
				.set('sid',row.student.sid)
				.init()
				.show(title,'add')
			},
			addInfo (row,tab) {
				tab = tab || 'info'
				let title = util.sprintf('添加【%s】回访',row.student.student_name)
				
				this.$r('info')
				.set('sid',row.student.sid)
				.set('tab',tab)
				.show(title,'add')				
			},
			hook_get_param (param) {
				let mapTyp = {'1':'ask_leave_times','2':'absence_times','3':'student_lesson_remain_times','4':'advice'},
					field = mapTyp[this.tab],
					value = this.config.return_visit[field]
				if(field=='student_lesson_remain_times'&&value==0){
					field = 'student_lesson_remain_rate'
				}
				
				value = this.config.return_visit[field]
				
				param.type = field
				param[field] = value
			},
			getRate () {
				return this.config.return_visit.student_lesson_remain_rate*100
			},
			setRate (val) {
				this.config.return_visit.student_lesson_remain_rate = parseFloat(val/100).toFixed(2)
			},
			changeLessonConfig () {
				let result = this.config.return_visit.student_lesson_remain_times>0?0:5 
				
				this.config.return_visit.student_lesson_remain_times = result				
			},
			saveAndInit () {
				this.handleSubmit()
				this.editable = false
			},
			ok () {
				this.$emit('on-selected',this.currentStudent)
				this.close()
			}
		}
	}
</script>


<style>
</style>