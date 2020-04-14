<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="900" :mask-closable="false">
		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">课程</div></th>
				<th><div class="ivu-table-cell">可用科目</div></th>
				
				<th><div class="ivu-table-cell">总课时</div></th>
				<th><div class="ivu-table-cell">剩余课时</div></th>
				<th><div class="ivu-table-cell">消耗课时</div></th>
				<th><div class="ivu-table-cell">课时状态</div></th>
				<th><div class="ivu-table-cell">是否停课</div></th>
				<th><div class="ivu-table-cell">有效期</div></th>
			</thead>
			<tr v-for="(item,index) in data" :key="index" @click="chooseStudentLesson(item)" :class="currentItem==item?'ivu-table-row-highlight':''">
				<td>
					<div class="ivu-table-cell">
						{{item.lid|lesson_name}}
						<p v-if="item.cid>0">班级:{{item.cid|class_name}}</p>
					</div>
				</td>
				
				<td>
					<div class="ivu-table-cell">
						{{item.sj_ids|sj_ids_text}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.total_lesson_hours}}
					</div>
				</td>
				
				<td>
					<div class="ivu-table-cell">
						{{item.remain_lesson_hours}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.use_lesson_hours}}
					</div>
				</td>
				
				<td>
					<div class="ivu-table-cell">
						{{item.lesson_status|lesson_status_text}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.is_stop|stop_status_text}}
					</div>
				</td>
				<td>
					<div class="ivu-table-cell">
						{{item.expire_time_text}}
					</div>
				</td>
			</tr>
			<tr v-if="!data.length">
				<td colspan="8">
					<div class="ivu-table-cell text-center">
						<span v-if="loading">正在加载数据...</span>
						<span v-else>没有数据</span>
					</div>
				</td>
			</tr>
		</table>
		<div class="mt-3 text-right">
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
        
		<div slot="footer">
			<Button type="ghost" @click="close" :loading="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [ grid,common,modal,globals ],
		data () {
			return {
				sid: 0,
				sj_id: 0,
				slh_id: 0,
				rest_api: 'student_lessons',
				lesson_status: {0:'未开始',1:'上课中',2:'已结束'},
				currentItem: {}
			}
		},
		watch: {
			sid: function (val) {
				this.init_data()
			}
		},
		methods: {
			ok () {
				if(!this.currentItem.sl_id){
					this.$Message.error('请选择要扣除的学员课时')
					return false
				}
				let uri = util.sprintf('student_lesson_hours/%s/pay',this.slh_id)
				this.$rest(uri).post({sl_id:this.currentItem.sl_id})
				.success(data=>{
					this.$Message.success('操作成功！')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'扣除失败！')
				})
			},
			hook_get_param (param) {
				param.sid = this.sid
			},
			chooseStudentLesson (item) {
				if(item.sj_ids.indexOf(this.sj_id)==-1){
					this.$Message.error('该课程适用科目不包含本次考勤科目！')
					return
				}
				if(item.remain_lesson_hours==0){
					this.$Message.error('该课程剩余课时为0！')
					return 
				}
				this.currentItem = item
			}
		}
	}
</script>

<style>
</style>