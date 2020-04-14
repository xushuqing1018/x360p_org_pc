<style lang="less" scoped>
.content-body{
    &.loading{
        position:relative;
        .table{
        	>tbody{
        		display:none;
        	}
        }
    }
    min-height:300px;
    .loading-wrap{
        top:42px;
        height:255px;
        .loading-text{
            margin-top:114px;
        }
    }
}
</style>
<template>
	<Card :bordered="false">
        <p slot="title">{{title}}</p>
		<div class="c-grid">
			<div class="box box-result">
				
	            <div class="toolbar">
	                <Button :disabled="is_add_disabled" type="primary" size="small" @click="add" icon="plus">新增</Button>
	                <Poptip
				        confirm
				        title="您确认要进行删除操作吗？"
				        @on-ok="del"
				        @on-cancel="cancel">
				        <Button type="error" size="small" icon="ios-close-empty" :disabled="selected.none">删除</Button>
				    </Poptip>
				    <span>
					    <Alert class="m-t" type="info" show-icon v-if="is_sort_enable">排序值数字越大越靠前<span v-if="is_value_must_number">，值必须为数字</span>
					</Alert>
					</span>
	            </div>
	            <div class="content">
	                <div class="content-body" v-loading.like="'dictionary'" style="max-height: 500px;overflow: auto">
	                	<table class="table">
	                		<thead>
	                			<tr>
	                				<th width="50"><Checkbox v-model="selected.all" @on-change="toggle_select_all" :disabled="is_select_all_disabled"></Checkbox></th>
	                				<th v-if="show_did">DID</th>
	                				<th>名称</th>
	                				<th v-if="is_name_enable" v-help="valueHelp">值</th>
	                				<th>描述</th>
	                				<th v-if="is_sort_enable">排序</th>
	                				<th>启用</th>
	                				<th width="100">操作</th>
	                			</tr>
	                		</thead>
	                		<tbody>
	                			<tr v-if="action == 'add'">
									<td></td>
									<td v-if="show_did"></td>
									<td>
										<Input 
										size="small" 
										v-model="nd.title" 
										placeholder="输入名称" 
										style="width: 100px"
										@on-change="autoNValue"
										>
										</Input>
									</td>
									<td v-if="is_name_enable">
										<Input 
										size="small" 
										v-model="nd.name" 
										placeholder="输入值"
										@on-keyup="fixValue(nd)" 
										style="width: 100px">
											
										</Input>
									</td>
									<td>
										<Input size="small" v-model="nd.desc" placeholder="输入描述" style="width: 300px"></Input>
									</td>
									<td v-if="is_sort_enable">
										<Input size="small" v-model="nd.sort" placeholder="输入排序数字" style="width: 60px"></Input>
									</td>
									<td>
										<i-switch v-model="nd.display" :true-value="1" :false-value="0"></i-switch>
									</td>
									<td>
										<Button-group>
											<Button type="primary" @click="save" :disabled="saving">确定</Button>
									        <Button @click="cancel" :disabled="saving">取消</Button>
									    </Button-group>
									</td>
	                			</tr>
	                			<tr v-for="item in dataList" v-if="dataList.length > 0">
	                				<td>
	                					<Checkbox v-model="item.$selected" @on-change="refresh_select" v-if="item.is_system == 0"></Checkbox>
	                				</td>
	                				<td v-if="show_did">{{item.did}}</td>
	                				<td>
	                					<Input 
	                					v-if="item.$edit && !is_title_readonly(item)" 
	                					size="small" v-model="item.title" 
	                					placeholder="输入名称" 
	                					style="width: 100px"
	                					@on-change="autoEValue(item)"
	                					></Input>
	                					<span v-else>{{item.title}}</span>
	                				</td>
	                				<td v-if="is_name_enable">
	                					<Input 
	                					v-if="item.$edit && !is_name_readonly(item)" 
	                					size="small" 
	                					v-model="item.name" 
	                					@on-keyup="fixValue(item)"
	                					placeholder="输入值" 
	                					style="width: 100px"></Input>
	                					<span v-else>{{item.name}}</span>	
	                				</td>
	                				<td>
	                					<Input v-if="item.$edit" size="small" v-model="item.desc" placeholder="输入描述" style="width: 300px"></Input>
	                					<span v-else>{{item.desc}}</span>
	                				</td>
	                				<td v-if="is_sort_enable">
	                					<Input v-if="item.$edit" size="small" v-model="item.sort" placeholder="输入排序数值" style="width: 60px"></Input>
	                					<span v-else>{{item.sort}}</span>
	                				</td>
	                				<td>
	                					<i-switch v-model="item.display" :true-value="1" :false-value="0" @on-change="save(item)"></i-switch>
	                				</td>
	                				<td v-if="item.$edit">
										<Button-group>
											<Button type="primary" @click="save(item)" :disabled="saving">确定</Button>
									        <Button @click="cancel(item)" :disabled="saving">取消</Button>
									    </Button-group>
	                				</td>
	                				<td v-else>
	                					<Button size="small" @click="edit(item)" icon="edit"></Button>
	                				</td>
	                			</tr>
	                			<tr v-if="dataList.length == 0">
	                				<td colspan="5"><p>该字典还没有条目</p></td>
	                			</tr>
	                		</tbody>
	                	</table>
	                	<div class="loading-wrap">
	                		<p class="loading-text"><span class="loading-gif"></span>正在加载...</p>
	                	</div>
	                </div>
	            </div>
	        </div>
		</div>
	</Card>
</template>

<script>
	import util from '@/libs/util'
	import globals from '@/libs/globals.mixin'
	import grid from '@/libs/grid.mixin'
	import common from '@/libs/common.mixin'
	import store from '@/store'
	import $rest from '@/libs/rest'
    
    //不允许新增的字典类型
    const DISABLED_ADD_PIDS = [12]
    //允许修改值的字典类型
    const ENABLE_NAME_PIDS  = [11,13]
    //允许修改排序的字典类型
    const ENABLE_SORT_PIDS  = [8,11]
    //禁止修改系统字段名称字段
    const DISABLE_EDIT_SYSTEM_TITLE = [8]
    //禁止修改系统字段值字段
    const DISABLE_EDIT_SYSTEM_NAME = [11,12,13]
    //值只能为数字的字段
    const VALUE_MUST_NUMBER = [11,13]
    //显示DID的字段
    const SHOW_DID = [22,23]

	export default{
		name:'dictTalbe',
		props:{
			pid:Number,
			title:String
		},
		mixins: [globals,common,grid],
		computed:{
			
		},
		computed:{
			is_add_disabled(){
				if(DISABLED_ADD_PIDS.indexOf(this.pid) !== -1){
					return true
				}
				return false
			},
			is_name_enable(){
				if(ENABLE_NAME_PIDS.indexOf(this.pid) !== -1){
					return true
				}
				return false
			},
			is_sort_enable(){
				if(ENABLE_SORT_PIDS.indexOf(this.pid) !== -1){
					return true
				}
				return false
			},
			is_select_all_disabled(){
				if(this.dataList.length == 0){
					return true
				}
				let can_select_nums = 0
				this.dataList.forEach(item=>{
					if(item.is_system == 0){
						can_select_nums ++
					}
				})
				if(can_select_nums > 0){
					return false
				}
				return true
			},
			is_value_must_number(){
				if(VALUE_MUST_NUMBER.indexOf(this.pid) !== -1){
					return true
				}
				return false
			},
			valueHelp(){
				if(this.is_value_must_number){
					return '值必须是数字'
				}
				return ''
			},
			show_did(){
				if(SHOW_DID.indexOf(this.pid) !== -1){
					return true
				}
				return false
			}
		},
		data () {
			return {
				action:'',
				selected:{
					all:false,
					none:true
				},
				nd:{
					title:'',
					desc:'',
					display:1
				},
				dataList:[]
			}
		},
		methods:{
			add(){
				if(this.action == ''){
					this.action = 'add'
				}
			},
			edit(item){
				if(item && this.action == ''){
					item.$edit = true
					this.action = 'edit'
				}
			},
			cancel(item){
				if(item){
					item.$edit = false
					this.action = ''
				}else{
					this.action = ''
				}
			},
			save(item){
				
				if(!item.target){
					if(this.is_value_must_number){
						if(this.valueHasRepeat(this.nd,'edit')){
							this.$Message.error('值已经存在，要求不能重复!')
							return false
						}
					}
					$rest('dictionary').add_url_param(item.did)
					.put(item)
					.success(response=>{
						this.clear()
						this.init_data()
						this.refresh_global_dicts()
					})
					.error(response=>{
						this.error(response.body.message)
					})


				}else{
					//add save
					if(this.nd.title == ''){
						this.$Message.error('请输入名称')
						return false
					}
					if(this.is_value_must_number){
						if(this.valueHasRepeat(this.nd,'add')){
							this.$Message.error('值已经存在，要求不能重复!')
							return false
						}
					}
					this.nd.pid = this.pid
					$rest('dictionary')
					.post(this.nd)
					.success(response=>{
						this.clear()
						this.init_data()
						this.refresh_global_dicts()
					})
					.error(response=>{
						
						this.error(response.body.message)
					})

				}
			},
			del(){
				let ids = [];
				this.dataList.forEach((item,key)=>{
					if(item.$selected === true && item.is_system == 0){
						ids.push(item.did)
					}
				})
				$rest('dictionary').delete(ids)
				.success(response=>{
					this.selected.none = true
					this.init_data()
					this.refresh_global_dicts()
				})
				.error(response=>{
					this.error(response.body.message)
				})
			},
			clear(){
				this.action = ''
				this.nd.title = ''
				if(this.nd.name){
					delete this.nd.name
				}
				this.nd.desc = ''
				this.nd.display = 1
			},
			init_data(){
				$rest('dictionary').get({pid:this.pid}).success(response=>{
					this.dataList = response.list
				})
			},
			refresh_select(){
				let sels = this.dataList.filter(it=>it.$selected === true)
				if(sels && sels.length > 0){
					this.selected.none = false
				}else{
					this.selected.none = true
				}
				if(sels.length == this.dataList.length){
					this.selected.all = true
				}else{
					this.selected.all = false
				}
			},
			toggle_select_all(val){
				if(val){
					this.dataList.forEach((item,key)=>{
						if(item.is_system == 0){
							item.$selected = true
						}
						
					})
					this.selected.none = false
				}else{
					this.dataList.forEach((item,key)=>{
						item.$selected = false
					})
					this.selected.none = true
				}
			},
			refresh_global_dicts(){
				this.refreshData('global/dicts')
				.then((data)=>{
					this.$store.commit('updateGlobalVar',{name:'dicts',data:data})
				})
			},
			is_title_readonly(item){
				if(item.is_system == 1 && DISABLE_EDIT_SYSTEM_TITLE.indexOf(this.pid) !== -1){
					return true
				}
				return false
			},
			is_name_readonly(item){
				if(item.is_system == 1 && DISABLE_EDIT_SYSTEM_NAME.indexOf(this.pid) !== -1){
					return true
				}
				return false
			},
			autoNValue(){
				if(!this.is_value_must_number){
					return
				}
				let v = this.nd.title.replace('-',0).replace(/[^\d]+/g,'')
				if(v != ''){
					this.nd.name = v
				}
			},
			autoEValue(item){
				if(!this.is_value_must_number || item.is_system == 1){
					return
				}
				let v = item.title.replace('-',0).replace(/[^\d]+/g,'')
				if(v == ''){
					return
				}
				item.name = v
			},
			fixValue(item){
				if(!this.is_value_must_number){
					return
				}
				item.name = item.name.replace(/[^\d]+/g,'')
				
			},
			valueHasRepeat(item,action){
				var ret = false
				if(action == 'add'){
					for(let i =0,l=this.dataList.length;i<l;i++){
						if(item.name == this.dataList[i].name){
							ret = true
							break
						}
					}
				}else{
					for(let i=0,l=this.dataList.length;i<l;i++){
						if(item.name == this.dataList[i].name && item.did  != this.dataList[i].did){
							ret = true
							break
						}
					}
				}
				return ret
			}

		},
		mounted(){
			this.init_data()
		},
		watch:{
			pid(){
				this.init_data()
			}
		}
	}
</script>
