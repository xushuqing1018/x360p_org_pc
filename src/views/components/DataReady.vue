<template>
	<div>
		<template v-if="ready">
			<slot></slot>
		</template>
		<Spin fix v-else>
			<img :src="loading_img" width="50%" v-if="fromLayout"/>
			<template v-else>
	            <Icon type="load-c" size="18" class="demo-spin-icon-load"></Icon>
	            <div>数据加载中...</div>
	        </template>
        </Spin>
	</div>
</template>
<style lang="less">
.data-loading{
    height:300px;
    position: relative;
    background:#fff;
}
</style>
<script>
import {_} from '@/libs/util'
import util from '@/libs/util'
import $rest from '@/libs/rest'
import store from '@/store'

//数据缓存 data cache
const DC = {}


function cache_key(url){
	let [mode,bid] = [store.state.branch.mode,store.state.branch.id]
	if(mode == 'multi'){
		bid = store.state.branch.ids.join('-')
	}
	return util.sprintf('%s-%s-%s',mode,bid,url)
}

function http_get_promise(url,cache){
	cache = _.isUndefined(cache)?true:cache
	return new Promise((resolve,reject)=>{
		let k = cache_key(url)
		if(!_.isUndefined(DC[k]) && cache){
			resolve(DC[k])
		}else{
			$rest(url).get()
			.success(response=>{
				DC[k] = response
				resolve(response)
			})
			.error(response=>{
				reject(response)
			})
		}
		
	})
}

export default{
	name:'DataReady',
	props:{
		data: {
            type: Array,
            default () {
                return [];
            }
        },
        cache:{
        	type:Boolean,
        	default:false
        },
        fromLayout:{
        	type: Boolean,
        	default:false
        }
	},
	mounted(){
		this.init_data()
	},
	data(){
		return {
			ready:false
		}
	},
	computed:{
		loading(){
			return this.ready === false
		},
		loading_img(){
	    	let ui = window.CLIENT_PARAMS,
	    		key = 'loading_img',
	    		result = 'http://sp1.xiao360.com/static/ui/pc/boot-loading.gif'
	    	if(!_.isEmpty(ui) && !_.isEmpty(ui.pc[key])){ 
	          result = ui.pc[key]       		
	    	}
	    	return result
		}
	},
	watch:{
		data(val,oldval){
			if (JSON.stringify(val[0]) == JSON.stringify(oldval[0])){
				return
			}
			this.init_data()
		}
	},
	methods:{
		init_data(){
			if(this.data.length == 0){
				this.ready = true
				return
			}
			let promise_list = []
			this.data.forEach(item=>{
				if(_.isString(item)){
					if(item == ''){
						promise_list.push(item)
					}else{
						promise_list.push(http_get_promise(item,this.cache))
					}
					
				}else if(_.isFunction(item)){
					promise_list.push(item())
				}else{
					promise_list.push(item)
				}
			})

			Promise.all(promise_list)
			.then(result=>{
				if(this.fromLayout) {
					setTimeout(() => {
						this.ready = true
						this.$emit('ready',result)
					},1200)	
				}else{
					this.ready = true
					this.$emit('ready',result)
				}
			},error=>{
				this.$emit('error',error)
			})
		},
		getData(url,cache){
			return http_get_promise(url,cache)
		},
		refreshData(url){
			return new Promise((resolve,reject)=>{
				let k = cache_key(url)
				$rest(url).get()
				.success(response=>{
					DC[k] = response
					resolve(response)
					this.$emit('refresh',{url,response})
				})
				.error(response=>{
					this.$emit('error',response)
					reject(response)
				})
			})
		}
	}
}
</script>