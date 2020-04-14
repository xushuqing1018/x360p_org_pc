<template>
	<div v-if="hasPer('archive.lesson')">
		<div class="box box-query">
			<Button type="primary" size="small" icon="search" @click="search">查询</Button>
			<Checkbox class="ml-2" v-model="status">已结课</Checkbox>
			
			<div class="pull-right mr-4">
			    <RadioGroup v-model="listMode" type="button" size="small">
					<Radio label="table"><Icon type="ios-list-outline"></Icon></Radio>
					<Radio label="card"><Icon type="ios-folder-outline"></Icon></Radio>
					<Radio label="group"><Icon type="ios-paper-outline"></Icon></Radio>
				</RadioGroup>
			</div>
		</div>
		<div v-if="listMode == 'group'">
			<table class="modal-table">
				<thead>
					<th><div class="ivu-table-cell">课程/班级</div></th> 
					<th width="200"><div class="ivu-table-cell">可用科目</div></th>
					<th><div class="ivu-table-cell">总课时</div></th>
					<th><div class="ivu-table-cell">消耗/剩余</div></th>
					<th><div class="ivu-table-cell">导入/赠送</div></th>
					<th><div class="ivu-table-cell">转入/转出</div></th>
					<th><div class="ivu-table-cell">结转/退费</div></th>
					<th><div class="ivu-table-cell">课时状态</div></th>
					<th><div class="ivu-table-cell">是否停课</div></th>
					<th><div class="ivu-table-cell">有效期</div></th>
					<th><div class="ivu-table-cell">操作</div></th>
				</thead>
				<template v-for="(g,k) in lessonGroupData">
					<tr>
						 <td>
							<div class="ivu-table-cell">						
								{{g.lesson_name}}
							</div>
						</td> 
						<td>
							<div class="ivu-table-cell">
								-
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<span>{{g.total_lesson_hours}}</span>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>消耗：<span>{{g.use_lesson_hours}}</span></p>
								<p>剩余：{{g.remain_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>导入：{{g.import_lesson_hours}}</p>
								<p>赠送：{{g.present_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>转入：{{g.trans_in_lesson_hours}}</p>
								<p>转出：{{g.trans_out_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>结转：{{g.transfer_lesson_hours}}</p>
								<p>退费：{{g.refund_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								-
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								-
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								-
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<span class="text-info cursor" @click="expandLessonGroupList(k)" v-if="!g.expand">展开</span>
								<span class="text-info cursor" @click="collepaseLessonGroupList(k)" v-else>关闭</span>
							</div>
						</td>
					</tr>
					<tr v-show="g.expand" v-for="(item,index) in g.student_lessons" :key="k+'-'+index">
						 <td>
							<div class="ivu-table-cell">	
								|- 
								<span>ID:{{item.sl_id}}</span>					
								<span v-if="item.lid">
									<tag color="blue">课程</tag>
									{{item.lid|lesson_name}}
								</span>
								<span v-if="item.cid > 0&&item.one_class">
									<tag color="blue">班级</tag>
									{{item.one_class.class_name}}
								</span>
							</div>
						</td> 
						<td>
							<div class="ivu-table-cell">
								{{item.sj_ids|sj_ids_text}}
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<span class="text-info cursor" @click="showTotalDetail(item)">{{item.total_lesson_hours}}</span>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>消耗：<span class="text-info cursor" @click="showUseDetail(item)">{{item.use_lesson_hours}}</span></p>
								<p :class="item.remain_lesson_hours>lesson_warn_nums?'text-success':'text-danger'">剩余：{{item.remain_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>导入：{{item.import_lesson_hours}}</p>
								<p>赠送：{{item.present_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>转入：{{item.trans_in_lesson_hours}}</p>
								<p>转出：{{item.trans_out_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>结转：{{item.transfer_lesson_hours}}</p>
								<p>退费：{{item.refund_lesson_hours}}</p>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								{{item.lesson_status|lesson_status_text}}
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								{{item.is_stop|stop_status_text}}
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								{{item.expire_time_text}}<span v-if="item.expire_time">: {{item.expire_time}}</span>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Button 
									type="ghost" 
									shape="circle" 
									icon="edit" 
									title="修改可用科目及有效期" 
									@click="editInfo(item)"
									v-per="'hours.edit'"
									>
								</Button>
								<Button 
									v-if="item.use_lesson_hours > 0"
									type="ghost" 
									shape="circle" 
									icon="compose" 
									title="课时扣除转换" 
									@click="transformCourse(item)"
									>
								</Button> 
							</div>
						</td>
					</tr>
				</template>
				<tr v-if="!data.length">
					<td colspan="11">
						<div class="ivu-table-cell text-center">没有数据</div>
					</td>
				</tr>
			</table>
		</div>
		<table class="modal-table" v-if="listMode == 'table'">
			<thead>
				<th><div class="ivu-table-cell">课程/班级</div></th> 
				<th width="200"><div class="ivu-table-cell">可用科目</div></th>
				<th><div class="ivu-table-cell">总课时</div></th>
				<th v-if="enable_arrange_status"><div class="ivu-table-cell">已排</div></th>
				<th><div class="ivu-table-cell">消耗/剩余</div></th>
				<th><div class="ivu-table-cell">导入/赠送</div></th>
				<th><div class="ivu-table-cell">转入/转出</div></th>
				<th><div class="ivu-table-cell">结转/退费</div></th>
				<th><div class="ivu-table-cell">课时状态</div></th>
				<th><div class="ivu-table-cell">是否停课</div></th>
				<th><div class="ivu-table-cell">有效期</div></th>
				<th><div class="ivu-table-cell">操作</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				 <td>
					<div class="ivu-table-cell">
						<span>ID:{{item.sl_id}}</span>						
						<span v-if="item.lid">
							<tag color="blue">课程</tag>
							{{item.lid|lesson_name}}
						</span>
						<span v-if="item.cid > 0&&item.one_class">
							<tag color="blue">班级</tag>
							{{item.one_class.class_name}}
						</span>
					</div>
				</td> 
				<td>
					<div class="ivu-table-cell">
						{{item.sj_ids|sj_ids_text}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<span class="text-info cursor" @click="showTotalDetail(item)">{{item.total_lesson_hours}}</span>
					</div>
				</td>
				<td v-if="enable_arrange_status">
					<div class="ivu-table-cell">
						<span>{{item.arrange_hours}}</span>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<p>消耗：<span class="text-info cursor" @click="showUseDetail(item)">{{item.use_lesson_hours}}</span></p>
						<p :class="item.remain_lesson_hours>lesson_warn_nums?'text-success':'text-danger'">剩余：{{item.remain_lesson_hours}}</p>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<p>导入：{{item.import_lesson_hours}}</p>
						<p>赠送：{{item.present_lesson_hours}}</p>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<p>转入：{{item.trans_in_lesson_hours}}</p>
						<p>转出：{{item.trans_out_lesson_hours}}</p>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<p>结转：{{item.transfer_lesson_hours}}</p>
						<p>退费：{{item.refund_lesson_hours}}</p>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.lesson_status|lesson_status_text}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.is_stop|stop_status_text}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.expire_time_text}}<span v-if="item.expire_time">: {{item.expire_time}}</span>
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						<Dropdown style="margin-left: 20px">
							<Button type="primary" size="small">
								操作
								<Icon type="arrow-down-b"></Icon>
							</Button>
							<DropdownMenu slot="list">
								<DropdownItem v-per="'hours.edit'" @click.native="editInfo(item)">
												<Icon type="gear-b"></Icon>
												编辑
											</DropdownItem>
								<DropdownItem v-if="item.use_lesson_hours > 0" @click.native="transformCourse(item)">
												<Icon type="compose"></Icon>课时扣除转换
											</DropdownItem>
								<DropdownItem v-if="item.lesson_type!==0&&allow_empty_teachobj" @click.native="assignHour(item)" v-per="'hours.assign'">按课时排课
											</DropdownItem>
							</DropdownMenu>
						</Dropdown> 
					</div>
				</td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="11">
					<div class="ivu-table-cell text-center">没有数据</div>
				</td>
			</tr>
		</table>
		<div class="modal-table" v-if="listMode == 'card'">
			<Card v-for="(item,index) in data" :key="index" class="m-b">
				<p slot="title">
					<label>ID:</label>
					<span>{{item.sl_id}}</span>
					<label>课程:</label>
					<span v-if="item.lid">
						{{item.lid|lesson_name}}
					</span>
					<span class="gray" v-else>
						未设置课程
					</span>
					<label>班级:</label>
					<span v-if="item.cid > 0&&item.one_class">
						<tag color="blue">{{item.one_class.class_name}}</tag>
					</span>
					<span class="gray" v-else>
						未设置班级
					</span>
				</p>
				<span slot="extra">
					有效期:{{item.expire_time_text}}<em v-if="item.expire_time">({{item.expire_time}}）</em>
    <Dropdown style="margin-left: 20px">
        <Button type="primary" size="small">
            操作
            <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
            <DropdownItem v-per="'hours.edit'" @click.native="editInfo(item)">
							<Icon type="gear-b"></Icon>
							编辑
						</DropdownItem>
            <DropdownItem v-if="item.use_lesson_hours > 0" @click.native="transformCourse(item)">
							<Icon type="compose"></Icon>课时扣除转换
						</DropdownItem>
        </DropdownMenu>
    </Dropdown>
				</span>
				<ul>
					<li>
						<label>总课时/消耗课时/剩余课时:</label>
						<span class="text-info cursor" @click="showTotalDetail(item)">{{item.total_lesson_hours}}</span> / <span class="text-info cursor" @click="showUseDetail(item)">{{item.use_lesson_hours}}</span> / 
						<span :class="item.remain_lesson_hours>lesson_warn_nums?'text-success':'text-danger'">{{item.remain_lesson_hours}}</span>
						
						<label>请假限制:</label>
						<span v-if="item.leave_nums_limit == -2">不允许请假</span>
						<span v-if="item.leave_nums_limit == -1">按课程或全局限制</span>
						<span v-if="item.leave_nums_limit == 0">不限制</span>
						<span v-if="item.leave_nums_limit > 0">{{item.leave_nums_limit}}次</span>

						<span v-if="item.leave_remain_nums > -1">
							，剩余请假:{{item.leave_remain_nums}}次
						</span>
						
					</li>
					<li><label></label>+ 导入/赠送/转入：</label>{{item.import_lesson_hours}} / {{item.present_lesson_hours}} / {{item.trans_in_lesson_hours}}</li>
					<li><label>- 转出/结转/退费：</label>{{item.trans_out_lesson_hours}} / {{item.transfer_lesson_hours}} / {{item.refund_lesson_hours}}</li>
					<li><label>可用科目:</label>{{item.sj_ids|sj_ids_text}}</li>
					
				</ul>
			</Card>
		</div>
		
		<div class="mt-3 text-right">
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
</template>

<script>
	import Vue from 'vue'
	import moment from 'moment'
	import {_} from '@/libs/util'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	const KC = '__SRL_MODE__'		//student record lesson mode
	
	export default{
		mixins: [grid,common,globals],
		props: {
			sid: {
				type: [Number,String],
				default:0
			}			
		},
		data () {
			return {
				listMode:'table',
				data: [],
				lessonGroupData:{},
				classGroupData:{},
				subjectGroupData:{},
				status: false,
				rest_api: 'student_lessons',
				id: this.sid > 0?this.sid:this.$route.params.id
			}
		},
		created(){
			let mode = Vue.localStorage.get(KC)
			if(mode && ['table','card','group'].indexOf(mode) !== -1){
				this.listMode = mode
			}
		},
		mounted () {
			this.init_data()
		},
		watch: {
			'$route.params.id':function(id) {
				this.id = id
				this.init_data()
			},
			listMode(newVal,oldVal){
				Vue.localStorage.set(KC,this.listMode)
			}
		},
		methods: {
			 transformCourse (item)	{
	        	this.$Modal.open('business/student/record/lesson/correct-lesson-hour.vue@modal',{
	        		props: {
								info: item
	        		},
	        		on: {
	        			'on-success':() => {
	        				this.init_data()
	        			}
	        		}
	        	})
	        	.then(modal => {
							modal
							.set("data", this.data)
							.show(util.sprintf('【%s】课时扣除转换',item.student.student_name))
	        	})
	     				
			},	
			showTotalDetail (item) {
				this.$Modal.open('business/student/record/total-hour-modal.vue',{
					props: {
						'sl-id': item.sl_id
					},
					on: {
						'on-success':() =>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					let title = item.lid?this.$filter('lesson_name')(item.lid,'-'):this.$filter('subject_name')(item.sj_id,'-')
					modal.show(util.sprintf('【%s】课时来源明细',title))
				})
			},
			showUseDetail (item) {
				this.$Modal.open('business/student/record/lesson-hour-modal.vue',{
					props: {
						'sl-id': item.sl_id
					},
					on: {
						'on-success':() =>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					let title = item.lid?this.$filter('lesson_name')(item.lid,'-'):this.$filter('subject_name')(item.sj_id,'-')
					modal.show(util.sprintf('【%s】课耗记录',title))
				})
			},
			assignHour (item) {
				this.$Modal.open('business/student/record/lesson/assign-hour.vue@modal',{
					props: {
						'student-lesson': item
					},
					on: {
						'on-success':() => {
							this.init_data()
						}
					}
				})
				.then(modal => {
					modal.show('按课时排课')
				})
			},
			editInfo (item) {
				this.$Modal.open('business/student/record/lesson-operate.vue@modal',{
					props: {
						'sl-id': item.sl_id
					},
					on: {
						'on-success':() =>{
							this.init_data()
						}
					}
				})
				.then(modal => {
					let title = item.lid?this.$filter('lesson_name')(item.lid,'-'):this.$filter('subject_name')(item.sj_id,'-')
					modal
					.set('info',item)
					.set('lessonEnd',item.lesson_status==2)
					.set('sl_id',item.sl_id)
					modal.show(util.sprintf('【%s】编辑可用科目及有效期',title))
				})
			},
			hook_get_param (param) {
				param.sid = this.id
				param.sll = 1		//show leave limit
				param.with =  'one_class'
				if(!this.status) {
					param.lesson_status = '[in,0,1]'
				}
			},
			deal_data(data){
				this.initGroupData(data.list)
				return data.list
			},
			newLessonGroupData(lid){
				let lesson_name = this.$filter('lesson_name')(lid)
				return {
					lid:lid,
					lesson_name:lesson_name,
					total_lesson_hours:0,
					remain_lesson_hours:0,
					use_lesson_hours:0,
					import_lesson_hours:0,
					transfer_lesson_hours:0,
					refund_lesson_hours:0,
					trans_in_lesson_hours:0,
					trans_out_lesson_hours:0,
					present_lesson_hours:0,
					student_lessons:[],
					expand:false
				}
			},
			newClassGroupData(cid,class_name){
				
				return {
					cid:cid,
					class_name:class_name,
					total_lesson_hours:0,
					remain_lesson_hours:0,
					use_lesson_hours:0,
					import_lesson_hours:0,
					transfer_lesson_hours:0,
					refund_lesson_hours:0,
					trans_in_lesson_hours:0,
					trans_out_lesson_hours:0,
					present_lesson_hours:0,
					student_lessons:[],
					expand:false
				}
			},
			initGroupData(list){
				this.lessonGroupData = {}
				this.classGroupData = {}
				list.forEach(item=>{
					if(!_.isDefined(this.lessonGroupData[item.lid])){
						this.$set(this.lessonGroupData,item.lid,this.newLessonGroupData(item.lid))
					}

					this.lessonGroupData[item.lid]['total_lesson_hours'] += util.float(item.total_lesson_hours)
					this.lessonGroupData[item.lid]['remain_lesson_hours'] += util.float(item.remain_lesson_hours)
					this.lessonGroupData[item.lid]['use_lesson_hours'] += util.float(item.use_lesson_hours)
					this.lessonGroupData[item.lid]['import_lesson_hours'] += util.float(item.import_lesson_hours)
					this.lessonGroupData[item.lid]['transfer_lesson_hours'] += util.float(item.transfer_lesson_hours)
					this.lessonGroupData[item.lid]['refund_lesson_hours'] += util.float(item.refund_lesson_hours)
					this.lessonGroupData[item.lid]['trans_in_lesson_hours'] += util.float(item.trans_in_lesson_hours)
					this.lessonGroupData[item.lid]['trans_out_lesson_hours'] += util.float(item.trans_out_lesson_hours)
					this.lessonGroupData[item.lid]['present_lesson_hours'] += util.float(item.present_lesson_hours)
					this.lessonGroupData[item.lid]['student_lessons'].push(item)

					if(item.cid > 0 && item.one_class ){
						if(!_.isDefined(this.classGroupData[item.cid])){
							this.classGroupData[item.cid] = this.newClassGroupData(item.cid,item.one_class.class_name)
						}
						this.classGroupData[item.cid]['total_lesson_hours'] += util.float(item.total_lesson_hours)
						this.classGroupData[item.cid]['remain_lesson_hours'] += util.float(item.remain_lesson_hours)
						this.classGroupData[item.cid]['use_lesson_hours'] += util.float(item.use_lesson_hours)
						this.classGroupData[item.cid]['import_lesson_hours'] += util.float(item.import_lesson_hours)
						this.classGroupData[item.cid]['transfer_lesson_hours'] += util.float(item.transfer_lesson_hours)
						this.classGroupData[item.cid]['refund_lesson_hours'] += util.float(item.refund_lesson_hours)
						this.classGroupData[item.cid]['trans_in_lesson_hours'] += util.float(item.trans_in_lesson_hours)
						this.classGroupData[item.cid]['trans_out_lesson_hours'] += util.float(item.trans_out_lesson_hours)
						this.classGroupData[item.cid]['present_lesson_hours'] += util.float(item.present_lesson_hours)
						this.classGroupData[item.cid]['student_lessons'].push(item)
					}

				})

				
			},
			expandLessonGroupList(k){
				this.lessonGroupData[k].expand = true
				console.log(k)
				//this.$set(g,'expand',true)
			},
			collepaseLessonGroupList(k){
				this.lessonGroupData[k].expand = false
				//this.$set(g,'expand',false)
			}
		}
	}
</script>
