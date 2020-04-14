<style lang="less">
.filter-column{
	.ivu-dropdown-item{
		padding:3px 10px;
	}
	.ivu-checkbox-wrapper{
		margin-bottom:0;
	}
	.dropdown-item-wrap{
		max-height:300px;
		overflow:scroll;
	}
}
</style>
<template>
<div class="filter-column">
    <Dropdown
    placement="bottom-end">
        <Button type="primary">
    		选择列
            <Icon type="funnel"></Icon>
        </Button>
        <DropdownMenu slot="list">
        	<DropdownItem>
        		<!---->
        		<Checkbox v-model="selectAll" @on-change="toggleSelect" @click.native.stop="">全选</Checkbox>
        	</DropdownItem>
        	<div class="dropdown-item-wrap">
	            <DropdownItem v-for="(item,k) in items">
	                <Checkbox v-model="item.show" :disabled="item.disabled" @click.native.stop="setKey(k)">{{item.title}}</Checkbox>
	            </DropdownItem>
	        </div>
        </DropdownMenu>
    </Dropdown>
</div>
</template>
<script>
import Vue from 'vue'
import util from '@/libs/util'
const Hash = require('object-hash')
const KC = '__LOCALCOLUMNMAP__'
export default{
	name:'filterColumn',
	props:{
		keys:{
			type:Object,
			default(){
				return {}
			}
		}
	},
	data(){
		return {
			items:{},
			hash: '',
			selectAll:false,

		}
	},
	created(){
		this.hash = Hash(this.keys)
		let local = JSON.parse(Vue.localStorage.get(KC))
		if(local) {
			if(local[this.hash]){
				this.items = local[this.hash]
				this.setKeys()
			}
			else{
				local[this.hash] = this.keys
				Vue.localStorage.set(KC,JSON.stringify(local))
				this.items = util.copy(this.keys)
			}
		}
		else{
			let obj = {}
			Vue.localStorage.set(KC,JSON.stringify(obj))
		}
		this.changeAllState()
	},
	methods:{
		toggleSelect(){
			for(let item in this.items){
				if(!this.items[item].disabled){
					this.items[item].show = this.selectAll					
				}
			}
			this.setKeys()
		},
		setKeys(){
			for(let item in this.items){
				this.keys[item].show = this.items[item].show
			}
			this.setLocalColumn()
		},
		setKey(k){
			this.keys[k].show = !this.items[k].show
			this.setLocalColumn()
			this.changeAllState()
		},
		changeAllState() {
			let b = Object.keys(this.keys).length==Object.values(this.keys).filter(item=>item.show==true).length
			if(this.selectAll&&!b) {
				this.selectAll = false
			}
			if(!this.selectAll&&b) {
				this.selectAll = true
			}
		},
		setLocalColumn() {
			let local = JSON.parse(Vue.localStorage.get(KC))
			local[this.hash] = this.keys
			Vue.localStorage.set(KC,JSON.stringify(local))
		}
	}
}
</script>