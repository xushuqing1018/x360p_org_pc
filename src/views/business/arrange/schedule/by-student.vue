<template>
	<div class="week-schedule">
		<Row>
			<Col span="24">
				<span>搜索：</span>
				<select-student 
					v-model="sid" 
					clearable 
					style="width:250px;"
					placeholder="请选择学员">
				</select-student>
				<Button type="primary" icon="ios-download" class="ml-2" @click="exportExcel('学员课表','delLast')" v-per="'arrange.export'">导出</Button>
				<div class="pull-right">
                    <per-scope per="student.checkAll" @on-change="perScopeChange"></per-scope>
                </div>
			</Col>
		</Row>
		<div class="list-body">
            <div class="ivu-table-wrapper" v-loading.like="'student_course_by_week'">
				<table ref="tableExcel" class="week-schedule-table mt-3">
					<table-header
						:view="view"
						:date="date" 
						:year="year"
						:week="week"
						@on-week-change="weekChange">
					</table-header>
					<table-body
						:per-scope="perScope"
						:sid="sid"
						:view="view"
						:date="date" 
						:year="year"
						:is-online="isOnline"
						:week="week">
					</table-body>
				</table>
			</div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	import TableHeader from './header.vue'
	import TableBody from './student-data.vue' 

	export default {
		mixins: [grid,common],
		components: {
			SelectStudent,
			TableHeader,
			TableBody
		},
		props: {
			view: {
				type: String,
			},
			date: {
				type: Date
			},
			year:{
				type:Number,
				default:0
			},
			week:{
				type:Number,
				default:1
			},
			isOnline:{
				type:Number,
				default:0
			}
		},
		data() {
			return {
				sid: 0,
				perScope: ''
			}
		},
		methods: {
			perScopeChange(value) {
	            this.perScope = value
	        },
		    weekChange({action}) {
				this.$emit('on-week-change',{action:action})
		    }
		}
	}
</script>