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
				<th><div class="ivu-table-cell">当前状态</div></th>
				<th><div class="ivu-table-cell">停课日期</div></th>
				<th><div class="ivu-table-cell">复课日期</div></th>
				<th><div class="ivu-table-cell">备注</div></th>
			</thead>
			<tr v-for="item in data">
				<td>
					<div class="ivu-table-cell">
						<Checkbox v-model="item.$select" @on-change="toggleSelect($event,item)"></Checkbox>
					</div>
				</td>
				<td width="180"><div class="ivu-table-cell">{{item.lid|lesson_name}}</div></td>
				<td><div class="ivu-table-cell">{{item.lesson_status|lesson_status}}<br>{{item.is_stop|stop_status}}</div></td>
				<td><div class="ivu-table-cell">{{item.stop_int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.recover_int_day|int_date}}</div></td>
				<td><div class="ivu-table-cell">{{item.stop_remark}}</div></td>
			</tr>
		</table>
		<div slot="footer">
			<Form class="filter-form pull-left" :label-width="80" v-if="is_select">
				<Form-item label="复课日期：">
					<DatePicker 
						type="date" 
						:value="format_day(recover_time)" 
						@on-change="recover_time = $event" 
						style="width:150px">
					</DatePicker>
				</Form-item>
			</Form>
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
				sId: [],
				recover_time: moment().format('YYYY-MM-DD')		
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
					this.$Message.error('请至少选择一个要复课的课程')
					return false
				}

				if(!this.recover_time) {
					this.$Message.error('复课日期不能为空')
					return false
				}

				let params = []
				this.sId.forEach(id => {
					params.push({
						sl_id:id,
						recover_time:this.recover_time
					})
				})
				this.confirm('确认复课操作吗？').then(() => {
					this.$rest('students').add_url_param(this.info.sid,'dorecover')
					.post({info:params})
					.success(response => {
						this.$Message.success('复课成功')
						this.$emit('on-success')
						this.close()
					})
					.error(response => {
						this.error(response.body.message)
					})
				})
				.catch(() => {})
			}
		},
		computed: {
			is_select() {
				return !!this.data.find(i => i.$select==true)
			}
		},
		watch: {
			'modal$.show': function(val) {
				if(val) {
					this.select_all = false
					this.sId.splice(0,this.sId.length)
					this.recover_time = moment().format('YYYY-MM-DD')	
				}
			}
		}
	}
</script>
