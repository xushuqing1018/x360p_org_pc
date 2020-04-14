<template>
	<div class="c-grid">
		<Alert show-icon>当前预警请假次数{{leave_num}}(含)以上的学员，如需修改请前往『系统』『系统设置』『系统参数』进行设置</Alert>
		<div class="box box-result">
			<div class="content">
				<div class="content-body">
					<div class="ivu-table-wrapper" v-loading.like="'student_leave_warn'">
						<table class="table-list" ref="tableExcel">
							<thead>
								<tr>
									<th><div class="ivu-table-cell">请假人</div></th>
									<th><div class="ivu-table-cell">请假次数</div></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in data">
									<td><div class="ivu-table-cell">{{item.student.student_name}}</div></td>
									<td><div class="ivu-table-cell">{{item.leave_num}}</div></td>
								</tr>
								<tr v-if="data.length == 0">
					                <td colspan="2" class="text-center">没有数据</td>
					            </tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="content-footer">
		            <div class="pagenation">
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
			</div>
		</div>
	</div>
</template>
<script>
	import grid from '@/libs/grid.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	export default {
		mixins: [grid],
		components: {
			SelectStudent
		},
		props: {
			modalLeave: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		watch: {
			'modalLeave.show': function(val) {
				if(val) {
					this.init_data()
				}
			}
		},
		data() {
			return {
				rest_api: 'dashboard/student_leave_warn'
			}
		},
		methods: {
	    	hook_get_param(param) {
	    		param.leave_num = this.leave_num
	    	}
	    },
	    computed: {
	    	leave_num() {
	    		return this.$store.state.gvars.configs.params.leave_warn_times || 5
	    	}
	    }
	}
</script>