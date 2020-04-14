<template>
	<Modal draggable v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form ref="form" :model="info" :label-width="100">
			<Form-item label="服务类型" prop="fc_service_did" class="ivu-form-item-required">
				<Select v-model="info.fc_service_did" :disabled="!is_empty_apply">
					<Option v-for="item in dicts('fc_service')" :value="item.did">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="回复内容" prop="content" class="ivu-form-item-required">
				<Input type="textarea" v-model="info.content" :autosize="{minRows:2,maxRows:5}"></Input>
			</Form-item>
			<Form-item label="回复员工" prop="fc_eid" class="ivu-form-item-required">
				<select-employee v-model="info.fc_eid" :limit-per="false"></select-employee>
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
			<Form-item label="附加文件">
				<review-upload v-model="info.franchisee_service_record_file" :show-course-file="false">
					<span></span>
				</review-upload>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="text" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	import SelectFranchisee from 'c%/SelectFranchisee.vue'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	const INFO_NAME = '回复'
	const INFO_PK_ID = 'fsr_id'
	const INFO_URL   = 'franchisee_service_records'

	const emptyObject = {
		parent_fsr_id: 0,
		fc_id: 0,
		fc_og_id: 0,
		fsa_id: 0,
		fsr_type: 0,
		fc_service_did: 0,
		int_day: moment().format('YYYY-MM-DD'),
		int_hour: moment().format('HH:mm'),
		content: '',
		fc_eid: 0,
		fc_eid: 0,
		is_show_to_fc: 1,
		is_need_reply: 1,
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
			fsrType: Number,
			fcId: {
				type: [Number,String],
				default: 0
			},
			parentId: {
				type: [Number,String],
				default: 0
			},
			from: {
				type: String,
				default: 'reply'
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
					this.info.fc_eid = this.eid$
					this.info.fsr_type = this.fsrType
					if(this.fcId>0) {
						this.info.fc_id = this.fcId
					}
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
					this.info.parent_fsr_id = this.parentId
				}
			},
			ok() {
				if(this.info.fc_id==0) {
					this.$Message.error('请选择加盟商')
					return
				}
				if(this.info.fc_service_did===0) {
					this.$Message.error('服务类型不能为空')
					return
				}
				if(this.info.content==='') {
					this.$Message.error('回复内容不能为空')
					return
				}
				if(this.info.fc_eid==='') {
					this.$Message.error('请选择回复员工')
					return
				}
				if(this.info.int_day==0) {
					this.$Message.error('请选择完成日期')
					return
				}
				console.log(this.info)
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