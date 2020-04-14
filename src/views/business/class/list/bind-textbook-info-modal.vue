<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="500">
		<Form ref="form" :model="info" :label-width="90" :rules="rules">
			<FormItem label="选择教材" prop="tb_ids" style="width: 90%">
				<SelectTextbook v-model="info.tb_ids"/>
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
import SelectTextbook from 'c%/SelectTextbook'

export default {
	mixins: [modal, common],
	components: {
		SelectTextbook
	},
	props: {
		itemInfo: {
			type: Object,
			default: () => {
				return {}
			}
		},
		cid: {
			type: Number,
			default: 0
		}
	},
	data () {
		const vm = this;

		return {
			info: {
				tb_ids: []
			},
			rules: {
				tb_ids: [
					{ required: true, type: 'array', min: 1, message: '教材不能为空', trigger: 'blur' }
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
			let [method, url, msg] = ['post', `classes/${this.cid}/textbooks`, '添加成功']
			let params = { ...this.info };

			this.$http.post(url, params)
			.then(res => {
				this.$Message.success(msg)
				this.$emit('update');
				this.close();
			},res => {
				this.error(res.body.message)
			})
		}
	}
	
}
</script>
