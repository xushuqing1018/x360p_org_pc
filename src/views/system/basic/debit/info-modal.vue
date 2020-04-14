<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="700">
		<template v-if="modal$.show">
			<Form ref="form" :model="info" :label-width="100">
				<Form-item label="储值卡名称" prop="card_name" class="custom-form-item-required">
					<Input v-model="info.card_name" clearable placeholder="请输入卡名称"></Input>
				</Form-item>
				<Form-item label="面额" prop="amount" class="custom-form-item-required">
					<InputNumber v-model="info.amount" :min="0"></InputNumber> 元
				</Form-item>
				<Form-item label="有效期" prop="expire_day">
					<InputNumber v-model="info.expire_days" :min="0"></InputNumber> 天( 0表示无限制 )
					<RadioGroup 
						v-model="expire_days_type" 
						size="small" 
						type="button" 
						class="pull-right"
						@on-change="expireDaysChange">
						<Radio :label="1">一年</Radio>
						<Radio :label="2">半年</Radio>
					</RadioGroup>
				</Form-item>
				<Form-item label="会员等级" prop="upgrade_vip_level" v-help="'学员购买储值卡会自动升级会员，需在系统设置开启会员体系'">
					<Select v-model="info.upgrade_vip_level">
						<Option
							v-if="index > 0" 
							v-for="(item,index) in vip_level_config" 
							:value="index">{{item.name}}
						</Option>
					</Select>
				</Form-item>
				<Form-item label="适用范围">
					<RadioGroup 
						v-model="type_range" 
						type="button" 
						size="small" 
						v-if="enable_company">
						<Radio :label="1">按校区</Radio>
						<Radio :label="2">按分公司</Radio>
					</RadioGroup>
					<Select 
						v-model="info.dpt_ids" 
						multiple 
						placeholder="请选择分公司" 
						v-if="enable_company && type_range == 2">
						<Option 
							v-for="item in companys" 
							:value="String(item.dpt_id)">{{item.dpt_name}}
						</Option>
					</Select>
					<select-branch 
						v-model="info.bids" 
						clearable 
						placeholder="请选择校区"
						v-if="type_range == 1">
					</select-branch>
				</Form-item>
				<Form-item label="折扣定义" prop="discount_define">
					<table width="100%">
						<thead>
							<tr>
								<th><div class="ivu-table-cell">课程等级</div></th>
								<th><div class="ivu-table-cell">方案</div></th>
								<th><div class="ivu-table-cell">优惠</div></th>
								<th><div class="ivu-table-cell">操作</div></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item,index) in info.discount_define">
								<td><div class="ivu-table-cell">{{item.name}}</div></td>
								<td>
									<div class="ivu-table-cell">
										<Select 
											v-model="item.discount_type" 
											size="small"
											style="width: 90px;">
											<Option :value="1">折扣</Option>
											<Option :value="2">直减</Option>
											<Option :value="3">直接定价</Option>
										</Select>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<template v-if="item.discount_type===1">
											<Input
												v-keeptwo
												v-model="item.discount_rate" 
												size="small"
												style="width: 100px;">
												<span slot="append">%</span>
											</Input>
										</template>
										<template v-else-if="item.discount_type===2">
											<Input 
												v-model="item.reduced_amount" 
												size="small"
												style="width: 100px;">
												<span slot="append">元</span>
											</Input>
										</template>
										<template v-else>
											<p>
												<Input 
													v-keeptwo
													v-model="item.origin" 
													size="small"
													style="width: 150px;">
													<span slot="prepend">原价</span>
													<span slot="append">元</span>
												</Input>
											</p>
											<p>
												<Input 
													v-keeptwo
													v-model="item.current" 
													size="small"
													style="width: 150px;">
													<span slot="prepend">现价</span>
													<span slot="append">元</span>
												</Input>
											</p>
										</template>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<Button 
											type="ghost" 
											size="small" 
											icon="ios-trash" 
											shape="circle" 
											@click="delItem(index)">
										</Button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</Form-item>
			</Form> 
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'
	import SelectBranch from 'c%/SelectBranch.vue'

	const INFO_NAME  = '储值卡'
	const INFO_PK_ID = 'dc_id'
	const INFO_URL   = 'debit_cards'

	const emptyObject = {
		card_name: '',
		discount_define: [],
		dpt_ids: [],
		amount: 100,
		bids: [],
		expire_days: 365
	}

	export default {
		mixins: [modal,common],
		components: {
			SelectBranch
		},
		data() {
			return {
				expire_days_type: 0,
				type_range: 1,
				info: util.copy(emptyObject)
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val&&this.modal$.action == 'add') {
					this.expire_days_type = 0
					this.info = util.copy(emptyObject)
					this.formatDefine()
				}
			}
		},
		methods: {
			ok() {
				if(this.info.card_name === '') {
					this.$Message.error('储值卡名称不能为空')
					return false
				}
				if(this.info.amount === 0) {
					this.$Message.error('储值卡面额不能为0')
					return false
				}
				let defines = this.info.discount_define
				let check_amount = true
				for(let i=0,len=defines.length;i<len;i++) {
					if(defines[i].discount_type === 3) {
						if(defines[i].origin == 0 || defines[i].current == 0) {
							check_amount = false
							break;
						}
					}
				}
				if(!check_amount) {
					this.$Message.error('直接定价的金额不能为0')
					return false
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
                    let data = response.data
                    
                    if(this.modal$.action == 'add' && _.isString(data) && /^\d+$/.test(data)){
                        this.info[this.info_pk_id$] = util.int(data)
                    }
                    this.$Message.success(util.sprintf('%s%s成功!',this.info_name$,action))
                    this.$emit('save',{action:this.modal$.action,data:this.info})
                    this.close()
                })
                .error(res => {
                	this.error(res.body.message)
                })
			},
			formatDefine() {
				let product_levels = this.$store.state.gvars.dicts.product_level
				product_levels.forEach(l => {
					this.info.discount_define.push({
						name: l.title,
						did: l.did,
						discount_type: 1,
						reduced_amount: 0,
						discount_rate: 100,
						origin: 0,
						current: 0
					})
				})
			},
			delItem(index) {
				this.info.discount_define.splice(index,1)
			},
			expireDaysChange(v) {
				if(v === 1) {
					this.info.expire_days = 365
				}else if( v === 2){
					this.info.expire_days = 183
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
	        companys() {
	        	return this.$store.state.gvars.departments.filter(d =>d.dpt_type === 2)
	        }
		}
	}
</script>