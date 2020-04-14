<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form :label-width="100" :model="info">
			<Form-item label="会员卡名称" class="ivu-form-item-required mb-2">
				<Input v-model="info.card_name" placeholder="请输入会员卡名称" clearable></Input>
			</Form-item>
			<Form-item label="卡片背景图" class="ivu-form-item-required mb-2">
				<div class="img-upload">
					<div class="img-thumb" style="width: 159px;height: 88px;line-height: 88px;">
			            <Icon type="camera" size="30" v-if="info.card_bg_url == ''" style="line-height: inherit;"></Icon>
			            <img class="cursor" :src="info.card_bg_url" @click="picturePreview(info.card_bg_url)" v-else>
			        </div>	
			        
		        </div>
				<c-upload
					v-model="info.card_bg_url"
					btn-text="上传"
				>
				</c-upload>
			</Form-item>
			<Form-item label="最大等级" class="ivu-form-item-required mb-2">
				<InputNumber v-model="info.card_max_level" :min="1" :max="5" @on-change="maxLevelChange"></InputNumber>
			</Form-item>
			<Form-item label="卡片定义" class="ivu-form-item-required mb-2">
				<table class="modal-table">
					<thead>
						<tr>
							<th><div class="ivu-table-cell">等级</div></th>
							<th><div class="ivu-table-cell">用户身份</div></th>
							<th><div class="ivu-table-cell">背景</div></th>
							<!-- <th><div class="ivu-table-cell">升级标准</div></th> -->
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item,index) in info.card_define">
							<td>
								<div class="ivu-table-cell">
									{{index+1}}
								</div>
							</td>
							<td><div class="ivu-table-cell">
								<Input v-model="item.name" style="width: 100px;"></Input></div>
							</td>
							<td><div class="ivu-table-cell">
								<img :src="item.bg_url" style="width: 50px;height: 38px;" v-if="item.bg_url"/>
								<Button 
									type="ghost" 
									size="small"
									icon="ios-clock-outline" 
									@click="selectFromMyFile(item)" 
									class="ml-2">上传
								</Button>
								</div>
							</td>
							<!-- <td><div class="ivu-table-cell">
								<Input v-model="item.amount" style="width: 100px;"></Input></div>
							</td> -->
						</tr>
					</tbody>
				</table>
			</Form-item>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import cUpload from 'c%/cUpload.vue'

	const emptyObject = {
		ct_id: 0,
		card_name: '',
		card_bg_url: '',
		card_max_level: 5,
		card_define: [
			{name: '青铜会员',bg_url: ''},
			{name: '白银会员',bg_url: ''},
			{name: '黄金会员',bg_url: ''},
			{name: '铂金会员',bg_url: ''},
			{name: '黑金会员',bg_url: ''}
		]
	}
	export default {
		mixins: [modal,common,globals],
		components: {
			cUpload
		},
		data() {
			return {
				upload_percent: 0,
				info: util.copy(emptyObject)
			}
		},
		methods: {
			ok () {
				if(/$\s*^/.test(this.info.card_name)){
					this.$Message.error('请输入会员卡名称')
					return
				}
				if(/$\s*^/.test(this.info.card_bg_url)){
					this.$Message.error('请上传图片')
					return
				}
				if(!this.info.card_max_level) {
					this.$Message.error('请输入会员卡最高等级')
					return
				}
				if(this.info.card_define.length==0){
					this.$Message.error('卡片定义不能为空')
					return
				}
				
				let [uri,method] = this.modal$.action=='add'?['card_types','post']:[`card_types/${this.info.ct_id}`,'put']
				let msg = this.modal$.action=='add'?'添加成功':'编辑成功'
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('save')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			},
			selectFromMyFile(item) {
				this.$Modal.open('components/SelectFile.vue@modal',{
					props: {
						selType: 'image',
						'hide-upload-bylocal': false
					},
					on: {
						'selected':(data)=>{
							item.bg_url = data.file_url
						}
					}
				})
				.then(modal => {
					modal.vuec.show('选择图标','list')
				})
			},
			maxLevelChange(value) {
				let level_len = this.info.card_define.length
				if(level_len > value) {
					this.info.card_define.splice(value,level_len-value)
				}else{
					for(let i=0;i<value-level_len;i++) {
						this.info.card_define.push({
							name: '',
							amount: 0
						})
					}
				}
			}
		}
	}
</script>