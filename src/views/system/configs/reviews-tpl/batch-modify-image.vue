<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="700">
		<div>
			<Card dis-hover class="mb-3">
				<span slot="title">获得称号</span>
				<table class="modal-table vertical-top">
					<thead>
						<th><div class="ivu-table-cell">字段名</div></th>
						<th><div class="ivu-table-cell">称号图片</div></th>
					</thead>
					<tr v-for="item in data.student_fields.honor">
						<td>
							<div class="ivu-table-cell">
								<p>{{item.field}}</p>
								<Input v-model="item.label" placeholder="请输入字段描述"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<img :src="item.image" style="width: 50px;height: 40px;" v-if="item.image"/>
								<Button 
									type="ghost" 
									size="small"
									icon="ios-cloud-upload-outline" 
									@click="selectFromMyFile(item,'image')" 
									class="ml-2">上传
								</Button>
							</div>
						</td>
					</tr>
				</table>
			</Card>
			<Card dis-hover>
				<span slot="title">分享广告</span>
				<table class="modal-table vertical-top">
					<thead>
						<th><div class="ivu-table-cell">二维码描述</div></th>
						<th><div class="ivu-table-cell">二维码</div></th>
					</thead>
					<tr>
						<td>
							<div class="ivu-table-cell">
								<Input v-model="data.student_fields.share_ad.text" placeholder="二维码描述"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<img :src="data.student_fields.share_ad.qr" style="width:50px;height:50px;" v-if="data.student_fields.share_ad.qr"/>
								<Button 
									type="ghost" 
									size="small"
									icon="ios-cloud-upload-outline" 
									@click="selectFromMyFile(data.student_fields.share_ad,'qr')" 
									class="ml-2">上传
								</Button>
							</div>
						</td>
					</tr>
				</table>
			</Card>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	export default {
		mixins: [common,modal],
		props: {
			ids: {
				type: Array,
				default() {
					return []
				}
			},
			tplRow: {
				type: Object,
				default() {
					return {}
				}
			}
		},
		data() {
			return {
				data: {
					student_fields: {
						honor: [],
						share_ad: {}
					}
				}
			}
		},
		methods: {
			onModalOpen() {
				let ret = {
					honor: [],
					share_ad: {}
				}
				let student_fields = util.copy(this.tplRow.setting.student_fields)
				student_fields.honor.forEach(h => {
					let obj = {
						field: h.field,
						image: h.image,
						label: h.label
					}
					ret.honor.push(obj)
				})
				ret.share_ad = student_fields.share_ad
				this.data.student_fields = ret
			},
			selectFromMyFile(item,field) {
				this.$Modal.open('components/SelectFile.vue@modal',{
					props: {
						selType: 'image',
						'hide-upload-bylocal': false
					},
					on: {
						'selected':(data)=>{
							item[field] = data.file_url
						}
					}
				})
				.then(modal => {
					modal.vuec.show('选择图标','list')
				})
			},
			ok() {
				this.$rest('review_tpl_settings').add_url_param('batch_change_setting')
				.post({
					setting: this.data,
					rts_ids: this.ids
				})
				.success(res => {
					this.$emit('on-success')
					this.$Message.success('修改成功')
					this.close()
				})
				.error(res => {
					this.error(res.body.message)
				})
			}
		}
	}
</script>