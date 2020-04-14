<template>
	<div class="c-grid customer-fields-config">
		<div class="row">
			<div class="col-sm-3">
				<Card dis-hover>
					<div slot="title">可选项目</div>
					<div class="item-list">
						<a 
							:class="['item',{'selected':current_value == item.value}]" 
							v-for="(item,index) in cfg_names"
							@click="selectItem(item)">
							<span>{{item.name}}</span>
							<Icon class="arrow-right" type="ios-arrow-right" v-if="current_value == item.value"></Icon>
						</a>
					</div>
				</Card>
			</div>
			<div class="col-sm-9">
				<div class="list-body">
                    <div class="list-body-wrap" v-loading.like="'configs'">
						<table class="modal-table">
							<thead>
								<tr>
									<th width="80%"><div class="ivu-table-cell">字段</div></th>
								
									<th width="20%"><div class="ivu-table-cell">启用</div></th>
									
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in field_list">
									<td>
										<div class="ivu-table-cell">{{item.label}}({{item.field}})</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<i-switch 
											v-model="item.enable" 
											:false-value="0" 
											:true-value="1" 
											@on-change="switchable(item)">
												<span slot="open">是</span>
												<span slot="close">否</span>
											</i-switch>
										</div>
									</td>
									
								</tr>
							</tbody>
						</table>
					</div>
					<div class="footer-btn m-t" style="padding-left: 0;">
				        <Button :loading="saving" :disabled="!need_save" type="primary" @click="save_data">保存</Button>		        
					</div>  
				</div>
			</div>
		</div>
	</div>
</template>
<script>

	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	export default {
		mixins: [common],
		data() {
			return {
				data: [],
				copy_data: [],
				action: '',
				cfg_id: 0,
				cfg_names: [
					{name: '市场名单', value: 'mcl'},
					{name: '客户名单', value: 'customer'},
					{name: '学员档案', value: 'student'},
					{name: '员工信息', value: 'employee'}
					
				],
				df:{
					mcl:[],
					customer:[],
					student:[],
					employee:[]
				},
				need_save:false,
				current_value: "mcl",
				field_list:[]
			}
		},
		mounted() {
			this.init_data()
		},
		computed: {
			rest_api() {
				return util.sprintf('configs?cfg_name=%s_disable_fields',this.current_value)
			},
			cfg_name() {
				return this.current_value+'_disable_fields'
			}
		},
		methods: {
			selectItem(item){
				if(this.current_value == item.value){
					return
				}
				this.current_value = item.value
				this.init_data()
			},
			build_field_list(){
				let adf = this.$store.state.gvars.allow_disable_fields[this.current_value]
				let df  = this.df[this.current_value]
				function is_enable(f){
					return df.indexOf(f) === -1?1:0
				}
				this.field_list.splice(0)
				adf.forEach(item=>{
					this.field_list.push({
						label:item.label,
						field:item.field,
						enable:is_enable(item.field)
					})
				})
				this.need_save = false
			},
			init_data() {
				this.$rest(this.rest_api)
				.get()
				.success(res => {
					this.df[this.current_value].splice(0)
					for(let i=0,len=res.cfg_value.length;i<len;i++) {
						let item = res.cfg_value[i]	
						this.df[this.current_value].push(item)
					}
					this.cfg_id = res.cfg_id
					this.build_field_list()
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			
			switchable(item) {
				if(item.enable == 0){
					if(this.df[this.current_value].indexOf(item.field) === -1){
						this.df[this.current_value].push(item.field)
						this.need_save = true
					}
				}else{
					let pos = this.df[this.current_value].indexOf(item.field)
					if(pos !== -1){
						this.df[this.current_value].splice(pos,1)
						this.need_save = true
					}
				}
			},
			get_cfg_value() {
				return this.df[this.current_value]
			},
			save_data() {
				
				let params = {
					cfg_name: this.cfg_name,
					cfg_value: this.get_cfg_value()
				}
				let [method,uri] = (this.cfg_id==0?['post','configs']:['put','configs/'+this.cfg_id])
				this.$rest(uri)
				[method](params)
				.success(res => {
					this.action = ''
					this.$Message.success('保存成功')
					this.$store.dispatch('updateGlobalVar','configs')
					this.init_data()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>