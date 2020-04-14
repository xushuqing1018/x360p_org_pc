<template>
	<Modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="800" v-drag-modal>		
		<Card >
			<div slot="title">作业内容</div>
			<div class="homework-content" v-html="homework.content"></div>
			<file-item :list="homework.homework_attachment"></file-item>	
		</Card>
		
		<Card class="mt-3">
			<template v-if="homework.is_rejected==0">
				<div class="x-card-title" slot="title">
					<label>回复</label>
					<Dropdown v-if="!homework.homework_reply">
						<Button type="ghost" size="small" icon="plus">选择附件</Button>
						<DropdownMenu slot="list">
							<DropdownItem @click.native="selectFile"><Icon type="monitor"></Icon> 本机选择</DropdownItem>
							<DropdownItem @click.native="selectFromMyFile"><Icon type="ios-clock-outline"></Icon> 历史文件</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
				<div v-if="!homework.homework_reply">
					<Input v-model="info.content" type="textarea" placeholder="请输入作业回复" :autosize="{minRows: 5,maxRows: 5}"></Input>
					<file-item class="mt-3" :clearable="true" :list="info.attachment"></file-item>
				</div>
				<div v-else>
					<div class="homework-content" v-html="homework.homework_reply.content"></div>
					<file-item class="mt-3" :list="homework.homework_reply.homework_attachment"></file-item>
				</div>
			</template>
			<template v-else>
				<div class="x-card-title" slot="title">
					<label>驳回</label>
				</div>
				<div class="homework-content" v-html="homework.rejected_reason"></div>
			</template>
		</Card>
		
		<review-upload v-model="info.attachment" ref="upload" class="hide"></review-upload>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving" v-if="!homework.homework_reply">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	
	import FileItem from 'c%/FileItem.vue'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	
	const emptyObject = {
		hc_id: 0,
		eid: 0,
		content: '',
		attachment: []
	}
	
	export default{
		mixins: [ modal, common ],
		components: {
			FileItem,
			ReviewUpload
		},		
		data () {
			return {
				hc_id: 0,
				info: util.copy(emptyObject),
				homework: {}
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(!val) {
					this.homework = {}
					this.info = util.copy(emptyObject)
					this.hc_id = 0
				}
			},
		},
		methods: {
			selectFile () {
				this.$refs.upload.$refs.handupload.handleClick()
			},
			selectFromMyFile () {
				this.$refs.upload.selectFromMyFile()
			},			
			ok () {				
				this.info.eid = this.eid$
				this.info.hc_id = this.hc_id
				
				if(/^\s*$/.test(this.info.content)){
					this.$Message.error('请输入回复内容')
					return
				}
				
				this.$rest('homework_completes/'+this.hc_id+'/homework_reply')
				.post(this.info)
				.success(data=>{
					this.$Message.success('回复成功~')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'回复失败~')
				})
			}
		}
	}
</script>

<style lang="less">
.homework-content{
	margin-bottom: 10px;
	padding: 10px;
	table{
	    margin-bottom: 10px;
	    border-collapse: collapse;
	    display: table;
	    
	    tr td{
    	    padding: 5px 10px;
    		border: 1px solid #DDD;
	    }
	}
}
</style>