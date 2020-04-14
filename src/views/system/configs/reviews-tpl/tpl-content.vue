<template>
	<div v-if="data.setting">
		<Button type="ghost" @click="cancel" icon="reply" shape="circle" style="position: relative;top: -5px"></Button>
		<div style="max-height: 760px; overflow: auto;">
			<Card dis-hover class="mb-3">
				<label slot="title">模板名称</label>
				<Input v-model="data.name" placeholder="请输入模板名称"></Input>
			</Card>
			<Card dis-hover class="mb-3">
				<span slot="title">公共点评字段</span>
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">启用</div></th>
						<th><div class="ivu-table-cell">学员可见</div></th>
						<th><div class="ivu-table-cell">字段名</div></th>
						<th><div class="ivu-table-cell">点评模板内容</div></th>
					</thead>
					<tr v-for="(item,fieldName) in data.setting.common_fields">
						<td>
							<div class="ivu-table-cell">
								<i-switch v-model="item.enable" :false-value="0" :true-value="1"></i-switch>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<i-switch v-model="item.student_view" :false-value="0" :true-value="1"></i-switch>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>{{fieldName}}</p>
								<Input v-model="item.label" placeholder="请输入字段描述"></Input>							
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Input type="textarea" :row="3" v-model="item.tpl" placeholder="请输入模板内容"></Input>
							</div>
						</td>
					</tr>
				</table>
			</Card>
			
			<Card dis-hover class="mb-3">
				<span slot="title">打分项</span>
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">启用</div></th>					
						<th><div class="ivu-table-cell">字段名</div></th>
						<th><div class="ivu-table-cell">默认分数</div></th>
					</thead>
					<tr v-for="(item,fieldName) in data.setting.score_fields">
						<td>
							<div class="ivu-table-cell">
								<i-switch v-model="item.enable" :false-value="0" :true-value="1"></i-switch>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>{{fieldName}}</p>
								<Input v-model="item.label" placeholder="请输入字段描述"></Input>							
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<InputNumber v-model="item.default" :max="5" :min="0"></InputNumber>							
							</div>
						</td>
					</tr>
				</table>
			</Card>
			
			<Card dis-hover class="mb-3">
				<span slot="title">个人点评</span>
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">标题</div></th>
						<th><div class="ivu-table-cell">点评模板</div></th>
					</thead>
					<tr>
						<td>
							<div class="ivu-table-cell">
								<Input v-model="data.setting.student_detail.default.label" placeholder="请输入字段描述"></Input>
							</div>
						</td>					
						<td>
							<div class="ivu-table-cell">
								<Input type="textarea" :row="3" v-model="data.setting.student_detail.default.tpl" placeholder="请输入模板内容"></Input>				
							</div>
						</td>
					</tr>
				</table>
			</Card>
			
			<div class="footer-btn">
				<Button type="primary" @click="save">保存</Button>
				<Button type="ghost" @click="cancel" icon="android-arrow-back">返回</Button>
			</div>
		</div>
	</div>
</template>

<script>
	import common from '@/libs/common.mixin'
	export default{
		mixins: [common],
		props: {
			data:{
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		data () {
			return {
				
			}
		},
		methods: {
			cancel () {
				this.$emit('on-cancel')
			},
			save () {
				let id = this.data.rts_id,
					[method,uri,msg] = id ? ['put','review_tpl_settings/'+id,'修改成功'] : ['post','review_tpl_settings','添加成功']
				
				this.$rest(uri)[method](this.data)
				.success(data=>{
					this.$Message.success(msg)
					this.$store.dispatch('updateGlobalVar','review_tpl_setting')
					this.$emit('on-success')
				}).error(response=>{
					this.$Notice.error({
						title: '失败',
						desc: response.body.message||'操作失败'
					})
				})				
			}
		}
	}
</script>

<style>
</style>