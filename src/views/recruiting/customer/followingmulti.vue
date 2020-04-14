<template>
	<div class="c-grid">
		<template v-if="follow_customers.length">
			<div class="padder-sm row">
				<div class="col-sm-12">
					<Button type="primary" icon="reply" size="small" @click="back"></Button>
					<Button type="primary" icon="refresh" size="small" @click="queryCustomer"></Button>	
					<Button type="primary" icon="edit" size="small" @click="edit"></Button>
				</div>
				<div class="col-sm-12 mt-2">
					<info-basic 
						:data="data" 
						mode="multi" 
						:index="follow_index" 
						@on-prev="prevCusotmer" 
						@on-next="nextCustomer">
					</info-basic>
				</div>
				<div class="col-sm-12 mt-4">
					<follow-record ref="follow_record" :cu-id="cu_id">
						<follow-info 
							:cu-id="cu_id" 
							:data="data.customer"
							:per-add="per_add" 
							@on-next="nextCustomer" 
							@on-success="refreshFollowRecord">
						</follow-info>
					</follow-record>
				</div>
			</div>
			<info-modal ref="info" @on-success="queryCustomer"></info-modal>
		</template>
		<template v-else>
			<div class="text-center">
				<Tag color="red">跟单队列已被清空，请点击返回添加学员到跟单队列</Tag>
				<Button type="ghost" size="small" @click="back">返回</Button>
			</div>
		</template>
	</div>
</template>

<script>
	import moment 		  	from 'moment'	
	import util 		  	from '@/libs/util'
	import common 		  	from '@/libs/common.mixin'
	import globals 		  	from '@/libs/globals.mixin'
	
	import infoModal 	  	from '../recruiting-info-modal.vue'
	import dataReady 	  	from 'c%/DataReady.vue'
	import InfoBasic 		from './info-basic.vue'
	import FollowInfo 		from '../following/follow-info.vue'
	import FollowRecord		from '../following/follow-record.vue'
	
	export default{
		mixins: [globals,common],
		components: {			
			infoModal,
			dataReady,
			InfoBasic,
			FollowInfo,
			FollowRecord
		},
		data () {
			return {
				data: {},
				per_add: true
			}
		},
		mounted () {
			if(this.follow_customers.length) {
				this.queryCustomer()
			}
		},
		methods: {	
			edit () {
				this.$r('info')
				.set('info',this.data.customer)
				.edit(this.data.customer.cu_id)
			},
			changeTel (type) {
				this.$r('mobile')
				.set('type',type)
				.set('data',this.data)
				.show('编辑联系人','add')
			},			
			back () {
				this.$router.push('/recruiting/list/customer')
			},
			dataReady (rs) {
				this.data = rs[0]				
			},
			refresh (rs) {
				this.data = rs.response 
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url)
			},
			prevCusotmer () {
				this.$store.commit('prevCursor')
				this.queryCustomer()
			},
			nextCustomer () {
				this.$store.commit('nextCursor')
				this.queryCustomer()
			},
			queryCustomer () {
				this.$rest(this.info_url)
				.get()
				.success(res => {
					this.data = res
					this.deal_data(res)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			refreshFollowRecord () {
				this.$r('follow_record').init_data()
			},
			deal_data (data) {
				const eid = this.eid$
				if(data.customer.follow_eid===eid||data.deputy.filter(d=>d.eid===eid).length>0){
					this.per_add = true
				}else{
					this.per_add = false							
				}
				return data.list
			}	
		},
		computed: {	
			info_url() {
				if(this.follow_customers.length) {
					return 'customers/'+this.follow_customers[this.follow_index].cu_id
				}else{
					return ''
				}
			},
			follow_customers() {
				return this.$store.state.follow_customers.list
			},
			follow_index() {
				return this.$store.state.follow_customers.cursor
			},
			cu_id() {
				if(this.follow_customers.length) {
					return this.follow_customers[this.follow_index].cu_id
				}else{
					return 0
				}
			}
		}
	}
</script>
