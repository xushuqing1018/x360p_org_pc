<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="650">
		<Form :model="info" ref="form" :label-width="100" :rules="rules">
			<Form-item label='停课时间' prop="stop_time" class="mb-2">
				<DatePicker 
					type="date" 
					:value="format_day(info.stop_time)" 
					@on-change="info.stop_time = $event"
					@on-clear="info.stop_time = 0"
					style="width: 100%;"
					>
				</DatePicker>
			</Form-item>
			<Form-item label='复课日期' prop="recover_time" class="mb-2">
				<DatePicker 
					type="date" 
					:value="format_day(info.recover_time)" 
					@on-change="info.recover_time = $event" 
					style="width: 100%;"
					>
				</DatePicker>
				<p>如果不确定什么时候复课,可以不填.</p>
			</Form-item>
			<Form-item label="备注" prop="stop_remark" class="mb-2">
				<Input 
					type="textarea" 
					v-model="info.stop_remark" 
					:rows="3" 
					>
				</Input>
			</Form-item>
			<Form-item label="同步删除排课" class="mb-2">
				<Checkbox v-model="is_delete" @on-change="onDeleteArrange"></Checkbox>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	const emptyObj = {
		stop_time: moment(new Date()).format('YYYY-MM-DD'),
		recover_time:'',
		stop_remark: '',
		sl_id: 0
	}

	export default{
		mixins: [grid,common,globals,modal],
		data () {
			return {				
				info: util.copy(emptyObj),
				student: {},
				rules: {
					stop_time: [
						{ required: true, type: 'date', message:'停课时间不能为空', trigger: 'blur' }
					]
				},
				is_delete: false
			}
		},
		methods: {
			ok () {
				if(!this.info.stop_time) {
					this.$Message.error('停课时间不能为空')
					return false
				}

				let post_param = [],
					message = this.modal$.action==='add' ? '停课成功' : '编辑停课成功'
				this.info.sl_id = this.student.sl_id
				post_param.push(this.info)
				this.$rest('students').add_url_param(this.student.sid,'dostop')
				.post({info:post_param})
				.success(response => {
					this.$Message.success(message)
					this.close()
					this.$emit('on-success')
				})
				.error(response => {
					this.error(response.body.message)
				})
			},
			onDeleteArrange(v) {
				if(v) {
					this.$Modal.open('business/student/delete-student-arrange.vue@modal',{
						props: {
							sid: this.student.sid,
							lid: this.student.lid,
							'start-date': this.info.stop_time,
							'end-date': this.info.recover_time
						}
					})
					.then(modal => {
						modal.show(util.sprintf('删除排课【%s %s~%s】',this.student.student_name,this.info.stop_time,this.info.recover_time))
					})
				}
			}
		},
		watch: {
			'modal$.show': function(val) {
            	if(val&&this.modal$.action == 'add'){
					this.info = util.copy(emptyObj)
				}	            
	        }
        }
	}
</script>
