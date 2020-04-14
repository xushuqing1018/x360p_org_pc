<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :width="750" :mask-closable="false">
		<Form ref="form" :model="info" :label-width="100" :rules="rules" class="sqb-form">
			<Tabs>
				<TabPane label="商户基本信息">
					<div class="row">
						<Form-item label="商户名" prop="name" class="col-sm-6">
			    			<Input v-model="info.name" placeholder="至少有一个汉字" @on-blur="info.business_name=info.name"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="商户经营名称" prop="business_name" class="col-sm-6">
			    			<Input v-model="info.business_name" placeholder="商家实际在经营场所使用的名称，默认和商户名一样"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="联系人" prop="contact_name" class="col-sm-6">
			    			<Input v-model="info.contact_name" placeholder="联系人"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="联系电话" prop="contact_cellphone" class="col-sm-6">
			    			<Input v-model="info.contact_cellphone" placeholder="联系电话"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="地区" prop="area_arr" class="col-sm-6">
			    			<Cascader trigger="hover" :data="sqb_areas" v-model="area"></Cascader>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="详细地址" prop="street_address" class="col-sm-6">
			    			<Input v-model="info.street_address" placeholder="详细地址"></Input>
			    		</Form-item>
					</div>
				</TabPane>
				<TabPane label="结算账户信息">
					<div class="row">
						<Form-item label="账户类型" prop="account_type" class="col-sm-6">
			    			<RadioGroup v-model="info.account_type">
			    				<Radio :label="1">个人</Radio>
			    				<Radio :label="2">企业</Radio>
			    			</RadioGroup>
			    		</Form-item>
			    		<Form-item label="银行卡号" prop="bank_card" class="col-sm-6">
			    			<Input v-model="info.bank_card" @on-blur="get_bank_name" placeholder="失去焦点后获取开户银行"></Input>
			    		</Form-item>
			    		<Form-item label="银行卡照片" prop="bank_card_image" class="col-sm-6 ivu-form-item-required">
			    			<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.bank_card_image == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.bank_card_image" @click="picturePreview(info.bank_card_image)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess1"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
			    		<Form-item label="开户银行" prop="bank_name" class="col-sm-6">
			    			<Input v-model="info.bank_name" placeholder="开户银行"></Input>
			    		</Form-item>
			    		<Form-item label="开户地区" prop="bank_area_arr" class="col-sm-6">
			    			<Cascader trigger="hover" :data="sqb_areas" v-model="bank_area" @on-change="get_branch_list"></Cascader>
			    		</Form-item>
			    		<Form-item label="开户支行" prop="branch_name" class="col-sm-6">
			    			<Select v-model="info.branch_name" filterable>
			    				<Option v-for="item in branch_list" :value="item">{{item}}</Option>
			    			</Select>
			    		</Form-item>
			    		<Form-item label="开户姓名" prop="holder" class="col-sm-6">
			    			<Input v-model="info.holder" placeholder="个人账户为开户人，企业账户为开户公司名"></Input>
			    		</Form-item>
			    		<Form-item label="预留手机号" prop="bank_cellphone" class="col-sm-6">
			    			<Input v-model="info.bank_cellphone" placeholder="预留手机号"></Input>
			    		</Form-item>
			    		<Form-item label="法人姓名" prop="legal_person_name" class="col-sm-6">
			    			<Input v-model="info.legal_person_name" placeholder="法人姓名"></Input>
			    		</Form-item>
			    		<Form-item label="营业执照" prop="business_license_photo" class="col-sm-6 ivu-form-item-required">
			    			<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.business_license_photo == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.business_license_photo" @click="picturePreview(info.business_license_photo)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess8"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
			    		<Form-item label="工商注册号" prop="tax_payer_id" class="col-sm-6">
			    			<Input v-model="info.tax_payer_id" placeholder="企业账户需要传"></Input>
			    		</Form-item>
			    		<Form-item label="证件类型" prop="id_type" class="col-sm-6">
			    			<Select v-model="info.id_type">
			    				<Option :value="1">身份证</Option>
			    				<Option :value="2">护照</Option>
			    				<Option :value="3">台胞证</Option>
			    				<Option :value="4">港澳通行证</Option>
			    			</Select>
			    		</Form-item>
			    		<Form-item label="身份证号" prop="identity" class="col-sm-6">
			    			<Input v-model="info.identity" placeholder="身份证号"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="身份证正面照" prop="holder_id_front_photo" class="col-sm-6 ivu-form-item-required">
			    			<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.holder_id_front_photo == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.holder_id_front_photo" @click="picturePreview(info.holder_id_front_photo)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess2"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
			    		<Form-item label="身份证反面照" prop="holder_id_back_photo" class="col-sm-6 ivu-form-item-required">
			    			<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.holder_id_back_photo == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.holder_id_back_photo" @click="picturePreview(info.holder_id_back_photo)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess3"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
					</div>
				</TabPane>
				<TabPane label="真实性照片">
					<div class="row">
						<Form-item label="门头照片" prop="brand_photo" class="col-sm-6 ivu-form-item-required">
    						<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.brand_photo == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.brand_photo" @click="picturePreview(info.brand_photo)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess4"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="室内照片" prop="indoor_photo" class="col-sm-6 ivu-form-item-required">
			    			<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.indoor_photo == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.indoor_photo" @click="picturePreview(info.indoor_photo)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess5"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="室外照片" prop="outdoor_photo" class="col-sm-6 ivu-form-item-required">
			    			<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.outdoor_photo == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.outdoor_photo" @click="picturePreview(info.outdoor_photo)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess6"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="其他照片" prop="other_photos" class="col-sm-6">
			    			<div class="img-upload">
								<div class="img-thumb">
						            <Icon type="camera" size="30" v-if="info.other_photos == ''" style="line-height: inherit;"></Icon>
						            <img class="cursor" :src="info.other_photos" @click="picturePreview(info.other_photos)" v-else>
						        </div>	
					        </div>
			    			<Upload
			    				ref="upload"
			    				action="/api/shou_qian_bas/upload"
			    				:headers="upload_header"
						        :show-upload-list="false"
						        :on-success="handleUploadSuccess7"
						        :on-error="handleUploadError"
						        :on-progress="handleUploadProgress"
						        :before-upload="handleUploadBefore"
						        :format="['jpg','jpeg','png']"
						        :max-size="2048"
						        type="select"
						        style="display: inline-block;"
			    				>
			    				<Button type="ghost" icon="ios-cloud-upload-outline" size="small">上传</Button>
			    			</Upload>
			    		</Form-item>
					</div>
				</TabPane>
				<TabPane label="其他">
					<div class="row">
						<Form-item label="备注" prop="remark" class="col-sm-6">
			    			<Input v-model="info.remark" placeholder="请输入备注"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="经度" prop="longitude" class="col-sm-6">
			    			<Input v-model="info.longitude" placeholder="请输入经度"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="纬度" prop="latitude" class="col-sm-6">
			    			<Input v-model="info.latitude" placeholder="请输入纬度"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="推广者" prop="user_id" class="col-sm-6">
			    			<Input v-model="info.user_id" placeholder="收钱吧提供的商户推广人id"></Input>
			    		</Form-item>
			    		<div class="col-sm-6"></div>
			    		<Form-item label="外部商户号" prop="client_sn" class="col-sm-6">
			    			<Input v-model="info.client_sn" placeholder="外部商户号，可以根据此商户号查询商户信息"></Input>
			    		</Form-item>
					</div>
				</TabPane>
			</Tabs>
        </Form>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	
	const INFO_NAME = '收钱吧申请'
	const INFO_PK_ID = 'cas_id'
	const INFO_URL   = 'shou_qian_bas'

	const emptyObject = {
		name: '',
		business_name: '',
		contact_name: '',
		contact_cellphone: '',
		area: 0,
		area_arr: [],
		street_address: '',
		account_type: 1,
		bank_card: '',
		bank_card_image: '',
		bank_name: '',
		bank_area: 0,
		bank_area_arr: [],
		branch_name: '',
		holder: '',
		bank_cellphone: '',
		legal_person_name: '',
		business_license_photo: '',
		tax_payer_id: '',
		id_type: 1,
		identity: '',
		holder_id_front_photo: '',
		holder_id_back_photo: '',
		brand_photo: '',
		indoor_photo: '',
		outdoor_photo: '',
		other_photos: '',
		remark: '',
		longitude: '',
		latitude: '',
		extra: '',
		vendor_app_id: '',
		vendor_sn: '',
		organization_id: '',
		user_id: '',
		client_sn: '',
		create_account: true
	}
	
	export default{
		mixins: [modal,common,globals],
		data () {
			return {
				sqb_areas: [],
				branch_list: [],
				upload_percent: 0,
				info: util.copy(emptyObject),
				rules: {
					name: [
						{ required: true, message: '', trigger: 'blur' }
					],
					contact_name: [
						{ required: true, message: '', trigger: 'blur' }
					],
					contact_cellphone: [
						{ required: true, message: '', trigger: 'blur' }
					],
					contact_name: [
						{ required: true, message: '', trigger: 'blur' }
					],
					area_arr: [
                        { required: true, type:'array', message: '', trigger: 'change' }
                    ],
                    street_address: [
						{ required: true, message: '', trigger: 'blur' }
					],
					account_type: [
                        { required: true, type:'number', message: '', trigger: 'change' }
                    ],
                    bank_card: [
						{ required: true, message: '', trigger: 'blur' }
					],
					bank_name: [
						{ required: true, message: '', trigger: 'blur' }
					],
					bank_area_arr: [
						{ required: true, type:'array', message: '', trigger: 'change' }
					],
					branch_name: [
						{ required: true, message: '', trigger: 'blur' }
					],
					holder: [
						{ required: true, message: '', trigger: 'blur' }
					],
					id_type: [
						{ required: true, type:'number', message: '', trigger: 'change' }
					],
					identity: [
						{ required: true, message: '', trigger: 'blur' }
					]
				}
			}
		},
		mounted() {
			this.init_all_provinces()
		},
		watch: {
			'modal$.show':function(val) {
				if(val && this.modal$.action=='edit') {
					this.get_branch_list()
				} 
			}
		},
		methods: {
			init_all_provinces() {
				this.$rest('shou_qian_bas/get_area')
				.get()
				.success(res => {
					this.sqb_areas = this.loop_replace_keys(res)
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			loop_replace_keys(data) {
				data.forEach(item => {
					item.value = item.code
					item.label = item.name
					delete item['code']
					delete item['name']
					if(item.children&&item.children.length>0) {
						this.loop_replace_keys(item.children)
					}
				})
				return data
			},
			get_branch_list(value) {
				let bank_area = ''
				if(value && value.length==3) {
					bank_area = value[2]
				}else{
					if(this.info.bank_area) {
						bank_area = this.info.bank_area
					}
				}
				if(this.info.bank_name&&bank_area) {
					this.$rest('shou_qian_bas/get_branchs')
					.get({
						bank_name: this.info.bank_name,
						bank_area: bank_area
					})
					.success(res => {
						this.branch_list = res.biz_response.data
					})
					.error(res => {
						this.$Message.error(res.body.message)
					})
				}
			},
			get_bank_name() {
				if(this.info.bank_card) {
					this.$rest('shou_qian_bas/get_bank')
					.get({
						bank_card: this.info.bank_card
					})
					.success(res => {
						this.info.bank_name = res.biz_response.data
						this.get_branch_list()
					})
					.error(res => {
						this.$Message.error(res.body.message)
					})
				}else{
					this.$Message.error('请输入银行卡号')
				}
			},
			handleUploadSuccess1 (res, file) {
            	this.info.bank_card_image = res.data.biz_response.data
            },
            handleUploadSuccess2 (res, file) {
            	this.info.holder_id_front_photo = res.data.biz_response.data
            },
            handleUploadSuccess3 (res, file) {
            	this.info.holder_id_back_photo = res.data.biz_response.data
            },
            handleUploadSuccess4 (res, file) {
            	this.info.brand_photo = res.data.biz_response.data
            },
            handleUploadSuccess5 (res, file) {
            	this.info.indoor_photo = res.data.biz_response.data
            },
            handleUploadSuccess6 (res, file) {
            	this.info.outdoor_photo = res.data.biz_response.data
            },
            handleUploadSuccess7 (res, file) {
            	this.info.other_photos = res.data.biz_response.data
            },
            handleUploadSuccess8 (res, file) {
            	this.info.business_license_photo = res.data.biz_response.data
            },
            handleUploadBefore(file){
            	this.upload_percent = 0
            },
            handleUploadError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });
            },
            handleUploadProgress(event,file,filelist){
            	this.upload_percent = event.percent
            },
			ok () {
				let images = [
					['bank_card_image','银行卡照片'],
					['business_license_photo','营业执照'],
					['holder_id_front_photo','身份证正面照'],
					['holder_id_back_photo','身份证反面照'],
					['brand_photo','门头照片'],
					['indoor_photo','室内照片'],
					['outdoor_photo','室外照片'],
					]
				for(let i in images){
					if(this.info[images[i][0]]==='') {
						this.$Message.error('请上传'+images[i][1])
						return;
					}
				}
				this.save()
			}
		},
		computed: {
            bank_area:{
                get:function(){
                    return this.info.bank_area_arr
                },
                set:function(value){
                    this.info.bank_area = value[2]
                    this.info.bank_area_arr = value
                }
            },
            area:{
                get:function(){
                    return this.info.area_arr
                },
                set:function(value){
                    this.info.area = value[2]
                    this.info.area_arr = value
                }
            },
            upload_header(){
                return {
                    'x-token':this.$store.state.user.token,
                    'x-file-key':'file'
                }
            },
            info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        }
		}
	}
</script>

<style lang="less">
	.sqb-form {
		.ivu-form-item-error-tip {
			display: none;
		}
	}
</style>