<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false">
		<DatePicker type="date" placeholder="选择日期" v-model="date" style="width: 300px"></DatePicker>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins: [ common, modal ],	
		props: {		
		},
		data () {
			return {
				date: '',
			}
		},
		methods: {
			ok () {
				if(this.date == '') {
					this.$Message.warning('请选择考勤日期！');
				}
				else {
					this.$emit('on-ok',this.date);
					this.close();
				}
			}
		}
	}
	
</script>

<style>
</style>