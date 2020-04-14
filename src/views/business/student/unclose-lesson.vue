<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800">
		<table class="table-list">
			<thead>
				<th>
					<div class="ivu-table-cell">
						<Checkbox v-model="select_all" @on-change="toggleSelectAll($event)"></Checkbox>
					</div>
				</th>
				<th><div class="ivu-table-cell">课程名称</div></th>
				<th><div class="ivu-table-cell">课程类型</div></th>
				<th><div class="ivu-table-cell">当前状态</div></th>
				<th><div class="ivu-table-cell">总课时数</div></th>
				<th><div class="ivu-table-cell">剩余课时数</div></th>
			</thead>
			<tr v-for="item in data">
				<td>
					<div class="ivu-table-cell">
						<Checkbox v-model="item.$select" @on-change="toggleSelect($event,item)"></Checkbox>
					</div>
				</td>
				<td width="180"><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
				<td><div class="ivu-table-cell">{{item.lesson_type|lesson_type}}</div></td>
				<td><div class="ivu-table-cell">{{item.is_stop==0?'在读':'停课'}}</div></td>
				<td><div class="ivu-table-cell">{{item.lesson_hours}}</div></td>
				<td><div class="ivu-table-cell">{{item.remain_lesson_hours}}</div></td>
			</tr>
		</table>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	export default{
		mixins: [grid,common,globals,modal],
		data () {
			return {				
				data: [],
				info: {},
				select_all: false,
				sId: []
			}
		},
		methods: {
			checkSelectAll(item, index, arr) {
	        	if(this.sId.indexOf(item.sl_id) !== -1) {
	        		return true
	        	} else {
	        		return false
	        	}
	        },
			toggleSelectAll (event) {
				this.data.forEach(item => {
					let index = this.sId.indexOf(item.sl_id)
					if(event) {
						if(index < 0) {
							this.sId.push(item.sl_id)
							item.$select = true
						}
					}else{
						if(index > -1) {
							this.sId.splice(index,1)
							item.$select = false
						}
					}
				})
			},
			toggleSelect (event,item) {
				if(event) {
					this.sId.push(item.sl_id)
				}else{
					let index = this.sId.indexOf(item.sl_id)
					this.sId.splice(index,1)
				}
				this.select_all = this.data.every(this.checkSelectAll)
			},
			ok () {
				if(!this.sId.length) {
					this.$Message.error('请至少选择一个要撤销结课的课程')
					return false
				}

				// let sl_arr = []
				// this.sId.forEach(id => {
				// 	let sl = this.data.find(d => d.sl_id==id)
				// 	sl_arr.push(sl)
				// })

				// let text = ''
				// if(sl_arr.length > 0) {
				// 	text = '该学员在以下课程还有课时未消耗完：<br/>'
				// 	sl_arr.forEach(sl => {
				// 		text += this.$filter('lesson_name')(sl.lid) + '，剩余课时：' + sl.remain_lesson_hours + '，<br/>'
				// 	})
				// 	text += '确认强制结课吗？'
				// }else{
				// 	text = '确认结课吗？'
				// }

				this.confirm('确认对已选课程撤销结课？').then(() => {
					this.$rest('students/undo_close')
					.post({
						sl_id:this.sId,
						sid: this.info.sid
					})
					.success(response => {
						this.$Message.success('撤销结课成功')
						this.$emit('on-success')
						this.close()
					})
					.error(response => {
						this.error(response.body.message)
					})
				})
				.catch(() => {})
			}
		}
	}
</script>
