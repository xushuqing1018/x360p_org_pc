<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="800" :mask-closable="false">
		
		<table class="modal-table">
			<thead>
				<th><div class="ivu-table-cell">公众号名称</div></th>
				<th><div class="ivu-table-cell">AppID</div></th>
				<th><div class="ivu-table-cell">公众号类型</div></th>
			</thead>
			<tr v-for="(item,index) in data" :class="index==currentIndex?'table-info':''" @click="setCurrentIndex(index,item)">
				<td><div class="ivu-table-cell">{{item.alias}}</div></td>
				<td><div class="ivu-table-cell">{{item.authorizer_appid}}</div></td>
				<td><div class="ivu-table-cell">{{item.service_type_info===2?'服务号':'订阅号'}}</div></td>
			</tr>
		</table>
		
		<div slot="footer">
			<div class="pull-left">
				<span>已选择：</span>
				<span class="text-primary">{{currentAlias}}</span>
			</div>
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	
	export default{
		mixins: [modal],
		data () {
			return {
				currentIndex: -1,
				currentAlias: ''
			}
		},
		methods: {
			setCurrentIndex (index,item){
				this.currentIndex = index
				this.currentAlias = item.alias
			},
			cancel () {
				this.close()
			},
			ok () {
				this.close()
			}
		},
		computed: {
			data () {
				let list = this.$store.state.gvars.public_accounts
				return list
			}
		}
	}
</script>
