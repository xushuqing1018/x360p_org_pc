<style lang="less">
.x-select-suit{
	position:relative;
	> .select-addon{
		display:none;
	}
	&-addon{
		padding-right:50px;		
		> .select-addon{
			display:block;
			position:absolute;
			right:0;
			top:0;
			width:40px;
		}
	}
}
</style>
<template>
	<div :class="classes">
		<div class="select-main">
			<Select 
				v-model="lbs_id" 
				:disabled="disabled"
				placeholder="请选择学习方案"
				@on-change="changeSuit" 
				@on-clear="clearSuit">
	            <Option 
	            	v-for="(item,index) in lbsListByService" 
	            	:value="item.lbs_id" 
	            	:key="index">{{item.title}}
	            </Option>
	        </Select>
        </div>
        <div class="select-addon" v-per="perAdd" v-if="!disabled">
        	<Button type="ghost" @click="addSuit" style="padding: 6px 15px;"><Icon type="plus"></Icon></Button>
        </div>
		<buy-suit-info-modal 
			ref="info"
			:sid="sid" 
			:cu-id="cuId" 
			:name="name"
			@save="setLbsId">
		</buy-suit-info-modal>
	</div>
</template>
<script>

	import common from '@/libs/common.mixin'
	import util from '@/libs/util'
	import BuySuitInfoModal from './lesson-buy-suit-modal.vue'

	const prefixCls = 'x-select-suit'
	const perAdd    = 'lesson_buy_suit.add'

	export default {
		name:'SelectLessonBuySuit',
		mixins:[common],
		components:{
			BuySuitInfoModal
		},
		props:{
			value: {
				type:[Number,String],
				default:0
			},
			name: {
				type: String,
				default: ''
			},
			sid: {
				type:Number,
				default:0
			},
			cuId: {
				type:Number,
				default:0
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		data(){
			return {
				lbs_id:0,
				perAdd,
				lbsListByService: []		// 服务对象的学习方案
			}
		},
		created(){
			this.lbs_id = this.value
		},
		mounted() {
			this.getLbsByService()
		},
		watch:{
			value(v){
				this.lbs_id = v
			},
			sid(id) {
				if(id>0) {
					this.getLbsByService()
				}
			},
			cuId(id) {
				if(id>0) {
					this.getLbsByService()
				}
			}
		},
		methods:{
			addSuit(){
				this.$r('info').show('添加学习方案','add')
			},
			changeSuit(lbs_id){
				if(lbs_id) {
					this.$emit('input',lbs_id)
					this.$emit('select',this.lbsListByService.find(item =>item.lbs_id == lbs_id))
				}
			},
			clearSuit() {
				this.$emit('clear')
			},
			setLbsId({action,data}){
				setTimeout(()=>{
					this.lbs_id = data.lbs_id
				},500)
				console.log(data)
				this.$emit('select',data)
				this.getLbsByService()
			},
			getLbsByService() {
				let param = {}
				if(this.sid > 0) {
					param.sid = this.sid
				}else if(this.cuId){
					param.cu_id = this.cuId
				}
				this.$rest('lesson_buy_suits')
				.get(param)
				.success(res => {
					this.lbsListByService = res.list
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
		},
		computed:{
			 classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-addon`]: this.hasPer(perAdd)
                    }
                ];
            }
		}
	}
</script>