<style lang="less">
	.notice-swipe-modal {
		text-align: center;
		img {
			border: 1px solid #eee;
			border-radius: 2%;
			margin-top: 20px;
		}
	}
</style>
<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="580">
		<div class="notice-swipe-modal">
			<RadioGroup v-model="swipeType" class="d-block" type="button">
				<Radio label="attend"><Icon type="log-in"></Icon>到校</Radio>
				<Radio label="leave"><Icon type="log-out"></Icon>离校</Radio>
			</RadioGroup>
			<img src="http://sp1.xiao360.com/static/ui/pc/swipe.gif" />	
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>
<script>
	import Bus from '@/bus.js'
	import moment from 'moment'
	import modal from '@/libs/modal.mixin'
	export default {
		mixins:[modal],
		data() {
			return {
				swipeType: 'attend'
			}
		},
		methods: {
			onSchoolNotice({cardNo,action}) {
				let params = {
					int_day: moment(new Date()).format('YYYYMMDD'),
					is_push: 1,
					card_no: cardNo
				}
				let message = ''
				if(this.swipeType === 'attend') {
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
                        desc: response.body.message||'刷卡失败'
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
