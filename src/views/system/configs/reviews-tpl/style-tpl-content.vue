<template>
	<div v-if="data.setting">
		<Button type="ghost" @click="cancel" icon="reply" shape="circle" style="position: relative;top: -5px"></Button>
		<div style="max-height: 760px; overflow: auto;">
			<Card dis-hover class="mb-3">
				<label slot="title">模板名称</label>
				<Input v-model="data.name" placeholder="请输入模板名称"></Input>
			</Card>
			<Card dis-hover class="mb-3" v-if="enable_modify_rap">
				<span slot="title">高级参数</span>
				<p class="m-b">
					<i-switch v-model="data.setting.advance.allow_empty_honor" :false-value="0" :true-value="1"></i-switch>
					<span>是否允许称号为空</span>
				</p>
				<p class="m-b">
					<i-switch v-model="data.setting.advance.score_show_num" :false-value="0" :true-value="1"></i-switch>
					<span>打分项是否以分数形式呈现</span>
				</p>
				<p class="m-b">
					<i-switch v-model="data.setting.advance.allow_score_step" :false-value="0" :true-value="1"></i-switch>
					<span>是否允许修改打分项分数和步长</span>
				</p>
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
					<tr v-for="item in data.setting.common_fields">
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
								<p>{{item.field}}</p>
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
				<span slot="title">专业表现</span>
				<table class="modal-table vertical-top">
					<thead>
						<th><div class="ivu-table-cell">启用</div></th>					
						<th><div class="ivu-table-cell">字段名</div></th>
						<th><div class="ivu-table-cell">分数</div></th>
						<th><div class="ivu-table-cell">分数别名</div></th>
					</thead>
					<tr v-for="item in data.setting.student_fields.score">
						<td>
							<div class="ivu-table-cell">
								<i-switch v-model="item.enable" :false-value="0" :true-value="1"></i-switch>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>{{item.field}}</p>
								<Input v-model="item.label" placeholder="请输入字段描述"></Input>							
							</div>
						</td>
						<td>
							<div class="ivu-table-cell" v-if="data.setting.advance.allow_score_step">
								
								<p>最大：<InputNumber v-model="item.max" :max="100" :min="0"></InputNumber></p>
								<p>步长：<InputNumber v-model="item.step" :max="10" :min="0"></InputNumber></p>	
								<p>默认：<InputNumber v-model="item.default" :max="item.max" :min="0"></InputNumber></p>				
							</div>
							<div class="ivu-table-cell" v-else>
								<InputNumber v-model="item.default" :max="5" :min="0"></InputNumber>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell" v-if="item.enable">
								<div v-for="(value, key, index) in item.alias" style="margin-bottom: 5px">
									{{key}}：<Input v-model="item.alias[key]" placeholder="请输入分数别名" style="width: 100px"></Input>
								</div>
							</div>
							<div class="ivu-table-cell" v-else>
								<span style="color: #999">启用后可配置</span>
							</div>
						</td>
					</tr>
				</table>
			</Card>

			<Card dis-hover class="mb-3">
				<span slot="title">专业问题</span>
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">启用</div></th>
						<th><div class="ivu-table-cell">字段名</div></th>
					</thead>
					<tr v-for="item in data.setting.student_fields.weak">
						<td>
							<div class="ivu-table-cell">
								<i-switch v-model="item.enable" :false-value="0" :true-value="1"></i-switch>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<p>{{item.field}}</p>
								<Input v-model="item.label" placeholder="请输入字段描述"></Input>							
							</div>
						</td>
					</tr>
				</table>
			</Card>

			<Card dis-hover class="mb-3">
				<span slot="title">获得称号</span>
				<table class="modal-table vertical-top">
					<thead>
						<th><div class="ivu-table-cell">字段名</div></th>
						<th><div class="ivu-table-cell">简单描述</div></th>
						<th><div class="ivu-table-cell">称号图片</div></th>
						<th><div class="ivu-table-cell">老师说关联模版</div></th>
					</thead>
					<tr v-for="item in data.setting.student_fields.honor">
						<td>
							<div class="ivu-table-cell">
								<p>{{item.field}}</p>
								<Input v-model="item.label" placeholder="请输入字段描述"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell" style="text-align: left">
								<div v-for="(desc,index) in item.desc">
									{{desc.name}}：<Input type="textarea" style="margin-top: 5px;width:78%" :row="3" v-model="desc.content" placeholder="请输入简单描述"></Input>
									<Icon type="trash-b" title="删除" size="18" style="cursor: pointer;" v-if="index == item.desc.length-1&&index!=0" @click="deleteDesc(item)"></Icon>
								</div>
								<div style="text-align: center">
									<Icon type="ios-plus-empty" title="添加套话" size="20" style="cursor: pointer;" @click="addDesc(item)"></Icon>
								</div>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<div class="img-upload">
									<div class="img-thumb">
										<Icon type="camera" size="30" v-if="item.image == ''" style="line-height: inherit;"></Icon>
										<img class="cursor" :src="item.image" @click="picturePreview(item.image)" v-else>
									</div>
								</div>
								<Upload
									ref="upload"
									action="/api/upload"
									:headers="upload_header"
									:show-upload-list="false"
									:on-success="handleUploadSuccess(item)"
									:on-error="handleUploadError"
									:format="['jpg','jpeg','png']"
									:max-size="2048"
									type="select"
									style="display: inline-block;"
									>
									<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
								</Upload>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell" style="text-align: left">
								<div v-for="(teacher_say_tpl,index) in item.teacher_say_tpl">
									{{teacher_say_tpl.name}}：<Input type="textarea" style="margin-top: 5px;width:78%" :row="3" v-model="teacher_say_tpl.content" placeholder="请输入老师说关联模版"></Input>
									<Icon type="trash-b" title="删除" size="18" style="cursor: pointer;" v-if="index == item.teacher_say_tpl.length-1&&index!=0" @click="deleteTeacherSay(item)"></Icon>
								</div>
								<div style="text-align: center">
									<Icon type="ios-plus-empty" title="添加套话" size="20" style="cursor: pointer;" @click="addTeacherSay(item)"></Icon>
								</div>
							</div>
						</td>
					</tr>
				</table>
			</Card>

			<Card dis-hover class="mb-3">
				<span slot="title">老师说</span>
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">标题</div></th>
						<th><div class="ivu-table-cell">老师说默认内容</div></th>
					</thead>
					<tr>
						<td>
							<div class="ivu-table-cell">
								<Input v-model="data.setting.student_fields.teacher_say.label" placeholder="请输入老师说标题"></Input>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Input type="textarea" :row="3" v-model="data.setting.student_fields.teacher_say.default" placeholder="请输入老师说默认内容"></Input>
							</div>
						</td>
					</tr>
				</table>
			</Card>

			<Card dis-hover class="mb-3">
				<span slot="title">分享广告</span>
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">二维码</div></th>
						<th><div class="ivu-table-cell">二维码描述</div></th>
					</thead>
					<tr>
						<td>
							<div class="ivu-table-cell">
								<div class="img-upload">
									<div class="img-thumb">
										<Icon type="camera" size="30" v-if="data.setting.student_fields.share_ad.qr == ''" style="line-height: inherit;"></Icon>
										<img class="cursor" :src="data.setting.student_fields.share_ad.qr" @click="picturePreview(data.setting.student_fields.share_ad.qr)" v-else>
									</div>
								</div>
								<Upload
									ref="upload"
									action="/api/upload"
									:headers="upload_header"
									:show-upload-list="false"
									:on-success="handleUploadSuccess1()"
									:on-error="handleUploadError"
									:format="['jpg','jpeg','png']"
									:max-size="2048"
									type="select"
									style="display: inline-block;"
									>
									<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
								</Upload>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<Input v-model="data.setting.student_fields.share_ad.text" placeholder="二维码描述"></Input>
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
			currentData:{
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		watch: {
			currentData(val) {
				this.data = val;
			}
		},
		data () {
			return {
				data: {}
			}
		},
		created() {
			this.data = this.currentData;
		},
		computed: {
			upload_header(){
                return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
			}
		},
		methods: {
			addDesc(item) {
				let length = item.desc.length;
				item.desc.push({
					name: `模板${length+1}`,
					content: ''
				});
			},
			addTeacherSay(item) {
				let length = item.teacher_say_tpl.length;
				item.teacher_say_tpl.push({
					name: `模板${length+1}`,
					content: ''
				});
			},
			deleteDesc(item) {
				let length = item.desc.length;
				item.desc.splice(length-1,1);
			},
			deleteTeacherSay(item) {
				let length = item.teacher_say_tpl.length;
				item.teacher_say_tpl.splice(length-1,1);
			},
			handleUploadError(file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });
            },
			handleUploadSuccess(item) {
				return function(res, file) {
					item.image = res.data.file_url
				}
            },
			handleUploadSuccess1() {
				var vm = this;
				return function(res, file) {
					vm.data.setting.student_fields.share_ad.qr = res.data.file_url
				}
            },
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

<style scoped>
.vertical-top td{
	vertical-align: top !important;
}
</style>