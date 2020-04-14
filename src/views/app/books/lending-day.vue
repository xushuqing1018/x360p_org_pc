<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false">
		出借日期：
		<DatePicker 
			:value="date"
			type="date" 
			placeholder="选择日期" 
			style="width: 300px"
			@on-change="date=$event"
			>
		</DatePicker>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ common, modal ],	
		props: {		
		},
		data () {
			return {
				date: moment().format('YYYY-MM-DD'),
			}
		},
		methods: {
			ok () {
				if(this.date == '') {
					this.$Message.warning('请选择借出日期')
					return
				}
				this.$emit('on-ok',this.date)
				this.close()
			}
		}
	}
	
</script>

<style>
</style>