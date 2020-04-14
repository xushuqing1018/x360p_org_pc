<template>
	<table class="modal-table">
		<thead>			
			<th width=""><div class="ivu-table-cell">排课规律</div></th>
			<th width="140px"><div class="ivu-table-cell">上课时段</div></th>			
			<th width=""><div class="ivu-table-cell">排课要素</div></th>			
			<th width="100px"><div class="ivu-table-cell">操作</div></th>
		</thead>
		<tr v-for="(item,index) in scheduleList" :key="index">
			<td>
				<div class="ivu-table-cell">
					<template v-if="item.end_type==1">
						<div>
							<p>
								按日期排课：
								<Tag color="blue" @click="previewSchedule(item.list)">{{item.int_start_day}} ~ {{item.int_end_day}}</Tag>								
							<p>
							<p>
								循环方式：
								<Tag>
									{{map_end_type_date[item.loop_type]}}
								</Tag>
								共
								<Tag color="blue" @click="previewSchedule(item.list)">
									{{item.list.length}}
								</Tag> 
								次
							</p>
						</div>
						<Tag color="green" v-for="week in item.week_days">
							{{map_week_day[week]}}						
						</Tag>
					</template>
					<template v-else>
						<div>
							<p>
								按次数排课：共
								<Tag color="blue" @click="previewSchedule(item.list)">
									{{item.list.length}}
								</Tag> 
								次
							</p>
							<p>
								循环方式：
								<Tag>
									{{map_end_type_times[item.loop_type]}}
								</Tag>
							</p>
						</div>
						<div v-if="item.loop_type>1">
							<Tag color="green" v-for="week in item.week_days">
								{{map_week_day[week]}}						
							</Tag>
						</div>
					</template>
				</div>
			</td>
			<td><div class="ivu-table-cell">{{item.int_start_hour}} ~ {{item.int_end_hour}}</div></td>			
			<td>
				<div class="ivu-table-cell">
					<p>教室：{{item.cr_id,'-'|classroom_name}}</p>
					<p>{{'老师'|translate}}：{{item.teach_eid,'-'|ename}}</p>
					<p v-for="(e,index) in item.second_eids">
						{{'助教'|translate}}{{index+1}}：{{e,'-'|ename}}
					</p>					
					<p v-if="item.consume_source_type==1">扣课时数：{{item.consume_lesson_hour}}</p>
					<p v-else>电子钱包：{{item.consume_lesson_amount}} （元）</p>					
				</div>
			</td>
			<td>
				<div class="ivu-table-cell">
					<Button size="small" type="text" icon="ios-trash" @click="delInfo(item)"></Button>
					<Button size="small" type="text" icon="edit" @click="editInfo(item,index)"></Button>
				</div>
			</td>
		</tr>
		<tr>
			<td colspan="8">
				<div class="ivu-table-cell">
					<span class="text-info cursor" @click="addInfo"><Icon type="plus"></Icon> 添加</span>
				</div>
			</td>
		</tr>
	</table>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'	
	
	function by(attr,rev){
	    //第二个参数没有传递 默认升序排列
	    if(typeof rev ==  'undefined'){
	        rev = 1;
	    }else{
	        rev = (rev) ? 1 : -1;
	    }
	    return function(a,b){
	        a = a[attr];
	        b = b[attr];
	        if(a < b){
	            return rev * -1;
	        }
	        if(a > b){
	            return rev * 1;
	        }
	        return 0;
	    }
	}
	
	export default{
		mixins: [ globals,common ],
		data () {
			return {
				map_week_day: {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'天'},
				map_end_type_times: {0:'每天',1:'隔天',2:'每周',3:'单周',4:'双周'},
				map_end_type_date: {0:'每周',1:'单周',2:'双周'},
				scheduleList: util.copy(this.value),
				errArranges: [],
				currentEditIndex: -1
			}
		},
		props: {
			value: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			info: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		computed: {
			allArrangeList () {
				let list = this.scheduleList,
					result = [],
					index = this.currentEditIndex
				
				if(list && list.length > 0) {
					list.forEach((l,i)=>{
						if(typeof index == 'undefined' || index != i) {
							result = result.concat(l.list)							
						}
					})
					list = this.orderBy(list,'int_day')					
				}				
				return result
			},
		},
		watch: {
			scheduleList: function (val) {
				this.$emit('input',val)
			}
		},
		methods: {				
			previewSchedule (list,loopCheck) {
				loopCheck = loopCheck || false
				this.$Modal.open('business/class/arrange/schedule-info-modal.vue',{
					props: {
						list: list,
						loopCheck: loopCheck
					},
					on: {
						'on-success': () => {							
							this.$emit('on-success')
						}
					}
				})
				.then(modal=>{
					modal.show()
				})
			},
			delInfo (item) {
				let index = this.scheduleList.indexOf(item)
				if(index > -1){
					this.scheduleList.splice(index,1)
				}
			},
			editInfo (item,index) {
				this.currentEditIndex = index
				this.$Modal.open('business/class/arrange/schedule-add-modal.vue',{
					props: {
						list: this.allArrangeList||[],
						item: item
					},
					on: {
						'on-add-schedule': (e) => {
							this.currentEditIndex = -1
							//更新item
							this.scheduleList.splice(index,1,util.copy(e))							
						}						
					}
				})
				.then(modal=>{
					modal.show('编辑上课规律','edit')
				})
			},
			addInfo () {		
				this.currentEditIndex = -1
				this.$Modal.open('business/class/arrange/schedule-add-modal.vue',{
					props: {
						list: this.allArrangeList||[],
						ignore: this.info
					},
					on: {
						'on-add-schedule': (e)=>{
							this.addSchedule(e)
						}
					}
				})
				.then(modal=>{
					modal.show('添加上课时间')
				})
			},
			addSchedule (list) {
				this.scheduleList = this.scheduleList.concat(list)
			},
			loopCheck () {
				let list = this.allArrangeList,
					i 	 = 0
				
				if(!list && !list.length){
					this.$Message.error('当前规律的排课次数为0 ，请您添加新的排课规律!')
					return
				}
				
				this.previewSchedule(list,true)
				
				this.arrangeCheck(list,0)
			},
			arrangeCheck (list,i) {					
				this.$set(list[i],'_loading',true)
				this.$set(list[i],'ignore_class_cc',this.info.ignore_class_cc)
				this.$set(list[i],'ignore_class_ec',this.info.ignore_class_ec)
				this.$set(list[i],'ignore_student_cc',this.info.ignore_student_cc)
				this.$set(list[i],'cid',this.info.cid)
				this.$set(list[i],'lid',this.info.lid)
				this.$set(list[i],'sj_id',this.info.sj_id)
				this.$set(list[i],'grade',this.info.grade) 
				this.$set(list[i],'lesson_type',this.info.lesson_type)
				this.$set(list[i],'sid',this.info.sid)
				this.$set(list[i],'sids',this.info.sids)
								
				this.$rest('course_arranges/check_conflict')
				.post(list[i])
				.success(response=>{
					let is_error = response.data.is_error,
						error_message = is_error?response.data.error_message:[],
						_error_fields = is_error?response.data.error_fields:[],
						_error_students = is_error?response.data.error_students:[]
						
					this.$set(list[i],'_success',!is_error)
					this.$set(list[i],'_fail',is_error)						
					this.$set(list[i],'error_message',error_message)
					this.$set(list[i],'_error_fields',_error_fields)
					this.$set(list[i],'error_students',_error_students)
					callback(this)
				}).error(response=>{					
					callback(this) 
					this.error(response.body.message||'排课失败~ ')
				})
				
				function callback ($this){					
					$this.$set(list[i],'_loading',false)
					
					if(i < list.length - 1){						
						$this.arrangeCheck(list,i+1)
					}
				}
			}
		}
	}
</script>

<style>
</style> 