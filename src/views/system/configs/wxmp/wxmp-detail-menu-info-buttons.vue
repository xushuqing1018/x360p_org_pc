<template>
	<div class="menu-content-left">
		<div class="mobile-content-left-body">
			<div class="mobile-hd">{{groupName}}</div>
			<ul class="menu-list">
				<li class="menu-item" v-for="(item,index) in buttons" :key="index" @click="editMenuButton(index,-1)">
					<a class="menu-link" :class="index == buttonIndex ?'active':''">									
						<span>
							<i class="icon_menu_dot" v-if="item.sub_button.length>0"></i>
							{{item.name}}
						</span>
					</a>
					<div class="sub-menu-box">
						<ul class="sub-menu-list">
							<li class="sub-menu-item" 
								:class="childIndex == subButtonIndex && index == buttonIndex?'active':''" 
								v-for="(childItem,childIndex) in item.sub_button" :key="childIndex" 
								@click.stop="editChildMenuButton(index,childIndex)">
								<span class="sub-menu-item-inner">{{childItem.name}}</span>
							</li>
							<li class="sub-menu-item" v-if="item.sub_button.length<5" @click.stop="addSubMenuButton(index)">
								<span class="sub-menu-item-inner">
									<Icon type="plus"></Icon>
								</span>
							</li>
						</ul>
						<i class="arrow arrow-out"></i>
						<i class="arrow arrow-in"></i>
					</div>
				</li>
				<li class="menu-item" @click="addMenu" v-if="buttons.length<3">
					<a class="menu-link">
						<Icon type="plus"></Icon>
						<span>添加菜单</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
		
	export default{
		mixins: [common],
		props: {
			buttons:{
				type: Array,
				default:()=>{
					return []
				}
			},
			buttonIndex:{
				type:Number,
				default:0
			},
			subButtonIndex:{
				type:Number,
				default:-1
			},
			groupName:{
				type: String,
				default :''
			}
		},
		data () {
			return {
				
			}
		},
		methods: {
			editMenuButton (index) {
				this.$emit('on-menu-button-edit',{buttonIndex:index,subButtonIndex:-1})
			},
			editChildMenuButton(index,childindex){
				this.$emit('on-menu-button-edit',{buttonIndex:index,subButtonIndex:childindex})
			},
			addSubMenuButton(index){
				this.$emit('on-menu-subbutton-add',index)
			},
			addMenu(){
				this.$emit('on-menu-button-add')
			}
		}
	}
</script>
</script>