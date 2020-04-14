<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<template v-if="info.hook_action=='review'">
			<table class="modal-table">
				<thead>
					<tr>
						<th><div class="ivu-table-cell">星级</div></th>
						<th><div class="ivu-table-cell">加消费积分</div></th>
						<th><div class="ivu-table-cell">操作</div></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in info.rule">
						<td>
							<div class="ivu-table-cell">{{item.star}}星</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<InputNumber v-model="item.credit" :min="0"></InputNumber>&nbsp;分
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Button 
									type="ghost" 
									size="small"
									shape="circle" 
									icon="ios-trash" 
									@click="delReviewItem(index)">
								</Button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<Button class="mt-3 ml-3" type="text" size="small" @click="addReviewItem" v-if="info.rule.length<5">添加...</Button> 
		</template>
		<div style="padding:20px 0px 30px 30px;" v-else>
			<template v-if="info.hook_action=='order_pay'">
				每缴费&nbsp;
				<InputNumber v-model="info.rule.amount" :min="0"></InputNumber>&nbsp;元，
				加消费积分&nbsp;
				<InputNumber v-model="info.rule.credit" :min="0"></InputNumber>&nbsp;分
			</template>
			<template v-else>
				{{text}}{{info.type==1?'加':'减'}}学习积分&nbsp;
				<InputNumber v-model="info.credit" :min="0"></InputNumber>&nbsp;分
			</template>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">取消</Button>
			<Button type="primary" @click="save">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'

	const emptyObject = {
		rule_name: '',
		type: 1,
		cate: 1,
		credit: 0,
		enable: 1,
		rule: ''
	}
	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				info: util.copy(emptyObject)
			}
		},
		methods: {
			delReviewItem(index) {
				this.info.rule.splice(index,1)
			},
			addReviewItem() {
				let maxStar = 0,starArr = []
				for(let i=0,len=this.info.rule.length;i<len;i++) {
					let item = this.info.rule[i]
					starArr.push(item.star)
					if(item.star > maxStar) {
						maxStar = item.star
					}
				}
				if(maxStar < 5) {
					this.info.rule.unshift({
						credit: 0,
						star: 5
					})
				}
				if(maxStar==5) {
					for(let i=5;i>0;i--) {
						let index = starArr.indexOf(i)
						if(index == -1) {
							this.info.rule.splice(maxStar-i,0,{
								credit: 0,
								star: i
							})
							break;
						}
					}
				}
			},
			save() {
				this.$rest('credit_rules').add_url_param(this.info.cru_id)
				.put(this.info)
				.success(res => {
					this.$Message.success('规则编辑成功')
					this.$emit('save')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		},
		computed: {
	        text() {
	        	if(this.info.hook_action=='attendance') {
	        		return '每出勤1次，'
	        	}
	        	if(this.info.hook_action=='absence') {
	        		return '每缺勤1次，'
	        	}
	        	if(this.info.hook_action=='leave') {
	        		return '每请假1次，'
	        	}
	        }
		}
	}
</script>