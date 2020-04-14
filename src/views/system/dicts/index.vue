
<template>
	<data-ready :data="cateUrl" @ready="dataReady">
		<div class="padder-xs m-b">
			<Row :gutter="12">
				<Col span="4">
					<div class="side-sub-nav padder-xs">
						<div class="filter" v-if="total > 7">
							<Input size="small" v-model="key" icon="search" placeholder="输入字典名称过滤"></Input>
						</div>
						<ul class="p-2 list">
							<li class="m-lg-1 p-2" :class="{'active':item.did == pid}" v-for="(item,index) in navs" @click="switch_dict(item)">
								{{item.desc}}
								<Icon class="pull-right" type="chevron-right"></Icon>				
							</li>
						</ul>   
					</div>
				</Col>	
				<Col span="20">
					<Affix :offset-top="80">
						<div class="route-sub" v-if="pid > 0">
							<dict-table :pid="pid" :title="title"></dict-table>
						</div>
					</Affix>
				</Col>
			</Row>
		</div>
	</data-ready>
</template>

<script>
	import globals from '@/libs/globals.mixin'
	import common from '@/libs/common.mixin'
	import store from '@/store'
	import $rest from '@/libs/rest'
	import dictTable from './dictTable.vue'
	import dataReady from 'c%/DataReady.vue'
    
	export default{
		mixins: [globals,common],
		components:{
            dictTable,
            dataReady
        },
		computed:{
			total(){
				return this.dataList.length
			},
			navs () {
				let navs = this.dataList
				
				if(navs.length > 7 && !/^\s*$/.test(this.key)){
					return navs.filter(n=>n.desc.indexOf(this.key) !== -1)
				}
				return navs
			}
		},
		data () {
			return {
				key:'',
				pid:0,
				title:'',
				cateUrl:['dictionary?pid=0'],
				dataList:[]
			}
		},
		methods:{
			dataReady(rs){
				this.dataList = rs[0].list
				this.$nextTick(()=>{
					this.pid = rs[0].list[0].did
					this.title = rs[0].list[0].desc		
				})
				
			},
			switch_dict(d){
				this.pid 	= d.did
				this.title 	= d.desc
			}
		},
		watch:{
		}
	}
</script>