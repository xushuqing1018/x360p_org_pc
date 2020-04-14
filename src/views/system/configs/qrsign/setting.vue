<template>
	<Tabs v-model="tabValue">
		<TabPane label="扫码录入设置" name="1">
			<div class="p-3 mb-3 b-b-1">
				<div style="width:375px;max-height:375px;overflow:auto">
					<img :src="config.banner" width="100%"/>
				</div>
				<div class="mt-2">
					<label class="text-desc">（建议上传宽750的图片，高度不限）</label>
					<c-upload
						v-model="config.banner"
						btn-text="更换"
					>
					</c-upload>
				</div>
			</div>
			<div class="p-3 mb-3 b-b-1">
				<div class="mb-2">
					标题： <Input style="width:375px" v-model="config.title" placeholder="请输入大标题"></Input>						
				</div>
				<div class="mb-2">
					描述： <Input type="textarea" :autosize="{ minRows:3,maxRows:5 }" style="width:375px" v-model="config.desc" placeholder="请输入描述"></Input>						
				</div>
			</div>
			<div class="p-3 mb-3 b-b-1">
				<table class="modal-table">
					<thead>
						<th><div class="ivu-table-cell">字段</div></th>
						<th><div class="ivu-table-cell">类型</div></th>
						<th><div class="ivu-table-cell">是否启用</div></th>
						<th><div class="ivu-table-cell">默认值</div></th>
					</thead>
					<tr v-for="item in config.must_fields">
						<td><div class="ivu-table-cell">{{item.label}}</div></td>
						<td><div class="ivu-table-cell text-danger">必填</div></td>
						<td>
							<div class="ivu-table-cell">
								<i-switch v-model="item.enable"></i-switch>
							</div>
						</td>
						<td>
							<div class="ivu-table-cell">
								<DatePicker :value="item.default_value" @on-change="item.default_value = $event" format="yyyy-MM-dd" type="date" placeholder="Select date" style="width: 200px"></DatePicker>
							</div>
						</td>
					</tr>
					<tr v-for="item in config.fields">
						<td><div class="ivu-table-cell">{{item.label}}</div></td>
						<td><div class="ivu-table-cell">选填</div></td>
						<td>
							<div class="ivu-table-cell">
								<i-switch v-model="item.enable"></i-switch>
							</div>
						</td>
						<td><div class="ivu-table-cell"><Input v-model="item.default_value" placeholder="请输入字段默认值"></Input></div></td>
					</tr>
				</table>
			</div>
			<div class="p-3">
				<img :src="config.logo" style="max-width:140px;max-height:40px">
				<div class="mt-2">
					<label class="text-desc">（建议上传140*40大小的图片）</label>
					<c-upload
						v-model="config.logo"
						btn-text="更换"
					>
					</c-upload>
				</div>
			</div>
		</TabPane>
		<TabPane label="录入成功设置" name="2">
			<div class="p-3 mb-3 b-b-1">
				<div class="mb-2">
					标　　题： <Input style="width:375px" v-model="config.msg.title" placeholder="请输入大标题"></Input>						
				</div>
				<div class="mb-2">
					描　　述： <Input type="textarea" :autosize="{ minRows:3,maxRows:5 }" style="width:375px" v-model="config.msg.description" placeholder="请输入描述"></Input>						
				</div>
				<div class="mb-2">
					跳转链接： <Input style="width:375px" v-model="config.msg.redirect_url" placeholder="请输入跳转链接"></Input>						
				</div>
			</div>
		</TabPane>
	</Tabs>	
</template>

<script>
	import cUpload from 'c%/cUpload.vue'
	
	export default{
		components: {
			cUpload
		},
		props: {
			config: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			value: {
				type: String,
				default: '1'
			}
		},
		data () {
			return {
				tabValue: this.value,
			}
		},
		watch: {
			tabValue: function (val) {
				this.$emit('input',val)
			}
		},
		methods: {
			dateChange (val1,val2){
				console.log(val1,val2)
			},
			nlbr(val){	
				return val.replace(/[\n\r]+/g,'<br>')
			},
			save () {
				this.handleSubmit()
			}
		}
	}
</script>

<style lang="less" scoped>
@import url("./qrsign.less");
</style>