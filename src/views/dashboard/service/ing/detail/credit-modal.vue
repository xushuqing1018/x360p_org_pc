<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600" class="interaction">
		<Tabs>
			<TabPane label="学生">
				<div class="credit-students">
					<div class="avatar-container" v-for="item in data" @click="creditReview(item)">
						<letter-avatar
							size="80"
							:src="item.photo_url"
							:name="item.student_name"
							title=" "
							rounded
							>
						</letter-avatar>
						<p>{{item.student_name}}</p>
						<div class="credit-detail" v-if="item.inc>0&&item.dec>0">
							<span class="left">{{item.inc}}</span>
							<span class="right">-{{item.dec}}</span>
						</div>
						<div class="credit-detail only" v-else>
							<span :class="onlyClasses(item)">{{onlyCredit(item)}}</span>
						</div>
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
	import LetterAvatar from 'c%/LetterAvatar.vue' 
	export default {
		mixins: [modal],
		components: {
			LetterAvatar
		},
		props: {
			arrange: Object
		},
		data() {
			return {
				students: [],
				total_dec: 0,
				total_inc: 0
			}
		},
		methods: {
			creditReview(item) {
				this.$Modal.open('dashboard/service/ing/detail/credit-op.vue@modal',{
					props: {
						info: item
					},
					on: {
						'on-success': () => {
							this.getStudentCredit()
							this.$emit('on-success')
						}
					}
				})
				.then(modal => {
					let sids = []
					if(item.sid) {
						sids.push(item.sid)
					}else{
						sids = this.sids
					}
					modal
					.set('sids',sids)
					.show(util.sprintf('点评 %s',item.student_name))
				})
			},
			onlyClasses(item) {
				if(item.inc == 0 && item.dec == 0) {
					return 'zero'
				}
				else if(item.inc > 0 && item.dec == 0) {
					return 'asc'
				}
				else if(item.dec > 0 && item.inc == 0) {
					return 'desc'
				}
			},
			onlyCredit(item) {
				if(item.inc == 0 && item.dec == 0) {
					return 0
				}
				else if(item.inc > 0 && item.dec == 0) {
					return item.inc
				}
				else if(item.dec > 0 && item.inc == 0) {
					return '-'+item.dec
				}
			},
			onModalOpen() {
				this.getStudentCredit()
			},
			getStudentCredit() {
				this.$rest('course_arranges').add_url_param(this.arrange.ca_id,'student_credit')
				.get()
				.success(res => {
					this.students = res.students
					this.total_dec = res.total_dec
					this.total_inc = res.total_inc
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		},
		computed: {
			data() {
				let ret = []
				ret.push({
					sid: 0,
					ca_id: this.arrange.ca_id,
					cas_id: 0,
					student_name: '全班',
					photo_url: 'https://sp1.xiao360.com/cot/quanban.png',
					dec: this.total_dec,
					inc: this.total_inc
				})
				this.students.forEach(s => {
					ret.push({
						sid: s.sid,
						ca_id: this.arrange.ca_id,
						cas_id: s.cas_id,
						student_name: s.student.student_name,
						photo_url: s.student.photo_url,
						dec: s.student_credit_history_dec,
						inc: s.student_credit_history_inc
					})
				})
				return ret
			},
			sids() {
				let ret = []
				this.students.forEach(s => {
					ret.push(s.sid)
				})
				return ret
			}
		}
	}
</script>
<style lang="less">
.interaction {
	.ivu-modal-body {
		padding-top: 0; 
		.ivu-tabs-bar {
			margin-bottom: 0;
		}
	}
	.credit-students {
		display: flex;
		flex-wrap: wrap;
    	justify-content: flex-start;
    	align-content: flex-start;
    	align-items: center;
    	padding-top: 10px;
    	background: #f6f6f6;
    	height: 420px;
    	overflow: auto;
		.avatar-container {
			position: relative;
			width: 110px;
			text-align: center;
			margin-bottom: 15px;
			cursor: pointer;
			p {
				margin-top: 15px;
			}
			img {
				background: #fff !important;
			}
			.credit-detail {
				position: absolute;
				bottom: 22px;
				left: 10px;
				width: 90px;
				>span {
					display: inline-block;
					width: 50%;
					&.left {
						background: #d3eafa;
						color: #77c0e1;
						float: left;
						border: 1px solid #fff;
						border-top-left-radius: 15px;
						border-bottom-left-radius: 15px; 
					}
					&.right {
						background: #f8dad8;
						color: #cf5c6b;
						border: 1px solid #fff;
						border-left: 0;
						border-top-right-radius: 15px;
						border-bottom-right-radius: 15px;
					}
				}
				&.only {
					text-align: center;
					>span {
						border: 1px solid #fff;
						border-radius: 15px;
						&.desc {
							background: #f8dad8;
							color: #cf5c6b;
						}
						&.asc {
							background: #d3eafa;
							color: #77c0e1;
						}
						&.zero {
							background: #e6e6e6;
							color: #fff;
						}
					}
				}
			}
		}
	}
}
</style>