<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" :width="modalWidth">
		<div :class="classes">
			<div class="issue-main">
				<Row type="flex" justify="center" align="middle">
					<Col span="2">
						<Avatar 
							:src="studentInfo.photo_url ? studentInfo.photo_url : 'http://s1.xiao360.com/common_img/avatar.jpg'" 
							shape="circle" 
							size="large">
						</Avatar>
					</Col>
					<Col span="4">
						<span>{{studentInfo.student_name}}&nbsp;·</span>
						<span>{{studentInfo.sex|sex}}</span>
						<br>
						{{studentInfo.first_tel}}
					</Col>
				</Row>
				<Row type="flex" justify="center" align="middle" class="card-no">
					<Col span="8">
						<label>卡号：</label>
						<span v-if="studentInfo.card_no">{{studentInfo.card_no}}</span>
						<span v-else>未发卡</span>
					</Col>
				</Row>
				<Row type="flex" justify="center" class="issue-tip">
					<Col span="24">
						<img 
							:src="studentInfo.card_no
							?'http://sp1.xiao360.com/static/ui/pc/swipe-ok.jpg'
							:'http://sp1.xiao360.com/static/ui/pc/swipe.gif'"/>
					</Col>
				</Row>
				<Row type="flex" justify="center" class="issue-alert">
					<Col span="12">
						<Alert :type="studentInfo.card_no?'success':'info'" show-icon>
							{{studentInfo.card_no?'发卡成功':'请刷卡'}}
						</Alert>	
					</Col>
				</Row>
				<template v-if="multiple">
					<div class="pre-student">
						<span>上一个：</span>
						<avatar-and-name
							style="display:inline-block;"
							:name="studentInfo._prev?studentInfo._prev.student_name:''"
							:src="studentInfo._prev?studentInfo._prev.photo_url:''"
							size="small"
							@click="prevStudent">
						</avatar-and-name>
					</div>
					<div class="next-student">
						<span>下一个：</span>
						<avatar-and-name
							style="display:inline-block;"
							:name="studentInfo._next?studentInfo._next.student_name:''"
							:src="studentInfo._next?studentInfo._next.photo_url:''"
							size="small"
							@click="nextStudent">
						</avatar-and-name>
					</div>
				</template>
			</div>
			<div class="issue-have" v-if="multiple">
				<Card dis-hover style="font-size:12px">
					<div slot="title">本次发卡记录如下：</div>
					<ul class="issue-have-list">
						<li v-for="item in issueList">
							<span>{{item.name}}：{{item.card_no}}</span>
						</li>
						<li v-if="issueList.length==0" class="empty">暂无</li>
					</ul>
				</Card>
			</div>
		</div>
		<div slot="footer">
			<div class="jump-wrap pull-left" v-if="multiple">
				<Checkbox v-model="autoNext">自动跳转到下一个</Checkbox>
			</div>
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import Bus from '@/bus.js'
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import AvatarAndName from 'c%/AvatarAndName.vue'

	const prefixCls = 'x-issue-card'

	export default {
		mixins:[modal,common],
		components: {
			AvatarAndName
		},
		props: {
			list: {
				type: Array,
				default: () => {
					return []
				}
			},
			current: {
				type: Number,
				default: () => {
					return 0
				}
			},
			pageSize: {
				type: Number,
				default: () => {
					return 0
				}
			},
			multiple: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				autoNext: true,
				currentIndex: 0,
				studentInfo: {},
				turnType: 'next'
			}
		},
		
		methods: {
			onIssueCard(card_no){
				this.issueCard(card_no)
			},
			prevStudent() {
				this.turnType = 'prev'
				if(this.studentInfo._prev) {
					let index = --this.currentIndex
					if(index < 0) {
						this.$emit('on-prevpage')
						this.currentIndex = 0
						return
					}
					this.studentInfo = util.copy(this.list[index])
				}
			},
			nextStudent() {
				this.turnType = 'next'
				if(this.studentInfo._next) {
					let index = ++this.currentIndex
					if(index >= this.list.length) {
						this.$emit('on-nextpage')
						this.currentIndex = 0
						return
					}
					this.studentInfo = util.copy(this.list[index])
				}
			},
			addIssueCard(card_no) {
				let currentCard = this.issueList.find(item=>item.sid==this.studentInfo.sid)
				if(currentCard == undefined) {
					let data = {
						name:this.studentInfo.student_name,
						card_no:card_no,
						sid:this.studentInfo.sid
					}
					this.$store.commit('addIssueCard',data)
				}
			},
			updateIssueCard(card_no) {
				let currentCard = this.issueList.find(item=>item.sid==this.studentInfo.sid)
				if(currentCard == undefined) {
					let data = {
						name:this.studentInfo.student_name,
						card_no:card_no,
						sid:this.studentInfo.sid
					}
					this.$store.commit('addIssueCard',data)
				}else{
					this.$store.commit('updateIssueCard',{
						id:this.studentInfo.sid,
						card_no:card_no
					})
				}
			},
			issueCard(card_no) {
				this.$rest('students')
				.add_url_param(this.studentInfo.sid,'issue_card')
				.post({
					card_no:card_no
				})
				.success(res => {
					this.$Message.success(this.studentInfo.student_name+'发卡成功')
					if(this.studentInfo.card_no) {
						this.updateIssueCard(card_no)
					}else{
						this.addIssueCard(card_no)
					}
					this.$emit('on-card-update',{
						card_no:card_no,
						index:this.currentIndex
					})
					this.studentInfo.card_no = card_no
					if(this.autoNext) {
						setTimeout(() => {
							this.nextStudent()
						},1200)
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			}
		},
		computed: {
			modalWidth() {
				return this.multiple?'780':'560'
			},
			classes () {
	            return [
	                `${prefixCls}`,
	                {
	                    [`${prefixCls}-multiple`]: this.multiple,
	                    [`${prefixCls}-single`]: !this.multiple
	                }
	            ];
	        },
	        issueList () {
	        	return this.$store.state.issue_card.list
	        }
		},
		watch: {
			'modal$.show':function(val) {
				let cardReader = this.$store.state.layout.$refs['cardReader']
				if(val) {
					Bus.$on('issue-card',this.onIssueCard)
					cardReader.setAction('issue')
				}else{
					Bus.$off('issue-card',this.onIssueCard)
					cardReader.setAction('')
				}
			},
			'list':function(list) {
				if(list.length == 0) {
					return
				}
				if(this.turnType == 'next') {
					this.currentIndex = 0
				}else{
					this.currentIndex = this.pageSize - 1
				}
				this.studentInfo = util.copy(list[this.currentIndex])
			}
		}
	}
</script>
<style lang="less">
	.x-issue-card {
		height: 320px;
		.issue-main {
			position: relative;
			.pre-student {
				position: absolute;
				left: 0;
				top: 8px;
			}
			.next-student {
				position: absolute;
				right: 0;
				top: 8px;
			}
		}
		&-multiple {
			position: relative;
	    	padding-right: 220px;

	    	.issue-have {
	    		position: absolute;
	    		right: 0;
	    		top: 0;
	    		width: 200px;
	    		.ivu-card-body {
    				height: 265px;
					overflow-y: auto;
    			}
	    		&-list {
	    			>li {
	    				margin-bottom: 8px;
	    			}
	    		}
	    	}
		}
		.card-no {
			font-size: 14px;
			font-weight: 700;
			color: #0d0f10;
			margin-top: 20px;
		}
		.ivu-col {
			text-align: center;
		}
	}
	.jump-wrap {
		padding-top: 8px;
	}
	 
</style>