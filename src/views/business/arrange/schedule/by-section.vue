<template>
	<div class="week-schedule">
		<Row>
			<Col span="24">
				<Button type="primary" icon="ios-download" class="ml-2" @click="exportExcel('时间段课表')" v-per="'arrange.export'">导出</Button>
			</Col>
		</Row>
		<div class="list-body">
            <div class="ivu-table-wrapper" v-loading.like="'time_course_by_week'">
				<table ref="tableExcel" class="week-schedule-table mt-3">
					<table-header
						class="section-header"
						:view="view"
						:date="date" 
						:year="year"
						:week="week"
						@on-week-change="weekChange">
					</table-header>
					<table-body
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
	import common from '@/libs/common.mixin'
	import TableHeader from './header.vue'
	import TableBody from './section-data.vue' 

	export default {
		mixins: [common],
		components: {
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
		methods: {
		    weekChange({action}) {
				this.$emit('on-week-change',{action:action})
		    }
		}
	}
</script>