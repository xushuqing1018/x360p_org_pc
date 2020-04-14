<template>
	<Modal v-drag-modal :mask-closable="false" width="500" v-model="modal$.show" :title="modal$.title" @on-cancel="close">
		<Alert show-icon>
			该学员为意向客户，需要转换为正式学员才可以收费：
			<template slot="desc">
				<div class="info">
					<div class="name"><span>姓名：</span><span>{{item.name}}</span></div>
					<div class="tel"><span>电话：</span><span>{{item.first_tel}}</span></div>
				</div>
				<p class="sure">确定要转换为正式学员吗？</p>
			</template>
		</Alert>
		<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>                                
            <Button type="primary" :loading="saving" @click="ok">确认</Button>                
        </div>
	</Modal>
</template>
<script>
	import modalMixin from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import $rest from '@/libs/rest'

	export default {
		name: 'ToFormal',
		mixins: [modalMixin,globals,grid,common],
		components: {
			
		},
		props: {
			item: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				
			}
		},
		mounted() {

		},
		methods: {
			close() {
				this.modal$.show = false
			},
			ok() {
				this.$rest('customers/do_reg')
				.post({cu_id:this.item.cu_id})
				.success(response=>{
					this.$router.push({
						name:'dashboard_payment', 
						params:{sid: response.data}
					})
				})
				.error(response=>{
					this.error(response.body.message)
				})
			}
		},
		computed: {

		}
	}
</script>
<style lang="less" scoped>
	.info {
		margin-top: 10px;
		.name {
			display: inline-block;
			padding-left: 15px;
		}
		.tel {
			display: inline-block;
			padding-left: 15px;
		}
	}
	.sure {
		margin-top: 10px;
	}
</style>