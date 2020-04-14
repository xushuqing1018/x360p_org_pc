<template>
	<div>
		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">星期</div></th>
				<th><div class="ivu-table-cell">开始时间</div></th>
				<th><div class="ivu-table-cell">结束时间</div></th>
				<th><div class="ivu-table-cell">教室</div></th>
				<th><div class="ivu-table-cell">{{'老师'|translate}}</div></th>
				<th><div class="ivu-table-cell">{{'助教'|translate}}</div></th>
				<template v-if="classType===0">
					<th><div class="ivu-table-cell">扣课时数</div></th>
				</template>
				<th><div class="ivu-table-cell">操作</div></th>
			</thead>
			<template v-for="(item,index) in sortList">
				<tr>
					<td><div class="ivu-table-cell">{{map_week_day[item.week_day]}}</div></td>
					<td><div class="ivu-table-cell">{{item.int_start_hour}}</div></td>
					<td><div class="ivu-table-cell">{{item.int_end_hour}}</div></td>
					<td><div class="ivu-table-cell">{{item.cr_id|classroom_name}}</div></td>
					<td><div class="ivu-table-cell">{{item.eid|ename}}</div></td>
					<td><div class="ivu-table-cell">{{item.second_eids|enames('-')}}</div></td>
					<template v-if="classType===0">
						<td><div class="ivu-table-cell">{{item.consume_lesson_hour}}</div></td>
					</template>
					<td>
						<div class="ivu-table-cell">
							<Button type="text" size="small" icon="edit" @click="editInfo(item,index)"></Button>
							<Button type="text" size="small" icon="ios-trash" @click="delInfo(item)"></Button>
						</div>
					</td>
				</tr>
				<tr v-if="enable_type2_bk&&classType==2">
					<td colspan="7"><div class="ivu-table-cell">授课主题：{{item.name}}</div></td>
				</tr>
			</template>
			<tr>
				<td colspan="8">
					<div class="ivu-table-cell">
						<span class="text-info cursor" @click="addInfo"><Icon type="plus"></Icon> 添加</span>
					</div>
				</td>
			</tr>
		</table>
	</div>
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
				map_week_day: {1:'星期一',2:'星期二',3:'星期三',4:'星期四',5:'星期五',6:'星期六',7:'星期天'},
				arrangeList: util.copy(this.value)
			}
		},
		props: {
			crId: {
				type: [String,Number],
				default: 0
			},
			classType: {
				type: [String,Number],
				default: 0
			},
			value: {
				type: Array,
				default: ()=>{
					return []
				}
			},
			eid: {
				type: [String,Number],
				default: 0
			},
			secondEids: {
				type: [String,Number,Array],
				default: 0
			},
			cid: {
				type: [String,Number],
				default: 0
			},
			lid: {
				type: [String,Number],
				default: 0
			},
			season: {
				type: String,
				default: 'C'
			},
			from: {
				type: String,
				default: 'schedule'
			}
		},
		computed: {
			sortList () {
				let list = this.arrangeList
				
				list = list.sort(by('int_start_hour'))
				list = list.sort(by('week_day'))
				
				return list
			}
		},
		watch: {
			arrangeList: function (val) {
				this.$emit('input',val)
			}
		},
		methods: {
			editInfo (item,index) {
				this.$Modal.open('business/arrange/plan/edit-schedule.vue@modal',{
					props: {
						item: item,
						'schedule-type': 2,
						from: 'tempclass'
					},
					on: {
						'on-ok':(data) => {
							
						}
					}
				})
				.then(modal => {
					modal.show('编辑计划条目')
				})
			},
			delInfo (item) {
				if(this.from==='schedule') {
					this.confirm('确定删除这条排课计划吗？')
					.then(() => {
						this.$rest('class_schedules')
						.delete(item.csd_id)
						.success(res => {
							this.$Message.success('删除成功')
							this.getClassSchedules()
						})
						.error(res => {
							this.error(res.body.message)
						})
					})
				}else{
					let index = this.arrangeList.indexOf(item)
					if(index > -1){
						this.arrangeList.splice(index,1)
					}
				}
			},
			addInfo () {
				this.$Modal.open('business/class/add-arrange-modal.vue',{
					props: {
						from: this.from
					},
					on: {
						'save': ()=>{
							this.getClassSchedules()
						},
						'set': (list) => {
							this.setList(list)
						}
					}
				})
				.then(modal=>{
					modal.set('eid',this.eid)
					.set('second_eids',this.secondEids)
					.set('cid',this.cid)
					.set('lid',this.lid)
					.set('cr_id',this.crId)
					.set('season',this.season)
					.set('list',this.arrangeList)
					.set('classType',this.classType)
					.show('添加上课时间')
				})
			},
			setList (list) {
				this.arrangeList = this.arrangeList.concat(list)
			},
			getClassSchedules() {
				this.dr().getData(util.sprintf('classes/%s/schedules',this.cid),false)
                .then(response=>{                	
                    this.arrangeList = response.list
                    this.$emit('on-success')
                })
			}
		}
	}
</script>

<style lang="less" scoped>
	th,td {
		padding: 8px !important;
		.ivu-table-cell {
			padding-left: 8px;
			padding-right: 8px;
		}
	}
</style> 