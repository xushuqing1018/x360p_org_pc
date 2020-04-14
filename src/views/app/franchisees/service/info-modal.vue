<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form ref="form" :model="info" :label-width="100">
			<Form-item label="加盟商" prop="fc_id" class="ivu-form-item-required" v-if="from=='service'">
				<select-franchisee v-model="info.fc_id" clearable :disabled="!is_empty_apply"></select-franchisee>
			</Form-item>
			<Form-item label="服务类型" prop="fc_service_did" class="ivu-form-item-required">
				<Select v-model="info.fc_service_did" :disabled="!is_empty_apply">
					<Option v-for="item in dicts('fc_service')" :value="item.did">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="服务内容" prop="content" class="ivu-form-item-required">
				<Input type="textarea" v-model="info.content" :autosize="{minRows:2,maxRows:5}"></Input>
			</Form-item>
			<Form-item label="服务员工" prop="eid" class="ivu-form-item-required">
				<select-employee v-model="info.eid" :limit-per="false"></select-employee>
			</Form-item>
			<Row>
				<Col span="12">
					<Form-item label="完成日期" prop="int_day" class="ivu-form-item-required">
						<DatePicker 
			                :value="info.int_day" 
			                placeholder="完成日期"
			                @on-change="info.int_day = $event"
			                >
			            </DatePicker>
					</Form-item>
				</Col>
				<Col span="12">
					<Form-item label="完成时间" prop="int_hour">
						<Time-picker 
		                    confirm
		                    @on-change="info.int_hour = $event" 
		                    :value="info.int_hour" 
		                    format="HH:mm" 
		                    :steps="[1,15,15]" 
		                    placeholder="00:00">
		                </Time-picker>
					</Form-item>
				</Col>
			</Row>
			<Form-item label="服务记录文件">
				<review-upload v-model="info.franchisee_service_record_file" :show-course-file="false">
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
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	import SelectFranchisee from 'c%/SelectFranchisee.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const INFO_NAME = '服务记录'
	const INFO_PK_ID = 'fsr_id'
	const INFO_URL   = 'franchisee_service_records'

	const emptyObject = {
		fc_id: 0,
		fc_og_id: 0,
		fsa_id: 0,
		fc_service_did: 0,
		int_day: '',
		int_hour: '',
		content: '',
		eid: 0,
		franchisee_service_record_file: []
	}

	export default {
		mixins: [modal,common,globals],
		props: {
			apply: {
				type: Object,
				default(){
					return {}
				}
			},
			fcId: {
				type: [Number,String],
				default: 0
			},
			from: {
				type: String,
				default: 'service'
			}
		},
		components: {
			SelectEmployee,
			SelectFranchisee,
			ReviewUpload
		},
		data() {
			return {
				info: util.copy(emptyObject)
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val&&this.modal$.action=='add') {
					this.info.eid = this.eid$
				}
			}
		},
		methods: {
			onModalOpen() {
				if(!this.is_empty_apply) {
					let ids = ['fc_id','fc_og_id','fsa_id','fc_service_did']
					ids.forEach(id => {
						this.info[id] = this.apply[id]
					})
				}
				if(this.fcId>0) {
					this.info.fc_id = this.fcId
				}
			},
			ok() {
				if(this.info.fc_id==0&&this.from=='service') {
					this.$Message.error('请选择加盟商')
					return
				}
				if(this.info.fc_service_did===0) {
					this.$Message.error('服务类型不能为空')
					return
				}
				if(this.info.content==='') {
					this.$Message.error('服务内容不能为空')
					return
				}
				if(this.info.eid==='') {
					this.$Message.error('请选择完成员工')
					return
				}
				if(this.info.int_day==0) {
					this.$Message.error('请选择完成日期')
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
	        },
	        is_empty_apply() {
	        	return _.isEmpty(this.apply)
	        }
		}
	}
</script>