<template>
	<div>
		<data-ready ref="dr" :data="[classArrangesUrl]" :cache="false" @ready="dataReady">
			<div class="list-body-wrap" v-loading.like="'arranges'" style="max-height: 600px;overflow: auto">	
				<table class="modal-table class-list">
					<thead>
						<tr>
							<th><div class="ivu-table-cell">序号</div></th>
							<th><div class="ivu-table-cell">日期</div></th>
							<th><div class="ivu-table-cell">星期</div></th>
							<th><div class="ivu-table-cell">时间</div></th>
							<th><div class="ivu-table-cell">课时数</div></th>
							<th><div class="ivu-table-cell">状态</div></th>
							<th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
							<th><div class="ivu-table-cell">{{'助教'|translate}}</div></th>
							<th><div class="ivu-table-cell">教室</div></th>
							<th v-per="'class.arrange'"><div class="ivu-table-cell">操作</div></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item,key) in orderBy(data,'int_day')">
							<td>
								<div class="ivu-table-cell">
									{{key+1}}
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<span class="text-info cursor" v-if="classInfo.class_type==1" @click="attendanceView(item)">{{item.int_day|int_date}}</span>
									<span v-else>{{item.int_day|int_date}}</span>									
									
								</div>
							</td>
							<td>
								<div class="ivu-table-cell">
									<Tag type="border" color="blue">
									{{item.int_day|int_week}}
									</Tag>
								</div>
							</td>
							<td><div class="ivu-table-cell">{{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</div></td>
							<td><div class="ivu-table-cell">{{item.consume_lesson_hour}}</div></td>
							<td>
								<div class="ivu-table-cell">
			    					<Tag :color="item.is_attendance===1?'blue':'green'" v-if="item.is_attendance>0">{{item.is_attendance===1?'部分考勤':'已考勤'}}</Tag>
			    					<Tag v-else>待考勤</Tag>
								</div>
							</td>
							<td><div class="ivu-table-cell">{{item.teach_eid|employee_name}}</div></td>
							<td><div class="ivu-table-cell">{{item.second_eids|enames('-')}}</div></td>
							<td><div class="ivu-table-cell">{{item.cr_id|classroom_name}}</div></td>
							<td v-per="'class.arrange'">
			    				<div class="ivu-table-cell">
			    					<a class="text-info" v-if="item.is_attendance>0" @click="attendance_record(item)">查看</a>
			    					<template v-else>
			    						<a class="text-info" @click="attendance_record(item)">考勤</a> |
			    						<a class="text-info" @click="edit(item)">编辑</a> |
										<a class="text-danger" @click="del(item.ca_id)">删除</a>
			    					</template>
			    				</div>
			    			</td>
						</tr>
						<tr v-if="data && data.length == 0">
							<td colspan="10"><div class="text-center ivu-table-cell">暂无排课~</div></td>
						</tr>
					</tbody>
				</table>
			</div>
		</data-ready>

		<class-arrange-info-modal
		:object-fixed="object_fixed"
		@save="refreshAndEmit"
		ref="classArrangeInfoModal"
		>
		</class-arrange-info-modal>
		<attendance-modal ref="attendanceModal" @on-success="refreshAndEmit"></attendance-modal>
	</div>
</template>
<script>
import {oneOf} from '@/libs/util'
import util from '@/libs/util'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import dataReady from 'c%/DataReady.vue'
import classArrangeInfoModal from './arrange/info-modal.vue'
import attendanceModal from 'v%/business/attendance/attendance/index.vue' 
export default {
	name:'classArrangesList',
	mixins:[common,globals],
	components:{
		dataReady,
		attendanceModal,
		classArrangeInfoModal
	},
	props:{
		classInfo:{
			type:Object,
			default(){
				return {}
			}
		}
	},
	data(){
		return {
			data:[]
		}
	},
	computed:{
		classArrangesUrl(){
			if(this.classInfo.cid > 0){
				return 'classes/'+this.classInfo.cid+'/arranges'
			}
			return ''
		},
		object_fixed() {
			let obj = {
				int_day: '',
				ts_array: [],
				teach_eid: 0,
				cr_id: 0
			}
			obj.class_item = this.classInfo
			return obj
		}
	},
	methods:{
		attendanceView (item) {
			this.$Modal.open('business/arrange/schedule/detail.vue@modal',{
				on: {
					'on-success':()=>{
						this.refreshAndEmit()
					}
				}
			})
			.then(modal => {
				modal.vuec
				.set('ca_id',item.ca_id)
				.show('排课详情','view')
			})
		},
		refreshAndEmit() {
			this.$emit('save')
			this.refreshData()
		},
		dataReady(rs){
			this.data = rs[0].list
		},
		add(){
			let classInfo = util.copy(this.classInfo)
			this.$r('classArrangeInfoModal')
			.show(util.sprintf('添加单次排课:%s',this.classInfo.class_name),'add')
		},
		attendance_record (row) {
			let title = this.classInfo.class_name			
											
			this.$r('attendanceModal')
			.set('arrange',row)
			.set('ca_id',row.ca_id)
			.show('考勤记录【'+title+'】','add')
			
		},		
		edit(item){
			let obj = util.copy(item),
				ts_array = [],
				classInfo = {
            		cid: this.classInfo.cid,
            		lid: this.classInfo.lid,
            		class_name: this.classInfo.class_name
            	},
            	tip = util.sprintf(
					'调整排课时间:%s %s~%s',
					this.$filter('int_date')(item.int_day),
					this.$filter('int_hour')(item.int_start_hour),
					this.$filter('int_hour')(item.int_end_hour)
				)
				
		 	ts_array.push(this.$filter('int_hour')(obj.int_start_hour))
            ts_array.push(this.$filter('int_hour')(obj.int_end_hour))
			obj.int_day = String(obj.int_day)
						
			this.$r('classArrangeInfoModal')
			.set('classInfo',classInfo)
            .set('ts_array',ts_array)
			.set('info',obj)
			.show(tip,'edit')
			
		},
		del(ca_id){
			this.confirm('您确定要删除本次排课吗?')
            .then(()=>{
            	this.$rest('course_arranges').delete(ca_id)
				.success(response=>{
					this.$Message.success('删除成功!')
					this.refreshAndEmit()
				})
				.error(response=>{
					this.error(response.body.message)
				})
            })		
		},
		refreshData(){
			this.$r('dr').refreshData(this.classArrangesUrl)
			.then(rs=>{
				this.dataReady([rs])
			})
		}
	}
}
</script>