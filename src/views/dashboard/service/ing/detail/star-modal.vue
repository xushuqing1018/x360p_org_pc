<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<div class="text-center">
			<p class="rank-text"><span>课堂排名</span></p>
			<div class="credit-rank">
				<table class="rank-list">
					<tr class="rank-item" v-for="(item,index) in orderBy(data,'total',-1)" @click="toggleStar(item)">
						<td width="80">
							<img src="https://sp1.xiao360.com/static/ui/m/crown.png" v-if="item.is_star">
						</td>
						<td width="100" class="left">
							<div v-html="setIndex(index+1)"></div>
						</td>
						<td width="80">
							<letter-avatar
								size="40"
								:src="item.photo_url"
								:name="item.student_name"
								title=" "
								rounded
								>
							</letter-avatar>
							
						</td>
						<td width="100" class="left">{{item.student_name}}</td>
						<td class="total">{{item.total}}分</td>
					</tr>
				</table>
			</div>
		</div>
		<div slot="footer">
			<Checkbox v-model="is_push" class="pull-left">学习之星推送给家长</Checkbox>
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import LetterAvatar from 'c%/LetterAvatar.vue'
	import guanjun from '@/img/ranking/guanjun.png'
	import yajun from '@/img/ranking/yajun.png'
	import jijun from '@/img/ranking/jijun.png'

	export default {
		mixins: [modal,common],
		components: {
			LetterAvatar
		},
		props: {
			arrange: Object
		},
		data() {
			return {
				tab: 'course',
				sids: [],
				data: [],
				is_push: true,
				head_map: {1:guanjun,2:yajun,3:jijun}
			}
		},
		methods: {
			onModalOpen() {
				this.getStudentCredit()
			},
			setIndex(index) {
				if(index<4) {
					return `<img src='${this.head_map[index]}' height="30"/>`
				}
				else if(index>3&&index<10) {
					return `<span style="margin-left: 5px">0${index}</span>`
				}
				else{
					return index
				}
			},
			toggleStar(item) {
				this.$set(item,'is_star',item.is_star==1?0:1)
			},
			getStudentCredit() {
				this.$rest('course_arranges').add_url_param(this.arrange.ca_id,'student_credit')
				.get()
				.success(res => {
					let ret = []
					res.students.forEach(s => {
						ret.push({
							is_star: s.is_star,
							sid: s.sid,
							ca_id: this.arrange.ca_id,
							cas_id: s.cas_id,
							student_name: s.student.student_name,
							photo_url: s.student.photo_url,
							dec: s.student_credit_history_dec,
							inc: s.student_credit_history_inc,
							total: s.student_credit_history_inc - s.student_credit_history_dec
						})
					})
					this.data = ret
					this.total_dec = res.total_dec
					this.total_inc = res.total_inc
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			ok() {
				let stars = this.data.filter(d => d.is_star==1)
				let names = stars.map(_ => _.student_name)
				if(stars.length==0) {
					this.$Message.error('请至少选择一个学习之星')
					return
				}
				this.data.forEach(d => {
					if(d.is_star && this.is_push) {
						d.is_push = 1
					}
				})
				this.confirm(util.sprintf('确定将【%s】评为学习之星？',names.join(',')))
				.then(() => {
					this.$rest('course_arrange_students').add_url_param('do_star')
					.post(this.data)
					.success(res => {
						this.$Message.success('操作成功')
						this.$emit('on-success')
						this.close()
					})
					.error(res => {
						this.error(res.body.message)
					})
				})
			}
		}
	}
</script>
<style lang="less">
.rank-text {
	>span {
		padding: 6px 15px;
		background: #3399FF;
		border-radius: 15px;
		color: #fff;
	}
}
.credit-rank {
	height: 420px;
	overflow: auto;
	margin-top: 10px;
	table.rank-list {
		width: 100%;
		tr {
			cursor: pointer;
		}
		td {
			text-align: center;
			padding: 5px 12px;
			div {
				display: inline-block;
			}
		}
		td.left {
			text-align: left;
		}
		tr:nth-child(2n+1) {
			background: #EBF2F7;
		}
		.total {
			font-size: 14px;
			color: #39f;
		}
	}
}
</style>