<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :width="650" :mask-closable="false">
		<Form :label-width="80" v-if="modal$.show" :model="info">
			<Tabs v-model="current_tab">
				<TabPane name="basic" label="基础">		
					<Form-item label="产品类型" class="mb-2 ivu-form-item-required">
						<RadioGroup v-model="info.gtype" type="button">
                            <Radio label="0">
                                <span>课程</span>
                            </Radio>
                            <Radio label="1">
                                <span>班级</span>
                            </Radio>
                            <Radio label="2">
                                <span>物品</span>
                            </Radio>
                            <!-- <Radio label="3">
                                <span>杂费条目</span>
                            </Radio>
							<Radio label="4">
                                <span>储值卡</span>
                            </Radio> -->
						</RadioGroup>
					</Form-item>
					<Form-item label="关联课程" class="mb-2 ivu-form-item-required width-class" v-if="info.gtype == 0">
						<select-lesson v-model="info.lid" clearable placeholder="请选择课程" @selected="set_relate_info"></select-lesson>
					</Form-item>
                    <Form-item label="关联班级" class="mb-2 ivu-form-item-required width-class" v-if="info.gtype == 1">
						<select-class v-model="info.cid" clearable placeholder="请选择班级" @selected="set_relate_info"></select-class>
					</Form-item>
					<Form-item label="关联物品" class="mb-2 ivu-form-item-required width-class" v-if="info.gtype == 2">
						<select-material v-model="info.gid" placeholder="请选择物品" @selected="set_relate_info"></select-material>
					</Form-item>
					<!-- <Form-item label="杂费条目" class="mb-2 ivu-form-item-required width-class" v-if="info.gtype == 3">
						<select-fees v-model="info.pi_id" placeholder="请选择杂费条目" @selected="set_relate_info"></select-fees>
					</Form-item>
					<Form-item label="储值卡" class="mb-2 ivu-form-item-required width-class" v-if="info.gtype == 4">
						<Select v-model="info.dc_id" placeholder="请选择储值卡" @selected="set_relate_info">
							<Option v-for="(item,index) in debit_cards" :value="item.dc_id" :key="index">{{item.card_name}} (+{{item.amount}})</Option>
						</Select> 
					</Form-item> -->
					<Form-item label="产品分类" class="mb-2 ivu-form-item-required width-class">
						<Select v-model="info.pc_id" placeholder="请选择产品分类">
							<Option v-for="(item,index) in product_cates" :value="item.pc_id" :key="index">{{item.cate_name}}</Option>
						</Select> 
					</Form-item>
					<Form-item label="产品封面" class="mb-2 ivu-form-item-required">
						<div class="img-upload">
							<div class="img-thumb">
					            <Icon type="camera" size="30" v-if="info.cover_img_url == ''" style="line-height: inherit;"></Icon>
					            <img class="cursor" :src="info.cover_img_url" @click="picturePreview(info.cover_img_url)" v-else>
					        </div>	
					        
				        </div>
						<c-upload 
						v-model="info.cover_img_url"
						 btn-text="上传">
						 </c-upload>
					</Form-item>	
                    <Form-item label="产品名称" class="mb-2 ivu-form-item-required width-class">
						<Input v-model="info.name" placeholder="请输入产品名称"></Input>
					</Form-item>
					<Form-item label="原价" class="mb-2 ivu-form-item-required">
						<InputNumber v-model="info.origin_price" :step="1" :min="0" style="width:187px;"></InputNumber>
					</Form-item>
					<Form-item label="现价" class="mb-2 ivu-form-item-required">
						<InputNumber v-model="info.price" :step="1" :min="0" style="width:187px;"></InputNumber>
					</Form-item>
					<Form-item label="有效日期" class="mb-2">
						<DatePicker placement="top" :value="info.start_int_day" @on-change="info.start_int_day=$event" placeholder="选择日期"></DatePicker>
						至
						<DatePicker placement="top" :value="info.end_int_day" @on-change="info.end_int_day=$event" placeholder="选择日期"></DatePicker>
						&nbsp;
						<Tooltip content="不选择则永久有效" placement="top">
							<icon type="information-circled" size="16"></icon>
						</Tooltip>
					</Form-item>
				</TabPane>
				<TabPane name="detail" label="高级">
					<Form-item label="描述" class="mb-2">
						<Input class="input-textarea-class" type="textarea" placeholder="请输入描述" v-model="info.desc" :autosize="{minRows:3,maxRows:4}"></Input>
					</Form-item>
					<Form-item label="详情" class="mb-2">
						<ueditor 
			        		class="ueditor" 
			        		ref="ueditor" 
			        		v-model="info.content" 
			        		:ueditor-config="ueconfig"
							style="max-height: 500px;overflow: overlay;">
		        		</ueditor>
					</Form-item>
				</TabPane>
				<TabPane name="share" label="微信分享">
					<Form-item label="分享标题" class="mb-2">
						<Input v-model="info.share_title" placeholder="请输入分享标题"></Input>
					</Form-item>
					<Form-item label="分享图片" class="mb-2">
						<div class="img-upload">
							<div class="img-thumb">
					            <Icon type="camera" size="30" v-if="info.share_img_url == ''" style="line-height: inherit;"></Icon>
					            <img class="cursor" :src="info.share_img_url" @click="picturePreview(info.share_img_url)" v-else>
					        </div>
					    </div>
						<c-upload 
						v-model="info.share_img_url"
						 btn-text="上传">
						 </c-upload>
					</Form-item>
				</TabPane>
			</Tabs>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="closeModal">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import cUpload from 'c%/cUpload'
	import Ueditor from 'c%/Ueditor'

	import SelectMaterial from 'c%/SelectMaterial.vue'
	import SelectFees from 'c%/SelectFees.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectClass from 'c%/SelectClass.vue'
	
	const emptyObject = {
		pid:0,
		name: '',
		desc: '',
		content:'',
		cover_img_url: '',
		gtype: '0',
		lid: 0,
		cid: 0,
		gid: 0,
		pi_id: 0,
		dc_id: 0,
		pc_id:0,
		origin_price:0,
		price: 0,
		start_int_day: '',
		end_int_day: '',
		share_title: '',
		share_img_url: ''
	}
	
	export default{
		mixins: [ common, modal ],
		components: {
			cUpload,
			Ueditor,
			SelectMaterial,
			SelectFees,
			SelectLesson,
			SelectClass
		},
		data () {
			return {
				info: util.copy(emptyObject),
				upload_percent1: 0,
				upload_percent2: 0,
				current_tab: 'basic',
				//debit_cards:[],
				product_cates:[]
			}
		},
		mounted(){
			//this.get_debit_cards()
			this.get_product_cates()
		},
		methods: {
			//设置关联信息
			set_relate_info(row){
				switch(this.info.gtype){
					case '0':
						this.info.name = row.lesson_name
						this.info.cover_img_url = row.lesson_cover_picture
						this.info.desc = row.public_content
						this.info.origin_price = parseFloat(row.unit_price)
						this.info.price = parseFloat(row.sale_price)
						break;
					case '1':
						this.info.name = row.class_name
						this.info.origin_price = parseFloat(row.unit_price)
						this.info.price = parseFloat(row.unit_price)
						break;
					case '2':
						this.info.name = row.name
						this.info.cover_img_url = row.image
						this.info.desc = row.desc
						this.info.origin_price = parseFloat(row.purchase_price)
						this.info.price = parseFloat(row.sale_price)
						break;
					case '3':
						this.info.name = row.name
						this.info.desc = row.desc
						this.info.origin_price = parseFloat(row.unit_price)
						this.info.price = parseFloat(row.unit_price)
						break;
					default:
						break;
				}
			},
			get_debit_cards() {
				this.$rest('debit_cards')
				.get({
					bid: this.bid$,
					pagesize: 1000
				})
				.success(res => {
					this.debit_cards = res.list
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			get_product_cates(){
				this.$rest('product_cates?order_field=sort&order_sort=asc')
				.get({
					bid: this.bid$,
					pagesize: 1000
				})
				.success(res => {
					this.product_cates = res.list
				})
				.error(res => {
					this.error(res.body.message)
				})
			},
			ok () {
				if (this.info.gtype == 0 && this.info.lid == 0) {
					this.$Message.error('请选择相关课程')
					return
				}
				if (this.info.gtype == 1 && this.info.cid == 0) {
					this.$Message.error('请选择相关班级')
					return
				}
				if (this.info.gtype == 2 && this.info.gid == 0) {
					this.$Message.error('请选择相关物品')
					return
				}

				if (this.info.pc_id == 0) {
					this.$Message.error('请选择产品分类')
					return
				}

				if(/$\s*^/.test(this.info.cover_img_url)){
					this.$Message.error('请上传封面图')
					return
				}
				if(/$\s*^/.test(this.info.name)){
					this.$Message.error('请输入产品名称')
					return
				}
				if(/$\s*^/.test(this.info.desc)){
					this.$Message.error('请输入描述')
					return
				}
				if(this.info.origin_price == null){
					this.$Message.error('请输入原价')
					return
				}
				if(this.info.price == null){
					this.$Message.error('请输入现价')
					return
				}

				this.info.tags = []
				let [uri,method] = this.modal$.action=='add'?['products','post']:[`products/${this.info.pid}`,'put']
			
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success('保存成功')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message)
				})
			},
            
			closeModal(){
				this.$emit('on-success')
				this.close()
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
						'simpleupload',
	                    'bold']
	                ],
	                elementPathEnabled: false,
	                wordCount: false,           
	                initialFrameHeight: 200,
	                initialFrameWidth: 536,
	                enableAutoSave: false,
	                autoHeightEnabled: true,
					zIndex: 2999,
					imagePathFormat: '/upload'
	            }
	        }
		}
	}
	
</script>

<style scoped>
	.width-class{
		width:470px;
	}
</style>