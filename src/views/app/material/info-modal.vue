<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form ref="form" :label-width="80" :model="info" :rules="rules" v-if="modal$.show">
			<Form-item class="half" label="物品图片">
				<div class="img-upload">
					<div class="img-thumb">
			            <Icon type="camera" size="30" v-if="info.image == ''" style="line-height: inherit;"></Icon>
			            <img :src="info.image" @click="handleUploadImgView" v-else>
			        </div>	
			        
		        </div>
				<c-upload
				v-model="info.image"
				btn-text="上传"
				>
				</c-upload>
				
			</Form-item>
			<Form-item label="物品名称" prop="name">
				<Input v-model="info.name" placeholder="请输入物品名称"></Input>
			</Form-item>
			<!--level=3时，只能为物品（控制物品只有2级树结构）-->
			<Form-item label="是否分类" prop="is_cate" v-if="level<3" v-help="'没有子级物品时可修改'">
				<!--物品子级数量为0时允许修改is_cate-->
				<i-switch v-model="info.is_cate" :true-value="1" :false-value="0" :disabled="disabledCate">
					<span slot="open">是</span>
					<span slot="close">否</span>
				</i-switch>
			</Form-item>
			<Form-item label="物品单位" prop="unit">
				<Input v-model="info.unit" placeholder="请输入单位，如：个、件、本等"></Input>
			</Form-item>
			<Form-item label="采购单价" prop="purchase_price">
				<InputNumber v-model="info.purchase_price" :step="1" :min="0"></InputNumber>
			</Form-item>
			<Form-item label="销售单价" prop="sale_price">
				<InputNumber v-model="info.sale_price" :step="1" :min="0"></InputNumber>
			</Form-item>
			<Form-item label="描述" prop="desc">
				<Input v-model="info.desc" placeholder="请输入描述"></Input>
			</Form-item>
		</Form>
		
		<div slot="footer">
			<!--添加loading=saving,防止双击重复提交数据-->
			<Button type="ghost" @click="cancel" :loading="saving">取消</Button>
			<Button type="primary" @click="ok"  :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import cUpload from 'c%/cUpload.vue'
	
	const emptyObject = {
		name: '',				//物品名称
		unit: '',				//计量单位
		desc: '',				//描述
		image: '',				//物品图片
		num: 0,					//物品数量(不可编辑)
		is_cate: 0,				//是否分类
		purchase_price: 0,		//进货价
		sale_price: 0,			//销售价
		parent_id: 0,			//父级物品Id
	}
	
	export default{
		mixins: [modal,common],
		components: {
			cUpload
		},
		data () {
			return {
				info: util.copy(emptyObject),
				rules: {
					name: [
						{ required: true, message: '请输入物品名称', trigger: 'blur' }
					],
					unit: [
						{ required: true, message: '请输入物品单位', trigger: 'blur' }
					],
				},
				upload_process: false,
				upload_percent: 0,
				imgview: false,
				parent_id: 0,
				level: 1
			}
		},
		watch: {
			parent_id: function (val) {
				this.info.parent_id = val
			},
			'modal$.show': function (val) {
				if(!val){
					this.parent_id = 0			
				}
			},
//			level: function (val) {
//				if(val==2&&this.modal$.action=='add'){
//					this.info.is_cate = 0
//				}
//			}
		},
		methods: {
			cancel () {
				this.info = util.copy(emptyObject)
//				this.$form('form').reset()
				this.close()
			},
			ok () {
				this.$form('form').check().then(()=>{
					let action = this.modal$.action,
						[method,uri,msg] = action=='add'?['post','materials','添加成功']:['put','materials/'+this.info.mt_id,'修改成功']
					
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.cancel()
					}).error(body=>{
						this.$Notice.error({
							title: '失败',
							desc: body.message||'添加失败'
						})
					})
					
				})				
				
			},
			handleUploadImgView () {
                this.imgview = true;
            }
		},
		computed: {
			disabledCate () {
				return this.info.children_num>0||(this.modal$.action=='add'&&this.level==2)
			}
		}
	}
</script>
