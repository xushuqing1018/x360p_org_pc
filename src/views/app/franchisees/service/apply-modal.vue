<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="450">
		<Button class="sms-record-btn" type="ghost" @click="getApplyHistory">申请记录</Button>
		<Form ref="form" :model="info" :label-width="80">
			<Form-item label="标题" prop="title" class="ivu-form-item-required">
				<Input v-model="info.title"></Input>
			</Form-item>
			<Form-item label="服务类型" prop="fc_service_did" class="ivu-form-item-required">
				<Select v-model="info.fc_service_did">
					<Option v-for="item in dicts('fc_service')" :value="item.did">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="申请员工" prop="apply_eid" class="ivu-form-item-required">
				<select-employee v-model="info.apply_eid"></select-employee>
			</Form-item>
			<Form-item label="服务费用" prop="service_fee">
				<Input v-model="info.service_fee" v-keeptwo>
					<span slot="append">元</span>
				</Input>
			</Form-item>
			<Form-item label="备注" prop="remark">
				<Input type="textarea" v-model="info.remark"></Input>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const INFO_NAME = '服务申请'
	const INFO_PK_ID = 'fsa_id'
	const INFO_URL   = 'franchisee_service_applys'

	const emptyObject = {
		fc_id: 0,
		fc_og_id: 0,
		apply_eid: 0,
		fc_service_did: 0,
		title: '',
		remark: '',
		service_fee: ''
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectEmployee
		},
		data() {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			getApplyHistory() {
				this.$Modal.open('app/franchisees/service/apply-record-modal.vue')
				.then(modal => {
					modal.show('服务申请记录','list')
					this.close()
				})
			},
			onModalOpen() {
				this.info.fc_og_id = this.og_id$
				this.info.fc_id = this.org_fc_id
				this.info.apply_eid = this.eid$
			},
			ok() {
				if(this.info.title==='') {
					this.$Message.error('申请标题不能为空')
					return
				}
				if(this.info.fc_service_did===0) {
					this.$Message.error('请选择服务类型')
					return
				}
				if(this.info.apply_eid===0) {
					this.$Message.error('请选择申请员工')
					return
				}
				this.save()
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