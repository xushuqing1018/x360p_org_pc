<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="900">	
		<div class="a4">	
			<div class="row" v-if="data.length > 0">
				<div class="col-sm-3" v-for="(item,index) in data">
					<div class="qrcode-wrap">
						<img :src="'http://qr.topscan.com/api.php?text=attendance/'+item.sid">
						<p>{{item.student_name}}<span class="nick-name" v-if="item.nick_name != ''">{{item.nick_name}}</span></p>
					</div>
				</div>
			</div>
			<p class="empty" v-else>没有要打印的数据</p>
		</div>
		<div slot="footer" class="text-center">			
			<Button type="primary" size="small" v-printdom="'.a4'">打印</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	import globals from '@/libs/globals.mixin'
	import printdom from '@/libs/printdom'
	
	
	
	export default{
		mixins: [common,modal,globals],
		
		props: {
			data: {
				type: Array,
				default:()=>{
					return []
				}
			}
		},
		directives:{
			printdom
		},
		data () {
			return {
							
			}
		},
		watch: {
					
		}
	}
</script>
<style lang="less">
.qrcode-wrap{
	img{width:100%}
	p{text-align:center}
}
</style>