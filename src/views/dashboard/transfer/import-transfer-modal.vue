<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="400">    
		<div>
            <p style="margin: 5px 0px;">课时单价：{{info.unit_price}}</p>
            <p style="margin: 5px 0px;">可结转金额：{{item.remain_lesson_hours * item.unit_lesson_hour_amount}}</p>
			<p style="margin: 5px 0px;">结转数量：
				<span>
					<InputNumber 
						v-model="info.nums" 
						:min="1" 
						:max="item.remain_lesson_hours"
						:step="1" 
						size="small" 
						style="width:60px"
						@on-change="remainNumsChange(item)">
					</InputNumber>
				</span>
			</p>
			<p>结转金额：{{info.amount}}</p>
        </div>
		<div slot="footer">
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'

	export default {
        mixins:[modal,globals,common],
        props:{
            item:{
                type:Object,
                default:{}
            }
        },
		data() {
			return {
				info:{
                    slil_id:this.item.slil_id,
                    sid:this.item.sid,
                    nums:this.item.remain_lesson_hours,
                    unit_price:this.item.unit_lesson_hour_amount,
                    amount:this.item.unit_lesson_hour_amount * this.item.remain_lesson_hours
                }
			}
		},
		methods: {
			remainNumsChange () {
                this.info.amount = this.info.nums * this.info.unit_price
			},
			ok() {
                this.$Modal.confirm({
                    title: '提示',
                    content: `确认结转此导入课时吗`,
                    onOk: () => {
                        this.transfer()
                    },
                    onCancel: () => {
                    	
                    }
                })
				
            },
            transfer(){
                this.$rest(`student_lesson_import_logs/${this.info.slil_id}/dotransfer`)
				.post(this.info)
				.success(response => {
                    this.$Message.success('结转成功')
                    this.$emit('on-success')
                    this.modal$.show = false
				})
				.error(response => {
					this.error(response.body.message)
				})
            }
		}
	}
</script>