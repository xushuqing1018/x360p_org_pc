<template>
	<Modal v-drag-modal :mask-closable="false" width="650" v-model="modal$.show" :title="modal$.title">
		<Tabs v-if="modal$.show" class="per-wrap">
			<TabPane label="功能权限">
				<span v-if="persDefine=='pers'">
					当前拥有权限如下，您还可以设置 <a href="javascript:;" @click="persDefine='disable_pers'">额外禁用权限</a>
				</span>
				<span v-if="persDefine=='disable_pers'">
					当前额外禁用权限如下， <a href="javascript:;" @click="persDefine='pers'">返回拥有权限设置</a>
					<i v-if="disablePersList.length > 0">共有{{disablePersList.length}}个禁用项目，请展开查看</i>
				</span>
				<div class="search-key-box">
					<Input size="small" type="text" v-model="searchKey" placeholder="输入关键字搜索"></Input>
				</div>
				<div v-show="persDefine=='pers'">
					<x-tree
						ref="ref_x_tree"
						:search-key="searchKey"
						:data="items"
						text-field-name="title"
				    	value-field-name="uri"
				    	:show-checkbox="true"
				    	:multiple="true"
				    	:allowBatch="true"
						>
					</x-tree>
				</div>
				<div v-show="persDefine=='disable_pers'">
					<x-tree
						ref="ref_x_tree2"
						:search-key="searchKey"
						:data="disableItems"
						text-field-name="title"
				    	value-field-name="uri"
				    	:show-checkbox="true"
				    	:multiple="true"
				    	:allowBatch="true"
						>
					</x-tree>
				</div>
			</TabPane>
			<TabPane label="资源权限">
				<div class="pl-4">
					<div class="checkall-box">
						<Checkbox
							:indeterminate="indeterminate"
							:value="checkAllResPer"
							@click.prevent.native="handleCheckAll">
							全选
						</Checkbox>
					</div>
					<div style="overflow: auto;max-height: 560px;">
						<CheckboxGroup v-model="checkResPerGroup" @on-change="checkResPerChange" class="res-pers">
							<Checkbox v-for="(item,index) in res_pers" :key="index" :label="item.uri" class="d-block">{{item.text}}</Checkbox>
						</CheckboxGroup>
					</div>
				</div>
			</TabPane>
			<TabPane label="应用权限" v-if="app_pers.length>0">
				<div class="pl-4">
					<div class="checkall-box">
						<Checkbox
							:indeterminate="indeterminate2"
							:value="checkAllAppPer"
							@click.prevent.native="handleCheckAll2">
							全选
						</Checkbox>
					</div>
					<div class="row" style="overflow: auto;max-height: 560px;">
						<div class="col-sm-2">
							<p class="app-name" v-for="(name,index) in app_pers_name" :key="index">{{name}}</p>
						</div>
						<div class="app-per col-sm-10 row">
							<CheckboxGroup v-model="checkAppPerGroup" @on-change="checkAppPerChange" class="res-pers" style="width: 100%">
								<Checkbox 
									class="col-sm-4" 
									v-for="(per,index) in app_pers" 
									:key="index"
									:label="per.value" 
									style="display: inline-block;"
									>{{per.label}}
								</Checkbox>
							</CheckboxGroup>
						</div>
					</div>
				</div>
			</TabPane>
		</Tabs>
		<div slot="footer">
            <Button type="ghost" @click="close">取消</Button>
            <Button type="primary" :loading="saving" @click="save">确定</Button>
        </div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import XTree from 'c%/XTree.vue'

	const doc = 'ivu-icon ivu-icon-document'
	const folder = 'ivu-icon ivu-icon-ios-folder'


	export default {
		mixins: [modal,common],
		components: {
			XTree
		},
		data() {
			return {
				persDefine:'pers',
				persList:[],
				disablePersList:[],
				items: [],
				disableItems: [],
				checkAllResPer: false,
				checkAllAppPer: false,
				checkResPerGroup: [],
				checkAppPerGroup: [],
				res_cache: [],
				app_cache: [],
				searchKey: ''
			}
		},
		methods: {
			setPers(pers,disable_pers){
				this.persList = pers
				this.disablePersList = disable_pers
				this.buildItems()
				this.initResPerGroup()
				this.initAppPerGroup()
				return this
			},
			buildItems(){
				this.items = this.buildPerItems(this.globalPersList,this.persList)
				this.disableItems = this.buildDisablePerItems(this.globalPersList,this.disablePersList)
			},
			buildPerItems(persList,pers){
				let items = []
				persList.forEach(item=>{
					let opened = false,
						is_selected = pers.indexOf(item.uri) !== -1,
						is_selected_part = false,
						sub_length = 0,
						sub_selected_length = 0

					if(item.sub && item.sub.length > 0){
						sub_length = item.sub.length
						item.sub.forEach(subitem=>{
							if(pers.indexOf(subitem.uri) !== -1){
								sub_selected_length++
							}
						})

						if(sub_selected_length > 0){
							if(sub_selected_length == sub_length){
								is_selected = true
							}else{
								is_selected_part = true
							}
							opened = true
						}
					}

					let child = {
							opened: opened,
							title: item.text,
							uri: item.uri,
							icon: item.sub ? folder : doc,
							selected: is_selected,
							selected_part: is_selected_part
						}

					if(item.sub && item.sub.length > 0){
						child.children = this.buildPerItems(item.sub,pers)
					}

					items.push(child)
				})
				return items
			},
			buildDisablePerItems(persList,pers){
				let items = []
				persList.forEach(item=>{
					let opened = true,
						is_selected = pers.indexOf(item.uri) !== -1,
						is_selected_part = false,
						sub_length = 0,
						sub_selected_length = 0

					if(item.sub && item.sub.length > 0){
						sub_length = item.sub.length
						item.sub.forEach(subitem=>{
							if(pers.indexOf(subitem.uri) !== -1){
								sub_selected_length++
							}
						})

						if(sub_selected_length > 0){
							if(sub_selected_length == sub_length){
								is_selected = true
							}else{
								is_selected_part = true
							}
						}
					}

					let child = {
							opened: opened,
							title: item.text,
							uri: item.uri,
							icon: item.sub ? folder : doc,
							selected: is_selected,
							selected_part: is_selected_part
						}

					if(item.sub && item.sub.length > 0){
						child.children = this.buildDisablePerItems(item.sub,pers)
					}

					items.push(child)
				})
				return items
			},
			handleCheckAll() {
				if(this.indeterminate) {
					this.checkAllResPer = false
				}else{
					this.checkAllResPer = !this.checkAllResPer
				}
				if(this.checkAllResPer) {
					this.checkResPerGroup = this.res_cache
				}else{
					this.checkResPerGroup = []
				}
			},
			handleCheckAll2() {
				if(this.indeterminate2) {
					this.checkAllAppPer = false
				}else{
					this.checkAllAppPer = !this.checkAllAppPer
				}
				if(this.checkAllAppPer) {
					this.checkAppPerGroup = this.app_cache
				}else{
					this.checkAppPerGroup = []
				}
			},
			checkResPerChange(data) {
				if(data.length === this.res_pers.length) {
					this.checkAllResPer = true
				}else if(data.length === 0) {
					this.checkAllResPer = false
				}
			},
			checkAppPerChange(data) {
				if(data.length === this.app_pers.length) {
					this.checkAllAppPer = true
				}else if(data.length === 0) {
					this.checkAllAppPer = false
				}
			},
			initResPerGroup() {
				this.checkResPerGroup = []
				this.res_cache = []
				this.res_pers.forEach(per => {
					if(this.persList.indexOf(per.uri) > -1) {
						this.checkResPerGroup.push(per.uri)
					}
					this.res_cache.push(per.uri)
				})
				if(this.checkResPerGroup.length === this.res_pers.length) {
					this.checkAllResPer = true
				}else{
					this.checkAllResPer =false
				}
			},
			initAppPerGroup() {
				this.checkAppPerGroup = []
				this.app_cache = []
				this.app_pers.forEach(per => {
					if(this.persList.indexOf(per.value) > -1) {
						this.checkAppPerGroup.push(per.value)
					}
					this.app_cache.push(per.value)
				})
				if(this.checkAppPerGroup.length === this.app_pers.length) {
					this.checkAllAppPer = true
				}else{
					this.checkAllAppPer =false
				}
			},
			get_pers(list) {
				let pers = []
				list.forEach(item => {
					pers.push(item.value)
				})
				return pers
			},
			save() {
				let perModels = this.$refs['ref_x_tree'].getSelectedNodes()
				let disablePerModels = this.$refs['ref_x_tree2'].getAbsSelectedNodes()
				let per_list = [],disable_per_list
				per_list = this.get_pers(perModels)
				per_list = per_list.concat(this.checkResPerGroup).concat(this.checkAppPerGroup)
				disable_per_list = this.get_pers(disablePerModels)
				this.$emit('save-pers',{per_list,disable_per_list})
				this.close()
			}
		},
		computed:{
			globalPersList(){
				return this.$store.state.gvars.pers
			},
			res_pers() {
				return this.$store.state.gvars.res_pers
			},
			apps() {
				return this.$store.state.gvars.apps
			},
			app_pers() {
				let ret = []
				this.apps.forEach(app => {
					ret.push(
						{
							value: 'app.' + app.app_ename,
							label: '使用权限'
						},
						{
							value: app.app_ename + '.manage',
							label: '管理权限'
						}
					)
				})
				return ret
			},
			app_pers_name() {
				let ret = []
				this.apps.forEach(app => {
					ret.push(app.app_name)
				})
				return ret
			},
			indeterminate() {
				if(
					this.checkResPerGroup.length > 0 && 
					this.checkResPerGroup.length < this.res_pers.length) {
					return true
				}
				return false
			},
			indeterminate2() {
				if(
					this.checkAppPerGroup.length > 0 && 
					this.checkAppPerGroup.length < this.app_pers.length) {
					return true
				}
				return false
			}
		}
	}
</script>
<style lang="less">
	.per-wrap {
		.checkall-box {
			border-bottom: 1px solid #e9e9e9;
			margin-bottom:8px;
		}
		.res-pers .ivu-checkbox-wrapper {
			font-size: 14px;
		}
	}
	.app-name {
		font-size: 14px;
		margin-bottom: 8px;
	}
	.search-key-box{
		padding-top:5px;
		padding-bottom:5px;
	}
</style>