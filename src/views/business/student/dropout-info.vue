<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form :model="info" :label-width="100" :rules="rules">
			<Form-item label='退学原因' prop="quit_reason" class="mb-2">
				<Select v-model="info.quit_reason" placeholder="请选择">
					<Option :value="item.did" v-for="item in quit_reasons_list">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="退学日期" prop="int_day" class="mb-2">
				<DatePicker :value="info.int_day" @on-change="info.int_day=$event" style="width: 100%"></DatePicker>
			</Form-item>
			<Form-item label="备注" prop="remark" class="mb-2">
				<Input type="textarea" v-model="info.remark" :rows="3"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
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
		quit_reason: '',
		remark: '',
		int_day: moment().format('YYYY-MM-DD')
	}

	export default{
		mixins: [grid,common,globals,modal],
		data () {
			return {				
				info: util.copy(emptyObj),
				student: {},
				rules: {
					quit_reason: [
						{ required: true, message: '退学原因不能为空',trigger: 'blur'}
					]
				}
			}
		},
		methods: {
			ok () {
				if(!this.info.quit_reason) {
					this.$Message.error('退学原因不能为空')
					return false
				}

				this.$rest('students')
				.add_url_param(this.student.sid,'doquit')
				.post(this.info)
				.success(response => {
					this.$Message.success('退学成功')
					this.$emit('on-success')
					this.close()
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		},
		computed: {
			quit_reasons_list() {
				return this.$store.state.gvars.dicts.drop_out_reason
			}
		}
	}
</script>