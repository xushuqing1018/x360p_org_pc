<style scoped>
.handover-name {
	text-decoration: underline;
}
</style>

<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="600">
		<Form ref="form" :model="info" :label-width="90" :rules="rules" class="row">
			<Form-item label="工作交接" prop="handoverType" class="col-sm-11">
				<RadioGroup v-model="info.handoverType" @on-change="handoverTypeChange">
					<Radio :label="1">统一交接</Radio>
					<Radio :label="2">分别交接</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="交接人员" prop="handover" class="col-sm-11">
				<div v-if="info.handoverType == 1">
					<span class="handover-name">所有工作</span> 交接给
					<select-employee v-model="info.handover" clearable style="width: 200px"></select-employee>
				</div>
				<template v-else>
					<div class="mb-2">
						将负责的 <span class="handover-name">市场名单</span> 转交给
						<select-employee v-model="info.handover.customer" clearable style="width: 200px"></select-employee>
					</div>
					<div class="mb-2">
						将负责的 <span class="handover-name">跟进的客户</span> 转交给
						<select-employee v-model="info.handover.follow" clearable style="width: 200px"></select-employee>
					</div>
					<div class="mb-2">
						将负责的 <span class="handover-name">学员</span> 转交给
						<select-employee v-model="info.handover.student" clearable style="width: 200px"></select-employee>
					</div>
					<div class="mb-2">
						将负责的 <span class="handover-name">班级</span> 转交给
						<select-employee v-model="info.handover.class" clearable style="width: 200px"></select-employee>
					</div>
					<div v-if="itemInfo.rids.length != 0&&itemInfo.rids.indexOf(102) != -1">
						将负责的 <span class="handover-name">加盟商</span> 转交给
						<select-employee v-model="info.handover.franchisee" clearable style="width: 200px"></select-employee>
					</div>
				</template>
			</Form-item>
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
import SelectEmployee from 'c%/SelectEmployee.vue'

export default {
	mixins: [common,modal],
	components: {
		SelectEmployee
	},
	props: {
		eid: {
			type: Number,
			default: 0
		},
		itemInfo: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	data () {
		const vm = this;

		return {
			info: {
				handoverType: 1,
				handover: 0
			},
			rules: {
				handoverType: [
					{ required: true, type: 'number', min: 1, message: '交接类型不能为空', trigger: 'blur' }
				]
			}
		}
	},
	watch: {
		'modal$.show': function(val) {
		}
	},
	methods: {
		handoverTypeChange(val) {
			if(val == 1) {
				this.info.handover = 0
			}
			else {
				this.info.handover = {
					customer: 0,
					follow: 0,
					student: 0,
					class: 0,
					franchisee: 0
				}
			}
		},
		handleSubmit() {
			this.$refs.form.validate((valid) => {
				if(valid) {
					this.ok();
				}
			})
		},
		ok() {
			this.$http.post(`employees/${this.eid}/work_handover`, this.info)
			.then(res => {
				this.$Message.success('添加成功');
				this.$emit('update');
				this.close();
			},res => {
				this.error(res.body.message)
			})
		}
	}
}
</script>
