<template>
	<div class="c-grid">
		<div class="box box-query">
			<Button type="primary" icon="refresh" @click="init_data" :loading="loading">刷新</Button>

			<!-- <Button type="primary" @click="" icon="ios-download-outline" class="ml-2">导出</Button> -->

			
		</div>
		
		<div class="box box-result">
			<div class="content">
				<div class="ivu-table-wrapper">
					<table class="modal-table" v-loading="'accounting_accounts'">
						<tr>
							<td colspan="2">
								<div class="ivu-table-cell clearfloatblock">
									<span class="pull-left text-primary font-weight-bold font-lg">资产</span>
									<span class="pull-right text-primary font-weight-bold font-lg">{{asset.sum}}</span>
								</div>
							</td>						
						</tr>
						<template v-for="l in list">
							<tr>
								<td colspan="2">
									<div class="ivu-table-cell clearfloatblock">
										<span class="pull-left text-primary font-weight-bold font-lg">{{l.label}}</span>
										<span class="pull-right text-primary font-weight-bold font-lg">{{asset[l.field]}}</span>
									</div>
								</td>							
							</tr>
							<tr v-for="item in filter_data(l.field)">
								<td>
									<div 
										class="ivu-table-cell ml-3 cursor text-primary" 
										@click="detail(item)">
										{{item.aa_id|accounts}}
									</div>
								</td>
								<td><div class="ivu-table-cell text-right">{{item.amount}}</div></td>
							</tr>
						</template>					
						<tr>
							<td colspan="2">
								<div class="ivu-table-cell clearfloatblock">
									<span class="pull-left text-primary font-weight-bold font-lg">净资产</span>
									<span class="pull-right text-primary font-weight-bold font-lg">{{asset.diff}}</span>
								</div>
							</td>	
						</tr>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import store from '@/store'
	
	const infoObject = {
		sum: 0,			//总资产
		rmb: 0,			//货币资产
		receivable:0,	//应收账款
		debt: 0,		//负债
		diff: 0			//净资产
	}
	
	export default{
		mixins: [grid],		
		data () {
			return {
				rest_api: 'accounting_accounts',
				pk: 'tid',
				asset: util.copy(infoObject),
				list: [
					{field:'rmb',label: '货币资金'},
					{field:'receivable',label: '应收账款'},
					{field:'debt',label: '负债'}					
				]
			}
		},
		filters: {
			accounts (aa_id){
				let accounts = store.state.gvars.accounts,
					obj = {},
					result = ''
				if(accounts.length>0){
					obj = accounts.find(a=>a.aa_id==aa_id)
					if(obj){
						result = obj.name
					}
				}
				return result
			}
		},
		mounted () {
			this.init_data()
		},			
		methods: {
			detail (row) {				
				this.$router.push({name:'business_iae_tally',params:{aa_id:row.aa_id}})
			},
			deal_data (data) {
				let list = data.list,
					asset = util.copy(infoObject)			
				
				this.asset.sum 			= this.getSumAmount(list,'all')
				this.asset.rmb 			= this.getSumAmount(list,[0,1,2])
				this.asset.debt 		= this.getSumAmount(list,[4])
				this.asset.receivable 	= this.getSumAmount(list,[3])
				this.asset.diff 		= this.asset.sum - this.asset.debt
				
				return list
			},
			filter_data (type) {
				let data = this.data,
					map_filter = {'rmb':[0,1,2],'receivable':[3],'debt':[4]},
					filter = (item) => {
						return map_filter[type].indexOf(item.type)>-1					
					}
					
				return data.filter(filter)
			},
			getSumAmount (list,type) {
				let filter = (item) =>{						
						return type=='all'?item.type<4:type.indexOf(item.type)>-1												
					},					
					data = list.filter(filter),
					result = 0				
					
				if(data.length>0){
					data.forEach(d=>{
						result += parseFloat(d.amount)
					})
				}
				
				return parseFloat(result).toFixed(2)
			}
		}
	}
	
</script>
