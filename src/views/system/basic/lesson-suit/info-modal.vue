<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="550">
		<template v-if="modal$.show">
			<Form ref="form" :model="info" :label-width="80">
				<Form-item label="套餐名称" prop="name">
					<Input v-model="info.name" clearable placeholder="请输入套餐名称"></Input>
				</Form-item>
				<Form-item label="适用校区">
					<RadioGroup v-model="info.bid" type="button">
						<Radio :label="bid$">当前</Radio>
						<Radio :label="0">所有</Radio>
					</RadioGroup>
				</Form-item>
				<Form-item label="套餐内容" prop="define">
					<table class="modal-table">
						<thead>
							<tr>
								<th><div class="ivu-table-cell">课程等级</div></th>
								<th><div class="ivu-table-cell">必报</div></th>
								<th><div class="ivu-table-cell">课程数</div></th>
								<th><div class="ivu-table-cell">操作</div></th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item,index) in info.define">
								<td>
									<div class="ivu-table-cell">
										<Select v-model="item.product_level_did" size="small">
											<Option 
												:value="level.did" 
												v-for="level in dicts('product_level')">
												{{level.title}}
											</Option>
										</Select>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<Checkbox v-model="item.must"></Checkbox>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<InputNumber size="small" v-model="item.nums" :min="0"></InputNumber>
									</div>
								</td>
								<td>
									<div class="ivu-table-cell">
										<Icon 
											type="minus-circled" 
											color="#ed3f14" 
											@click.native="delDefineItem(index)">
										</Icon>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					<div class="text-center">
						<Button 
							type="text" 
							icon="plus" 
							size="small" 
							@click="addDefineItem">添加
						</Button>
					</div>
				</Form-item>
			</Form> 
		</template>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
</template>
<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin' 
	import common from '@/libs/common.mixin'

	const INFO_NAME  = '学习套餐'
	const INFO_PK_ID = 'lsd_id'
	const INFO_URL   = 'lesson_suit_defines'

	const emptyObject = {
		name: '',
		define: [],
		bid: 0
	}

	export default {
		mixins: [modal,common],
		data() {
			return {
				info: util.copy(emptyObject)
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val&&this.modal$.action == 'add') {
					this.info = util.copy(emptyObject)
					this.info.bid = this.bid$
				}
			}
		},
		methods: {
			ok() {
				if(this.info.name === '') {
					this.$Message.error('套餐名称不能为空')
					return false
				}
				if(this.info.define.length == 0) {
					this.$Message.error('套餐内容不能为空')
					return false
				}
				for(let i=0,len=this.info.define.length;i<len;i++) {
					if(this.info.define[i].product_level_did==0) {
						this.$Message.error('课程等级不能为空')
						return false
					}
				}

				let dids = [],didsSet
				this.info.define.forEach(item => {
					dids.push(item.product_level_did)
				})
				didsSet = new Set(dids)
				if(dids.length > [...didsSet].length) {
					this.$Message.error('课程等级不能相同')
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
			},
			addDefineItem() {
				let obj = {}
				obj.product_level_did = 0
				obj.nums = 1
				obj.must = true
				this.info.define.push(obj)
			},
			delDefineItem(index) {
				this.info.define.splice(index,1)
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
	        }
		}
	}
</script>