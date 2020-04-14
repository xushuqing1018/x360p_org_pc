<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="580">
		<div class="notice-swipe-modal">
			<div>
				<ButtonGroup v-if="mode=='arrive'">
					<Button type="primary" icon="log-in">到校刷卡</Button>
					<Button type="ghost" icon="compose" @click="customAttend">到校登记</Button>
				</ButtonGroup>
				<ButtonGroup v-else>
					<Button type="primary" icon="log-out">离校刷卡</Button>
					<Button type="ghost" icon="compose" @click="customAttend">离校登记</Button>
				</ButtonGroup>
			</div>
			<img src="http://sp1.xiao360.com/static/ui/pc/swipe.gif" />	
		</div>
		<select-student class="hide" ref="students" v-model="sids" @select="customAttendPost"></select-student>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import Bus from '@/bus.js'
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectStudent from 'c%/SelectStudent.vue'
	export default {
		mixins:[modal,common],
		props: {
			mode: String
		},
		components: {
			SelectStudent
		},
		data() {
			return {
				sids: []
			}
		},
		methods: {
			customAttend() {
				this.sids = []
				this.$refs.students.openModal()
			},
			customAttendPost(value) {
				if(!value.length){
					this.$Message.error('请先选择学员')
					return false
				}
				
				let params = {
						sids:value,
						int_day:moment(new Date()).format('YYYYMMDD'),
						is_push:1
					},
					msg = ''
				
				
				if(this.mode=='arrive'){
					params.is_attend = 1
					msg = '到校提醒成功'
				}else{
					params.is_leave = 1
					msg = '离校提醒成功'
				}
				
				this.$rest('student_attend_school_logs').post(params)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success')
				}).error(response=>{
					this.error(response.body.message)
				})
			},
			onSchoolNotice({cardNo,action}) {
				let params = {
					int_day: moment(new Date()).format('YYYYMMDD'),
					is_push: 1,
					card_no: cardNo
				}
				let message = ''
				if(this.mode === 'arrive') {
					params.is_attend = 1
					message = '到校刷卡成功'
				}else{
					params.is_leave = 1
					message = '离校刷卡成功'
				}
				this.$rest('student_attend_school_logs')
            	.post(params)
            	.success(data=>{
            		this.$Notice.success({
            			title: '刷卡成功',
            			desc: message
            		})
            		this.$emit('on-success')
            	})
            	.error(response => {
                    this.$Notice.error({
                        title: '刷卡失败',
                        desc: response.body.message
                    })
                })
			}
		},
		computed: {
			cardReader() {
				return this.$store.state.layout.$refs['cardReader']
			}
		},
		mounted() {
			Bus.$on('school-notice',this.onSchoolNotice)
			this.cardReader.setAction('notice')
		},
		beforeDestroy() {
			Bus.$off('school-notice',this.onSchoolNotice)
			this.cardReader.setAction('')
		}
	}
</script>
