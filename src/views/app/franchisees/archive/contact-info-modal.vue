<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<Form ref="form" :model="info" :label-width="80">
			<Row>
				<Col span="12">
					<Form-item label="姓名" prop="name" class="ivu-form-item-required">
						<Input v-model="info.name" placeholder="请输入联系人姓名"></Input>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="性别" prop="sex">
						<RadioGroup v-model="info.sex" type="button" size="small">
							<Radio label="1">男</Radio>
							<Radio label="2">女</Radio>
						</RadioGroup>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="手机号" prop="mobile" class="ivu-form-item-required">
						<Input v-model="info.mobile" placeholder="请输入手机号"></Input>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="邮箱" prop="email">
						<Input v-model="info.email" placeholder="请输入邮箱"></Input>
					</Form-item>
				</Col>
			</Row>
			<Form-item label="身份证号" prop="id_card_no">
				<Input v-model="info.id_card_no" placeholder="请输入身份证号"></Input>
			</Form-item>
			<Form-item label="通讯地址" prop="address">
				<Input v-model="info.address" placeholder="请输入通讯地址"></Input>
			</Form-item>
			<Row>
				<Col span="12">
					<Form-item label="合伙人" prop="is_partner">
						<i-switch v-model="info.is_partner" :true-value="1" :false-value="0">
							<span slot="open">是</span>
							<span slot="close">否</span>
						</i-switch>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="股权比例" prop="partner_percent" v-if="info.is_partner">
						<Input v-model="info.partner_percent" v-keeptwo style="width: 75px">
							<span slot="append">%</span>
						</Input>
					</Form-item>
				</Col>
			</Row>
			<Form-item label="合同签约人" prop="is_contract_sign">
				<i-switch v-model="info.is_contract_sign" :true-value="1" :false-value="0">
					<span slot="open">是</span>
					<span slot="close">否</span>
				</i-switch>
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

	const INFO_NAME = '加盟商联系人'
	const INFO_PK_ID = 'fcp_id'
	const INFO_URL   = 'franchisee_persons'

	const emptyObject = {
		fc_id: 0,
		name: '',
		sex: '1',
		mobile: '',
		email: '',
		id_card_no: '',
		address: '',
		is_partner: 0,
		partner_percent: 0.00,
		is_contract_sign: 0
	}

	export default {
		mixins: [modal,common,globals],
		props: {
			fcId: {
				type: [Number,String],
				default: 0
			}
		},
		data() {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			onModalOpen() {
				if(this.fcId) {
					this.info.fc_id = this.fcId
				}
			},
			ok() {
				if(this.info.name==='') {
					this.$Message.error('联系人名称不能为空')
					return
				}
				if(this.info.mobile==='') {
					this.$Message.error('手机号不能为空')
					return
				}else{
					if(!(/^\d{8,11}$/).test(this.info.mobile)) {
						this.$Message.error('手机号格式不正确')
						return
					}
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