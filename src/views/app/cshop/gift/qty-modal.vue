<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="600" :mask-closable="false">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="礼品" prop="cg_id" class="ivu-form-item-required">
				<select-gift v-model="info.cg_id" clearable></select-gift>
			</Form-item>
			<Form-item label="类型" prop="type" class="ivu-form-item-required">
				<RadioGroup v-model="info.type" type="button">
					<Radio :label="0">入库</Radio>
					<Radio :label="1">出库</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="数量变动" class="ivu-form-item-required">
				<InputNumber v-model="info.qty" :step="1" :min="1"></InputNumber>
			</Form-item>
			<Form-item label="变动日期">
				<DatePicker :value="info.int_day" @on-change="info.int_day=$event" type="date" placeholder="选择日期" style="width: 200px"></DatePicker>
			</Form-item>
			<Form-item label="备注" prop="remark">
				<Input type="textarea" v-model="info.remark" placeholder="请输入备注" :autosize="{minRows:3,maxRows:3}"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	import SelectGift from 'c%/SelectGift.vue'
	
	const emptyObject = {		
		cg_id: 0,
		type: 0,
		qty: 1,
		int_day: moment(new Date()).format('YYYY-MM-DD'),
		remark: ''
	}
	
	export default{
		mixins: [ common, modal ],
		props: {
			cgId: {
				type: [String,Number],
				default: 0
			}
		},
		components: {
			SelectGift
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					this.info.cg_id = this.cgId
				}
			}
		},
		data () {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			ok () {
				if(this.info.cg_id == 0){
					this.$Message.error('请先选择礼品')
					return
				}
				
				this.info.bid = this.bid$
				
				this.$rest('credit_gifts').add_url_param(this.info.cg_id,'doStorage')
				.post(this.info)
				.success(data=>{
					this.$Message.success('操作成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
				
			}
		}
	}
	
</script>

<style>
</style>