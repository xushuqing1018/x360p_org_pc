<template>
	<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="500">
		<Form ref="form" :model="info" :label-width="90" :rules="rules">
			<FormItem label="投诉人" prop="sid" style="width: 80%">
				<select-student v-model="info.sid"/>
			</FormItem>
			<FormItem label="投诉内容" prop="content" style="width: 80%">
				<Input v-model="info.content" :rows="6" placeholder="请输入投诉内容"/>
			</FormItem>
		</Form>
		<div slot="footer">
			<Button @click="close">关闭</Button>
			<Button type="primary" @click="handleSubmit">确定</Button>
		</div>
	</Modal>
</template>

<script>
import moment from 'moment'
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'
import SelectStudent from 'c%/SelectStudent'

export default {
	mixins: [modal, common],
	components: {
		SelectStudent
	},
	data () {
		const vm = this;

		return {
			info: {
				sid: 0,
				content: '',
				from_type: 1
			},
			rules: {
				content: [
					{ required: true, message: '培训名称不能为空', trigger: 'blur' }
				],
				sid: [
					{ required: true, type: 'number', min: 1, message: '负责人不能为空', trigger: 'blur' }
				]
			}
		}
	},
	watch: {
		'modal$.show': function(val) {
			if(val) {
			}
		}
	},
	methods: {
		handleSubmit() {
			this.$refs.form.validate((valid) => {
				if(valid) {
					this.ok();
				}
			})
		},
		ok() {	
			let [method, url, msg] = ['post', 'advices', '添加成功']

			this.$rest('advices').post(this.info)
			.success(data=>{
				this.$Message.success('添加成功！')
				this.$emit('update')
				this.close()
			}).error(response=>{
				this.error(response.body.message||'添加失败~')
			})
		}
	}
	
}
</script>