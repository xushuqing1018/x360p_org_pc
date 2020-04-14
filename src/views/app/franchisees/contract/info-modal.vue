<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="650">
		<Form ref="form" :model="info" :label-width="100">
			<Row>
				<Col span="12">
					<Form-item label="合同号" prop="contract_no" class="ivu-form-item-required">
						<Input v-model="info.contract_no" placeholder="请输入合同号"></Input>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="签约员工" prop="sign_eid">
						<select-employee v-model="info.sign_eid" :rid="101" :limit-per="false"></select-employee>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="合同开始日期" prop="contract_start_int_day" class="ivu-form-item-required">
			            <DatePicker 
			                :value="info.contract_start_int_day" 
			                placeholder="请选择合同开始日期"
			                style="width: 209px;"
			                @on-change="info.contract_start_int_day = $event"
			                >
			            </DatePicker>
			        </Form-item>
				</Col>
				<Col span="12">
					<Form-item label="合同结束日期" prop="contract_end_int_day" class="ivu-form-item-required">
			            <DatePicker 
			                :value="info.contract_end_int_day" 
			                placeholder="请选择合同结束日期"
			                style="width: 209px;"
			                @on-change="info.contract_end_int_day = $event"
			                >
			            </DatePicker>
			        </Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="开业日期" prop="open_int_day">
						<DatePicker 
			                :value="info.open_int_day" 
			                placeholder="请选择合同结束日期"
			                style="width: 209px;"
			                @on-change="info.open_int_day = $event"
			                >
			            </DatePicker>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="区域性质" prop="region_level">
						<Select v-model="info.region_level" style="width: 209px;">
							<Option v-for="(item,index) in region_levels" :value="index+1">{{item}}</Option>
						</Select>
					</Form-item>
				</Col>
			</Row>
			
			<Row>
				<Col span="12">
					<Form-item label="特许经营费" prop="join_fee1">
						<Input v-model="info.join_fee1" v-keeptwo style="width: 120px;">
							<span slot="append">元</span>
						</Input>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="履约保证金" prop="join_fee2">
						<Input v-model="info.join_fee2" v-keeptwo style="width: 120px;">
							<span slot="append">元</span>
						</Input>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="年度使用费费" prop="join_fee3">
						<Input v-model="info.join_fee3" v-keeptwo style="width: 120px;">
							<span slot="append">元</span>
						</Input>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="教育商品款" prop="join_fee4">
						<Input v-model="info.join_fee4" v-keeptwo style="width: 120px;">
							<span slot="append">元</span>
						</Input>
					</Form-item>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<Form-item label="合同总金额" prop="contract_amount">
						<Input v-model="info.contract_amount" v-keeptwo style="width: 120px;">
							<span slot="append">元</span>
						</Input>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="全款到账日期" prop="all_pay_int_day">
						<DatePicker 
			                :value="info.all_pay_int_day" 
			                placeholder="请选择到账日期"
			                style="width: 209px;"
			                @on-change="info.all_pay_int_day = $event"
			                >
			            </DatePicker>
					</Form-item>
				</Col>
			</Row>
			<Form-item label="特殊约定" prop="content">
				<Input type="textarea" v-model="info.content" :autosize="{minRows:2,maxRows:5}"></Input>
			</Form-item>
			<Form-item label="合同附件">
				<review-upload v-model="info.franchisee_contract_file" :show-course-file="false">
					<span></span>
				</review-upload>
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
	import ReviewUpload from 'c%/ReviewUpload.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const INFO_NAME = '加盟商合同'
	const INFO_PK_ID = 'fcc_id'
	const INFO_URL   = 'franchisee_contracts'

	const emptyObject = {
		fc_id: 0,
		contract_no: '',
		contract_start_int_day: '',
		contract_end_int_day: '',
		open_int_day: '',
		region_level: 0,
		join_fee1: 0.00,
		join_fee2: 0.00,
		join_fee3: 0.00,
		join_fee4: 0.00,
		contract_amount: 0.00,
		all_pay_int_day: '',
		content: '',
		sign_eid: 0,
		franchisee_contract_file: []
	}

	export default {
		mixins: [modal,common,globals],
		props: {
			fcId: {
				type: [Number,String],
				default: 0
			}
		},
		components: {
			SelectEmployee,
			ReviewUpload
		},
		data() {
			return {
				info: util.copy(emptyObject),
				region_levels: ['一类','二类','三类','四类','五类','六类']
			}
		},
		methods: {
			onModalOpen() {
				if(this.fcId) {
					this.info.fc_id = this.fcId
				}
			},
			ok() {
				if(this.info.contract_no==='') {
					this.$Message.error('合同号不能为空')
					return
				}
				if(!this.info.contract_start_int_day) {
					this.$Message.error('合同开始日期不能为空')
					return
				}
				if(!this.info.contract_end_int_day) {
					this.$Message.error('合同结束日期不能为空')
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