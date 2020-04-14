<style lang="less">
	.recruiting-profile-wrap {
		padding: 10px;
		h3 {
			font-weight: 500;
		}
		font-size: 12px;
		.ivu-row-flex {
			margin-top: 15px;
		}
	}
</style>
<template>
	<div class="c-grid">
		<div class="padder-sm row">
			<div class="col-sm-12">
				<Button type="primary" icon="chevron-left" size="small" @click="back"></Button>
				<Button type="primary" icon="refresh" size="small" @click="refreshData"></Button>	
				<Button type="primary" icon="edit" size="small" @click="edit"></Button>
			</div>		
			<data-ready ref="dr" :cache="false" :data="info_url" @refresh="refresh" @ready="dataReady" class="col-sm-12 mt-2">
				<info-basic :data="data" @update="refreshData"></info-basic>
			</data-ready>
			<div class="col-sm-12 mt-2">	
				<menu-page parent-name="recruiting_customer_info" nav-from="router" sub-class="sub-nav-content"></menu-page>
			</div>
		</div>
		<info-modal ref="info" @on-success="refreshData"></info-modal>
	</div>
</template>

<script>
	import moment 		  	from 'moment'
	import util,{_}		  	from '@/libs/util'
	import common 		  	from '@/libs/common.mixin'
	import globals 		  	from '@/libs/globals.mixin'
	
	import infoModal 	  	from '../recruiting-info-modal.vue'
	import dataReady 	  	from 'c%/DataReady.vue'
	import MenuPage 		from 'c%/MenuPage.vue'
	import InfoBasic 		from './info-basic.vue'
	
	export default{
		mixins: [globals,common],
		components: {
			infoModal,
			dataReady,
			MenuPage,
			InfoBasic
		},
		data () {
			return {
				data: {},
				cropper: {},
				tab: 'order',
				preview_src: '',
				id: this.$route.params.id
			}
		},
		mounted () {			
			
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
				this.$store.commit('setSearchDetail',true)
				this.$router.push('/recruiting/list/customer')
			},
			dataReady (rs) {
				this.data = rs[0]				
			},
			refresh (rs) {
				this.data = rs.response 
			},
			refreshData () {
				this.$r('dr').refreshData(this.info_url[0])
			}			
		},
		computed: {	
			info_url(){
				return ['customers/'+this.id]
			},
			school_grade() {
				return this.data.school_grade == 0 ? '未设置' : this.$filter('dict_title')(this.data.school_grade,'grade')
			}			
		}
	}
</script>
