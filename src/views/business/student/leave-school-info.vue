<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form :model="info" :label-width="120" :rules="rules">
			<Form-item label='休学日期' prop="suspend_date">
				<DatePicker 
					type="date" 
					:value="format_day(info.suspend_date)" 
					@on-change="info.suspend_date = $event" 
					:options="options1"
					style="width:300px">
				</DatePicker>
			</Form-item>
			<Form-item label='预计复学日期' prop="back_date">
				<DatePicker 
					type="date" 
					:value="format_day(info.back_date)" 
					@on-change="info.back_date = $event" 
					:options="options2"
					style="width:300px">
				</DatePicker>
				<p>如果不确定什么时候复学,可以不填.</p>
			</Form-item>
			<Form-item label="休学原因" prop="suspend_reason">
				<Input type="textarea" v-model="info.suspend_reason" :rows="3" style="width:300px"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import moment from 'moment'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	const emptyObj = {
		suspend_date: moment().format('YYYY-MM-DD'),
		back_date:'',
		suspend_reason: ''
	}

	export default{
		mixins: [grid,common,globals,modal],
		data () {
			return {
				info: {},
				student: {},
				rules: {
					suspend_date: [
						{ required: true, type: 'date', message:'休学日期不能为空', trigger: 'blur' }
					]
				},
				options1: {
					disabledDate (date) {
						return date && date.valueOf() < Date.now() - 86400000
					}
				},
				options2: {
					disabledDate (date) {
						return date && date.valueOf() < Date.now()
					}
				}
			}
		},
		methods: {
			ok () {
				if(!this.info.suspend_date) {
					this.$Message.error('休学日期不能为空')
					return false
				}

				this.$rest('students')
				.add_url_param(this.student.sid,'dosuspend')
				.post(this.info)
				.success(response => {
					this.$Message.success('休学成功')
					this.$emit('on-success')
					this.close()
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		},
		watch: {
			'modal$.show': function(val) {
				if(val) {
					this.info = util.copy(emptyObj)
				}
			}
		}
	}
</script>
