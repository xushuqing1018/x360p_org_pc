<template>
	<Modal v-drag-modal :mask-closable="false" v-model="modal$.show" :title="modal$.title" width="700">
		<table class="modal-table">
			<thead>
				<tr>
					<th width="120"><div class="ivu-table-cell">变量名</div></th>
					<th><div class="ivu-table-cell">默认值</div></th>
					<th><div class="ivu-table-cell">特殊值</div></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(value,key) in data">
					<td>
						<div class="ivu-table-cell">
							<span>{{diy.</span>
							<span>{{value.name}}</span>
							<span>}}</span>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell">
							<Input v-model="value.default" style="width:150px"></Input>
						</div>
					</td>
					<td>
						<div class="ivu-table-cell vars-define">
							<p v-for="(d,index) in value.define" style="margin-bottom: 4px;">
								<span v-if="d.field === 'bid'">{{getBranchs(d)}}</span>
								<span v-else>{{getCompanys(d)}}</span>：{{d.value}}
								<Icon type="close" color="#ef0101" @click.native="delDefineItem(value,index)"></Icon>
							</p>
							<Button 
								type="ghost"
								size="small"
								icon="plus"
								shape="circle"
								title="添加特殊值"
								@click="addDefine(value)">
							</Button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">保存</Button>
		</div>
	</Modal> 
</template>
<script>
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	export default {
		mixins: [modal,common,globals],
		data() {
			return {
				cfg_id: 0,
				cfg_name: 'print_vars',
				data: {}
			}
		},
		mounted() {
			this.init_data()
		},
		methods: {
			ok() {
				let params = {
					cfg_name: this.cfg_name,
					cfg_value: this.data
				}
				let [method,uri] = (this.cfg_id==0?['post','configs']:['put','configs/'+this.cfg_id])
				this.$rest(uri)
				[method](params)
				.success(res => {
					this.$Message.success('保存成功')
					this.$store.dispatch('updateGlobalVar','configs')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			init_data() {
				this.$rest('configs?cfg_name='+this.cfg_name)
				.get()
				.success(res => {
					this.cfg_id = res.cfg_id
					this.data = res.cfg_value
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			addDefine(value) {
				this.$Modal.open('system/configs/print/customize-define-modal.vue',{
					on:{
						save:(info) => {
							value.define.push(info)
						}
					}
				})
				.then(modal => {
					modal.show('添加特殊值')
				})
			},
			getBranchs(d) {
				let ret = []
				d.bid.forEach(b => {
					ret.push(this.$filter('branch_name')(b))
				})
				return ret.join('、')
			},
			getCompanys(d) {
				let ret = []
				d.dept_id.forEach(d => {
					ret.push(this.$filter('dpt_name')(d))
				})
				return ret.join('、')
			},
			delDefineItem(value,index) {
				value.define.splice(index,1)
			}
		}
	}
</script>