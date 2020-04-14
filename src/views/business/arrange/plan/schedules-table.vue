<template>
	<div style="max-height: 400px;overflow: auto">
	<table>
		<thead>
			<tr>
				<th width="50">周几</th>
				<th width="80">时间</th>
				<th width="80">{{label_teacher}}</th>
				<th>{{label_secteacher}}</th>
				<th>教室</th>
				<th width="60">课消</th>
				<th width="50" v-if="scheduleType!==0">人数</th>
				<th width="80">操作</th>
			</tr>
		</thead>
		<tbody>
			<template v-for="(item,index) in list">
				<tr :class="{'bt':!(enable_type2_bk&&scheduleType==2)}">
					<td>{{'周'+map_week_text[item.week_day]}}</td>
					<td>{{item.int_start_hour}}~{{item.int_end_hour}}</td>
					<td>{{item.eid|ename}}</td>
					<td>{{item.second_eids|enames('-')}}</td>
					<td>{{item.cr_id|classroom_name('-')}}</td>
					<td>{{item.consume_source_type==1?Number(item.consume_lesson_hour)+'课时':Number(item.consume_lesson_amount)+'元'}}</td>
					<td v-if="scheduleType!==0">{{item.student_limit}}</td>
					<td>
						<Button type="text" size="small" icon="edit" @click="edit(item,index)"></Button>
						<Button type="text" size="small" icon="ios-trash" @click="del(item,index)"></Button>
					</td>
				</tr>
				<tr v-if="enable_type2_bk&&scheduleType==2" style="border-bottom:1px solid #e9eaec">
					<td colspan="8">授课主题：{{item.name}}</td>
				</tr>
			</template>
		</tbody>
	</table>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [common,globals],
		props: {
			list: Array,
			scheduleType: {
				type: Number,
				default: 0
			},
			lessonType: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				map_week_text: {1:'一',2:'二',3:'三',4:'四',5:'五',6:'六',7:'天'},
			}
		},
		methods: {
			edit(item,index) {
				this.$Modal.open('business/arrange/plan/edit-schedule.vue@modal',{
					props: {
						item: item,
						'schedule-type': this.scheduleType,
						'lesson-type': this.lessonType
					},
					on: {
						'on-ok':(data) => {
							this.list.splice(index,1,data)
						}
					}
				})
				.then(modal => {
					modal.show('编辑计划条目')
				})
			},
			del(item,index) {
				this.list.splice(index,1)
			}
		}
	}
</script>
<style lang="less" scoped>
	table {
		width: 100%;
		th,td {
			font-weight: normal;
			padding-right: 12px;
			padding-left: 12px;
		}
		tr.bt {
			border-bottom: 1px solid #e9eaec;
		}
	}
</style>
