<template>
	<Tabs value="situation">
		<TabPane label="学情记录" name="situation">
			<div class="situation-list">
				<div class="item" v-for="item in data1" @click="selectSS(item)">
					<a :class="{'selected':cssid == item.ss_id}">
						{{item.title}}
						<span class="pull-right">
							{{moment(item.create_time).format('YYYY-MM-DD')}}&nbsp;
							<Icon class="arrow-right" type="ios-arrow-right"></Icon>
						</span>
					</a>
				</div>
				<p class="empty" v-if="data1.length==0">{{notFound1}}</p>
			</div>
		</TabPane>
		<TabPane label="课时记录" name="lessonhour" v-if="sid==0&&cuId==0||sid>0">
			<div class="lesson-list">
				<div class="item" v-for="item in data2">
					<a :class="{'selected':cslid == item.sl_id}">
						{{item.sj_ids|sj_ids_text}}
						<span class="pull-right">剩余课时：{{item.remain_lesson_hours}}</span>
					</a>
				</div>
				<p class="empty" v-if="data2.length==0">{{notFound2}}</p>
			</div>
		</TabPane>
	</Tabs>
</template>
<script>
	import moment from 'moment'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [common,globals],
		props: {
			editSsId: {
				type: Number,
				default: 0
			},
			sid: {
				type: Number,
				default: 0
			},
			cuId: {
				type: Number,
				default: 0
			}
		},
		watch: {
			'editSsId':function(id) {
				if(id > 0) {
					this.edit_id_from_list = id
				}
			},
			'sid':function(id) {
				if(id > 0) {
					this.getSituation()
					this.getLessonHours()
				}
			},
			'cuId':function(id) {
				if(id > 0) {
					this.getSituation()
					this.data2.splice(0)
				}
			}
		},
		data() {
			return {
				data1: [],
				data2: [],
				cssid: -1,
				cslid: -1,
				moment: moment,
				edit_id_from_list: this.editSsId
			}
		},
		computed: {
			notFound1() {
				if(this.sid > 0 || this.cuId > 0) {
					return '没有学情记录'
				}else{
					return '请先选择服务对象'
				}
			},
			notFound2() {
				if(this.sid > 0) {
					return '没有课时记录'
				}else{
					return '请先选择服务对象'
				}
			}
		},
		methods: {
			selectSS(item) {
				let action = ''
				if(this.cssid == item.ss_id) {
					this.cssid = -1
					action = 'add'
				}else{
					this.cssid = item.ss_id
					action = 'edit'
				}
				this.$emit('on-select',{action:action,data:item})
			},
			getSituation() {
				this.$rest('study_situations')
				.get({
					sid: this.sid,
					cu_id: this.cuId,
					with: 'questionnaire.questionnaire_item,lesson_buy_suit',
					pagesize:1000
				})
				.success(res => {
					this.data1 = res.list

					if(this.edit_id_from_list > 0) {
						this.selectByExtraSSid(this.edit_id_from_list)
						this.edit_id_from_list = 0
					}
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			getLessonHours() {
				this.$rest('student_lessons')
				.get({
					sid: this.sid
				})
				.success(res => {
					this.data2 = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			selectByExtraSSid(id) {
				this.cssid = id
				let data = this.data1.find(item => item.ss_id==id)
				if(data) {
					this.$emit('on-select',{action:'edit',data:data})
				}
			}
		}
	}
</script>