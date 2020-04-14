<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="500" class="credit-op">
		<Tabs>
			<TabPane :label="tpl.title" v-for="tpl in credit_tpl" :key="tpl.type">
				<div class="tpl-list">
					<div class="tpl-item" v-for="item in tpl.items" @click="creditOp(tpl,item)">
						<img :src="item.image">
						<p class="title">{{item.title}}</p>
						<p class="score" :class="tpl.type==1?'inc':'dec'">{{item.score}}</p>
					</div>
				</div>
			</TabPane>
		</Tabs>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common,modal],
		props: {
			info: Object
		},
		data() {
			return {
				sids: []
			}
		},
		methods: {
			creditOp(tpl,item) {
				this.confirm(util.sprintf('确定【%s】%s%s%s分?',
					this.info.student_name,item.title,tpl.type==1?'加':'减',item.score))
				.then(() => {
					let data = []
					this.sids.forEach(s => {
						data.push({
							ca_id: this.info.ca_id,
							sid: s,
							credit: Math.abs(item.score),
							cate: 1,
							type: tpl.type,
							op_type: 2,
							remark: item.title + (tpl.type==1?'+':'') + item.score + '分'
						})
					})
					this.$rest('student_credit_historys')
					.post(data)
					.success(res => {
						this.$Message.success('点评成功')
						this.$emit('on-success')
						this.close()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			}
		},
		computed: {
			credit_tpl() {
				return this.$store.state.gvars.configs.org_credit_op_tpl
			}
		}
	}
</script>
<style lang="less">
	.credit-op {
		.ivu-modal-header {
			text-align: center;
		}
		.ivu-modal-body {
			padding-top: 0; 
		}
		.tpl-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			align-content: flex-start;
			max-height: 220px;
			overflow: auto;
			.tpl-item {
				position: relative;
				width: 110px;
				text-align: center;
				margin-bottom: 15px;
				cursor: pointer;
				p.score{
					position: absolute;
					bottom: 20px;
					right: 20px;
					width: 22px;
				    height: 22px;
				    color: #fff;
				    background: #48aef9;
				    border-radius: 50%;
				    border: 2px solid #fff;
				    &.dec {
				    	background: #ec726d;
				    }
				}
			}
		}
	}
</style>