<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="750">
		<div class="service-detail">
			<table>
				<thead>
					<tr>
						<th>服务类型</th>
						<th>完成情况</th>
						<th>完成时间</th>
						<th>完成人</th>
					</tr>
				</thead>
				<tbody v-for="(val,key) in data" v-if="key!=='cycle'">
					<tr>
						<td colspan="4" class="text-center">{{val.text}}</td>
					</tr>
					<tr v-for="item in val.items" style="cursor: pointer;">
						<td>{{item.text}}</td>
						<td @click="operateService(item)">
							<Icon type="checkmark-round" color="#19be6b" size="16" v-if="item.is_finish"></Icon>
							<Icon type="close-round" color="red" size="16" v-else></Icon>
							<Icon type="log-in" class="pull-right" size="16"></Icon>
						</td>
						<td>{{item.create_time}}</td>
						<td>{{item.create_uid}}</td>
					</tr>
				</tbody>
			</table>
			<Spin fix v-if="loading">加载中...</Spin>
		</div>
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
		mixins: [modal,common],
		props: {
			arrange: {
				type: Object,
				default(){
					return {}
				}
			}
		},
		data() {
			return {
				data: {},
				loading: false
			}
		},
		mounted() {
			
		},
		methods: {
			onModalOpen() {
				this.get_detail_service()
			},
			get_detail_service() {
				this.loading = true
				this.$rest('course_arranges').add_url_param('get_detail_service')
				.get({
					ca_id:this.arrange.ca_id
				})
				.success(res => {
					this.data = res
					this.loading = false
				})
				.error(res => {
					this.loading = false
					this.error(res.body.message)
				})
			},
			operateService(item) {
				if(item.name=='remind') {
					this.$Modal.open('dashboard/service/before/remind-modal',{
						props: {
							'ca-id': this.arrange.ca_id
						},
						on: {
							'on-success':() => {
								this.get_detail_service()
							}
						}
					})
					.then(modal => {
						modal.show(util.sprintf('【%s】%s',this.arrange.course_name,item.text))
					})
				}
				else if(item.name=='upload') {
					if(item.course_prepare) {
						this.$Modal.open('service/bclass/prepare/info-modal.vue',{
							on: {
								'on-success':() => {
									this.get_detail_service()
								}
							}
						})
						.then(modal=>{
							modal
							.set('cp_id',item.course_prepare.cp_id)
							.show('编辑'+item.text,'edit')
						})
					}else {
						this.$Modal.open('service/bclass/prepare/info-modal.vue',{
							props: {
								arrange: this.arrange
							},
							on: {
								'on-success':() => {
									this.get_detail_service()
								}
							}
						})
						.then(modal=>{
							modal.show(item.text,'add')
						})
					}
				}
				else if(item.name=='listen') {
					if(item.homework_task) {
						this.$Modal.open('service/aclass/homework/homework-add.vue@modal',{
							on: {
								'on-success':() => {
									this.get_detail_service()
								}
							}
						})
						.then(modal=>{
							modal
							.set('info',item.homework_task)
							.show('编辑'+item.text,'edit')
						})
					}else {
						this.$Modal.open('service/aclass/homework/homework-add.vue@modal',{
							props: {
								arrange: this.arrange
							},
							on: {
								'on-success':() => {
									this.get_detail_service()
								}
							}
						})
						.then(modal=>{
							modal.show(item.text,'add')
						})
					}
				}
				else if(item.name=='credit') {
					this.$Modal.open('dashboard/service/ing/detail/credit-modal',{
						props: {
							arrange: this.arrange
						},
						on: {
							'on-success':() => {
								this.get_detail_service()
							}
						}
					})
					.then(modal=>{
						modal.show(util.sprintf('%s【%s】',item.text,this.arrange.course_name))
					})
				}
				else if(item.name=='attend') {
					this.showAttendModal(this.arrange)
				}
				else if(item.name=='star') {
					this.$Modal.open('dashboard/service/ing/detail/star-modal',{
						props: {
							arrange: this.arrange
						},
						on: {
							'on-success':() => {
								this.get_detail_service()
							}
						}
					})
					.then(modal=>{
						modal.show(util.sprintf('评%s【%s】',item.text,this.arrange.course_name))
					})
				}
				else if(item.name == 'photo') {
					this.$Modal.open('dashboard/service/ing/detail/image-modal',{
						props: {
							arrange: this.arrange
						},
						on: {
							'on-success':() => {
								this.get_detail_service()
							}
						}
					})
					.then(modal=>{
						modal.show(this.arrange.course_name)
					})
				}
				else if(item.name == 'arrive'||item.name == 'leave') {
					this.$Modal.open('dashboard/service/before/detail/arrive-modal.vue',{
						props: {
							arrange: this.arrange,
							mode: item.name
						},
						on: {
							'on-success':() => {
								this.get_detail_service()
							}
						}
					})
					.then(modal => {
						modal.show(item.text)
					})
				}
				else if(item.name == 'feedback') {
					let catt = this.arrange.class_attendance
					if(catt) {
						this.getClassReview(catt)
					}else{
						this.$Message.error('该次课还没有考勤，不能点评')
					}
				}
			},
			getClassReview(catt) {
				this.loading = true
				this.$rest('reviews')
				.get({
					catt_id: catt.catt_id,
					with: 'review_tpl_setting'
				})
				.success(res => {
					this.loading = false
					if(res.list.length) {
						let review = res.list[0]
						this.$Modal.open('components/ReviewModal.vue@modal',{
							props: {
								currentTplProp: review.review_tpl_setting
							}
						})
						.then(modal => {
							modal
							.set('scene', 'view')
							.set('post', util.copy(review))
							.show('课评详情','view')
						})
					}else{
						this.$Modal.open('components/review/index.vue@modal',{
							props: {
								'catt-id': catt.catt_id,
								'fixed-object': true
							},
							on: {
								'on-success':() => {
									this.get_detail_service()
								}
							}
						})
						.then(modal => {
							modal
							.show('课后点评')
						})
					}
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			showAttendModal (item) {	
				let class_name = this.setTitle(item),				
					title = util.sprintf('登记考勤【%s】',class_name)
					
				if(item.is_attendance===2){
					title = util.sprintf('查看考勤【%s】',class_name)
				}
				
				if(item.class_attendance){
					item.lesson_remark = item.class_attendance.lesson_remark 
				}
				
				this.$Modal.open('business/attendance/attendance/index.vue@modal',{
					on: {
						'on-success':(catt_id) => {
							this.get_detail_service()
							this.$emit('on-success')
							if(!item.class_attendance) {
								item.class_attendance = {}
								item.class_attendance.catt_id = catt_id
							}
						}
					}
				})
				.then(modal=>{
					modal.set('arrange',item)
					.set('ca_id',item.ca_id)
					.show(title)
				})
			},
			setTitle (item) {
				let result = '',
					mapTitle = {1:'一对一',2:'一对多'}
				
				if(item.lesson_type===0){
					if(item.is_trial===1||item.is_makeup===1){
						result = item.name
					}else{
						if(item.one_class!=null){
							result = item.one_class.class_name
						}	
					}	
				}else{
					result = mapTitle[item.lesson_type]
				}
							
				return result
			},
		}
	}
</script>
<style lang="less" scoped>
.service-detail {
	position: relative;
	height: 450px;
	overflow: auto;
	table {
		width: 100%;
		thead {
			th {
				border: 1px solid #e3e8ee;
				padding: 6px 10px;
			}
		}
		tbody {
			td {
				border: 1px solid #e3e8ee;
				padding: 6px 10px;
			}
		}
		.ivu-icon-log-in {
			cursor: pointer;
		}
	}
}
</style>