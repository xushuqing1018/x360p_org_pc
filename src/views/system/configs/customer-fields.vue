<style lang="less">
	.customer-fields-config {
		.item-list {
		    min-height: 600px;
		    max-height: 700px;
		    overflow-y: auto;
		    overflow-x: hidden;
			.item {
				display: block;
				padding: 5px;
				&.selected {
					background: #eee;
				}
				&:hover {
					background: #eee;
				}
				.arrow-right {
					float: right;
					line-height: 1.6;
				}
			}
		}
	}
</style>
<template>
	<div class="c-grid customer-fields-config">
		<div class="row">
			<div class="col-sm-3">
				<Card dis-hover>
					<div slot="title">自定义项目</div>
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
									<th width="20%"><div class="ivu-table-cell">字段</div></th>
									<th width="20%"><div class="ivu-table-cell">显示名称</div></th>
									<th width="20%"><div class="ivu-table-cell">字段类型</div></th>
									<th width="20%"><div class="ivu-table-cell">启用</div></th>
									<th width="20%" v-if="current_value == 'student'"><div class="ivu-table-cell">必填字段</div></th>
									<th width="20%"><div class="ivu-table-cell">操作</div></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in data">
									<td>
										<div class="ivu-table-cell">{{item.$$name}}</div>
									</td>
									<template v-if="item.$$edit">
										<td>
											<div class="ivu-table-cell">
												<Input v-model="item.label"></Input>
											</div>
										</td>
										<td>
											<div class="ivu-table-cell">
												<Select v-model="item.type">
													<Option v-for="item in type_list" :value="item.value">{{item.name}}</Option>
												</Select>
											</div>
										</td>
									</template>
									<template v-else>
										<td>
											<div class="ivu-table-cell">{{item.label}}</div>
										</td>
										<td>
											<div class="ivu-table-cell">
												<span>{{getTypeName(item)}}</span>
												<Button 
													class="ml-2" 
													type="primary" 
													size="small" 
													@click="setOptionValue(item)"
													v-if="item.type==='select'">选项值
												</Button>
											</div>
										</td>
									</template>
									<td>
										<div class="ivu-table-cell">
											<i-switch v-model="item.enable" :false-value="0" :true-value="1" @on-change="switchable(item)">
												<span slot="open">是</span>
												<span slot="close">否</span>
											</i-switch>
										</div>
									</td>
									<td v-if="current_value == 'student'">
										<div class="ivu-table-cell">
											<i-switch v-model="item.required" :false-value="0" :true-value="1" @on-change="switchRequire(item)">
												<span slot="open">是</span>
												<span slot="close">否</span>
											</i-switch>
										</div>
									</td>
									<td>
										<div class="ivu-table-cell">
											<ButtonGroup v-if="item.$$edit">
												<Button 
													type="primary" 
													size="small" 
													:loading="saving"
													@click="ok(item)">确定
												</Button>
												<Button 
													type="ghost" 
													size="small" 
													:disabled="saving"
													@click="cancel(item)">取消
												</Button>
											</ButtonGroup>
											<Button 
												v-else
												type="ghost" 
												shape="circle" 
												icon="edit" 
												size="small" 
												title="编辑" 
												@click="edit(item)">
											</Button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
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
					{name: '学员信息', value: 'student'},
					{name: '员工信息', value: 'employee'},
					{name: '客户信息', value: 'customer'},
					{name: '市场名单', value: 'mcl'}
				],
				current_value: "student",
				typeArr: [
					{name: '文本',value: 'text'},
					{name: '多行文本',value: 'textarea'},
					{name: '数字',value: 'number'},
					{name: '日期',value: 'date'},
					{name: '选项',value: 'select'},
				]
			}
		},
		created() {
			
		},
		mounted() {
			this.init_customer_fields()
		},
		computed: {
			rest_api() {
				return util.sprintf('configs?cfg_name=%s_option_fields',this.current_value)
			},
			type_list() {
				let list = this.typeArr
				let area = [{name: '地区',value: 'area'}]
				if(this.showGetScope&&this.current_value=='mcl') {
					return list.concat(area)
				}
				return list
			}
		},
		methods: {
			init_customer_fields() {
				this.$rest(this.rest_api)
				.get()
				.success(res => {
					this.data.splice(0)
					for(let i=0,len=res.cfg_value.length;i<len;i++) {
						let item = res.cfg_value[i]
						item.$$name = '自定义字段'+(i+1)
						item.$$edit = false
						this.data.push(item)
					}
					this.copy_data = util.copy(this.data)
					this.cfg_id = res.cfg_id
					this.cfg_name = res.cfg_name
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			setOptionValue(item) {
				this.$Modal.open('system/configs/customer-fields/options-modal.vue',{
					on: {
						save:(arr) => {
							this.$set(item,'option_values',arr)
							this.ok(item)
						}
					}
				})
				.then(modal => {
					modal.set('options',item.option_values).show('设置选项值')
				})
			},
			getTypeName(item) {
				let obj = this.type_list.find(t=>t.value==item.type)
				if(obj) {
					return obj.name
				}
				return ''
			},
			selectItem(item) {
				this.action = ''
				this.current_value = item.value
				this.init_customer_fields()
			},
			ok(item) {
				if(!item.label) {
					this.$Message.error('显示名称不能为空')
					return false
				}
				this.submit()
			},
			cancel(item) {
				this.data = util.copy(this.copy_data)
				this.action = ''
			},
			edit(item) {
				if(item&&this.action == '') {
					item.$$edit = true
					this.action = 'edit'
				}
			},
			switchable(item) {
				this.submit()
			},
			switchRequire(item) {
				this.submit()
			},
			submit() {
				function getSubmitData(data){
					let list = []
					data.forEach(item=>{
						let o = {}
						for(let f in item){
							
							if(f.substr(0,1) == '$'){
								continue
							}
							o[f] = item[f]

						}
						list.push(o)
					})
					return list
				}
				let params = {
					cfg_name: this.cfg_name,
					cfg_value: getSubmitData(this.data)
				}
				let [method,uri] = (this.cfg_id==0?['post','configs']:['put','configs/'+this.cfg_id])
				this.$rest(uri)
				[method](params)
				.success(res => {
					this.action = ''
					this.$Message.success('保存成功')
					this.$store.dispatch('updateGlobalVar','configs')
					this.init_customer_fields()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>