<template>
	<Modal v-drag-modal :mask-closable="false" width="550" v-model="modal$.show" :title="modal$.title">
		<div class="assign-student-modal">
			<Button type="primary" icon="plus" @click="addStudent">添加学员</Button>
			<div style="height: 300px;overflow-x: hidden;overflow-y: auto;">
				<table class="table-list mt-2">
					<thead>
						<tr>
							<th><div class="ivu-table-cell">姓名</div></th>
							<th><div class="ivu-table-cell">学号</div></th>
							<th width="80"><div class="ivu-table-cell">操作</div></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item,index) in data">
							<td><div class="ivu-table-cell">{{item.student_name}}</div></td>
							<td><div class="ivu-table-cell">{{item.sno}}</div></td>
							<td><div class="ivu-table-cell">
								<Button
									type="ghost"
									size="small"
									shape="circle"
									icon="ios-trash"
									title="删除"
									@click="delStudent(item,index)">
								</Button>
							</div></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
    	<div slot="footer">
            <Button type="ghost" @click="close" :disabled="saving">取消</Button>
            <Button type="primary" @click="ok" :loading="saving">确认</Button>
        </div>
        <select-student ref="student_modal" v-model="sids" style='display:none;' @on-selected="select"></select-student>
    </Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	export default{
		mixins:[grid,modal,common],
		props: {
			eid: {
				type:Number,
				default:0
			}
		},
		components: {
			SelectStudent
		},
		data () {
			return {
				sids: [],
				data: []
			}
		},
        methods: {
        	addStudent() {
        		this.$r('student_modal').openModal()
        	},
        	select(select) {
        		select.forEach(item => {
        			let student = this.data.find(d => d.sid == item.sid)
        			if(!student) {
        				this.data.push(item)
        			}
        		})
        	},
        	delStudent(item,index) {
        		let index_in_sids = this.sids.findIndex(id => id == item.sid)
        		this.data.splice(index,1)
        		if(index_in_sids > -1) {
        			this.sids.splice(index_in_sids,1)
        		}
        	},
        	ok() {
        		if(this.sids.length == 0) {
        			this.$Message.error('还没有选择学员')
        			return false
        		}
        		this.$rest('employee_students')
        		.post({
        			eid: this.eid,
        			sids: this.sids
        		})
        		.success(res => {
        			this.$Message.success('分配成功')
        			this.sids.splice(0)
        			this.data.splice(0)
        			this.$emit('on-success')
        			this.close()
        		})
        		.error(res => {
        			this.error(res.body.message)
        		})
        	}
        }
	}
</script>
