<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="450">
		<div style="position: relative;">
			<Spin size="large" fix v-if="loading"></Spin>
			<template v-else>
				<Row type="flex" justify="center" align="middle">
					<Col span="14">
						<div class="left-info text-center">
							<Tooltip placement="top" style="display: block;">
	            				<span slot="content">
	            					总课时：{{data.student_lesson_hours}}<br>
	            					消耗课时：{{data.student_lesson_hours-data.student_lesson_remain_hours}}<br>
	            					剩余课时：{{data.student_lesson_remain_hours}}
	            				</span>
	            				<i-circle 
			            			:percent="circlePercent" 
			            			:stroke-width="5" 
			            			:stroke-color="circleColor"
			            			:size="110"
			            			>
									<letter-avatar 
										size="100"
										:src="data.photo_url"
										:name="data.student_name"
										:rounded="true">
									</letter-avatar>
								</i-circle>
							</Tooltip>
							<Tag 
								type="border" 
								:color="ss_map[data.status].color">{{ss_map[data.status].text}}
							</Tag>
							<div>
								<Button 
									size="small" 
									icon="information-circled" 
									@click="goStudentDetail">浏览档案页
								</Button>
							</div>
						</div>
					</Col>
					<Col span="10">
						<div class="right-info">
							<label>姓名：</label><span>{{data.student_name}} · {{data.sex|sex}}</span><br/>
							<label>年龄：</label><span>{{getAge(data.birth_time)}}</span><br/>
							<label>钱包：</label><span>{{label_currency}}{{data.money}}</span><br/>
							<label>手机：</label><span>{{data.first_tel}}</span>
						</div>
						<operation-items 
							class="mt-2" 
							:info="data" 
							:refs="$refs"
							@route-jump="close" 
							@success="getInfo">
						</operation-items>
						<Button 
							type="primary" 
							size="small" 
							icon="log-out" 
							@click="modalDetail">查看更详细
						</Button>
						
					</Col>
				</Row>	
			</template>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} 		from '@/libs/util'
	import modal 			from '@/libs/modal.mixin'
	import common 			from '@/libs/common.mixin'
	import LetterAvatar 	from 'c%/LetterAvatar.vue'
	import OperationItems 	from '../../business/student/operation-items.vue'

	export default {
		mixins: [modal,common],
		components: {
			LetterAvatar,
			OperationItems
		},
		props: {
			sid: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				data: {},
				loading: true
			}
		},
		mounted() {
			this.getInfo()
		},
		methods: {
			getInfo() {
				this.$rest('students').add_url_param(this.sid)
				.get()
				.success(res => {
					this.data = res
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			modalDetail(){
				this.$Modal.open('components/StudentInfoModal.vue@modal', {
					props: {
						id: this.sid
					}
				}).then(modal => {
					modal.show(`【${this.data.student_name}】学员档案`);
				})
				this.close()
			},
			goStudentDetail() {
				this.close()
				this.$router.push({path:`/business/student/${this.sid}/lesson`})
			}
		},
		computed: {
			circlePercent(){
				
				let data = this.data
				
				if(!_.isEmpty(data)){
					return parseFloat( data.student_lesson_remain_hours / data.student_lesson_hours).toFixed(2) * 100					
				}
				return 0
			},
			circleColor(){
				let color = '#2db7f5'
				let percent = this.circlePercent
				let data = this.data
				if(_.isEmpty(data) || data.student_lesson_hours == 0){
					color = '#cccccc'
				}else{
	                if (percent == 100) {
	                    color = '#5cb85c'
	                }else if(percent > 50){
	                	color = '#2db7f5'
	                }else if(percent > 25){
	                	color = '#ff9900'
	                }else{
	                	color = '#ff0000'
	                }
	            }
                return color;
			}
		}
	}
</script>