<style lang="less">
	.holiday-center {
		max-height: 500px;
		min-height: 200px;
		overflow: auto;
		table {
			width: 100%;
			td {
				padding: 8px 12px;
				.ivu-checkbox-wrapper {
					margin-bottom: 0;
				}
			}
		}
	}
</style>
<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="500">
		<div class="holiday-center" v-loading.like="'center_holidays'">
			<table>
				<tbody>
					<tr v-for="item in data">
						<td><Checkbox v-model="item.select$" @on-change="itemChange"></Checkbox></td>
						<td><Input v-model="item.name" style="width: 150px"></Input></td>
						<td><DatePicker :value="item.int_day" style="width: 150px"></DatePicker></td>
					</tr>
				</tbody>
			</table>
		</div>
		<div slot="footer">
			<Checkbox 
				v-model="selectAll" 
				@on-change="allChange" 
				style="float: left;margin: 8px 0 0 10px;"
				>
				全选
			</Checkbox>
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" :loading="saving" :disabled="sdata.length==0" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'

	export default {
		mixins: [modal,common],
		props: {
			year: Number,
			bid: Number
		},
		data() {
			return {
				data:[],
				selectAll: true
			}
		},
		computed: {
			sdata () {
				return this.data.filter(item => item.select$)
			}
		},
		methods: {
			onModalOpen() {
				this.get_data()
			},
			get_data() {
				this.$rest('holidays/center_holidays')
				.get({
					year: this.year
				})
				.success(res => {
					let ret = []
					res.list.forEach(item => {
						ret.push({
							bid: this.bid,
							year: this.year,
							name: item.name,
							int_day: this.$filter('int_date')(item.int_day),
							select$: true
						})
					})
					this.data = ret
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			itemChange(v) {
				if(v) {
					this.selectAll = this.data.length == this.sdata.length
				}else{
					this.selectAll = false
				}
			},
			allChange(v) {
				this.data.forEach(item => {
					this.$set(item,'select$',v)
				})
			},
			ok() {
				this.$rest('holidays')
				.post({
					delete:[],
					list:this.sdata
				})
				.success(response=>{
					this.$Message.success('设置成功')
					this.$emit('success')
					this.close()
				})
				.error(response=>{
					this.error(response.body.message)
				})
			}
		}
	}
</script>