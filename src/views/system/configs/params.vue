<template>
	<div>
		<div class="config-btn">
			<select-branch 
				v-model="bid" 
				size="small"
				v-if="type=='branch'"
				style="width: 180px;" 
				placeholder="请选择校区"
				>
			</select-branch>
			<a @click="toggleConfig">{{type=='global'?'校区系统参数配置':'全局系统参数配置'}}</a>
		</div>
		<global-params v-if="type=='global'"></global-params>
		<branch-params :cfg-bid="bid" v-else></branch-params>
	</div>
</template>
<script>
	import Vue from 'vue'
	import SelectBranch from 'c%/SelectBranch'
	import GlobalParams from './params/global-params'
	import BranchParams from './params/branch-params'

	const CFGBID = '__CFGBID__' 

	export default {
		components: {
			GlobalParams,
			BranchParams,
			SelectBranch
		},
		data() {
			return {
				type: 'global',
				bid: 0
			}
		},
		mounted() {
			this.getCfgBid()
		},
		watch: {
			'bid': 'setLocalCfgBid'
		},
		methods: {
			toggleConfig() {
				this.type = this.type=='global'?'branch':'global'
			},
			setLocalCfgBid() {
				Vue.localStorage.set(CFGBID,JSON.stringify(this.bid))
			},
			getCfgBid() {
				let local_bid = JSON.parse(Vue.localStorage.get(CFGBID))
				if(local_bid) {
					this.bid = local_bid
				}else{
					this.bid = this.$store.state.branch.id
				}
			}
		}
	}
</script>
<style lang="less">
	.config-btn {
		position: relative;
		height: 28px;
		padding: 5px 10px 0 10px;
		a {
			position: absolute;
			color: #39f !important;
			right: 10px;
			top: 8px;
		}
	}
</style>