<template>
	<Modal v-model="modal$.show" v-drag-modal :title="modal$.title" :width="800" :mask-closable="false">
		<Form :label-width="80" class="row" v-if="modal$.show">			
			<Form-item label="封面图"  class="col-md-6">
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
			<Form-item label="存放位置" prop="place_no" class="col-md-6 ivu-form-item-required">
				<Input v-model="info.place_no" placeholder="存放位置"></Input>
			</Form-item>
			<Form-item label="ISBN" prop="isbn" class="col-md-6 ivu-form-item-required">
				<Input 
					ref="inputISBN" 
					v-model="info.isbn" 
					placeholder="isbn"
					
					@keyup.enter.native="getBookInfoByISBN()" 
					@on-blur="getBookInfoByISBN()">
				</Input>
			</Form-item>
			<Form-item label="条形码" prop="barcode" class="col-md-6">
				<Input v-model="info.barcode" placeholder="请输入条形码"></Input>
			</Form-item>
			<Form-item label="书名" prop="name" class="col-md-6 ivu-form-item-required">
				<Input v-model="info.name" placeholder="请输入书名"></Input>
			</Form-item>
			<Form-item label="作者" prop="author" class="col-md-6">
				<Input v-model="info.author" placeholder="请输入作者"></Input>
			</Form-item>
			<Form-item label="发布日期" class="col-md-6" prop="pub_int_day">
				<DatePicker :value="info.pub_int_day" @on-change="info.pub_int_day = $event" type="month" placeholder="选择日期"></DatePicker>
			</Form-item>
			<Form-item label="页数" class="col-md-3" prop="pages">
				<InputNumber v-model="info.pages" :step="1" :min="0"></InputNumber>
			</Form-item>
			<Form-item label="定价" class="col-md-3" prop="price">
				<InputNumber v-model="info.price" :step="1" :min="0"></InputNumber>
			</Form-item>
			<Form-item label="书本分类" prop="book_cate_did" class="col-md-6">
				<Select v-model="info.book_cate_did" filterable>
					<Option :value="item.did" v-for="item in dicts('book_cate')">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="出品方" prop="book_brand_did" class="col-md-6">
				<Select v-model="info.book_brand_did" filterable>
					<Option :value="item.did" v-for="item in dicts('book_brand')">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="出版社" prop="book_pub_did" class="col-md-6">				
				<Select v-model="info.book_pub_did" filterable>
					<Option :value="item.did" v-for="item in dicts('book_pub')">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="采购网址" prop="purchase_url" class="col-md-6">
				<Input v-model="info.purchase_url" placeholder="请输入采购网址"></Input>
			</Form-item>
			<Form-item label="适用校区" class="col-md-6 ivu-form-item-required" prop="suit_bids">
				<select-branch :disabled="info.is_public==1" v-model="info.suit_bids" clearable style="width:180px"></select-branch>
				<Checkbox class="ml-2" v-model="info.is_public" :true-value="1" :false-value="0">适用所有校区</Checkbox>
			</Form-item>
			<Form-item label="装帧" class="col-md-6" prop="book_package_did">
				<Select v-model="info.book_package_did">
					<Option :value="item.did" v-for="item in dicts('book_package')">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="描述" prop="remark" class="col-md-12">
				<Input placeholder="请输入描述" v-model="info.remark"></Input>
			</Form-item>
			<Form-item :label="info.bk_id==0?'期初数量':'入库数量'" prop="qty" class="col-md-6">
				<InputNumber v-model="info.qty" :step="1" :min="1" :disabled="modal$.action=='edit'"></InputNumber>				
			</Form-item>
		</Form>
		
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import book from './book.mixin'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectBranch from 'c%/SelectBranch.vue'
	import cUpload from 'c%/cUpload.vue'
	
	const emptyObject = {
		bk_id: 0,
		name: '',
		author: '',
		place_no: '',
		book_cate_did: 0,
		book_pub_did: 0,
		book_brand_did: 0,
		pages: 0,
		cover_image_url: '',
		purchase_url: '',
		pub_int_day: '',
		book_package_did: 0,
		qty: 1,
		remark: '',		
		isbn: '',
		barcode: '',
		is_public: 1,
		suit_bids: []
	}
	
	export default{
		mixins: [ common, modal, book ],
		components: {
			cUpload,
			SelectBranch
		},
		data () {
			return {
				info: util.copy(emptyObject),
				upload_percent: 0,
				temp_isbn: ''
			}
		},
		watch: {
			'modal$.show': function (val) {
				if(val && this.modal$.action == 'add') {
					this.$nextTick(()=>{
						this.$refs.inputISBN.focus()
					})
				}
			},
			temp_isbn: function (val) {
				if(this.modal$.action == 'add' && val.length > 0){					
					this.$Message.loading('正在获取图书信息')
					this.getBookInfo()
				}
			},
			'info.is_public': function (val) {
				if(val == 0){
					this.info.suit_bids = [this.bid$]
				}
			}
		},
		methods: {
			ok () {
				if(/$\s*^/.test(this.info.isbn)){
					this.$Message.error('请输入ISBN号！')
					return
				}
				if(/$\s*^/.test(this.info.isbn)){
					this.$Message.error('请输入书名！')
					return
				}
				
				if(this.info.is_public == 0 && this.info.suit_bids.length == 0){
					this.$Message.error('请选择适用校区')
					return
				}
				
				if(this.info.is_public == 1){
					this.info.suit_bids = []
				}
				
				let [uri,method] = this.modal$.action=='add'?['books','post']:[`books/${this.info.bk_id}`,'put']
				
				
				this.$rest(uri)[method](this.info)
				.success(data=>{
					this.$Message.success('操作成功~')
					this.$emit('on-success')
					this.close()
				}).error(response=>{
					this.error(response.body.message||'操作失败~')
				})
			},
			getBookInfoByISBN () {
				if(/$\s*^/.test(this.info.isbn)){
					return 
				}
				
				if(this.info.isbn != this.temp_isbn){
					this.temp_isbn = this.info.isbn
					this.$http.get(`books/getBookForDb?isbn=${this.info.isbn}`,true)		
					.then(response=>{					
						this.$Message.destroy()
						this.setBookInfo(response.body.data)
//						console.log('------data')
//						console.log(JSON.parse(response.body))
					})
				}				
			},
			getBookInfo () {
				this.$rest(`books/get_list?isbn=${this.info.isbn}`)
				.get()
				.success(data=>{
					if(data.list && data.list.length > 0){
						let obj = util.copy(data.list[0])
						obj.pub_int_day = this.$filter('pub_int_date')(obj.pub_int_day)
						obj.price = Number(obj.price)
												
						this.confirm(`【${obj.name}】已存在,是否要进行入库操作?`)
						.then(()=>{
							this.close()
							this.$Modal.open('app/books/qty-modal.vue',{
								props: {
									type: 1,
									bkId: obj.bk_id
								},
								on: {
									'on-success': () => {
										this.init_data()
									}
								}
							}).then(modal=>{
								modal.show(`【${obj.name}】入库`)
							})
						},()=>{
							this.info = util.copy(emptyObject)
							this.temp_isbn = ''
							this.$refs.inputISBN.focus()
						})
					}
				}).error(response=>{
				
					this.$Message.info(response.body.message||'没有找到对应书籍信息~')
				})
			},
			setBookInfo (data) {
//				data = JSON.parse(data)
				if(data.code == '6000'){
					this.$Message.error('没有查询ISBN号到对应的图书信息，请您手动填写！')
					return
				}else{
					let reg = /$\D|.^/
					this.info.name = data.title + data.subtitle
					this.info.author = data.author.join(',')
					this.info.cover_image_url = data.image
					this.info.price = Number(data.price.replace(/[^0-9|^.]/g,''))
					this.info.pages = Number(data.pages) 
					this.info.pub_int_day = data.pubdate
					this.info.remark = data.summary
					
					if(data.did_change == 1){
						this.$store.dispatch('updateGlobalVar','dicts')
						.then(()=>{
							this.info.book_pub_did = data.book_pub_did
							this.info.book_package_did = data.book_package_did
						})
					}else{
						this.info.book_pub_did = data.book_pub_did
						this.info.book_package_did = data.book_package_did
					}
				}
				
			}
		}
	}
	
</script>

<style>
</style>