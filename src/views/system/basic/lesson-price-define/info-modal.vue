<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="600">
		<Form ref="form" :model="info" :label-width="80" v-if="action == 'add'">
			<Form-item label="定义类型" prop="dtype" class="custom-form-item-required">
				<RadioGroup v-model="info.dtype" type="button" @on-change="changeDtype">
					<Radio :label="item.label" v-for="item in dtype_map" :disabled="lid>0">{{item.text}}</Radio>
				</RadioGroup>
			</Form-item>
			<Form-item label="课程" prop="lid" v-if="info.dtype==0" class="custom-form-item-required">
				<select-lesson v-model="info.lid" clearable :disabled="lid>0" style="width: 250px"></select-lesson>
			</Form-item>
			<Form-item label="科目" prop="sj_id" v-else-if="info.dtype==1" class="custom-form-item-required">
				<select-subject v-model="info.sj_id" clearable style="width: 250px"></select-subject>
			</Form-item>
			<Form-item label="课程等级" prop="product_level_did" v-else class="custom-form-item-required">
				<Select v-model="info.product_level_did" clearable style="width: 250px">
					<Option :value="item.did" v-for="item in product_levels">{{item.title}}</Option>
				</Select>
			</Form-item>
			<Form-item label="适用范围" class="custom-form-item-required">
				<RadioGroup 
					v-model="type_range" 
					type="button" 
					size="small"
					v-if="enable_company">
					<Radio :label="1">按校区</Radio>
					<Radio :label="2">按分公司</Radio>
				</RadioGroup>
				<Select 
					v-model="info.dept_ids" 
					multiple 
					placeholder="请选择分公司" 
					v-if="enable_company && type_range == 2"
					style="display:block;width: 250px"
					>
					<Option 
						v-for="item in companys" 
						:value="Number(item.dpt_id)">{{item.dpt_name}}
					</Option>
				</Select>
				<select-branch 
					v-model="info.bids" 
					clearable 
					placeholder="请选择校区"
					v-if="type_range == 1"
					style="display:block;width: 250px"
					>
				</select-branch>
			</Form-item>
			<Form-item label="价格" prop="sale_price" v-help="price_help" class="custom-form-item-required">
				<InputNumber
					v-model="info.sale_price"
					:min="0"
					>
				</InputNumber>
			</Form-item>
		</Form>
		<div class="tip-wrap" v-if="action == 'success'">
			<Alert type="success" show-icon>
		        提示
		        <span slot="desc">价格定义已保存，如要继续添加请点击按钮继续添加</span>
		    </Alert>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" :loading="saving" @click="ok" v-if="action=='add'">确定</Button>
			<Button type="primary" @click="action='add'" v-else>继续添加</Button>
		</div>
	</Modal>
</template>
<script>
	import util from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import SelectBranch from 'c%/SelectBranch.vue'
	import SelectLesson from 'c%/SelectLesson.vue'
	import SelectSubject from 'c%/SelectSubject.vue'

	const INFO_NAME  = '课程价格定义'
	const INFO_PK_ID = 'lpd_id'
	const INFO_URL   = 'lesson_price_defines'

	const emptyObj = {
		dtype: 0,
		lid: 0,
		sj_id: 0,
		dept_ids:[],
		bids: [],
		product_level_did: 0,
		sale_price: 0
	}

	export default {
		mixins: [modal,common],
		components: {
			SelectBranch,
			SelectLesson,
			SelectSubject
		},
		props: {
			lid: {
				type: Number,
				default: 0
			},
			type: {
				type: Number,
				default: 1
			},
		},
		data() {
			this.price_help = '按科目、按课程等级是单课时价格，按期收费的课程是一期的价格'
			return {
				info: util.copy(emptyObj),
				type_range: 1,
				action: 'add',
				dtype_map: [
					{label:0, text:'按课程定价', value: 'lid'},
					{label:1, text:'按科目定价', value: 'sj_id'},
					{label:2, text:'按课程等级定价', value: 'product_level_did'}
				]
			}
		},
		created() {
			this.type_range = this.type;
		},
		watch: {
			'modal$.show': {
	        	handler: function (val){
	        		this.dept_ids = this.info.dept_ids;
	        	}
	        }
		},
		computed: {
			info_url$(){
            	return INFO_URL
	        },
	        info_name$(){
	            return INFO_NAME
	        },
	        info_pk_id$(){
	            return INFO_PK_ID
	        },
			product_levels(){
				return this.$store.state.gvars.dicts.product_level
			},
			companys() {
	        	return this.$store.state.gvars.departments.filter(d =>d.dpt_type === 2)
	        }
		},
		methods: {
			onModalOpen() {
				if(this.lid) {
					this.info.lid = this.lid
				}
			},
			changeDtype(v) {
				for(let i=0,len=this.dtype_map.length;i<len;i++) {
					let item = this.dtype_map[i]
					if(v !== item.label) {
						this.info[item.value] = 0
					}
				}
			},
			ok() {
				if(this.info.dtype == 0 && this.info.lid == 0) {
					this.$Message.error('请选择要定义的课程')
					return
				}
				if(this.info.dtype == 1 && this.info.sj_id == 0) {
					this.$Message.error('请选择要定义的科目')
					return 
				}
				if(this.info.dtype == 2 && this.info.product_level_did == 0) {
					this.$Message.error('请选择要定义的课程等级')
					return 
				}
				if(this.info.bids.length == 0 && this.info.dept_ids.length == 0) {
					this.$Message.error('请选择适用范围')
					return
				}
				if(this.info.sale_price == 0) {
					this.$Message.error('价格不能为0')
					return
				}

				this.save()
			},
			save() {
				let method = this.modal$.action == 'add'?'post':'put'
                let action = this.modal$.action == 'add'?'添加':'编辑'
                let $rest  = this.$rest(this.info_url$)
                if(this.modal$.action != 'add'){
                    $rest.add_url_param(this.info[this.info_pk_id$])
                }else{
                    if(this.info && this.info_pk_id$ && this.info[this.info_pk_id$]){
                        delete this.info[this.info_pk_id$]
                    }
                }
                $rest[method](this.info)
                .success(response=>{
                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
                    this.$emit('save',{action:this.modal$.action,data:this.info})
                    this.action = 'success'
                })
                .error(response=>{
                    this.error(response.body.message)
                })
			}
		}
	}
</script>