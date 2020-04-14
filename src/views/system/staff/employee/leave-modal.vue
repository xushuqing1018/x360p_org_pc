
<template>
	<Modal v-drag-modal :mask-closable="false" class="x-ivu-modal" width="600" v-model="modal$.show" :title="modal$.title" @on-cancel="cancel">
		<template v-if="modal$.show">
			<Form :label-width="100" ref="form" class="x-ivu-form" :model="leave">
				<div class="row">
					<Form-item label="离职日期" class="col-sm-11" prop="time">
						<Date-picker 
		                	type="date" 
		                	:value="leave.int_day" 
		                	style="width:210px"
		                	@on-change="leave.int_day = $event"
		                	placeholder="请选择离职日期">
		                </Date-picker>
					</Form-item>
					<Form-item label="离职原因" class="col-sm-11" prop="reason">
						<Select 
							v-model="leave.type" 
							style="width:210px" 
							placeholder="请选择离职原因">
		               		<Option :value="1">主动离职</Option>
		               		<Option :value="2">辞退</Option>
		               </Select>
					</Form-item>
					<Form-item label="备注" class="col-sm-11">
						<Input v-model="leave.remark"></Input>
					</Form-item>
					<Form-item label="" class="col-sm-11">
						<a style="color: #39f" @click="handover">工作交接</a>
					</Form-item>
				</div>
			</Form>
		</template>
		<div slot="footer">
            <Button type="ghost" @click="cancel">取消</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
	</Modal>
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import moment from 'moment'
	import SelectEmployee from 'c%/SelectEmployee.vue'

	export default {
		mixins: [modal,common],
		components: {
			SelectEmployee
		},
		data() {
			return {
				leave: {
					int_day: moment(new Date()).format('YYYY_MM_DD'),
					remark: '',
					type: 1
				},
				info: {}
			}
		},
		methods: {
			handover() {
				this.$Modal.open('system/staff/employee/handover-modal.vue@modal',{
                    props: {
                        eid: this.info.eid
                    },
                    on: {
                        update: () => {
                            this.init_data();
                        }
                    }
                })
                .then(modal => {
                    modal.show(`离职工作交接【${this.info.ename}】`)
                })
			},
			cancel() {
				this.$form('form').reset()
				this.close()
			},
			save() {
				if(this.leave.time == '') {
					this.$Message.error('日期不能为空')
					return false
				}
				if(this.leave.reason == '') {
					this.$Message.error('原因不能为空')
					return false
				}
				Object.assign(this.leave,{eid:this.info.eid})
				this.$rest('employee_dimissions')
				.post(this.leave)
				.success(response => {
					this.$Message.success('离职成功')
					this.$emit('save',{action:this.modal$.action,data:this.leave,name: this.info.ename})
					this.cancel()
					this.$store.dispatch('updateGlobalVar','employees')
				})
				.error(response => {
					this.error(response.body.message)
				})
			}
		}
	}
</script>