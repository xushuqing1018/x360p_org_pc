<template>
	<Modal v-drag-modal v-model="modal$.show" width="680" :title="modal$.title">
		<div class="row">
			<div class="text-center col-md-6">
				<qrcode ref="qrcode" class="mb-3" :value="uri" type="img" :size="300"></qrcode>	
				<a download="qrcode.png" :href="download_url" class="text-primary">
					<Icon type="android-download"></Icon> 下载二维码
				</a>
			</div>
			<div class="col-md-6">
				<Input v-model="search_value" placeholder="输入姓名搜索" style="width: 230px" size="small" class="mr-2" icon="ios-search"></Input>
				<Button type="primary" icon="refresh" @click="init_customer" size="small">刷新</Button>
				
				<div class="x-table-container mt-3">
					<table class="x-table">
						<tr v-for="item in filter_data">
							<td><div class="ivu-table-cell">{{item.name}}</div></td>
							<td><div class="ivu-table-cell">{{item.first_tel}}</div></td>
							<td>
								<div class="ivu-table-cell">
									<Button type="ghost" size="small" icon="plus" @click="signup(item)">报名</Button>
								</div>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
		<div slot="footer" class="text-center">			
			<span class="mt-3">请使用微信扫描二维码</span>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util from '@/libs/util' 
	import modal from '@/libs/modal.mixin'	
	import Qrcode from 'c%/qrcode/index.vue'
	export default{
		mixins: [modal],
		components: { Qrcode },
		data () {
			return {
				download_url: '',
				data: [],
				search_value: ''
			}
		},
		watch: {
			'modal$.show': function (val){
				if(val) {
					this.init_uri()		
					this.init_customer()
				}
			}
		},
		methods: {
			signup (row) {
				this.$emit('on-select',row.cu_id)
				this.close()
			},
			init_customer () {
				let today = moment(new Date()).format('YYYYMMDD')
				let param = {
					create_time: util.sprintf('[between,%s,%s]',today,today),
					input_from: 1,
					is_reg: 0
				}
				this.$rest('customers')
				.get(param)
				.success(data=>{
					this.data = data.list 
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'获取数据失败'
					})
				})
			},			
			convertImageToCanvas() {
				let image = new Image()
				let canvas = document.createElement("canvas")				
				image.src = this.$refs['qrcode'].imgData		    
			    let width = image.width
			    let height = image.height
			    canvas.width = width
			    canvas.height = height
			    canvas.getContext("2d").drawImage(image, 0, 0, width, height)
			    
			    return canvas
			},
			init_uri () {
				let canvas = this.convertImageToCanvas()
    			this.download_url = canvas.toDataURL("image/png")	//PNG格式
			}
		},
		computed: {
			filter_data () {
				let list = this.data,
					value = this.search_value
				if(list&&list.length>0&&value.length>0){
					return list.filter(l=>l.name.indexOf(value)>-1)
				}
				return list
			},
			uri () {
				let product_url = this.$store.state.user.info.product_url,
					host = this.$store.state.user.info.x_sub_host,
					result = util.sprintf('%s//%s.%s/student/#/signup?bid=%s',product_url.split('//')[0],host,product_url.split('//')[1],this.$store.state.branch.id)
					
				
				return result
			}
		}
	}
</script>

<style lang="less" scoped>
.x-table{
	width: 100%;
	border-collapse: collapse;
	border: 1px solid #e5e5e5;
	tr td{
		border-right: none;
		padding: .5em 0;
		border-bottom: 1px solid #E5E5E5;
	}
}
.x-table-container{
	max-height: 300px;
	overflow-y: auto; 
}
</style>