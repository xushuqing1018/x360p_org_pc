<template>
	<div>
		<slot>
			<Select v-model="model" :style="style" class="mr-2" filterable clearable>
				<Option :value="item.mc_id" v-for="item in data">{{item.channel_name}}</Option>
			</Select>
			<Button type="ghost" icon="plus" @click="add" v-if="showAdd"></Button>
		</slot>
		
		<Modal v-drag-modal :mask-closabled="false" v-model="modal$.show" :title="modal$.title" :width="450">
			<Form ref="form" :model="info" :label-width="100" :rules="rules_channel">
				<Form-item label="渠道名称" prop="channel_name">
					<Input v-model="info.channel_name" placeholder="请输入渠道名称"></Input>
				</Form-item>
				<Form-item label="对应招生来源" prop="from_did">
					<dictionary-from v-model="info.from_did" clearable></dictionary-from>
				</Form-item>
				<Form-item label="是否共享渠道" prop="is_share">
					<i-switch v-model="info.is_share" :true-value="1" :false-value="0">
						<span slot="open">是</span>
						<span slot="close">否</span>
					</i-switch>
				</Form-item>
			</Form>
			<div slot="footer">
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="save" :loading="saving">确定</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
	import util from '@/libs/util'
	import grid from '@/libs/grid.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import DictionaryFrom from 'c%/DictionaryFrom.vue'

	const emptyObject = {
		bid: 0,
		channel_name: '',
		is_share: 0,
		from_did: 0
	}
	
	export default{
		mixins: [ common,grid,modal ],
		components: {
			DictionaryFrom
		},
		props: {
			value:{
				type: [Number,String],
				default: 0
			},
			showAdd: {
				type: Boolean,
				default: true
			},
			setDefault: {
				type: Boolean,
				default: false
			}
		},
		data () {
			this.rules_channel = {
				channel_name: [
					{ required: true, type:'string', message: '请输入渠道名称', trigger: 'blur' }
				],
				from_did: [
					{ required: true, type:'number', min:1, message: '请选择招生来源', trigger: 'change' }
				]
			}
			return {
				model: this.value||0,
				rest_api: 'market_channels',
				pk: 'mc_id',
				pageSize: 1000,
				info: util.copy(emptyObject)
			}
		},
		watch: {
			value: function (val) {
				this.model = val
			},
			model: function (val) {				
				this.$emit('input',val)
				this.dispatch('FormItem','on-form-change',val)
			},
			'modal$.show': function (val) {
				if(val&&this.modal$.action=='add'){
					this.info = util.copy(emptyObject)
				}
			}
		},
		mounted () {
			this.init_data()
		},
		methods: {
			deal_data (data) {
				this.$store.commit('setMarketChannel',data.list)
				
				if(this.setDefault&&this.model==0&&data.list.length>0){
					this.model = data.list[0][this.pk]
				}
				
				return data.list
			},
			add () {
				this.show('新增来源渠道','add')
			},
			save () {
				this.$form('form').check().then(() => {
					this.ok()
				})
			},
			ok () {
				let params = util.copy(this.info)
				params.bid = this.bid$
				
				let [uri,method,msg] = this.modal$.action=='add'?['market_channels','post','添加成功！']:['market_channels/'+params.mc_id,'put','修改成功！']
				
				this.$rest(uri)[method](params)
				.success(data=>{
					this.init_data()
					this.$Message.success(msg)
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'添加失败~')
				})
			}
		},
		computed: {
			style () {
				return {
					display: 'inline-block',
					width: this.showAdd?'calc(100% - 54px)':'100%'
				}
			}
		}
	}
</script>

<style>
</style>