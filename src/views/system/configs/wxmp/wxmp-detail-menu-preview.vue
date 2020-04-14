<template>
	<div class="custom-modal-mask" v-transfer-dom :data-transfer="true">
		<div class="ivu-modal-mask" style="z-index: 2009;"></div>
		<div class="mobile-preview">
			<div class="mobile-preview-hd">
				<strong class="nickname">{{menu.group_name}}</strong>
			</div>
			<div class="mobile-preview-bd"></div>
			<div class="mobile-preview-ft">
				<ul class="pre-menu-list">
					<li class="pre-menu-item" v-for="(item,index) in menu.buttons" :key="index">
						<a>
							<i class="icon_menu_dot" v-if="item.sub_button.length>0"></i>
							{{item.name}}
						</a>
						<div class="sub-pre-menu-box" v-if="item.sub_button.length>0">
							<ul class="sub-pre-menu-list">
								<li v-for="(sub,subIndex) in item.sub_button">
									<a>{{sub.name}}</a>
								</li>
							</ul>
							<i class="arrow arrow-out"></i>
							<i class="arrow arrow-in"></i>
						</div>
					</li>
				</ul>
			</div>
			<Button class="mobile-preview-closed" @click.native="exitView">退出预览</Button>
		</div>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	
	export default{
		mixins:[common],
		props:{
			menu: {
				type: Object,
				default(){
					return null
				}
			}
		},
		
		data () {
			return {
				tab:'template'		
			}
		},
		mounted () {			
			
		},
		methods:{
			exitView(){
				this.$emit('on-exit-view')
			}
		}
	}
</script>