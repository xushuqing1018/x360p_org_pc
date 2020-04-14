<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="680">
		<div class="row" v-if="branchs.length>0">
			<div class="col-sm-12 bg-info">
				<Checkbox v-model="check_all" @on-change="toggleSelectAllBids" style="margin: 5px 10px;">
        			<span>适用校区</span>
        		</Checkbox>
			</div>
			
			<CheckboxGroup v-model="info.bids" class="col-sm-12">
            	<Checkbox 
            		v-for="item in branchs"
            		:label="item.bid" 
            		class="col-sm-3"
            		style="width:23%;padding:10px 10px 5px">
    				<span>{{item.branch_name}}</span>
    			</Checkbox>
           </CheckboxGroup>			
		</div>
		<p class="text-center text-danger" v-else>
			<Icon type="information-circled"></Icon>
			所有校区都已绑定公众号，若要添加新公众号，您可以添加新校区或给已绑定公众号的校区解除绑定后再添加
		</p>
		
		<Button type="primary" class="mt-3" @click="bindNew" :disabled="info.bids.length===0">去授权</Button>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	
	export default{
		mixins: [modal],
		data () {
			return {
				info: {
					bids: []				
				},
				check_all: false
			}
		},
		watch: {
			'info.bids': function (val) {
				this.check_all = val.length===this.branchs.length
			}
		},
		methods: {
			toggleSelectAllBids (val) {
				this.info.bids = []
				if(val){
					this.branchs.forEach(b=>{
						this.info.bids.push(b.bid)
					})
				}
			},
			bindNew () {
				let href = location.href,
					base_url = this.$store.state.user.info.product_url,
					cid = this.$store.state.user.info.client.cid,
					token = this.$store.state.user.token,
					uri = util.sprintf('%s/api/authorize?token=%s&cid=%s&href=%s&bids=%s',base_url,token,cid,href,this.info.bids)
				uri = uri.replace(/#/g,'$')
				location.href = uri
			}
		},
		computed: {
			branchs () {
				let list = this.$store.state.gvars.branchs
				return list.filter(l=>l.appid=='')
			}
		}
	}
</script>