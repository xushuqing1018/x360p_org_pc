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
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<div class="notice-swipe-modal">
			<p>请扫描学员提供的二维码进行签到</p>
			<img src="https://sp1.xiao360.com/static/img/qr_scanner.gif" width="400"/>	
            <Input v-model="esu_id" ref="ar_code_input" style="opacity: 0;"></Input>
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
                esu_id: '',
                timer: null
			}
        },
        mounted(){
            this.timer = setInterval(() => {
                this.$refs.ar_code_input.focus()
                if(this.esu_id != ''){
                    this.attend()
                }
            }, 1000)
        },
		methods: {
			attend() {
                let esu_id = this.esu_id
                this.esu_id = ''

				this.$rest('event_sign_ups/' + esu_id + '/attend')
            	.post()
            	.success(data=>{
            		this.$Notice.success({
            			title: data.message,
            			desc: ''
            		})
            		this.$emit('on-success')
            	})
            	.error(response => {
                    this.$Notice.error({
                        title: '签到失败',
                        desc: response.body.message||'签到失败'
                    })
                })
			}
		},
		beforeDestroy() {
            clearInterval(this.timer)
            this.timer = null
        }
	}
</script>
