<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="800" :mask-closable="false">
		请选择你想要合并到的渠道：<br>
		<Select v-model='mc_id' style="width:200px;margin-top:10px;">
			<Option v-for="item in channel" :value="item.mc_id" :key="item.mc_id">{{ item.channel_name }}</Option>
		</Select>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="loading">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	
	const emptyObject = {
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
		},
		data () {
			return {
				channel: [],
				mc_id: 0,
				loading: false
			}
		},
		watch: {
			
		},
		created () {
			// this.mc_id = this.channel[0].mc_id
			// console.log(this.channel)
		},
		methods: {
			ok () {
				if(this.mc_id == 0) {
					this.$Message.warning({
						content: '请选择一个渠道！'
					})
					return false;
				}
				this.loading = true;
				var mc_ids = [];
				for(let i in this.channel) {
					if(this.mc_id != this.channel[i].mc_id) {
						mc_ids.push(this.channel[i].mc_id);
					}
				}
				this.$http.put('market_channels/do_merge',{
					mc_ids : mc_ids,
					mc_id: this.mc_id
				})
				.then(function(response) {
					this.$Message.success({
						content: '合并成功！'
					})
					this.loading = false;
					this.$emit('on-success')
					this.close()
				})
			}
		}
	}
	
</script>

<style>
</style>