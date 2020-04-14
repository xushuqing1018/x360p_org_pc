<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="450">
		<Form :model="info" :label-width="80">
			<Form-item label="人员" prop="eid" class="ivu-form-item-required">
				<select-employee v-model="info.eid" :limit-per="false" :disabled="modal$.action=='edit'"></select-employee>
			</Form-item>
			<Form-item label="角色" prop="sale_role_did" class="ivu-form-item-required">
				<Select v-model="info.sale_role_did">
					<Option 
					v-for="(item,index) in sale_roles" 
					:value="item.did" 
					:key="index">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="金额" prop="amount">
				<InputNumber v-model="info.amount" :min="0" readonly></InputNumber>
			</Form-item>
			<Form-item label="课时数" prop="lesson_hour" v-if="enable_er_lesson_hour">
				<InputNumber v-model="info.lesson_hour" :min="0"></InputNumber>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee'

	const emptyObj = {
		eid: 0,
		sale_role_did:0,
		amount:0,
		lesson_hour:0
	}

	export default {
		mixins: [modal,common,globals],
		props: {
			lessonAmount: {
				type:Number,
				default: 0.00
			},
			lessonHour: {
				type:Number,
				default: 0
			}
		},
		components: {
			SelectEmployee
		},
		data() {
			return {
				info:util.copy(emptyObj)
			}
		},
		mounted(){
			this.info.amount = this.lessonAmount
			this.info.lesson_hour   = this.lessonHour
		},
		methods: {
			ok()  {
				if(this.info.eid==0) {
					this.$Message.error('请选择业绩归属人')
					return
				}
				if(this.info.sale_role_did==0) {
					this.$Message.error('请选择所属角色')
					return
				}
				this.$emit('on-ok',this.info)
				this.close()
			}

		}
	}
</script>