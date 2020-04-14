<template>
	<div class="week-schedule">
		<Row>
			<Col span="24">
				<span>搜索：</span>
				<select-class-room-two 
					v-model="cr_id" 
					clearable 
					style="width:250px;"
					placeholder="请选择教室">
				</select-class-room-two>
				<Button type="primary" icon="ios-download" class="ml-2" @click="exportExcel('教室课表','delLast')" v-per="'arrange.export'">导出</Button>
			</Col>
		</Row>
		<div class="list-body">
            <div class="ivu-table-wrapper" v-loading.like="'classroom_course_by_week'">
				<table ref="tableExcel" class="week-schedule-table mt-3">
					<table-header
						:view="view"
						:date="date" 
						:year="year"
						:week="week"
						@on-week-change="weekChange">
					</table-header>
					<table-body
						:view="view"
						:cr-id="cr_id"
						:date="date" 
						:year="year"
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
	import common from '@/libs/common.mixin'
	import SelectClassRoomTwo from 'c%/SelectClassRoomTwo.vue'
	import TableHeader from './header.vue'
	import TableBody from './classroom-data.vue' 

	export default {
		mixins: [common],
		components: {
			SelectClassRoomTwo,
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
			}
		},
		data() {
			return {
				cr_id: 0
			}
		},
		methods: {
		    weekChange({action}) {
				this.$emit('on-week-change',{action:action})
		    }
		}
	}
</script>