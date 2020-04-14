<template>
	<Modal v-model="modal$.show" :title="modal$.title" v-drag-modal :width="600" :mask-closable="false">
		<Form :label-width="80" v-if="modal$.show">
			<Form-item label="书籍" prop="bk_id" class="ivu-form-item-required">
				<select-book v-model="info.bk_id" clearable></select-book>
			</Form-item>
			<Form-item :label="type==1?'入库数量':'报损数量'" class="ivu-form-item-required">
				<InputNumber v-model="info.qty" :step="1" :min="1"></InputNumber>
			</Form-item>
			<Form-item :label="type==1?'入库日期':'报损日期'">
				<DatePicker :value="info.op_int_day" @on-change="info.op_int_day=$event" type="date" placeholder="选择日期" style="width: 200px"></DatePicker>
			</Form-item>
			<!--<Form-item label="责任学员" prop="sid" v-if="type==0">
				<select-student v-model="info.sid" clearable></select-student>
			</Form-item>-->
			<Form-item label="备注" prop="remark">
				<Input type="textarea" v-model="info.remark" :placeholder="placeholder" :autosize="{minRows:3,maxRows:3}"></Input>
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
	
	import SelectBook from 'c%/SelectBook.vue'
	import SelectStudent from 'c%/SelectStudent.vue'
	
	const emptyObject = {		
		bk_id: 0,
		op_type: 0,
		qty: 1,
		op_int_day: moment(new Date()).format('YYYY-MM-DD'),
		sid: 0,
		remark: ''
	}
	
	export default{
		mixins: [ common, modal ],
		props: {
			type: {
				type: [String,Number],
				default: 1
			},
			bkId: {
				type: [String,Number],
				default: 0
			}
		},
		components: {
			SelectBook,
			SelectStudent
		},
		watch: {
			'modal$.show': function (val) {
				if(val) {
					this.info.bk_id = this.bkId
					this.info.op_type = this.type
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
				if(this.info.bk_id == 0){
					this.$Message.error('请先选择书籍')
					return
				}
				
				this.info.bid = this.bid$
				
				this.$rest('books/change_qty')
				.post(this.info)
				.success(data=>{
					this.$Message.success('操作成功~')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
				
			}
		},
		computed: {
			placeholder () {
				if(this.type==1){
					return '请输入备注'
				}
				return '请输入损坏缘由'
			}
		}
	}
	
</script>

<style>
</style>