<style lang="less">
.x-select{
	position:relative;
	> .select-addon{
		display:none;
	}
	&-addon{
		padding-right:60px;		
		> .select-addon{
			display:block;
			position:absolute;
			right:5px;
			top:0;
			width:50px;
		}
	}
}
</style>
<template>
	<div :class="classes">
		<div class="select-main">
			<Select v-model="cr_id" filterable @on-change="changeRoom" :disabled="disabled">
	            <Option v-for="(item,index) in rooms" :value="item.cr_id" :key="index">{{item.room_name}}</Option>
	        </Select>
        </div>
        <div class="select-addon" v-per="perAdd" v-if="!disabled">
        	<Button type="ghost" @click="addRoom"><Icon type="plus"></Icon></Button>
        </div>
		<class-room-info-modal ref="info" @save="setCrid"></class-room-info-modal>
	</div>
</template>
<script>

	import common from '@/libs/common.mixin'
	import util from '@/libs/util'
	import ClassRoomInfoModal from 'c%/ClassRoomInfoModal.vue'

	const prefixCls = 'x-select'
	const perAdd    = 'classrooms.add'

	export default {
		name:'SelectClassRoom',
		mixins:[common],
		components:{
			ClassRoomInfoModal
		},
		props:{
			value:{
				type:[Number,String],
				default:0
			},
			bid:{
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
				cr_id:0,
				perAdd
			}
		},
		created(){
			this.cr_id = this.value
		},
		watch:{
			value(v){
				this.cr_id = v
			}
		},
		methods:{
			addRoom(){
				this.$r('info').show('添加教室')
			},
			changeRoom(cr_id){
				this.$emit('input',cr_id)
			},
			setCrid({action,data}){
				setTimeout(()=>{
					this.cr_id = data.cr_id
					this.$emit('input',this.cr_id)
				},600)
			}
		},
		computed:{
			 classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-addon`]: this.hasPer(perAdd)
                    }
                ];
            },
            rooms(){
            	return this.$store.state.gvars.classrooms.filter(c=>c.bid==this.bid$)
            }
		}
	}
</script>