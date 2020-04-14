<template>
	<div>
		<table class="modal-table" style="font-size:12px;">
			<thead>
				<th><div class="ivu-table-cell">班级</div></th>
				<th><div class="ivu-table-cell">科目</div></th>
				<th><div class="ivu-table-cell">学员情况</div></th>
				<th><div class="ivu-table-cell">上课情况</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index">
				<td>
					<div class="ivu-table-cell">
						<div>
							<span v-if="item.status == 0">
								<Tag color="blue">招生中</Tag>
							</span>
							<span v-else-if="item.status == 1">
								<Tag color="blue">已开课</Tag>
							</span>
							<span v-else>
								<Tag color="blue">已结课</Tag>
							</span>
							<span>{{item.class_name}}</span>
						</div>
						<div>
							<span>开课时间：{{item.start_lesson_time}}，</span>
							<span>结课时间：{{item.end_lesson_time}}</span>
						</div>
					</div>
				</td>
				<td><div class="ivu-table-cell">{{item.sj_id|subject_name}}</div></td>
				<td>
					<div class="ivu-table-cell">
						学员人数：{{item.student_nums}}，
						满班率%：{{getNumRate(item)}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						上课次数：{{item.lesson_times}}，
						已排课次数：{{item.arrange_times}}，
						已考勤次数：{{item.attendance_times}}
					</div>
				</td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="4">
					<div class="ivu-table-cell text-center">该{{'老师'|translate}}没有教授任何班级</div>
				</td>
			</tr>
		</table>
		<div class="clearfix">
	        <div class="pull-right mt-3">
	            <Page 
	            size="small"
	            :total="total" 
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
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [grid,common,globals],
		props: {
			eid:{
				type: [Number,String],
				required: true
			}
		},
		data () {
			return {
				rest_api: 'classes?teach_eid='+this.eid,
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			getNumRate(item) {
				return (util.div(item.student_nums,item.plan_student_nums)).toFixed(2)*100
			}
		},
		watch: {
			eid(eid) {
				this.rest_api = 'classes?teach_eid='+eid
				this.init_data()
			}
		}
	}
</script>
