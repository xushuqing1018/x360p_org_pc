<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form ref="form" :label-width="100" :model="info" :rules="rules">
			<Form-item label="规则名称" prop="rule_name">
				<Input v-model="info.rule_name" placeholder="请输入规则名称"></Input>
			</Form-item>
			<Form-item label="积分类型" prop="cate">
				<RadioGroup v-model="info.cate" type="button">
					<Radio :label="1">学习积分</Radio>
					<Radio :label="2">消费积分</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="积分操作" prop="type">
				<RadioGroup v-model="info.type" type="button">
					<Radio :label="1">增加</Radio>
					<Radio :label="2">减少</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="积分数" prop="credit">
				<InputNumber v-model="info.credit" :min="0"></InputNumber>
				(0表示不限制)
			</Form-item>
			<Form-item label="是否启用" prop="enable">
				<i-switch v-model="info.enable" :true-value="1" :false-value="0">
					<span slot="open">是</span>
					<span slot="close">否</span>
				</i-switch>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="save">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	const INFO_NAME = '规则'
	const INFO_PK_ID = 'cru_id'
	const INFO_URL   = 'credit_rules'

	const emptyObject = {
		rule_name: '',
		type: 1,
		cate: 1,
		credit: 0,
		enable: 1
	}
	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				info: util.copy(emptyObject),
				rules: {
					rule_name: [
						{ required: true, message: '规则名称不能为空', trigger: 'blur' }
					]
				}
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val&&this.modal$.action=='add') {
					this.info = util.copy(emptyObject)
				}
			}
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }
		}
	}
</script>