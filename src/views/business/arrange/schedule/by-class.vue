<template>
	<div class="week-schedule">
		<Row>
			<Col span="24">
				<span>搜索：</span>
				<select-class 
					v-model="cid" 
					clearable 
					style="width:250px;"
					placeholder="请选择班级">
				</select-class>
				<Button type="primary" icon="ios-download" class="ml-2" @click="exportExcel('班级课表','delLast')" v-per="'arrange.export'">导出</Button>
				<div class="pull-right">
                    <per-scope per="class.checkAll" @on-change="perScopeChange"></per-scope>
                </div>
			</Col>
		</Row>
		<div class="list-body">
            <div class="ivu-table-wrapper" v-loading.like="'class_course_by_week'">
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
						:per-scope="perScope"
						:cid="cid"
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
	import TableHeader from './header.vue'
	import TableBody from './class-data.vue' 
	import SelectClass from 'c%/SelectClass.vue'

	export default {
		mixins: [grid,common],
		components: {
			TableHeader,
			TableBody,
			SelectClass
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
				cid: 0,
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