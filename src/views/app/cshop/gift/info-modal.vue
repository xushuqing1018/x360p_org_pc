<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :width="650" :mask-closable="false">
		<Form :label-width="80" v-if="modal$.show">
			<Tabs v-model="current_tab">
				<TabPane name="basic" label="基础">		
					<Form-item label="礼品封面" class="mb-2 ivu-form-item-required">
						<div class="img-upload">
							<div class="img-thumb">
					            <Icon type="camera" size="30" v-if="info.cover_image_url == ''" style="line-height: inherit;"></Icon>
					            <img class="cursor" :src="info.cover_image_url" @click="picturePreview(info.cover_image_url)" v-else>
					        </div>	
					        
				        </div>
						<c-upload
							v-model="info.cover_image_url"
							btn-text="上传"
						>
						</c-upload>
					</Form-item>	
					<Form-item label="礼品分类" prop="cgc_id" class="mb-2 ivu-form-item-required">
						<select-gift-cate v-model="info.cgc_id" style="width: 450px;"></select-gift-cate>
					</Form-item>
					<Form-item label="礼品名称" prop="gift_name" class="mb-2 ivu-form-item-required">
						<Input v-model="info.gift_name" placeholder="请输入礼品名称" style="width: 450px;"></Input>
					</Form-item>
					<!-- <Form-item label="关联物品" prop="mt_id" class="mb-2">
						<select-material v-model="info.mt_id" placeholder="取用物品信息" style="width: 450px;"></select-material>
					</Form-item> -->
					<Form-item label="上架日期" class="mb-2" prop="pub_int_day">
						<DatePicker :value="info.pub_int_day" @on-change="info.pub_int_day = $event" placeholder="选择日期"></DatePicker>
					</Form-item>
					<Form-item label="礼品定价" class="mb-2" prop="price">
						<InputNumber v-model="info.price" :step="1" :min="0"></InputNumber>
					</Form-item>
					<Form-item label="所需积分" class="mb-2 ivu-form-item-required" prop="credit">
						<InputNumber v-model="info.credit" :step="1" :min="0"></InputNumber>
					</Form-item>
					<Form-item :label="info.cg_id?'入库数量':'期初数量'" prop="qty" class="mb-2">
						<InputNumber v-model="info.qty" :step="1" :min="1" :disabled="modal$.action=='edit'"></InputNumber>				
					</Form-item>
					<Form-item label="适用校区" class="mb-2 ivu-form-item-required" prop="suit_bids">
						<select-branch :disabled="info.is_public==1" v-model="info.suit_bids" clearable style="width:180px"></select-branch>
						<Checkbox class="ml-2" v-model="info.is_public" :true-value="1" :false-value="0">适用所有校区</Checkbox>
					</Form-item>
					<Form-item label="状态" class="mb-2" prop="status">
						<RadioGroup v-model="info.status" type="button">
							<Radio :label="1">启用</Radio>
							<Radio :label="0">禁用</Radio>
						</RadioGroup>
					</Form-item>
				</TabPane>
				<TabPane name="detail" label="详情">
					<Form-item label="礼品描述" class="mb-2 ivu-form-item-required">
						<ueditor 
			        		class="ueditor" 
			        		ref="ueditor" 
			        		v-model="info.gift_detail" 
			        		:ueditor-config="ueconfig">
		        		</ueditor>
					</Form-item>
					<Form-item label="礼品图片" class="mb-2 ivu-form-item-required">
						<review-upload v-model="info.gift_images" :showCourseFile="false" selType="image" ref="upload">
							<span></span>
						</review-upload>
					</Form-item>
				</TabPane>
			</Tabs>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import moment from 'moment'
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import cUpload from 'c%/cUpload.vue'
	import Ueditor from 'c%/Ueditor'
	import ReviewUpload from 'c%/ReviewUpload.vue'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectMaterial from 'c%/SelectMaterial.vue'
	import SelectGiftCate from 'c%/SelectGiftCate.vue'
	
	const emptyObject = {
		gift_name: '',
		cgc_id: 0,
		mt_id: 0,
		cover_image_url: '',
		pub_int_day: moment().format('YYYY-MM-DD'),
		price: 0,
		credit: 0,
		is_public: 1,
		suit_bids: [],
		qty: 1,
		status: 1,
		gift_detail: '',
		gift_images: []
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			cUpload,
			Ueditor,
			ReviewUpload,
			SelectBranch,
			SelectMaterial,
			SelectGiftCate
		},
		data () {
			return {
				info: util.copy(emptyObject),
				upload_percent: 0,
				current_tab: 'basic'
			}
		},
		watch: {
			'info.is_public': function (val) {
				if(val == 0){
					this.info.suit_bids = [this.bid$]
				}
			}
		},
		methods: {
			ok () {
				if(/$\s*^/.test(this.info.cover_image_url)){
					this.$Message.error('请上传图片')
					return
				}
				if(this.info.cgc_id==0){
					this.$Message.error('请选择礼品分类')
					return
				}
				if(/$\s*^/.test(this.info.gift_name)){
					this.$Message.error('请输入礼品名称')
					return
				}
				if(this.info.credit==0) {
					this.$Message.error('礼品所需积分不能为0')
					return
				}
				if(this.info.is_public == 0 && this.info.suit_bids.length == 0){
					this.$Message.error('请选择适用校区')
					return
				}
				if(this.info.gift_detail=='') {
					this.$Message.error('请填写礼品描述')
					this.current_tab = 'detail'
					return
				}
				if(this.info.gift_images.length==0) {
					this.$Message.error('请上传礼品图片')
					this.current_tab = 'detail'
					return
				}
				if(this.info.is_public == 1){
					this.info.suit_bids = []
				}
				
				let [uri,method] = this.modal$.action=='add'?['credit_gifts','post']:[`credit_gifts/${this.info.cg_id}`,'put']
				
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success('操作成功')
					this.$emit('save')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			}
		},
		computed: {
			ueconfig(){
	            return {
	                toolbars: [
	                    [
	                    'link', 
	                    'inserttable',
	                    'spechars', 
	                    'justifyleft', 
	                    'justifyright', 
	                    'justifycenter', 
	                    'justifyjustify', 
	                    'undo', 
	                    'redo', 
	                    'bold']
	                ],
	                elementPathEnabled: false,
	                wordCount: false,           
	                initialFrameHeight: 200,
	                initialFrameWidth: 536,
	                enableAutoSave: false,
	                autoHeightEnabled: true,
	                zIndex: 2999,
	            }
	        }
		}
	}
	
</script>

<style>
</style>